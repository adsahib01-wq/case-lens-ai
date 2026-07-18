"use client";

import { useCaseStore } from "@/lib/store";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Home() {
  const cases = useCaseStore((state) => state.cases);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const lastCase = cases.length > 0 ? cases[0] : null;

  if (cases.length === 0) {
    return (
      <div className="max-w-3xl mx-auto mt-12 text-center">
        <h1 className="mb-6">Welcome to CaseLens AI</h1>
        <p className="text-xl mb-12">
          Securely analyze medical case studies entirely in your browser. No accounts, no cloud history.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/new-case" className="btn btn-primary text-lg px-8 py-4">
            Start New Case
          </Link>
          <Link href="/about" className="btn btn-secondary text-lg px-8 py-4">
            About & Safety
          </Link>
          <Link href="/privacy" className="btn btn-secondary text-lg px-8 py-4">
            Privacy Policy
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="mb-8">Welcome Back</h1>
      
      <div className="grid md:grid-cols-2 gap-6 mb-12">
        <div className="glass-card flex flex-col justify-center items-center text-center">
          <h2 className="mb-4">Analyze a New Case</h2>
          <p className="mb-6">Start a fresh AI analysis securely.</p>
          <Link href="/new-case" className="btn btn-primary w-full max-w-xs">
            Start New Case
          </Link>
        </div>

        {lastCase && (
          <div className="glass-card flex flex-col justify-between">
            <div>
              <h2 className="mb-2">Continue Last Case</h2>
              <p className="mb-4 font-medium truncate text-accent-color">
                {lastCase.title || "Untitled Case"}
              </p>
              <p className="text-sm opacity-80 mb-4 line-clamp-2">
                {lastCase.content}
              </p>
            </div>
            <Link href={`/cases/${lastCase.id}`} className="btn btn-secondary w-full">
              Continue
            </Link>
          </div>
        )}
      </div>

      <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Link href="/history" className="glass-card text-center hover:border-blue-500 transition-colors">
          <h3>Case History</h3>
          <p className="text-sm">View all {cases.length} saved cases</p>
        </Link>
        <Link href="/results" className="glass-card text-center hover:border-blue-500 transition-colors">
          <h3>Overall Results</h3>
          <p className="text-sm">Track your learning progress</p>
        </Link>
        <Link href="/about" className="glass-card text-center hover:border-blue-500 transition-colors">
          <h3>About & Safety</h3>
        </Link>
        <Link href="/privacy" className="glass-card text-center hover:border-blue-500 transition-colors">
          <h3>Privacy</h3>
        </Link>
      </div>
    </div>
  );
}
