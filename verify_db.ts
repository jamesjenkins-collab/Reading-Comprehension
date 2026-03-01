import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
    const passage = await prisma.passage.findFirst({
        where: { title: 'The Secret of the Dusty Attic' },
        include: { questions: true }
    })
    console.log('--- DATABASE VERIFICATION ---')
    if (passage) {
        console.log(`PASSAGE FOUND: ${passage.title}`)
        console.log(`YEAR GROUP: ${passage.yearGroup}`)
        console.log(`QUESTIONS COUNT: ${passage.questions.length}`)
        console.log('-----------------------------')
    } else {
        console.log('PASSAGE NOT FOUND IN DATABASE')
        console.log('-----------------------------')
    }
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
