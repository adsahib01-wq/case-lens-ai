"use client";

import { useCaseStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { useState, useEffect, use } from "react";

export default function AnalysisReport({ params }: { params: Promise<{ caseId: string }> }) {
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
        <button onClick={() => router.back()} className="text-blue-600 font-medium">&larr; Back to Case</button>
        <button onClick={handlePrint} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium">Print / Save PDF</button>
      </div>

      <div className="text-center border-b pb-6 mb-8">
        <h1 className="text-3xl font-bold mb-2">Educational Case Analysis</h1>
        <p className="text-gray-500">CaseLens AI Report</p>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-bold border-b pb-2 mb-4">Case Overview</h2>
        <h3 className="text-lg font-medium mb-2">{currentCase.title || "Untitled Case"}</h3>
        <p className="whitespace-pre-wrap text-gray-800">{currentCase.content}</p>
      </div>

      <div>
        <h2 className="text-xl font-bold border-b pb-2 mb-4">AI Analysis</h2>
        <div className="whitespace-pre-wrap text-gray-800">
          {currentCase.analysis}
        </div>
      </div>
      
      <div className="mt-12 pt-4 border-t text-sm text-gray-500 text-center">
        Printed on {new Date().toLocaleDateString()}. This report was generated locally and securely by CaseLens AI.
      </div>
    </div>
  );
}
