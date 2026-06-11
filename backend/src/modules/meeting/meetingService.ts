import { prisma } from "../../config/prisma";

export const meetingService = {
  createMeeting(data: any) {
    return prisma.meeting.create({ data });
  },

  getMeetings(workspaceId: string) {
    return prisma.meeting.findMany({ where: { workspaceId } });
  },

  getMeetingById(id: string) {
    return prisma.meeting.findUnique({
      where: { id },
      include: {
        recordings: true,
        screenshots: true,
        transcriptChunks: {
          orderBy: {
            chunkIndex: "asc"
          }
        },
        summaries: true,
        decisions: true,
        actionItems: true
      }
    });
  },

  updateMeeting(id: string, data: any) {
    return prisma.meeting.update({ where: { id }, data });
  },

  deleteMeeting(id: string) {
    return prisma.meeting.delete({ where: { id } });
  }
};
