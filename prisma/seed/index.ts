import { PrismaClient } from '@prisma/client';
import classicTemplate from './classic-resume-template.json';

const prisma = new PrismaClient();

async function main() {
  await prisma.resumeTemplate.upsert({
    where: { id: 'cma2kftwy00020cl10tvt7r9h' },
    update: {},
    create: {
      id: 'cma2kftwy00020cl10tvt7r9h',
      name: 'Classic',
      content: classicTemplate,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });
}

main()
  .catch(e => {
    console.error(e);
    // process.exit(1);
  })
  .finally(async () => {
    // Close Prisma Client at the end
    await prisma.$disconnect();
  });
