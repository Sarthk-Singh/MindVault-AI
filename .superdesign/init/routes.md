# Route and Page Mapping

This application uses standard `react-router-dom` configuration. The routing layout maps each client path to its designated page component and layout.

## App Routes Configuration

| Path | Element | Layout | Accessibility | Description |
|---|---|---|---|---|
| `/login` | `Login` | *None* | Public | Login screen containing credentials form and logo. |
| `/register` | `Register` | *None* | Public | User signup screen with form fields and role selector. |
| `/` | `Dashboard` | `Layout` | Protected | Dashboard homepage, listing active workspaces and recent meetings. Includes create workspace dialog. |
| `/workspaces/:id` | `WorkspaceView` | `Layout` | Protected | Workspace details, listing all workspace members and meeting cards. Includes workspace invitation and new meeting dialog. |
| `/meetings/:id` | `MeetingView` | `Layout` | Protected | Individual meeting details containing tabs for Transcript, AI Summary, Action Items, Decisions, and Slides. |
| `/search` | `SearchResults` | `Layout` | Protected | Matches transcript keywords, OCR details, and summarizes highlights. Includes filter tab controls. |

### Core Router Source Code

- File: [App.tsx](file:///Users/sarthaksingh/Documents/Projects/MindVault-AI copy/frontend/src/App.tsx)

```tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PrivateRoute } from "./components/PrivateRoute";
import { Layout } from "./components/Layout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import WorkspaceView from "./pages/WorkspaceView";
import MeetingView from "./pages/MeetingView";
import SearchResults from "./pages/SearchResults";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes */}
        <Route element={<PrivateRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/workspaces/:id" element={<WorkspaceView />} />
            <Route path="/meetings/:id" element={<MeetingView />} />
            <Route path="/search" element={<SearchResults />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```
