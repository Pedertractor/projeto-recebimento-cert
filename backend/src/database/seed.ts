import 'dotenv/config';
import argon2 from 'argon2';
import { prisma } from '../config/prisma.js';
import { UserRole, Unit } from '../generated/prisma/enums.js';

const SUPERADMIN_USERS: { name: string; cardNumber: number; unit: Unit }[] = [
  {
    name: 'JOAO GUILHERME HERREIRA GARNICA',
    cardNumber: 8139,
    unit: Unit.PEDERTRACTOR,
  },
  {
    name: 'TOMAS MORAIS NOGUEIRA',
    cardNumber: 8138,
    unit: Unit.PEDERTRACTOR,
  },
  {
    name: 'PEDRO HENRIQUE ALEIXO DO PRADO',
    cardNumber: 5487,
    unit: Unit.PEDERTRACTOR,
  },
  { name: 'NICOLAS SOUSA HERMOSO', cardNumber: 2282, unit: Unit.TRACTOR },
  { name: 'VANDERLEI TORTORA JUNIOR', cardNumber: 2287, unit: Unit.TRACTOR },
];

async function main() {
  for (const spec of SUPERADMIN_USERS) {
    const cardNumber = String(spec.cardNumber);
    const passwordHash = await argon2.hash(cardNumber);

    await prisma.user.upsert({
      where: {
        cardNumber_unit: {
          cardNumber,
          unit: spec.unit,
        },
      },
      update: {
        name: spec.name,
        role: UserRole.SUPERADMIN,
        password: passwordHash,
        firstLogin: true,
        status: true,
        deletedAt: null,
      },
      create: {
        cardNumber,
        unit: spec.unit,
        employeeId: spec.cardNumber,
        name: spec.name,
        role: UserRole.SUPERADMIN,
        password: passwordHash,
        firstLogin: true,
        status: true,
      },
    });

    console.log(`OK superadmin ${spec.unit} cartão ${spec.cardNumber}`);
  }
}

main()
  .then(() => {
    console.log('Seed completed');
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
