import React, { useState, useEffect } from "react";
import { Settings, User, Lock, Mail, Sparkles, CheckCircle2 } from "lucide-react";

export const SettingsPage: React.FC = () => {
  const [name, setName] = useState("Alex Rivera");
  const [email, setEmail] = useState("alex@company.com");
  
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    const savedName = sessionStorage.getItem("userName");
    if (savedName) setName(savedName);
    
    // Attempt to parse email from token if available, otherwise use a placeholder
    const token = sessionStorage.getItem("accessToken");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        if (payload && payload.email) {
          setEmail(payload.email);
        }
      } catch (e) {
        console.warn("Could not parse email from accessToken", e);
      }
    }
  }, []);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast("Name cannot be empty.", "error");
      return;
    }
    
    // Save to sessionStorage so Layout/Sidebar renders the updated name
    sessionStorage.setItem("userName", name.trim());
    showToast("Profile name updated successfully!");
    
    // Trigger custom event or dispatch so Layout can re-render immediately
    window.dispatchEvent(new Event("storage"));
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      showToast("Please fill in all password fields.", "error");
      return;
    }
    
    if (newPassword.length < 8) {
      showToast("New password must be at least 8 characters long.", "error");
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast("Confirm password does not match new password.", "error");
      return;
    }

    // Mock successful update
    showToast("Password updated successfully!");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="flex-grow flex flex-col h-full max-w-4xl mx-auto space-y-8 animate-reveal relative">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold text-white tracking-tight font-display mb-1 flex items-center gap-3">
          <Settings className="w-8 h-8 text-primary" />
          Settings
        </h1>
        <p className="text-slate-400 text-sm">
          Manage your personal profile, security configuration, and account settings.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Left Side: Forms */}
        <div className="md:col-span-8 space-y-8">
          {/* Profile Details Card */}
          <div className="glass-panel p-8 rounded-3xl border border-slate-800 bg-slate-900/10">
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2 font-display">
              <User className="w-5 h-5 text-sky-400" />
              Profile Details
            </h3>

            <form onSubmit={handleProfileSubmit} className="space-y-6">
              {/* Name Input */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest font-display">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-950/40 border border-slate-800 focus:border-primary/50 rounded-xl py-3 pl-11 pr-4 text-slate-200 outline-none text-sm input-glow transition-all"
                    placeholder="Enter your name"
                  />
                </div>
              </div>

              {/* Email Input (Read Only) */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest font-display">Email Address</label>
                <div className="relative opacity-60">
                  <Mail className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    readOnly
                    className="w-full bg-slate-950/20 border border-slate-800/80 rounded-xl py-3 pl-11 pr-4 text-slate-400 outline-none text-sm cursor-not-allowed"
                    placeholder="Email address"
                  />
                </div>
                <p className="text-[10px] text-slate-500">Email addresses are tied to authentication and cannot be changed.</p>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-800/50">
                <button
                  type="submit"
                  className="bg-gradient-to-r from-sky-500 to-purple-500 hover:scale-[1.02] text-white px-6 py-3 rounded-xl font-semibold text-xs shadow-lg shadow-blue-500/10 active:scale-[0.98] transition-all cursor-pointer"
                >
                  Save Profile Changes
                </button>
              </div>
            </form>
          </div>

          {/* Security & Password Card */}
          <div className="glass-panel p-8 rounded-3xl border border-slate-800 bg-slate-900/10">
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2 font-display">
              <Lock className="w-5 h-5 text-purple-400" />
              Update Password
            </h3>

            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              {/* Current Password */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest font-display">Current Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full bg-slate-950/40 border border-slate-800 focus:border-primary/50 rounded-xl py-3 pl-11 pr-4 text-slate-200 outline-none text-sm input-glow transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {/* New Password */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest font-display">New Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-slate-950/40 border border-slate-800 focus:border-primary/50 rounded-xl py-3 pl-11 pr-4 text-slate-200 outline-none text-sm input-glow transition-all"
                    placeholder="Min. 8 characters"
                  />
                </div>
              </div>

              {/* Confirm New Password */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest font-display">Confirm New Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-slate-950/40 border border-slate-800 focus:border-primary/50 rounded-xl py-3 pl-11 pr-4 text-slate-200 outline-none text-sm input-glow transition-all"
                    placeholder="Re-enter new password"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-800/50">
                <button
                  type="submit"
                  className="bg-gradient-to-r from-sky-500 to-purple-500 hover:scale-[1.02] text-white px-6 py-3 rounded-xl font-semibold text-xs shadow-lg shadow-blue-500/10 active:scale-[0.98] transition-all cursor-pointer"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Side: Quick Info Panel */}
        <div className="md:col-span-4 space-y-6">
          <div className="glass-panel rounded-3xl p-6 bg-gradient-to-br from-slate-900/60 to-purple-950/20 border border-slate-800">
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden mb-4 shadow-xl">
                <img
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`}
                  alt="avatar"
                  className="w-full h-full"
                />
              </div>
              <h4 className="text-white font-semibold text-lg font-display">{name}</h4>
              <p className="text-xs text-slate-500 mt-0.5">{email}</p>
              <span className="mt-4 px-2.5 py-1 rounded-full text-[10px] font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20 uppercase tracking-wider">
                System Administrator
              </span>
            </div>
            
            <div className="mt-6 pt-6 border-t border-slate-800/60 text-xs text-slate-400 space-y-3 font-medium">
              <div className="flex justify-between">
                <span>Account Status:</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  Active
                </span>
              </div>
              <div className="flex justify-between">
                <span>Plan:</span>
                <span className="text-purple-400 font-semibold">Pro Enterprise</span>
              </div>
              <div className="flex justify-between">
                <span>Joined Date:</span>
                <span className="text-slate-500">October 12, 2025</span>
              </div>
            </div>
          </div>
          
          <div className="glass-panel rounded-3xl p-6 bg-gradient-to-tr from-purple-900/20 to-sky-900/20 border-purple-500/20">
            <div className="flex flex-col items-center text-center py-2">
              <Sparkles className="w-7 h-7 text-purple-400 mb-3 animate-pulse" />
              <h4 className="text-white font-semibold text-sm mb-1 font-display">System Status</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                All cloud pipelines, ocr parsers, and semantic matching servers are running at 100% capacity.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Floating toast notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 glass-panel p-4 rounded-2xl bg-slate-900 border-emerald-500/30 shadow-2xl animate-in fade-in slide-in-from-bottom-5 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold text-slate-200">{toast.message}</span>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
