"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCaseStore } from "@/lib/store";
import { v4 as uuidv4 } from "uuid";
import { useConfirm } from "@/components/ConfirmProvider";

export default function NewCase() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingExample, setIsGeneratingExample] = useState(false);
  const router = useRouter();
  const { confirm } = useConfirm();
  const addCase = useCaseStore((state) => state.addCase);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (title || content) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [title, content]);

  const handleReset = async () => {
    if (await confirm({ title: "Reset Form", message: "Are you sure you want to reset the form? All unsaved text will be lost.", danger: true, confirmText: "Reset" })) {
      setTitle("");
      setContent("");
      setError("");
    }
  };

  const handleBack = async () => {
    if (title || content) {
      if (!(await confirm({ title: "Unsaved Changes", message: "You have unsaved changes. Are you sure you want to leave?", danger: true, confirmText: "Leave" }))) {
        return;
      }
    }
    router.push("/");
  };

  const handleRandomExample = async () => {
    setIsGeneratingExample(true);
    setError("");
    try {
      const res = await fetch("/api/generate-example-case", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch example.");
      setContent(data.content || "");
      setTitle(data.title || "");
    } catch (err: any) {
      setError(err.message || "Failed to generate random case.");
    } finally {
      setIsGeneratingExample(false);
    }
  };

  const handleAnalyze = async () => {
    if (!navigator.onLine) {
      alert("Cannot analyze case while offline.");
      return;
    }

    if (content.trim().length < 50) {
      setError("Case text is too short. Please provide more details.");
      return;
    }

    if (content.length > 12000) {
      setError("Case text exceeds 12,000 characters.");
      return;
    }

    // Privacy warning before proceeding
    if (!(await confirm({ 
      title: "Privacy Warning", 
      message: "Please ensure no personally identifiable information (PII) is included before analyzing. Continue?",
      confirmText: "Continue"
    }))) {
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: content }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to analyze case.");
      }

      const newCaseId = uuidv4();
      
      addCase({
        id: newCaseId,
        title: title || data.generatedTitle || "Untitled Case",
        content,
        analysis: data.analysis,
        createdAt: Date.now(),
      });

      if (!data.isValid) {
        // PG-04 More Information Needed
        router.push(`/cases/${newCaseId}?state=more-info`);
      } else {
        // PG-03 Case Analysis Results
        router.push(`/cases/${newCaseId}`);
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during analysis.");
      alert("AI Service temporarily unavailable. Please try again later."); // SM-16 AI temporarily unavailable banner equivalent
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto glass-card relative">
      {isLoading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center" style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(4px)' }}>
          <div className="flex gap-2 mb-4" style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'var(--accent-color)', animation: 'bounce 1.4s infinite ease-in-out both', animationDelay: '-0.32s' }}></div>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'var(--accent-color)', animation: 'bounce 1.4s infinite ease-in-out both', animationDelay: '-0.16s' }}></div>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'var(--accent-color)', animation: 'bounce 1.4s infinite ease-in-out both' }}></div>
          </div>
          <p style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--accent-color)' }}>Analyzing Case Study...</p>
          <style>{`
            @keyframes bounce {
              0%, 80%, 100% { transform: scale(0); }
              40% { transform: scale(1); }
            }
          `}</style>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <button onClick={handleBack} className="btn btn-secondary text-sm">
          &larr; Back to Home
        </button>
        <div className="flex gap-2">
          <button onClick={handleRandomExample} disabled={isGeneratingExample || isLoading} className="btn btn-secondary text-sm">
            {isGeneratingExample ? "Generating..." : "Generate Random Case"}
          </button>
          <button onClick={handleReset} className="btn btn-secondary text-sm text-red-400 border-red-500/30 hover:bg-red-500/10">
            Reset Form
          </button>
        </div>
      </div>

      <h1 className="mb-2">New Case Study</h1>
      <p className="mb-6 opacity-80">Enter a medical case for local, private AI analysis.</p>

      {error && (
        <div className="mb-6 p-4 border border-red-500 bg-red-500/10 text-red-400 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="form-group">
        <label className="form-label">Title (Optional)</label>
        <input 
          type="text" 
          className="form-input" 
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
          placeholder="e.g. 55yo Male with Chest Pain"
          disabled={isLoading}
        />
      </div>

      <div className="form-group">
        <label className="form-label">Case Content</label>
        <textarea 
          className="form-textarea min-h-[300px]" 
          value={content} 
          onChange={(e) => setContent(e.target.value)}
          placeholder="Paste or type the clinical case study here... Please omit any identifiable patient information."
          disabled={isLoading}
        />
      </div>

      <div className="flex justify-end mt-8">
        <button onClick={handleAnalyze} className="btn btn-primary px-8 py-3 text-lg" disabled={isLoading || !content.trim()}>
          Analyze Case
        </button>
      </div>
    </div>
  );
}
