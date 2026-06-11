import { api } from "../api";

export interface JobQueuedResponse {
  message: string;
  jobName: string;
  meetingId: string;
  recordingId?: string;
  screenshotId?: string;
}

export const aiApi = {
  async transcribe(meetingId: string): Promise<JobQueuedResponse> {
    const response = await api.post<JobQueuedResponse>("/transcribe", { meetingId });
    return response.data;
  },

  async summarize(meetingId: string): Promise<JobQueuedResponse> {
    const response = await api.post<JobQueuedResponse>("/summarize", { meetingId });
    return response.data;
  },

  async actionItems(meetingId: string): Promise<JobQueuedResponse> {
    const response = await api.post<JobQueuedResponse>("/action-items", { meetingId });
    return response.data;
  },

  async screenshotAnalysis(screenshotId: string): Promise<JobQueuedResponse> {
    const response = await api.post<JobQueuedResponse>("/screenshot-analysis", { screenshotId });
    return response.data;
  }
};
