export const maxDuration = 60;

import { NextResponse } from "next/server";
import { analyzeCaseStudy, generateProgressiveCase } from "@/lib/ai";

export async function POST(req: Request) {
  try {
    const { text, caseFormat } = await req.json();
    if (!text) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 });
    }
    
    // Operation 1: Generate analysis
    const result: any = await analyzeCaseStudy(text);
    
    return NextResponse.json({ ...result, progressiveGenerationStatus: "not-requested", progressiveCase: null });
  } catch (error) {
    console.error("API error analyzing case:", error);
    return NextResponse.json({ error: "Failed to analyze case" }, { status: 500 });
  }
}
