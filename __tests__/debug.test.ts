import { useCaseStore } from "../lib/store";

describe("debug", () => {
  it("debug", () => {
    const { addCase, createPracticeSession, startPracticeSession, completePracticeSession } = useCaseStore.getState();
    addCase({
      id: "retake-case",
      title: "Retake Case",
      content: "Content",
      createdAt: Date.now(),
      questions: []
    });

    const s1 = createPracticeSession("retake-case", "learning", { mode: "none" });
    console.log("s1 ID:", s1);
    
    startPracticeSession("retake-case", s1);
    let state = useCaseStore.getState();
    console.log("After start, s1 status:", state.cases.find(c => c.id === "retake-case")!.practiceSessions![0].status);
    
    completePracticeSession("retake-case", s1, "user-ended-session");
    state = useCaseStore.getState();
    console.log("After complete, s1 status:", state.cases.find(c => c.id === "retake-case")!.practiceSessions![0].status);
    
    const s2 = createPracticeSession("retake-case", "exam", { mode: "per-question", secondsPerQuestion: 30 });
    state = useCaseStore.getState();
    console.log("After s2, s1 status:", state.cases.find(c => c.id === "retake-case")!.practiceSessions![0].status);
  });
});
