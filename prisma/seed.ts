import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  // Clean existing data
  await prisma.message.deleteMany({})
  await prisma.user.deleteMany({})

  // Create seed users
  const alice = await prisma.user.create({
    data: {
      name: 'Alice Johnson',
      email: 'alice@example.com',
    },
  })

  const bob = await prisma.user.create({
    data: {
      name: 'Bob Smith',
      email: 'bob@example.com',
    },
  })

  // Create seed messages
  await prisma.message.createMany({
    data: [
      {
        content: 'Hello, this is my first message!',
        userId: alice.id,
      },
      {
        content: 'Hi everyone, Bob here!',
        userId: bob.id,
      },
      {
        content: 'The weather is great today!',
        userId: alice.id,
      },
    ],
  })

  console.log('Seed data created successfully')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
