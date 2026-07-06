import { API_ROUTES } from "@/services/core/api-routes";
import { sync } from "@/services/core/sync";
import axios from "axios";

export interface ReconciliationRequest {
  istFile: File;
  bankFile: File;
  toleranceDays: number;
  amountTolerance: number;
  confidenceThreshold: number;
  audit: boolean;
  allowManyToOne: boolean;
  forceAll: boolean;
}

export interface ReviewRecord {
  istRowNumber: number;
  status: "Needs Review" | "Unmatched";
  matchCase: string;
  confidence: number;
  reason: string;
  description: string;
  transactionDate: string;
  amount: number | null;
  direction: "deposit" | "withdraw" | null;
  accountCode: string;
  clientName: string;
  operationNo: string;
  document: string;
  existingPaymentReference: string;
  suggestedBankRef: string;
  suggestedBankRowNumber: number | null;
  finalPaymentReference: string;
}

export interface BankTransaction {
  index: number;
  excelRowNumber: number;
  bankRef: string;
  description: string;
  clientName: string;
  supplierBeneficiary: string;
  cashFlow: string;
  customerReference: string;
  transactionDate: string | null;
  amount: number | null;
  direction: "deposit" | "withdraw" | null;
  dynCode: string;
  currency: string;
}

export interface ReconciliationResult {
  downloadId: string;
  filename: string;
  report: {
    summary: {
      totalRows: number;
      matched: number;
      preserved: number;
      needsReview: number;
      unmatched: number;
      paymentReferencesFilled: number;
      forcedBankMatches: number;
      remainingBlankPaymentReferences: number;
      reviewRecordsReturned: number;
      reviewRecordsTruncated: boolean;
    };
    reviewRecords: ReviewRecord[];
    unmatchedBankRecords?: BankTransaction[];
  };
}


export async function reconcileFiles(
  request: ReconciliationRequest,
): Promise<ReconciliationResult> {
  const form = new FormData();
  form.append("istFile", request.istFile);
  form.append("bankFile", request.bankFile);
  form.append("toleranceDays", String(request.toleranceDays));
  form.append("amountTolerance", String(request.amountTolerance));
  form.append("confidenceThreshold", String(request.confidenceThreshold));
  form.append("audit", String(request.audit));
  form.append("allowManyToOne", String(request.allowManyToOne));
  form.append("forceAll", String(request.forceAll));

  const response = await sync.save<ReconciliationResult, FormData>(
    API_ROUTES.RECONCILIATION.PROCESS,
    form,
  );
  return response;
}

export async function downloadReconciledWorkbook(
  downloadId: string,
  defaultFileName: string,
): Promise<void> {
  await sync.download(API_ROUTES.RECONCILIATION.DOWNLOAD, {
    params: { id: downloadId },
    downloadMethod: "get",
    defaultFileName,
  });
}

export async function extractApiError(error: unknown): Promise<string> {
  if (!axios.isAxiosError(error)) return "Unexpected error. Please try again.";
  if (error.response?.data instanceof Blob) {
    try {
      const parsed = JSON.parse(await error.response.data.text()) as { message?: string | string[] };
      if (Array.isArray(parsed.message)) return parsed.message.join(", ");
      if (parsed.message) return parsed.message;
    } catch {
      // Fall through to the generic Axios message.
    }
  }
  const data = error.response?.data as { message?: string | string[] } | undefined;
  if (Array.isArray(data?.message)) return data.message.join(", ");
  if (data?.message) return data.message;
  return error.message || "The reconciliation request failed.";
}
