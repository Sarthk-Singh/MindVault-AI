import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PrivateRoute } from "./components/PrivateRoute";
import { Layout } from "./components/Layout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AuthCallback from "./pages/AuthCallback";
import Dashboard from "./pages/Dashboard";
import WorkspaceView from "./pages/WorkspaceView";
import MeetingView from "./pages/MeetingView";
import SearchResults from "./pages/SearchResults";
import MemoryVault from "./pages/MemoryVault";
import Meetings from "./pages/Meetings";
import TeamLibrary from "./pages/TeamLibrary";
import Settings from "./pages/Settings";
import Integrations from "./pages/Integrations";
import HelpCenter from "./pages/HelpCenter";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/auth/callback" element={<AuthCallback />} />

        {/* Protected Routes */}
        <Route element={<PrivateRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/workspaces/:id" element={<WorkspaceView />} />
            <Route path="/meetings/:id" element={<MeetingView />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/memory-vault" element={<MemoryVault />} />
            <Route path="/meetings" element={<Meetings />} />
            <Route path="/team-library" element={<TeamLibrary />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/integrations" element={<Integrations />} />
            <Route path="/help-center" element={<HelpCenter />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
