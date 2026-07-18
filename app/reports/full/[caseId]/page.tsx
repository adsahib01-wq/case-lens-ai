"use client";

import { useCaseStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { useState, useEffect, use } from "react";

export default function FullReport({ params }: { params: Promise<{ caseId: string }> }) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const { caseId } = unwrappedParams;
  const cases = useCaseStore((state) => state.cases);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const currentCase = cases.find((c) => c.id === caseId);

  if (!currentCase) {
    return <div className="text-center mt-12">Report Unavailable</div>;
  }

  const handlePrint = () => window.print();

  return (
    <div className="max-w-4xl mx-auto bg-white text-black p-8 rounded-xl">
      <div className="print:hidden flex justify-between mb-8 pb-4 border-b">
        <button onClick={() => router.back()} className="text-blue-600 font-medium">&larr; Back</button>
        <button onClick={handlePrint} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium">Print / Save PDF</button>
      </div>

      <div className="text-center border-b pb-6 mb-8">
        <h1 className="text-3xl font-bold mb-2">Full Learning Report</h1>
        <p className="text-gray-500">CaseLens AI</p>
      </div>

      {/* Overview */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold border-b-2 border-gray-200 pb-2 mb-4">Case Overview</h2>
        <h3 className="text-xl font-medium mb-2">{currentCase.title || "Untitled Case"}</h3>
        <p className="whitespace-pre-wrap text-gray-800 bg-gray-50 p-4 rounded-lg">{currentCase.content}</p>
      </div>

      {/* Analysis */}
      {currentCase.analysis && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold border-b-2 border-gray-200 pb-2 mb-4">AI Analysis</h2>
          <div className="whitespace-pre-wrap text-gray-800 bg-gray-50 p-4 rounded-lg">
            {currentCase.analysis}
          </div>
        </div>
      )}

      {/* MCQ Review */}
      {currentCase.questions && currentCase.questions.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold border-b-2 border-gray-200 pb-2 mb-4">MCQ Review</h2>
          {currentCase.score !== undefined && (
            <p className="text-lg font-medium text-blue-600 mb-6">
              Score: {currentCase.score} / {currentCase.questions.length}
            </p>
          )}
          
          <div className="space-y-6">
            {currentCase.questions.map((q, idx) => {
              const qId = q.id || `q-${idx}`;
              return (
                <div key={qId} className="border p-4 rounded-lg bg-gray-50">
                  <h3 className="font-bold mb-3">{idx + 1}. {q.text}</h3>
                  <ul className="space-y-2">
                    {q.options.map((opt, optIdx) => {
                      const optId = opt.id || `opt-${optIdx}`;
                      const isSelected = currentCase.answers && currentCase.answers[qId] === optId;
                      let className = "p-2 rounded border ";
                      if (opt.isCorrect) className += "bg-green-100 border-green-400 font-bold text-green-800";
                      else if (isSelected) className += "bg-red-100 border-red-400 font-bold text-red-800";
                      else className += "bg-white border-gray-200 text-gray-600";
                      
                      return (
                        <li key={optId} className={className}>
                          {opt.text} {opt.isCorrect && "✓"} {isSelected && !opt.isCorrect && "✗ (Your Answer)"}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      <div className="mt-12 pt-4 border-t text-sm text-gray-500 text-center">
        Printed on {new Date().toLocaleDateString()}. This report was generated locally and securely by CaseLens AI.
      </div>
    </div>
  );
}
