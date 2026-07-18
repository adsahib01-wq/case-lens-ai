import { GoogleGenAI, Type, Schema } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn("WARNING: GEMINI_API_KEY is not set in the environment variables.");
}
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    isValid: {
      type: Type.BOOLEAN,
      description: "True if the text is a valid medical case study with enough information. False if it is not a case study, too short, or lacks sufficient details.",
    },
    analysis: {
      type: Type.STRING,
      description: "An extremely detailed, comprehensive educational analysis of the case study (aiming for ~2000 words). MUST be formatted in rich Markdown using headings (H1-H6), bullet points, tables, and bold text. Break down pathophysiology, differential diagnoses, management, and learning points.",
    },
    generatedTitle: {
      type: Type.STRING,
      description: "A concise, professional medical title for this case (e.g. '35yo F - Progressive Weakness and Diplopia'). Must be 3-7 words.",
    }
  },
  required: ["isValid", "analysis", "generatedTitle"],
};

const mcqSchema: Schema = {
  type: Type.ARRAY,
  description: "A list of multiple choice questions based on the case study.",
  items: {
    type: Type.OBJECT,
    properties: {
      stem: { type: Type.STRING, description: "The question text." },
      options: {
        type: Type.ARRAY,
        description: "Exactly 4 or 5 options.",
        items: {
          type: Type.OBJECT,
          properties: {
            label: { type: Type.STRING, description: "A, B, C, D, or E" },
            text: { type: Type.STRING, description: "The text of the option." },
            isCorrect: { type: Type.BOOLEAN, description: "True if correct, false otherwise." },
            explanation: { type: Type.STRING, description: "Detailed case-specific explanation. Required for all options." },
            misconception: { type: Type.STRING, description: "Likely misconception (for incorrect options)." },
            evidenceAgainst: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Case findings that argue against this option." },
            whenItCouldBeCorrect: { type: Type.STRING, description: "Situation in which this option would fit." }
          },
          required: ["label", "text", "isCorrect", "explanation"]
        }
      },
      correctAnswerExplanation: { type: Type.STRING, description: "Detailed explanation of why the correct answer is correct." },
      caseEvidence: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Supporting clues from the case." },
      reasoningSteps: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Step-by-step educational reasoning path." },
      highYieldTakeaway: { type: Type.STRING, description: "One concise exam-focused learning point." },
      commonTrap: { type: Type.STRING, description: "Explanation of the most likely distractor." },
      memoryAid: { type: Type.STRING, description: "Short mnemonic or recall rule (if appropriate)." },
      conceptTags: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            subject: { type: Type.STRING },
            topic: { type: Type.STRING },
            subtopic: { type: Type.STRING },
            conceptName: { type: Type.STRING },
            reasoningSkill: { type: Type.STRING },
            cognitiveLevel: { type: Type.STRING, description: "Recall | Understanding | Application | Analysis" }
          },
          required: ["subject", "topic", "conceptName"]
        }
      },
      difficulty: { type: Type.STRING, description: "Basic | Intermediate | Advanced" },
      examStyle: { type: Type.STRING, description: "General | NRE | USMLE | PLAB | MRCP" }
    },
    required: ["stem", "options", "correctAnswerExplanation", "caseEvidence", "reasoningSteps", "highYieldTakeaway", "conceptTags", "difficulty", "examStyle"]
  }
};

const performanceSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    summary: { type: Type.STRING, description: "Overall summary of performance" },
    strongConcepts: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          conceptName: { type: Type.STRING },
          evidence: { type: Type.ARRAY, items: { type: Type.STRING } },
          confidence: { type: Type.STRING, description: "Low | Moderate | High" }
        },
        required: ["conceptName", "evidence", "confidence"]
      }
    },
    weakConcepts: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          conceptName: { type: Type.STRING },
          classification: { type: Type.STRING, description: "Possible weakness | Emerging weakness | Consistent weakness" },
          priority: { type: Type.STRING, description: "Low | Medium | High" },
          evidence: { type: Type.ARRAY, items: { type: Type.STRING } },
          likelyIssue: { type: Type.STRING },
          recommendedStudyFocus: { type: Type.ARRAY, items: { type: Type.STRING } },
          confidence: { type: Type.STRING, description: "Low | Moderate | High" }
        },
        required: ["conceptName", "classification", "priority", "evidence", "likelyIssue", "recommendedStudyFocus", "confidence"]
      }
    },
    errorPatterns: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          type: { type: Type.STRING },
          explanation: { type: Type.STRING }
        },
        required: ["type", "explanation"]
      }
    },
    recommendedNextSteps: { type: Type.ARRAY, items: { type: Type.STRING } }
  },
  required: ["summary", "strongConcepts", "weakConcepts", "errorPatterns", "recommendedNextSteps"]
};

const studyMaterialSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    objectives: { type: Type.ARRAY, items: { type: Type.STRING } },
    coreExplanation: { type: Type.STRING },
    clinicalRelevance: { type: Type.STRING },
    keyFacts: { type: Type.ARRAY, items: { type: Type.STRING } },
    comparisonTable: {
      type: Type.OBJECT,
      properties: {
        headers: { type: Type.ARRAY, items: { type: Type.STRING } },
        rows: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.STRING } } }
      },
      required: ["headers", "rows"]
    },
    reasoningApproach: { type: Type.ARRAY, items: { type: Type.STRING } },
    commonMistakes: { type: Type.ARRAY, items: { type: Type.STRING } },
    examTraps: { type: Type.ARRAY, items: { type: Type.STRING } },
    memoryAid: { type: Type.STRING },
    workedExample: {
      type: Type.OBJECT,
      properties: {
        case: { type: Type.STRING },
        reasoning: { type: Type.ARRAY, items: { type: Type.STRING } },
        answer: { type: Type.STRING }
      },
      required: ["case", "reasoning", "answer"]
    },
    rapidReview: { type: Type.ARRAY, items: { type: Type.STRING } },
    selfCheckQuestions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING },
          answer: { type: Type.STRING }
        },
        required: ["question", "answer"]
      }
    },
    focusedMcqs: mcqSchema
  },
  required: ["objectives", "coreExplanation", "clinicalRelevance", "keyFacts", "reasoningApproach", "commonMistakes", "examTraps", "rapidReview", "selfCheckQuestions", "focusedMcqs"]
};

export async function analyzeCaseStudy(caseStudyText: string) {
  try {
    const prompt = `Analyze the following case study. Determine if it is a valid medical/educational case study with sufficient information.
If valid, provide a highly detailed, comprehensive clinical analysis (aim for approximately 2000 words).
You MUST format your response using rich Markdown syntax:
- Use Headings (H1 to H6) to structure the document (e.g., # Pathophysiology, ## Differential Diagnosis).
- Use bullet points and numbered lists for readability.
- Use Markdown tables for comparing differentials, lab values, or treatment options.
- Bold key terms and medications.
- If relevant, include descriptive image placeholders like ![Diagram of X] if it helps explain a concept.

Case Study:
${caseStudyText}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        temperature: 0.2,
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response text from AI.");
    return JSON.parse(text) as { isValid: boolean; analysis: string };
  } catch (error) {
    console.error("Error analyzing case study:", error);
    return {
      isValid: true,
      analysis: "AI service unavailable. This case presents educational points but requires AI integration to fully evaluate.",
    };
  }
}

export async function generateMCQs(caseStudyText: string, analysis: string) {
  try {
    const prompt = `You are an educational medical reasoning assistant. Your task is to explain medical multiple-choice questions for students.
Generate 3 to 5 high-quality multiple choice questions based on the following case study and its analysis.

For each question:
- Identify exactly one correct answer
- Explain why the correct answer is correct
- Explain why every incorrect option is wrong in this specific case
- Identify the decisive clinical clues
- Explain the reasoning process step by step
- Identify likely misconceptions represented by distractors
- State when an incorrect option might become correct
- Provide a high-yield takeaway
- Return valid JSON matching the required schema.

Case Study:
${caseStudyText}

Analysis:
${analysis}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: mcqSchema,
        temperature: 0.2,
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response text from AI.");
    return JSON.parse(text);
  } catch (error) {
    console.error("Error generating MCQs:", error);
    throw error;
  }
}

export async function analyzePerformance(attemptsData: string) {
  try {
    const prompt = `Analyse the learner’s MCQ attempts as educational performance data.
Identify strong concepts, possible weak concepts, repeated weaknesses, improving concepts, common error patterns, likely misconceptions, and recommended study priorities.
Base every conclusion on supplied question attempts and concept tags. Do not classify a learner as weak based on one isolated error without marking low confidence.
Return structured JSON.

Data:
${attemptsData}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: performanceSchema,
        temperature: 0.2,
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response text from AI.");
    return JSON.parse(text);
  } catch (error) {
    console.error("Error analyzing performance:", error);
    throw error;
  }
}

export async function generateStudyMaterial(weakConceptData: string, depth: string) {
  try {
    const prompt = `Generate focused educational study material for a medical student based on the supplied weak concept, question errors, misconceptions, exam style, difficulty, and selected study depth: ${depth}.
The material must address the learner’s demonstrated errors, explain the concept clearly, build from fundamentals, compare commonly confused alternatives, include a short worked example, self-check questions, and new focused MCQs.
Return structured JSON.

Data:
${weakConceptData}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: studyMaterialSchema,
        temperature: 0.3,
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response text from AI.");
    return JSON.parse(text);
  } catch (error) {
    console.error("Error generating study material:", error);
    throw error;
  }
}

export async function generateRandomCase(): Promise<{title: string; content: string}> {
  try {
    const prompt = `Generate a realistic, short (3-5 sentences) medical case study. It should be suitable for a medical student to analyze. 
Make it varied—do not always do cardiology. Include patient age, presentation, key vitals or lab findings, and relevant history. 
Do not include the diagnosis. Just the presentation.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        temperature: 0.9, // Higher temperature for more randomness
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "A concise, descriptive title for the case (e.g. '35yo Female with Progressive Double Vision')" },
            content: { type: Type.STRING, description: "The raw text of the clinical scenario." }
          },
          required: ["title", "content"]
        }
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response");
    return JSON.parse(text);
  } catch (error) {
    console.error("Error generating random case:", error);
    throw error;
  }
}
