import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type AnswerOption = {
  id: string;
  label: "A" | "B" | "C" | "D" | "E";
  text: string;
  isCorrect: boolean;
  explanation: string;
  misconception?: string;
  evidenceAgainst?: string[];
  whenItCouldBeCorrect?: string;
};

export type ConceptTag = {
  subject: string;
  topic: string;
  subtopic?: string;
  conceptId: string;
  conceptName: string;
  reasoningSkill?: string;
  cognitiveLevel?: "Recall" | "Understanding" | "Application" | "Analysis";
};

export type McqQuestion = {
  id: string;
  stem: string;
  options: AnswerOption[];
  correctOptionId: string;
  correctAnswerExplanation: string;
  caseEvidence: string[];
  reasoningSteps: string[];
  highYieldTakeaway: string;
  commonTrap?: string;
  memoryAid?: string;
  conceptTags: ConceptTag[];
  difficulty: "Basic" | "Intermediate" | "Advanced";
  examStyle: "General" | "NRE" | "USMLE" | "PLAB" | "MRCP";
};

export type QuestionAttempt = {
  questionId: string;
  selectedOptionId: string | null;
  isCorrect: boolean;
  answeredAt: string;
  attemptNumber: number;
  probableErrorType?: string;
  probableKnowledgeGap?: string;
  confidence?: "Low" | "Moderate" | "High";
};

export type ConceptPerformance = {
  conceptId: string;
  conceptName: string;
  subject: string;
  attempts: number;
  correct: number;
  incorrect: number;
  accuracy: number;
  weaknessScore: number;
  classification:
    | "Possible weakness"
    | "Emerging weakness"
    | "Consistent weakness"
    | "Improving concept"
    | "Strong concept"
    | "Insufficient evidence";
  confidence: "Low" | "Moderate" | "High";
  evidence: string[];
  likelyMisconceptions: string[];
  lastUpdatedAt: string;
};

export type StudyMaterial = {
  id: string;
  caseId: string;
  conceptId: string;
  conceptName: string;
  depth: "Quick" | "Standard" | "Deep";
  whySelected: string;
  objectives: string[];
  coreExplanation: string;
  clinicalRelevance: string;
  keyFacts: string[];
  comparisonTable?: {
    headers: string[];
    rows: string[][];
  };
  reasoningApproach: string[];
  commonMistakes: string[];
  examTraps: string[];
  memoryAid?: string;
  workedExample?: {
    case: string;
    reasoning: string[];
    answer: string;
  };
  rapidReview: string[];
  selfCheckQuestions: {
    question: string;
    answer: string;
  }[];
  focusedMcqs: McqQuestion[];
  generatedAt: string;
};

// Legacy support for older cases
export type LegacyOption = {
  id: string;
  text: string;
  isCorrect: boolean;
};

export type LegacyQuestion = {
  id: string;
  text: string;
  options: LegacyOption[];
};

export type CaseStudy = {
  id: string;
  title: string;
  content: string;
  analysis?: string;
  
  // Legacy fields
  questions?: LegacyQuestion[]; 
  
  // New unified fields
  mcqs?: McqQuestion[];
  attempts?: QuestionAttempt[];
  studyMaterials?: StudyMaterial[];

  answers?: Record<string, string>; // questionId -> optionId
  score?: number;
  createdAt: number;
};

interface CaseStore {
  cases: CaseStudy[];
  conceptPerformances: Record<string, ConceptPerformance>;
  globalAnalysis: string | null;
  
  addCase: (caseStudy: CaseStudy) => void;
  updateCase: (id: string, updates: Partial<CaseStudy>) => void;
  deleteCase: (id: string) => void;
  clearAllCases: () => void;
  
  updateConceptPerformance: (performance: ConceptPerformance) => void;
  setConceptPerformances: (performances: Record<string, ConceptPerformance>) => void;
  setGlobalAnalysis: (analysis: string | null) => void;
}

export const useCaseStore = create<CaseStore>()(
  persist(
    (set) => ({
      cases: [],
      conceptPerformances: {},
      globalAnalysis: null,
      
      addCase: (caseStudy) =>
        set((state) => ({ cases: [caseStudy, ...state.cases] })),
        
      updateCase: (id, updates) =>
        set((state) => ({
          cases: state.cases.map((c) =>
            c.id === id ? { ...c, ...updates } : c
          ),
        })),
        
      deleteCase: (id) =>
        set((state) => ({
          cases: state.cases.filter((c) => c.id !== id),
        })),
        
      clearAllCases: () => set({ cases: [], conceptPerformances: {} }),
      
      updateConceptPerformance: (performance) => 
        set((state) => ({
          conceptPerformances: {
            ...state.conceptPerformances,
            [performance.conceptId]: performance
          }
        })),
        
      setConceptPerformances: (performances) =>
        set(() => ({ conceptPerformances: performances })),
        
      setGlobalAnalysis: (analysis) =>
        set(() => ({ globalAnalysis: analysis })),
    }),
    {
      name: "caselens-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
