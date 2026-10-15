import { useQuery } from '@tanstack/react-query';
import { Loader2, Package } from 'lucide-react';

import { CreateProductTypeDialog } from '@/components/product-types/create-product-type-dialog';
import {
  MobileListCard,
  MobileListCardRow,
} from '@/components/ui/mobile-list-card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  listProductTypes,
  productTypesListQueryKey,
} from '@/services/product-types/product-type.service';

export function ProductTypesPage() {
  const productTypesQuery = useQuery({
    queryKey: productTypesListQueryKey,
    queryFn: listProductTypes,
  });

  const productTypes = productTypesQuery.data ?? [];

  return (
    <div className="page-container">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-1">
          <h1 className="page-heading">Tipos de produto</h1>
          <p className="page-lead max-w-2xl">
            Cada tipo possui seu próprio documento de qualidade e é escolhido no
            cadastro da NF para a conferência dos certificados.
          </p>
        </div>
        <CreateProductTypeDialog />
      </div>

      {productTypesQuery.isLoading ? (
        <div className="flex min-h-[30vh] items-center justify-center">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      ) : null}

      {productTypesQuery.isError ? (
        <p className="text-sm text-destructive">
          Não foi possível carregar os tipos de produto.
        </p>
      ) : null}

      {productTypesQuery.isSuccess && productTypes.length === 0 ? (
        <div className="rounded-2xl border border-dashed bg-muted/20 px-6 py-10 text-center">
          <Package className="mx-auto size-8 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">
            Nenhum tipo cadastrado. Use &quot;Novo tipo&quot; para adicionar o
            primeiro.
          </p>
        </div>
      ) : null}

      {productTypes.length > 0 ? (
        <>
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Código</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {productTypes.map((type) => (
                  <TableRow key={type.id}>
                    <TableCell className="font-medium">{type.name}</TableCell>
                    <TableCell className="font-mono text-sm text-muted-foreground">
                      {type.code}
                    </TableCell>
                    <TableCell>
                      {type.active ? 'Ativo' : 'Inativo'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="space-y-3 md:hidden">
            {productTypes.map((type) => (
              <MobileListCard key={type.id}>
                <MobileListCardRow label="Nome" value={type.name} />
                <MobileListCardRow label="Código" value={type.code} />
                <MobileListCardRow
                  label="Status"
                  value={type.active ? 'Ativo' : 'Inativo'}
                />
              </MobileListCard>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
