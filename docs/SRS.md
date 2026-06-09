# Software Requirements Specification (SRS)
# AI Meeting Memory System (AMMS)

Version: 1.0

Prepared For: Academic Major Project

Prepared By: Sarthak and Team

---

# Table of Contents

1. Introduction
2. Project Vision
3. Problem Statement
4. Objectives
5. Scope
6. User Roles
7. System Architecture
8. Technology Stack
9. Functional Requirements
10. Non-Functional Requirements
11. Database Design
12. API Specifications
13. AI Processing Pipeline
14. Semantic Search Design
15. Screenshot Analysis Module
16. Security Requirements
17. Deployment Architecture
18. Testing Strategy
19. Future Roadmap (Project A → Project B)
20. Acceptance Criteria

---

# 1. Introduction

The AI Meeting Memory System (AMMS) is a web-based platform that transforms meeting recordings, screenshots, and notes into structured, searchable knowledge.

The platform captures organizational memory through AI-powered transcription, summarization, action-item extraction, decision extraction, screenshot analysis, and semantic retrieval.

---

# 2. Project Vision

## Current Vision (Project A)

Build a production-grade meeting intelligence platform capable of:

- Meeting management
- Audio/video uploads
- AI transcription
- AI summaries
- Action item extraction
- Decision extraction
- Screenshot analysis
- Semantic search

## Future Vision (Project B)

Evolve into an AI Knowledge Capture Assistant capable of:

- Real-time meeting assistance
- Screen awareness
- Visual understanding
- Live note generation
- AI overlay
- Personal knowledge memory

---

# 3. Problem Statement

Organizations lose critical information because:

- Meeting recordings are rarely revisited.
- Decisions become difficult to trace.
- Action items are forgotten.
- Knowledge is scattered across platforms.
- Visual content from meetings is not preserved.

The system creates a centralized, searchable memory repository.

---

# 4. Objectives

1. Automate meeting documentation.
2. Improve knowledge retention.
3. Extract decisions automatically.
4. Track action items.
5. Enable semantic retrieval.
6. Reduce manual note-taking effort.
7. Establish a foundation for future AI assistants.

---

# 5. Scope

## In Scope

- Authentication
- Workspace management
- Meeting management
- Recording uploads
- AI transcription
- AI summaries
- Action items
- Decision extraction
- Screenshot uploads
- Screenshot analysis
- Semantic search
- Notifications

## Out of Scope

- Desktop screen monitoring
- Live screen awareness
- Autonomous AI agents
- Native mobile applications

---

# 6. User Roles

## Team Member

- View meetings
- Access summaries
- Search knowledge
- Receive notifications

## Meeting Owner

- Create meetings
- Upload recordings
- Manage participants

## Workspace Manager

- Manage workspace
- Access reports
- Monitor activity

## Administrator

- User management
- Audit monitoring
- System configuration

---

# 7. System Architecture

Frontend
→ API Layer
→ PostgreSQL Database

Background Services:

Uploads
→ Queue
→ AI Processing
→ Database

Components:

- React Frontend
- Express Backend
- PostgreSQL
- Redis Queue
- Gemini AI Services
- Cloudinary Storage

---

# 8. Technology Stack

## Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- ShadCN UI
- TanStack Query
- React Hook Form
- Zod

## Backend

- Node.js
- Express.js
- TypeScript
- Prisma ORM
- JWT Authentication

## Database

- Neon PostgreSQL
- pgvector

## Storage

- Cloudinary

## Queue

- BullMQ
- Upstash Redis

## AI

- Gemini 2.5 Flash
- Gemini Embeddings

## Deployment

- Vercel
- Render
- Neon
- Cloudinary
- Upstash

---

# 9. Functional Requirements

## FR-01 Authentication

- Register
- Login
- Logout
- Refresh Tokens

## FR-02 Workspace Management

- Create Workspace
- Update Workspace
- Invite Members

## FR-03 Meeting Management

- Create Meeting
- Update Meeting
- Delete Meeting

## FR-04 Recording Upload

- Audio Upload
- Video Upload

## FR-05 Transcription

- Generate Transcript
- Store Transcript

## FR-06 Summarization

- Generate Summary
- Generate Key Points

## FR-07 Action Items

- Extract Tasks
- Assign Owners
- Track Status

## FR-08 Decision Extraction

- Identify Decisions
- Store Decisions

## FR-09 Screenshot Analysis

- Upload Screenshots
- Analyze Slides
- Analyze Diagrams
- Extract Text

## FR-10 Semantic Search

- Natural Language Search
- Similarity Retrieval

## FR-11 Notifications

- Summary Ready
- Task Assigned
- Meeting Shared

## FR-12 Audit Logs

- User Actions
- Admin Actions

---

# 10. Non-Functional Requirements

## Performance

- API response < 500ms for common reads.
- Search response < 2 seconds.

## Reliability

- Daily backups.
- Retry failed jobs.

## Security

- JWT authentication.
- Password hashing.

## Scalability

- Queue-based processing.
- Stateless APIs.

## Availability

- 99% uptime target.

---

# 11. Database Design

## Users

- id
- name
- email
- password
- role

## Workspaces

- id
- name
- ownerId

## Meetings

- id
- title
- workspaceId
- date

## Recordings

- id
- meetingId
- fileUrl

## TranscriptChunks

- id
- meetingId
- content

## Summaries

- id
- meetingId
- summary

## Decisions

- id
- meetingId
- decision

## ActionItems

- id
- meetingId
- assignee
- task

## Screenshots

- id
- meetingId
- imageUrl

## Embeddings

- id
- sourceId
- vector

---

# 12. API Specifications

## Authentication

POST /api/auth/register

POST /api/auth/login

POST /api/auth/logout

## Meetings

GET /api/meetings

POST /api/meetings

GET /api/meetings/:id

PATCH /api/meetings/:id

DELETE /api/meetings/:id

## Uploads

POST /api/uploads/audio

POST /api/uploads/video

POST /api/uploads/screenshot

## AI

POST /api/transcribe

POST /api/summarize

POST /api/action-items

POST /api/screenshot-analysis

## Search

POST /api/search

---

# 13. AI Processing Pipeline

Recording
→ Upload
→ Queue
→ Gemini Processing
→ Transcript

Transcript
→ Summary

Transcript
→ Action Items

Transcript
→ Decisions

Transcript
→ Embeddings

Embeddings
→ Semantic Search

---

# 14. Semantic Search Design

User Query
→ Embedding Generation
→ Vector Search
→ Similarity Matching
→ Relevant Results

Technology:

- Gemini Embeddings
- pgvector

---

# 15. Screenshot Analysis Module

Purpose:

Capture important visual knowledge.

Examples:

- Lecture Slides
- Diagrams
- Whiteboards
- Architecture Images

Output:

- OCR Text
- Summary
- Concepts
- Notes

---

# 16. Security Requirements

- Password Hashing
- JWT Authentication
- RBAC
- Input Validation
- SQL Injection Protection
- Rate Limiting
- Audit Logging
- Secure Upload Validation

---

# 17. Deployment Architecture

Frontend:
Vercel

Backend:
Render

Database:
Neon PostgreSQL

Storage:
Cloudinary

Queue:
Upstash Redis

AI:
Gemini API

---

# 18. Testing Strategy

## Unit Tests

- Services
- Utilities

## Integration Tests

- APIs
- Database

## End-to-End Tests

- Meeting Workflow
- Search Workflow

## Security Tests

- Authentication
- Authorization

---

# 19. Future Roadmap

## Stage 1

Meeting Memory System

## Stage 2

Screenshot Analysis

## Stage 3

Visual Knowledge Capture

## Stage 4

Live Transcription

## Stage 5

AI Overlay

## Stage 6

Screen Awareness

## Stage 7

Context Fusion

## Stage 8

Personal AI Memory

---

# 20. Acceptance Criteria

The project will be considered complete when:

- Users can create meetings.
- Users can upload recordings.
- AI generates transcripts.
- AI generates summaries.
- AI extracts action items.
- AI extracts decisions.
- Users can upload screenshots.
- Screenshots are analyzed.
- Semantic search works.
- RBAC is enforced.
- Application is deployed.

---

# Required Environment Variables

```env
DATABASE_URL=

JWT_SECRET=
JWT_REFRESH_SECRET=

GEMINI_API_KEY=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

REDIS_URL=

FRONTEND_URL=
```
