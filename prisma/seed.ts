const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
    // Upsert admin teacher — bcrypt hash of '3t2ranelag_H' (cost factor 12)
    const admin = await prisma.teacher.upsert({
        where: { email: 'jimmyjenkins100@gmail.com' },
        update: {},
        create: {
            email: 'jimmyjenkins100@gmail.com',
            name: 'Admin',
            passwordHash: '$2b$12$37XaY3PcEz0K89JGNBMvhe3AIjV6/AtuhAB9OZImooNPFo26WmPRu',
        },
    })

    console.log('Created admin teacher:', admin.email)
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
