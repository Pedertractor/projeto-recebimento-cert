import { writeFileSync } from 'node:fs';
import argon2 from 'argon2';
import { prisma } from '../src/config/prisma.js';

const userId = 3;
const tempPassword = 'TempQualidade1';

const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });

writeFileSync(
  'scripts/tmp-quality-role-restore.json',
  JSON.stringify({
    id: user.id,
    role: user.role,
    firstLogin: user.firstLogin,
    password: user.password,
  }),
);

await prisma.user.update({
  where: { id: userId },
  data: {
    role: 'QUALITY_VIEWER',
    firstLogin: false,
    password: await argon2.hash(tempPassword),
  },
});

console.log('temporary quality viewer ready');
await prisma.$disconnect();
