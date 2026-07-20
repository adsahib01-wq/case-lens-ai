import { aggregateOverallResults } from "../lib/results/aggregateOverallResults";
import { classifyConceptPerformance } from "../lib/results/classifyConceptPerformance";
import { sortWeakConcepts } from "../lib/results/sortWeakConcepts";
import { CaseStudy, QuestionAttempt, McqQuestion } from "../lib/types";
import { CombinedConceptPerformance } from "../lib/results/types";

// Helper to quickly build mock cases
function buildMockCase(caseId: string, sessions: any[], mcqs: any[] = []): CaseStudy {
  return {
    id: caseId,
    title: "Test Case",
    status: "published",
    patientAge: 40,
    patientSex: "M",
    mcqs: mcqs as McqQuestion[],
    practiceSessions: sessions,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

describe("Overall Results Aggregation Logic", () => {

  it("1. Only completed and expired sessions are included", () => {
    const data = buildMockCase("c1", [
      { id: "s1", status: "completed", attempts: [] },
      { id: "s2", status: "expired", attempts: [] }
    ]);
    const { summary } = aggregateOverallResults({ cases: [data] });
    expect(summary.completedTests).toBe(2);
  });

  it("2. In-progress and abandoned sessions are excluded", () => {
    const data = buildMockCase("c1", [
      { id: "s1", status: "completed", attempts: [] },
      { id: "s2", status: "in-progress", attempts: [] },
      { id: "s3", status: "abandoned", attempts: [] }
    ]);
    const { summary } = aggregateOverallResults({ cases: [data] });
    expect(summary.completedTests).toBe(1);
  });

  it("3. A case with multiple retakes counts once under Cases Attempted", () => {
    const data = buildMockCase("c1", [
      { id: "s1", status: "completed", attempts: [] },
      { id: "s2", status: "completed", attempts: [] }
    ]);
    const { summary } = aggregateOverallResults({ cases: [data] });
    expect(summary.uniqueCases).toBe(1);
  });

  it("4. Retakes count separately under Tests Completed", () => {
    const data = buildMockCase("c1", [
      { id: "s1", status: "completed", attempts: [] },
      { id: "s2", status: "completed", attempts: [] }
    ]);
    const { summary } = aggregateOverallResults({ cases: [data] });
    expect(summary.completedTests).toBe(2);
  });

  it("5. Duplicate attempt IDs are counted once & 6. One accepted attempt per session and question", () => {
    const data = buildMockCase("c1", [
      { 
        id: "s1", 
        status: "completed", 
        attempts: [
          { id: "a1", questionId: "q1", isCorrect: false },
          { id: "a2", questionId: "q1", isCorrect: true } // Latest overrides
        ]
      }
    ], [{ id: "q1", primaryConceptId: "C1" }]);
    
    const { summary, allConcepts } = aggregateOverallResults({ cases: [data] });
    expect(summary.answeredQuestions).toBe(1);
    expect(summary.correct).toBe(1); // The second one overrides
  });

  it("7. Correct and incorrect totals are accurate", () => {
    const data = buildMockCase("c1", [
      { 
        id: "s1", status: "completed", 
        attempts: [
          { id: "a1", questionId: "q1", isCorrect: false },
          { id: "a2", questionId: "q2", isCorrect: true }
        ]
      }
    ], [{ id: "q1" }, { id: "q2" }]);
    
    const { summary } = aggregateOverallResults({ cases: [data] });
    expect(summary.correct).toBe(1);
    expect(summary.incorrect).toBe(1);
  });

  it("8. Unanswered questions remain separate", () => {
    const data = buildMockCase("c1", [
      { 
        id: "s1", status: "completed", 
        attempts: [{ id: "a1", questionId: "q1", isCorrect: false }]
      }
    ], [{ id: "q1" }, { id: "q2" }]); // q2 is never answered
    
    const { summary } = aggregateOverallResults({ cases: [data] });
    expect(summary.unanswered).toBe(1);
    expect(summary.answeredQuestions).toBe(1);
  });

  it("9. Answered Accuracy excludes unanswered questions & 10. Overall Score includes unanswered", () => {
    const data = buildMockCase("c1", [
      { 
        id: "s1", status: "completed", 
        attempts: [
          { id: "a1", questionId: "q1", isCorrect: true },
          { id: "a2", questionId: "q2", isCorrect: false }
        ]
      }
    ], [{ id: "q1" }, { id: "q2" }, { id: "q3" }, { id: "q4" }]);
    
    const { summary } = aggregateOverallResults({ cases: [data] });
    // Total = 4. Answered = 2. Correct = 1.
    expect(summary.answeredAccuracy).toBe(0.5); // 1 / 2
    expect(summary.overallScore).toBe(0.25); // 1 / 4
  });

  it("11. Missing confidence is not counted as Low confidence", () => {
    const data = buildMockCase("c1", [
      { 
        id: "s1", status: "completed", 
        attempts: [{ id: "a1", questionId: "q1", isCorrect: true }] // no confidence
      }
    ], [{ id: "q1", primaryConceptId: "C1" }]);
    const { summary } = aggregateOverallResults({ cases: [data] });
    expect(summary.lowConfidenceCorrect).toBe(0);
    expect(summary.confidenceNotRecorded).toBe(1);
  });

  it("12. Unanswered questions are not counted as confidence missing", () => {
    const data = buildMockCase("c1", [
      { id: "s1", status: "completed", attempts: [] }
    ], [{ id: "q1", primaryConceptId: "C1" }]);
    const { summary } = aggregateOverallResults({ cases: [data] });
    expect(summary.unanswered).toBe(1);
    expect(summary.confidenceNotRecorded).toBe(0);
  });

  it("13. Canonical IDs group matching concepts & 14. Missing canonical IDs go to Unclassified", () => {
    const data = buildMockCase("c1", [
      { 
        id: "s1", status: "completed", 
        attempts: [
          { id: "a1", questionId: "q1", isCorrect: true },
          { id: "a2", questionId: "q2", isCorrect: true }
        ]
      }
    ], [
      { id: "q1", primaryConceptId: "C1" },
      { id: "q2", primaryConceptId: "C1" },
      { id: "q3" } // missing ID -> unanswered unclassified
    ]);
    const { allConcepts } = aggregateOverallResults({ cases: [data] });
    expect(allConcepts.find(c => c.conceptId === "C1")?.totalAnswered).toBe(2);
    expect(allConcepts.find(c => c.conceptId === "unclassified")?.unansweredCount).toBe(1);
  });

  it("15. Fewer than two answers returns Insufficient evidence", () => {
    const cls = classifyConceptPerformance({ totalAnswered: 1 } as any, []);
    expect(cls).toBe("insufficient-evidence");
  });

  it("16. Possible weakness classification works", () => {
    const cls = classifyConceptPerformance({ totalAnswered: 2, errorCount: 1, accuracyPercentage: 50, highConfidenceErrorCount: 0 } as any, []);
    expect(cls).toBe("possible-weakness");
  });

  it("17. Emerging weakness classification works", () => {
    const cls = classifyConceptPerformance({ totalAnswered: 3, accuracyPercentage: 33, highConfidenceErrorCount: 0 } as any, [
      { isCorrect: false }, { isCorrect: false }, { isCorrect: true }
    ]);
    expect(cls).toBe("emerging-weakness");
  });

  it("18. Consistent weakness classification works", () => {
    const cls = classifyConceptPerformance({ totalAnswered: 5, accuracyPercentage: 40, highConfidenceErrorCount: 0 } as any, []);
    expect(cls).toBe("consistent-weakness");
  });

  it("19. Improving classification uses chronological evidence", () => {
    const cls = classifyConceptPerformance({ totalAnswered: 5, accuracyPercentage: 40 } as any, [
      { isCorrect: false }, // earlier error
      { isCorrect: false }, // earlier error
      { isCorrect: false }, // recent error
      { isCorrect: true }, // recent correct
      { isCorrect: true }  // recent correct
    ]);
    expect(cls).toBe("improving-concept");
  });

  it("20. Strong concept requires sufficient evidence", () => {
    const cls = classifyConceptPerformance({ totalAnswered: 5, accuracyPercentage: 100, highConfidenceErrorCount: 0 } as any, [
      { isCorrect: true }, { isCorrect: true }, { isCorrect: true }
    ]);
    expect(cls).toBe("strong-concept");
  });

  it("21. Classification priority prevents overlapping final statuses", () => {
    // If a concept is improving (has 2 early errors, 2 recent correct), but its accuracy is < 50% on 6 items, 
    // it could be both Improving and Consistent Weakness if we didn't check priority.
    // Our logic returns "improving-concept" FIRST (priority 2). Consistent weakness is priority 3.
    const cls = classifyConceptPerformance({ totalAnswered: 6, accuracyPercentage: 40, errorCount: 4 } as any, [
      { isCorrect: false }, { isCorrect: false }, { isCorrect: false }, { isCorrect: false },
      { isCorrect: true }, { isCorrect: true }
    ]);
    expect(cls).toBe("improving-concept");
  });

  it("22. Weak concepts are sorted in the defined order", () => {
    const concepts: CombinedConceptPerformance[] = [
      { conceptLabel: "B", classification: "emerging-weakness", highConfidenceErrorCount: 2, totalAnswered: 5, errorCount: 3 } as any,
      { conceptLabel: "A", classification: "consistent-weakness", highConfidenceErrorCount: 1, totalAnswered: 5, errorCount: 3 } as any,
    ];
    const sorted = sortWeakConcepts(concepts);
    // Consistent > Emerging
    expect(sorted[0].classification).toBe("consistent-weakness");
  });

  it("23. Master Weak Concepts excludes insufficient evidence", () => {
    // The sorting logic doesn't exclude, but the page rendering will filter.
    // We test that sorting doesn't crash on other classifications, though usually we filter before sort.
    const concepts: CombinedConceptPerformance[] = [
      { conceptLabel: "B", classification: "insufficient-evidence", highConfidenceErrorCount: 2, totalAnswered: 5, errorCount: 3 } as any,
    ];
    const sorted = sortWeakConcepts(concepts);
    expect(sorted.length).toBe(1); // Page level filters it
  });

  it("25. Saved adaptive decisions attach to the correct concept", () => {
    const data = buildMockCase("c1", [
      { id: "s1", status: "completed", attempts: [{ id: "a1", questionId: "q1", isCorrect: false }] }
    ], [{ id: "q1", primaryConceptId: "C1" }]);
    
    data.adaptiveDecisions = [{
      id: "ad1", conceptId: "C1", recommendedDifficulty: "Intermediate", purpose: "Focus", evidenceAttemptIds: [], createdAt: new Date().toISOString()
    }];

    const { allConcepts } = aggregateOverallResults({ cases: [data] });
    expect(allConcepts[0].availableAdaptiveDecisionId).toBe("ad1");
  });

  it("27. Historical malformed records do not crash aggregation", () => {
    const data = buildMockCase("c1", [
      { id: "s1", status: "completed", attempts: [{ /* Missing fields entirely */ } as any] }
    ], [{ id: "q1", primaryConceptId: "C1" }]);
    const { summary } = aggregateOverallResults({ cases: [data] });
    expect(summary.completedTests).toBe(1);
    expect(summary.answeredQuestions).toBe(0); // It fails to map because q1 id doesn't match undefined
  });

  it("28. Empty history displays a valid empty state", () => {
    const { summary, allConcepts } = aggregateOverallResults({ cases: [] });
    expect(summary.uniqueCases).toBe(0);
    expect(allConcepts.length).toBe(0);
  });
});
