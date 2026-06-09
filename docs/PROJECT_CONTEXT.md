# MindVault-AI — Project Context

## Project Overview

MindVault-AI is an AI-powered meeting intelligence platform designed to convert conversations and meeting artifacts into searchable knowledge.

The long-term objective is to build a persistent AI knowledge layer capable of understanding what users hear, see, discuss, and learn.

---

# Why This Project Exists

Traditional meetings suffer from:

* Information loss
* Forgotten decisions
* Poor documentation
* Lack of accountability
* Knowledge fragmentation

MindVault-AI aims to become an organizational memory system.

---

# Product Vision

## Project A

Meeting Intelligence Platform

Capabilities:

* Transcription
* Summaries
* Action Items
* Decision Extraction
* Screenshot Analysis
* Semantic Search

---

## Project B

AI Knowledge Capture Assistant

Capabilities:

* Live Meeting Monitoring
* Real-Time Notes
* AI Overlay
* Screen Awareness
* Visual Understanding
* Context Fusion
* Personal AI Memory

---

# Core Philosophy

The goal is not to build a meeting summarizer.

The goal is to build a system that transforms knowledge into memory.

---

# Technical Decisions

## Frontend

Chosen:

* React
* TypeScript
* Vite

Reason:

Fast development, excellent ecosystem, production-ready.

---

## Backend

Chosen:

* Node.js
* Express
* TypeScript

Reason:

Simplicity, scalability, strong ecosystem.

---

## Database

Chosen:

* Neon PostgreSQL
* pgvector

Reason:

Relational data + vector search in one system.

---

## Storage

Chosen:

* Cloudinary

Reason:

Media-focused platform for audio, video, and screenshots.

---

## AI

Chosen:

* Gemini 2.5 Flash
* Gemini Embeddings

Reason:

Single AI provider, lower complexity.

---

## Deployment

Chosen:

* Vercel
* Render
* Neon
* Upstash

Reason:

Strong free-tier support.

---

# Architecture Principles

1. API-first design
2. Cloud-native deployment
3. Queue-based AI processing
4. Semantic retrieval
5. Future-proof architecture

---

# Future Expansion Strategy

Phase 1:
Meeting Intelligence

Phase 2:
Visual Knowledge Capture

Phase 3:
Live Notes

Phase 4:
AI Overlay

Phase 5:
Screen Awareness

Phase 6:
Knowledge Memory Engine

---

# Repository Structure

```text
backend/
frontend/
docs/
```

Monorepo managed through npm workspaces.

---

# Success Criteria

Project A is successful when:

* Meetings can be uploaded
* AI generates summaries
* AI extracts action items
* Semantic search works
* Screenshot analysis works
* System is deployed publicly

Project B begins after all Project A goals are completed.
