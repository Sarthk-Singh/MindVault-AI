import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Settings, User, Lock, Mail, Sparkles, CheckCircle2, X, AlertTriangle, ShieldAlert, XCircle } from "lucide-react";
import { authApi } from "../lib/api/auth";

export const SettingsPage: React.FC = () => {
  const [name, setName] = useState("Alex Rivera");
  const [email, setEmail] = useState("alex@company.com");
  
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isGoogleUser, setIsGoogleUser] = useState(false);
  
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteStuff, setDeleteStuff] = useState(true);
  const [deletePreviewData, setDeletePreviewData] = useState<{ workspaces: any[]; meetings: any[] } | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleOpenDeleteModal = async () => {
    setShowDeleteModal(true);
    setIsLoadingPreview(true);
    try {
      const data = await authApi.getDeletePreview();
      setDeletePreviewData(data);
    } catch (err) {
      showToast("Failed to fetch workspace and meeting information.", "error");
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const handleDeleteAccountConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deletePassword) {
      showToast("Please enter your password to confirm.", "error");
      return;
    }

    setIsDeleting(true);
    try {
      await authApi.deleteAccount({
        password: deletePassword,
        deleteStuff
      });

      showToast("Your account has been successfully deleted.");
      setTimeout(() => {
        sessionStorage.removeItem("accessToken");
        sessionStorage.removeItem("refreshToken");
        sessionStorage.removeItem("userName");
        window.location.href = "/login";
      }, 1500);
    } catch (err: any) {
      const errMsg = err?.response?.data?.message || "Failed to delete account. Please verify your password.";
      showToast(errMsg, "error");
    } finally {
      setIsDeleting(false);
    }
  };

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
        if (payload && payload.isGoogleUser) {
          setIsGoogleUser(true);
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

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!isGoogleUser && !currentPassword) || !newPassword || !confirmPassword) {
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

    try {
      await authApi.updatePassword({
        currentPassword: isGoogleUser ? undefined : currentPassword,
        newPassword
      });

      showToast("Password updated successfully!");
      setIsGoogleUser(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      const errMsg = err?.response?.data?.message || "Failed to update password.";
      showToast(errMsg, "error");
    }
  };

  return (
    <>
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
              {!isGoogleUser ? (
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
              ) : (
                <div className="p-4 bg-sky-500/10 border border-sky-500/20 rounded-2xl text-sky-400 text-xs leading-relaxed">
                  <p className="font-semibold">Connected with Google</p>
                  <p className="mt-1 text-sky-400/80">You don't have an account password set. You can set a password below to enable direct email/password sign-in and authorize actions like account deletion.</p>
                </div>
              )}

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

          {/* Danger Zone */}
          <div className="glass-panel p-8 rounded-3xl border border-red-900/30 bg-red-950/5">
            <h3 className="text-lg font-semibold text-red-400 mb-4 flex items-center gap-2 font-display">
              <ShieldAlert className="w-5 h-5 text-red-400" />
              Danger Zone
            </h3>
            <p className="text-slate-400 text-xs mb-6 leading-relaxed">
              Once you delete your account, there is no going back. Please be certain. You will have options to choose how your created workspaces and meetings should be handled.
            </p>
            <button
              type="button"
              onClick={handleOpenDeleteModal}
              className="bg-red-500/10 hover:bg-red-500/25 text-red-400 border border-red-500/20 hover:border-red-500/30 px-6 py-3 rounded-xl font-semibold text-xs transition-all cursor-pointer"
            >
              Delete Account
            </button>
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
    </div>

    {/* Floating toast notification */}
      {toast && createPortal(
        <div className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 glass-panel p-4 rounded-2xl bg-slate-900 shadow-2xl animate-in fade-in slide-in-from-bottom-5 duration-300 border ${
          toast.type === "error" ? "border-red-500/30" : "border-emerald-500/30"
        }`}>
          {toast.type === "error" ? (
            <XCircle className="w-5 h-5 text-red-400 shrink-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          )}
          <span className="text-xs font-semibold text-slate-200">{toast.message}</span>
        </div>,
        document.body
      )}

      {/* Account Deletion Modal */}
      {showDeleteModal && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setShowDeleteModal(false)} />
          
          <div className="relative bg-slate-900/90 border border-slate-800 rounded-[28px] w-full max-w-lg p-8 z-10 shadow-2xl animate-reveal text-slate-200 overflow-y-auto max-h-[90vh] custom-scrollbar">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-400">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white font-display">Delete Account</h3>
                  <p className="text-xs text-slate-400">Verify details and confirm deletion</p>
                </div>
              </div>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="p-1.5 hover:bg-slate-800 transition-colors rounded-xl cursor-pointer text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleDeleteAccountConfirm} className="space-y-6">
              {/* Alert Warning Box */}
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex gap-3 text-red-400 text-xs">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <div className="leading-relaxed">
                  <p className="font-semibold">Warning: This action is permanent</p>
                  <p className="mt-1 text-red-400/80">All personal information will be completely removed. Your created workspaces and meetings can be handled as specified below.</p>
                </div>
              </div>

              {/* Created Content Section */}
              <div className="space-y-4">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Your Created Content</h4>
                
                {isLoadingPreview ? (
                  <div className="flex items-center justify-center py-6">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Workspaces List */}
                    <div>
                      <p className="text-xs text-slate-400 mb-2 font-semibold">Owned Workspaces ({deletePreviewData?.workspaces.length || 0}):</p>
                      {deletePreviewData?.workspaces && deletePreviewData.workspaces.length > 0 ? (
                        <div className="max-h-28 overflow-y-auto border border-slate-850 bg-slate-950/40 p-3 space-y-2 rounded-xl custom-scrollbar">
                          {deletePreviewData.workspaces.map((w) => (
                            <div key={w.id} className="flex justify-between items-center text-xs">
                              <span className="font-medium text-slate-200">{w.name}</span>
                              <span className="text-[10px] text-slate-500">{w.meetingsCount} meetings • {w.membersCount} members</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[11px] text-slate-500 italic">No owned workspaces found.</p>
                      )}
                    </div>

                    {/* Meetings List */}
                    <div>
                      <p className="text-xs text-slate-400 mb-2 font-semibold">Created Meetings in shared workspaces ({deletePreviewData?.meetings.length || 0}):</p>
                      {deletePreviewData?.meetings && deletePreviewData.meetings.length > 0 ? (
                        <div className="max-h-28 overflow-y-auto border border-slate-850 bg-slate-950/40 p-3 space-y-2 rounded-xl custom-scrollbar">
                          {deletePreviewData.meetings.map((m) => (
                            <div key={m.id} className="flex justify-between items-center text-xs">
                              <span className="font-medium text-slate-200">{m.title}</span>
                              <span className="text-[10px] text-slate-500">Workspace: {m.workspaceName}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[11px] text-slate-500 italic">No meetings in other workspaces found.</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Deletion Strategy Selection */}
              <div className="space-y-3">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Content Handling Strategy</label>
                <div className="grid grid-cols-1 gap-3">
                  <label className={`flex items-start gap-3 p-4 border rounded-2xl cursor-pointer transition-all ${
                    deleteStuff 
                      ? "border-red-500/30 bg-red-950/5 text-slate-200" 
                      : "border-slate-800 bg-slate-950/20 text-slate-400 hover:text-slate-300"
                  }`}>
                    <input
                      type="radio"
                      name="deleteStuff"
                      checked={deleteStuff === true}
                      onChange={() => setDeleteStuff(true)}
                      className="mt-1 accent-red-500"
                    />
                    <div className="text-xs">
                      <p className="font-semibold text-slate-200">Delete everything I created</p>
                      <p className="text-[11px] text-slate-500 mt-1">Permanently deletes all workspaces and meetings you created, including all recordings, screenshots, and AI insights.</p>
                    </div>
                  </label>

                  <label className={`flex items-start gap-3 p-4 border rounded-2xl cursor-pointer transition-all ${
                    !deleteStuff 
                      ? "border-sky-500/30 bg-sky-950/5 text-slate-200" 
                      : "border-slate-800 bg-slate-950/20 text-slate-400 hover:text-slate-300"
                  }`}>
                    <input
                      type="radio"
                      name="deleteStuff"
                      checked={deleteStuff === false}
                      onChange={() => setDeleteStuff(false)}
                      className="mt-1 accent-sky-500"
                    />
                    <div className="text-xs">
                      <p className="font-semibold text-slate-200">Leave workspaces & meetings for other members</p>
                      <p className="text-[11px] text-slate-500 mt-1">Transfers workspace ownership to active workspace administrators/managers, and reassigns meeting ownership to the workspace owner.</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Password Verification */}
              <div className="space-y-2 pt-2 border-t border-slate-800/60">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest font-display">Confirm Identity</label>
                <p className="text-[11px] text-slate-500">Enter your password to verify and authorize deletion.</p>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="password"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    required
                    className="w-full bg-slate-950/40 border border-slate-800 focus:border-red-500/50 rounded-xl py-3 pl-11 pr-4 text-slate-200 outline-none text-sm input-glow transition-all"
                    placeholder="Enter your account password"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800/60">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-semibold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isDeleting}
                  className="bg-red-600 hover:bg-red-500 disabled:bg-red-800 disabled:opacity-80 text-white px-5 py-3 rounded-xl font-semibold text-xs shadow-lg shadow-red-500/20 transition-all cursor-pointer"
                >
                  {isDeleting ? "Deleting Account..." : "Confirm Account Deletion"}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default SettingsPage;
