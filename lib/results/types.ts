export type ConceptClassification =
  | "insufficient-evidence"
  | "improving-concept"
  | "consistent-weakness"
  | "emerging-weakness"
  | "possible-weakness"
  | "strong-concept"
  | "developing-mixed-evidence";

export interface CombinedConceptPerformance {
  conceptId: string;
  conceptLabel: string;

  totalAnswered: number;
  correctCount: number;
  errorCount: number;
  unansweredCount: number;

  highConfidenceErrorCount: number;
  lowConfidenceCorrectCount: number;
  confidenceNotRecordedCount: number;

  accuracyPercentage: number;
  sessionCount: number;

  firstAttemptAt?: string;
  lastAttemptAt?: string;

  recentAttemptIds: string[];
  classification: ConceptClassification;
  
  // Stored for adaptive review button checks
  availableAdaptiveDecisionId?: string;
  recommendedDifficulty?: string;
  practiceFocus?: string;
}

export interface OverallResultsAggregate {
  uniqueCases: number;
  completedTests: number;
  totalQuestions: number;
  answeredQuestions: number;
  correct: number;
  incorrect: number;
  unanswered: number;
  overallScore: number;
  answeredAccuracy: number;

  confidenceRecordedCount: number;
  highConfidenceCorrect: number;
  moderateConfidenceCorrect: number;
  lowConfidenceCorrect: number;
  highConfidenceError: number;
  moderateConfidenceError: number;
  lowConfidenceError: number;
  confidenceNotRecorded: number;
}
