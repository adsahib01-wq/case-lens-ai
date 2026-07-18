import { NextResponse } from "next/server";
import { analyzeCaseStudy } from "@/lib/ai";

export async function POST(req: Request) {
  try {
    const { text } = await req.json();
    if (!text) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 });
    }
    const result = await analyzeCaseStudy(text);
    return NextResponse.json(result);
  } catch (error) {
    console.error("API error analyzing case:", error);
    return NextResponse.json({ error: "Failed to analyze case" }, { status: 500 });
  }
}
