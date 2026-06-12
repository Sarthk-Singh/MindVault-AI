import { prisma } from "./config/prisma";

async function main() {
  const user = await prisma.user.findFirst({
    where: { email: "sarthaksinghddn@gmail.com" }
  });
  if (!user) {
    console.log("User not found!");
    return;
  }
  console.log("USER:", user);

  const workspaces = await prisma.workspace.findMany({
    where: { members: { some: { userId: user.id } } },
    include: {
      members: true,
      meetings: {
        include: {
          recordings: true,
          screenshots: true,
          summaries: true,
          actionItems: true,
          decisions: true,
          transcriptChunks: true
        }
      }
    }
  });

  console.log("WORKSPACES & MEETINGS STATUS:");
  for (const ws of workspaces) {
    console.log(`Workspace: ${ws.name} (ID: ${ws.id})`);
    for (const mt of ws.meetings) {
      console.log(`  Meeting: ${mt.title} (ID: ${mt.id})`);
      console.log(`    Status: ${mt.status}`);
      console.log(`    Recordings count: ${mt.recordings.length}`);
      console.log(`    Screenshots count: ${mt.screenshots.length}`);
      console.log(`    Summaries count: ${mt.summaries.length}`);
      console.log(`    TranscriptChunks count: ${mt.transcriptChunks.length}`);
      console.log(`    ActionItems count: ${mt.actionItems.length}`);
      console.log(`    Decisions count: ${mt.decisions.length}`);
      
      if (mt.summaries.length > 0) {
        console.log(`    Summary text snippet: ${mt.summaries[0].summary.slice(0, 100)}...`);
      }
      if (mt.screenshots.length > 0) {
        console.log(`    Screenshot details:`, mt.screenshots.map(s => ({ id: s.id, hasOcr: !!s.ocrText, hasSummary: !!s.summary, hasConcepts: s.concepts })));
      }
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
