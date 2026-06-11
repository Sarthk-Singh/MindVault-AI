import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { workspacesApi } from "../lib/api/workspaces";
import { meetingsApi } from "../lib/api/meetings";
import { Search, Video, Calendar } from "lucide-react";

interface SearchResult {
  id: string;
  type: "Transcript" | "Summary" | "Screenshot";
  meetingId: string;
  meetingTitle: string;
  meetingDate: string;
  matchScore: number;
  highlightText: string;
  titleText: string;
  rawItem: any;
}

export const SearchResults: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get("q") || "";
  const [searchInput, setSearchInput] = useState(query);
  const [filterType, setFilterType] = useState<"All" | "Transcript" | "Summary" | "Screenshot">("All");

  useEffect(() => {
    setSearchInput(query);
  }, [query]);

  // Queries to load all user workspaces & meetings for searching
  const { data: workspaces = [] } = useQuery({
    queryKey: ["workspaces"],
    queryFn: workspacesApi.listWorkspaces
  });

  const { data: allMeetingDetails = [], isLoading } = useQuery({
    queryKey: ["allMeetingsDetails", workspaces.map(w => w.id)],
    queryFn: async () => {
      if (!workspaces || workspaces.length === 0) return [];
      
      const detailsPromises = workspaces.map(async (w) => {
        try {
          const list = await meetingsApi.listMeetings(w.id);
          const fullDetailsPromises = list.map(m => 
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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchInput.trim())}`);
    }
  };

  // Perform search locally
  const performSearch = (): SearchResult[] => {
    if (!query.trim() || allMeetingDetails.length === 0) return [];

    const results: SearchResult[] = [];
    const searchTerms = query.toLowerCase().split(/\s+/).filter(Boolean);

    allMeetingDetails.forEach((meeting: any) => {
      const dateStr = new Date(meeting.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
      });

      // 1. Search in Transcript Chunks
      if (meeting.transcriptChunks) {
        meeting.transcriptChunks.forEach((chunk: any) => {
          const contentLower = chunk.content.toLowerCase();
          const matchCount = searchTerms.filter(term => contentLower.includes(term)).length;
          
          if (matchCount > 0) {
            const matchScore = Math.round((matchCount / searchTerms.length) * 100);
            
            // Extract snippet
            const firstMatchIdx = contentLower.indexOf(searchTerms[0]);
            const start = Math.max(0, firstMatchIdx - 60);
            const end = Math.min(chunk.content.length, firstMatchIdx + 120);
            let snippet = chunk.content.substring(start, end);
            if (start > 0) snippet = "..." + snippet;
            if (end < chunk.content.length) snippet = snippet + "...";

            results.push({
              id: `chunk-${chunk.id}`,
              type: "Transcript",
              meetingId: meeting.id,
              meetingTitle: meeting.title,
              meetingDate: dateStr,
              matchScore,
              titleText: meeting.title,
              highlightText: snippet,
              rawItem: chunk
            });
          }
        });
      }

      // 2. Search in Summaries
      if (meeting.summaries) {
        meeting.summaries.forEach((sum: any) => {
          const summaryLower = sum.summary.toLowerCase();
          const matchCount = searchTerms.filter(term => summaryLower.includes(term)).length;

          if (matchCount > 0) {
            const matchScore = Math.round((matchCount / searchTerms.length) * 100);
            
            // Extract snippet
            const firstMatchIdx = summaryLower.indexOf(searchTerms[0]);
            const start = Math.max(0, firstMatchIdx - 60);
            const end = Math.min(sum.summary.length, firstMatchIdx + 120);
            let snippet = sum.summary.substring(start, end);
            if (start > 0) snippet = "..." + snippet;
            if (end < sum.summary.length) snippet = snippet + "...";

            results.push({
              id: `sum-${sum.id}`,
              type: "Summary",
              meetingId: meeting.id,
              meetingTitle: meeting.title,
              meetingDate: dateStr,
              matchScore,
              titleText: `Summary: ${meeting.title}`,
              highlightText: snippet,
              rawItem: sum
            });
          }
        });
      }

      // 3. Search in Screenshots
      if (meeting.screenshots) {
        meeting.screenshots.forEach((shot: any) => {
          const ocrLower = (shot.ocrText || "").toLowerCase();
          const summaryLower = (shot.summary || "").toLowerCase();
          const combinedLower = `${ocrLower} ${summaryLower}`;
          const matchCount = searchTerms.filter(term => combinedLower.includes(term)).length;

          if (matchCount > 0) {
            const matchScore = Math.round((matchCount / searchTerms.length) * 100);
            
            // Snippet
            let snippet = shot.summary || shot.ocrText || "";
            if (snippet.length > 150) snippet = snippet.substring(0, 150) + "...";

            results.push({
              id: `shot-${shot.id}`,
              type: "Screenshot",
              meetingId: meeting.id,
              meetingTitle: meeting.title,
              meetingDate: dateStr,
              matchScore,
              titleText: `Slide: ${shot.summary || "Visual Capture"}`,
              highlightText: snippet,
              rawItem: shot
            });
          }
        });
      }
    });

    return results.sort((a, b) => b.matchScore - a.matchScore);
  };

  const allResults = performSearch();
  const filteredResults = allResults.filter(r => filterType === "All" || r.type === filterType);

  // Text highlighting function
  const renderHighlightedText = (text: string, queryText: string) => {
    if (!queryText.trim()) return <span>{text}</span>;
    const searchTerms = queryText.toLowerCase().split(/\s+/).filter(Boolean);
    const regex = new RegExp(`(${searchTerms.map(t => t.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")).join("|")})`, "gi");
    const parts = text.split(regex);
    
    return (
      <>
        {parts.map((part, index) => 
          regex.test(part) ? (
            <span key={index} className="bg-yellow-500/20 text-[#0ea5e9] border border-yellow-500/30 font-semibold rounded px-1 py-0.5">
              {part}
            </span>
          ) : (
            part
          )
        )}
      </>
    );
  };

  return (
    <div className="flex-grow flex flex-col h-full max-w-7xl mx-auto space-y-6">
      {/* Mobile Search Bar header */}
      <header className="p-4 glass-panel border border-slate-800 rounded-2xl flex justify-center sticky top-0 z-10 md:hidden">
        <form onSubmit={handleSearchSubmit} className="relative w-full">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            className="w-full bg-slate-900/50 border border-slate-800 rounded-xl py-2.5 pl-11 pr-4 text-slate-200 outline-none text-xs"
            placeholder="Search transcripts, summaries..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </form>
      </header>

      {/* Filters Bar */}
      <section className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest font-display">Source:</span>
          <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-0.5">
            {(["All", "Transcript", "Summary", "Screenshot"] as const).map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-4 py-2 text-xs rounded-lg transition-colors cursor-pointer font-semibold ${
                  filterType === type
                    ? "bg-[#0ea5e9] text-white shadow-lg shadow-blue-500/10"
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
            Found {filteredResults.length} matches
          </p>
        </div>
      </section>

      {/* Results list */}
      {isLoading ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : filteredResults.length === 0 ? (
        <div className="text-center py-16 text-slate-400 text-sm glass-panel rounded-3xl">
          No search matches found for "{query}". Try different keywords.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredResults.map((result) => (
            <article
              key={result.id}
              onClick={() => navigate(`/meetings/${result.meetingId}`)}
              className="glass-panel rounded-3xl p-6 hover:-translate-y-0.5 cursor-pointer group flex flex-col gap-4"
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex items-center gap-3">
                  <span className="bg-sky-500/10 text-sky-400 border border-sky-500/20 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider font-display">
                    {result.type}
                  </span>
                  <h3 className="text-base font-semibold text-slate-200 group-hover:text-white transition-colors font-display">
                    {renderHighlightedText(result.titleText, query)}
                  </h3>
                </div>
                
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-semibold text-sky-400 font-display">{result.matchScore}%</span>
                  <div className="w-12 h-1.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
                    <div className="bg-gradient-to-r from-sky-400 to-purple-500 h-full" style={{ width: `${result.matchScore}%` }}></div>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-slate-300 text-sm leading-relaxed">
                  {renderHighlightedText(result.highlightText, query)}
                </p>
              </div>

              <div className="flex items-center gap-6 text-[10px] text-slate-500 font-semibold font-display">
                <div className="flex items-center gap-1.5">
                  <Video className="w-3.5 h-3.5 text-slate-600" />
                  <span>{result.meetingTitle}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-600" />
                  <span>{result.meetingDate}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchResults;
