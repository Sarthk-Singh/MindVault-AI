import React, { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Database,
  Video,
  Users2,
  Puzzle,
  Settings,
  HelpCircle,
  LogOut,
  Bell,
  Search,
  BrainCircuit
} from "lucide-react";
import { NeuralCanvas } from "./NeuralCanvas";
import { CustomCursor } from "./CustomCursor";

export const Layout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [userName, setUserName] = useState("Alex Rivera");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const savedUser = localStorage.getItem("userName");
    if (savedUser) {
      setUserName(savedUser);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userName");
    navigate("/login");
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  const linkClass = (path: string) => {
    const active = isActive(path);
    return `nav-item flex items-center gap-4 px-4 py-3 text-sm font-medium transition-all ${
      active
        ? "active text-white bg-white/5 rounded-xl"
        : "text-slate-400 hover:text-white"
    }`;
  };

  return (
    <div className="bg-background text-slate-200 min-h-screen flex relative overflow-hidden font-body">
      {/* Background visual components */}
      <div className="mesh-gradient" />
      <NeuralCanvas opacity={0.3} particleCount={40} />
      <CustomCursor />

      {/* Sidebar Navigation */}
      <aside className="w-72 glass-panel border-r border-slate-800 hidden md:flex flex-col z-20 sticky top-0 h-screen">
        <div className="p-8 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#0ea5e9] to-[#a855f7] flex items-center justify-center shadow-lg shadow-blue-500/20">
            <BrainCircuit className="text-2xl text-white w-6 h-6" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white font-display">MindVault</span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          <Link to="/" className={linkClass("/")}>
            <LayoutDashboard className="w-5 h-5" />
            <span>Dashboard</span>
          </Link>
          <Link to="/" className={linkClass("/vault")}>
            <Database className="w-5 h-5" />
            <span>Memory Vault</span>
          </Link>
          <Link to="/" className={linkClass("/meetings")}>
            <Video className="w-5 h-5" />
            <span>Meetings</span>
          </Link>
          <Link to="/" className={linkClass("/workspaces")}>
            <Users2 className="w-5 h-5" />
            <span>Team Library</span>
          </Link>

          <div className="pt-8 pb-4 px-4 text-[10px] uppercase tracking-widest text-slate-500 font-display font-semibold">
            System
          </div>
          
          <a href="#" className="nav-item flex items-center gap-4 px-4 py-3 text-sm font-medium text-slate-400 hover:text-white">
            <Puzzle className="w-5 h-5" />
            <span>Integrations</span>
          </a>
          <a href="#" className="nav-item flex items-center gap-4 px-4 py-3 text-sm font-medium text-slate-400 hover:text-white">
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </a>
        </nav>

        {/* Storage status & help / logout actions */}
        <div className="p-6 mt-auto space-y-4 border-t border-slate-800">
          <div className="glass-panel p-4 rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/50">
            <p className="text-xs text-slate-400 mb-2 font-medium">Vault Storage</p>
            <div className="w-full h-1.5 bg-slate-800 rounded-full mb-2">
              <div className="w-[72%] h-full bg-gradient-to-r from-sky-500 to-purple-500 rounded-full"></div>
            </div>
            <p className="text-[10px] text-slate-500 font-medium">14.2 GB of 20 GB used</p>
          </div>

          <div className="flex flex-col gap-1">
            <a
              href="#"
              className="flex items-center gap-4 px-4 py-2 text-slate-400 hover:text-white text-xs font-medium transition-all"
            >
              <HelpCircle className="w-4 h-4" />
              <span>Help Center</span>
            </a>
            <button
              onClick={handleLogout}
              className="flex items-center gap-4 px-4 py-2 text-left text-error hover:bg-red-500/10 transition-all rounded-xl text-xs font-medium"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-grow flex flex-col h-screen overflow-hidden">
        {/* Top Header */}
        <header className="h-20 glass-panel border-b border-slate-800 flex items-center justify-between px-8 sticky top-0 z-30">
          <div className="flex items-center gap-6 flex-1">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-medium text-white font-display">Engineering Workspace</h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20 uppercase tracking-tighter">
                PRO
              </span>
            </div>

            {/* Header Search Input */}
            <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center bg-slate-900/50 px-4 py-2 rounded-full gap-3 border border-slate-800 focus-within:border-sky-500/50 w-72 transition-all">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search transcripts, meetings..."
                className="bg-transparent border-none text-xs w-full outline-none text-slate-200"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
          </div>

          <div className="flex items-center gap-6">
            {/* Notification bell */}
            <div className="relative cursor-pointer group">
              <Bell className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-purple-500 rounded-full"></span>
            </div>

            {/* Profile trigger */}
            <div className="flex items-center gap-3 px-3 py-1.5 rounded-full hover:bg-white/5 transition-colors cursor-pointer border border-slate-800">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-white">{userName}</p>
                <p className="text-[10px] text-slate-500">Lead Architect</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden">
                <img
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(userName)}`}
                  alt="avatar"
                  className="w-full h-full"
                />
              </div>
            </div>
          </div>
        </header>

        {/* Content View */}
        <main className="flex-grow overflow-y-auto p-8 custom-scrollbar relative">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
