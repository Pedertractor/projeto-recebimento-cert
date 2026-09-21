import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Pencil, Search } from 'lucide-react';

import { CreateSupplierDialog } from '@/components/suppliers/create-supplier-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  listSuppliers,
  suppliersListQueryKey,
} from '@/services/suppliers/supplier.service';
import type { Supplier } from '@/types/supplier';

export function FornecedoresPage() {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Supplier | null>(null);

  const suppliersQuery = useQuery({
    queryKey: suppliersListQueryKey,
    queryFn: () => listSuppliers(),
  });

  const filteredSuppliers = useMemo(() => {
    const query = search.trim().toLowerCase();
    const suppliers = suppliersQuery.data ?? [];

    if (!query) {
      return suppliers;
    }

    const digits = query.replace(/\D/g, '');

    return suppliers.filter((supplier) => {
      const name = supplier.name.toLowerCase();
      const cnpj = supplier.cnpj.toLowerCase();
      const description = (supplier.description ?? '').toLowerCase();

      return (
        name.includes(query) ||
        cnpj.includes(query) ||
        description.includes(query) ||
        (digits.length > 0 && supplier.cnpj.replace(/\D/g, '').includes(digits))
      );
    });
  }, [search, suppliersQuery.data]);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Fornecedores</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Consulte e edite os dados dos fornecedores usados nas NFs.
          </p>
        </div>
        <CreateSupplierDialog />
      </div>

      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar por nome, CNPJ ou descrição"
          className="pl-9"
        />
      </div>

      {suppliersQuery.isLoading ? (
        <div className="flex min-h-[30vh] items-center justify-center">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      ) : null}

      {suppliersQuery.isError ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
          <p className="text-sm text-destructive">
            Não foi possível carregar os fornecedores.
          </p>
          <Button
            type="button"
            variant="outline"
            className="mt-3"
            onClick={() => void suppliersQuery.refetch()}
          >
            Tentar novamente
          </Button>
        </div>
      ) : null}

      {suppliersQuery.isSuccess ? (
        <div className="overflow-hidden rounded-2xl bg-card shadow-sm ring-1 ring-border/60">
          {filteredSuppliers.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">
              Nenhum fornecedor encontrado.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>CNPJ</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead className="w-24 text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSuppliers.map((supplier) => (
                  <TableRow
                    key={supplier.id}
                    className="cursor-pointer"
                    tabIndex={0}
                    onClick={() => setSelected(supplier)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        setSelected(supplier);
                      }
                    }}
                  >
                    <TableCell className="font-medium">{supplier.name}</TableCell>
                    <TableCell className="tabular-nums">{supplier.cnpj}</TableCell>
                    <TableCell className="max-w-xs truncate text-muted-foreground">
                      {supplier.description || '—'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="gap-1.5"
                        onClick={(event) => {
                          event.stopPropagation();
                          setSelected(supplier);
                        }}
                      >
                        <Pencil className="size-3.5" />
                        Editar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      ) : null}

      <CreateSupplierDialog
        supplier={selected}
        open={selected != null}
        onOpenChange={(open) => {
          if (!open) {
            setSelected(null);
          }
        }}
      />
    </div>
  );
}
