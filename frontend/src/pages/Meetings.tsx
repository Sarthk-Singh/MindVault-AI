import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { workspacesApi } from "../lib/api/workspaces";
import { meetingsApi } from "../lib/api/meetings";
import { Video, Calendar, ArrowRight, FolderClosed } from "lucide-react";

export const Meetings: React.FC = () => {
  const navigate = useNavigate();

  // 1. Fetch Workspaces
  const { data: workspaces = [], isLoading: isWorkspacesLoading } = useQuery({
    queryKey: ["workspaces"],
    queryFn: workspacesApi.listWorkspaces
  });

  // 2. Fetch Meetings for all workspaces in parallel
  const { data: meetings = [], isLoading: isMeetingsLoading } = useQuery({
    queryKey: ["meetingsList", workspaces.map((w) => w.id)],
    queryFn: async () => {
      if (!workspaces || workspaces.length === 0) return [];
      
      const promises = workspaces.map(async (ws) => {
        try {
          const list = await meetingsApi.listMeetings(ws.id);
          return list.map((meeting) => ({
            ...meeting,
            workspaceName: ws.name
          }));
        } catch (error) {
          console.error(`Failed to fetch meetings for workspace ${ws.id}:`, error);
          return [];
        }
      });
      
      const results = await Promise.all(promises);
      // Sort meetings by date descending
      return results.flat().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    },
    enabled: workspaces.length > 0
  });

  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case "PENDING":
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 uppercase tracking-wider">
            Pending
          </span>
        );
      case "PROCESSING":
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20 uppercase tracking-wider">
            Processing
          </span>
        );
      case "DONE":
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
            Done
          </span>
        );
      case "FAILED":
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/20 uppercase tracking-wider">
            Failed
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-500/10 text-slate-400 border border-slate-500/20 uppercase tracking-wider">
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
          <Video className="w-8 h-8 text-primary" />
          Meetings
        </h1>
        <p className="text-slate-400 text-sm">
          A directory of all uploaded recordings and meeting analyses across your active workspaces.
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        </div>
      ) : meetings.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center glass-panel rounded-[32px] min-h-[350px]">
          <div className="mb-6 mx-auto w-20 h-20 bg-slate-900/50 rounded-full flex items-center justify-center border border-slate-800 text-slate-500">
            <FolderClosed className="w-10 h-10" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2 font-display">No Meetings Found</h2>
          <p className="text-slate-400 text-sm max-w-md w-full mb-6">
            You don't have any meetings uploaded yet. Navigate to an active workspace to upload your first meeting recording or screenshot.
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
                  <th className="px-6 py-4">Title</th>
                  <th className="px-6 py-4">Workspace</th>
                  <th className="px-6 py-4">Meeting Date</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {meetings.map((meeting) => {
                  const formattedDate = new Date(meeting.date).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric"
                  });

                  return (
                    <tr
                      key={meeting.id}
                      onClick={() => navigate(`/meetings/${meeting.id}`)}
                      className="group hover:bg-white/5 cursor-pointer transition-colors duration-200"
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 border border-slate-700/50 group-hover:text-primary transition-colors">
                            <Video className="w-4 h-4" />
                          </div>
                          <span className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors">
                            {meeting.title}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-sm text-slate-400 group-hover:text-slate-300 transition-colors">
                        {meeting.workspaceName}
                      </td>
                      <td className="px-6 py-5 text-sm text-slate-400 group-hover:text-slate-300 transition-colors">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-slate-500" />
                          <span>{formattedDate}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        {getStatusBadge(meeting.status)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Meetings;
