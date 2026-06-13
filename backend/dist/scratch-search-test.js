"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = require("./config/prisma");
const embeddingService_1 = require("./services/embeddingService");
const searchService_1 = require("./services/searchService");
async function main() {
    console.log("=== Testing Semantic Search Pipeline ===");
    // 1. Check Gemini API key & Embedding Generation
    console.log("\n1. Testing embedding generation...");
    try {
        const testText = "Artificial Intelligence and Machine Learning are transforming modern software development.";
        const embedding = await (0, embeddingService_1.generateEmbedding)(testText);
        console.log(`Success! Generated embedding with ${embedding.length} dimensions.`);
        if (embedding.length !== 768) {
            throw new Error(`Expected 768 dimensions, got ${embedding.length}`);
        }
    }
    catch (err) {
        console.error("Embedding generation failed:", err);
        process.exit(1);
    }
    // 2. Find/Create a test meeting and workspace to run end-to-end flow
    console.log("\n2. Finding user and workspace for database integration test...");
    let user = await prisma_1.prisma.user.findFirst({
        where: { email: "sarthaksinghddn@gmail.com" }
    });
    if (!user) {
        user = await prisma_1.prisma.user.findFirst();
    }
    if (!user) {
        console.log("No users found in database, skipping DB-write test.");
        return;
    }
    console.log(`Using User: ${user.name} (${user.email})`);
    let workspace = await prisma_1.prisma.workspace.findFirst({
        where: { members: { some: { userId: user.id } } }
    });
    if (!workspace) {
        workspace = await prisma_1.prisma.workspace.findFirst();
        if (workspace) {
            await prisma_1.prisma.workspaceMember.create({
                data: {
                    workspaceId: workspace.id,
                    userId: user.id,
                    role: "WORKSPACE_MANAGER"
                }
            });
            console.log(`Linked User to existing Workspace: ${workspace.name}`);
        }
    }
    if (!workspace) {
        console.log("No workspaces found in database, skipping DB-write test.");
        return;
    }
    console.log(`Using Workspace: ${workspace.name} (${workspace.id})`);
    // Let's create a temporary meeting to avoid messing up real data
    console.log("\nCreating a temporary meeting...");
    const meeting = await prisma_1.prisma.meeting.create({
        data: {
            title: "Temporary Test Meeting " + Date.now(),
            workspaceId: workspace.id,
            createdById: user.id,
            date: new Date(),
            status: "PROCESSING"
        }
    });
    console.log(`Created Meeting: ${meeting.title} (ID: ${meeting.id})`);
    try {
        // 3. Create a transcript chunk
        console.log("Creating a test TranscriptChunk...");
        const chunkContent = "Antigravity is building a powerful search feature using PostgreSQL and pgvector.";
        const chunk = await prisma_1.prisma.transcriptChunk.create({
            data: {
                meetingId: meeting.id,
                content: chunkContent,
                chunkIndex: 0
            }
        });
        console.log(`Created TranscriptChunk ID: ${chunk.id}`);
        // 4. Create a summary
        console.log("Creating a test Summary...");
        const summaryText = "We discussed implementing vector embeddings using models/text-embedding-004.";
        const summary = await prisma_1.prisma.summary.create({
            data: {
                meetingId: meeting.id,
                summary: summaryText,
                keyPoints: ["Prisma raw SQL", "pgvector extension"]
            }
        });
        console.log(`Created Summary ID: ${summary.id}`);
        // 5. Generate and store embeddings
        console.log("Storing embeddings in database...");
        await (0, embeddingService_1.storeEmbedding)(chunk.id, "transcript", chunk.content);
        await (0, embeddingService_1.storeEmbedding)(summary.id, "summary", summary.summary);
        console.log("Embeddings stored successfully!");
        // 6. Test Semantic Search
        console.log("\nTesting semantic search (exact query)...");
        const resultsExact = await (0, searchService_1.semanticSearch)("vector embeddings with text-embedding-004", workspace.id);
        console.log("Search Results (Exact match query):");
        console.dir(resultsExact, { depth: null });
        if (resultsExact.length === 0) {
            throw new Error("No search results returned for exact match!");
        }
        console.log("\nTesting semantic search (concept query)...");
        const resultsConcept = await (0, searchService_1.semanticSearch)("pgvector postgres search", workspace.id);
        console.log("Search Results (Concept query):");
        console.dir(resultsConcept, { depth: null });
        if (resultsConcept.length === 0) {
            throw new Error("No search results returned for concept match!");
        }
        console.log("\n=== Semantic Search Pipeline tests passed successfully! ===");
    }
    finally {
        // Cleanup
        console.log("\nCleaning up temporary test data...");
        await prisma_1.prisma.meeting.delete({
            where: { id: meeting.id }
        });
        console.log("Cleanup complete.");
    }
}
main()
    .catch((err) => {
    console.error("Test execution failed:", err);
})
    .finally(() => prisma_1.prisma.$disconnect());
