import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { workspacesApi } from "../lib/api/workspaces";
import { aiApi } from "../lib/api/ai";
import { Search, Brain, Video, Sparkles, FolderSearch } from "lucide-react";

export const MemoryVault: React.FC = () => {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [filterType, setFilterType] = useState<"All" | "Transcript" | "Summary" | "Screenshot">("All");

  // Fetch workspaces to get user's first workspace
  const { data: workspaces = [] } = useQuery({
    queryKey: ["workspaces"],
    queryFn: workspacesApi.listWorkspaces
  });

  const workspaceId = workspaces[0]?.id;

  // Semantic Search Query
  const { data: results = [], isLoading, isError, error } = useQuery({
    queryKey: ["semanticSearch", submittedQuery, workspaceId],
    queryFn: async () => {
      if (!submittedQuery || !workspaceId) return [];
      const res = await aiApi.search(submittedQuery, workspaceId);
      return res.results;
    },
    enabled: !!submittedQuery && !!workspaceId
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setSubmittedQuery(searchInput.trim());
    }
  };

  const filteredResults = results.filter((r) => {
    if (filterType === "All") return true;
    return r.sourceType.toLowerCase() === filterType.toLowerCase();
  });

  // Highlight matches
  const renderHighlightedText = (text: string, queryText: string) => {
    if (!queryText.trim()) return <span>{text}</span>;
    const searchTerms = queryText.toLowerCase().split(/\s+/).filter(Boolean);
    const regex = new RegExp(`(${searchTerms.map(t => t.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")).join("|")})`, "gi");
    const parts = text.split(regex);
    
    return (
      <>
        {parts.map((part, index) => 
          regex.test(part) ? (
            <span key={index} className="bg-sky-500/20 text-[#0ea5e9] border border-sky-500/30 font-semibold rounded px-1 py-0.5">
              {part}
            </span>
          ) : (
            part
          )
        )}
      </>
    );
  };

  const getSourceBadgeClass = (type: string) => {
    switch (type.toLowerCase()) {
      case "transcript":
        return "bg-sky-500/10 text-sky-400 border border-sky-500/20";
      case "summary":
        return "bg-purple-500/10 text-purple-400 border border-purple-500/20";
      case "screenshot":
        return "bg-pink-500/10 text-pink-400 border border-pink-500/20";
      default:
        return "bg-slate-500/10 text-slate-400 border border-slate-500/20";
    }
  };

  return (
    <div className="flex-grow flex flex-col h-full max-w-7xl mx-auto space-y-8 animate-reveal">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold text-white tracking-tight font-display mb-1 flex items-center gap-3">
          <Brain className="w-8 h-8 text-primary" />
          Memory Vault
        </h1>
        <p className="text-slate-400 text-sm">
          Search meeting transcripts, slides, and summaries using conceptual and contextual understanding.
        </p>
      </div>

      {/* Large Search Bar */}
      <div className="glass-panel p-6 rounded-3xl bg-gradient-to-br from-slate-900/60 to-slate-950/60 border border-slate-800 shadow-xl">
        <form onSubmit={handleSearchSubmit} className="flex gap-4">
          <div className="relative flex-grow">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              className="w-full bg-slate-950/40 border border-slate-800 focus:border-primary/50 rounded-2xl py-4 pl-12 pr-4 text-slate-200 outline-none text-sm input-glow transition-all"
              placeholder="e.g. Find where we discussed scalability issues or architectural decisions..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="flex items-center gap-2 bg-gradient-to-r from-sky-500 to-purple-500 hover:scale-[1.02] text-white px-8 py-4 rounded-2xl font-semibold text-sm shadow-lg shadow-blue-500/10 active:scale-[0.98] transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            Semantic Search
          </button>
        </form>
      </div>

      {/* Filters & Info */}
      {submittedQuery && (
        <section className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest font-display">Filter By:</span>
            <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-0.5">
              {(["All", "Transcript", "Summary", "Screenshot"] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-4 py-2 text-xs rounded-lg transition-colors cursor-pointer font-semibold ${
                    filterType === type
                      ? "bg-primary text-white shadow-lg shadow-blue-500/10"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs text-slate-500 font-medium font-display">
              Found {filteredResults.length} matches for "{submittedQuery}"
            </p>
          </div>
        </section>
      )}

      {/* Search results list */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        </div>
      ) : isError ? (
        <div className="text-center py-16 text-error bg-red-500/5 border border-red-500/10 rounded-3xl">
          An error occurred while fetching search results: {(error as any)?.message || "Unknown error"}
        </div>
      ) : !submittedQuery ? (
        // Initial Empty State
        <div className="flex flex-col items-center justify-center p-12 text-center glass-panel rounded-[32px] min-h-[350px] bg-slate-900/10">
          <div className="mb-6 mx-auto w-20 h-20 bg-slate-900/50 rounded-full flex items-center justify-center border border-slate-800 text-slate-500">
            <Brain className="w-10 h-10" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2 font-display">Vault Search</h2>
          <p className="text-slate-400 text-sm max-w-md w-full">
            Ask natural language questions to search the semantics of all your meetings. Our AI indexes screenshots, summary points, and transcripts.
          </p>
        </div>
      ) : filteredResults.length === 0 ? (
        // No results state
        <div className="flex flex-col items-center justify-center p-12 text-center glass-panel rounded-[32px] min-h-[350px]">
          <div className="mb-6 mx-auto w-20 h-20 bg-slate-900/50 rounded-full flex items-center justify-center border border-slate-800 text-slate-500">
            <FolderSearch className="w-10 h-10" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2 font-display">No Results Found</h2>
          <p className="text-slate-400 text-sm max-w-md w-full">
            We couldn't find any close semantic matches for "{submittedQuery}". Try describing the concepts or using broader keywords.
          </p>
        </div>
      ) : (
        // Results
        <div className="space-y-4">
          {filteredResults.map((result, idx) => {
            const scorePercent = isNaN(result.similarity) ? 0 : Math.round(result.similarity * 100);
            
            return (
              <article
                key={idx}
                onClick={() => navigate(`/meetings/${result.meetingId}`)}
                className="glass-panel rounded-3xl p-6 hover:-translate-y-0.5 cursor-pointer group flex flex-col gap-4 bg-slate-900/20 border-slate-800 hover:border-primary/30 transition-all duration-300"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider font-display ${getSourceBadgeClass(result.sourceType)}`}>
                      {result.sourceType}
                    </span>
                    <h3 className="text-base font-semibold text-slate-200 group-hover:text-white transition-colors font-display">
                      Match in meeting: {result.meetingTitle}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-semibold text-primary font-display">
                      {isNaN(result.similarity) ? "N/A" : `${scorePercent}%`}
                    </span>
                    <div className="w-12 h-1.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
                      <div
                        className="bg-gradient-to-r from-sky-400 to-purple-500 h-full transition-all duration-500"
                        style={{ width: `${isNaN(result.similarity) ? 0 : scorePercent}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-slate-300 text-sm leading-relaxed font-body">
                    {renderHighlightedText(result.content, submittedQuery)}
                  </p>
                </div>

                <div className="flex items-center gap-6 text-[10px] text-slate-500 font-semibold font-display">
                  <div className="flex items-center gap-1.5 hover:text-white transition-colors">
                    <Video className="w-3.5 h-3.5 text-slate-600" />
                    <span>View Meeting Context</span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MemoryVault;
