"use client";

import { useCaseStore } from "@/lib/store";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, use } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useConfirm } from "@/components/ConfirmProvider";

export default function CaseAnalysis({ params }: { params: Promise<{ caseId: string }> }) {
  const { caseId } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const stateParam = searchParams.get("state"); // "more-info"
  
  const cases = useCaseStore((state) => state.cases);
  const [mounted, setMounted] = useState(false);
  const [isGeneratingMCQs, setIsGeneratingMCQs] = useState(false);
  const [error, setError] = useState("");
  const { confirm } = useConfirm();

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const currentCase = cases.find((c) => c.id === caseId);

  // PG-15 Case Unavailable
  if (!currentCase) {
    return (
      <div className="max-w-xl mx-auto glass-card text-center mt-12">
        <h2 className="text-red-400 mb-4">Case Unavailable</h2>
        <p className="mb-8">This case study could not be found. It may have been deleted.</p>
        <div className="flex gap-4 justify-center">
          <button onClick={() => router.push("/history")} className="btn btn-secondary">Back to History</button>
          <button onClick={() => router.push("/new-case")} className="btn btn-primary">Start New Case</button>
        </div>
      </div>
    );
  }

  const handleEditCase = () => {
    // The exact implementation details: 
    // Usually, you might pass the case ID back to new-case, or copy it over.
    // For simplicity, we can route to new-case?id=xxx and handle hydration there, 
    // but the spec says "Edit -> PG-02 with submitted case restored". 
    // Since we don't have an edit route, we'll just push to new-case?edit=caseId
    router.push(`/new-case?edit=${currentCase.id}`);
  };

  const handleCopyAnalysis = () => {
    if (currentCase.analysis) {
      navigator.clipboard.writeText(currentCase.analysis);
      alert("Analysis copied to clipboard!"); // SM-10
    }
  };

  const handleGenerateMCQs = async () => {
    if (!navigator.onLine) {
      alert("Cannot generate MCQs while offline.");
      return;
    }
    
    // If we already have questions, just go there
    if (currentCase.questions && currentCase.questions.length > 0) {
      router.push(`/cases/${currentCase.id}/practice`);
      return;
    }

    setIsGeneratingMCQs(true);
    setError("");

    try {
      const res = await fetch("/api/generate-mcqs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: currentCase.content, analysis: currentCase.analysis }),
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error);

      // Save questions to store
      useCaseStore.getState().updateCase(currentCase.id, { questions: data.mcqs });
      
      router.push(`/cases/${currentCase.id}/practice`);
    } catch (err: any) {
      setError(err.message || "Failed to generate MCQs.");
      alert("AI Service temporarily unavailable. Please try again later."); // SM-16
    } finally {
      setIsGeneratingMCQs(false);
    }
  };

  // PG-04 More Information Needed
  if (stateParam === "more-info") {
    return (
      <div className="max-w-2xl mx-auto glass-card relative">
        <h2 className="text-orange-400 mb-4">More Information Needed</h2>
        <p className="mb-6 opacity-80">
          The AI determined that the provided text does not contain sufficient clinical information for a complete analysis or reliable MCQ generation.
        </p>
        <div className="bg-slate-900 p-4 rounded mb-6 text-sm opacity-80">
          {currentCase.analysis}
        </div>
        <div className="flex gap-4">
          <button onClick={handleEditCase} className="btn btn-primary">Edit Case</button>
          <button onClick={async () => {
            if(await confirm({ title: "Start New Case", message: "Are you sure you want to start a new case?", confirmText: "Start" })) router.push("/new-case");
          }} className="btn btn-secondary">Start New Case</button>
          <button onClick={() => router.back()} className="btn btn-secondary ml-auto">Back</button>
        </div>
      </div>
    );
  }

  // PG-03 Case Analysis Results
  return (
    <div className="max-w-4xl mx-auto glass-card relative">
      {isGeneratingMCQs && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center" style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(4px)' }}>
          <div className="flex gap-2 mb-4" style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'var(--accent-color)', animation: 'bounce 1.4s infinite ease-in-out both', animationDelay: '-0.32s' }}></div>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'var(--accent-color)', animation: 'bounce 1.4s infinite ease-in-out both', animationDelay: '-0.16s' }}></div>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'var(--accent-color)', animation: 'bounce 1.4s infinite ease-in-out both' }}></div>
          </div>
          <p style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--accent-color)' }}>Generating Practice Questions...</p>
          <style>{`
            @keyframes bounce {
              0%, 80%, 100% { transform: scale(0); }
              40% { transform: scale(1); }
            }
          `}</style>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <button onClick={() => router.back()} className="btn btn-secondary text-sm">&larr; Back</button>
        <div className="flex gap-2">
          <button onClick={handleEditCase} className="btn btn-secondary text-sm">Edit</button>
          <button onClick={() => router.push(`/reports/analysis/${currentCase.id}`)} className="btn btn-secondary text-sm">Print / PDF</button>
        </div>
      </div>

      <h1 className="mb-4">{currentCase.title}</h1>
      <div className="mb-8 opacity-80 text-sm whitespace-pre-wrap border-l-2 border-slate-600 pl-4 py-1">
        {currentCase.content}
      </div>

      <div className="bg-white rounded-xl p-6 mb-8 border border-[var(--card-border)] shadow-sm">
        <div className="markdown-content">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {currentCase.analysis}
          </ReactMarkdown>
        </div>
      </div>

      {error && <div className="text-red-400 mb-4">{error}</div>}

      <div className="flex justify-between items-center mt-8 pt-6 border-t border-white/10">
        <button onClick={handleCopyAnalysis} className="btn btn-secondary">
          Copy Analysis
        </button>
        
        <div className="flex gap-4">
          <button onClick={async () => {
            if(await confirm({ title: "Start New Case", message: "Are you sure you want to start a new case?", confirmText: "Start" })) router.push("/new-case");
          }} className="btn btn-secondary">
            New Case
          </button>
          <button onClick={handleGenerateMCQs} className="btn btn-primary px-8" disabled={isGeneratingMCQs}>
            Generate MCQs
          </button>
        </div>
      </div>
    </div>
  );
}
