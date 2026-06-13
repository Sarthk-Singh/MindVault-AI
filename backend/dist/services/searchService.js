"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.semanticSearch = semanticSearch;
const prisma_1 = require("../config/prisma");
const embeddingService_1 = require("./embeddingService");
async function semanticSearch(query, workspaceId, limit = 10) {
    const queryVector = await (0, embeddingService_1.generateEmbedding)(query);
    const queryVectorLiteral = `[${queryVector.join(",")}]`;
    const rawResults = await prisma_1.prisma.$queryRaw `
    SELECT "sourceId", "sourceType", 1 - (vector <=> ${queryVectorLiteral}::vector(768)) AS similarity 
    FROM "Embedding" 
    ORDER BY similarity DESC 
    LIMIT ${limit}
  `;
    const fetchPromises = rawResults.map(async (row) => {
        const sourceId = row.sourceId;
        const sourceType = row.sourceType;
        const similarity = typeof row.similarity === "number" ? row.similarity : parseFloat(row.similarity);
        if (sourceType === "transcript") {
            const chunk = await prisma_1.prisma.transcriptChunk.findUnique({
                where: { id: sourceId },
                include: { meeting: true }
            });
            if (chunk && chunk.meeting.workspaceId === workspaceId) {
                return {
                    sourceType,
                    content: chunk.content,
                    meetingId: chunk.meetingId,
                    meetingTitle: chunk.meeting.title,
                    similarity
                };
            }
        }
        else if (sourceType === "screenshot") {
            const screenshot = await prisma_1.prisma.screenshot.findUnique({
                where: { id: sourceId },
                include: { meeting: true }
            });
            if (screenshot && screenshot.meeting.workspaceId === workspaceId) {
                return {
                    sourceType,
                    content: `${screenshot.ocrText} ${screenshot.summary}`.trim(),
                    meetingId: screenshot.meetingId,
                    meetingTitle: screenshot.meeting.title,
                    similarity
                };
            }
        }
        else if (sourceType === "summary") {
            const summary = await prisma_1.prisma.summary.findUnique({
                where: { id: sourceId },
                include: { meeting: true }
            });
            if (summary && summary.meeting.workspaceId === workspaceId) {
                return {
                    sourceType,
                    content: summary.summary,
                    meetingId: summary.meetingId,
                    meetingTitle: summary.meeting.title,
                    similarity
                };
            }
        }
        return null;
    });
    const results = await Promise.all(fetchPromises);
    return results.filter((r) => r !== null);
}
