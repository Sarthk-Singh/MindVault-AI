# Extractable Components

This file documents component segments in the codebase that can be converted into reusable UI components inside SuperDesign.

## 1. Application Sidebar Navigation Component
- **Source Path**: [Layout.tsx](file:///Users/sarthaksingh/Documents/Projects/MindVault-AI copy/frontend/src/components/Layout.tsx)
- **Proposed Component Name**: `SidebarNav`
- **Description**: Main left side bar containing product navigation links, active states, workspace metadata, and logout trigger.
- **Props**:
  - `activeItem`: `string` (default: `"dashboard"`)

## 2. Application Top Navbar Component
- **Source Path**: [Layout.tsx](file:///Users/sarthaksingh/Documents/Projects/MindVault-AI copy/frontend/src/components/Layout.tsx)
- **Proposed Component Name**: `TopNavBar`
- **Description**: Top header row showing search query bar, user avatar details, and notification badge trigger.
- **Props**:
  - `userName`: `string` (default: `"Alex Graham"`)
  - `notificationCount`: `number` (default: `1`)
