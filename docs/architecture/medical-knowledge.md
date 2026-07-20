# CaseLens AI Medical Knowledge Ingestion Architecture

## Purpose

This document outlines the **future architectural blueprint** for ingesting, processing, and storing canonical medical resources (textbooks, guidelines, atlases) within CaseLens AI.

Currently, CaseLens AI relies on the LLM's internal weights to evaluate clinical cases and generate multiple-choice questions. To achieve true source-grounded educational generation (Retrieval-Augmented Generation / RAG), the platform requires a highly structured, legally compliant, and traceable medical knowledge base.

> [!WARNING]
> This document describes a **planned target architecture**. None of the features described below (file ingestion, optical character recognition, embedding generation, or semantic search) are currently implemented in the local prototype.

---

## 1. Core Principles

1. **Strict Provenance:** Every piece of generated educational content must be traceable back to a specific page or figure in a specific edition of a verified medical resource.
2. **Copyright Compliance:** The system must strictly enforce licensing and rights management. Restricted material must never be displayed publicly or sent to third-party AI models without explicit rights.
3. **Immutability of Source Truth:** The original uploaded files are immutable. Extracted text and figures are derived representations that can be re-processed but never overwrite the original file.
4. **Human-in-the-Loop:** Automated extraction (text and figures) must undergo human review before being published to the active retrieval index.

---

## 2. The Ingestion Pipeline

The future pipeline for adding a new medical resource to the CaseLens AI knowledge base consists of several sequential, transactional steps.

### Step 1: Secure Upload & Verification
1. An administrator uploads a verified PDF (e.g., a medical textbook or clinical guideline).
2. The system calculates a `SHA-256` hash of the file to guarantee integrity and prevent duplicate uploads.
3. The administrator manually inputs the **Rights Status** (e.g., `licensed`, `public-domain`, `permission-granted`, `restricted`).
4. The original binary file is stored securely in **Private Object Storage**. It is never exposed directly to the public web.

### Step 2: Resource & Edition Record Creation
The system creates authoritative records in the Cloud Database:
- `MedicalResourceRecord`: Tracks the title, authors, publisher, and global review status.
- `ResourceEditionRecord`: Tracks the specific edition, publication year, and ISBN.
- `ResourceLicenceRecord`: Details exactly what operations are permitted (e.g., `allowExtraction`, `allowGeneratedDerivatives`).

### Step 3: Page & Asset Extraction
A background job processes the original PDF:
- It splits the document into individual `ResourcePageRecord`s.
- It performs Optical Character Recognition (OCR) to extract raw text, storing it in `extractedText`.
- It identifies and crops images, tables, and charts, creating `ResourceFigureRecord`s. 
- **CRITICAL:** All extracted figures retain exact bounding box coordinates and page numbers to ensure precise citations later.

### Step 4: Chunking & Concept Assignment
The raw page text is too large for accurate semantic retrieval.
1. The text is broken down into semantic `ResourceChunkRecord`s (e.g., paragraph by paragraph, or section by section).
2. Each chunk is tagged with canonical `MedicalConceptRecord` IDs (e.g., `neurology.stroke.mca-localisation`).

### Step 5: Indexing & Embedding Generation
1. The system generates high-dimensional vector embeddings for every approved `ResourceChunkRecord`.
2. These embeddings are pushed to a vector-enabled database (e.g., pgvector) alongside a traditional full-text search index.

### Step 6: Review & Publication
1. An automated validation pass checks for missing text, corrupted figures, or unmapped concepts.
2. A human reviewer verifies a sample of the extracted chunks and figures via an internal dashboard.
3. Once approved, the `ResourceEdition` is marked as `published`, making its chunks available to the Retrieval Engine.

---

## 3. The Retrieval Engine (RAG)

When a learner submits a case, or when the system generates questions, the AI will use the knowledge base rather than relying purely on its internal weights.

### The Retrieval Flow
1. **Concept Extraction:** The learner's case is analyzed to extract relevant medical concepts.
2. **Hybrid Search:** The system queries the vector database using both Semantic Similarity (embeddings) and Metadata Filtering (e.g., filtering strictly by the concepts identified).
3. **Rights Filtering:** The query absolutely excludes any chunks belonging to resources where `allowGeneratedDerivatives` is false.
4. **Context Injection:** The top-ranked `ResourceChunkRecord`s (and relevant `ResourceFigureRecord` descriptions) are injected into the context window of the Groq LLM prompt.
5. **Grounded Generation:** The LLM generates the analysis or MCQs based *strictly* on the injected chunks.

---

## 4. Citation Integrity

The most critical output of this architecture is the `CitationRecord`. 

Whenever the AI generates an educational explanation, it must append a citation linking the specific generated output to the exact source material.

A valid citation must include:
- The generated entity (e.g., a specific MCQ option explanation).
- The `resourceId` and `editionId`.
- The exact `pageId` and `chunkId` that provided the evidence.
- The `relationship` type (e.g., `direct-support`, `contrast`).

**Rule:** If the LLM generates a claim that cannot be mapped to a retrieved `ResourceChunkRecord`, the system must explicitly state that source support is unavailable, or reject the generation entirely.

---

## 5. Security & Privacy Safeguards

- **No Public PDFs:** The original copyrighted textbooks are never served to the client browser.
- **Provider Restrictions:** If a medical resource's licence prohibits sharing data with third-party AI providers, its chunks will be explicitly excluded from Groq API calls.
- **Audit Trails:** Every ingestion step, manual review decision, and metadata edit is logged for compliance.
