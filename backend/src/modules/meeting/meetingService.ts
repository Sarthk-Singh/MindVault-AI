import { prisma } from "../../config/prisma";

export const meetingService = {
  createMeeting(data: any) {
    return prisma.meeting.create({ data });
  },

  getMeetings(workspaceId: string) {
    return prisma.meeting.findMany({ where: { workspaceId } });
  },

  getMeetingById(id: string) {
    return prisma.meeting.findUnique({ where: { id } });
  },

  updateMeeting(id: string, data: any) {
    return prisma.meeting.update({ where: { id }, data });
  },

  deleteMeeting(id: string) {
    return prisma.meeting.delete({ where: { id } });
  }
};
