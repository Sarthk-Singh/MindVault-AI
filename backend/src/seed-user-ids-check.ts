import { prisma } from "./config/prisma";

async function main() {
  const users = await prisma.user.findMany();
  console.log(`Checking ${users.length} users for missing userId...`);
  
  let backfilledCount = 0;
  for (const user of users) {
    if (!user.userId) {
      let uniqueCode = "";
      let isUnique = false;
      
      while (!isUnique) {
        uniqueCode = "MV-" + Math.floor(1000 + Math.random() * 9000).toString();
        const existing = await prisma.user.findUnique({
          where: { userId: uniqueCode }
        });
        if (!existing) {
          isUnique = true;
        }
      }
      
      await prisma.user.update({
        where: { id: user.id },
        data: { userId: uniqueCode }
      });
      
      console.log(`Backfilled user ${user.email} (ID: ${user.id}) with userId: ${uniqueCode}`);
      backfilledCount++;
    }
  }
  
  console.log(`Finished. Backfilled ${backfilledCount} users.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
