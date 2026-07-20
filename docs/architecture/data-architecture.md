# Scalable Data Architecture Plan

## 1. Executive Summary

CaseLens AI currently relies on Zustand with a `localStorage` persistence layer to manage all application state. While sufficient for early prototyping, this approach stores the entire global state (including massive markdown strings, thousands of questions, and all historical attempts) inside a single, deeply nested, monolithic JSON blob.

This monolithic architecture is rapidly approaching the browser's ~5MB `localStorage` hard limit. Additionally, every time a user answers a question, the application is forced to perform an `O(N)` operation across the entire history just to serialize and save one tiny object update, leading to severe UI stutter and blocking the main thread.

To resolve this, CaseLens AI will execute the **Phase-2 IndexedDB Normalization Plan**. This will transition the application to an asynchronous, relational `O(1)` object store architecture.

---

## 2. Core Architectural Shifts

### 1. IndexedDB via Dexie.js
We will introduce [Dexie.js](https://dexie.org/) as the primary database wrapper for IndexedDB. This allows for asynchronous, indexed, record-level reads and writes, bypassing the synchronous main-thread blocking nature of `localStorage`.

### 2. State Normalization
Instead of deeply nested documents (e.g., `Session -> Attempts -> Question Analysis`), data will be normalized into flat relational tables linked by stable UUID foreign keys.

### 3. Ephemeral Zustand
Zustand will be stripped of its persistence duties for heavy domain data. It will be reserved strictly for ephemeral UI state (e.g., loading spinners, active modals, active navigation state) and temporary caching of the *active* session.

---

## 3. Proposed Object Stores (Tables)

The IndexedDB schema will be heavily normalized to support targeted, rapid updates.

### Core Domain
- `cases`: Core metadata for a clinical case.
- `case_contents`: Heavy markdown strings, findings, and case texts (separated to keep `cases` queries fast).

### Questions & Practice
- `question_sets`: Groupings of questions generated for a specific case.
- `questions`: Immutable individual MCQ data (stem, options, correct answers).
- `practice_sessions`: High-level session tracking (mode, timer, status).
- `question_attempts`: Immutable records of a learner's submission (selected option, time taken, confidence).
- `question_review_snapshots`: Stored, attempt-specific feedback and explanations.

### Advanced Learning Features
- `differential_drafts`: Learner's work-in-progress DDx builder state.
- `differential_submissions`: Completed, scored DDx evaluations.
- `progressive_sessions`: Tracking state for staged case reveals.
- `progressive_responses`: Learner answers at specific stages of a case.

### Analytics & Sync
- `adaptive_decisions`: Recorded metrics tracking learner weaknesses.
- `revision_items`: Flashcards or high-priority items generated for future study.
- `sync_outbox`: (Future) Queue of local mutations pending cloud synchronization.
- `sync_metadata`: (Future) Timestamps and conflict-resolution records.
- `application_settings`: User preferences (e.g., dark mode, default practice mode).

---

## 4. Example Schema Implementation

```typescript
import Dexie, { Table } from 'dexie';

export class CaseLensDB extends Dexie {
  cases!: Table<Case, 'id'>;
  questions!: Table<McqQuestion, 'id'>;
  practice_sessions!: Table<PracticeSession, 'id'>;
  question_attempts!: Table<QuestionAttempt, 'id'>;

  constructor() {
    super('CaseLensDB');
    this.version(1).stores({
      cases: 'id, createdAt, title',
      questions: 'id, caseId, conceptId',
      practice_sessions: 'id, caseId, status, startedAt',
      // Compound indices for fast lookup of a specific attempt
      question_attempts: 'id, sessionId, questionId, [sessionId+questionId]' 
    });
  }
}

export const db = new CaseLensDB();
```

---

## 5. Safe Migration Strategy

Transitioning a live local database requires extreme care. The old persisted state must never be deleted until the new data has been completely verified.

**The sequence will be:**
1. **Repository Pattern:** Introduce repository interfaces (e.g., `SessionRepository`) to decouple the UI from direct Zustand data access.
2. **Dexie Integration:** Install and configure Dexie.js alongside the existing system without changing page behavior.
3. **Data Hydration (One-way Sync):** On app startup, read the legacy Zustand-persisted JSON. If legacy data exists and IndexedDB is empty, run a normalization script to extract and push records into IndexedDB.
4. **Verification Check:** Compare entity counts between the legacy blob and IndexedDB stores.
5. **Switch Reads:** Update the repository interfaces to read primarily from IndexedDB.
6. **Dual Writes (Temporary):** Write updates to both IndexedDB and the legacy Zustand tree temporarily to preserve a rollback path.
7. **Verification Period:** Monitor application stability.
8. **Deprecation:** Stop dual-writes. Finally, remove the legacy `localStorage` persistence layer entirely only after a safe, verified checkpoint.

---

## 6. Cloud Sync Considerations (Phase 3)

By migrating to IndexedDB first, we lay the exact groundwork needed for future cloud synchronization.
With data flattened into tables, we can easily implement a **Local-First architecture**:
- The UI reads/writes instantly to IndexedDB.
- A background worker observes changes, pushes them to the `sync_outbox` table, and securely synchronizes them with a remote backend (e.g., Supabase or a custom REST API).
