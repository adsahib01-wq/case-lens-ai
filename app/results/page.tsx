"use client";

import { useCaseStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import PieChart from "@/components/PieChart";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function OverallResults() {
  const router = useRouter();
  const cases = useCaseStore((state) => state.cases);
  const globalAnalysis = useCaseStore((state) => state.globalAnalysis);
  const setGlobalAnalysis = useCaseStore((state) => state.setGlobalAnalysis);
  const [mounted, setMounted] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const attemptedCases = cases.filter(c => c.attempts && c.attempts.length > 0);

  if (attemptedCases.length === 0) {
    return (
      <div className="max-w-xl mx-auto glass-card text-center mt-12">
        <h2 className="mb-4 text-[var(--text-primary)]">No Results Yet</h2>
        <p className="mb-8">Answer some case study questions to see your overall results.</p>
        <div className="flex gap-4 justify-center">
          <button onClick={() => router.push("/")} className="btn btn-secondary">Back to Home</button>
          <button onClick={() => router.push("/history")} className="btn btn-secondary">View Case History</button>
          <button onClick={() => router.push("/new-case")} className="btn btn-primary">Start New Case</button>
        </div>
      </div>
    );
  }

  const totalQuestions = attemptedCases.reduce((acc, c) => acc + (c.attempts?.length || 0), 0);
  const totalCorrect = attemptedCases.reduce((acc, c) => acc + (c.attempts?.filter(a => a.isCorrect).length || 0), 0);
  
  // Aggregate concepts
  const conceptStats: Record<string, { total: number; correct: number; name: string }> = {};
  attemptedCases.forEach(c => {
    if (c.mcqs && c.attempts) {
      c.attempts.forEach(attempt => {
        const q = c.mcqs?.find(q => q.id === attempt.questionId);
        if (q && q.conceptTags && q.conceptTags.length > 0) {
          const concept = q.conceptTags[0];
          if (!conceptStats[concept.conceptId]) {
            conceptStats[concept.conceptId] = { total: 0, correct: 0, name: concept.conceptName };
          }
          conceptStats[concept.conceptId].total += 1;
          if (attempt.isCorrect) {
            conceptStats[concept.conceptId].correct += 1;
          }
        }
      });
    }
  });

  const conceptArray = Object.values(conceptStats).map(stat => ({
    ...stat,
    accuracy: Math.round((stat.correct / stat.total) * 100)
  })).sort((a, b) => b.total - a.total); // Sort by most tested

  const handleGenerateAnalysis = async () => {
    setIsGenerating(true);
    try {
      const incorrectAttempts: any[] = [];
      attemptedCases.forEach(c => {
        if (c.mcqs && c.attempts) {
          c.attempts.filter(a => !a.isCorrect).forEach(a => {
            const q = c.mcqs?.find(q => q.id === a.questionId);
            if (q) {
              incorrectAttempts.push({
                question: q.stem,
                concept: q.conceptTags?.[0]?.conceptName,
                userAnswer: q.options?.find(o => o.id === a.selectedOptionId)?.text || "Unknown",
                correctAnswer: q.options?.find(o => o.id === q.correctOptionId || o.isCorrect)?.text || "Unknown",
                explanation: q.correctAnswerExplanation
              });
            }
          });
        }
      });

      const res = await fetch('/api/generate-overall-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ incorrectAttempts, conceptArray }),
      });
      
      if (!res.ok) throw new Error("Failed to generate analysis");
      
      const data = await res.json();
      setGlobalAnalysis(data.report);
      
    } catch (error) {
      console.error(error);
      alert("Failed to generate overall analysis.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-[var(--text-primary)]">Overall Results</h1>
        <div className="flex gap-4">
          <Link href="/reports/results-summary" className="btn btn-secondary text-sm">Print / PDF Summary</Link>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <div className="glass-card text-center">
          <p className="text-lg opacity-80 mb-2">Total Score</p>
          <div className="score-display mb-0">{totalCorrect} / {totalQuestions}</div>
        </div>
        <div className="glass-card text-center flex flex-col items-center justify-center">
          <p className="text-lg opacity-80 mb-4">Average Score</p>
          <PieChart correct={totalCorrect} total={totalQuestions} size={100} />
        </div>
        <div className="glass-card text-center flex flex-col justify-center">
          <p className="text-lg opacity-80 mb-2">Cases Attempted</p>
          <div className="text-4xl font-bold" style={{ color: "var(--accent-color)" }}>{attemptedCases.length}</div>
        </div>
      </div>

      {conceptArray.length > 0 && (
        <div className="mb-12">
          <h2 className="mb-6">Performance by Concept</h2>
          <div className="glass-card">
            <div className="grid grid-cols-12 gap-4 pb-3 border-b text-sm font-bold text-gray-500 uppercase">
              <div className="col-span-6">Concept</div>
              <div className="col-span-3 text-center">Questions</div>
              <div className="col-span-3 text-right">Accuracy</div>
            </div>
            <div className="space-y-4 pt-4">
              {conceptArray.map((c, i) => (
                <div key={i} className="grid grid-cols-12 gap-4 items-center">
                  <div className="col-span-6 font-medium">{c.name}</div>
                  <div className="col-span-3 text-center">{c.total}</div>
                  <div className="col-span-3 text-right">
                    <span className={`px-2 py-1 rounded text-sm font-bold ${c.accuracy >= 70 ? 'bg-[var(--success-bg)] text-[var(--success)]' : c.accuracy >= 40 ? 'bg-orange-100 text-orange-600' : 'bg-[var(--error-bg)] text-[var(--error)]'}`}>
                      {c.accuracy}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Global Analysis Section */}
      <div className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="m-0">AI Overall Analysis</h2>
          <button 
            onClick={handleGenerateAnalysis} 
            disabled={isGenerating} 
            className="btn btn-primary"
          >
            {isGenerating ? "Generating..." : globalAnalysis ? "Regenerate Analysis" : "Generate Analysis"}
          </button>
        </div>
        
        {isGenerating && (
          <div className="glass-card text-center py-12 mb-8">
            <svg className="animate-spin h-8 w-8 text-[var(--accent-color)] mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <h3 className="mb-2 text-[var(--text-primary)]">Analyzing your performance...</h3>
            <p className="text-sm opacity-80">Synthesizing weaknesses and building a custom study guide.</p>
          </div>
        )}

        {!isGenerating && globalAnalysis && (
          <div className="glass-card mb-8 animate-in fade-in duration-500">
            <div className="markdown-content">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {globalAnalysis}
              </ReactMarkdown>
            </div>
          </div>
        )}

        {!isGenerating && !globalAnalysis && (
          <div className="glass-card text-center py-8 opacity-70">
            <p>Click "Generate Analysis" to receive a personalized breakdown of your weaknesses and a tailored study guide based on your performance history.</p>
          </div>
        )}
      </div>

      <h2 className="mb-6">Breakdown by Case</h2>
      <div className="grid gap-4 mb-8">
        {attemptedCases.map((c) => {
          const correct = c.attempts?.filter(a => a.isCorrect).length || 0;
          const total = c.attempts?.length || 0;
          return (
            <div key={c.id} className="glass-card p-4 flex justify-between items-center hover:border-[var(--accent-color)] transition-colors">
              <div>
                <h3 className="text-lg mb-1 font-bold">{c.title || "Untitled Case"}</h3>
                <p className="text-sm opacity-60">
                  Score: {correct} / {total} 
                  ({Math.round((correct / (total || 1)) * 100)}%)
                </p>
            </div>
              <div className="flex gap-2">
                <Link href={`/cases/${c.id}`} className="btn btn-secondary text-sm">Analysis</Link>
                <Link href={`/cases/${c.id}/results`} className="btn btn-secondary text-sm bg-gray-50">Review</Link>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-between mt-8 pt-6 border-t" style={{ borderColor: "var(--card-border)" }}>
        <button onClick={() => router.push("/")} className="btn btn-secondary">Back to Home</button>
        <button onClick={() => router.push("/history")} className="btn btn-primary">View Case History</button>
      </div>
    </div>
  );
}
