import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { meetingsApi } from "../lib/api/meetings";
import { workspacesApi } from "../lib/api/workspaces";
import { aiApi } from "../lib/api/ai";
import { api } from "../lib/api";
import {
  Upload,
  Image as ImageIcon,
  FileText,
  X,
  Sparkles,
  CheckCircle2,
  Bolt,
  Play,
  Volume2,
  Brain,
  Gavel,
  CheckSquare,
  ClipboardList,
  Loader2,
  Calendar,
  AlertCircle,
  Trash2,
  ArrowLeft
} from "lucide-react";

type TabType = "overview" | "transcript" | "insights" | "actions" | "visuals" | "visualInsights";

export const MeetingView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [selectedScreenshot, setSelectedScreenshot] = useState<any | null>(null);
  const [activeRecording, setActiveRecording] = useState<any | null>(null);
  const [selectedVisual, setSelectedVisual] = useState<any | null>(null);
  
  // File upload states
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState("");

  // Local Notes State (Overview tab)
  const [localNotes, setLocalNotes] = useState("");
  const [showNotesSaved, setShowNotesSaved] = useState(false);

  // Action Items states
  const [localActionItems, setLocalActionItems] = useState<any[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTaskText, setNewTaskText] = useState("");
  const [newAssignee, setNewAssignee] = useState("");

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

  // Re-fetch meeting data specific to the selected recording's meetingId
  const { data: selectedMeetingDetails, isLoading: isSelectedMeetingLoading } = useQuery({
    queryKey: ["meeting", activeRecording?.meetingId],
    queryFn: () => meetingsApi.getMeeting(activeRecording!.meetingId),
    enabled: !!activeRecording?.meetingId,
    refetchInterval: (query) => {
      const data = query.state.data as any;
      return data?.status === "PROCESSING" ? 5000 : false;
    }
  });

  // Fetch workspace details for workspace members
  const { data: workspace } = useQuery({
    queryKey: ["workspace", meeting?.workspaceId],
    queryFn: () => workspacesApi.getWorkspace(meeting!.workspaceId),
    enabled: !!meeting?.workspaceId,
  });

  const workspaceMembers = workspace?.members || [];

  // Sync action items to local state
  useEffect(() => {
    if (meeting?.actionItems) {
      setLocalActionItems(meeting.actionItems);
    }
  }, [meeting?.actionItems]); 

  // Load local notes from LocalStorage on mount or when meeting id changes
  useEffect(() => {
    if (id) {
      const savedNotes = localStorage.getItem(`meeting_notes_${id}`);
      setLocalNotes(savedNotes || "");
    }
  }, [id]);

  // Handle active recording initialization & updates
  useEffect(() => {
    if (meeting?.recordings && meeting.recordings.length > 0) {
      // Set to the latest uploaded recording by default
      if (!activeRecording || !meeting.recordings.some((r: any) => r.id === activeRecording.id)) {
        setActiveRecording(meeting.recordings[meeting.recordings.length - 1]);
      }
    } else {
      setActiveRecording(null);
    }
  }, [meeting, activeRecording]);

  // Mutation for updating meeting (used for nested action items status update)
  const updateMeetingMutation = useMutation({
    mutationFn: (data: any) => meetingsApi.updateMeeting(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meeting", id] });
      setUploadSuccess("Action item updated.");
      setTimeout(() => setUploadSuccess(""), 3000);
    },
    onError: (err: any) => {
      setUploadError(err?.response?.data?.message || "Failed to update action item.");
      setTimeout(() => setUploadError(""), 4000);
    }
  });

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
        <button
          onClick={() => navigate("/")}
          className="block mx-auto mt-4 px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-semibold"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  // Handle audio/video recordings upload
  const handleAudioVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    // Determine type to route to audio or video upload endpoint
    const isVideo = file.type.startsWith("video/") || /\.(mp4|mov|avi|webm|mkv)$/i.test(file.name);
    const type = isVideo ? "video" : "audio";
    
    const formData = new FormData();
    formData.append("meetingId", id!);
    formData.append("file", file);

    setIsUploading(true);
    setUploadError("");
    setUploadSuccess("");

    try {
      const response = await api.post(`/uploads/${type}`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      
      const newRecording = response.data.recording;
      if (newRecording) {
        setActiveRecording(newRecording);
      }
      
      // Automatically trigger transcription pipeline on the backend
      await aiApi.transcribe(id!);

      queryClient.invalidateQueries({ queryKey: ["meeting", id] });
      setUploadSuccess("Recording uploaded successfully. AI processing queued!");
      setTimeout(() => setUploadSuccess(""), 4000);
    } catch (err: any) {
      setUploadError(err?.response?.data?.message || "Failed to upload recording.");
      setTimeout(() => setUploadError(""), 5000);
    } finally {
      setIsUploading(false);
      // Reset input element
      e.target.value = "";
    }
  };

  // Handle screenshot visuals upload
  const handleScreenshotUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    const formData = new FormData();
    formData.append("meetingId", id!);
    formData.append("file", file);

    setIsUploading(true);
    setUploadError("");
    setUploadSuccess("");

    try {
      const response = await api.post("/uploads/screenshot", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      
      const screenshot = response.data.screenshot;
      // Trigger screenshot OCR and analysis pipeline
      if (screenshot?.id) {
        await aiApi.screenshotAnalysis(screenshot.id);
      }
      
      queryClient.invalidateQueries({ queryKey: ["meeting", id] });
      setUploadSuccess("Visual file uploaded and queued for slide analysis!");
      setTimeout(() => setUploadSuccess(""), 4000);
    } catch (err: any) {
      setUploadError(err?.response?.data?.message || "Failed to upload visual screenshot.");
      setTimeout(() => setUploadError(""), 5000);
    } finally {
      setIsUploading(false);
      // Reset input
      e.target.value = "";
    }
  };



  // Visual Selection Handlers
  const handleSelectVisual = (visual: any) => {
    setSelectedVisual(visual);
    setActiveTab("visualInsights");
  };

  const handleClearVisualSelection = () => {
    setSelectedVisual(null);
    if (activeTab === "visualInsights") {
      setActiveTab("overview");
    }
  };

  // Action Items Handlers
  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText || !newAssignee) return;

    updateMeetingMutation.mutate(
      {
        actionItems: {
          create: {
            task: newTaskText,
            assignee: newAssignee,
            status: "PENDING"
          }
        }
      },
      {
        onSuccess: () => {
          setNewTaskText("");
          setShowAddForm(false);
        }
      }
    );
  };

  const handleToggleStatus = (item: any) => {
    const newStatus = item.status === "DONE" ? "PENDING" : "DONE";

    // Optimistically update local state
    setLocalActionItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, status: newStatus } : i))
    );

    updateMeetingMutation.mutate(
      {
        actionItems: {
          update: {
            where: { id: item.id },
            data: { status: newStatus }
          }
        }
      },
      {
        onError: () => {
          // Revert state on error
          if (meeting?.actionItems) {
            setLocalActionItems(meeting.actionItems);
          }
        }
      }
    );
  };

  const handleDeleteActionItem = async (itemId: string) => {
    // Optimistically remove from local state
    setLocalActionItems((prev) => prev.filter((item) => item.id !== itemId));

    try {
      // Calls DELETE /api/action-items/:id if endpoint exists
      await api.delete(`/action-items/${itemId}`);
      // Invalidate query to sync
      queryClient.invalidateQueries({ queryKey: ["meeting", id] });
    } catch (err) {
      // Fallback: update via updateMeetingMutation
      updateMeetingMutation.mutate(
        {
          actionItems: {
            deleteMany: { id: itemId }
          }
        },
        {
          onError: () => {
            // Revert state on error
            if (meeting?.actionItems) {
              setLocalActionItems(meeting.actionItems);
            }
          }
        }
      );
    }
  };

  // Save notes locally and download as formatted txt file
  const handleSaveNotes = () => {
    localStorage.setItem(`meeting_notes_${id}`, localNotes);
    setShowNotesSaved(true);
    setTimeout(() => setShowNotesSaved(false), 3000);

    const title = meeting.title;
    const date = formattedDate;
    const notesContent = localNotes || "No description or notes.";

    // Transcript
    const transcriptData = activeRecording
      ? (selectedMeetingDetails?.transcriptChunks || [])
      : (meeting.transcriptChunks || []);
    const transcriptText = transcriptData.length > 0
      ? transcriptData.map((chunk: any) => chunk.content).join("\n")
      : "No transcript available.";

    // AI Summary
    const summariesData = activeRecording
      ? (selectedMeetingDetails?.summaries || [])
      : (meeting.summaries || []);
    
    let aiSummaryText = "No summary available.";
    let keyPointsText = "No key points available.";

    if (summariesData.length > 0) {
      aiSummaryText = summariesData.map((sum: any) => sum.summary).join("\n\n");
      
      const allKeyPoints: string[] = [];
      summariesData.forEach((sum: any) => {
        const points = Array.isArray(sum.keyPoints) ? sum.keyPoints : [];
        allKeyPoints.push(...points);
      });
      if (allKeyPoints.length > 0) {
        keyPointsText = allKeyPoints.map((point, idx) => `${idx + 1}. ${point}`).join("\n");
      }
    }

    // Decisions
    const decisionsData = activeRecording
      ? (selectedMeetingDetails?.decisions || [])
      : (meeting.decisions || []);
    
    const decisionsText = decisionsData.length > 0
      ? decisionsData.map((dec: any, idx: number) => `${idx + 1}. ${dec.decision}`).join("\n")
      : "No decisions logged.";

    // Action Items
    const actionItemsText = localActionItems.length > 0
      ? localActionItems.map((item: any) => `${item.task} - ${item.assignee} - ${item.status}`).join("\n")
      : "No action items.";

    // Visual Analyses
    const screenshotsData = meeting.screenshots || [];
    let visualAnalysesText = "No visual analyses available.";
    if (screenshotsData.length > 0) {
      visualAnalysesText = screenshotsData.map((shot: any) => {
        const filename = shot.imageUrl.split("/").pop() || "visual.png";
        const ocr = shot.ocrText ? shot.ocrText.trim() : "No text extracted by OCR.";
        const summary = shot.summary ? shot.summary.trim() : "No summary generated.";
        const concepts = Array.isArray(shot.concepts) && shot.concepts.length > 0
          ? shot.concepts.join(", ")
          : "None";
        return `Filename: ${filename}\nOCR Text: ${ocr}\nSummary: ${summary}\nConcepts: ${concepts}`;
      }).join("\n\n--------------------------------\n\n");
    }

    const fileContent = `================================
MEETING: ${title}
DATE: ${date}
================================

DESCRIPTION & NOTES
${notesContent}

================================
TRANSCRIPT
${transcriptText}

================================
AI SUMMARY
${aiSummaryText}

KEY POINTS
${keyPointsText}

================================
DECISIONS
${decisionsText}

================================
ACTION ITEMS
${actionItemsText}

================================
VISUAL ANALYSES
${visualAnalysesText}
`;

    // Download file
    const element = document.createElement("a");
    const file = new Blob([fileContent], { type: "text/plain;charset=utf-8" });
    element.href = URL.createObjectURL(file);
    element.download = `${title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_meeting_notes.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    URL.revokeObjectURL(element.href);
  };

  const formattedDate = new Date(meeting.date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric"
  });

  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case "PROCESSING":
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20 uppercase tracking-wider flex items-center gap-1.5 h-fit">
            <Loader2 className="w-3 h-3 animate-spin" />
            Processing
          </span>
        );
      case "DONE":
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider flex items-center gap-1.5 h-fit">
            <CheckCircle2 className="w-3 h-3" />
            Done
          </span>
        );
      case "FAILED":
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/20 uppercase tracking-wider flex items-center gap-1.5 h-fit">
            <AlertCircle className="w-3 h-3" />
            Failed
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 uppercase tracking-wider h-fit">
            Pending
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-reveal">
      {/* Back to Workspace navigation */}
      <button
        onClick={() => navigate(`/workspaces/${meeting.workspaceId}`)}
        className="flex items-center gap-2 px-3 py-1.5 bg-slate-900/40 hover:bg-slate-800/60 text-slate-400 hover:text-white rounded-xl text-xs font-semibold border border-slate-800/60 transition-all cursor-pointer w-fit"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Workspace
      </button>

      {/* 1. HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-6 border-b border-slate-800/60">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            {getStatusBadge(meeting.status)}
            <span className="text-slate-400 text-xs flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              {formattedDate}
            </span>
          </div>
          
          <h1 className="text-3xl font-semibold text-white tracking-tight font-display">
            {meeting.title}
          </h1>
        </div>

        {/* Action Upload Buttons */}
        <div className="flex flex-col gap-2 shrink-0">
          <div className="flex items-center gap-3">
            <input
              type="file"
              id="audio-video-file-input"
              className="hidden"
              accept="audio/*,video/*"
              onChange={handleAudioVideoUpload}
            />
            <input
              type="file"
              id="visuals-file-input"
              className="hidden"
              accept="image/*"
              onChange={handleScreenshotUpload}
            />

            <button
              onClick={() => document.getElementById("visuals-file-input")?.click()}
              disabled={isUploading}
              className="flex items-center gap-2 px-5 py-3 border border-slate-800 text-slate-300 hover:text-white font-semibold rounded-xl hover:bg-slate-800/50 transition-colors cursor-pointer disabled:opacity-50 text-sm"
            >
              <ImageIcon className="w-4 h-4 text-sky-400" />
              Add Visuals
            </button>

            <button
              onClick={() => document.getElementById("audio-video-file-input")?.click()}
              disabled={isUploading}
              className="pulse-btn flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-[#0ea5e9] to-[#a855f7] text-white font-semibold rounded-xl hover:scale-102 transition-all cursor-pointer disabled:opacity-50 text-sm shadow-lg shadow-blue-500/10"
            >
              <Upload className="w-4 h-4" />
              Add Recording
            </button>
          </div>

          {/* Toast Upload Feedback */}
          {uploadError && <p className="text-error text-xs text-right">{uploadError}</p>}
          {uploadSuccess && <p className="text-emerald-400 text-xs text-right">{uploadSuccess}</p>}
        </div>
      </div>

      {/* Processing Status Card (below the buttons) */}
      {meeting.status !== "PENDING" && (
        <div className={`p-4 rounded-2xl border transition-all ${
          meeting.status === "PROCESSING"
            ? "bg-sky-500/5 border-sky-500/20 text-sky-400 flex items-center gap-3"
            : meeting.status === "DONE"
              ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-400 flex items-center gap-3"
              : "bg-red-500/5 border-red-500/20 text-red-400 flex items-center gap-3"
        }`}>
          {meeting.status === "PROCESSING" ? (
            <>
              <Loader2 className="w-5 h-5 text-sky-400 animate-spin shrink-0" />
              <div className="text-xs">
                <span className="font-semibold block text-slate-200">Recording uploaded — AI is processing...</span>
                <span className="text-slate-400 mt-0.5 block">Gemini is parsing the transcripts, summaries, action items, and slide screenshots.</span>
              </div>
            </>
          ) : meeting.status === "DONE" ? (
            <>
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span className="text-xs font-semibold text-slate-200">Analysis complete</span>
            </>
          ) : (
            <>
              <X className="w-5 h-5 text-red-400 shrink-0" />
              <span className="text-xs font-semibold text-slate-200">AI analysis failed. Please try re-uploading the file.</span>
            </>
          )}
        </div>
      )}

      {/* 2. MAIN CONTENT SPLIT LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Media Player, Uploaded Recordings and Uploaded Visuals */}
        <div className="lg:col-span-1 space-y-6">
          {/* Active Preview */}
          <div className="glass-panel rounded-3xl p-6 space-y-4">
            <h2 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
              <Play className="w-5 h-5 text-sky-400" />
              Active Preview
            </h2>
            
            {activeRecording ? (
              <div className="space-y-4">
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
                <div className="text-xs text-slate-400 space-y-1">
                  <p className="font-semibold text-slate-200 truncate">
                    File: <a href={activeRecording.fileUrl} target="_blank" rel="noreferrer" className="text-sky-400 hover:underline">{activeRecording.fileUrl.split("/").pop()}</a>
                  </p>
                  <p>Uploaded: {new Date(activeRecording.createdAt).toLocaleString()}</p>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl bg-slate-950 border border-slate-800 p-8 flex flex-col items-center justify-center gap-4 text-center">
                <Play className="w-12 h-12 text-slate-600 animate-pulse" />
                <p className="text-slate-400 text-xs font-semibold">No active preview</p>
                <p className="text-slate-500 text-[10px] max-w-[200px]">Select a recording below to load the player preview.</p>
              </div>
            )}
          </div>

          {/* Uploaded Recordings */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 bg-slate-900/10 space-y-4">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider font-display flex items-center gap-2">
              <Play className="w-4 h-4 text-sky-400" />
              Uploaded Recordings ({meeting.recordings?.length || 0})
            </h3>
            
            <div className="space-y-3">
              {meeting.recordings && meeting.recordings.length > 0 ? (
                meeting.recordings.map((rec) => {
                  const isSelected = activeRecording?.id === rec.id;
                  return (
                    <div
                      key={rec.id}
                      onClick={() => setActiveRecording(isSelected ? null : rec)}
                      className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 cursor-pointer ${
                        isSelected
                          ? "bg-sky-500/5 border-sky-500/20 text-white"
                          : "bg-slate-950/40 border-slate-800/80 text-slate-400 hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Play className={`w-4 h-4 shrink-0 ${isSelected ? "text-primary animate-pulse" : "text-slate-500"}`} />
                        <div className="min-w-0">
                          <p className="font-semibold text-xs text-slate-200 truncate">{rec.fileUrl.split("/").pop()}</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">{new Date(rec.createdAt).toLocaleString()}</p>
                        </div>
                      </div>
                      <span
                        className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold transition-all shrink-0 uppercase tracking-wider ${
                          isSelected
                            ? "bg-primary/20 text-white border-primary/30 text-sky-400"
                            : "bg-slate-900 border-slate-800 text-slate-400"
                        }`}
                      >
                        {isSelected ? "Selected" : "Play"}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-6 text-slate-500 text-xs italic">
                  No recording files uploaded yet.
                </div>
              )}
            </div>
          </div>

          {/* Uploaded Visuals */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 bg-slate-900/10 space-y-4">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider font-display flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-sky-400" />
              Uploaded Visuals ({meeting.screenshots?.length || 0})
            </h3>
            
            {meeting.screenshots && meeting.screenshots.length > 0 ? (
              <div className="grid grid-cols-3 gap-2">
                {meeting.screenshots.map((shot) => {
                  const isSelected = selectedVisual?.id === shot.id;
                  return (
                    <div
                      key={shot.id}
                      onClick={() => handleSelectVisual(shot)}
                      className={`group relative aspect-video bg-slate-900 border rounded-xl overflow-hidden cursor-pointer transition-all ${
                        isSelected ? "border-sky-500 ring-2 ring-sky-500/20" : "border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      <img
                        src={shot.imageUrl}
                        alt={shot.summary || "Visual"}
                        className="w-full h-full object-cover"
                      />
                      {isSelected ? (
                        <div className="absolute top-1 right-1 bg-sky-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded shadow">
                          SELECTED
                        </div>
                      ) : (
                        <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="bg-black/60 text-slate-200 text-[8px] font-bold px-1.5 py-0.5 rounded border border-slate-800">
                            VIEW
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6 text-slate-500 text-xs italic">
                No visual files uploaded yet.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Tab View */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tab buttons */}
          <div className="border-b border-slate-800/60 flex gap-6 overflow-x-auto custom-scrollbar">
            {(
              [
                { key: "overview", label: "Overview" },
                { key: "transcript", label: "Transcript" },
                { key: "insights", label: "AI Insights" },
                { key: "actions", label: "Action Items" },
                ...(selectedVisual ? [{ key: "visualInsights", label: "Visual Insights" }] : [])
              ] as { key: TabType; label: string }[]
            ).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`pb-4 text-sm transition-all cursor-pointer border-b-2 font-semibold whitespace-nowrap ${
                  activeTab === tab.key
                    ? "border-[#0ea5e9] text-white"
                    : "border-transparent text-slate-500 hover:text-slate-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* OVERVIEW TAB */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-3 gap-4">
                <div className="glass-panel p-5 rounded-2xl bg-slate-900/10 border-slate-800 text-center">
                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest block mb-1">Tasks</span>
                  <span className="text-2xl font-bold text-white font-display">
                    {meeting.actionItems?.length || 0}
                  </span>
                </div>
                <div className="glass-panel p-5 rounded-2xl bg-slate-900/10 border-slate-800 text-center">
                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest block mb-1">Decisions</span>
                  <span className="text-2xl font-bold text-white font-display">
                    {meeting.decisions?.length || 0}
                  </span>
                </div>
                <div className="glass-panel p-5 rounded-2xl bg-slate-900/10 border-slate-800 text-center">
                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest block mb-1">Visuals</span>
                  <span className="text-2xl font-bold text-white font-display">
                    {meeting.screenshots?.length || 0}
                  </span>
                </div>
              </div>

              {/* Description & Notes */}
              <div className="glass-panel p-6 rounded-3xl border border-slate-800 bg-slate-900/10 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-semibold text-white uppercase tracking-wider font-display flex items-center gap-2">
                    <ClipboardList className="w-4 h-4 text-sky-400" />
                    Meeting Description & Notes
                  </h3>
                  <button
                    onClick={handleSaveNotes}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-semibold transition-all cursor-pointer"
                  >
                    Save Notes
                  </button>
                </div>
                
                <textarea
                  value={localNotes}
                  onChange={(e) => setLocalNotes(e.target.value)}
                  className="w-full min-h-[120px] bg-slate-950/40 border border-slate-800 focus:border-primary/40 rounded-xl p-4 text-slate-300 text-sm outline-none resize-y input-glow transition-all"
                  placeholder="Type description, agenda, or additional notes here. Saved locally..."
                />
                
                {showNotesSaved && (
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold animate-pulse">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Notes saved locally!</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TRANSCRIPT TAB */}
          {activeTab === "transcript" && (
            <div className="glass-panel rounded-3xl p-6 h-[500px] overflow-y-auto custom-scrollbar flex flex-col gap-6 bg-slate-900/10">
              {activeRecording ? (
                isSelectedMeetingLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                  </div>
                ) : selectedMeetingDetails?.transcriptChunks && selectedMeetingDetails.transcriptChunks.length > 0 ? (
                  selectedMeetingDetails.transcriptChunks.map((chunk) => (
                    <div
                      key={chunk.id}
                      className="glass-panel p-5 rounded-2xl flex gap-4 bg-slate-900/20 border-slate-800 hover:border-slate-700/50 transition-all"
                    >
                      <span className="text-[10px] font-bold bg-slate-800/80 text-slate-500 px-2 py-1 rounded-lg shrink-0 h-fit font-mono border border-slate-700/35">
                        #{chunk.chunkIndex + 1}
                      </span>
                      <div className="space-y-1.5 flex-grow">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-semibold text-sky-400">Speaker</span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {chunk.chunkIndex === 0 ? "00:00" : `${chunk.chunkIndex * 5}:00`}
                          </span>
                        </div>
                        <p className="text-slate-300 text-sm leading-relaxed font-body">
                          {chunk.content}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center flex flex-col items-center justify-center h-full gap-4">
                    <FileText className="w-12 h-12 text-slate-600" />
                    <p className="text-slate-400 text-sm">No transcript generated yet</p>
                    <p className="text-slate-500 text-xs max-w-sm">
                      AI is still transcribing this recording. Please check back in a moment.
                    </p>
                  </div>
                )
              ) : (
                <div className="text-center flex flex-col items-center justify-center h-full gap-4">
                  <FileText className="w-12 h-12 text-slate-600" />
                  <p className="text-slate-400 text-sm font-semibold">No recording selected</p>
                  <p className="text-slate-500 text-xs max-w-sm">
                    Select a recording from the Left Panel to view its specific transcript chunks.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* AI INSIGHTS TAB */}
          {activeTab === "insights" && (
            <div className="space-y-6">
              {activeRecording ? (
                isSelectedMeetingLoading ? (
                  <div className="flex items-center justify-center min-h-[300px]">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                  </div>
                ) : selectedMeetingDetails?.summaries && selectedMeetingDetails.summaries.length > 0 ? (
                  <>
                    {selectedMeetingDetails.summaries.map((sum) => {
                      const keyPoints = Array.isArray(sum.keyPoints) ? sum.keyPoints : [];
                      
                      return (
                        <div key={sum.id} className="space-y-6 animate-reveal">
                          {/* Executive Summary */}
                          <div className="glass-panel rounded-3xl p-8 bg-slate-900/10 border-slate-800">
                            <h3 className="text-lg font-semibold text-white mb-4 font-display flex items-center gap-2">
                              <Brain className="w-5 h-5 text-sky-400" />
                              Executive Summary
                            </h3>
                            <p className="text-slate-300 text-sm leading-relaxed font-body">
                              {sum.summary}
                            </p>
                          </div>

                          {/* Key Points */}
                          <div className="glass-panel rounded-3xl p-6 bg-slate-900/10 border-slate-800">
                            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2 font-display">
                              <Bolt className="w-4 h-4 text-purple-400" />
                              Key Highlights
                            </h3>
                            <ul className="space-y-3 pl-1">
                              {keyPoints.map((point: string, idx: number) => (
                                <li key={idx} className="flex gap-2.5 items-start">
                                  <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                                  <span className="text-slate-300 text-xs leading-relaxed font-body">{point}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      );
                    })}

                    {/* Decisions Made Section */}
                    {selectedMeetingDetails.decisions && selectedMeetingDetails.decisions.length > 0 && (
                      <>
                        <div className="border-t border-slate-800/80 my-6"></div>
                        
                        <div className="glass-panel rounded-3xl p-8 bg-slate-900/10 border-slate-800 animate-reveal">
                          <h3 className="text-base font-semibold text-white mb-4 font-display flex items-center gap-2">
                            <Gavel className="w-5 h-5 text-sky-400" />
                            Decisions Made
                          </h3>

                          <ol className="space-y-4 list-decimal pl-5">
                            {selectedMeetingDetails.decisions.map((dec, idx) => (
                              <li key={dec.id || idx} className="text-slate-300 text-xs leading-relaxed font-body pl-1">
                                <span className="font-semibold text-slate-200">{dec.decision}</span>
                              </li>
                            ))}
                          </ol>
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="glass-panel rounded-[32px] p-12 text-center flex flex-col items-center gap-4 bg-slate-900/10 border-slate-800">
                    <Sparkles className="w-12 h-12 text-purple-400" />
                    <p className="text-slate-400 text-sm">AI insights will appear after processing</p>
                    <p className="text-slate-500 text-xs max-w-sm">
                      Key highlights and summaries are automatically generated after recording processing.
                    </p>
                  </div>
                )
              ) : (
                <div className="glass-panel rounded-[32px] p-12 text-center flex flex-col items-center gap-4 bg-slate-900/10 border-slate-800">
                  <Sparkles className="w-12 h-12 text-purple-400" />
                  <p className="text-slate-400 text-sm font-semibold">No recording selected</p>
                  <p className="text-slate-500 text-xs max-w-sm">
                    Select a recording from the Left Panel to view its specific AI summaries and decisions.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ACTION ITEMS TAB */}
          {activeTab === "actions" && (
            <div className="space-y-6">
              {/* Header with Add Task button */}
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-semibold text-white uppercase tracking-wider font-display flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-sky-400" />
                  Action Items
                </h3>
                {!showAddForm && (
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-semibold transition-all cursor-pointer"
                  >
                    Add Task
                  </button>
                )}
              </div>

              {/* Inline Form */}
              {showAddForm && (
                <form onSubmit={handleAddTask} className="glass-panel p-5 rounded-2xl border border-slate-800 bg-slate-950/20 space-y-4 animate-reveal">
                  <h4 className="text-xs font-semibold text-white uppercase tracking-wider">New Action Item</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold text-slate-500 uppercase">Task Description</label>
                      <input
                        type="text"
                        value={newTaskText}
                        onChange={(e) => setNewTaskText(e.target.value)}
                        placeholder="What needs to be done?"
                        required
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:border-sky-500 outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold text-slate-500 uppercase">Assignee</label>
                      <select
                        value={newAssignee}
                        onChange={(e) => setNewAssignee(e.target.value)}
                        required
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:border-sky-500 outline-none cursor-pointer"
                      >
                        <option value="">Select assignee...</option>
                        {workspaceMembers.map((member: any) => (
                          <option key={member.id} value={member.user?.name || ""}>
                            {member.user?.name || "Unknown Member"}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddForm(false);
                        setNewTaskText("");
                      }}
                      className="px-3 py-2 border border-slate-800 text-slate-400 hover:text-white rounded-xl text-[10px] font-bold transition-all cursor-pointer uppercase"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={updateMeetingMutation.isPending}
                      className="px-4 py-2 bg-gradient-to-r from-sky-500 to-purple-500 text-white rounded-xl text-[10px] font-bold hover:scale-102 transition-all cursor-pointer uppercase shadow-lg shadow-sky-500/10"
                    >
                      Add Task
                    </button>
                  </div>
                </form>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* To Do Section */}
                <div className="glass-panel p-6 rounded-3xl border border-slate-800 bg-slate-900/10 space-y-4">
                  <h4 className="text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-sky-500"></span>
                    To Do ({localActionItems.filter((i) => i.status !== "DONE").length})
                  </h4>
                  <div className="space-y-3">
                    {localActionItems.filter((i) => i.status !== "DONE").length > 0 ? (
                      localActionItems
                        .filter((i) => i.status !== "DONE")
                        .map((item) => (
                          <div key={item.id} className="flex items-center justify-between p-4 bg-slate-950/40 border border-slate-800/80 rounded-2xl gap-3 hover:border-slate-700 transition-all">
                            <div className="flex items-start gap-3 min-w-0">
                              <input
                                type="checkbox"
                                checked={false}
                                onChange={() => handleToggleStatus(item)}
                                className="w-4 h-4 rounded border-slate-800 text-sky-500 bg-slate-950 focus:ring-sky-500 focus:ring-offset-0 focus:ring-0 cursor-pointer mt-0.5"
                              />
                              <div className="space-y-1 min-w-0">
                                <p className="text-xs font-medium text-slate-200 break-words">
                                  {item.task}
                                </p>
                                <div className="flex flex-wrap items-center gap-2">
                                  {/* Assignee Chip */}
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-slate-800/80 text-slate-300 text-[9px] font-semibold border border-slate-700/50">
                                    <span className="w-3.5 h-3.5 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center text-[7px] font-bold">
                                      {item.assignee.slice(0, 2).toUpperCase()}
                                    </span>
                                    {item.assignee}
                                  </span>
                                  {/* Status Badge */}
                                  <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                                    item.status === "IN_PROGRESS"
                                      ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                      : "bg-slate-500/10 text-slate-400 border border-slate-500/20"
                                  }`}>
                                    {item.status.replace("_", " ")}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => handleDeleteActionItem(item.id)}
                              className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/5 transition-all rounded-lg cursor-pointer shrink-0"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))
                    ) : (
                      <p className="text-center py-6 text-slate-500 text-xs italic">No items to do.</p>
                    )}
                  </div>
                </div>

                {/* Completed Section */}
                <div className="glass-panel p-6 rounded-3xl border border-slate-800 bg-slate-900/10 space-y-4">
                  <h4 className="text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    Completed ({localActionItems.filter((i) => i.status === "DONE").length})
                  </h4>
                  <div className="space-y-3">
                    {localActionItems.filter((i) => i.status === "DONE").length > 0 ? (
                      localActionItems
                        .filter((i) => i.status === "DONE")
                        .map((item) => (
                          <div key={item.id} className="flex items-center justify-between p-4 bg-slate-950/40 border border-slate-800/80 rounded-2xl gap-3 hover:border-slate-700 transition-all opacity-75">
                            <div className="flex items-start gap-3 min-w-0">
                              <input
                                type="checkbox"
                                checked={true}
                                onChange={() => handleToggleStatus(item)}
                                className="w-4 h-4 rounded border-slate-800 text-emerald-500 bg-slate-950 focus:ring-emerald-500 focus:ring-offset-0 focus:ring-0 cursor-pointer mt-0.5"
                              />
                              <div className="space-y-1 min-w-0">
                                <p className="text-xs font-medium text-slate-500 line-through break-words">
                                  {item.task}
                                </p>
                                <div className="flex flex-wrap items-center gap-2">
                                  {/* Assignee Chip */}
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-slate-850/80 text-slate-400 text-[9px] font-semibold border border-slate-850/50">
                                    <span className="w-3.5 h-3.5 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-[7px] font-bold">
                                      {item.assignee.slice(0, 2).toUpperCase()}
                                    </span>
                                    {item.assignee}
                                  </span>
                                  <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
                                    Done
                                  </span>
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => handleDeleteActionItem(item.id)}
                              className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/5 transition-all rounded-lg cursor-pointer shrink-0"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))
                    ) : (
                      <p className="text-center py-6 text-slate-500 text-xs italic">No completed items.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VISUAL INSIGHTS TAB */}
          {activeTab === "visualInsights" && selectedVisual && (
            <div className="glass-panel rounded-3xl p-8 bg-slate-900/10 border-slate-800 space-y-6 animate-reveal">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-white font-display mb-1 flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-sky-400" />
                    Visual Insights
                  </h3>
                  <p className="text-slate-500 text-xs">
                    Uploaded {new Date(selectedVisual.createdAt).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={handleClearVisualSelection}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-[10px] font-bold transition-all cursor-pointer uppercase tracking-wider"
                >
                  Clear Selection
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Visual Image */}
                <div className="bg-slate-950/50 rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center p-4">
                  <img
                    src={selectedVisual.imageUrl}
                    alt="Visual Insights"
                    className="max-h-[300px] object-contain rounded-lg shadow-lg"
                  />
                </div>

                {/* Info and Concepts */}
                <div className="space-y-4">
                  {/* Summary Box */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest block">AI Summary</span>
                    <p className="text-slate-300 text-xs leading-relaxed font-body">
                      {selectedVisual.summary || "No summary generated."}
                    </p>
                  </div>

                  {/* Concepts Tags */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest block">Concept Tags</span>
                    <div className="flex flex-wrap gap-1.5">
                      {Array.isArray(selectedVisual.concepts) && selectedVisual.concepts.length > 0 ? (
                        selectedVisual.concepts.map((tag: string, idx: number) => (
                          <span key={idx} className="px-2 py-0.5 bg-sky-500/10 text-sky-400 border border-sky-500/20 text-[9px] font-semibold rounded-full">
                            {tag}
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-500 text-xs italic">No concepts.</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* OCR Text Box */}
              <div className="space-y-2 pt-4 border-t border-slate-800/60">
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest block">AI OCR Extract</span>
                <div className="bg-slate-950/60 p-4 rounded-xl text-slate-300 font-mono text-xs leading-relaxed max-h-[150px] overflow-y-auto border border-slate-800/60 custom-scrollbar">
                  {selectedVisual.ocrText ? (
                    selectedVisual.ocrText
                  ) : (
                    <span className="italic text-slate-500">No text extracted by OCR.</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. SCREENSHOT DETAILS MODAL */}
      {selectedScreenshot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-md">
          <div className="modal-backdrop absolute inset-0" onClick={() => setSelectedScreenshot(null)} />
          <div className="relative bg-slate-900 border border-slate-800 rounded-[32px] w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row z-10 animate-in fade-in zoom-in duration-300 shadow-2xl">
            {/* Modal Image Display (Left) */}
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
            
            {/* Modal Analysis panel (Right) */}
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

              {/* OCR Text Box */}
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

              {/* Summary Box */}
              <div className="space-y-2">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest font-display">Image Summary</h3>
                <p className="text-slate-300 text-xs leading-relaxed font-body">
                  {selectedScreenshot.summary || "No summary generated."}
                </p>
              </div>

              {/* Concepts Tags */}
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
