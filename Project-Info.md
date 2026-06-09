# AI Knowledge Capture Platform

## Vision, Architecture, Roadmap, and Learning Guide

Author: Sarthak

Version: 1.0

---

# Executive Summary

This project started as an AI Meeting Memory System (AMMS), designed to transcribe meetings, generate summaries, extract action items, and provide semantic search capabilities.

However, the long-term vision extends far beyond meeting summarization.

The ultimate goal is to build an AI Knowledge Capture Assistant capable of understanding conversations, visual content, documents, presentations, code, and screen activity, creating a searchable memory layer for the user.

This document describes:

* Project A (Current Implementation)
* Project B (Future Vision)
* Learning Requirements
* Technical Architecture
* Evolution Path

---

# Project A — AI Meeting Memory System

## Overview

The AI Meeting Memory System is a web-based platform that captures meeting recordings and converts them into structured knowledge.

The system focuses on:

* Meeting transcription
* Summarization
* Action item extraction
* Decision tracking
* Semantic search
* Knowledge retention

---

# Problem Statement

Organizations lose valuable information after meetings because:

* Decisions are forgotten
* Action items are missed
* Meeting notes are inconsistent
* Recordings are rarely reviewed
* Knowledge becomes fragmented

The system solves this problem by transforming recordings into searchable organizational memory.

---

# Core Workflow

```text
Create Meeting
      ↓
Upload Recording
      ↓
Whisper Transcription
      ↓
GPT Summary
      ↓
Action Item Extraction
      ↓
Embedding Generation
      ↓
Storage
      ↓
Semantic Search
```

---

# Core Features

## Authentication

* Register
* Login
* JWT Authentication
* Refresh Tokens
* Role-Based Access Control

---

## Workspace Management

* Create Workspace
* Invite Members
* Assign Roles
* Manage Permissions

---

## Meeting Management

* Create Meeting
* Manage Participants
* Upload Audio
* Upload Video

---

## AI Processing

### Transcription

Input:

```text
Audio Recording
```

Output:

```text
Transcript
```

Technology:

```text
OpenAI Whisper
```

---

### Summarization

Input:

```text
Transcript
```

Output:

```json
{
  "summary": "",
  "decisions": [],
  "actionItems": []
}
```

Technology:

```text
GPT-5
```

---

### Action Item Extraction

Example:

```text
Sam will complete the UI by Friday.
```

Extracted:

```json
{
  "task": "Complete UI",
  "owner": "Sam",
  "deadline": "Friday"
}
```

---

## Semantic Search

Example Query:

```text
What was discussed about deployment?
```

The system retrieves relevant transcript segments and summaries.

Technology:

```text
OpenAI Embeddings
pgvector
PostgreSQL
```

---

# Technical Stack

## Frontend

```text
React
TypeScript
Vite
Tailwind CSS
ShadCN UI
TanStack Query
React Hook Form
Zod
```

---

## Backend

```text
Node.js
Express.js
TypeScript
Prisma ORM
JWT
```

---

## Database

```text
Neon PostgreSQL
pgvector
```

---

## Storage

```text
Cloudinary
```

Stores:

* Audio
* Video
* Images
* Screenshots

---

## Queue System

```text
BullMQ
Redis
```

Handles:

* Transcription Jobs
* Summary Jobs
* Embedding Generation
* Notifications

---

## Deployment

Frontend:

```text
Vercel
```

Backend:

```text
Railway
```

Database:

```text
Neon
```

Redis:

```text
Upstash
```

---

# Knowledge Required For Project A

## Frontend

Learn:

* React Components
* Hooks
* Routing
* Context API
* Forms
* API Integration

---

## TypeScript

Learn:

* Interfaces
* Types
* Generics
* Enums

---

## Backend

Learn:

* REST APIs
* Middleware
* Authentication
* Authorization
* Error Handling

---

## Database

Learn:

* SQL
* Relationships
* Indexes
* Transactions
* Query Optimization

---

## AI

Learn:

* Whisper
* Prompt Engineering
* Structured Outputs
* Embeddings
* Vector Search

---

# Database Design

```text
Users

Workspaces

Meetings

Participants

Recordings

TranscriptChunks

Summaries

ActionItems

Embeddings

Notifications
```

---

# Why Project A Matters

The true value is not transcription.

The real value is:

```text
Institutional Memory
```

The organization can search historical discussions, decisions, and tasks months later.

---

# Project B — AI Knowledge Capture Assistant

## Vision

Project B transforms the Meeting Memory System into a persistent AI assistant.

The assistant becomes:

```text
Eyes
+
Ears
+
Memory
+
Research Assistant
```

---

# Goal

Not:

```text
Remember Meetings
```

Instead:

```text
Remember Everything
```

---

# Inputs

Project A understands:

```text
Audio
```

Project B understands:

```text
Audio
Video
Screen Content
Documents
Slides
Whiteboards
Code
Chat Messages
```

---

# Core Vision

The assistant runs alongside the user and continuously captures knowledge.

Example:

```text
Teacher explains CNN Architecture
```

The assistant:

* Listens to explanation
* Captures slide screenshot
* Reads slide text
* Stores diagram
* Generates notes
* Makes information searchable

---

# Screen Awareness

The assistant understands:

* PowerPoint Slides
* PDFs
* Browser Content
* IDEs
* Diagrams
* Charts
* Whiteboards

---

# Example

Teacher says:

```text
This architecture is important.
```

Traditional AI stores:

```text
This architecture is important.
```

Project B stores:

```text
CNN Architecture Diagram

Explanation

Key Concepts

Screenshot
```

---

# Major Components

## Memory Engine

Stores:

* Meetings
* Screenshots
* Notes
* Documents
* Topics
* Tasks

---

## Vision Engine

Processes:

* Slides
* Charts
* Diagrams
* Whiteboards
* Code

---

## OCR Engine

Extracts visible text from screenshots.

Possible technologies:

```text
Tesseract OCR
GPT Vision
```

---

## Context Engine

Combines:

```text
Audio
+
Vision
+
Historical Knowledge
```

into a unified understanding.

---

## Assistant Engine

Allows users to ask:

```text
What did we learn about merge sort last month?
```

The assistant searches:

* Notes
* Meetings
* Screenshots
* Documents

before answering.

---

# Future Overlay System

A floating assistant window.

Example:

```text
Meeting Assistant

Recording ●

Notes Updating...

Tasks: 3

Decisions: 2
```

Capabilities:

* Live Notes
* Live Summary
* Live Questions
* Live Action Items

---

# Advanced Technologies Required

## Computer Vision

Learn:

* OCR
* Image Captioning
* Visual Understanding

---

## Real-Time Systems

Learn:

* WebSockets
* Streaming APIs
* Event Processing

---

## Desktop Applications

Learn:

```text
Electron
```

or

```text
Tauri
```

for screen awareness.

---

## AI Agents

Learn:

* Tool Calling
* Memory Systems
* Multi-Agent Workflows
* Planning
* Reasoning

---

## Retrieval-Augmented Generation (RAG)

Learn:

* Vector Databases
* Embeddings
* Retrieval Pipelines
* Context Injection

---

# Evolution Path

## Stage 1

Current MVP

```text
Upload Recording
Generate Transcript
Generate Summary
```

---

## Stage 2

Visual Notes

```text
Upload Screenshot
Analyze Screenshot
Attach To Notes
```

---

## Stage 3

Vision Processing

Automatically understand screenshots and diagrams.

---

## Stage 4

Live Transcription

```text
Audio Stream
↓
Live Notes
```

---

## Stage 5

Overlay Assistant

Floating desktop assistant.

---

## Stage 6

Screen Awareness

Assistant sees:

* Slides
* PDFs
* Browser Content
* Code

---

## Stage 7

Context Fusion

Combine:

```text
Speech
+
Visual Context
+
History
```

into unified knowledge.

---

## Stage 8

Personal AI Memory

Users can ask:

```text
What did I learn about operating systems last month?
```

and receive answers from all captured knowledge.

---

# Recommended Development Strategy

Phase 1:

```text
Authentication
Workspace Management
Meetings
```

Phase 2:

```text
Audio Upload
Transcription
```

Phase 3:

```text
Summary
Action Items
```

Phase 4:

```text
Semantic Search
```

Phase 5:

```text
Screenshot Upload
Vision Analysis
```

Phase 6:

```text
Live Notes
```

Phase 7:

```text
Overlay Assistant
```

Phase 8:

```text
Screen Awareness
```

---

# Final Vision

The long-term objective is not to build a meeting summarizer.

The objective is to build a personal AI knowledge layer that can understand what the user hears, sees, learns, and discusses, transforming fragmented information into a permanent searchable memory system.
