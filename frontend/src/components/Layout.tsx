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
  BrainCircuit,
  X,
  Lock
} from "lucide-react";
import { NeuralCanvas } from "./NeuralCanvas";
import { CustomCursor } from "./CustomCursor";
import { authApi } from "../lib/api/auth";

export const Layout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [userName, setUserName] = useState("Alex Rivera");
  const [userEmail, setUserEmail] = useState("");
  const [userRole, setUserRole] = useState("TEAM_MEMBER");
  const [userCode, setUserCode] = useState("");
  const [copiedCode, setCopiedCode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Force Google OAuth users to set a password on first login
  const [isGoogleUserForceSetup, setIsGoogleUserForceSetup] = useState(false);
  const [forceNewPassword, setForceNewPassword] = useState("");
  const [forceConfirmPassword, setForceConfirmPassword] = useState("");
  const [isForceSubmitting, setIsForceSubmitting] = useState(false);
  const [forceError, setForceError] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await authApi.getCurrentUser();
        if (user) {
          if (user.name) setUserName(user.name);
          if (user.email) setUserEmail(user.email);
          if (user.role) setUserRole(user.role);
          if (user.userId) {
            setUserCode(user.userId);
            sessionStorage.setItem("userIdCode", user.userId);
          }
        }
      } catch (err) {
        console.warn("Failed to fetch fresh user profile", err);
      }
    };

    const token = sessionStorage.getItem("accessToken");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        if (payload) {
          if (payload.name) setUserName(payload.name);
          if (payload.email) setUserEmail(payload.email);
          if (payload.role) setUserRole(payload.role);
          if (payload.userId) {
            setUserCode(payload.userId);
            sessionStorage.setItem("userIdCode", payload.userId);
          }
          
          if (payload.isGoogleUser) {
            setIsGoogleUserForceSetup(true);
          } else {
            setIsGoogleUserForceSetup(false);
          }
        }
      } catch (e) {
        console.warn("Could not parse token in Layout", e);
      }
    }

    fetchUser();
  }, []);

  const handleForcePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForceError("");

    if (!forceNewPassword || !forceConfirmPassword) {
      setForceError("Please fill in all fields.");
      return;
    }

    if (forceNewPassword.length < 8) {
      setForceError("Password must be at least 8 characters long.");
      return;
    }

    if (forceNewPassword !== forceConfirmPassword) {
      setForceError("Passwords do not match.");
      return;
    }

    setIsForceSubmitting(true);
    try {
      await authApi.updatePassword({
        newPassword: forceNewPassword
      });

      setIsGoogleUserForceSetup(false);
      setForceNewPassword("");
      setForceConfirmPassword("");
    } catch (err: any) {
      const errMsg = err?.response?.data?.message || "Failed to set password. Please try again.";
      setForceError(errMsg);
    } finally {
      setIsForceSubmitting(false);
    }
  };

  const handleCopyCode = () => {
    if (!userCode) return;
    navigator.clipboard.writeText(userCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  useEffect(() => {
    const updateUserName = () => {
      const savedUser = sessionStorage.getItem("userName");
      if (savedUser) {
        setUserName(savedUser);
      }
    };
    updateUserName();

    window.addEventListener("storage", updateUserName);
    return () => {
      window.removeEventListener("storage", updateUserName);
    };
  }, []);

  // Close dropdown menu when clicking outside
  useEffect(() => {
    if (!showProfileMenu) return;

    const handleCloseMenu = () => {
      setShowProfileMenu(false);
    };

    const timer = setTimeout(() => {
      window.addEventListener("click", handleCloseMenu);
    }, 10);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("click", handleCloseMenu);
    };
  }, [showProfileMenu]);

  const handleLogout = () => {
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("refreshToken");
    sessionStorage.removeItem("userName");
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
          <Link to="/memory-vault" className={linkClass("/memory-vault")}>
            <Database className="w-5 h-5" />
            <span>Memory Vault</span>
          </Link>
          <Link to="/meetings" className={linkClass("/meetings")}>
            <Video className="w-5 h-5" />
            <span>Meetings</span>
          </Link>
          <Link to="/team-library" className={linkClass("/team-library")}>
            <Users2 className="w-5 h-5" />
            <span>Team Library</span>
          </Link>

          <div className="pt-8 pb-4 px-4 text-[10px] uppercase tracking-widest text-slate-500 font-display font-semibold">
            System
          </div>
          
          <Link to="/integrations" className={linkClass("/integrations")}>
            <Puzzle className="w-5 h-5" />
            <span>Integrations</span>
          </Link>
          <Link to="/settings" className={linkClass("/settings")}>
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </Link>
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
            <Link
              to="/help-center"
              className={`flex items-center gap-4 px-4 py-2 text-slate-400 hover:text-white text-xs font-medium transition-all rounded-xl ${
                isActive("/help-center") ? "text-white bg-white/5" : ""
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              <span>Help Center</span>
            </Link>
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
            <div className="relative">
              <div
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-3 px-3 py-1.5 rounded-full hover:bg-white/5 transition-colors cursor-pointer border border-slate-800"
              >
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-white">{userName}</p>
                  <p className="text-[10px] text-slate-500 font-medium">Lead Architect</p>
                </div>
                <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden">
                  <img
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(userName)}`}
                    alt="avatar"
                    className="w-full h-full"
                  />
                </div>
              </div>

              {/* Profile Dropdown Menu */}
              {showProfileMenu && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-slate-900/90 border border-slate-800 rounded-xl py-2 shadow-2xl z-50 backdrop-blur-md animate-reveal">
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      setShowProfileModal(true);
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    Profile
                  </button>
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      navigate("/settings");
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    Settings
                  </button>
                  <div className="border-t border-slate-800 my-1"></div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-xs font-semibold text-error hover:bg-red-500/10 transition-colors cursor-pointer"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content View */}
        <main className="flex-grow overflow-y-auto p-8 custom-scrollbar relative">
          <Outlet />
        </main>
      </div>

      {/* User Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setShowProfileModal(false)} />
          
          <div className="relative bg-slate-900/90 border border-slate-800 rounded-[24px] w-full max-w-sm p-6 z-10 shadow-2xl animate-reveal text-slate-200">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-base font-bold text-white font-display">User Profile</h3>
                <p className="text-[10px] text-slate-400">Your account information and details</p>
              </div>
              <button
                onClick={() => setShowProfileModal(false)}
                className="p-1 hover:bg-slate-800 transition-colors rounded-lg cursor-pointer text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider block mb-0.5">Registered Name</label>
                <p className="text-xs font-semibold text-white">{userName}</p>
              </div>

              <div>
                <label className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider block mb-0.5">Role / Designation</label>
                <p className="text-xs font-semibold text-white">{userRole}</p>
              </div>

              <div>
                <label className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider block mb-0.5">Email</label>
                <p className="text-xs font-semibold text-white">{userEmail}</p>
              </div>

              <div>
                <label className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider block mb-0.5">Your User ID</label>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-xs font-semibold text-white font-mono bg-slate-950/40 px-3 py-1.5 rounded-lg border border-slate-800/85">{userCode || "N/A"}</p>
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    disabled={!userCode}
                    className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer text-[10px] font-semibold flex items-center gap-1 shrink-0"
                  >
                    {copiedCode ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setShowProfileModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-semibold transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Force Google User Password Setup */}
      {isGoogleUserForceSetup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
          <div className="relative bg-slate-900 border border-slate-800 rounded-[28px] w-full max-w-md p-8 shadow-2xl text-slate-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-400">
                <Lock className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white font-display">Create Account Password</h3>
                <p className="text-xs text-slate-400">Set a password for your account</p>
              </div>
            </div>

            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              Since you signed in via Google, you need to create a password for your account. This password will allow you to sign in directly using your email and password in the future.
            </p>

            <form onSubmit={handleForcePasswordSubmit} className="space-y-4">
              {/* New Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest font-display">New Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="password"
                    required
                    value={forceNewPassword}
                    onChange={(e) => setForceNewPassword(e.target.value)}
                    className="w-full bg-slate-950/40 border border-slate-800 focus:border-sky-500/50 rounded-xl py-3 pl-11 pr-4 text-slate-200 outline-none text-sm input-glow transition-all"
                    placeholder="Min. 8 characters"
                  />
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest font-display">Confirm Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="password"
                    required
                    value={forceConfirmPassword}
                    onChange={(e) => setForceConfirmPassword(e.target.value)}
                    className="w-full bg-slate-950/40 border border-slate-800 focus:border-sky-500/50 rounded-xl py-3 pl-11 pr-4 text-slate-200 outline-none text-sm input-glow transition-all"
                    placeholder="Re-enter password"
                  />
                </div>
              </div>

              {forceError && (
                <p className="text-xs text-red-400 font-medium">{forceError}</p>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isForceSubmitting}
                  className="w-full bg-gradient-to-r from-sky-500 to-purple-500 hover:scale-[1.01] active:scale-[0.99] text-white py-3 rounded-xl font-semibold text-xs shadow-lg shadow-blue-500/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isForceSubmitting ? "Setting Password..." : "Set Password & Continue"}
                </button>
              </div>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-xs text-slate-500 hover:text-slate-300 underline cursor-pointer"
                >
                  Log Out / Switch Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;
