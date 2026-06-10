"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.meetingService = void 0;
const prisma_1 = require("../../config/prisma");
exports.meetingService = {
    createMeeting(data) {
        return prisma_1.prisma.meeting.create({ data });
    },
    getMeetings(workspaceId) {
        return prisma_1.prisma.meeting.findMany({ where: { workspaceId } });
    },
    getMeetingById(id) {
        return prisma_1.prisma.meeting.findUnique({ where: { id } });
    },
    updateMeeting(id, data) {
        return prisma_1.prisma.meeting.update({ where: { id }, data });
    },
    deleteMeeting(id) {
        return prisma_1.prisma.meeting.delete({ where: { id } });
    }
};
