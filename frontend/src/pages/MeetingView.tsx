import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { meetingsApi } from "../lib/api/meetings";
import { aiApi } from "../lib/api/ai";
import { api } from "../lib/api";
import {
  Upload,
  Image as ImageIcon,
  FileText,
  X,
  Sparkles,
  CheckCircle2,
  ZoomIn,
  Bolt,
  Play,
  Volume2
} from "lucide-react";

type TabType = "transcript" | "summary" | "actions" | "decisions" | "screenshots";

export const MeetingView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabType>("transcript");
  const [selectedScreenshot, setSelectedScreenshot] = useState<any | null>(null);
  const [activeRecording, setActiveRecording] = useState<any | null>(null);
  
  // File upload states
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  // Queries
  const { data: meeting, isLoading, isError } = useQuery({
    queryKey: ["meeting", id],
    queryFn: () => meetingsApi.getMeeting(id!),
    enabled: !!id,
    refetchInterval: (query) => {
      const data = query.state.data as any;
      return data?.status === "PROCESSING" ? 5000 : false;
    }
  });

  useEffect(() => {
    if (meeting?.recordings && meeting.recordings.length > 0) {
      if (!activeRecording) {
        setActiveRecording(meeting.recordings[0]);
      }
    }
  }, [meeting, activeRecording]);

  // Mutations for AI pipelines
  const transcribeMutation = useMutation({
    mutationFn: () => aiApi.transcribe(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meeting", id] });
      alert("Transcription job queued successfully!");
    },
    onError: (err: any) => {
      alert(err?.response?.data?.message || "Failed to start transcription job.");
    }
  });

  const summarizeMutation = useMutation({
    mutationFn: () => aiApi.summarize(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meeting", id] });
      alert("Summarization and Action Item extraction job queued successfully!");
    },
    onError: (err: any) => {
      alert(err?.response?.data?.message || "Failed to start summarization job.");
    }
  });

  // Action Items local status helper (simulate updates)
  const [actionItemStatuses, setActionItemStatuses] = useState<Record<string, string>>({});

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isError || !meeting) {
    return (
      <div className="text-center p-8 bg-red-500/10 border border-red-500/20 text-error text-sm rounded-2xl max-w-lg mx-auto">
        Failed to load meeting details.
      </div>
    );
  }

  // Handle files
  const handleScreenshotUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    const formData = new FormData();
    formData.append("meetingId", id!);
    formData.append("file", file);

    setIsUploading(true);
    setUploadError("");

    try {
      const response = await api.post("/screenshot", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      // Automatically trigger analysis
      const screenshot = response.data.screenshot;
      await aiApi.screenshotAnalysis(screenshot.id);
      
      queryClient.invalidateQueries({ queryKey: ["meeting", id] });
      alert("Screenshot uploaded and queued for AI analysis!");
    } catch (err: any) {
      setUploadError(err?.response?.data?.message || "Failed to upload screenshot.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleAudioVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    // Dynamically determine upload endpoint based on MIME type or file extension
    const isVideo = file.type.startsWith("video/") || 
                    /\.(mp4|mov|avi|webm|mkv)$/i.test(file.name);
    const type = isVideo ? "video" : "audio";
    
    const formData = new FormData();
    formData.append("meetingId", id!);
    formData.append("file", file);

    setIsUploading(true);
    setUploadError("");

    try {
      const response = await api.post(`/${type}`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      const newRecording = response.data.recording;
      if (newRecording) {
        setActiveRecording(newRecording);
      }
      queryClient.invalidateQueries({ queryKey: ["meeting", id] });
      alert("Recording uploaded and queued for transcription!");
    } catch (err: any) {
      setUploadError(err?.response?.data?.message || "Failed to upload recording.");
    } finally {
      setIsUploading(false);
    }
  };

  const formattedDate = new Date(meeting.date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric"
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-800/60">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20 uppercase tracking-wider">
              Active Meeting
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-400 text-xs">{formattedDate}</span>
          </div>
          
          <h1 className="text-2xl font-semibold text-white tracking-tight font-display mb-3">
            {meeting.title}
          </h1>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>{meeting.status}</span>
            </div>
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full border-2 border-[#0a0e27] bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-300">JD</div>
              <div className="w-8 h-8 rounded-full border-2 border-[#0a0e27] bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-300">AM</div>
              <div className="w-8 h-8 rounded-full border-2 border-[#0a0e27] bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-300">SL</div>
            </div>
          </div>
        </div>

        {/* Upload options */}
        <div className="flex flex-wrap items-center gap-3">
          {uploadError && (
            <p className="text-error text-xs w-full mb-1">{uploadError}</p>
          )}
          
          <input
            type="file"
            id="screenshot-file"
            className="hidden"
            accept="image/*"
            onChange={handleScreenshotUpload}
          />
          <input
            type="file"
            id="audio-file"
            className="hidden"
            accept="audio/*,video/*"
            onChange={handleAudioVideoUpload}
          />

          <button
            onClick={() => document.getElementById("screenshot-file")?.click()}
            disabled={isUploading}
            className="flex items-center gap-2 px-5 py-3 border border-slate-800 text-slate-300 hover:text-white font-semibold rounded-xl hover:bg-slate-800/50 transition-colors cursor-pointer disabled:opacity-50 text-sm"
          >
            <ImageIcon className="w-4 h-4 text-sky-400" />
            {isUploading ? "Uploading..." : "Upload Screenshot"}
          </button>

          <button
            onClick={() => document.getElementById("audio-file")?.click()}
            disabled={isUploading}
            className="pulse-btn flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-[#0ea5e9] to-[#a855f7] text-white font-semibold rounded-xl hover:scale-102 transition-all cursor-pointer disabled:opacity-50 text-sm"
          >
            <Upload className="w-4 h-4" />
            {isUploading ? "Uploading..." : "Upload Recording"}
          </button>
        </div>
      </div>

      {/* Status Messages */}
      {meeting.status === "FAILED" && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1 flex-1">
            <h4 className="text-sm font-semibold text-white">AI Analysis Failed</h4>
            <p className="text-xs text-slate-400">
              There was an issue processing this meeting's recording. You can attempt to re-run the transcription and analysis.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => transcribeMutation.mutate()}
              disabled={transcribeMutation.isPending}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition-colors disabled:opacity-50"
            >
              {transcribeMutation.isPending ? "Transcribing..." : "Re-run Transcription"}
            </button>
            <button
              onClick={() => summarizeMutation.mutate()}
              disabled={summarizeMutation.isPending}
              className="px-4 py-2 bg-gradient-to-r from-[#0ea5e9] to-[#a855f7] text-white rounded-xl text-xs font-semibold hover:opacity-90 transition-all disabled:opacity-50"
            >
              {summarizeMutation.isPending ? "Summarizing..." : "Re-run Summary"}
            </button>
          </div>
        </div>
      )}

      {meeting.status === "PROCESSING" && (
        <div className="bg-sky-500/10 border border-sky-500/20 rounded-2xl p-4 flex flex-row items-center gap-4">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-sky-400 shrink-0"></div>
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-white">Processing Meeting Recording</h4>
            <p className="text-xs text-slate-400">
              Gemini is transcribing and analyzing your meeting. This may take a moment. The page will auto-update when completed.
            </p>
          </div>
        </div>
      )}

      {/* Main Content Layout */}
      <div className={meeting.recordings && meeting.recordings.length > 0 ? "grid grid-cols-1 lg:grid-cols-3 gap-8" : "space-y-6"}>
        {/* Left Column: Media Player (only if recordings exist) */}
        {meeting.recordings && meeting.recordings.length > 0 && (
          <div className="lg:col-span-1 space-y-6">
            <div className="glass-panel rounded-3xl p-6 space-y-4">
              <h2 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                <Play className="w-5 h-5 text-sky-400" />
                Meeting Recording
              </h2>
              
              {/* HTML5 video/audio player */}
              {activeRecording && (
                <div className="rounded-2xl overflow-hidden bg-slate-950 border border-slate-800">
                  {activeRecording.mimeType.startsWith("video/") ? (
                    <video
                      key={activeRecording.id}
                      src={activeRecording.fileUrl}
                      controls
                      className="w-full aspect-video"
                    />
                  ) : (
                    <div className="p-8 flex flex-col items-center justify-center gap-4 bg-slate-900/50">
                      <Volume2 className="w-12 h-12 text-sky-400 animate-pulse" />
                      <audio
                        key={activeRecording.id}
                        src={activeRecording.fileUrl}
                        controls
                        className="w-full"
                      />
                    </div>
                  )}
                </div>
              )}
              
              {/* Selection info */}
              {activeRecording && (
                <div className="text-xs text-slate-400 space-y-1">
                  <p className="font-semibold text-slate-200">
                    Active File: <a href={activeRecording.fileUrl} target="_blank" rel="noreferrer" className="text-sky-400 hover:underline">{activeRecording.fileUrl.split("/").pop()}</a>
                  </p>
                  <p>Uploaded: {new Date(activeRecording.createdAt).toLocaleString()}</p>
                </div>
              )}

              {/* List of other recordings */}
              {meeting.recordings.length > 1 && (
                <div className="space-y-2 pt-2 border-t border-slate-800/60">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                    All Recordings ({meeting.recordings.length})
                  </span>
                  <div className="space-y-1.5 max-h-[200px] overflow-y-auto custom-scrollbar">
                    {meeting.recordings.map((rec, index) => (
                      <button
                        key={rec.id}
                        onClick={() => setActiveRecording(rec)}
                        className={`w-full text-left p-3 rounded-xl text-xs transition-colors flex items-center justify-between ${
                          activeRecording?.id === rec.id
                            ? "bg-sky-500/10 text-white border border-sky-500/30"
                            : "bg-slate-900/40 text-slate-400 hover:bg-slate-800/30 hover:text-slate-200 border border-transparent"
                        }`}
                      >
                        <span className="truncate max-w-[150px]">
                          Recording {index + 1}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {new Date(rec.createdAt).toLocaleDateString()}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Right Column: Tabs */}
        <div className={meeting.recordings && meeting.recordings.length > 0 ? "lg:col-span-2 space-y-6" : "space-y-6"}>
        <div className="border-b border-slate-800/60 flex gap-8">
          {(["transcript", "summary", "actions", "decisions", "screenshots"] as TabType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 text-sm transition-all cursor-pointer border-b-2 capitalize font-semibold ${
                activeTab === tab
                  ? "border-[#0ea5e9] text-white"
                  : "border-transparent text-slate-500 hover:text-slate-300"
              }`}
            >
              {tab === "actions" ? "Action Items" : tab === "screenshots" ? "Screenshots" : tab}
            </button>
          ))}
        </div>

        {/* Tab Content: Transcript */}
        {activeTab === "transcript" && (
          <div className="glass-panel rounded-3xl p-6 h-[500px] overflow-y-auto custom-scrollbar flex flex-col gap-6">
            {meeting.transcriptChunks && meeting.transcriptChunks.length > 0 ? (
              meeting.transcriptChunks.map((chunk) => (
                <div key={chunk.id} className="flex gap-6 items-start">
                  <span className="text-slate-500 font-mono text-xs w-12 shrink-0 pt-0.5">
                    {chunk.chunkIndex === 0 ? "00:00" : `0${chunk.chunkIndex}:00`}
                  </span>
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-sky-400">Speaker</span>
                    <p className="text-slate-300 text-sm leading-relaxed">
                      {chunk.content}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center flex flex-col items-center justify-center h-full gap-4">
                <FileText className="w-12 h-12 text-slate-600" />
                {meeting.recordings && meeting.recordings.length > 0 ? (
                  <>
                    <p className="text-slate-400 text-sm">No transcript chunks available.</p>
                    <button
                      onClick={() => transcribeMutation.mutate()}
                      disabled={transcribeMutation.isPending}
                      className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition-colors disabled:opacity-50"
                    >
                      {transcribeMutation.isPending ? "Starting Transcription..." : "Run AI Transcription"}
                    </button>
                  </>
                ) : (
                  <>
                    <p className="text-slate-400 text-sm">No recordings uploaded yet.</p>
                    <p className="text-slate-500 text-xs max-w-md">
                      Please upload an audio or video recording first to generate and run AI transcription for this meeting.
                    </p>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tab Content: Summary */}
        {activeTab === "summary" && (
          <div className="space-y-6">
            {meeting.summaries && meeting.summaries.length > 0 ? (
              meeting.summaries.map((sum) => {
                const keyPoints = Array.isArray(sum.keyPoints) ? sum.keyPoints : [];
                return (
                  <div key={sum.id} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 glass-panel rounded-3xl p-8">
                      <h3 className="text-lg font-semibold text-white mb-4 font-display">Executive Summary</h3>
                      <div className="text-slate-300 text-sm leading-relaxed">
                        <p>{sum.summary}</p>
                      </div>
                    </div>
                    
                    <div className="glass-panel rounded-3xl p-6 bg-gradient-to-tr from-purple-900/10 to-sky-900/10 border-purple-500/10 h-fit">
                      <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2 font-display">
                        <Bolt className="w-4 h-4 text-purple-400" /> Key Points
                      </h3>
                      <ul className="space-y-3">
                        {keyPoints.map((point: string, idx: number) => (
                          <li key={idx} className="flex gap-2 items-start">
                            <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                            <span className="text-slate-300 text-xs leading-relaxed">{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="glass-panel rounded-[32px] p-12 text-center flex flex-col items-center gap-4">
                <Sparkles className="w-12 h-12 text-purple-400" />
                {meeting.recordings && meeting.recordings.length > 0 ? (
                  <>
                    <p className="text-slate-400 text-sm">No AI summaries generated yet.</p>
                    <button
                      onClick={() => summarizeMutation.mutate()}
                      disabled={summarizeMutation.isPending}
                      className="px-5 py-2.5 bg-gradient-to-r from-[#0ea5e9] to-[#a855f7] text-white rounded-xl text-xs font-semibold shadow-lg shadow-blue-500/10 hover:opacity-90 transition-all disabled:opacity-50"
                    >
                      {summarizeMutation.isPending ? "Generating Summary..." : "Generate AI Summary"}
                    </button>
                  </>
                ) : (
                  <>
                    <p className="text-slate-400 text-sm">No recordings uploaded yet.</p>
                    <p className="text-slate-500 text-xs max-w-md">
                      Please upload an audio or video recording first to generate a summary for this meeting.
                    </p>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tab Content: Action Items */}
        {activeTab === "actions" && (
          <div className="glass-panel rounded-[32px] overflow-hidden border border-slate-800/80">
            {meeting.actionItems && meeting.actionItems.length > 0 ? (
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-900/50 border-b border-slate-800">
                  <tr>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-widest font-display">Task Name</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-widest font-display">Assignee</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-widest font-display">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {meeting.actionItems.map((item) => {
                    const currentStatus = actionItemStatuses[item.id] || item.status;
                    return (
                      <tr key={item.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-5 text-slate-200 font-medium text-sm">{item.task}</td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-slate-800 text-slate-300 border border-slate-700 flex items-center justify-center text-[10px] font-bold">
                              {item.assignee.slice(0, 2).toUpperCase()}
                            </div>
                            <span className="text-slate-300 text-xs">{item.assignee}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <select
                            className="bg-slate-950 border border-slate-800 rounded-lg text-xs font-semibold py-1 px-3 focus:ring-1 focus:ring-sky-500 outline-none cursor-pointer text-slate-300"
                            value={currentStatus}
                            onChange={(e) => {
                              setActionItemStatuses({
                                ...actionItemStatuses,
                                [item.id]: e.target.value
                              });
                            }}
                          >
                            <option value="PENDING">Todo</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="DONE">Done</option>
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="p-12 text-center text-slate-400 text-sm flex flex-col items-center gap-2">
                <p>No Action Items extracted yet.</p>
                {!(meeting.recordings && meeting.recordings.length > 0) && (
                  <p className="text-slate-500 text-xs">
                    Please upload an audio or video recording first to extract action items.
                  </p>
                )}
                {meeting.recordings && meeting.recordings.length > 0 && (
                  <p className="text-slate-500 text-xs">
                    Generate an AI Summary in the Summary tab to extract action items.
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tab Content: Decisions */}
        {activeTab === "decisions" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {meeting.decisions && meeting.decisions.length > 0 ? (
              meeting.decisions.map((dec) => (
                <div key={dec.id} className="glass-panel border-l-4 border-sky-500 p-6 rounded-r-3xl shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <span className="bg-sky-500/10 text-sky-400 border border-sky-500/20 text-[10px] font-bold px-2 py-0.5 rounded">
                      Decision
                    </span>
                  </div>
                  <h4 className="font-semibold text-slate-200 text-sm leading-relaxed">{dec.decision}</h4>
                </div>
              ))
            ) : (
              <div className="col-span-2 text-center py-16 text-slate-400 text-sm glass-panel rounded-3xl flex flex-col items-center gap-2">
                <p>No decisions logged for this meeting.</p>
                {!(meeting.recordings && meeting.recordings.length > 0) && (
                  <p className="text-slate-500 text-xs">
                    Please upload an audio or video recording first to extract decisions.
                  </p>
                )}
                {meeting.recordings && meeting.recordings.length > 0 && (
                  <p className="text-slate-500 text-xs">
                    Generate an AI Summary in the Summary tab to extract decisions.
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tab Content: Screenshots */}
        {activeTab === "screenshots" && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {meeting.screenshots && meeting.screenshots.length > 0 ? (
              meeting.screenshots.map((shot) => (
                <div
                  key={shot.id}
                  onClick={() => setSelectedScreenshot(shot)}
                  className="group relative aspect-video bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden cursor-pointer hover:border-sky-500/50 transition-all shadow-lg"
                >
                  <img
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    alt={shot.summary || "Meeting slide capture"}
                    src={shot.imageUrl}
                  />
                  <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <ZoomIn className="text-white w-8 h-8" />
                  </div>
                  <div className="absolute bottom-2 left-2 right-2 truncate">
                    <span className="bg-black/60 text-slate-200 text-[10px] px-2 py-1 rounded border border-slate-800">
                      {shot.summary ? shot.summary.slice(0, 25) + "..." : "Slide capture"}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-4 text-center py-16 text-slate-400 text-sm glass-panel rounded-3xl">
                No screenshots uploaded. Use the header button to upload slide captures.
              </div>
            )}
          </div>
        )}
        </div>
      </div>

      {/* Screenshot details modal */}
      {selectedScreenshot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-md">
          <div className="modal-backdrop absolute inset-0" onClick={() => setSelectedScreenshot(null)} />
          <div className="relative bg-slate-900 border border-slate-800 rounded-[32px] w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row z-10 animate-in fade-in zoom-in duration-300 shadow-2xl">
            <div className="flex-1 bg-slate-950/50 flex items-center justify-center relative p-6 min-h-[300px]">
              <img
                className="max-w-full max-h-[70vh] object-contain rounded-xl shadow-2xl border border-slate-800"
                alt="Selected screenshot capture"
                src={selectedScreenshot.imageUrl}
              />
              <button
                className="absolute top-4 right-4 bg-slate-800/80 hover:bg-slate-800 p-2 rounded-full md:hidden cursor-pointer"
                onClick={() => setSelectedScreenshot(null)}
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
            
            <div className="w-full md:w-[400px] p-8 overflow-y-auto custom-scrollbar border-l border-slate-800 flex flex-col gap-6 bg-slate-900/90 shrink-0">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-lg font-semibold text-white font-display mb-1">Slide Details</h2>
                  <p className="text-slate-500 text-xs">
                    Captured {new Date(selectedScreenshot.createdAt).toLocaleTimeString()}
                  </p>
                </div>
                <button
                  className="p-2 hover:bg-slate-800 transition-colors rounded-full hidden md:block cursor-pointer text-slate-400 hover:text-white"
                  onClick={() => setSelectedScreenshot(null)}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest font-display">AI OCR Extract</h3>
                <div className="bg-slate-950/60 p-4 rounded-xl text-slate-300 font-mono text-xs leading-relaxed max-h-[150px] overflow-y-auto border border-slate-800/60 custom-scrollbar">
                  {selectedScreenshot.ocrText ? (
                    selectedScreenshot.ocrText
                  ) : (
                    <span className="italic text-slate-500">No text extracted by OCR.</span>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest font-display">Image Summary</h3>
                <p className="text-slate-300 text-xs leading-relaxed">
                  {selectedScreenshot.summary || "No summary generated."}
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest font-display">Concept Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {Array.isArray(selectedScreenshot.concepts) && selectedScreenshot.concepts.length > 0 ? (
                    selectedScreenshot.concepts.map((tag: string, idx: number) => (
                      <span key={idx} className="px-2.5 py-1 bg-sky-500/10 text-sky-400 border border-sky-500/20 text-[10px] font-semibold rounded-full">
                        {tag}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-500 text-xs italic">No tags.</span>
                  )}
                </div>
              </div>

              <div className="mt-auto pt-6 border-t border-slate-800/60">
                <a
                  href={selectedScreenshot.imageUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs text-center block cursor-pointer transition-colors"
                >
                  Open Original
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MeetingView;
