# 🏠 PropertyIQ

### Evidence-Grounded Property Intelligence powered by RAG

> **Ask about a property. Get an answer grounded in evidence.**

PropertyIQ is a **Retrieval-Augmented Generation (RAG)** platform designed to give buyers trustworthy, consolidated answers about a property using **property listings, legal documents, and locality reports**.

Instead of manually opening multiple documents and reconciling information, PropertyIQ retrieves the most relevant evidence and generates a plain-language answer with **inline citations**.

The system is designed to clearly distinguish between **verified legal documents, independent third-party reports, and seller claims**, while surfacing conflicts instead of silently choosing one source.

---

## ✨ Why PropertyIQ?

Real-estate information is usually fragmented across:

* 🏷️ Property listings and seller claims
* ⚖️ Legal documents
* 📍 Locality and neighbourhood reports

A buyer asking:

> **“Does this property have any outstanding liens?”**

may need to search through several documents manually.

PropertyIQ brings these sources together into one evidence-grounded Q&A experience.

### The core idea

```text
Property Documents
       ↓
   Ingestion
       ↓
Cleaning & Chunking
       ↓
    Embeddings
       ↓
 Hybrid Retrieval
       ↓
 Re-ranking
       ↓
 Evidence Context
       ↓
 Grounded LLM Answer
       ↓
 Citation Validation
       ↓
   Trusted Answer
```

---

## 🚀 Key Features

### 💬 Property-Specific AI Q&A

Ask natural-language questions about a specific property and receive answers based only on the available evidence.

Examples:

* Does this property have any outstanding liens?
* Is the title clear?
* Are there zoning restrictions?
* What are the HOA fees?
* Is this area at risk of flooding?
* Are any seller claims contradicted by legal documents?

---

### 🔎 Evidence-Based Answers

Every factual claim is connected to its source through citation chips.

Example:

> No outstanding lien is identified in the available legal documents.
> **[Lien Search · p.2]**

Users can open the citation to inspect the relevant source passage.

---

### 🛡️ Source Trust Levels

PropertyIQ distinguishes between:

| Source              | Trust Label           |
| ------------------- | --------------------- |
| Legal documents     | 🟢 Verified Legal     |
| Independent reports | 🔵 Third-Party Report |
| Property listings   | 🟡 Seller Claim       |

This allows users to understand **where an answer came from**, rather than treating every document as equally authoritative.

---

### ⚠️ Conflict Detection

When a seller claim conflicts with a legal document, PropertyIQ surfaces the conflict.

Example:

```text
SOURCE CONFLICT DETECTED

Seller Claim
"Property has a clear title."

        VS

Verified Legal Record
"Lien identified in the lien search."

→ Review the supporting documents
```

The system is designed to make disagreements between sources visible rather than hiding them.

---

### 📊 Property Risk Report

Generate a structured risk report containing:

* Legal risks
* Property risks
* Locality risks
* Conflicting seller claims
* Missing information
* Risk severity
* Supporting evidence

---

### 📄 Multi-Format Document Ingestion

PropertyIQ supports:

* PDF
* DOCX
* HTML
* TXT / Markdown
* CSV
* JSON

Documents are cleaned, chunked, validated and enriched with provenance metadata before indexing.

---

### 🚫 Honest Refusal

If the available documents do not contain enough information to answer a question, PropertyIQ does **not guess**.

Example:

> **I don't have enough evidence in the available property and locality documents to answer that reliably.**

This is an intentional product behavior, not an error.

---

## 🧠 RAG Pipeline

PropertyIQ uses a multi-stage retrieval and generation pipeline.

### 1. Document Ingestion

```text
Upload
  ↓
Load
  ↓
Clean
  ↓
Chunk
  ↓
Validate
  ↓
Embed
  ↓
Index
```

Each chunk stores provenance such as:

* Source file
* Property ID
* Locality
* Page / heading
* Document type
* Authority level

### 2. Hybrid Retrieval

PropertyIQ combines:

* Dense embedding similarity
* BM25 keyword search
* Reciprocal Rank Fusion
* Re-ranking

Retrieval is scoped using metadata such as:

* Property
* Document type
* Locality
* City

### 3. Grounded Generation

Retrieved evidence is assembled into a controlled context.

The model is instructed to:

* Answer only from supplied evidence
* Cite claims
* Prefer verified legal documents
* Identify source conflicts
* Refuse when evidence is insufficient

### 4. Validation

Before an answer reaches the user:

```text
Generated Answer
      ↓
Citation Validation
      ↓
Figure / Amount Validation
      ↓
Guardrail Checks
      ↓
Final Answer
```

---

## 🏗️ System Architecture

```text
                    ┌─────────────────────┐
                    │     PropertyIQ UI   │
                    │   Chat + Evidence   │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │      FastAPI        │
                    │        API          │
                    └──────────┬──────────┘
                               │
                ┌──────────────┴──────────────┐
                │                             │
                ▼                             ▼
       ┌─────────────────┐          ┌─────────────────┐
       │  RAG Pipeline   │          │ Document Upload │
       └────────┬────────┘          └────────┬────────┘
                │                            │
                ▼                            ▼
       ┌─────────────────┐          ┌─────────────────┐
       │ Hybrid Retrieval│          │   Ingestion     │
       │ Dense + BM25    │          │ Clean/Chunk     │
       └────────┬────────┘          └────────┬────────┘
                │                            │
                └──────────────┬─────────────┘
                               ▼
                    ┌─────────────────────┐
                    │       Chroma        │
                    │    Vector Store     │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │    Gemini API       │
                    │  LLM + Embeddings   │
                    └─────────────────────┘
```

---

## 🛠️ Technology Stack

| Layer            | Technology              |
| ---------------- | ----------------------- |
| LLM              | Google Gemini           |
| Embeddings       | Gemini Embedding        |
| RAG              | Custom RAG Pipeline     |
| Vector Database  | Chroma                  |
| Retrieval        | Dense + BM25 + RRF      |
| Backend          | Python + FastAPI        |
| Frontend         | HTML / CSS / JavaScript |
| Containerization | Docker                  |
| CI/CD            | GitHub Actions          |

The PRD specifies Gemini as the default LLM and embedding provider, Chroma as the vector store, FastAPI as the backend, and a self-contained frontend.

---

## 📁 Project Structure

```text
propertyiq/
│
├── frontend/
│   └── index.html
│
├── propertyiq/
│   ├── llm/
│   ├── ingestion/
│   ├── embeddings/
│   ├── vectorstore/
│   ├── retrieval/
│   ├── rag/
│   ├── api/
│   └── infra/
│
├── data/
│   ├── raw/
│   │   ├── listings/
│   │   ├── legal/
│   │   └── locality/
│   └── eval/
│
├── tests/
│
├── docs/
│   ├── ARCHITECTURE.md
│   ├── DEPLOYMENT.md
│   └── TUNING.md
│
├── Dockerfile
├── docker-compose.yml
├── pyproject.toml
├── requirements.txt
└── README.md
```

---

## 👥 Team

### Jannat — Backend

Responsible for the backend and intelligence layer of PropertyIQ.

**Key responsibilities:**

* RAG pipeline
* Document ingestion
* Retrieval and re-ranking
* Gemini integration
* Embeddings
* Chroma vector store
* Citation and guardrail logic
* FastAPI APIs
* Risk report generation
* Backend testing and evaluation

### Setu — Frontend

Responsible for the user-facing PropertyIQ experience.

**Key responsibilities:**

* Property selection interface
* Property overview
* AI chat interface
* Citation chips
* Evidence panel
* Risk report UI
* Document upload interface
* Conflict visualization
* Responsive UI/UX
* Frontend integration with backend APIs

---

## 🎯 Target Users

PropertyIQ is designed primarily for:

**🏠 Home Buyers**
Quickly investigate a property before making an offer.

**📍 Buyers Comparing Locations**
Understand locality-level risks and information.

**🤝 Real-Estate Agents**
Prepare consolidated, evidence-backed buyer briefings.

**⚙️ Platform Operators**
Monitor usage, retrieval quality, costs and system health.

---

## 🔐 Trust & Safety

PropertyIQ is designed around evidence rather than unsupported generation.

The system includes:

* Citation validation
* Unsupported figure detection
* Prompt-injection defence
* Source authority labels
* Conflict detection
* Missing-evidence refusal
* Legal/financial decision disclaimer
* Request and usage tracking

PropertyIQ **does not provide legal or financial advice**. It presents what the available documents say so users can independently review the evidence.

---

## 📈 Success Metrics

The PRD defines the following evaluation targets:

| Metric                |           Target |
| --------------------- | ---------------: |
| Retrieval Hit Rate @5 |           ≥ 0.95 |
| Answer Fact Coverage  |           ≥ 0.90 |
| Citation Accuracy     |           ≥ 0.95 |
| Refusal Accuracy      |             100% |
| Unsupported Figures   |      0 unflagged |
| Cost                  | Tracked & capped |

These metrics are intended to evaluate not only whether the system retrieves information, but whether the final answer is **faithful, citable and safe**.

---

## 🗺️ Development Roadmap

* [x] Project foundations
* [ ] Multi-format document ingestion
* [ ] Document cleaning & chunking
* [ ] Embedding & indexing
* [ ] Hybrid retrieval
* [ ] Re-ranking
* [ ] Grounded RAG generation
* [ ] Citation validation
* [ ] Risk report
* [ ] FastAPI backend
* [ ] Frontend chat UI
* [ ] Evidence panel
* [ ] Docker deployment
* [ ] CI/CD
* [ ] Evaluation & launch readiness

The PRD organizes development into six milestones, from foundations and ingestion through retrieval, RAG, delivery and launch readiness.

---

## ⚡ Core Philosophy

> **Don't just give an answer. Show the evidence behind it.**

PropertyIQ is built around a simple principle:

```text
Retrieve → Verify → Explain → Cite
```

Instead of asking users to trust an AI-generated answer, PropertyIQ helps them **trace the answer back to the underlying property evidence**.

---

## ⚠️ Disclaimer

PropertyIQ is an information and document-analysis tool. It does not provide legal, financial, investment, or professional real-estate advice.

Users should review the underlying documents and consult qualified professionals before making legal or financial decisions.

---

## 📌 Project Status

**Status:** 🚧 In Development
**Version:** v1.0
**Project:** PropertyIQ
**Architecture:** RAG + Hybrid Retrieval
**Primary Model:** Google Gemini
