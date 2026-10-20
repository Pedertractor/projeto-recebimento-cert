import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import { CertificateComparisonForm } from '@/components/conference/certificate-comparison-form';
import { ComparisonDocumentPreview } from '@/components/conference/comparison-document-preview';
import { ConferencePrintEditMenu } from '@/components/conference/conference-print-edit-menu';
import { Button } from '@/components/ui/button';
import { useSidebarAutoCollapse } from '@/hooks/use-sidebar-auto-collapse';
import { useWebSession } from '@/hooks/auth/use-web-session';
import { getPurchaseCertificateAttachment } from '@/lib/certificate-request-attachments';
import { canEditNfMaterials } from '@/lib/role-access';
import { getInspectedCertificatesCount } from '@/lib/certificate-request-labels';
import { HttpClientError } from '@/lib/http-client';
import {
  certificateRequestDetailQueryKey,
  completedCertificateRequestsQueryKey,
  getCertificateRequest,
  submitCertificateInspection,
} from '@/services/certificate-requests/certificate-request.service';
import type { CertificateComparisonFormValues } from '@/schemas/certificate-comparison.schema';
import { getComparisonReturnTo } from '@/lib/comparison-navigation';
import { usesChapaDimensionalMask } from '@/lib/inspection-dimensions';
import { normalizeStoredDimensionalValue } from '@/utils/dimensional-input';

export function CertificateComparisonPage() {
  useSidebarAutoCollapse();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { id, attachmentId } = useParams();
  const requestId = Number(id);
  const returnTo = getComparisonReturnTo(location.state);
  const backHref = returnTo ?? `/notas-fiscais/${requestId}`;
  const backLabel = returnTo?.includes('/qualidade/busca-dimensionais')
    ? 'Voltar para busca'
    : 'Voltar para NF';
  const { data: user } = useWebSession();
  const readOnly = !canEditNfMaterials(user?.role);

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
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: certificateRequestDetailQueryKey(requestId),
        }),
        queryClient.invalidateQueries({
          queryKey: completedCertificateRequestsQueryKey,
        }),
      ]);

      const updatedRequest = await queryClient.fetchQuery({
        queryKey: certificateRequestDetailQueryKey(requestId),
        queryFn: () => getCertificateRequest(requestId),
      });

      const comparedLots = getInspectedCertificatesCount(updatedRequest);
      const allLotsCompared =
        updatedRequest.expectedCertificates > 0 &&
        comparedLots >= updatedRequest.expectedCertificates;

      if (allLotsCompared) {
        navigate(`/notas-fiscais/${requestId}`, {
          state: { conferenceCompleteCelebration: true },
        });
        return;
      }

      if (inspection.isValid) {
        toast.success('Conferência salva com aprovação.');
      } else {
        toast.error('Conferência salva com reprovação. Certificado invalidado.');
      }

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
          <Link to={backHref}>
            <ArrowLeft className="size-4" />
            {backLabel}
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
  const lotIndex = attachment.lotIndex ?? 1;
  const purchaseCertificate = getPurchaseCertificateAttachment(
    requestQuery.data.attachments,
  );

  const productTypeCode = requestQuery.data.productType.code;
  const useChapaDimensions = usesChapaDimensionalMask(productTypeCode);

  const defaultValues: Partial<CertificateComparisonFormValues> = inspection
    ? {
        receiptDate: inspection.receiptDate,
        materialDescription: inspection.materialDescription,
        rm: inspection.rm,
        certificateNumber: inspection.certificateNumber,
        chemicalComposition: inspection.chemicalComposition,
        quantitySpecified: inspection.quantitySpecified,
        quantityFound: inspection.quantityFound,
        dimensionalSpecifiedThickness: useChapaDimensions
          ? normalizeStoredDimensionalValue(
              inspection.dimensionalSpecifiedThickness,
              2,
            )
          : inspection.dimensionalSpecifiedThickness,
        dimensionalSpecifiedWidth: useChapaDimensions
          ? normalizeStoredDimensionalValue(
              inspection.dimensionalSpecifiedWidth,
              3,
            )
          : inspection.dimensionalSpecifiedWidth,
        dimensionalSpecifiedLength: useChapaDimensions
          ? normalizeStoredDimensionalValue(
              inspection.dimensionalSpecifiedLength,
              3,
            )
          : inspection.dimensionalSpecifiedLength,
        dimensionalFoundThickness: useChapaDimensions
          ? normalizeStoredDimensionalValue(
              inspection.dimensionalFoundThickness,
              2,
            )
          : inspection.dimensionalFoundThickness,
        dimensionalFoundWidth: useChapaDimensions
          ? normalizeStoredDimensionalValue(
              inspection.dimensionalFoundWidth,
              3,
            )
          : inspection.dimensionalFoundWidth,
        dimensionalFoundLength: useChapaDimensions
          ? normalizeStoredDimensionalValue(
              inspection.dimensionalFoundLength,
              3,
            )
          : inspection.dimensionalFoundLength,
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
    <div className="page-container-wide">
      <div className="min-w-0 space-y-3">
        <Button asChild variant="ghost" className="-ml-2 w-fit px-2">
          <Link to={backHref}>
            <ArrowLeft className="size-4" />
            {backLabel}
          </Link>
        </Button>
        <div>
          <h1 className="page-heading">Comparação — {lotLabel}</h1>
          <p className="page-lead">
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
          headerActions={
            inspection && !readOnly ? (
              <ConferencePrintEditMenu
                requestId={requestId}
                lotIndex={lotIndex}
                purchaseCertificate={purchaseCertificate}
              />
            ) : undefined
          }
        />
      </div>

      <CertificateComparisonForm
        productTypeCode={productTypeCode}
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
        readOnly={readOnly}
        onSubmit={(values) => {
          if (readOnly) {
            return;
          }
          submitMutation.mutate(values);
        }}
      />
    </div>
  );
}
