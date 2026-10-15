import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import { QualityDocumentProductSection } from '@/components/quality-documents/quality-document-product-section';
import { useWebSession } from '@/hooks/auth/use-web-session';
import { canManageQualityDocuments } from '@/lib/role-access';
import {
  listProductTypes,
  productTypesListQueryKey,
} from '@/services/product-types/product-type.service';
import {
  listQualityDocuments,
  qualityDocumentsListQueryKey,
} from '@/services/quality-documents/quality-document.service';
import type { ProductType } from '@/types/product-type';
import type { QualityDocument } from '@/types/quality-document';

function productTypesFromDocuments(documents: QualityDocument[]): ProductType[] {
  const byId = new Map<number, ProductType>();

  for (const document of documents) {
    if (!byId.has(document.productTypeId)) {
      byId.set(document.productTypeId, {
        id: document.productTypeId,
        code: document.productTypeName.toUpperCase().replace(/\s+/g, '_'),
        name: document.productTypeName,
        active: true,
      });
    }
  }

  return [...byId.values()].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
}

export function DocQualidadePage() {
  const { data: sessionUser } = useWebSession();
  const canPublish = canManageQualityDocuments(sessionUser?.role);

  const productTypesQuery = useQuery({
    queryKey: productTypesListQueryKey,
    queryFn: listProductTypes,
    enabled: canPublish,
  });

  const documentsQuery = useQuery({
    queryKey: qualityDocumentsListQueryKey,
    queryFn: listQualityDocuments,
  });

  const productTypes = useMemo(() => {
    if (canPublish && productTypesQuery.data) {
      return productTypesQuery.data;
    }

    if (documentsQuery.data) {
      return productTypesFromDocuments(documentsQuery.data);
    }

    return [];
  }, [canPublish, documentsQuery.data, productTypesQuery.data]);

  const selectableProductTypes = useMemo(
    () => productTypes.filter((type) => type.active),
    [productTypes],
  );

  const [selectedProductTypeId, setSelectedProductTypeId] = useState<
    number | null
  >(null);

  useEffect(() => {
    if (selectableProductTypes.length === 0) {
      setSelectedProductTypeId(null);
      return;
    }

    const stillValid = selectableProductTypes.some(
      (type) => type.id === selectedProductTypeId,
    );
    if (stillValid) {
      return;
    }

    const defaultType =
      selectableProductTypes.find((type) => type.code === 'CHAPA') ??
      selectableProductTypes[0];
    setSelectedProductTypeId(defaultType.id);
  }, [selectableProductTypes, selectedProductTypeId]);

  const selectedProductType = selectableProductTypes.find(
    (type) => type.id === selectedProductTypeId,
  );

  const isLoading =
    documentsQuery.isLoading || (canPublish && productTypesQuery.isLoading);
  const isError =
    documentsQuery.isError || (canPublish && productTypesQuery.isError);

  return (
    <div className="page-container-narrow relative md:min-h-[calc(100dvh-7.5rem)] md:gap-8">
      <div className="relative z-10 flex flex-col gap-6 md:gap-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h1 className="page-heading">Doc qualidade</h1>
            <p className="page-lead">
              Uma linha de versões por tipo de produto. A conferência da NF usa o
              documento do tipo selecionado no cadastro.
            </p>
          </div>

          <img
            src="/pedertractor_tractorcomponents_azul.svg"
            alt=""
            aria-hidden
            className="hidden w-30 shrink-0 sm:block"
          />
        </div>

        {isLoading ? (
          <div className="flex min-h-[12vh] items-center justify-center">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : null}

        {isError ? (
          <p className="text-sm text-destructive">
            Não foi possível carregar os tipos de produto ou as versões.
          </p>
        ) : null}

        {documentsQuery.isSuccess ? (
          <div className="space-y-5">
            {selectableProductTypes.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhum tipo de produto disponível para exibir documentos.
              </p>
            ) : (
              <>
                <div
                  className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                  role="tablist"
                  aria-label="Tipo de produto"
                >
                  {selectableProductTypes.map((productType) => {
                    const isSelected = productType.id === selectedProductTypeId;

                    return (
                      <Button
                        key={productType.id}
                        type="button"
                        role="tab"
                        aria-selected={isSelected}
                        variant={isSelected ? 'default' : 'outline'}
                        size="sm"
                        className={cn(
                          'shrink-0',
                          isSelected &&
                            'bg-brand text-brand-foreground hover:bg-brand/90',
                        )}
                        onClick={() => setSelectedProductTypeId(productType.id)}
                      >
                        {productType.name}
                      </Button>
                    );
                  })}
                </div>

                <p className="text-xs text-muted-foreground">
                  Versões da IT usadas na conferência de NFs do tipo{' '}
                  <span className="font-medium text-foreground">
                    {selectedProductType?.name ?? '—'}
                  </span>
                  .
                </p>

                {selectedProductType ? (
                  <QualityDocumentProductSection
                    key={selectedProductType.id}
                    productType={selectedProductType}
                    documents={documentsQuery.data ?? []}
                    canPublish={canPublish}
                  />
                ) : null}
              </>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
