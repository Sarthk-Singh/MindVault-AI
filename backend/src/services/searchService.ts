import { prisma } from "../config/prisma";
import { generateEmbedding } from "./embeddingService";

export interface SemanticSearchResult {
  sourceType: string;
  content: string;
  meetingId: string;
  meetingTitle: string;
  similarity: number;
}

export async function semanticSearch(
  query: string,
  workspaceId: string,
  limit = 10
): Promise<SemanticSearchResult[]> {
  const queryVector = await generateEmbedding(query);
  const queryVectorLiteral = `[${queryVector.join(",")}]`;

  const rawResults = await prisma.$queryRaw<any[]>`
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
      const chunk = await prisma.transcriptChunk.findUnique({
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
    } else if (sourceType === "screenshot") {
      const screenshot = await prisma.screenshot.findUnique({
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
    } else if (sourceType === "summary") {
      const summary = await prisma.summary.findUnique({
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
  return results.filter((r): r is SemanticSearchResult => r !== null);
}
