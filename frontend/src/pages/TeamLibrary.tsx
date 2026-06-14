import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { workspacesApi } from "../lib/api/workspaces";
import { meetingsApi } from "../lib/api/meetings";
import { Users2, CheckSquare, Gavel, Calendar, ArrowRight, FolderClosed } from "lucide-react";

export const TeamLibrary: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"actionItems" | "decisions">("actionItems");

  // 1. Fetch workspaces
  const { data: workspaces = [], isLoading: isWorkspacesLoading } = useQuery({
    queryKey: ["workspaces"],
    queryFn: workspacesApi.listWorkspaces
  });

  // 2. Fetch full meeting details containing action items and decisions in parallel
  const { data: allMeetingsDetails = [], isLoading: isMeetingsLoading } = useQuery({
    queryKey: ["allMeetingsDetailsForLibrary", workspaces.map((w) => w.id)],
    queryFn: async () => {
      if (!workspaces || workspaces.length === 0) return [];

      const detailsPromises = workspaces.map(async (ws) => {
        try {
          const list = await meetingsApi.listMeetings(ws.id);
          const fullDetailsPromises = list.map((m) =>
            meetingsApi.getMeeting(m.id).catch(() => null)
          );
          return await Promise.all(fullDetailsPromises);
        } catch {
          return [];
        }
      });

      const results = await Promise.all(detailsPromises);
      return results.flat().filter((m): m is any => m !== null);
    },
    enabled: workspaces.length > 0
  });

  // Aggregate Action Items
  const actionItems = allMeetingsDetails.flatMap((meeting: any) =>
    (meeting.actionItems || []).map((item: any) => ({
      ...item,
      meetingId: meeting.id,
      meetingTitle: meeting.title
    }))
  );

  // Aggregate Decisions
  const decisions = allMeetingsDetails.flatMap((meeting: any) =>
    (meeting.decisions || []).map((dec: any) => ({
      ...dec,
      meetingId: meeting.id,
      meetingTitle: meeting.title,
      meetingDate: meeting.date
    }))
  );

  const getActionItemStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case "PENDING":
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 uppercase tracking-wider">
            Pending
          </span>
        );
      case "IN_PROGRESS":
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20 uppercase tracking-wider">
            In Progress
          </span>
        );
      case "DONE":
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
            Completed
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-500/10 text-slate-400 border border-slate-500/20 uppercase tracking-wider">
            {status}
          </span>
        );
    }
  };

  const isLoading = isWorkspacesLoading || (workspaces.length > 0 && isMeetingsLoading);

  return (
    <div className="flex-grow flex flex-col h-full max-w-7xl mx-auto space-y-8 animate-reveal">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold text-white tracking-tight font-display mb-1 flex items-center gap-3">
          <Users2 className="w-8 h-8 text-primary" />
          Team Library
        </h1>
        <p className="text-slate-400 text-sm">
          A centralized archive of all actionable tasks and core decisions extracted from your meetings.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 gap-6">
        <button
          onClick={() => setActiveTab("actionItems")}
          className={`flex items-center gap-2 pb-4 px-1 text-sm font-semibold transition-all relative cursor-pointer ${
            activeTab === "actionItems" ? "text-white" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <CheckSquare className="w-4 h-4" />
          Action Items
          {activeTab === "actionItems" && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-sky-400 to-purple-500 rounded-full"></span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("decisions")}
          className={`flex items-center gap-2 pb-4 px-1 text-sm font-semibold transition-all relative cursor-pointer ${
            activeTab === "decisions" ? "text-white" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Gavel className="w-4 h-4" />
          Decisions
          {activeTab === "decisions" && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-sky-400 to-purple-500 rounded-full"></span>
          )}
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        </div>
      ) : activeTab === "actionItems" ? (
        // Action Items Tab Content
        actionItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center glass-panel rounded-[32px] min-h-[350px]">
            <div className="mb-6 mx-auto w-20 h-20 bg-slate-900/50 rounded-full flex items-center justify-center border border-slate-800 text-slate-500">
              <CheckSquare className="w-10 h-10" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2 font-display">No Action Items Extracted</h2>
            <p className="text-slate-400 text-sm max-w-md w-full mb-6">
              AI hasn't detected any actionable tasks in your meetings yet. Try transcribing and analyzing a recording that contains task assignments.
            </p>
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 bg-gradient-to-r from-sky-500 to-purple-500 hover:scale-[1.02] text-white px-6 py-3 rounded-xl font-semibold text-sm shadow-lg shadow-blue-500/10 active:scale-[0.98] transition-all cursor-pointer"
            >
              Go to Dashboard
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="glass-panel rounded-3xl overflow-hidden border border-slate-800 shadow-xl bg-slate-900/10">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider font-display bg-slate-950/20">
                    <th className="px-6 py-4">Task</th>
                    <th className="px-6 py-4">Assignee</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Meeting Origin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50 text-sm">
                  {actionItems.map((item, idx) => (
                    <tr
                      key={item.id || idx}
                      onClick={() => navigate(`/meetings/${item.meetingId}`)}
                      className="group hover:bg-white/5 cursor-pointer transition-all"
                    >
                      <td className="px-6 py-5 font-medium text-slate-200 group-hover:text-white">
                        {item.task}
                      </td>
                      <td className="px-6 py-5 text-slate-400 group-hover:text-slate-300">
                        {item.assignee || "Unassigned"}
                      </td>
                      <td className="px-6 py-5">
                        {getActionItemStatusBadge(item.status)}
                      </td>
                      <td className="px-6 py-5 text-slate-400 group-hover:text-primary transition-colors">
                        {item.meetingTitle}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      ) : (
        // Decisions Tab Content
        decisions.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center glass-panel rounded-[32px] min-h-[350px]">
            <div className="mb-6 mx-auto w-20 h-20 bg-slate-900/50 rounded-full flex items-center justify-center border border-slate-800 text-slate-500">
              <FolderClosed className="w-10 h-10" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2 font-display">No Decisions Extracted</h2>
            <p className="text-slate-400 text-sm max-w-md w-full mb-6">
              AI hasn't extracted any key decisions from your meetings. Upload recordings containing structural decisions, votes, or signoffs.
            </p>
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 bg-gradient-to-r from-sky-500 to-purple-500 hover:scale-[1.02] text-white px-6 py-3 rounded-xl font-semibold text-sm shadow-lg shadow-blue-500/10 active:scale-[0.98] transition-all cursor-pointer"
            >
              Go to Dashboard
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {decisions.map((dec, idx) => {
              const formattedDate = new Date(dec.meetingDate).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric"
              });

              return (
                <div
                  key={dec.id || idx}
                  onClick={() => navigate(`/meetings/${dec.meetingId}`)}
                  className="group glass-panel p-6 rounded-2xl hover:border-primary/30 transition-all duration-300 cursor-pointer flex flex-col justify-between gap-4 bg-slate-900/10"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-9 h-9 shrink-0 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/20 group-hover:text-white group-hover:bg-purple-500/20 transition-all">
                      <Gavel className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-slate-200 group-hover:text-white font-medium leading-relaxed font-body">
                        {dec.decision}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 font-semibold font-display border-t border-slate-800/50 pt-3">
                    <span className="group-hover:text-primary transition-colors">{dec.meetingTitle}</span>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-600" />
                      <span>{formattedDate}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}
    </div>
  );
};

export default TeamLibrary;
