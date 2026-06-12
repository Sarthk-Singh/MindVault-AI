"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = require("./config/prisma");
async function main() {
    const users = await prisma_1.prisma.user.findMany();
    console.log("USERS:", JSON.stringify(users, null, 2));
    const workspaces = await prisma_1.prisma.workspace.findMany({
        include: {
            members: true,
            meetings: true
        }
    });
    console.log("WORKSPACES:", JSON.stringify(workspaces, null, 2));
}
main().catch(console.error);
