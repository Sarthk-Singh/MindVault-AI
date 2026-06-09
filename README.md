# MindVault-AI

> Transform Meetings Into Searchable Knowledge.

MindVault-AI is an AI-powered meeting intelligence platform that transcribes conversations, extracts action items, analyzes visual context, and creates a searchable knowledge repository for teams, students, educators, and organizations.

The platform is designed to eliminate information loss by converting meetings, discussions, lectures, and recordings into structured knowledge that can be searched, shared, and reused.

---

## Problem

Meetings generate valuable knowledge, but most of it is lost.

Common challenges include:

* Forgotten decisions
* Missing action items
* Unstructured meeting notes
* Long recordings that are never revisited
* Knowledge scattered across multiple platforms
* No efficient way to search historical discussions

MindVault-AI solves this by turning conversations into an organized, searchable memory system.

---

## Features

### Current Platform (Project A)

* AI-powered transcription
* Meeting summaries
* Action item extraction
* Decision tracking
* Screenshot analysis
* Semantic search
* Workspace management
* Meeting management
* Role-based access control
* Cloud-native architecture

---

## Future Vision (Project B)

MindVault-AI is being designed to evolve into a full AI Knowledge Capture Assistant.

Future capabilities include:

* Real-time meeting assistance
* Live note generation
* AI overlay
* Screen awareness
* Visual context understanding
* Personal knowledge memory
* Context-aware retrieval

---

## Architecture

```text
Frontend (React)
        │
        ▼
Backend API (Express)
        │
        ▼
Neon PostgreSQL + pgvector
        │
 ┌──────┴─────────┐
 │                │
 ▼                ▼

Cloudinary      BullMQ
 Storage         Queue
                   │
                   ▼

            Gemini AI
```

---

## Technology Stack

### Frontend

* React
* TypeScript
* Vite
* Tailwind CSS
* ShadCN UI
* TanStack Query
* React Hook Form
* Zod

### Backend

* Node.js
* Express.js
* TypeScript
* Prisma ORM
* JWT Authentication

### Database

* Neon PostgreSQL
* pgvector

### Storage

* Cloudinary

### Queue

* BullMQ
* Upstash Redis

### AI

* Gemini 2.5 Flash
* Gemini Embeddings

### Deployment

* Vercel
* Render

---

## Project Structure

```text
MindVault-AI/
│
├── backend/
│
├── frontend/
│
├── docs/
│   ├── ROADMAP.md
│
├── PROJECT_CONTEXT.md
│
├── README.md
│
├── package.json
│
└── .gitignore
```

---

## Core Workflow

```text
Create Meeting
       │
       ▼

Upload Recording
       │
       ▼

AI Transcription
       │
       ▼

Summary Generation
       │
       ▼

Action Item Extraction
       │
       ▼

Decision Extraction
       │
       ▼

Embedding Generation
       │
       ▼

Semantic Search
```

---

## Getting Started

### Clone Repository

```bash
git clone https://github.com/your-username/MindVault-AI.git
cd MindVault-AI
```

### Install Dependencies

```bash
npm install
```

### Start Frontend

```bash
npm run dev:frontend
```

### Start Backend

```bash
npm run dev:backend
```

---

## Environment Variables

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

---

## Roadmap

* [ ] Authentication & RBAC
* [ ] Workspace Management
* [ ] Meeting Management
* [ ] Recording Uploads
* [ ] AI Summaries
* [ ] Action Item Extraction
* [ ] Decision Tracking
* [ ] Semantic Search
* [ ] Screenshot Analysis
* [ ] Live Notes
* [ ] AI Overlay
* [ ] Screen Awareness

---

## License

MIT License

---

## Author

**Sarthak**

Founder @ IntrinsAI
