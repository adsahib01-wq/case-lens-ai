export const maxDuration = 60;

import { NextResponse } from "next/server";
import { generateStudyMaterial } from "@/lib/ai";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { weakConceptData, depth } = body;
    
    if (!weakConceptData || !depth) {
      return NextResponse.json({ error: "Missing required data or depth" }, { status: 400 });
    }
    
    const material = await generateStudyMaterial(JSON.stringify(weakConceptData), depth);

    // Add unique IDs to questions and options
    if (material.focusedMcqs && Array.isArray(material.focusedMcqs)) {
      material.focusedMcqs = material.focusedMcqs.map((q: any) => {
        const questionId = crypto.randomUUID();
        const optionsWithIds = q.options.map((opt: any) => ({
          ...opt,
          id: crypto.randomUUID(),
        }));
        const correctOption = optionsWithIds.find((o: any) => o.isCorrect);

        return {
          ...q,
          id: questionId,
          options: optionsWithIds,
          correctOptionId: correctOption ? correctOption.id : null,
        };
      });
    }

    return NextResponse.json(material);
  } catch (error) {
    console.error("API error generating study material:", error);
    return NextResponse.json({ error: "Failed to generate study material" }, { status: 500 });
  }
}
