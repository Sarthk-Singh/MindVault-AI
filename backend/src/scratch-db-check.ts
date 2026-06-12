import { prisma } from "./config/prisma";

async function main() {
  const users = await prisma.user.findMany();
  console.log("USERS:", JSON.stringify(users, null, 2));

  const workspaces = await prisma.workspace.findMany({
    include: {
      members: true,
      meetings: true
    }
  });
  console.log("WORKSPACES:", JSON.stringify(workspaces, null, 2));
}

main().catch(console.error);
