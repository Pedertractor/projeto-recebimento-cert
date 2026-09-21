import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FileUp, Loader2, Mail } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { DocumentUploadField } from '@/components/ui/document-upload-field';
import { HttpClientError } from '@/lib/http-client';
import {
  certificateRequestDetailQueryKey,
  certificateRequestsListQueryKey,
  completedCertificateRequestsQueryKey,
  linkCertificatePdf,
  pendingPurchaseCertificateRequestsQueryKey,
  requestDocumentFromPurchase,
} from '@/services/certificate-requests/certificate-request.service';

type InvoiceCertificatePromptProps = {
  requestId: number;
};

export function InvoiceCertificatePrompt({
  requestId,
}: InvoiceCertificatePromptProps) {
  const queryClient = useQueryClient();
  const [certificateFile, setCertificateFile] = useState<File | null>(null);
  const [showUpload, setShowUpload] = useState(false);

  async function invalidate(): Promise<void> {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: certificateRequestDetailQueryKey(requestId),
      }),
      queryClient.invalidateQueries({
        queryKey: completedCertificateRequestsQueryKey,
      }),
      queryClient.invalidateQueries({
        queryKey: certificateRequestsListQueryKey,
      }),
      queryClient.invalidateQueries({
        queryKey: pendingPurchaseCertificateRequestsQueryKey,
      }),
    ]);
  }

  const linkMutation = useMutation({
    mutationFn: () => {
      if (!certificateFile) {
        throw new Error('Selecione o PDF com a NF e os certificados.');
      }
      return linkCertificatePdf(requestId, certificateFile);
    },
    onSuccess: async () => {
      toast.success('PDF vinculado. A NF está pronta para conferência.');
      setCertificateFile(null);
      setShowUpload(false);
      await invalidate();
    },
    onError: (error) => {
      const message =
        error instanceof HttpClientError
          ? error.message
          : error instanceof Error
            ? error.message
            : 'Não foi possível vincular o documento.';
      toast.error(message);
    },
  });

  const requestMutation = useMutation({
    mutationFn: () => requestDocumentFromPurchase(requestId),
    onSuccess: async () => {
      toast.success('Solicitação enviada ao compras.');
      await invalidate();
    },
    onError: (error) => {
      const message =
        error instanceof HttpClientError
          ? error.message
          : 'Não foi possível solicitar o documento ao compras.';
      toast.error(message);
    },
  });

  return (
    <section className="rounded-2xl bg-card p-5 shadow-sm ring-1 ring-border/60 sm:p-6">
      <h3 className="text-base font-semibold">
        Você possui um PDF com a NF e todos os certificados?
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Vincule o arquivo agora ou peça ao compras para solicitar os documentos
        ao fornecedor.
      </p>

      {showUpload ? (
        <div className="mt-5 space-y-4">
          <DocumentUploadField
            id="linkedCertificatePdf"
            label="PDF com NF e certificados"
            accept=".pdf"
            value={certificateFile}
            onChange={setCertificateFile}
            placeholder="Selecione o PDF"
            hint="Um único PDF, até 10 MB"
            buttonLabel="Escolher PDF"
          />
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowUpload(false);
                setCertificateFile(null);
              }}
            >
              Voltar
            </Button>
            <Button
              type="button"
              className="bg-brand text-brand-foreground hover:bg-brand/90"
              disabled={!certificateFile || linkMutation.isPending}
              onClick={() => linkMutation.mutate()}
            >
              {linkMutation.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <FileUp className="size-4" />
              )}
              Vincular documento
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <Button
            type="button"
            className="bg-brand text-brand-foreground hover:bg-brand/90"
            onClick={() => setShowUpload(true)}
          >
            <FileUp className="size-4" />
            Vincular documento
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={requestMutation.isPending}
            onClick={() => requestMutation.mutate()}
          >
            {requestMutation.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Mail className="size-4" />
            )}
            Solicitar documento ao compras
          </Button>
        </div>
      )}
    </section>
  );
}
