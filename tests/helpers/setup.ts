// Jest setup file
import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';

const prisma = new PrismaClient();

beforeAll(async () => {
  // Push schema to test database
  execSync('npx prisma db push --schema=./tests/schema.test.prisma --skip-generate', {
    stdio: 'inherit',
  });
});

beforeEach(async () => {
  // Clean database between tests
  await prisma.message.deleteMany();
  await prisma.user.deleteMany();
});

afterAll(async () => {
  await prisma.message.deleteMany();
  await prisma.user.deleteMany();
  await prisma.$disconnect();
});

export { prisma };
