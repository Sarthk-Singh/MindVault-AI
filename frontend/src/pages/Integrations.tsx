import React from "react";
import { Puzzle, Video, MessageSquare, BookOpen, Calendar, HelpCircle } from "lucide-react";

interface IntegrationItem {
  name: string;
  description: string;
  category: string;
  icon: React.ReactNode;
  colorClass: string;
}

export const Integrations: React.FC = () => {
  const integrations: IntegrationItem[] = [
    {
      name: "Zoom Video sync",
      description: "Automatically sync Zoom cloud recordings and ocr slides directly to your active workspaces.",
      category: "Video Meetings",
      icon: <Video className="w-6 h-6" />,
      colorClass: "text-sky-400 bg-sky-500/10 border-sky-500/20"
    },
    {
      name: "Google Meet",
      description: "Import meeting details and audio transcriptions natively from Google Drive folders.",
      category: "Video Meetings",
      icon: <Video className="w-6 h-6" />,
      colorClass: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
    },
    {
      name: "Slack Notifications",
      description: "Send AI-extracted action items and daily sync updates directly to slack channels.",
      category: "Productivity",
      icon: <MessageSquare className="w-6 h-6" />,
      colorClass: "text-purple-400 bg-purple-500/10 border-purple-500/20"
    },
    {
      name: "Notion Workspace",
      description: "Export summary boards, decisions log, and key highlights directly into your team wiki.",
      category: "Documentation",
      icon: <BookOpen className="w-6 h-6" />,
      colorClass: "text-amber-400 bg-amber-500/10 border-amber-500/20"
    },
    {
      name: "Google Calendar",
      description: "Schedule pending uploads, invite links and calendar reminders from one dashboard.",
      category: "Calendar",
      icon: <Calendar className="w-6 h-6" />,
      colorClass: "text-pink-400 bg-pink-500/10 border-pink-500/20"
    }
  ];

  return (
    <div className="flex-grow flex flex-col h-full max-w-7xl mx-auto space-y-8 animate-reveal">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold text-white tracking-tight font-display mb-1 flex items-center gap-3">
          <Puzzle className="w-8 h-8 text-primary" />
          Integrations
        </h1>
        <p className="text-slate-400 text-sm">
          Connect your team's existing communication tools and documents directly to MindVault's semantic model.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {integrations.map((integration, idx) => (
          <div
            key={idx}
            className="group glass-panel p-6 rounded-3xl border border-slate-800 bg-slate-900/10 flex flex-col justify-between min-h-[240px] relative overflow-hidden transition-all duration-300"
          >
            {/* Mesh highlights inside cards */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/0 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div className={`w-12 h-12 rounded-2xl ${integration.colorClass} flex items-center justify-center border shadow-md`}>
                  {integration.icon}
                </div>
                <span className="px-2 py-0.5 rounded text-[8px] font-bold bg-[#0ea5e9]/10 text-[#0ea5e9] border border-[#0ea5e9]/20 uppercase tracking-widest font-display">
                  Coming Soon
                </span>
              </div>

              <div>
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider font-display">
                  {integration.category}
                </p>
                <h3 className="text-lg font-semibold text-white mt-1 font-display">
                  {integration.name}
                </h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed font-body">
                  {integration.description}
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800/40 flex justify-between items-center text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
              <span>Status: Offline</span>
              <a href="#" className="text-slate-400 group-hover:text-primary transition-colors flex items-center gap-1">
                <HelpCircle className="w-3.5 h-3.5" />
                Docs
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Integrations;
