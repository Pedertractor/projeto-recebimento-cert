import { prisma } from '../src/config/prisma.js';

const users = await prisma.user.findMany({
  where: { deletedAt: null },
  select: {
    id: true,
    name: true,
    cardNumber: true,
    unit: true,
    role: true,
    firstLogin: true,
  },
});

console.log(JSON.stringify(users, null, 2));
await prisma.$disconnect();
