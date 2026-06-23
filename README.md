# MindVault AI

> Transform Meetings and Visual Content Into a Searchable Knowledge Base.

MindVault AI is an enterprise-grade, AI-powered meeting intelligence and visual capture platform. It automatically transcribes audio and video recordings, extracts action items and key decisions, analyzes slides and screenshots, and generates a vectorized knowledge repository for teams.

With MindVault AI, organizational knowledge is never lost—it is structured, indexed, and made instantly queryable via semantic natural language search.

---

## Technical Architecture & Data Flow

```text
               ┌────────────────────────┐
               │    React Frontend      │
               │   (Vite + React Query) │
               └───────────┬────────────┘
                           │ HTTPS / REST
                           ▼
               ┌────────────────────────┐
               │   Express Backend API  │
               └─────┬───────────┬──────┘
                     │           │
     ┌───────────────┘           └────────────────┐
     │ Writes Job                                 │ Database Queries
     ▼                                            ▼
┌──────────────┐                          ┌────────────────────────┐
│    BullMQ    │                          │     Neon PostgreSQL    │
│ Queue (Redis)│                          │      + pgvector        │
└──────┬───────┘                          └───────────▲────────────┘
       │                                              │
       │ Processes Tasks                              │ Stores Embeddings
       ▼                                              │ & Relations
┌──────────────┐                                      │
│  Background  │◄─────────────────────────────────────┘
│  Worker Node ◄──────────────┐
└──────┬───────┘              │
       │                      │
       ├──────────────────────┼───────────────────────┐
       │ Transcribe / OCR /   │ Embeddings            │ Media Uploads
       ▼ Summarize            ▼                       ▼
┌──────────────┐      ┌──────────────┐        ┌──────────────┐
│  Gemini AI   │      │    Gemini    │        │  Cloudinary  │
│ 2.5 Flash    │      │  Embeddings  │        │   Storage    │
└──────────────┘      └──────────────┘        └──────────────┘
```

---

## Key Features

### 🔐 Authentication & Session Management
*   **Hybrid Authentication**: Support for secure local email/password login as well as **Google OAuth 2.0** social login.
*   **Forced Password Setup**: Users signing up via Google OAuth are prompted to set up a local password, enabling seamless login across different auth schemes.
*   **Dual-Token Sessions**: Secure authentication using Access and Refresh tokens stored in `localStorage` for cross-tab persistence and automatic silent token refreshing.

### 🏢 Multi-Tenant Workspace & Role Management
*   **Custom Workspaces**: Create, manage, and isolate workflows inside team-specific workspaces.
*   **Email Invitation Pipeline**:
    *   *Registered Users*: Added instantly to workspaces, with an notification email dispatched.
    *   *New Users*: Generates a 7-day secure token, sending a registration/join link via email. Upon signing up, the user is automatically added to the target workspace.
*   **Role-Based Access Control (RBAC)**: Support for four distinct roles:
    *   `ADMIN`: Full platform configuration, user auditing, and workspace setup.
    *   `WORKSPACE_MANAGER`: Workspace configuration, user role promotions/demotions, and invite management.
    *   `MEETING_OWNER`: Can upload recordings, manage screenshots, and trigger AI analysis.
    *   `TEAM_MEMBER`: Can search, view transcripts, and read summaries.

### 🎙️ Advanced Meeting Upload & Multimedia Pipeline
*   **Audio/Video Hosting**: Integrates Cloudinary with Multer for secure, cloud-native file storage of video and audio recordings.
*   **Slide/Screenshot Captures**: Upload meeting slides, whiteboards, or screenshots to visually supplement transcripts.

### 🧠 Gemini-Powered Meeting Intelligence
*   **Multimodal Transcription**: Uses **Gemini 2.5 Flash** to perform verbatim audio-to-text transcriptions directly from audio/video payloads.
*   **Intelligent Summaries & Key Points**: Automatically condenses long discussions into key takeaways and bulleted summaries.
*   **Action Item & Owner Extraction**: Automatically detects assignments (e.g., *"Sam will finish the API by Friday"*) and extracts them into structured action cards containing the task and assignee.
*   **Decision Tracking**: Parses discussions to build a clean log of all aligned agreements and decisions.
*   **Visual Screenshot Analysis (OCR + Summary)**: Runs OCR on uploaded screenshots, summarizing visual diagrams and extracting conceptual tags.

### 🔍 Memory Vault & Semantic Search
*   **Vectorized Memory Layer**: Generates 768-dimensional vector embeddings for all transcripts, summaries, action items, and screenshot text using **Gemini Embeddings** (`models/text-embedding-004` / `models/gemini-embedding-001`).
*   **Contextual Semantic Queries**: Retrieve exact meeting moments by asking questions in natural language (e.g., *"What did we decide about database scaling?"*). The system queries vector data in PostgreSQL via `pgvector` and outputs relevant chunks sorted by similarity percentage.

### ⚡ Queue System & Performance Caching
*   **BullMQ Async Processing**: Long-running transcription, summary, and embedding tasks are offloaded to an asynchronous background worker queue backed by Redis, displaying live job statuses (`PENDING`, `PROCESSING`, `DONE`, `FAILED`) on the UI.
*   **Optimized React Query Caching**: Configured with a `staleTime` of 30 seconds and `gcTime` of 5 minutes. Navigating between views is instant, eliminating loading spinners and redundant network requests.

---

## Technology Stack

### Frontend
*   **Framework**: React (Vite, TypeScript)
*   **Styling**: Tailwind CSS + CSS variables
*   **Component System**: ShadCN UI + Lucide Icons
*   **State & Caching**: TanStack React Query (v5)
*   **Forms & Validation**: React Hook Form + Zod

### Backend
*   **Runtime**: Node.js (TypeScript)
*   **API Framework**: Express.js
*   **ORM**: Prisma Client (PostgreSQL)
*   **Authentication**: Passport.js (Google OAuth2.0) + JWT (jsonwebtoken)
*   **Task Queue**: BullMQ + Redis (Upstash)
*   **Email Deliverability**: SMTP (Nodemailer)

### AI & Media Hosting
*   **Large Language Model**: Gemini 2.5 Flash (Transcription, Summarization, Visual OCR, Action Items)
*   **Embeddings**: Google Gemini Text Embeddings (models/text-embedding-004)
*   **Vector Database**: Neon Serverless PostgreSQL with the `pgvector` extension
*   **Media Hosting**: Cloudinary

---

## Project Directory Structure

```text
MindVault-AI/
├── backend/                  # Express REST API & Worker
│   ├── prisma/               # Schema and DB migrations
│   ├── src/
│   │   ├── config/           # Envs, Passport auth configurations
│   │   ├── middleware/       # Auth guards, role checks, upload limits
│   │   ├── modules/          # Auth, Workspace, Meeting logic
│   │   ├── queue/            # BullMQ job queue definitions
│   │   ├── services/         # Gemini, Embeddings, Nodemailer services
│   │   ├── worker.ts         # Asynchronous job queue worker
│   │   └── index.ts          # Express API server entry
│   └── tsconfig.json
├── frontend/                 # Vite SPA Frontend
│   ├── src/
│   │   ├── components/       # Layouts, Navigation, canvases
│   │   ├── lib/              # API clients, axios configurations, resolvers
│   │   ├── pages/            # View components (Dashboard, Settings, Vault)
│   │   ├── index.css         # Styling system
│   │   └── main.tsx          # App entry with QueryClient setup
│   └── package.json
├── package.json              # Monorepo workspace configurations
└── README.md
```

---

## Getting Started

### 1. Prerequisites
Ensure you have the following installed on your machine:
*   Node.js (v18 or higher)
*   Redis Server (or Upstash Redis URL)
*   Neon PostgreSQL Database with `pgvector` enabled

### 2. Clone and Install
```bash
git clone https://github.com/your-username/MindVault-AI.git
cd MindVault-AI
npm install
```

### 3. Setup Environment Variables
Create a `.env` file in the `backend/` directory:
```env
# Database Connections
DATABASE_URL="postgresql://user:pass@host/dbname?sslmode=require"

# Server Configurations
PORT=3001
NODE_ENV=development
FRONTEND_URL="http://localhost:5173"

# JWT Config
JWT_SECRET="your-jwt-access-secret"
JWT_REFRESH_SECRET="your-jwt-refresh-secret"

# AI Integrations
GEMINI_API_KEY="your-google-gemini-api-key"

# Cloud Media Hosting
CLOUDINARY_CLOUD_NAME="your-cloudinary-name"
CLOUDINARY_API_KEY="your-cloudinary-key"
CLOUDINARY_API_SECRET="your-cloudinary-secret"

# Queue System
REDIS_URL="rediss://default:your-redis-pass@your-redis-host:6379"

# Google Auth Integration
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GOOGLE_CALLBACK_URL="http://localhost:3001/api/auth/google/callback"

# Email Delivery Configurations (SMTP)
googleSMTP_HOST="smtp.gmail.com"
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password-from-google"
```

Create a `.env` file in the `frontend/` directory:
```env
VITE_API_URL="http://localhost:3001/api"
```

### 4. Database Setup & Client Generation
Run migrations and generate the Prisma Client in the backend workspace:
```bash
cd backend
npx prisma db push
npx prisma generate
cd ..
```

### 5. Running the Application
MindVault AI uses npm workspaces. You can run all processes from the root folder:

*   **Start the Backend API Server**:
    ```bash
    npm run dev:backend
    ```
*   **Start the Background Queue Worker**:
    ```bash
    npm run worker --workspace @mindvault-ai/backend
    ```
*   **Start the Frontend Dev Server**:
    ```bash
    npm run dev:frontend
    ```

Once running, navigate to `http://localhost:5173` to access the platform.

---

## Future Roadmap (Project B)
MindVault AI is designed to evolve beyond meeting recordings into a **continuous AI Knowledge Capture Assistant**:
*   [ ] **Live Note Generation**: Stream audio directly to transcribers for real-time summaries.
*   [ ] **Tauri/Electron Desktop Wrapper**: For native screen awareness, OCR, and capture controls.
*   [ ] **Overlay HUD**: A floating utility window for instant search and context tracking in third-party applications.
*   [ ] **Multi-Agent Research Assistant**: Connect to external docs, whiteboards, and code repositories to synthesize organizational context.

---

## License
Licensed under the [MIT License](LICENSE).
