import { api } from "../api";

export interface Recording {
  id: string;
  meetingId: string;
  fileUrl: string;
  mimeType: string;
  createdAt: string;
}

export interface Screenshot {
  id: string;
  meetingId: string;
  imageUrl: string;
  ocrText: string;
  summary: string;
  concepts: string[]; // JSON array
  createdAt: string;
}

export interface TranscriptChunk {
  id: string;
  meetingId: string;
  content: string;
  chunkIndex: number;
  createdAt: string;
}

export interface Summary {
  id: string;
  meetingId: string;
  summary: string;
  keyPoints: string[]; // JSON array of key points
  createdAt: string;
}

export interface Decision {
  id: string;
  meetingId: string;
  decision: string;
  createdAt: string;
}

export interface ActionItem {
  id: string;
  meetingId: string;
  task: string;
  assignee: string;
  status: "PENDING" | "IN_PROGRESS" | "DONE";
  createdAt: string;
}

export interface MeetingDetails {
  id: string;
  title: string;
  workspaceId: string;
  createdById: string;
  date: string;
  status: "PENDING" | "PROCESSING" | "DONE" | "FAILED";
  createdAt: string;
  recordings?: Recording[];
  screenshots?: Screenshot[];
  transcriptChunks?: TranscriptChunk[];
  summaries?: Summary[];
  decisions?: Decision[];
  actionItems?: ActionItem[];
}

export const meetingsApi = {
  async listMeetings(workspaceId: string): Promise<MeetingDetails[]> {
    const response = await api.get<{ meetings: MeetingDetails[] }>("/meetings", {
      params: { workspaceId }
    });
    return response.data.meetings;
  },

  async getMeeting(id: string): Promise<MeetingDetails> {
    // Note: Mount point is /api/meetings and route parameter is :id
    const response = await api.get<{ meeting: MeetingDetails }>(`/meetings/${id}`);
    return response.data.meeting;
  },

  async createMeeting(title: string, workspaceId: string, date: string): Promise<MeetingDetails> {
    const response = await api.post<{ meeting: MeetingDetails }>("/meetings", {
      title,
      workspaceId,
      date
    });
    return response.data.meeting;
  },

  async updateMeeting(id: string, data: any): Promise<MeetingDetails> {
    const response = await api.patch<{ meeting: MeetingDetails }>(`/meetings/${id}`, data);
    return response.data.meeting;
  },

  async deleteMeeting(id: string): Promise<{ success: boolean }> {
    const response = await api.delete<{ success: boolean }>(`/meetings/${id}`);
    return response.data;
  }
};
