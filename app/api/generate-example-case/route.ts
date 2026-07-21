export const maxDuration = 60;

import { NextResponse } from "next/server";
import { generateRandomCase } from "@/lib/ai";

export async function POST(req: Request) {
  try {
    const caseData = await generateRandomCase();
    return NextResponse.json(caseData);
  } catch (error: any) {
    console.error("API error generating random case:", error);
    return NextResponse.json(
      { error: "Failed to generate random case.", details: error.message },
      { status: 500 }
    );
  }
}
