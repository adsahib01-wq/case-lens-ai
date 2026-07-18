"use client";

import { useCaseStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function ResultsSummary() {
  const router = useRouter();
  const cases = useCaseStore((state) => state.cases);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const completedCases = cases.filter(c => c.score !== undefined && c.questions);

  const handlePrint = () => window.print();

  if (completedCases.length === 0) {
    return <div className="text-center mt-12">No completed cases.</div>;
  }

  const totalQuestions = completedCases.reduce((acc, c) => acc + (c.questions?.length || 0), 0);
  const totalCorrect = completedCases.reduce((acc, c) => acc + (c.score || 0), 0);
  const averagePercentage = Math.round((totalCorrect / totalQuestions) * 100);

  return (
    <div className="max-w-4xl mx-auto bg-white text-black p-8 rounded-xl">
      <div className="print:hidden flex justify-between mb-8 pb-4 border-b">
        <button onClick={() => router.back()} className="text-blue-600 font-medium">&larr; Back</button>
        <button onClick={handlePrint} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium">Print / Save PDF</button>
      </div>

      <div className="text-center border-b pb-6 mb-8">
        <h1 className="text-3xl font-bold mb-2">Overall Results Summary</h1>
        <p className="text-gray-500">CaseLens AI</p>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-12">
        <div className="text-center bg-gray-50 p-6 rounded-xl border">
          <p className="text-gray-500 font-bold mb-2 uppercase text-sm">Total Score</p>
          <div className="text-3xl font-bold text-blue-600">{totalCorrect} / {totalQuestions}</div>
        </div>
        <div className="text-center bg-gray-50 p-6 rounded-xl border">
          <p className="text-gray-500 font-bold mb-2 uppercase text-sm">Average</p>
          <div className="text-3xl font-bold text-blue-600">{averagePercentage}%</div>
        </div>
        <div className="text-center bg-gray-50 p-6 rounded-xl border">
          <p className="text-gray-500 font-bold mb-2 uppercase text-sm">Cases Completed</p>
          <div className="text-3xl font-bold text-blue-600">{completedCases.length}</div>
        </div>
      </div>

      <h2 className="text-2xl font-bold border-b-2 border-gray-200 pb-2 mb-4">Breakdown by Case</h2>
      <div className="space-y-4">
        {completedCases.map((c, idx) => (
          <div key={c.id} className="border p-4 rounded-lg bg-gray-50 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-lg mb-1">{idx + 1}. {c.title || "Untitled Case"}</h3>
              <p className="text-sm text-gray-500">Completed: {new Date(c.createdAt).toLocaleDateString()}</p>
            </div>
            <div className="text-right">
              <div className="font-bold text-xl text-blue-600">
                {c.score} / {c.questions!.length}
              </div>
              <div className="text-sm text-gray-500">
                {Math.round(((c.score || 0) / c.questions!.length) * 100)}%
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-12 pt-4 border-t text-sm text-gray-500 text-center">
        Printed on {new Date().toLocaleDateString()}. This report was generated locally and securely by CaseLens AI.
      </div>
    </div>
  );
}
