import { 
  buildAdaptiveEvidence, 
  resolveCurrentDifficulty, 
  createAdaptiveDecisionKey, 
  decideNextDifficulty 
} from "../lib/adaptive/engine";
import { 
  QuestionAttempt, 
  McqQuestion, 
  PracticeSession, 
  AdaptiveDecision, 
  AdaptiveEvidence,
  DifficultyLevel
} from "../lib/store";

describe("Adaptive Difficulty Engine", () => {
  const baseQuestion: McqQuestion = {
    id: "q1",
    stem: "Test question",
    options: [],
    correctOptionId: "opt1",
    correctAnswerExplanation: "exp",
    caseEvidence: [],
    conceptTags: [],
    examStyle: "General",
    primaryConceptId: "concept.test",
    difficulty: "Intermediate",
  };

  const baseAttempt: QuestionAttempt = {
    id: "att1",
    questionId: "q1",
    selectedOptionId: "opt1",
    isCorrect: true,
    answeredAt: new Date().toISOString(),
    attemptNumber: 1,
  };

  describe("buildAdaptiveEvidence", () => {
    it("1. Missing concept ID excludes attempt", () => {
      const q = { ...baseQuestion, primaryConceptId: undefined };
      const evidence = buildAdaptiveEvidence({
        conceptId: "concept.test",
        attempts: [baseAttempt],
        questions: [q as any],
      });
      expect(evidence.length).toBe(0);
    });

    it("2. Duplicate attempt IDs are ignored", () => {
      const evidence = buildAdaptiveEvidence({
        conceptId: "concept.test",
        attempts: [baseAttempt, baseAttempt], // duplicate
        questions: [baseQuestion],
      });
      expect(evidence.length).toBe(1);
    });

    it("3. Evidence is ordered by submission time", () => {
      const a1 = { ...baseAttempt, id: "a1", answeredAt: "2023-01-01T10:00:00Z" };
      const a2 = { ...baseAttempt, id: "a2", answeredAt: "2023-01-01T09:00:00Z" }; // earlier
      
      const evidence = buildAdaptiveEvidence({
        conceptId: "concept.test",
        attempts: [a1, a2],
        questions: [baseQuestion],
      });
      expect(evidence[0].attemptId).toBe("a2");
      expect(evidence[1].attemptId).toBe("a1");
    });

    it("4. Only the latest five eligible attempts are used", () => {
      const attempts = Array.from({ length: 10 }).map((_, i) => ({
        ...baseAttempt,
        id: `att${i}`,
        answeredAt: `2023-01-01T10:0${i}:00Z`,
      }));
      const evidence = buildAdaptiveEvidence({
        conceptId: "concept.test",
        attempts,
        questions: [baseQuestion],
      });
      expect(evidence.length).toBe(5);
      expect(evidence[4].attemptId).toBe("att9"); // Latest
      expect(evidence[0].attemptId).toBe("att5"); // Oldest in slice
    });

    it("5. Unanswered attempts do not count as repeated incorrect", () => {
      const a1 = { ...baseAttempt, id: "a1", unanswered: true, isCorrect: false };
      const evidence = buildAdaptiveEvidence({
        conceptId: "concept.test",
        attempts: [a1],
        questions: [baseQuestion],
      });
      expect(evidence.length).toBe(0); // Eligible filter removes unanswered
    });
  });

  describe("decideNextDifficulty", () => {
    const makeEv = (isCorrect: boolean, difficulty: DifficultyLevel = "Intermediate", confidence?: "Low" | "Moderate" | "High", hintsUsed?: number, id: string = "a"): AdaptiveEvidence => ({
      attemptId: id,
      questionId: "q1",
      conceptId: "concept.test",
      difficulty,
      isCorrect,
      confidence,
      hintsUsed,
      submittedAt: new Date().toISOString(),
    });

    it("6. Fewer than two eligible attempts returns insufficient evidence", () => {
      const res = decideNextDifficulty({
        conceptId: "concept.test",
        currentDifficulty: "Intermediate",
        evidence: [makeEv(false)],
      });
      expect(res.decision).toBe("maintain");
      expect(res.reasonCode).toBe("insufficient-evidence");
    });

    it("7. Repeated high-confidence errors decrease one level", () => {
      const ev1 = makeEv(false, "Intermediate", "High", 0, "1");
      const ev2 = makeEv(false, "Intermediate", "High", 0, "2");
      const res = decideNextDifficulty({
        conceptId: "concept.test",
        currentDifficulty: "Intermediate",
        evidence: [ev1, ev2],
      });
      expect(res.decision).toBe("decrease");
      expect(res.recommendedDifficulty).toBe("Basic");
      expect(res.reasonCode).toBe("repeated-high-confidence-error");
    });

    it("8. Repeated high-confidence errors at Basic maintain Basic", () => {
      const ev1 = makeEv(false, "Basic", "High", 0, "1");
      const ev2 = makeEv(false, "Basic", "High", 0, "2");
      const res = decideNextDifficulty({
        conceptId: "concept.test",
        currentDifficulty: "Basic",
        evidence: [ev1, ev2],
      });
      expect(res.decision).toBe("maintain");
      expect(res.recommendedDifficulty).toBe("Basic");
      expect(res.reasonCode).toBe("repeated-high-confidence-error");
    });

    it("9. Repeated ordinary errors decrease one level", () => {
      const ev1 = makeEv(false, "Intermediate", undefined, 0, "1");
      const ev2 = makeEv(false, "Intermediate", undefined, 0, "2");
      const res = decideNextDifficulty({
        conceptId: "concept.test",
        currentDifficulty: "Intermediate",
        evidence: [ev1, ev2],
      });
      expect(res.decision).toBe("decrease");
      expect(res.recommendedDifficulty).toBe("Basic");
      expect(res.reasonCode).toBe("repeated-incorrect");
    });

    it("10. Repeated ordinary errors at Basic return difficulty floor", () => {
      const ev1 = makeEv(false, "Basic", undefined, 0, "1");
      const ev2 = makeEv(false, "Basic", undefined, 0, "2");
      const res = decideNextDifficulty({
        conceptId: "concept.test",
        currentDifficulty: "Basic",
        evidence: [ev1, ev2],
      });
      expect(res.decision).toBe("maintain");
      expect(res.reasonCode).toBe("difficulty-floor");
    });

    it("11. A single high-confidence error maintains difficulty", () => {
      const ev1 = makeEv(true, "Intermediate", "High", 0, "1");
      const ev2 = makeEv(false, "Intermediate", "High", 0, "2"); // Only latest is error
      const res = decideNextDifficulty({
        conceptId: "concept.test",
        currentDifficulty: "Intermediate",
        evidence: [ev1, ev2],
      });
      expect(res.decision).toBe("maintain");
      expect(res.reasonCode).toBe("high-confidence-error");
    });

    it("12. Correct with low confidence blocks progression", () => {
      const ev1 = makeEv(true, "Intermediate", "Low", 0, "1");
      const ev2 = makeEv(true, "Intermediate", "Low", 0, "2");
      const ev3 = makeEv(true, "Intermediate", "Low", 0, "3");
      const res = decideNextDifficulty({
        conceptId: "concept.test",
        currentDifficulty: "Intermediate",
        evidence: [ev1, ev2, ev3], // Rule 5: Correct with low confidence (priority over 7)
      });
      expect(res.decision).toBe("maintain");
      expect(res.reasonCode).toBe("correct-low-confidence");
    });

    it("13. Correct with hints blocks progression", () => {
      const ev1 = makeEv(true, "Intermediate", "High", 1, "1");
      const ev2 = makeEv(true, "Intermediate", "High", 1, "2");
      const ev3 = makeEv(true, "Intermediate", "High", 1, "3");
      const res = decideNextDifficulty({
        conceptId: "concept.test",
        currentDifficulty: "Intermediate",
        evidence: [ev1, ev2, ev3],
      });
      expect(res.decision).toBe("maintain");
      expect(res.reasonCode).toBe("correct-with-hints");
    });

    it("14. Missing hints do not count as zero hints", () => {
      const ev1 = makeEv(true, "Intermediate", "High", undefined as any, "1");
      const ev2 = makeEv(true, "Intermediate", "High", undefined as any, "2");
      const ev3 = makeEv(true, "Intermediate", "High", undefined as any, "3");
      const res = decideNextDifficulty({
        conceptId: "concept.test",
        currentDifficulty: "Intermediate",
        evidence: [ev1, ev2, ev3],
      });
      expect(res.decision).toBe("maintain");
      expect(res.reasonCode).toBe("mixed-evidence"); // falls through to mixed evidence because noHints fails
    });

    it("15. Three qualifying independent correct answers increase one level", () => {
      const ev1 = makeEv(true, "Basic", "High", 0, "1");
      const ev2 = makeEv(true, "Basic", "Moderate", 0, "2");
      const ev3 = makeEv(true, "Basic", "High", 0, "3");
      const res = decideNextDifficulty({
        conceptId: "concept.test",
        currentDifficulty: "Basic",
        evidence: [ev1, ev2, ev3],
      });
      expect(res.decision).toBe("increase");
      expect(res.recommendedDifficulty).toBe("Intermediate");
      expect(res.reasonCode).toBe("repeated-correct");
    });

    it("16. Three low-confidence correct answers do not increase difficulty", () => {
      // Already tested in 12
      const ev1 = makeEv(true, "Basic", "Low", 0, "1");
      const ev2 = makeEv(true, "Basic", "Low", 0, "2");
      const ev3 = makeEv(true, "Basic", "Low", 0, "3");
      const res = decideNextDifficulty({
        conceptId: "concept.test",
        currentDifficulty: "Basic",
        evidence: [ev1, ev2, ev3],
      });
      expect(res.decision).toBe("maintain");
      expect(res.reasonCode).toBe("correct-low-confidence"); // Rule 5 catches it first
    });

    it("17. Three hinted correct answers do not increase difficulty", () => {
      // Already tested in 13
      const ev1 = makeEv(true, "Basic", "High", 1, "1");
      const ev2 = makeEv(true, "Basic", "High", 1, "2");
      const ev3 = makeEv(true, "Basic", "High", 1, "3");
      const res = decideNextDifficulty({
        conceptId: "concept.test",
        currentDifficulty: "Basic",
        evidence: [ev1, ev2, ev3],
      });
      expect(res.decision).toBe("maintain");
      expect(res.reasonCode).toBe("correct-with-hints");
    });

    it("18. Forced-timeout correct answers do not qualify for progression", () => {
      const ev1 = makeEv(true, "Basic", "High", 0, "1");
      const ev2 = makeEv(true, "Basic", "High", 0, "2");
      const ev3 = makeEv(true, "Basic", "High", 0, "3");
      ev3.submissionReason = "question-time-expired";
      const res = decideNextDifficulty({
        conceptId: "concept.test",
        currentDifficulty: "Basic",
        evidence: [ev1, ev2, ev3],
      });
      expect(res.decision).toBe("maintain");
      expect(res.reasonCode).toBe("mixed-evidence"); // falls through
    });

    it("19. Basic never jumps directly to Advanced", () => {
      const ev1 = makeEv(true, "Basic", "High", 0, "1");
      const ev2 = makeEv(true, "Basic", "High", 0, "2");
      const ev3 = makeEv(true, "Basic", "High", 0, "3");
      const res = decideNextDifficulty({
        conceptId: "concept.test",
        currentDifficulty: "Basic",
        evidence: [ev1, ev2, ev3],
      });
      expect(res.recommendedDifficulty).toBe("Intermediate"); // Not Advanced
    });

    it("20. Advanced never increases beyond Advanced", () => {
      const ev1 = makeEv(true, "Advanced", "High", 0, "1");
      const ev2 = makeEv(true, "Advanced", "High", 0, "2");
      const ev3 = makeEv(true, "Advanced", "High", 0, "3");
      const res = decideNextDifficulty({
        conceptId: "concept.test",
        currentDifficulty: "Advanced",
        evidence: [ev1, ev2, ev3],
      });
      expect(res.decision).toBe("maintain");
      expect(res.reasonCode).toBe("difficulty-ceiling");
    });

    it("33. Incorrect attempts from different difficulty levels do not trigger repeated-incorrect reduction", () => {
      const ev1 = makeEv(false, "Basic", undefined, 0, "1");
      const ev2 = makeEv(false, "Intermediate", undefined, 0, "2");
      const res = decideNextDifficulty({
        conceptId: "concept.test",
        currentDifficulty: "Intermediate",
        evidence: [ev1, ev2],
      });
      // Falls through to mixed because allSameDifficulty fails
      expect(res.decision).toBe("maintain");
      expect(res.reasonCode).toBe("mixed-evidence");
    });
  });

  describe("createAdaptiveDecisionKey", () => {
    it("21. Identical ordered evidence produces the same decision key", () => {
      const key1 = createAdaptiveDecisionKey({
        conceptId: "test", currentDifficulty: "Basic", orderedAttemptIds: ["1", "2"], ruleVersion: 1
      });
      const key2 = createAdaptiveDecisionKey({
        conceptId: "test", currentDifficulty: "Basic", orderedAttemptIds: ["1", "2"], ruleVersion: 1
      });
      expect(key1).toBe(key2);
    });

    it("22. Changed evidence produces a new decision key", () => {
      const key1 = createAdaptiveDecisionKey({
        conceptId: "test", currentDifficulty: "Basic", orderedAttemptIds: ["1", "2"], ruleVersion: 1
      });
      const key2 = createAdaptiveDecisionKey({
        conceptId: "test", currentDifficulty: "Basic", orderedAttemptIds: ["2", "1"], ruleVersion: 1
      });
      expect(key1).not.toBe(key2);
    });
  });

  describe("resolveCurrentDifficulty", () => {
    const makeSession = (status: "completed" | "in-progress", conceptId: string, diff: DifficultyLevel): PracticeSession => ({
      id: "s1", status, adaptiveContext: { conceptId, targetDifficulty: diff, sourceDecisionId: "d1", questionPurpose: "standard" }
    } as any);
    
    const makeDecision = (id: string, conceptId: string, diff: DifficultyLevel): AdaptiveDecision => ({
      id, conceptId, recommendedDifficulty: diff, createdAt: new Date().toISOString()
    } as any);

    it("31. An unapplied saved recommendation does not become current difficulty", () => {
      const d = makeDecision("d2", "concept.test", "Advanced"); // Not applied
      const res = resolveCurrentDifficulty({
        conceptId: "concept.test",
        completedSessions: [],
        savedDecisions: [d],
        evidence: [],
      });
      expect(res).toBeNull();
    });

    it("32. An applied adaptive decision may become current difficulty", () => {
      const d = makeDecision("d1", "concept.test", "Intermediate"); // ID matches sourceDecisionId
      const s = makeSession("in-progress", "concept.test", "Intermediate"); // in-progress means it's applied
      const res = resolveCurrentDifficulty({
        conceptId: "concept.test",
        completedSessions: [s],
        savedDecisions: [d],
        evidence: [],
      });
      expect(res).toBe("Intermediate");
    });
  });

  // Tests 23-30, 34-37 are integration/API/store layer tests
  // We document them here as stubs to be implemented in integration testing or UI testing layers
  it.todo("23. Results rendering creates no new decision");
  it.todo("24. Generation failure creates no question set or session");
  it.todo("25. Adaptive review always creates a Learning Mode session");
  it.todo("26. Wrong concept generated by AI is rejected");
  it.todo("27. Wrong difficulty metadata is rejected");
  it.todo("28. Wrong question count is rejected");
  it.todo("29. Duplicate question stems are rejected");
  it.todo("30. Retrying the same request returns the existing adaptive session");
  it.todo("34. Reopening Results does not create a new adaptive decision");
  it.todo("35. A new level change requires at least one newly completed eligible attempt");
  it.todo("36. Client-side repeated adaptive-session creation returns the existing session");
  it.todo("37. Duplicate button clicks produce only one generation request while the first is in progress");
});
