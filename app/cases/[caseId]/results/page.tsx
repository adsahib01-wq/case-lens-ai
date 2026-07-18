"use client";

import { useCaseStore, McqQuestion } from "@/lib/store";
import { useRouter } from "next/navigation";
import { useState, useEffect, use } from "react";
import Link from "next/link";
import PieChart from "@/components/PieChart";

export default function IndividualResultsPage({ params }: { params: Promise<{ caseId: string }> }) {
  const { caseId } = use(params);
  const router = useRouter();
  const { cases, updateCase, updateConceptPerformance } = useCaseStore();
  const [mounted, setMounted] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  useEffect(() => setMounted(true), []);

  const currentCase = cases.find((c) => c.id === caseId);

  useEffect(() => {
    if (mounted && currentCase?.attempts && currentCase.attempts.length > 0 && !analysisResult && !analyzing) {
      setAnalyzing(true);
      fetch('/api/analyze-performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attemptsData: { caseId: currentCase.id, attempts: currentCase.attempts, questions: currentCase.mcqs } }),
      })
      .then(res => res.json())
      .then(data => {
        setAnalysisResult(data);
        setAnalyzing(false);
        // We could also loop over data.weakConcepts and data.strongConcepts to update global conceptStore here
      })
      .catch(err => {
        console.error(err);
        setAnalyzing(false);
      });
    }
  }, [mounted, currentCase, analysisResult, analyzing]);

  if (!mounted) return null;

  if (!currentCase || currentCase.score === undefined) {
    return (
      <div className="max-w-xl mx-auto glass-card text-center mt-12">
        <h2 className="text-[var(--error)] mb-4">Results Unavailable</h2>
        <p className="mb-8">No results found for this case. You may need to finish the practice first.</p>
        <button onClick={() => router.push(`/cases/${caseId}/practice`)} className="btn btn-primary">Go to Practice</button>
      </div>
    );
  }

  const isLegacy = !currentCase.mcqs;
  const questions = currentCase.mcqs || currentCase.questions || [];
  const totalQuestions = questions.length;

  const handleRetake = () => {
    if (confirm("Are you sure you want to retake this quiz? Your current score will be cleared.")) {
      updateCase(currentCase.id, { answers: {}, score: undefined, attempts: [] });
      router.push(`/cases/${currentCase.id}/practice`);
    }
  };

  const handleStartNewCase = () => {
    if (confirm("Are you sure you want to start a new case?")) {
      router.push("/new-case");
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="glass-card text-center mb-8">
        <h2 className="mb-2">Learning Analysis</h2>
        <p className="text-sm opacity-80 mb-6">{currentCase.title}</p>
        
        <div className="flex flex-col items-center justify-center mb-6">
          <PieChart correct={currentCase.score} total={totalQuestions} size={140} />
          <div className="mt-4 text-lg font-bold text-gray-500">
            {currentCase.score} out of {totalQuestions} correct
          </div>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          <button onClick={handleRetake} className="btn btn-secondary">Retake Quiz</button>
          <button onClick={() => router.push(`/cases/${currentCase.id}`)} className="btn btn-secondary">Review Analysis</button>
          <Link href={`/cases/${currentCase.id}/study`} className="btn btn-primary bg-[var(--accent-color)] text-white border-0 col-span-2 sm:col-span-2">
            Generate Study Material
          </Link>
        </div>
      </div>

      {!isLegacy && analysisResult && (
        <div className="mb-12">
          <h2 className="mb-6">Performance Breakdown</h2>
          
          <div className="glass-card mb-6">
            <h3 className="mb-2">Summary</h3>
            <p className="text-sm">{analysisResult.summary}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="glass-card">
              <h3 className="mb-4 text-[var(--error)] flex items-center gap-2">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                Concepts Needing Attention
              </h3>
              {analysisResult.weakConcepts?.length > 0 ? (
                <ul className="space-y-4">
                  {analysisResult.weakConcepts.map((weak: any, i: number) => (
                    <li key={i} className="text-sm border-b pb-4 last:border-0 last:pb-0">
                      <p className="font-bold mb-1">{weak.conceptName}</p>
                      <p className="text-xs uppercase tracking-wider text-[var(--error)] font-bold mb-2">{weak.classification}</p>
                      <p className="mb-1"><strong>Likely Issue:</strong> {weak.likelyIssue}</p>
                      <p className="opacity-80"><em>Evidence: {weak.evidence?.join(" ")}</em></p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">No major weaknesses identified in this session.</p>
              )}
            </div>

            <div className="glass-card">
              <h3 className="mb-4 text-[var(--success)] flex items-center gap-2">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                Strong Concepts
              </h3>
              {analysisResult.strongConcepts?.length > 0 ? (
                <ul className="space-y-4">
                  {analysisResult.strongConcepts.map((strong: any, i: number) => (
                    <li key={i} className="text-sm border-b pb-4 last:border-0 last:pb-0">
                      <p className="font-bold mb-1">{strong.conceptName}</p>
                      <p className="opacity-80"><em>Evidence: {strong.evidence?.join(" ")}</em></p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">Not enough data to confirm secure concepts yet.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {analyzing && (
        <div className="glass-card text-center mb-12">
          <p className="animate-pulse">Analyzing your learning patterns and identifying concepts that need reinforcement...</p>
        </div>
      )}

      <div className="mb-12">
        <h2 className="mb-6">Question-by-Question Review</h2>
        <div className="space-y-6">
          {questions.map((q: any, idx: number) => {
            const questionId = q.id || `q-${idx}`;
            const userAnswerId = currentCase.answers?.[questionId];
            const isCorrect = isLegacy 
              ? q.options.find((o:any) => o.id === userAnswerId)?.isCorrect 
              : userAnswerId === q.correctOptionId;

            return (
              <div key={questionId} className="glass-card">
                <div className="flex gap-4 mb-4">
                  <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${isCorrect ? 'bg-[var(--success)]' : 'bg-[var(--error)]'}`}>
                    {idx + 1}
                  </div>
                  <div>
                    <p className="font-medium text-[var(--text-primary)] mb-2">{q.stem || q.text}</p>
                    {!isLegacy && q.conceptTags?.[0] && (
                      <span className="text-xs px-2 py-1 bg-gray-100 rounded text-gray-600">{q.conceptTags[0].conceptName}</span>
                    )}
                  </div>
                </div>

                {!isLegacy ? (
                  <div className="pl-12">
                    <p className="text-sm mb-2">
                      <span className="font-bold text-gray-500">Your Answer: </span> 
                      <span className={isCorrect ? 'text-[var(--success)] font-bold' : 'text-[var(--error)] font-bold'}>
                        {q.options.find((o:any) => o.id === userAnswerId)?.text || "Not answered"}
                      </span>
                    </p>
                    {!isCorrect && (
                      <p className="text-sm mb-4">
                        <span className="font-bold text-[var(--success)]">Correct Answer: </span> 
                        {q.options.find((o:any) => o.id === q.correctOptionId)?.text}
                      </p>
                    )}
                    
                    <details className="mt-4 border rounded p-3 bg-white cursor-pointer group">
                      <summary className="text-sm font-bold text-[var(--accent-color)] outline-none">Read Detailed Explanation</summary>
                      <div className="mt-4 text-sm space-y-4 cursor-text">
                        <div>
                          <p className="font-bold">Why it is correct:</p>
                          <p>{q.correctAnswerExplanation}</p>
                        </div>
                        {q.caseEvidence?.length > 0 && (
                          <div>
                            <p className="font-bold">Case Evidence:</p>
                            <ul className="list-disc pl-5">
                              {q.caseEvidence.map((ev: string, i: number) => <li key={i}>{ev}</li>)}
                            </ul>
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-[var(--error)]">Common Trap:</p>
                          <p>{q.commonTrap}</p>
                        </div>
                        <div>
                          <p className="font-bold text-[var(--accent-color)]">High-Yield Takeaway:</p>
                          <p>{q.highYieldTakeaway}</p>
                        </div>
                      </div>
                    </details>
                  </div>
                ) : (
                  <div className="pl-12 text-sm">
                    {/* Legacy view */}
                    <p>Your Answer: {q.options.find((o:any) => o.id === userAnswerId)?.text}</p>
                    <p>Correct: {q.options.find((o:any) => o.isCorrect)?.text}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex justify-between mt-8 pt-6 border-t border-white/10">
        <button onClick={() => router.push("/results")} className="btn btn-secondary">View Overall Results</button>
        <button onClick={handleStartNewCase} className="btn btn-primary px-8">Start New Case</button>
      </div>
    </div>
  );
}
