import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    try {
        const result = await (prisma as any).$queryRaw`PRAGMA table_info(Assignment)`;
        console.log("Assignment table columns:", result);
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
