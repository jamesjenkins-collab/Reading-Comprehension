const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
    const teacher = await prisma.teacher.upsert({
        where: { email: 'teacher@school.com' },
        update: {},
        create: {
            email: 'teacher@school.com',
            name: 'Mrs. Smith',
            passwordHash: 'hashed_password_mock',
        },
    })

    console.log('Created teacher:', teacher)

    const student1 = await prisma.student.upsert({
        where: { teacherId_alias: { teacherId: teacher.id, alias: 'BlueTiger4' } },
        update: {},
        create: {
            teacherId: teacher.id,
            alias: 'BlueTiger4',
            pin: '1234',
            piraBaselineScore: 105,
            currentDifficultyBand: 'UPPER_KS2'
        }
    })

    const student2 = await prisma.student.upsert({
        where: { teacherId_alias: { teacherId: teacher.id, alias: 'RedFalcon7' } },
        update: {},
        create: {
            teacherId: teacher.id,
            alias: 'RedFalcon7',
            pin: '5678',
            piraBaselineScore: 92,
            currentDifficultyBand: 'MID_KS2'
        }
    })

    console.log('Created mock students', student1, student2)
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
