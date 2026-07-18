"use client";

import { useCaseStore, McqQuestion } from "@/lib/store";
import { useRouter } from "next/navigation";
import { useState, useEffect, use, useMemo } from "react";
import { useConfirm } from "@/components/ConfirmProvider";

export default function PracticePage({ params }: { params: Promise<{ caseId: string }> }) {
  const { caseId } = use(params);
  const router = useRouter();
  const { cases, updateCase } = useCaseStore();
  const [mounted, setMounted] = useState(false);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showAllOptions, setShowAllOptions] = useState(false);
  const { confirm } = useConfirm();

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const currentCase = cases.find((c) => c.id === caseId);
  const isLegacy = currentCase?.questions && !currentCase?.mcqs;
  const rawQuestions = currentCase?.mcqs || currentCase?.questions || [];

  // 1. Ensure stable IDs for all questions and options from the original array
  const questions = useMemo(() => {
    return rawQuestions.map((q: any, qIdx: number) => {
      const qId = q.id || `q-${qIdx}`;
      return {
        ...q,
        id: qId,
        options: q.options?.map((opt: any, oIdx: number) => ({
          ...opt,
          id: opt.id || `${qId}-opt-${oIdx}`
        }))
      };
    });
  }, [rawQuestions]);

  if (!currentCase || questions.length === 0) {
    return (
      <div className="max-w-xl mx-auto glass-card text-center mt-12">
        <h2 className="text-[var(--error)] mb-4">Quiz Unavailable</h2>
        <p className="mb-8">No questions generated or case deleted.</p>
        <button onClick={() => router.push("/")} className="btn btn-primary">Go Home</button>
      </div>
    );
  }

  const currentQuestionRaw = questions[currentIndex] as McqQuestion;
  const questionId = currentQuestionRaw.id;

  // 2. Shuffle options for the current question in a stable way
  const shuffledOptions = useMemo(() => {
    if (!currentQuestionRaw?.options) return [];
    return [...currentQuestionRaw.options].sort(() => Math.random() - 0.5);
  }, [currentQuestionRaw?.id]);

  const currentQuestion = { ...currentQuestionRaw, options: shuffledOptions };

  const existingAnswers = currentCase.answers || {};
  const hasExistingAnswer = !!existingAnswers[questionId];
  
  if (hasExistingAnswer && !isSubmitted && selectedOption !== existingAnswers[questionId]) {
    setSelectedOption(existingAnswers[questionId]);
    setIsSubmitted(true);
  }

  const handleSelect = (id: string) => {
    if (isSubmitted || hasExistingAnswer) return;
    setSelectedOption(id);
  };

  const handleSubmit = () => {
    if (!selectedOption) return;
    
    // Save answer and attempt
    const isCorrectValue = selectedOption === currentQuestionRaw.correctOptionId || 
                           !!currentQuestionRaw.options?.find(o => o.id === selectedOption)?.isCorrect;
                           
    const attempt = {
      questionId,
      selectedOptionId: selectedOption,
      isCorrect: isCorrectValue,
      answeredAt: new Date().toISOString(),
      attemptNumber: (currentCase.attempts?.filter(a => a.questionId === questionId)?.length || 0) + 1
    };

    updateCase(currentCase.id, {
      answers: { ...existingAnswers, [questionId]: selectedOption },
      attempts: [...(currentCase.attempts || []), attempt]
    });
    
    setIsSubmitted(true);
    setShowAllOptions(false); // Reset expansion state
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedOption(null);
      setIsSubmitted(false);
      setShowAllOptions(false);
    } else {
      // Calculate score and go to results
      const finalAnswers = { ...existingAnswers, [questionId]: selectedOption! };
      let score = 0;
      questions.forEach((q) => {
        const mcq = q as McqQuestion;
        const correctOpt = mcq.options?.find(o => o.isCorrect)?.id || mcq.correctOptionId;
        if (finalAnswers[mcq.id] === correctOpt) score++;
      });
      updateCase(currentCase.id, { score });
      router.push(`/cases/${currentCase.id}/results`);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setSelectedOption(null);
      setIsSubmitted(false);
      setShowAllOptions(false);
    }
  };

  const handleExit = async () => {
    if (await confirm({ title: "Exit Practice", message: "Are you sure you want to exit practice? Your progress is saved.", confirmText: "Exit" })) {
      router.push(`/cases/${currentCase.id}`);
    }
  };

  // Use raw question to find correct option ID reliably since shuffling doesn't change IDs
  const correctOptionId = currentQuestionRaw.correctOptionId || currentQuestionRaw.options?.find(o => o.isCorrect)?.id;
  const isCorrectlyAnswered = selectedOption === correctOptionId;
  const selectedOptData = currentQuestionRaw.options?.find(o => o.id === selectedOption);
  const correctOptData = currentQuestionRaw.options?.find(o => o.id === correctOptionId);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="m-0 text-[var(--text-primary)]">Question {currentIndex + 1} of {questions.length}</h2>
        <div className="flex gap-4 items-center">
          <span className="text-sm px-3 py-1 rounded bg-[var(--card-border)]">{currentQuestion.difficulty || "Standard"}</span>
          <button onClick={handleExit} className="btn btn-secondary text-sm">Exit Practice</button>
        </div>
      </div>
      
      <div className="glass-card mb-8">
        <p className="text-xl font-medium mb-6" style={{ color: "var(--text-primary)" }}>{currentQuestion.stem || (currentQuestion as any).text}</p>
        
        <div className="grid gap-3">
          {currentQuestion.options?.map((option, idx) => {
            const optId = option.id;
            let btnClass = "option-btn";
            
            if (isSubmitted || hasExistingAnswer) {
              if (optId === correctOptionId) {
                btnClass += " correct";
              } else if (optId === selectedOption || optId === existingAnswers[questionId]) {
                btnClass += " incorrect";
              } else {
                btnClass += " opacity-50";
              }
            } else if (selectedOption === optId) {
              btnClass += " selected";
            }

            return (
              <button
                key={optId}
                onClick={() => handleSelect(optId)}
                disabled={isSubmitted || hasExistingAnswer}
                className={btnClass}
              >
                <div className="flex gap-3">
                  <span className="font-bold">{String.fromCharCode(65 + idx)}.</span>
                  <span style={{ color: "var(--text-primary)" }}>{option.text}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {(isSubmitted || hasExistingAnswer) && !isLegacy && (
        <div className="glass-card mb-8 border-l-4" style={{ borderLeftColor: isCorrectlyAnswered ? 'var(--success)' : 'var(--error)' }}>
          <h3 className="flex items-center gap-2 mb-4" style={{ color: isCorrectlyAnswered ? 'var(--success)' : 'var(--error)' }}>
            {isCorrectlyAnswered ? (
              <>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5"/></svg>
                Correct
              </>
            ) : (
              <>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/></svg>
                Incorrect
              </>
            )}
          </h3>

          {!isCorrectlyAnswered && selectedOptData && (
            <div className="mb-6 p-4 rounded bg-[var(--error-bg)] border border-[var(--error)]/20">
              <p className="font-bold mb-2">Why your answer was incorrect:</p>
              <p className="mb-2 text-sm">{selectedOptData.explanation}</p>
              {selectedOptData.misconception && (
                <p className="text-sm italic opacity-80 mt-2"><strong>Likely Misconception:</strong> {selectedOptData.misconception}</p>
              )}
            </div>
          )}

          <div className="mb-6">
            <h4 className="font-bold mb-2 text-[var(--success)]">Correct Answer: {correctOptData?.label}. {correctOptData?.text}</h4>
            <p className="text-sm leading-relaxed mb-4">{currentQuestion.correctAnswerExplanation}</p>
            
            {currentQuestion.reasoningSteps && currentQuestion.reasoningSteps.length > 0 && (
              <div className="bg-gray-50 p-4 rounded mt-4">
                <p className="font-bold text-sm mb-2">Reasoning Chain:</p>
                <ol className="list-decimal pl-5 text-sm space-y-1">
                  {currentQuestion.reasoningSteps.map((step, i) => <li key={i}>{step}</li>)}
                </ol>
              </div>
            )}
          </div>

          <button 
            onClick={() => setShowAllOptions(!showAllOptions)} 
            className="text-sm text-[var(--accent-color)] font-medium underline mb-4"
          >
            {showAllOptions ? "Hide all option explanations" : "Explain all options"}
          </button>

          {showAllOptions && (
            <div className="space-y-4 mb-6 border-t pt-4">
              {currentQuestion.options.map(opt => (
                <div key={opt.id} className="text-sm p-3 rounded border border-gray-100 bg-gray-50">
                  <p className="font-bold mb-1">{opt.label}. {opt.text} {opt.isCorrect && <span className="text-[var(--success)]">(Correct)</span>}</p>
                  <p>{opt.explanation}</p>
                  {opt.whenItCouldBeCorrect && (
                    <p className="mt-2 italic opacity-80">When it could be correct: {opt.whenItCouldBeCorrect}</p>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="border-t pt-4 grid sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Concept Tested</p>
              <p className="text-sm font-medium">{currentQuestion.conceptTags?.[0]?.conceptName || "General Knowledge"}</p>
            </div>
            {currentQuestion.highYieldTakeaway && (
              <div>
                <p className="text-xs text-[var(--accent-color)] uppercase font-bold tracking-wider mb-1">High-Yield Takeaway</p>
                <p className="text-sm">{currentQuestion.highYieldTakeaway}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {(isSubmitted || hasExistingAnswer) && isLegacy && (
        <div className={`p-4 mb-8 rounded border ${isCorrectlyAnswered ? "bg-[var(--success-bg)] border-[var(--success)] text-[var(--success)]" : "bg-[var(--error-bg)] border-[var(--error)] text-[var(--error)]"}`}>
          {isCorrectlyAnswered ? "Correct!" : "Incorrect. The correct answer was highlighted above."}
        </div>
      )}

      <div className="flex justify-between mt-8 pt-6 border-t" style={{ borderColor: 'var(--card-border)' }}>
        <button onClick={handlePrevious} disabled={currentIndex === 0} className="btn btn-secondary">
          Previous
        </button>

        {!(isSubmitted || hasExistingAnswer) ? (
          <button onClick={handleSubmit} disabled={!selectedOption} className="btn btn-primary">
            Submit Answer
          </button>
        ) : (
          <button onClick={handleNext} className="btn btn-primary">
            {currentIndex < questions.length - 1 ? "Next Question" : "View Results"}
          </button>
        )}
      </div>
    </div>
  );
}
