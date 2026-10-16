import { useMemo, useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { QualityDocumentTimeline } from '@/components/quality-documents/quality-document-timeline';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { HttpClientError } from '@/lib/http-client';
import {
  createQualityDocument,
  getNextVersionPreview,
  qualityDocumentsListQueryKey,
} from '@/services/quality-documents/quality-document.service';
import type { ProductType } from '@/types/product-type';
import type { QualityDocument } from '@/types/quality-document';

type QualityDocumentProductSectionProps = {
  productType: ProductType;
  documents: QualityDocument[];
  canPublish: boolean;
};

const CURRENT_YEAR = new Date().getFullYear();

export function QualityDocumentProductSection({
  productType,
  documents,
  canPublish,
}: QualityDocumentProductSectionProps) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [year, setYear] = useState(String(CURRENT_YEAR));
  const [documentFile, setDocumentFile] = useState<File | null>(null);

  const typeDocuments = useMemo(
    () => documents.filter((doc) => doc.productTypeId === productType.id),
    [documents, productType.id],
  );

  const parsedYear = Number(year);
  const isValidYear =
    Number.isInteger(parsedYear) && parsedYear >= 2000 && parsedYear <= 2100;

  const previewName = useMemo(() => {
    if (!isValidYear) {
      return `DOC QUALIDADE ${productType.name} ${year} v1`;
    }

    return getNextVersionPreview(typeDocuments, productType.id, parsedYear);
  }, [isValidYear, parsedYear, productType.id, productType.name, typeDocuments, year]);

  const createMutation = useMutation({
    mutationFn: () => {
      if (!documentFile) {
        throw new Error('Anexe o documento.');
      }

      if (!isValidYear) {
        throw new Error('Informe um ano válido.');
      }

      return createQualityDocument({
        productTypeId: productType.id,
        year: parsedYear,
        documentFile,
      });
    },
    onSuccess: async (document) => {
      toast.success(`${document.displayName} publicado.`);
      setDocumentFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      await queryClient.invalidateQueries({
        queryKey: qualityDocumentsListQueryKey,
      });
    },
    onError: (error) => {
      const message =
        error instanceof HttpClientError
          ? error.message
          : error instanceof Error
            ? error.message
            : 'Não foi possível publicar o documento.';
      toast.error(message);
    },
  });

  return (
    <section className="space-y-6 ">
      {canPublish ? (
        <div className="space-y-4 border-b border-border/60 pb-6">
          <div>
            <h3 className="text-sm font-medium">Nova versão</h3>
            <p className="mt-1 text-xs text-muted-foreground">{previewName}</p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="w-full space-y-1.5 sm:w-28">
              <Label htmlFor={`quality-year-${productType.id}`}>Ano</Label>
              <Input
                id={`quality-year-${productType.id}`}
                type="number"
                min={2000}
                max={2100}
                value={year}
                onChange={(event) => setYear(event.target.value)}
              />
            </div>

            <div className="min-w-0 flex-1 space-y-1.5">
              <Label htmlFor={`quality-file-${productType.id}`}>Documento</Label>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <Input
                  readOnly
                  value={documentFile?.name ?? ''}
                  placeholder="Nenhum arquivo selecionado"
                  className="min-w-0 flex-1 bg-muted/20"
                />
                <Button
                  type="button"
                  variant="outline"
                  className="w-full sm:w-auto"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Escolher
                </Button>
                <input
                  ref={fileInputRef}
                  id={`quality-file-${productType.id}`}
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.webp"
                  className="hidden"
                  onChange={(event) => {
                    setDocumentFile(event.target.files?.[0] ?? null);
                  }}
                />
              </div>
            </div>

            <Button
              className="w-full bg-brand text-brand-foreground hover:bg-brand/90 sm:w-auto sm:shrink-0"
              disabled={
                !documentFile || !isValidYear || createMutation.isPending
              }
              onClick={() => createMutation.mutate()}
            >
              {createMutation.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : null}
              Publicar
            </Button>
          </div>
        </div>
      ) : null}

      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground">
          Versões publicadas
        </h3>
        <QualityDocumentTimeline documents={typeDocuments} />
      </div>
    </section>
  );
}
