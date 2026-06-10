export interface TranscribeJobPayload {
  recordingId: string;
  meetingId: string;
  fileUrl: string;
  mimeType: string;
}

export interface ScreenshotAnalysisJobPayload {
  screenshotId: string;
  meetingId: string;
  imageUrl: string;
}
