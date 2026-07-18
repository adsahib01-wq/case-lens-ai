import { NextResponse } from "next/server";
import { analyzePerformance } from "@/lib/ai";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { attemptsData } = body;
    
    if (!attemptsData) {
      return NextResponse.json({ error: "Missing attempts data" }, { status: 400 });
    }
    
    const analysis = await analyzePerformance(JSON.stringify(attemptsData));

    return NextResponse.json(analysis);
  } catch (error) {
    console.error("API error analyzing performance:", error);
    return NextResponse.json({ error: "Failed to analyze performance" }, { status: 500 });
  }
}
