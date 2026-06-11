# Page Component Dependency Trees

This document tracks all page views and their dependency hierarchies (local sub-components, styling files, layout components, and api wrappers).

## Page Dependency Mapping

### 1. Login Page
- **URL Path**: `/login`
- **Component File**: [Login.tsx](file:///Users/sarthaksingh/Documents/Projects/MindVault-AI copy/frontend/src/pages/Login.tsx)
- **Dependencies**:
  - [zodResolver.ts](file:///Users/sarthaksingh/Documents/Projects/MindVault-AI copy/frontend/src/lib/zodResolver.ts)
  - [auth.ts](file:///Users/sarthaksingh/Documents/Projects/MindVault-AI copy/frontend/src/lib/api/auth.ts)
  - [index.css](file:///Users/sarthaksingh/Documents/Projects/MindVault-AI copy/frontend/src/index.css)

### 2. Register Page
- **URL Path**: `/register`
- **Component File**: [Register.tsx](file:///Users/sarthaksingh/Documents/Projects/MindVault-AI copy/frontend/src/pages/Register.tsx)
- **Dependencies**:
  - [zodResolver.ts](file:///Users/sarthaksingh/Documents/Projects/MindVault-AI copy/frontend/src/lib/zodResolver.ts)
  - [auth.ts](file:///Users/sarthaksingh/Documents/Projects/MindVault-AI copy/frontend/src/lib/api/auth.ts)
  - [index.css](file:///Users/sarthaksingh/Documents/Projects/MindVault-AI copy/frontend/src/index.css)

### 3. Dashboard Homepage
- **URL Path**: `/`
- **Component File**: [Dashboard.tsx](file:///Users/sarthaksingh/Documents/Projects/MindVault-AI copy/frontend/src/pages/Dashboard.tsx)
- **Layout Element**: [Layout.tsx](file:///Users/sarthaksingh/Documents/Projects/MindVault-AI copy/frontend/src/components/Layout.tsx)
- **Dependencies**:
  - [zodResolver.ts](file:///Users/sarthaksingh/Documents/Projects/MindVault-AI copy/frontend/src/lib/zodResolver.ts)
  - [workspaces.ts](file:///Users/sarthaksingh/Documents/Projects/MindVault-AI copy/frontend/src/lib/api/workspaces.ts)
  - [meetings.ts](file:///Users/sarthaksingh/Documents/Projects/MindVault-AI copy/frontend/src/lib/api/meetings.ts)
  - [index.css](file:///Users/sarthaksingh/Documents/Projects/MindVault-AI copy/frontend/src/index.css)

### 4. Workspace View Page
- **URL Path**: `/workspaces/:id`
- **Component File**: [WorkspaceView.tsx](file:///Users/sarthaksingh/Documents/Projects/MindVault-AI copy/frontend/src/pages/WorkspaceView.tsx)
- **Layout Element**: [Layout.tsx](file:///Users/sarthaksingh/Documents/Projects/MindVault-AI copy/frontend/src/components/Layout.tsx)
- **Dependencies**:
  - [zodResolver.ts](file:///Users/sarthaksingh/Documents/Projects/MindVault-AI copy/frontend/src/lib/zodResolver.ts)
  - [workspaces.ts](file:///Users/sarthaksingh/Documents/Projects/MindVault-AI copy/frontend/src/lib/api/workspaces.ts)
  - [meetings.ts](file:///Users/sarthaksingh/Documents/Projects/MindVault-AI copy/frontend/src/lib/api/meetings.ts)
  - [index.css](file:///Users/sarthaksingh/Documents/Projects/MindVault-AI copy/frontend/src/index.css)

### 5. Meeting View Page
- **URL Path**: `/meetings/:id`
- **Component File**: [MeetingView.tsx](file:///Users/sarthaksingh/Documents/Projects/MindVault-AI copy/frontend/src/pages/MeetingView.tsx)
- **Layout Element**: [Layout.tsx](file:///Users/sarthaksingh/Documents/Projects/MindVault-AI copy/frontend/src/components/Layout.tsx)
- **Dependencies**:
  - [meetings.ts](file:///Users/sarthaksingh/Documents/Projects/MindVault-AI copy/frontend/src/lib/api/meetings.ts)
  - [ai.ts](file:///Users/sarthaksingh/Documents/Projects/MindVault-AI copy/frontend/src/lib/api/ai.ts)
  - [index.css](file:///Users/sarthaksingh/Documents/Projects/MindVault-AI copy/frontend/src/index.css)

### 6. Search Results Page
- **URL Path**: `/search`
- **Component File**: [SearchResults.tsx](file:///Users/sarthaksingh/Documents/Projects/MindVault-AI copy/frontend/src/pages/SearchResults.tsx)
- **Layout Element**: [Layout.tsx](file:///Users/sarthaksingh/Documents/Projects/MindVault-AI copy/frontend/src/components/Layout.tsx)
- **Dependencies**:
  - [index.css](file:///Users/sarthaksingh/Documents/Projects/MindVault-AI copy/frontend/src/index.css)
