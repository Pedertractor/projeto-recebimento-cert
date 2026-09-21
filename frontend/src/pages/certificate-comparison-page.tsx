import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import { CertificateComparisonForm } from '@/components/conference/certificate-comparison-form';
import { ComparisonDocumentPreview } from '@/components/conference/comparison-document-preview';
import { Button } from '@/components/ui/button';
import { useSidebarAutoCollapse } from '@/hooks/use-sidebar-auto-collapse';
import { useWebSession } from '@/hooks/auth/use-web-session';
import { HttpClientError } from '@/lib/http-client';
import {
  certificateRequestDetailQueryKey,
  completedCertificateRequestsQueryKey,
  getCertificateRequest,
  submitCertificateInspection,
} from '@/services/certificate-requests/certificate-request.service';
import type { CertificateComparisonFormValues } from '@/schemas/certificate-comparison.schema';

export function CertificateComparisonPage() {
  useSidebarAutoCollapse();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { id, attachmentId } = useParams();
  const requestId = Number(id);
  const { data: user } = useWebSession();

  const requestQuery = useQuery({
    queryKey: certificateRequestDetailQueryKey(requestId),
    queryFn: () => getCertificateRequest(requestId),
    enabled: Number.isFinite(requestId) && requestId > 0,
  });

  const attachment = useMemo(
    () =>
      requestQuery.data?.attachments?.find(
        (item) => item.id === attachmentId,
      ) ?? null,
    [attachmentId, requestQuery.data?.attachments],
  );

  const submitMutation = useMutation({
    mutationFn: (values: CertificateComparisonFormValues) => {
      if (!attachmentId) {
        throw new Error('Anexo não informado.');
      }

      return submitCertificateInspection(requestId, attachmentId, values);
    },
    onSuccess: async (inspection) => {
      if (inspection.isValid) {
        toast.success('Conferência salva com aprovação.');
      } else {
        toast.error('Conferência salva com reprovação. Certificado invalidado.');
      }

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: certificateRequestDetailQueryKey(requestId),
        }),
        queryClient.invalidateQueries({
          queryKey: completedCertificateRequestsQueryKey,
        }),
      ]);

      navigate(`/notas-fiscais/${requestId}`);
    },
    onError: (error) => {
      const message =
        error instanceof HttpClientError
          ? error.message
          : 'Não foi possível salvar a conferência.';
      toast.error(message);
    },
  });

  if (requestQuery.isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const qualityDocument = requestQuery.data?.qualityDocument;

  if (
    requestQuery.isError ||
    !requestQuery.data ||
    !qualityDocument ||
    !attachment
  ) {
    return (
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-4">
        <Button asChild variant="ghost" className="w-fit">
          <Link to={`/notas-fiscais/${requestId}`}>
            <ArrowLeft className="size-4" />
            Voltar
          </Link>
        </Button>
        <div className="rounded-2xl bg-destructive/5 px-4 py-4">
          <p className="text-sm text-destructive">
            Não foi possível carregar a conferência.
          </p>
        </div>
      </div>
    );
  }

  const inspection = attachment.inspection ?? null;
  const lotLabel = attachment.lotLabel ?? `Lote ${attachment.lotIndex}`;

  const defaultValues: Partial<CertificateComparisonFormValues> = inspection
    ? {
        receiptDate: inspection.receiptDate,
        materialDescription: inspection.materialDescription,
        rm: inspection.rm,
        certificateNumber: inspection.certificateNumber,
        chemicalComposition: inspection.chemicalComposition,
        quantitySpecified: inspection.quantitySpecified,
        quantityFound: inspection.quantityFound,
        dimensionalSpecified: inspection.dimensionalSpecified,
        dimensionalFound: inspection.dimensionalFound,
        visualInspection: inspection.visualInspection,
        reportStatus: inspection.reportStatus,
        receiverResponsible: inspection.receiverResponsible,
        receiverEmployeeId: inspection.receiverEmployeeId ?? null,
      }
    : {
        receiverResponsible: user?.name ?? '',
        receiverEmployeeId: user?.employeeId ?? null,
      };

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <div className="space-y-3">
        <Button asChild variant="ghost" className="-ml-2 w-fit px-2">
          <Link to={`/notas-fiscais/${requestId}`}>
            <ArrowLeft className="size-4" />
            Voltar para NF
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Comparação — {lotLabel}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            NF {requestQuery.data.invoiceNumber} · {requestQuery.data.supplier.name}
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2 lg:items-stretch">
        <ComparisonDocumentPreview
          title="Documento de qualidade"
          subtitle={qualityDocument.displayName}
          fileName={qualityDocument.fileName}
          storagePath={qualityDocument.storagePath}
        />
        <ComparisonDocumentPreview
          title="Certificado do lote"
          subtitle={lotLabel}
          fileName={attachment.fileName}
          storagePath={attachment.storagePath}
        />
      </div>

      <CertificateComparisonForm
        defaultValues={defaultValues}
        hasSavedInspection={Boolean(inspection)}
        currentUser={
          user
            ? {
                name: user.name,
                employeeId: user.employeeId,
                unit: user.unit,
              }
            : undefined
        }
        isSubmitting={submitMutation.isPending}
        onSubmit={(values) => submitMutation.mutate(values)}
      />
    </div>
  );
}
