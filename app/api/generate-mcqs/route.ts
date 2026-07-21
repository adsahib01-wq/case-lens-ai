export const maxDuration = 60;
import { NextResponse } from "next/server";
import { generateMCQs } from "@/lib/ai";
import { z } from "zod";

const adaptiveContextSchema = z.object({
  conceptId: z.string(),
  targetDifficulty: z.string(),
  questionPurpose: z.string(),
  sourceDecisionId: z.string().optional()
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { text, analysis, difficulty, examStyle, questionCount, adaptiveContext, avoidQuestionIds, recentQuestions } = body;
    
    if (!text || !analysis) {
      return NextResponse.json({ error: "Missing text or analysis" }, { status: 400 });
    }

    if (adaptiveContext) {
      const result = adaptiveContextSchema.safeParse(adaptiveContext);
      if (!result.success) {
        return NextResponse.json({ error: "Invalid adaptive context", details: result.error }, { status: 400 });
      }
    }

    let retryCount = 0;
    const MAX_RETRIES = 1;
    let finalMcqs = null;

    while (retryCount <= MAX_RETRIES) {
      const rawMcqs = await generateMCQs(text, analysis, difficulty, examStyle, questionCount, adaptiveContext, avoidQuestionIds);
      
      // Validation rules
      if (!Array.isArray(rawMcqs) || rawMcqs.length !== questionCount) {
         retryCount++; continue;
      }
      
      let isValid = true;
      const normalizedStems = new Set<string>();

      for (const q of rawMcqs) {
        // Concept validation
        if (adaptiveContext && q.primaryConceptId !== adaptiveContext.conceptId) isValid = false;
        if (adaptiveContext && q.difficulty !== adaptiveContext.targetDifficulty) isValid = false;
        
        // Structure validation
        if (!q.options || q.options.length < 4 || q.options.length > 5) isValid = false;
        if (q.options && q.options.filter((o: any) => o.isCorrect).length !== 1) isValid = false;
        
        // Deep duplicate validation within batch
        const normStem = q.stem ? q.stem.trim().toLowerCase() : "";
        if (normalizedStems.has(normStem)) isValid = false;
        normalizedStems.add(normStem);

        // Deep duplicate validation against recent
        if (recentQuestions && Array.isArray(recentQuestions)) {
          for (const recent of recentQuestions) {
            if (recent.stem && recent.stem.trim().toLowerCase() === normStem) {
              isValid = false;
            }
          }
        }
      }

      if (isValid) {
        finalMcqs = rawMcqs;
        break;
      }
      
      retryCount++;
    }

    if (!finalMcqs) {
      return NextResponse.json({ error: "Failed to generate a valid, non-duplicate adaptive batch." }, { status: 500 });
    }

    // Add unique IDs to questions and options
    const mcqs = finalMcqs.map((q: any) => {
      const questionId = crypto.randomUUID();
      
      const shuffledRawOptions = [...q.options].sort(() => Math.random() - 0.5);
      const optionsWithIds = shuffledRawOptions.map((opt: any, idx: number) => ({
        ...opt,
        id: crypto.randomUUID(),
        label: String.fromCharCode(65 + idx)
      }));
      
      const correctOption = optionsWithIds.find((o: any) => o.isCorrect);

      return {
        ...q,
        id: questionId,
        options: optionsWithIds,
        correctOptionId: correctOption ? correctOption.id : null,
      };
    });

    return NextResponse.json({ mcqs });
  } catch (error) {
    console.error("API error generating MCQs:", error);
    return NextResponse.json({ error: "Failed to generate MCQs" }, { status: 500 });
  }
}
