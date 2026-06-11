import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "../lib/zodResolver";
import { z } from "zod";
import { workspacesApi } from "../lib/api/workspaces";
import { meetingsApi } from "../lib/api/meetings";
import {
  FolderClosed,
  Video,
  Plus,
  Search,
  Calendar,
  ChevronRight,
  X,
  User,
  SlidersHorizontal
} from "lucide-react";

const inviteSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  role: z.enum(["ADMIN", "WORKSPACE_MANAGER", "MEETING_OWNER", "TEAM_MEMBER"])
});

const meetingSchema = z.object({
  title: z.string().min(1, "Meeting Title is required."),
  date: z.string().min(1, "Meeting Date is required.")
});

type InviteInput = z.infer<typeof inviteSchema>;
type MeetingInput = z.infer<typeof meetingSchema>;

export const WorkspaceView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isMeetingOpen, setIsMeetingOpen] = useState(false);
  const [searchFilter, setSearchFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Statuses");

  // Forms
  const inviteForm = useForm<InviteInput>({
    resolver: zodResolver(inviteSchema),
    defaultValues: { role: "TEAM_MEMBER" }
  });

  const meetingForm = useForm<MeetingInput>({
    resolver: zodResolver(meetingSchema)
  });

  // Queries
  const { data: workspace, isLoading, isError } = useQuery({
    queryKey: ["workspace", id],
    queryFn: () => workspacesApi.getWorkspace(id!),
    enabled: !!id
  });

  // Mutations
  const inviteMutation = useMutation({
    mutationFn: (data: InviteInput) =>
      workspacesApi.inviteMember(id!, data.email, data.role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspace", id] });
      setIsInviteOpen(false);
      inviteForm.reset();
    }
  });

  const createMeetingMutation = useMutation({
    mutationFn: (data: MeetingInput) =>
      meetingsApi.createMeeting(data.title, id!, data.date),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspace", id] });
      setIsMeetingOpen(false);
      meetingForm.reset();
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isError || !workspace) {
    return (
      <div className="text-center p-8 bg-red-500/10 border border-red-500/20 text-error text-sm rounded-2xl max-w-lg mx-auto">
        Failed to load workspace. Make sure you have access permission.
      </div>
    );
  }

  const meetings = workspace.meetings || [];
  const members = workspace.members || [];

  const filteredMeetings = meetings.filter((meeting) => {
    const matchesSearch = meeting.title.toLowerCase().includes(searchFilter.toLowerCase());
    const matchesStatus = statusFilter === "All Statuses" || meeting.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleInviteSubmit = (data: InviteInput) => {
    inviteMutation.mutate(data);
  };

  const handleMeetingSubmit = (data: MeetingInput) => {
    createMeetingMutation.mutate(data);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto h-full items-start">
      {/* Workspace Sidebar Panel */}
      <div className="w-full lg:w-[320px] glass-panel rounded-3xl p-6 flex flex-col shrink-0">
        <div className="mb-6 pb-6 border-b border-slate-800/60">
          <div className="flex items-center gap-2 mb-3">
            <FolderClosed className="w-5 h-5 text-sky-400" />
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20 uppercase tracking-wider">
              Active Project
            </span>
          </div>
          <h2 className="text-xl font-semibold text-white truncate font-display">{workspace.name}</h2>
          <p className="text-xs text-slate-500 mt-1">
            Created {new Date(workspace.createdAt).toLocaleDateString()} • {meetings.length} Meetings
          </p>
        </div>

        {/* Team Members List */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest font-display">
              Members ({members.length})
            </h3>
            <button
              onClick={() => setIsInviteOpen(true)}
              className="text-xs font-medium text-sky-400 hover:text-sky-300 transition-colors"
            >
              Invite
            </button>
          </div>

          <div className="space-y-3 max-h-[340px] overflow-y-auto pr-2 custom-scrollbar">
            {members.map((member) => (
              <div key={member.id} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full border border-slate-800 overflow-hidden bg-slate-900/50 flex items-center justify-center">
                  <User className="w-5 h-5 text-slate-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-200 truncate">
                    {member.user?.name || "Workspace Member"}
                  </p>
                  <p className="text-[10px] text-slate-500 truncate mt-0.5">{member.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Meetings Section */}
      <div className="flex-1 w-full space-y-6">
        {/* Controls & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 max-w-md">
            {/* Search filter input */}
            <div className="flex items-center bg-slate-900/50 px-4 py-2.5 rounded-xl border border-slate-800 focus-within:border-sky-500/50 flex-1 gap-3">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search meetings..."
                className="bg-transparent border-none text-xs w-full outline-none text-slate-200"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
              />
            </div>

            {/* Status Filter selector */}
            <div className="relative bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-2.5 flex items-center gap-2 cursor-pointer hover:bg-slate-800/40">
              <SlidersHorizontal className="w-4 h-4 text-slate-400" />
              <select
                className="bg-transparent border-none text-xs text-slate-200 outline-none cursor-pointer appearance-none pr-4"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All Statuses" className="bg-slate-900">All Statuses</option>
                <option value="DONE" className="bg-slate-900">DONE</option>
                <option value="PROCESSING" className="bg-slate-900">PROCESSING</option>
                <option value="FAILED" className="bg-slate-900">FAILED</option>
              </select>
            </div>
          </div>

          <button
            onClick={() => setIsMeetingOpen(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-[#0ea5e9] to-[#a855f7] hover:scale-[1.02] text-white px-5 py-3 rounded-xl font-semibold text-sm shadow-xl shadow-blue-500/10 active:scale-[0.98] transition-all cursor-pointer justify-center"
          >
            <Plus className="w-4 h-4" />
            New Meeting
          </button>
        </div>

        {/* Meetings Grid / List */}
        <div className="glass-panel rounded-[32px] overflow-hidden border border-slate-800/80">
          {filteredMeetings.length === 0 ? (
            <div className="text-center py-16 text-slate-400 text-sm">
              No meetings found matching your filter criteria.
            </div>
          ) : (
            <div className="divide-y divide-slate-800/60">
              {filteredMeetings.map((meeting) => {
                const formattedDate = new Date(meeting.date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric"
                });

                return (
                  <div
                    key={meeting.id}
                    onClick={() => navigate(`/meetings/${meeting.id}`)}
                    className="p-5 hover:bg-white/5 transition-colors group cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 border border-slate-700">
                        <Video className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors">
                          {meeting.title}
                        </h4>
                        <div className="flex items-center gap-2 text-slate-500 text-xs mt-1">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{formattedDate}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-6">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase ${
                          meeting.status === "DONE"
                            ? "bg-green-500/10 text-green-400 border border-green-500/20"
                            : meeting.status === "PROCESSING"
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse"
                            : meeting.status === "FAILED"
                            ? "bg-red-500/10 text-red-400 border border-red-500/20"
                            : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                        }`}
                      >
                        {meeting.status}
                      </span>
                      
                      <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-white transition-colors" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Invite Member Modal */}
      {isInviteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-md">
          <div className="modal-backdrop absolute inset-0" onClick={() => setIsInviteOpen(false)} />
          <div className="relative bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-[500px] shadow-2xl overflow-hidden p-8 flex flex-col gap-6 z-10 animate-in fade-in zoom-in duration-300">
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-semibold text-white font-display">Invite Team Member</h3>
              <button
                onClick={() => setIsInviteOpen(false)}
                className="p-1 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={inviteForm.handleSubmit(handleInviteSubmit)} className="space-y-6">
              {/* Member email */}
              <div className="input-group relative">
                <input
                  type="email"
                  placeholder=" "
                  id="invite-email"
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3.5 text-slate-200 outline-none input-glow transition-all duration-300 peer text-sm"
                  {...inviteForm.register("email")}
                />
                <label htmlFor="invite-email" className="floating-label absolute left-4 top-3.5 text-slate-500 text-sm">
                  Work Email Address
                </label>
                {inviteForm.formState.errors.email && (
                  <p className="text-error text-xs mt-1 pl-1">{inviteForm.formState.errors.email.message}</p>
                )}
              </div>

              {/* Role setting */}
              <div className="input-group relative">
                <select
                  id="invite-role"
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3.5 text-slate-200 outline-none input-glow transition-all duration-300 peer text-sm appearance-none cursor-pointer"
                  {...inviteForm.register("role")}
                >
                  <option value="TEAM_MEMBER" className="bg-slate-900 text-slate-200">TEAM_MEMBER</option>
                  <option value="WORKSPACE_MANAGER" className="bg-slate-900 text-slate-200">WORKSPACE_MANAGER</option>
                  <option value="MEETING_OWNER" className="bg-slate-900 text-slate-200">MEETING_OWNER</option>
                  <option value="ADMIN" className="bg-slate-900 text-slate-200">ADMIN</option>
                </select>
                <label htmlFor="invite-role" className="floating-label absolute left-4 top-3.5 text-slate-500 text-sm">
                  Role Permission
                </label>
                <div className="absolute right-4 top-3.5 text-slate-500 pointer-events-none">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800/50">
                <button
                  type="button"
                  onClick={() => setIsInviteOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-800 hover:bg-slate-800 text-sm font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={inviteMutation.isPending}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#0ea5e9] to-[#a855f7] text-white text-sm font-semibold shadow-lg shadow-blue-500/10 hover:opacity-90 transition-all disabled:opacity-50"
                >
                  {inviteMutation.isPending ? "Inviting..." : "Send Invitation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Meeting Modal */}
      {isMeetingOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-md">
          <div className="modal-backdrop absolute inset-0" onClick={() => setIsMeetingOpen(false)} />
          <div className="relative bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-[500px] shadow-2xl overflow-hidden p-8 flex flex-col gap-6 z-10 animate-in fade-in zoom-in duration-300">
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-semibold text-white font-display">New Meeting Session</h3>
              <button
                onClick={() => setIsMeetingOpen(false)}
                className="p-1 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={meetingForm.handleSubmit(handleMeetingSubmit)} className="space-y-6">
              {/* Meeting title */}
              <div className="input-group relative">
                <input
                  type="text"
                  placeholder=" "
                  id="meeting-title"
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3.5 text-slate-200 outline-none input-glow transition-all duration-300 peer text-sm"
                  {...meetingForm.register("title")}
                />
                <label htmlFor="meeting-title" className="floating-label absolute left-4 top-3.5 text-slate-500 text-sm">
                  Meeting Session Title
                </label>
                {meetingForm.formState.errors.title && (
                  <p className="text-error text-xs mt-1 pl-1">{meetingForm.formState.errors.title.message}</p>
                )}
              </div>

              {/* Date selection */}
              <div className="input-group relative">
                <input
                  type="date"
                  placeholder=" "
                  id="meeting-date"
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3.5 text-slate-200 outline-none input-glow transition-all duration-300 peer text-sm"
                  {...meetingForm.register("date")}
                />
                <label htmlFor="meeting-date" className="floating-label absolute left-4 top-3.5 text-slate-500 text-sm">
                  Session Date
                </label>
                {meetingForm.formState.errors.date && (
                  <p className="text-error text-xs mt-1 pl-1">{meetingForm.formState.errors.date.message}</p>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800/50">
                <button
                  type="button"
                  onClick={() => setIsMeetingOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-800 hover:bg-slate-800 text-sm font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMeetingMutation.isPending}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#0ea5e9] to-[#a855f7] text-white text-sm font-semibold shadow-lg shadow-blue-500/10 hover:opacity-90 transition-all disabled:opacity-50"
                >
                  {createMeetingMutation.isPending ? "Creating..." : "Create Meeting"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkspaceView;
