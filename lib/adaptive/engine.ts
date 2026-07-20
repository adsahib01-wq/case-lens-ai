import { 
  QuestionAttempt, 
  McqQuestion, 
  PracticeSession, 
  AdaptiveDecision, 
  AdaptiveEvidence, 
  DifficultyLevel,
  AdaptiveDecisionType,
  AdaptiveQuestionPurpose,
  AdaptiveReasonCode
} from "../store";

export const ADAPTIVE_RULE_VERSION = 1;

export function buildAdaptiveEvidence(input: {
  conceptId: string;
  attempts: QuestionAttempt[];
  questions: McqQuestion[];
}): AdaptiveEvidence[] {
  const { conceptId, attempts, questions } = input;
  
  const eligibleAttempts = attempts.filter(a => {
    if (!a.id) return false;
    if (a.unanswered) return false;
    
    const q = questions.find(q => q.id === a.questionId);
    if (!q) return false;
    if (!q.difficulty) return false;
    if (q.primaryConceptId !== conceptId) return false;
    
    return true;
  });

  eligibleAttempts.sort((a, b) => new Date(a.answeredAt).getTime() - new Date(b.answeredAt).getTime());

  const uniqueMap = new Map<string, QuestionAttempt>();
  for (const a of eligibleAttempts) {
    uniqueMap.set(a.id!, a);
  }
  const sortedUnique = Array.from(uniqueMap.values());
  
  const evidence: AdaptiveEvidence[] = sortedUnique.map(a => {
    const q = questions.find(q => q.id === a.questionId)!;
    return {
      attemptId: a.id!,
      questionId: a.questionId,
      conceptId: q.primaryConceptId!,
      difficulty: q.difficulty!,
      isCorrect: a.isCorrect,
      confidence: a.confidence,
      hintsUsed: a.hintsUsed,
      submissionReason: a.submissionReason,
      submittedAt: a.answeredAt
    };
  });

  return evidence.slice(-5);
}

export function resolveCurrentDifficulty(input: {
  conceptId: string;
  completedSessions: PracticeSession[];
  savedDecisions: AdaptiveDecision[];
  evidence: AdaptiveEvidence[];
  caseStartingDifficulty?: DifficultyLevel;
}): DifficultyLevel | null {
  
  const completedAdaptiveSessions = input.completedSessions
    .filter(s => s.status === "completed" || s.status === "expired")
    .filter(s => s.adaptiveContext?.conceptId === input.conceptId)
    .sort((a, b) => new Date(b.completedAt || 0).getTime() - new Date(a.completedAt || 0).getTime());
  
  if (completedAdaptiveSessions.length > 0 && completedAdaptiveSessions[0].adaptiveContext?.targetDifficulty) {
    return completedAdaptiveSessions[0].adaptiveContext.targetDifficulty;
  }

  const appliedDecisions = input.savedDecisions
    .filter(d => d.conceptId === input.conceptId)
    .filter(d => input.completedSessions.some(s => s.adaptiveContext?.sourceDecisionId === d.id))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  if (appliedDecisions.length > 0) {
    return appliedDecisions[0].recommendedDifficulty;
  }

  const recentEvidence = [...input.evidence].sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
  if (recentEvidence.length > 0) {
    return recentEvidence[0].difficulty;
  }

  if (input.caseStartingDifficulty) {
    return input.caseStartingDifficulty;
  }

  return null;
}

export function createAdaptiveDecisionKey(input: {
  conceptId: string;
  currentDifficulty: DifficultyLevel;
  orderedAttemptIds: string[];
  ruleVersion: number;
}): string {
  return [
    input.conceptId,
    input.currentDifficulty,
    input.ruleVersion,
    ...input.orderedAttemptIds,
  ].join(":");
}

export function decideNextDifficulty(input: {
  conceptId: string;
  currentDifficulty: DifficultyLevel;
  evidence: AdaptiveEvidence[];
}): Omit<AdaptiveDecision, "id" | "decisionKey" | "createdAt" | "sourceSessionId" | "ruleVersion"> {
  const { currentDifficulty, evidence } = input;
  
  const attemptIds = evidence.map(e => e.attemptId);

  const defaultReturn = (
    decision: AdaptiveDecisionType, 
    recommended: DifficultyLevel, 
    reason: AdaptiveReasonCode, 
    purpose: AdaptiveQuestionPurpose
  ) => ({
    conceptId: input.conceptId,
    previousDifficulty: currentDifficulty,
    recommendedDifficulty: recommended,
    decision,
    reasonCode: reason,
    purpose,
    evidenceAttemptIds: attemptIds
  });

  if (evidence.length < 2) {
    return defaultReturn("maintain", currentDifficulty, "insufficient-evidence", "standard");
  }

  const latest2 = evidence.slice(-2);
  const latest3 = evidence.slice(-3);
  const last = evidence[evidence.length - 1];

  const allSameDifficulty = (items: AdaptiveEvidence[]) => items.every(i => i.difficulty === currentDifficulty);
  const allIncorrect = (items: AdaptiveEvidence[]) => items.every(i => !i.isCorrect);
  const allHighConfidence = (items: AdaptiveEvidence[]) => items.every(i => i.confidence === "High");

  // Rule 2: Repeated high-confidence errors
  if (latest2.length === 2 && allIncorrect(latest2) && allHighConfidence(latest2) && allSameDifficulty(latest2)) {
    if (currentDifficulty === "Basic") {
      return defaultReturn("maintain", "Basic", "repeated-high-confidence-error", "misconception-correction");
    }
    const newDiff = currentDifficulty === "Advanced" ? "Intermediate" : "Basic";
    return defaultReturn("decrease", newDiff, "repeated-high-confidence-error", "misconception-correction");
  }

  // Rule 3: Repeated incorrect answers
  if (latest2.length === 2 && allIncorrect(latest2) && allSameDifficulty(latest2)) {
    if (currentDifficulty === "Basic") {
      return defaultReturn("maintain", "Basic", "difficulty-floor", "reinforcement");
    }
    const newDiff = currentDifficulty === "Advanced" ? "Intermediate" : "Basic";
    return defaultReturn("decrease", newDiff, "repeated-incorrect", "reinforcement");
  }

  // Rule 4: Single high-confidence error
  if (!last.isCorrect && last.confidence === "High" && last.difficulty === currentDifficulty) {
    return defaultReturn("maintain", currentDifficulty, "high-confidence-error", "misconception-correction");
  }

  // Rule 5: Correct with low confidence
  if (last.isCorrect && last.confidence === "Low" && last.difficulty === currentDifficulty) {
    return defaultReturn("maintain", currentDifficulty, "correct-low-confidence", "confidence-reinforcement");
  }

  // Rule 6: Correct with hints
  if (last.isCorrect && typeof last.hintsUsed === "number" && last.hintsUsed > 0 && last.difficulty === currentDifficulty) {
    return defaultReturn("maintain", currentDifficulty, "correct-with-hints", "reinforcement");
  }

  // Rule 7: Repeated independent correct answers
  if (latest3.length === 3) {
    const allCorrect = latest3.every(i => i.isCorrect);
    const sameDiff = allSameDifficulty(latest3);
    const noneForced = latest3.every(i => i.submissionReason !== "question-time-expired" && i.submissionReason !== "total-time-expired");
    const noHints = latest3.every(i => i.hintsUsed === 0);
    const highModCount = latest3.filter(i => i.confidence === "Moderate" || i.confidence === "High").length;

    if (allCorrect && sameDiff && noneForced && noHints && highModCount >= 2) {
      if (currentDifficulty === "Advanced") {
        return defaultReturn("maintain", "Advanced", "difficulty-ceiling", "advanced-integration");
      }
      const newDiff = currentDifficulty === "Basic" ? "Intermediate" : "Advanced";
      return defaultReturn("increase", newDiff, "repeated-correct", "standard");
    }
  }

  // Rule 8: Mixed evidence
  return defaultReturn("maintain", currentDifficulty, "mixed-evidence", "standard");
}

export function getAdaptiveDecisionExplanation(decision: Pick<AdaptiveDecision, "reasonCode" | "recommendedDifficulty">): string {
  switch (decision.reasonCode) {
    case "repeated-correct":
      return "Three recent independent correct responses support progressing the difficulty.";
    case "repeated-incorrect":
      return "Repeated errors suggest reinforcing the concept at a more foundational level.";
    case "repeated-high-confidence-error":
      return "Repeated high-confidence errors indicate a stable misconception. The next review will focus on correcting that distinction.";
    case "high-confidence-error":
      return "A high-confidence error may indicate a stable misconception, so the next review will focus on correcting that distinction.";
    case "correct-low-confidence":
      return "The answer was correct, but low confidence suggests that further reinforcement may improve reliable recall.";
    case "correct-with-hints":
      return "The answer was correct with support, so the current difficulty will be maintained for further independent practice.";
    case "difficulty-ceiling":
      return "Strong performance is continuing at the highest available difficulty.";
    case "difficulty-floor":
      return "The next review will remain at Basic difficulty and reinforce the underlying foundation.";
    case "mixed-evidence":
      return "Recent responses are mixed, so the current difficulty will be maintained.";
    case "insufficient-evidence":
    default:
      return "More completed responses are needed before adjusting difficulty.";
  }
}
