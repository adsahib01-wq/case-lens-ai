import { NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req: Request) {
  try {
    const ai = new OpenAI({ 
      apiKey: process.env.GROQ_API_KEY || "",
      baseURL: "https://api.groq.com/openai/v1"
    });

    const { summary, weakConcepts } = await req.json();

    const prompt = `You are an expert medical tutor. The student has requested an overall analysis of their performance across multiple medical case studies.

Here is a deterministic summary of their overall aggregate performance:
${JSON.stringify(summary, null, 2)}

Here are their weakest concepts, classified by severity and aggregated chronologically:
${JSON.stringify(weakConcepts, null, 2)}

Please provide a highly detailed, comprehensive markdown report (~1000-1500 words) that:
1. Synthesizes their overall performance and confidence calibration based on the aggregated data.
2. Discusses their weakest concepts and explains *why* they might be struggling based on the classification (e.g. consistent weakness vs emerging weakness) and error rates.
3. Suggests what they should focus on next for their adaptive reviews.
4. Provides extremely clear, easy-to-understand study material for these weak concepts. Break down the medical concepts into intuitive, fundamental principles.

IMPORTANT: Do NOT attempt to recalculate any scores, accuracies, or classifications. Simply explain the meaning behind the provided deterministic numbers.
Use markdown formatting including H1-H3 headings, bullet points, and tables where appropriate to make the report easy to read.
Do not use placeholders, and do not reference the JSON data format directly in your response. Speak directly to the student.`;

    const response = await ai.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    const report = response.choices[0].message.content;
    if (!report) {
      throw new Error("No report generated from AI.");
    }

    return NextResponse.json({ report });
  } catch (error: any) {
    console.error("API error generating overall analysis:", error);
    return NextResponse.json(
      { error: "Failed to generate overall analysis.", details: error.message },
      { status: 500 }
    );
  }
}
