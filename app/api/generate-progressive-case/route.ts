export const maxDuration = 60;
import { NextResponse } from "next/server";
import { generateProgressiveCase } from "@/lib/ai";

export async function POST(req: Request) {
  try {
    const { text } = await req.json();
    if (!text) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 });
    }
    
    try {
      const progressiveCase = await generateProgressiveCase(text);
      return NextResponse.json({ progressiveCase, progressiveGenerationStatus: "ready" });
    } catch (err) {
      console.error("Progressive stage generation failed, falling back:", err);
      return NextResponse.json({ progressiveGenerationStatus: "failed" });
    }
  } catch (error) {
    console.error("API error generating progressive case:", error);
    return NextResponse.json({ error: "Failed to generate progressive case" }, { status: 500 });
  }
}
