import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
    const assignments = await (prisma.assignment as any).findMany({
        include: {
            student: true,
            passage: true
        }
    })

    console.log('--- ALL ASSIGNMENTS ---')
    assignments.forEach((a: any) => {
        console.log(`ID: ${a.id} | Student: ${a.student?.alias} | Module: ${a.moduleName} | PassageTitle: ${a.passage?.title} | PassageID: ${a.passageId}`)
    })

    const passages = await prisma.passage.findMany()
    console.log('\n--- ALL PASSAGES ---')
    passages.forEach((p: any) => {
        console.log(`ID: ${p.id} | Title: ${p.title} | Band: ${p.piraDifficultyBand}`)
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
