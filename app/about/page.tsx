"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AboutSafety() {
  const router = useRouter();

  return (
    <div className="max-w-3xl mx-auto glass-card">
      <div className="flex justify-between items-center mb-6">
        <button onClick={() => router.back()} className="btn btn-secondary text-sm">&larr; Back</button>
        <Link href="/" className="btn btn-secondary text-sm">Home</Link>
      </div>

      <h1 className="mb-6">About & Safety</h1>
      
      <div className="space-y-6 opacity-90 leading-relaxed">
        <section>
          <h2 className="text-xl mb-2 text-accent-color">What is CaseLens AI?</h2>
          <p>
            CaseLens AI is an educational tool designed for medical students and professionals to analyze clinical case studies and test their knowledge. It uses advanced AI to break down complex cases and generate multiple-choice questions.
          </p>
        </section>

        <section>
          <h2 className="text-xl mb-2 text-accent-color">Safety First</h2>
          <p className="mb-2">
            <strong>Not for Diagnostic Use:</strong> CaseLens AI is strictly an educational tool. It is <strong>NOT</strong> intended for diagnosing or treating real patients. Never upload actual patient data or use the AI's analysis to make medical decisions.
          </p>
          <p>
            <strong>Data Privacy:</strong> Please ensure that all case studies you input are fully anonymized. Do not include names, exact dates, specific locations, or any other Personally Identifiable Information (PII).
          </p>
        </section>

        <section>
          <h2 className="text-xl mb-2 text-accent-color">How it Works</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Local Storage:</strong> All your cases, analysis, and scores are stored locally in your browser. Nothing is saved to a central database.</li>
            <li><strong>AI Analysis:</strong> When you analyze a case, the text is sent securely to the AI model, processed, and the result is returned directly to you.</li>
            <li><strong>Offline Mode:</strong> You can view your saved history offline, but new AI requests require an internet connection.</li>
          </ul>
        </section>
      </div>

      <div className="flex justify-between items-center mt-12 pt-6 border-t border-white/10">
        <Link href="/privacy" className="btn btn-secondary">Read Privacy Policy</Link>
        <Link href="/new-case" className="btn btn-primary px-8">Start New Case</Link>
      </div>
    </div>
  );
}
