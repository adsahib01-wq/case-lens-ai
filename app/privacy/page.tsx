"use client";

import { useCaseStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function PrivacyPolicy() {
  const router = useRouter();
  const { clearAllCases } = useCaseStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const handleClearAll = () => {
    if (confirm("Are you sure you want to clear ALL cases? This will permanently delete all your data.")) { // SM-03
      clearAllCases();
      alert("All local data has been cleared."); // SM-13
      router.push("/history");
    }
  };

  return (
    <div className="max-w-3xl mx-auto glass-card">
      <div className="flex justify-between items-center mb-6">
        <button onClick={() => router.back()} className="btn btn-secondary text-sm">&larr; Back</button>
        <Link href="/" className="btn btn-secondary text-sm">Home</Link>
      </div>

      <h1 className="mb-6">Privacy Policy</h1>
      
      <div className="space-y-6 opacity-90 leading-relaxed">
        <section>
          <h2 className="text-xl mb-2 text-accent-color">No User Accounts or Cloud History</h2>
          <p>
            CaseLens AI does not require you to sign up, log in, or create a profile. We do not store your case history, analysis, or quiz scores on any cloud servers or databases. 
          </p>
        </section>

        <section>
          <h2 className="text-xl mb-2 text-accent-color">Local Storage Architecture</h2>
          <p>
            All data you generate within the application is stored <strong>locally on your device</strong> using your browser's local storage mechanism. This means you have full control over your data. If you clear your browser data or use a different browser, your history will not be available.
          </p>
        </section>

        <section>
          <h2 className="text-xl mb-2 text-accent-color">AI Processing</h2>
          <p>
            To generate the analysis and multiple-choice questions, the text you submit is sent securely via an API to the AI service (Google Gemini). The text is processed solely for the purpose of generating the requested educational content and is not retained by CaseLens AI.
          </p>
          <p className="mt-2 text-orange-400 font-medium">
            Reminder: Do not submit Personally Identifiable Information (PII) or real patient data.
          </p>
        </section>

        <section>
          <h2 className="text-xl mb-2 text-accent-color">Data Management</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Individual Deletion:</strong> You can delete any case individually from the Case History page.</li>
            <li><strong>Clear All:</strong> You can wipe all your data at once using the button below or on the History page.</li>
            <li><strong>Printed/PDF Reports:</strong> Any reports you print or save as PDF are generated locally on your machine.</li>
          </ul>
        </section>
      </div>

      <div className="flex justify-between items-center mt-12 pt-6 border-t border-white/10">
        <div className="flex gap-4">
          <Link href="/history" className="btn btn-secondary">Open Case History</Link>
          <button onClick={handleClearAll} className="btn btn-secondary text-red-400 border-red-500/30 hover:bg-red-500/10">Clear All Data</button>
        </div>
        <Link href="/new-case" className="btn btn-primary px-8">New Case</Link>
      </div>
    </div>
  );
}
