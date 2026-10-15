import type { PrismaClient } from '../generated/prisma/client.js';
import { AppError } from '../lib/errors.js';
import type {
  CreateProductTypeBody,
  PublicProductType,
} from '../schemas/product-type.schemas.js';
import { Prisma } from '../generated/prisma/client.js';

function toPublicProductType(productType: {
  id: number;
  code: string;
  name: string;
  active: boolean;
}): PublicProductType {
  return {
    id: productType.id,
    code: productType.code,
    name: productType.name,
    active: productType.active,
  };
}

export class ProductTypeService {
  constructor(private readonly prisma: PrismaClient) {}

  async listAll() {
    const items = await this.prisma.productType.findMany({
      orderBy: [{ name: 'asc' }],
    });

    return items.map(toPublicProductType);
  }

  async listActive() {
    const items = await this.prisma.productType.findMany({
      where: { active: true },
      orderBy: [{ name: 'asc' }],
    });

    return items.map(toPublicProductType);
  }

  async findActiveById(id: number) {
    const productType = await this.prisma.productType.findFirst({
      where: { id, active: true },
    });

    if (!productType) {
      throw new AppError('Tipo de produto não encontrado.', 404);
    }

    return toPublicProductType(productType);
  }

  async create(fields: CreateProductTypeBody) {
    const name = fields.name.trim();
    const code = fields.code.trim().toUpperCase();

    try {
      const created = await this.prisma.productType.create({
        data: {
          name,
          code,
          active: true,
        },
      });

      return toPublicProductType(created);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new AppError('Já existe um tipo com este código.', 409);
      }

      throw error;
    }
  }

  async findDefaultChapaId(): Promise<number> {
    const chapa = await this.prisma.productType.findUnique({
      where: { code: 'CHAPA' },
      select: { id: true, active: true },
    });

    if (!chapa || !chapa.active) {
      throw new AppError('Tipo de produto padrão (Chapa) não configurado.', 500);
    }

    return chapa.id;
  }
}
