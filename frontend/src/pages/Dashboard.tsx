import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "../lib/zodResolver";
import { z } from "zod";
import { workspacesApi, Workspace } from "../lib/api/workspaces";
import { meetingsApi } from "../lib/api/meetings";
import {
  Brain,
  Video,
  Zap,
  Share2,
  CalendarClock,
  Users,
  Sparkles,
  ChevronRight,
  Plus,
  FileText,
  FolderClosed,
  TrendingUp,
  CheckCircle,
  X,
  MessageSquare
} from "lucide-react";

const workspaceSchema = z.object({
  name: z.string().min(1, "Workspace Name is required.")
});

type WorkspaceInput = z.infer<typeof workspaceSchema>;

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const userName = sessionStorage.getItem("userName") || "Alex Rivera";

  // Forms
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<WorkspaceInput>({
    resolver: zodResolver(workspaceSchema)
  });

  // Queries
  const { data: workspaces = [], isLoading: isWorkspacesLoading } = useQuery({
    queryKey: ["workspaces"],
    queryFn: workspacesApi.listWorkspaces
  });

  // Fetch recent meetings for all workspaces in parallel
  const { data: allMeetings = [], isLoading: isMeetingsLoading } = useQuery({
    queryKey: ["allMeetings", workspaces.map(w => w.id)],
    queryFn: async () => {
      if (!workspaces || workspaces.length === 0) return [];
      const meetingsPromises = workspaces.map((w) =>
        meetingsApi.listMeetings(w.id).catch(() => [])
      );
      const results = await Promise.all(meetingsPromises);
      return results.flat().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    },
    enabled: workspaces.length > 0
  });

  // Mutations
  const createWorkspaceMutation = useMutation({
    mutationFn: (data: WorkspaceInput) => workspacesApi.createWorkspace(data.name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      setIsModalOpen(false);
      reset();
    }
  });

  const onSubmit = (data: WorkspaceInput) => {
    createWorkspaceMutation.mutate(data);
  };

  const workspaceIcons = [
    { icon: "terminal", color: "text-sky-400 bg-sky-500/10" },
    { icon: "brush", color: "text-purple-400 bg-purple-500/10" },
    { icon: "payments", color: "text-emerald-400 bg-emerald-500/10" },
    { icon: "strategy", color: "text-orange-400 bg-orange-500/10" }
  ];

  if (isWorkspacesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-white tracking-tight font-display mb-1">
            Welcome back, {userName}
          </h1>
          <p className="text-slate-400 text-sm">
            Here is what's happening across your {workspaces.length} workspaces today.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="magnetic-target flex items-center gap-2 bg-gradient-to-r from-[#0ea5e9] to-[#a855f7] hover:scale-[1.02] text-white px-6 py-3.5 rounded-xl font-semibold text-sm shadow-xl shadow-blue-500/20 active:scale-[0.98] transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Create New Workspace
        </button>
      </div>

      {/* Grid Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1 */}
        <div className="stat-card glass-panel rounded-3xl p-6 relative overflow-hidden group hover:-translate-y-1">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-sky-500/10 flex items-center justify-center text-sky-400">
              <Brain className="w-6 h-6" />
            </div>
            <div>
              <p className="text-slate-400 text-xs">Stored Memories</p>
              <p className="text-2xl font-bold text-white font-display">12,842</p>
            </div>
          </div>
          <div className="flex items-center text-xs text-emerald-400 gap-1">
            <TrendingUp className="w-4 h-4" />
            <span>+12% this week</span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="stat-card glass-panel rounded-3xl p-6 relative overflow-hidden group hover:-translate-y-1">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-400">
              <Video className="w-6 h-6" />
            </div>
            <div>
              <p className="text-slate-400 text-xs">Analyzed Meetings</p>
              <p className="text-2xl font-bold text-white font-display">{allMeetings.length || 438}</p>
            </div>
          </div>
          <div className="flex items-center text-xs text-emerald-400 gap-1">
            <TrendingUp className="w-4 h-4" />
            <span>+8 new today</span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="stat-card glass-panel rounded-3xl p-6 relative overflow-hidden group hover:-translate-y-1">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-pink-500/10 flex items-center justify-center text-pink-400">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <p className="text-slate-400 text-xs">AI Insights</p>
              <p className="text-2xl font-bold text-white font-display">2.4k</p>
            </div>
          </div>
          <div className="flex items-center text-xs text-slate-500 gap-1">
            <span>Based on vault context</span>
          </div>
        </div>

        {/* Card 4 */}
        <div className="stat-card glass-panel rounded-3xl p-6 relative overflow-hidden group hover:-translate-y-1">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-400">
              <Share2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-slate-400 text-xs">Knowledge Score</p>
              <p className="text-2xl font-bold text-white font-display">98%</p>
            </div>
          </div>
          <div className="flex items-center text-xs text-emerald-400 gap-1">
            <CheckCircle className="w-4 h-4" />
            <span>Highly consistent</span>
          </div>
        </div>
      </div>

      {workspaces.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-10 text-center glass-panel rounded-[32px] min-h-[400px]">
          <div className="mb-6 mx-auto w-36 h-36 bg-slate-900/50 rounded-full flex items-center justify-center border border-slate-800">
            <FolderClosed className="w-16 h-16 text-slate-500" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2 font-display">No Workspaces Found</h2>
          <p className="text-slate-400 text-sm mb-6 max-w-md w-full">
            You haven't created or joined any workspaces yet. Create your first workspace to start organizing your meetings and AI summaries.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-3 bg-gradient-to-r from-[#0ea5e9] to-[#a855f7] text-white font-semibold text-sm rounded-xl hover:scale-102 transition-transform cursor-pointer"
          >
            Create My First Workspace
          </button>
        </div>
      ) : (
        <>
          {/* Workspaces Grid */}
          <section>
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2 font-display">
              <span className="material-symbols-outlined text-primary text-xl">workspaces</span>
              Active Workspaces
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {workspaces.map((workspace: Workspace, idx: number) => {
                const iconSet = workspaceIcons[idx % workspaceIcons.length];
                const memberCount = workspace.members?.length || 1;
                const meetingCount = workspace.meetings?.length || 0;

                return (
                  <div
                    key={workspace.id}
                    onClick={() => navigate(`/workspaces/${workspace.id}`)}
                    className="group glass-panel rounded-3xl p-6 hover:-translate-y-1 cursor-pointer relative overflow-hidden flex flex-col"
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div className={`w-12 h-12 rounded-2xl ${iconSet.color} flex items-center justify-center`}>
                        <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                          {iconSet.icon}
                        </span>
                      </div>
                      <span className="material-symbols-outlined text-slate-500 group-hover:text-white transition-colors">
                        more_vert
                      </span>
                    </div>

                    <h4 className="text-lg font-semibold text-white mb-1 truncate font-display">
                      {workspace.name}
                    </h4>

                    <div className="flex items-center gap-2 text-slate-400 text-xs mt-1">
                      <span className="material-symbols-outlined text-[16px]">group</span>
                      <span>
                        {memberCount} {memberCount === 1 ? "Member" : "Members"}
                      </span>
                    </div>

                    <div className="mt-8 pt-4 border-t border-slate-800/50 flex justify-between items-center text-xs text-slate-500">
                      <span>
                        {meetingCount} {meetingCount === 1 ? "Meeting" : "Meetings"}
                      </span>
                      <ChevronRight className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all" />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Main split: Recent activities & Active team */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Recent Activity List */}
            <div className="lg:col-span-8 glass-panel rounded-[32px] p-8">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2 font-display">
                  <CalendarClock className="w-5 h-5 text-primary" />
                  Recent Activity
                </h3>
                <button className="text-xs font-medium text-sky-400 hover:text-sky-300 transition-colors">
                  View Archive
                </button>
              </div>

              {isMeetingsLoading ? (
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : allMeetings.length === 0 ? (
                <div className="text-center p-8 text-slate-400 text-sm">
                  No recent meeting uploads found.
                </div>
              ) : (
                <div className="space-y-4">
                  {allMeetings.slice(0, 5).map((meeting: any) => {
                    const formattedDate = new Date(meeting.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric"
                    });

                    return (
                      <div
                        key={meeting.id}
                        onClick={() => navigate(`/meetings/${meeting.id}`)}
                        className="group p-4 rounded-2xl border border-slate-800/80 bg-slate-900/30 hover:bg-slate-800/40 transition-all flex items-center justify-between cursor-pointer"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 border border-slate-700">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors">
                              {meeting.title}
                            </p>
                            <p className="text-xs text-slate-500 mt-0.5">
                              {meeting.status} • {formattedDate}
                            </p>
                          </div>
                        </div>
                        <button className="p-2 rounded-lg bg-slate-800/50 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Sidebar widgets */}
            <div className="lg:col-span-4 space-y-6">
              {/* Active Team */}
              <div className="glass-panel rounded-[32px] p-8">
                <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2 font-display">
                  <Users className="w-5 h-5 text-purple-400" />
                  Active Team
                </h3>
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah"
                          className="w-10 h-10 rounded-full border border-slate-800"
                          alt="Sarah Chen"
                        />
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-[#0a0e27] rounded-full"></span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-200">Sarah Chen</p>
                        <p className="text-[10px] text-slate-500">Product Lead</p>
                      </div>
                    </div>
                    <button className="text-slate-500 hover:text-sky-400">
                      <MessageSquare className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src="https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus"
                          className="w-10 h-10 rounded-full border border-slate-800"
                          alt="Marcus Thorne"
                        />
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-[#0a0e27] rounded-full"></span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-200">Marcus Thorne</p>
                        <p className="text-[10px] text-slate-500">Backend Engineer</p>
                      </div>
                    </div>
                    <button className="text-slate-500 hover:text-sky-400">
                      <MessageSquare className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src="https://api.dicebear.com/7.x/avataaars/svg?seed=Jasmine"
                          className="w-10 h-10 rounded-full border border-slate-800"
                          alt="Jasmine Lee"
                        />
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-slate-600 border-2 border-[#0a0e27] rounded-full"></span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-200">Jasmine Lee</p>
                        <p className="text-[10px] text-slate-500">UX Researcher</p>
                      </div>
                    </div>
                    <button className="text-slate-500 hover:text-sky-400">
                      <MessageSquare className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <button className="w-full mt-8 py-3 rounded-xl bg-slate-800/50 hover:bg-slate-800 text-slate-300 text-xs font-semibold transition-all border border-slate-700/50">
                  Invite Team Members
                </button>
              </div>

              {/* Weekly Insight */}
              <div className="glass-panel rounded-[32px] p-6 bg-gradient-to-tr from-purple-900/20 to-sky-900/20 border-purple-500/20">
                <div className="flex flex-col items-center text-center py-4">
                  <Sparkles className="w-8 h-8 text-purple-400 mb-4" />
                  <h4 className="text-white font-semibold mb-2 font-display">Weekly Insight</h4>
                  <p className="text-xs text-slate-400 leading-relaxed max-w-[240px]">
                    "Based on the last 5 product syncs, the team is consistently highlighting scalability as a Q4 risk factor."
                  </p>
                  <a href="#" className="mt-4 text-[10px] uppercase tracking-widest text-[#0ea5e9] hover:text-sky-300 font-bold">
                    Read Analysis
                  </a>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Create Workspace Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-md">
          <div className="modal-backdrop absolute inset-0" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-slate-900/90 border border-slate-800 rounded-3xl w-full max-w-[520px] shadow-2xl overflow-hidden p-8 flex flex-col gap-6 z-10 animate-in fade-in zoom-in duration-300">
            <div className="flex justify-between items-start">
              <h3 className="text-xl font-semibold text-white font-display">New Workspace</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Workspace Name Input */}
              <div className="input-group relative">
                <input
                  type="text"
                  placeholder=" "
                  id="workspace-name"
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3.5 text-slate-200 outline-none input-glow transition-all duration-300 peer text-sm"
                  {...register("name")}
                />
                <label htmlFor="workspace-name" className="floating-label absolute left-4 top-3.5 text-slate-500 text-sm">
                  Workspace Name (e.g. Marketing Team)
                </label>
                {errors.name && (
                  <p className="text-error text-xs mt-1 pl-1">{errors.name.message}</p>
                )}
              </div>

              {/* Icon selection */}
              <div>
                <label className="text-slate-400 text-xs font-medium block mb-2">Icon Accent Color</label>
                <div className="flex gap-4">
                  <button type="button" className="w-8 h-8 rounded-full bg-sky-500 ring-2 ring-offset-2 ring-sky-500 ring-offset-slate-900" />
                  <button type="button" className="w-8 h-8 rounded-full bg-purple-500" />
                  <button type="button" className="w-8 h-8 rounded-full bg-emerald-500" />
                  <button type="button" className="w-8 h-8 rounded-full bg-orange-500" />
                </div>
              </div>

              {/* Privacy Setting Option */}
              <div>
                <label className="text-slate-400 text-xs font-medium block mb-2">Privacy Setting</label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 border-2 border-sky-500 bg-sky-500/10 rounded-2xl cursor-pointer">
                    <p className="font-semibold text-sm text-sky-400">Private</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Invite only access</p>
                  </div>
                  <div className="p-4 border border-slate-800 bg-slate-900/30 rounded-2xl hover:border-slate-700 transition-colors cursor-pointer">
                    <p className="font-semibold text-sm text-slate-200">Shared</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Open to organization</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800/50">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-800 hover:bg-slate-800 text-sm font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createWorkspaceMutation.isPending}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#0ea5e9] to-[#a855f7] text-white text-sm font-semibold shadow-lg shadow-blue-500/10 hover:opacity-90 transition-all disabled:opacity-50"
                >
                  {createWorkspaceMutation.isPending ? "Creating..." : "Create Workspace"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
