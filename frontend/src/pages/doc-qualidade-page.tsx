import { useMemo, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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
  listQualityDocuments,
  qualityDocumentsListQueryKey,
} from '@/services/quality-documents/quality-document.service';

const CURRENT_YEAR = new Date().getFullYear();

export function DocQualidadePage() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [year, setYear] = useState(String(CURRENT_YEAR));
  const [documentFile, setDocumentFile] = useState<File | null>(null);

  const documentsQuery = useQuery({
    queryKey: qualityDocumentsListQueryKey,
    queryFn: listQualityDocuments,
  });

  const parsedYear = Number(year);
  const isValidYear =
    Number.isInteger(parsedYear) && parsedYear >= 2000 && parsedYear <= 2100;

  const previewName = useMemo(() => {
    if (!isValidYear || !documentsQuery.data) {
      return `DOC QUALIDADE ${year} v1`;
    }

    return getNextVersionPreview(documentsQuery.data, parsedYear);
  }, [documentsQuery.data, isValidYear, parsedYear, year]);

  const createMutation = useMutation({
    mutationFn: () => {
      if (!documentFile) {
        throw new Error('Anexe o documento.');
      }

      if (!isValidYear) {
        throw new Error('Informe um ano válido.');
      }

      return createQualityDocument({
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
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Doc qualidade</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Versões imutáveis por ano, vinculadas às notas fiscais.
        </p>
      </div>

      <section className="space-y-8">
        <div className="space-y-4">
          <div>
            <h2 className="text-sm font-medium">Nova versão</h2>
            <p className="mt-1 text-xs text-muted-foreground">{previewName}</p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="space-y-1.5 sm:w-28">
              <Label htmlFor="qualityDocumentYear">Ano</Label>
              <Input
                id="qualityDocumentYear"
                type="number"
                min={2000}
                max={2100}
                value={year}
                onChange={(event) => setYear(event.target.value)}
              />
            </div>

            <div className="min-w-0 flex-1 space-y-1.5">
              <Label htmlFor="qualityDocumentFile">Documento</Label>
              <div className="flex items-center gap-2">
                <Input
                  readOnly
                  value={documentFile?.name ?? ''}
                  placeholder="Nenhum arquivo selecionado"
                  className="min-w-0 flex-1 bg-muted/20"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Escolher
                </Button>
                <input
                  ref={fileInputRef}
                  id="qualityDocumentFile"
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
              className="bg-brand text-brand-foreground hover:bg-brand/90 sm:shrink-0"
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

        <div className="space-y-4">
          <h2 className="text-sm font-medium text-muted-foreground">
            Versões publicadas
          </h2>

          {documentsQuery.isLoading ? (
            <div className="flex min-h-[12vh] items-center justify-center">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : null}

          {documentsQuery.isError ? (
            <p className="text-sm text-destructive">
              Não foi possível carregar as versões.
            </p>
          ) : null}

          {documentsQuery.isSuccess ? (
            <QualityDocumentTimeline documents={documentsQuery.data} />
          ) : null}
        </div>
      </section>
    </div>
  );
}
