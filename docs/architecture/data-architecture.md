# CaseLens AI Data Architecture

## Purpose

This document defines the current and target data architecture for CaseLens AI.

It explains:

- What information the platform stores
- Which system owns each type of data
- How records relate to one another
- How historical learning records remain stable
- How browser-local storage will migrate to normalized storage
- How future cloud synchronization may work
- How medical books, pages, figures, and citations will be represented
- How AI-generated content remains traceable to its source material
- How privacy, security, performance, and data integrity are protected

This document is architectural guidance.

Features described as future or proposed must not be presented as already implemented.

---

## Architecture Status

### Current implementation

The current prototype uses:

- Zustand for application state
- Zustand persistence
- Browser `localStorage`
- Next.js API routes
- Groq for educational content generation
- Local deterministic scoring and analytics
- No authentication
- No cloud database
- No cross-device synchronization
- No medical-resource database

### Approved target direction

The target architecture separates:

- Temporary UI state
- Offline local data
- Cloud records
- Medical knowledge resources
- Generated educational content
- Learner activity
- Derived analytics
- Files and images
- Synchronization metadata

Target components may include:

- Zustand for temporary UI state
- Dexie over IndexedDB for local persistence
- PostgreSQL for canonical cloud records
- Object storage for PDFs and images
- Background jobs for extraction and indexing
- Full-text and semantic retrieval
- Source-grounded AI generation

---

## Architectural Goals

The data architecture must support:

1. Reliable local-first practice
2. Fast question submission
3. Historical record preservation
4. Retakes without overwriting previous attempts
5. Immutable question-set versions
6. Exact question-review consistency
7. Offline use
8. Future multi-device synchronization
9. Medical book and figure ingestion
10. Source-grounded question generation
11. Citations and provenance
12. Deterministic learning analytics
13. Controlled data migrations
14. Large case and question histories
15. Secure separation of learner and knowledge data

---

## Non-Goals

This architecture does not currently provide:

- Electronic health record integration
- Patient record management
- Clinical diagnosis
- Medical-device functionality
- Real-time collaborative editing
- Secure examination or proctoring
- Public redistribution rights for copyrighted textbooks
- Automatic medical approval of AI-extracted content

---

## Core Architectural Principles

### 1. Separate data by responsibility

Do not store every data type inside one global object.

Separate:

- UI state
- Domain records
- Generated content
- User activity
- Medical resources
- Analytics
- Files
- Synchronization records

### 2. Keep authoritative and derived data distinct

Authoritative data includes:

- Original case input
- Submitted answer
- Confidence selection
- Session mode
- Timer configuration
- Question content
- Source book page
- Human review decision

Derived data includes:

- Score
- Accuracy percentage
- Confidence distribution
- Weak-concept classification
- Adaptive recommendation
- Performance summary

Derived data should usually be recalculable from authoritative records.

Store a derived snapshot only when historical consistency or performance requires it.

### 3. Preserve history

Completed records should not be silently rewritten.

Examples:

- Completed attempts remain unchanged
- Completed sessions remain unchanged
- Old reports keep their original question version
- Retakes create new sessions
- New AI generations create new versions
- New review algorithms do not rewrite old review snapshots

### 4. Use stable identifiers

Every persistent record should have a stable ID.

Do not use array position as permanent identity.

Recommended format:

```text
UUID or another collision-resistant globally unique identifier
```

### 5. Make writes idempotent

Repeated submission of the same operation must not create duplicates.

This applies to:

* Answer submission
* Session completion
* AI generation
* Review creation
* Adaptive decisions
* Synchronization events
* Migration steps

### 6. AI does not own application truth

AI may generate educational content.

AI must not control:

* Persistent identity
* Scoring
* Timer expiry
* Attempt uniqueness
* Authorization
* Storage state
* Session status
* Sync conflict resolution
* Adaptive decision rules

---

## Data Domains

CaseLens data is divided into the following domains.

### Application State Domain

Temporary interface data.

Examples:

* Current route state
* Open modal
* Loading status
* Selected tab
* Current question index
* Unsaved text input
* Temporary filters
* Toast notifications

Primary storage:

```text
Zustand memory
```

Persistent storage should be used only when the state genuinely needs to survive refresh.

---

### Learning Domain

Learner-facing educational activity.

Includes:

* Cases
* Case versions
* Case analyses
* Question sets
* Questions
* Answer options
* Practice sessions
* Attempts
* Confidence ratings
* Review snapshots
* Differential submissions
* Progressive reasoning
* Adaptive decisions
* Revision items

---

### Knowledge Domain

Authoritative educational resources.

Includes:

* Books
* Editions
* Chapters
* Pages
* Figures
* Tables
* Extracted text
* Medical concepts
* Source chunks
* Citations
* Embeddings
* Review status
* Licensing metadata

---

### AI Generation Domain

Records how educational content was produced.

Includes:

* Generation request
* Generation type
* Prompt version
* Model identifier
* Schema version
* Input references
* Output references
* Validation result
* Retry count
* Token usage
* Generation status
* Error information

---

### Analytics Domain

Derived learner and platform summaries.

Includes:

* Score summaries
* Concept performance
* Confidence calibration
* Difficulty progression
* Revision priority
* Session summaries
* Usage metrics

Analytics must not replace authoritative attempt records.

---

### File Domain

Binary objects and their metadata.

Includes:

* PDF files
* Page images
* Figure crops
* Thumbnails
* Generated reports
* Uploaded resources
* Licence documents

Binary data belongs in object storage or IndexedDB blobs, not inside large JSON records.

---

## Current Data Flow

```text
Learner enters case
↓
Case saved in Zustand
↓
Zustand persisted to localStorage
↓
Browser calls Next.js API
↓
API validates request
↓
API calls Groq
↓
AI response is parsed and validated
↓
Generated analysis or MCQs returned
↓
Data added to Zustand state
↓
Entire persisted state serialized again
```

### Current limitations

* Entire application state is serialized together
* Large generated explanations increase storage rapidly
* Deep nested updates require array mapping
* `localStorage` writes are synchronous
* Storage quota is implementation-dependent and limited
* No record-level query support
* No transactional multi-record writes
* No built-in migration history
* No cloud backup
* No cross-device access

---

## Target Storage Layers

```text
Zustand
└── Temporary UI state

Dexie / IndexedDB
├── Local cases
├── Local sessions
├── Local attempts
├── Offline question sets
├── Drafts
├── Cached resource metadata
├── Pending sync events
└── Local settings

Cloud database
├── Canonical learning records
├── User records
├── Question sets
├── Medical resource metadata
├── Citation relationships
├── Audit metadata
└── Sync versions

Object storage
├── Medical books
├── Page images
├── Figures
├── Tables
├── Thumbnails
└── Generated exports
```

---

## Ownership of Data

| Data type             | Current owner         | Target owner                 |
| --------------------- | --------------------- | ---------------------------- |
| Open modal            | Zustand               | Zustand                      |
| Active question index | Zustand               | Zustand                      |
| Unsaved draft         | Zustand/local storage | IndexedDB                    |
| Case metadata         | Zustand/localStorage  | IndexedDB and cloud database |
| Case analysis         | Zustand/localStorage  | IndexedDB and cloud database |
| Questions             | Zustand/localStorage  | IndexedDB and cloud database |
| Attempts              | Zustand/localStorage  | IndexedDB and cloud database |
| Book PDF              | Not implemented       | Object storage               |
| Resource metadata     | Not implemented       | Cloud database               |
| Page images           | Not implemented       | Object storage               |
| Source chunks         | Not implemented       | Cloud database               |
| Embeddings            | Not implemented       | Vector-enabled database      |
| Sync queue            | Not implemented       | IndexedDB                    |
| Analytics             | Local calculation     | Local and server-derived     |

---

## Core Entity Relationships

```text
Case
├── CaseVersion
│   └── CaseAnalysis
│
├── QuestionSet
│   ├── Question
│   │   └── AnswerOption
│   │
│   └── PracticeSession
│       ├── QuestionAttempt
│       └── QuestionReviewSnapshot
│
├── DifferentialSubmission
├── ProgressiveReasoningSession
└── AdaptiveDecision
```

Medical knowledge relationships:

```text
MedicalResource
└── ResourceEdition
    ├── ResourceFile
    ├── ResourceChapter
    ├── ResourcePage
    │   ├── ResourceFigure
    │   └── ResourceTable
    │
    └── ResourceChunk
        ├── ConceptLink
        ├── Embedding
        └── CitationReference
```

Generated content relationships:

```text
AIGeneration
├── PromptVersion
├── InputReference
├── OutputReference
├── SourceEvidence
└── ValidationResult
```

---

## Learning Data Model

### Case

Represents one educational case workspace.

```ts
interface CaseRecord {
  id: string;
  title: string;

  status:
    | "draft"
    | "generating"
    | "ready"
    | "failed"
    | "archived";

  difficulty: DifficultyLevel;
  examStyle: ExamStyle;
  requestedQuestionCount: 3 | 5 | 10;

  createdAt: string;
  updatedAt: string;
  deletedAt?: string;

  schemaVersion: number;
}
```

---

### Case Version

Stores the exact submitted case text at a point in time.

```ts
interface CaseVersionRecord {
  id: string;
  caseId: string;
  version: number;

  caseText: string;
  contentHash: string;

  createdAt: string;
}
```

If case text changes after analysis or question generation, create a new version.

Do not silently attach old generated content to edited case text.

---

### Case Analysis

```ts
interface CaseAnalysisRecord {
  id: string;
  caseId: string;
  caseVersionId: string;

  generationId: string;

  status:
    | "pending"
    | "complete"
    | "failed";

  structuredContent: CaseAnalysisContent;

  createdAt: string;
  schemaVersion: number;
}
```

---

### Question Set

A question set must remain immutable after practice begins.

```ts
interface QuestionSetRecord {
  id: string;
  caseId: string;
  caseVersionId: string;
  analysisId?: string;

  version: number;
  difficulty: DifficultyLevel;
  examStyle: ExamStyle;
  questionCount: number;

  generationId: string;

  status:
    | "draft"
    | "ready"
    | "retired";

  createdAt: string;
}
```

---

### Question

```ts
interface QuestionRecord {
  id: string;
  questionSetId: string;
  position: number;

  stem: string;
  correctOptionId: string;

  correctExplanation: string;
  decisiveClue?: {
    finding: string;
    explanation: string;
  };

  reasoningFramework?: string[];
  highYieldTakeaway?: string;

  primaryConceptId?: string;
  primaryConceptLabel?: string;
  secondaryConceptIds?: string[];

  difficulty?: DifficultyLevel;
  adaptivePurpose?: AdaptiveQuestionPurpose;

  createdAt: string;
}
```

---

### Answer Option

```ts
interface AnswerOptionRecord {
  id: string;
  questionId: string;
  position: number;

  label: string;
  text: string;

  isCorrect: boolean;
  explanation: string;

  misconception?: string;
  whenItCouldBeCorrect?: string;
}
```

Exactly one option must be correct.

---

### Practice Session

```ts
interface PracticeSessionRecord {
  id: string;
  caseId: string;
  questionSetId: string;

  mode:
    | "learning"
    | "exam";

  purpose:
    | "standard"
    | "retake"
    | "adaptive-review"
    | "weak-concept-review";

  status:
    | "not-started"
    | "in-progress"
    | "completed"
    | "expired"
    | "abandoned";

  timerMode:
    | "none"
    | "per-question"
    | "total";

  startedAt?: string;
  expiresAt?: string;
  completedAt?: string;

  completionReason?: string;

  createdAt: string;
  schemaVersion: number;
}
```

---

### Question Attempt

```ts
interface QuestionAttemptRecord {
  id: string;
  sessionId: string;
  questionId: string;

  selectedOptionId?: string;
  confidence?: ConfidenceLevel;

  isCorrect: boolean;
  unanswered: boolean;

  hintsUsed?: number;
  timeSpentSeconds?: number;

  submissionReason:
    | "manual"
    | "question-timeout"
    | "total-timeout"
    | "finished-early";

  submittedAt: string;

  idempotencyKey: string;
}
```

Recommended uniqueness rule:

```text
One accepted attempt per session and question
```

Possible compound unique key:

```text
[sessionId + questionId]
```

---

### Question Review Snapshot

Generated educational explanations should remain on the immutable question.

The review snapshot stores attempt-specific interpretation that must remain historically stable.

```ts
interface QuestionReviewSnapshotRecord {
  id: string;
  attemptId: string;
  questionId: string;

  confidenceInsight?: string;
  probableErrorType?: ErrorType;

  conceptImpact?: ConceptImpactSnapshot;
  adaptiveDecisionId?: string;

  reviewRuleVersion: number;
  createdAt: string;
}
```

Rendered review:

```text
Question
+
Answer options
+
Attempt
+
Review snapshot
=
Question review card
```

---

### Differential Submission

```ts
interface DifferentialSubmissionRecord {
  id: string;
  caseId: string;
  caseVersionId: string;

  mostLikelyInterpretation: string;
  alternativeOne?: string;
  alternativeTwo?: string;

  supportingFindings: string[];
  opposingFindings: string[];

  mostInfluentialFinding?: string;
  reasoningNote?: string;
  confidence?: ConfidenceLevel;

  submittedAt: string;
}
```

A submitted differential should be immutable.

Drafts must be stored separately.

---

### Progressive Reasoning Session

```ts
interface ProgressiveSessionRecord {
  id: string;
  caseId: string;
  caseVersionId: string;

  stageSetVersion: number;

  status:
    | "in-progress"
    | "completed"
    | "abandoned";

  createdAt: string;
  completedAt?: string;
}
```

---

### Progressive Stage Response

```ts
interface ProgressiveStageResponseRecord {
  id: string;
  progressiveSessionId: string;
  stageId: string;

  leadingInterpretation: string;
  alternativeInterpretation?: string;
  requestedInformation?: string;
  mostImportantClue?: string;

  differentialChanged:
    | "yes"
    | "no"
    | "uncertain";

  changeExplanation?: string;
  confidence?: ConfidenceLevel;

  submittedAt: string;
}
```

---

### Adaptive Decision

```ts
interface AdaptiveDecisionRecord {
  id: string;
  conceptId: string;

  sourceSessionId: string;
  sourceAttemptIds: string[];

  previousDifficulty: DifficultyLevel;
  recommendedDifficulty: DifficultyLevel;

  decision:
    | "increase"
    | "maintain"
    | "decrease";

  reasonCode: AdaptiveReasonCode;
  purpose: AdaptiveQuestionPurpose;

  ruleVersion: number;
  decisionKey: string;

  createdAt: string;
}
```

Adaptive decisions must be deterministic and idempotent.

---

## Medical Knowledge Data Model

### Medical Resource

```ts
interface MedicalResourceRecord {
  id: string;

  title: string;
  resourceType:
    | "textbook"
    | "guideline"
    | "journal"
    | "review"
    | "atlas"
    | "image-collection";

  authors: string[];
  publisher?: string;

  rightsStatus:
    | "licensed"
    | "public-domain"
    | "owned"
    | "permission-granted"
    | "restricted"
    | "unknown";

  reviewStatus:
    | "pending"
    | "extracting"
    | "under-review"
    | "approved"
    | "rejected";

  createdAt: string;
}
```

---

### Resource Edition

```ts
interface ResourceEditionRecord {
  id: string;
  resourceId: string;

  edition?: string;
  publicationYear?: number;
  isbn?: string;

  supersedesEditionId?: string;

  createdAt: string;
}
```

Content from different editions must not be silently merged.

---

### Resource File

```ts
interface ResourceFileRecord {
  id: string;
  editionId: string;

  objectPath: string;
  fileName: string;
  mimeType: string;
  fileSizeBytes: number;

  sha256: string;

  createdAt: string;
}
```

The database stores metadata and references.

The binary file belongs in object storage.

---

### Resource Page

```ts
interface ResourcePageRecord {
  id: string;
  editionId: string;

  pageNumber: number;

  extractedText?: string;
  extractionConfidence?: number;

  pageImagePath?: string;
  thumbnailPath?: string;

  humanVerified: boolean;

  createdAt: string;
}
```

---

### Resource Figure

```ts
interface ResourceFigureRecord {
  id: string;
  pageId: string;

  figureLabel?: string;
  caption?: string;

  imageObjectPath: string;

  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };

  extractedLabels?: string[];
  conceptIds?: string[];

  humanVerified: boolean;

  createdAt: string;
}
```

AI-generated extraction must not overwrite the original image.

---

### Resource Chunk

```ts
interface ResourceChunkRecord {
  id: string;
  editionId: string;
  pageId?: string;

  sequence: number;
  text: string;

  headingPath?: string[];
  tokenCount?: number;

  contentHash: string;

  reviewStatus:
    | "unreviewed"
    | "approved"
    | "rejected";

  createdAt: string;
}
```

Chunks must retain source location.

---

### Citation

```ts
interface CitationRecord {
  id: string;

  generatedEntityType:
    | "case-analysis"
    | "question"
    | "option-explanation"
    | "study-material";

  generatedEntityId: string;

  resourceId: string;
  editionId: string;
  pageId?: string;
  chunkId?: string;
  figureId?: string;

  relationship:
    | "direct-support"
    | "background"
    | "contrast"
    | "image-evidence";

  createdAt: string;
}
```

---

## Medical Concept Model

Use stable internal identifiers.

Example:

```text
neurology.stroke.mca-localisation
cardiology.acs.ecg-interpretation
endocrinology.thyroid.graves-disease
respiratory.acid-base.compensation
```

```ts
interface MedicalConceptRecord {
  id: string;
  parentConceptId?: string;

  label: string;
  description?: string;

  specialty?: string;
  synonyms: string[];

  status:
    | "active"
    | "deprecated";

  createdAt: string;
}
```

Display labels must not be used as permanent identifiers.

---

## AI Generation Provenance

Every important AI generation should be traceable.

```ts
interface AIGenerationRecord {
  id: string;

  generationType:
    | "case-analysis"
    | "mcq-set"
    | "differential-comparison"
    | "progressive-stages"
    | "study-material";

  provider: string;
  model: string;

  promptVersion: string;
  schemaVersion: number;

  inputHash: string;
  outputHash?: string;

  status:
    | "pending"
    | "complete"
    | "failed";

  retryCount: number;

  startedAt: string;
  completedAt?: string;

  errorCode?: string;
}
```

Do not store API keys, authentication tokens, or unnecessary raw personal data.

---

## AI Input References

Instead of storing every large prompt repeatedly, store references where possible.

```ts
interface AIGenerationInputReference {
  id: string;
  generationId: string;

  entityType:
    | "case-version"
    | "case-analysis"
    | "resource-chunk"
    | "question"
    | "adaptive-decision";

  entityId: string;
}
```

---

## AI Output Validation

Validation records may include:

```ts
interface AIValidationResultRecord {
  id: string;
  generationId: string;

  schemaValid: boolean;
  semanticValid: boolean;

  errors: string[];
  warnings: string[];

  validatorVersion: string;

  createdAt: string;
}
```

AI response acceptance requires:

```text
JSON parsing
↓
Schema validation
↓
Semantic validation
↓
Duplicate checks
↓
Safety checks
↓
Accepted record
```

---

## Local Database Design

Recommended IndexedDB object stores:

```text
cases
case_versions
case_analyses
question_sets
questions
answer_options
practice_sessions
question_attempts
question_review_snapshots
differential_drafts
differential_submissions
progressive_sessions
progressive_stage_responses
adaptive_decisions
revision_items
resource_cache
sync_outbox
sync_metadata
application_settings
migration_records
```

---

## Recommended Local Indexes

### Cases

```text
id
status
createdAt
updatedAt
```

### Question sets

```text
id
caseId
caseVersionId
createdAt
[caseId + version]
```

### Practice sessions

```text
id
caseId
questionSetId
status
createdAt
[caseId + status]
```

### Attempts

```text
id
sessionId
questionId
submittedAt
[sessionId + questionId]
```

### Adaptive decisions

```text
id
conceptId
sourceSessionId
decisionKey
[conceptId + createdAt]
```

### Resource chunks

```text
id
editionId
pageId
reviewStatus
[editionId + sequence]
```

Only add indexes required by real queries.

Every index increases write cost and storage.

---

## Repository Layer

Application pages should not call storage systems directly.

Recommended interfaces:

```ts
interface CaseRepository {
  create(input: CreateCaseInput): Promise<CaseRecord>;
  getById(caseId: string): Promise<CaseRecord | null>;
  list(query?: CaseQuery): Promise<CaseRecord[]>;
  update(caseId: string, patch: CasePatch): Promise<CaseRecord>;
}

interface PracticeRepository {
  createSession(
    input: CreatePracticeSessionInput,
  ): Promise<PracticeSessionRecord>;

  saveAttempt(
    input: SaveAttemptInput,
  ): Promise<QuestionAttemptRecord>;

  completeSession(
    sessionId: string,
    reason: string,
  ): Promise<PracticeSessionRecord>;
}

interface KnowledgeRepository {
  getResource(resourceId: string): Promise<MedicalResourceRecord | null>;

  searchChunks(
    query: KnowledgeSearchQuery,
  ): Promise<ResourceChunkRecord[]>;
}
```

Possible implementations:

```text
LocalCaseRepository
CloudCaseRepository
SyncedCaseRepository
```

The UI must depend on interfaces, not Dexie or a specific cloud vendor.

---

## Transaction Boundaries

Operations involving multiple records should use transactions.

### Submit answer transaction

```text
Create attempt
+
Create review snapshot
+
Update session progress
+
Add sync event
```

All should succeed or fail together.

### Complete session transaction

```text
Update session status
+
Set completion timestamp
+
Create session summary
+
Create adaptive decision snapshot
+
Add sync event
```

### Resource ingestion transaction

```text
Create resource metadata
+
Create edition
+
Create file reference
+
Create extraction job
```

---

## Idempotency

Every externally triggered write should support an idempotency key.

Examples:

```text
submit-attempt:<sessionId>:<questionId>
complete-session:<sessionId>
generate-question-set:<caseVersionId>:<requestHash>
create-review:<attemptId>
adaptive-decision:<conceptId>:<evidenceHash>
```

Repeated requests with the same key must return the existing result.

---

## Versioning

Use explicit versions for:

* Database schema
* Case content
* Question sets
* AI prompt
* AI output schema
* Review rules
* Adaptive rules
* Resource extraction
* Medical concept taxonomy

Example:

```ts
interface VersionedRecord {
  schemaVersion: number;
}
```

Do not rely only on application release numbers.

---

## Historical Compatibility

Historical records may lack newer fields.

Fallback rules must be explicit.

| Missing field            | Behaviour                         |
| ------------------------ | --------------------------------- |
| Practice mode            | Treat as Learning Mode            |
| Confidence               | Display Not recorded              |
| Difficulty               | Display Difficulty not recorded   |
| Concept ID               | Exclude from adaptive calculation |
| Hint use                 | Treat as unknown                  |
| Adaptive setting         | Treat as disabled                 |
| Question review snapshot | Use legacy renderer               |
| Case format              | Treat as Complete Case            |
| Progressive stages       | Do not invent stages              |
| Differential Builder     | Treat as disabled                 |

Historical records should not be rewritten automatically during hydration.

---

## Deletion Model

Prefer soft deletion for cloud records where recovery or auditability matters.

```ts
deletedAt?: string;
deletedBy?: string;
```

Local-only data may be permanently deleted after user confirmation.

Deletion rules should distinguish:

* Remove from active history
* Permanently delete local cache
* Delete cloud record
* Delete source file
* Revoke resource publication
* Retain legally required audit metadata

Deleting a case should not accidentally delete shared medical resources.

---

## Offline and Synchronization Architecture

### Local write flow

```text
User action
↓
IndexedDB transaction
↓
UI updates
↓
Sync event added to outbox
↓
Background sync attempts upload
↓
Server validates identity and idempotency
↓
Cloud write succeeds
↓
Local event marked synced
```

### Sync event

```ts
interface SyncEventRecord {
  id: string;

  entityType: string;
  entityId: string;

  operation:
    | "create"
    | "update"
    | "delete";

  payload: unknown;

  baseVersion?: number;
  idempotencyKey: string;

  status:
    | "pending"
    | "processing"
    | "synced"
    | "failed";

  retryCount: number;
  lastError?: string;

  createdAt: string;
  updatedAt: string;
}
```

---

## Conflict Resolution

### Append-only records

Examples:

* Attempts
* Review snapshots
* Adaptive decisions
* Audit events

Conflict strategy:

```text
Same ID or idempotency key
→ Return existing record
```

### Editable drafts

Examples:

* Case draft
* Differential draft
* Unsaved notes

Initial strategy:

```text
Latest accepted version wins
```

Later revisions may use field-level conflict handling if needed.

### Completed sessions

Completed sessions are immutable.

Conflicting changes should be rejected rather than merged.

---

## Medical Resource Ingestion

```text
Upload approved file
↓
Calculate SHA-256
↓
Verify rights status
↓
Store original privately
↓
Create resource and edition
↓
Extract pages
↓
Extract text
↓
Extract figures and tables
↓
Preserve coordinates and page numbers
↓
Create chunks
↓
Assign concepts
↓
Create search index
↓
Generate embeddings
↓
Automated validation
↓
Human review
↓
Approve publication
```

---

## Rights and Licensing

Every resource requires a rights record.

```ts
interface ResourceLicenceRecord {
  id: string;
  resourceId: string;

  rightsStatus:
    | "licensed"
    | "public-domain"
    | "owned"
    | "permission-granted"
    | "restricted"
    | "unknown";

  allowExtraction: boolean;
  allowEmbedding: boolean;
  allowDisplayText: boolean;
  allowDisplayImages: boolean;
  allowGeneratedDerivatives: boolean;

  licenceDocumentPath?: string;
  expiresAt?: string;

  createdAt: string;
}
```

Restricted or unknown resources must not be:

* Publicly displayed
* Sent to external AI services
* Used for generated derivatives
* Included in learner reports

unless the recorded licence allows it.

---

## Search Architecture

Future medical retrieval should combine:

* Keyword search
* Full-text search
* Medical concept filters
* Metadata filters
* Semantic similarity
* Edition filters
* Review-status filters
* Rights filters

Example retrieval flow:

```text
User case
↓
Extract relevant concepts
↓
Keyword retrieval
+
Semantic retrieval
+
Metadata filtering
↓
Rank approved evidence
↓
Select bounded source chunks
↓
Generate educational output
↓
Attach citations
```

The retrieval system must not search rejected or unauthorized material.

---

## Citation Integrity

Each citation must reference a real stored resource location.

A citation should support:

* Resource title
* Edition
* Chapter where available
* Page number
* Figure or table label
* Source chunk
* Evidence relationship

Generated content should not fabricate citation metadata.

If no verified source exists, the UI should state that source support is unavailable.

---

## Privacy Model

The platform should avoid storing direct patient identifiers.

Case input should be fictional or de-identified.

Do not store:

* Patient names
* National identity numbers
* Phone numbers
* Addresses
* Hospital registration numbers
* Unnecessary dates of birth
* Unredacted clinical documents

Future upload workflows require:

* File-type validation
* Malware scanning
* Metadata stripping where appropriate
* Clear user warnings
* Access controls
* Retention rules

---

## Security Controls

Future cloud implementation should support:

* Authentication
* Authorization
* Record ownership checks
* Encrypted transport
* Private object storage
* Signed file access
* Server-side secrets
* Rate limits
* Audit logs
* Restricted administrative operations
* Backup protection
* Key rotation

The browser must never contain:

* AI provider secrets
* Database service-role credentials
* Storage administration keys
* Private signing keys

---

## Performance Requirements

### Local interaction targets

Recommended targets:

* Answer submission UI response under 100 ms
* Local attempt write under 250 ms under normal conditions
* Case history first page loaded without scanning all content
* Large case content loaded only when needed
* Images lazy loaded
* Reports paginated or progressively rendered

These are engineering targets, not guarantees.

### Query discipline

Use:

* Pagination
* Indexed filtering
* Projection of required fields
* Lazy loading
* Bounded AI context
* Aggregated analytics

Avoid:

* Loading all cases on startup
* Loading every question explanation for a history list
* Sending complete learning history to AI
* Storing large images as JSON strings
* Recalculating every historical report on each render

---

## Analytics Strategy

Prefer deterministic local or database calculations.

Examples:

* Score
* Accuracy
* Unanswered count
* Confidence distribution
* Average response time
* High-confidence errors
* Concept attempt count
* Difficulty distribution

AI may generate narrative study guidance from aggregated data, but it must not be the authoritative calculator.

---

## Backup and Recovery

Future cloud architecture should define:

* Database backups
* Object-storage backups
* Restore testing
* Retention periods
* Deleted-record recovery
* Corruption detection
* Migration rollback
* Local export
* User data export

A backup that has never been restored is merely an optimistic file collection.

---

## Data Migration Strategy

### Migration from localStorage to IndexedDB

1. Add repository interfaces.
2. Add IndexedDB without changing current reads.
3. Read the legacy Zustand payload.
4. Validate legacy schema.
5. Normalize entities.
6. Write records transactionally.
7. Compare counts and relationships.
8. Record migration completion.
9. Prefer IndexedDB reads.
10. Keep legacy read fallback temporarily.
11. Stop legacy writes.
12. Remove old persistence only after verification.

### Migration record

```ts
interface MigrationRecord {
  id: string;

  fromVersion: number;
  toVersion: number;

  status:
    | "pending"
    | "running"
    | "complete"
    | "failed";

  startedAt?: string;
  completedAt?: string;

  entityCounts?: Record<string, number>;
  checksum?: string;
  error?: string;
}
```

### Migration safety rule

Never delete the legacy payload before the new records have been verified.

---

## Migration Verification

Verify:

* Case count
* Question-set count
* Question count
* Session count
* Attempt count
* Review count
* Scores
* Question IDs
* Session-to-question-set links
* Attempt-to-question links
* Historical Results rendering

Migration must be safe to rerun.

---

## Error Recovery

Handle:

* IndexedDB unavailable
* Quota error
* Corrupted legacy payload
* Migration interruption
* Duplicate sync event
* AI generation failure
* Invalid AI response
* Missing question version
* Missing resource file
* Failed extraction
* Citation target removed
* Cloud unavailable
* Partial synchronization

Errors should preserve already completed learner work.

---

## Testing Strategy

### Unit tests

Test:

* Data mappers
* ID generation
* Schema validation
* Idempotency keys
* Score derivation
* Adaptive decision derivation
* Version compatibility
* Migration transforms

### Integration tests

Test:

* Submit attempt transaction
* Complete session transaction
* Question review reconstruction
* IndexedDB migration
* Offline write
* Sync replay
* Resource creation
* Citation resolution

### Scale tests

Test with:

* 1,000 cases
* 10,000 sessions
* 100,000 attempts
* Large explanations
* Thousands of source chunks
* Hundreds of page images
* Multiple resource editions

Measure:

* Startup time
* Write latency
* Query latency
* Memory usage
* Migration duration
* Report rendering
* Sync recovery

---

## Rollout Plan

### Phase 1: Stabilize current records

* Add stable IDs
* Add schema versions
* Add idempotency
* Add repository interfaces
* Add migration tests

### Phase 2: IndexedDB

* Add Dexie
* Normalize local stores
* Migrate existing data
* Keep rollback path
* Remove monolithic writes after verification

### Phase 3: Cloud foundation

* Add authentication
* Add cloud database
* Add object storage
* Add security policies
* Add synchronization

### Phase 4: Knowledge infrastructure

* Add resource metadata
* Add editions
* Add pages
* Add figures
* Add chunks
* Add concepts
* Add licensing

### Phase 5: Source-grounded AI

* Add retrieval
* Add citations
* Add provenance
* Add human review
* Add quality evaluation

---

## Architecture Decision Summary

### Zustand

Use for:

* Temporary interface state
* Loading status
* Dialogs
* Current navigation state

Do not use as the long-term canonical database.

### IndexedDB

Use for:

* Offline records
* Local drafts
* Cached question sets
* Attempt persistence
* Pending synchronization

### Cloud database

Use for:

* Canonical cross-device records
* Medical resource metadata
* User-owned learning records
* Source citations
* Shared analytics

### Object storage

Use for:

* Books
* PDFs
* Page images
* Figures
* Tables
* Generated exports

### AI

Use for:

* Educational content extraction
* Case analysis
* Question generation
* Explanations
* Study materials

Do not use AI for:

* Scoring
* Record identity
* Storage truth
* Authorization
* Timer logic
* Sync conflict resolution

---

## Open Architecture Questions

The following decisions remain open until implementation planning:

1. Which cloud database provider will be used?
2. Which authentication provider will be used?
3. Will anonymous local records later be claimable by an account?
4. How long will deleted records be recoverable?
5. Which medical sources will be licensed?
6. Which AI provider may process licensed content?
7. Will embeddings be generated locally or by a hosted provider?
8. What human review workflow is required before publication?
9. Which data should be available offline?
10. How will users export or delete their data?
11. What conflict policy will apply to editable drafts?
12. Which analytics require server-side aggregation?

---

## Change Control

When updating this architecture:

* Mark sections as current, approved, proposed, or deprecated.
* Record schema changes.
* Record migration requirements.
* Preserve historical compatibility.
* Update indexes when query patterns change.
* Update security assumptions.
* Add tests for every migration.
* Do not describe future architecture as already deployed.
* Never include credentials or private source material.

---

## Related Documents

* `README.md`
* `docs/engineering-notes.md`
* `docs/architecture/medical-knowledge.md`
* `docs/api.md`
* `docs/privacy-and-security.md`
* `CHANGELOG.md`

---

## What this file should not contain

Keep these elsewhere:

| Content | File |
|---|---|
| Product introduction | `README.md` |
| Installation commands | `README.md` |
| Detailed bug history | `docs/engineering-notes.md` |
| Full medical ingestion workflow | `docs/architecture/medical-knowledge.md` |
| Endpoint specifications | `docs/api.md` |
| Release notes | `CHANGELOG.md` |
| User-facing privacy policy | `PRIVACY.md` |
| Temporary debugging notes | Issue tracker |

The most important part of this architecture file is the distinction between **current implementation** and **target architecture**. Without that, future developers may confidently write cloud migrations for a database that exists mainly as a heading.
