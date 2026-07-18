"use client";

import { useCaseStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function CaseHistory() {
  const router = useRouter();
  const { cases, deleteCase, clearAllCases } = useCaseStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this case?")) { // SM-02
      deleteCase(id);
      alert("Case deleted successfully."); // SM-12
    }
  };

  const handleClearAll = () => {
    if (confirm("Are you sure you want to clear ALL cases? This cannot be undone.")) { // SM-03
      clearAllCases();
      alert("All cases cleared."); // SM-13
    }
  };

  if (cases.length === 0) {
    return (
      <div className="max-w-xl mx-auto glass-card text-center mt-12">
        <h2 className="mb-4">Case History Empty</h2>
        <p className="mb-8">You have no saved cases.</p>
        <div className="flex gap-4 justify-center">
          <button onClick={() => router.push("/")} className="btn btn-secondary">Back to Home</button>
          <button onClick={() => router.push("/new-case")} className="btn btn-primary">Start New Case</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1>Case History</h1>
        <div className="flex gap-4">
          <button onClick={handleClearAll} className="btn btn-secondary text-sm text-red-400 border-red-500/30 hover:bg-red-500/10">Clear All</button>
          <button onClick={() => router.push("/new-case")} className="btn btn-primary text-sm">Start New Case</button>
        </div>
      </div>

      <div className="grid gap-6">
        {cases.map((c) => (
          <div key={c.id} className="glass-card flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
            <div className="flex-1">
              <h3 className="mb-2">{c.title || "Untitled Case"}</h3>
              <p className="text-sm opacity-80 mb-2 line-clamp-2">{c.content}</p>
              <div className="text-xs opacity-60">
                Created: {new Date(c.createdAt).toLocaleDateString()}
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 justify-end shrink-0">
              <Link href={`/cases/${c.id}`} className="btn btn-secondary text-sm">View Analysis</Link>
              {c.questions && c.questions.length > 0 && c.score === undefined && (
                <Link href={`/cases/${c.id}/practice`} className="btn btn-primary text-sm">Continue Practice</Link>
              )}
              {c.score !== undefined && (
                <Link href={`/cases/${c.id}/results`} className="btn btn-secondary text-sm">View Results</Link>
              )}
              <Link href={`/reports/full/${c.id}`} className="btn btn-secondary text-sm">Print Report</Link>
              <button onClick={() => handleDelete(c.id)} className="btn btn-secondary text-sm text-red-400 border-red-500/30 hover:bg-red-500/10">Delete</button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex justify-between">
        <button onClick={() => router.push("/")} className="btn btn-secondary">Back to Home</button>
        <button onClick={() => router.push("/results")} className="btn btn-primary">View Overall Results</button>
      </div>
    </div>
  );
}
