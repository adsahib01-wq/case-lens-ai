import { CaseStudy, QuestionAttempt, McqQuestion, PracticeSession } from "../store";
import { CombinedConceptPerformance, OverallResultsAggregate } from "./types";
import { classifyConceptPerformance } from "./classifyConceptPerformance";

interface AggregateOutput {
  summary: OverallResultsAggregate;
  allConcepts: CombinedConceptPerformance[];
}

export function aggregateOverallResults(input: { cases: CaseStudy[] }): AggregateOutput {
  const { cases } = input;

  let uniqueCases = 0;
  let completedTests = 0;
  let totalQuestions = 0;
  let answeredQuestions = 0;
  let correct = 0;
  let incorrect = 0;
  let unanswered = 0;

  let confidenceRecordedCount = 0;
  let highConfidenceCorrect = 0;
  let moderateConfidenceCorrect = 0;
  let lowConfidenceCorrect = 0;
  let highConfidenceError = 0;
  let moderateConfidenceError = 0;
  let lowConfidenceError = 0;
  let confidenceNotRecorded = 0;

  // Flatten and deduplicate attempts
  // A Map to store exactly one accepted attempt per sessionId + questionId
  const validAttemptsMap = new Map<string, QuestionAttempt>();
  
  // Also collect unanswered data. If a session is completed/expired, 
  // any question in that case that was NOT answered during the session is "unanswered".
  const conceptAttemptHistory: Record<string, { attempt: QuestionAttempt, conceptName: string, isUnanswered: boolean, qId: string, sessionId: string }[]> = {};

  cases.forEach(c => {
    let caseCounted = false;

    if (c.practiceSessions) {
      c.practiceSessions.forEach((session: PracticeSession) => {
        if (session.status !== "completed" && session.status !== "expired") return;
        
        if (!caseCounted) {
          uniqueCases++;
          caseCounted = true;
        }
        completedTests++;

        const mcqs = (c.mcqs || c.questions || []) as any[];
        totalQuestions += mcqs.length;

        // Deduplicate attempts within this session
        const sessionAttempts = new Map<string, QuestionAttempt>();
        if (session.attempts) {
          session.attempts.forEach((a: QuestionAttempt) => {
            // Priority: Valid attempt ID -> latest accepted persisted attempt
            sessionAttempts.set(a.questionId, a);
          });
        }

        mcqs.forEach((q: any) => {
          const canonicalConceptId = q.primaryConceptId || q.conceptTags?.[0]?.conceptId || "unclassified";
          const conceptLabel = q.conceptTags?.[0]?.conceptName || canonicalConceptId;

          const attempt = sessionAttempts.get(q.id);

          if (!conceptAttemptHistory[canonicalConceptId]) {
            conceptAttemptHistory[canonicalConceptId] = [];
          }

          if (!attempt) {
            unanswered++;
            conceptAttemptHistory[canonicalConceptId].push({ attempt: {} as any, conceptName: conceptLabel, isUnanswered: true, qId: q.id, sessionId: session.id });
          } else {
            validAttemptsMap.set(`${session.id}:${q.id}`, attempt);
            conceptAttemptHistory[canonicalConceptId].push({ attempt, conceptName: conceptLabel, isUnanswered: false, qId: q.id, sessionId: session.id });

            answeredQuestions++;
            if (attempt.isCorrect) correct++;
            else incorrect++;

            if (!attempt.confidence) {
              confidenceNotRecorded++;
            } else {
              confidenceRecordedCount++;
              if (attempt.isCorrect) {
                if (attempt.confidence === "High") highConfidenceCorrect++;
                if (attempt.confidence === "Moderate") moderateConfidenceCorrect++;
                if (attempt.confidence === "Low") lowConfidenceCorrect++;
              } else {
                if (attempt.confidence === "High") highConfidenceError++;
                if (attempt.confidence === "Moderate") moderateConfidenceError++;
                if (attempt.confidence === "Low") lowConfidenceError++;
              }
            }
          }
        });
      });
    }
  });

  const overallScore = totalQuestions > 0 ? correct / totalQuestions : 0;
  const answeredAccuracy = answeredQuestions > 0 ? correct / answeredQuestions : 0;

  const summary: OverallResultsAggregate = {
    uniqueCases,
    completedTests,
    totalQuestions,
    answeredQuestions,
    correct,
    incorrect,
    unanswered,
    overallScore,
    answeredAccuracy,

    confidenceRecordedCount,
    highConfidenceCorrect,
    moderateConfidenceCorrect,
    lowConfidenceCorrect,
    highConfidenceError,
    moderateConfidenceError,
    lowConfidenceError,
    confidenceNotRecorded
  };

  const allConcepts: CombinedConceptPerformance[] = [];

  for (const [conceptId, records] of Object.entries(conceptAttemptHistory)) {
    // Sort chronologically
    records.sort((a, b) => new Date(a.attempt.answeredAt).getTime() - new Date(b.attempt.answeredAt).getTime());

    let cTotalAnswered = 0;
    let cCorrect = 0;
    let cError = 0;
    let cUnanswered = 0;
    let cHighConfError = 0;
    let cLowConfCorrect = 0;
    let cConfNotRecorded = 0;
    const sessionIds = new Set<string>();
    
    let firstAttemptAt: string | undefined;
    let lastAttemptAt: string | undefined;
    let conceptLabel = "Unclassified Concepts";
    const chronologicalAnswers: { isCorrect: boolean, confidence?: string }[] = [];
    const recentAttemptIds: string[] = [];

    records.forEach(r => {
      conceptLabel = r.conceptName;
      sessionIds.add(r.sessionId);

      if (r.isUnanswered) {
        cUnanswered++;
      } else {
        cTotalAnswered++;
        const a = r.attempt;
        chronologicalAnswers.push({ isCorrect: a.isCorrect, confidence: a.confidence });
        if (a.id) {
          recentAttemptIds.push(a.id);
        }
        
        if (!firstAttemptAt) firstAttemptAt = a.answeredAt;
        lastAttemptAt = a.answeredAt;

        if (a.isCorrect) {
          cCorrect++;
          if (a.confidence === "Low") cLowConfCorrect++;
        } else {
          cError++;
          if (a.confidence === "High") cHighConfError++;
        }

        if (!a.confidence) {
          cConfNotRecorded++;
        }
      }
    });

    if (cTotalAnswered === 0 && cUnanswered === 0) continue; // Skip if completely empty somehow

    const accuracyPercentage = cTotalAnswered > 0 ? Math.round((cCorrect / cTotalAnswered) * 100) : 0;

    const basePerformance: CombinedConceptPerformance = {
      conceptId,
      conceptLabel,
      totalAnswered: cTotalAnswered,
      correctCount: cCorrect,
      errorCount: cError,
      unansweredCount: cUnanswered,
      highConfidenceErrorCount: cHighConfError,
      lowConfidenceCorrectCount: cLowConfCorrect,
      confidenceNotRecordedCount: cConfNotRecorded,
      accuracyPercentage,
      sessionCount: sessionIds.size,
      firstAttemptAt,
      lastAttemptAt,
      recentAttemptIds: recentAttemptIds.slice(-3),
      classification: "insufficient-evidence" // Placeholder
    };

    basePerformance.classification = classifyConceptPerformance(basePerformance, chronologicalAnswers);

    // Look for adaptive decisions
    // We attach the most recent available adaptive decision for this concept
    const relevantDecisions = cases.flatMap(c => c.adaptiveDecisions || [])
      .filter(d => d.conceptId === conceptId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    // An active adaptive decision should not have already been used to spawn a session
    // (We could check if it's referenced by any session's adaptiveContext.sourceDecisionId)
    const usedDecisionIds = new Set(
      cases.flatMap(c => c.practiceSessions || [])
      .map(s => s.adaptiveContext?.sourceDecisionId)
      .filter(Boolean)
    );

    const availableDecision = relevantDecisions.find(d => !usedDecisionIds.has(d.id));

    if (availableDecision) {
      basePerformance.availableAdaptiveDecisionId = availableDecision.id;
      basePerformance.recommendedDifficulty = availableDecision.recommendedDifficulty;
      basePerformance.practiceFocus = availableDecision.purpose;
    }

    allConcepts.push(basePerformance);
  }

  return {
    summary,
    allConcepts
  };
}
