import type { PrismaClient, Supplier } from '../generated/prisma/client.js';
import { AppError } from '../lib/errors.js';
import type {
  CreateSupplierBody,
  UpdateSupplierBody,
} from '../schemas/supplier.schemas.js';
import { formatCnpj, normalizeCnpj } from '../utils/cnpj.js';

function toPublicSupplier(supplier: Supplier) {
  return {
    id: supplier.id,
    name: supplier.name,
    cnpj: supplier.cnpj,
    description: supplier.description,
    createdAt: supplier.createdAt.toISOString(),
    updatedAt: supplier.updatedAt.toISOString(),
  };
}

function resolveCnpj(value: string): string {
  const digits = normalizeCnpj(value);
  if (!digits) {
    throw new AppError('Informe o CNPJ.');
  }
  return formatCnpj(digits);
}

export class SupplierService {
  constructor(private readonly prisma: PrismaClient) {}

  async list(search?: string) {
    const query = search?.trim();

    const suppliers = await this.prisma.supplier.findMany({
      where: query
        ? {
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { cnpj: { contains: query, mode: 'insensitive' } },
              ...(normalizeCnpj(query)
                ? [{ cnpj: { contains: normalizeCnpj(query) } }]
                : []),
            ],
          }
        : undefined,
      orderBy: { name: 'asc' },
    });

    return suppliers.map(toPublicSupplier);
  }

  async create(data: CreateSupplierBody) {
    const name = data.name.trim();
    const cnpj = resolveCnpj(data.cnpj);

    const existing = await this.prisma.supplier.findUnique({
      where: { cnpj },
    });

    if (existing) {
      throw new AppError('Já existe um fornecedor com este CNPJ.');
    }

    const supplier = await this.prisma.supplier.create({
      data: {
        name,
        cnpj,
        description: data.description?.trim() || null,
      },
    });

    return toPublicSupplier(supplier);
  }

  async update(id: number, data: UpdateSupplierBody) {
    await this.findById(id);

    const name = data.name.trim();
    const cnpj = resolveCnpj(data.cnpj);

    const existing = await this.prisma.supplier.findFirst({
      where: {
        cnpj,
        id: { not: id },
      },
    });

    if (existing) {
      throw new AppError('Já existe um fornecedor com este CNPJ.');
    }

    const supplier = await this.prisma.supplier.update({
      where: { id },
      data: {
        name,
        cnpj,
        description: data.description?.trim() || null,
      },
    });

    return toPublicSupplier(supplier);
  }

  async findById(id: number) {
    const supplier = await this.prisma.supplier.findUnique({ where: { id } });

    if (!supplier) {
      throw new AppError('Fornecedor não encontrado.', 404);
    }

    return toPublicSupplier(supplier);
  }
}
