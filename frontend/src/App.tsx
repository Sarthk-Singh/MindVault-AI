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
