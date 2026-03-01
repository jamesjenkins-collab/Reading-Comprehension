import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
    const students = await prisma.student.findMany()
    console.log('--- ALL STUDENTS ---')
    students.forEach((s: any) => {
        console.log(`ID: ${s.id} | Alias: ${s.alias}`)
    })
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
