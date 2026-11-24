import { sync } from '../core/sync';
import { API_ROUTES } from '../core/api-routes';

/** The only company this flow accepts. The server rejects any other value. */
export const MAS_REVENUE_COMPANY_ID = 'mas';
/** Template contract version. The server accepts only this version today. */
export const MAS_REVENUE_TEMPLATE_VERSION = 1;
export const MAS_REVENUE_TEMPLATE_LABEL = 'v3';

export interface MasRevenueRowIssue {
  sourceSheet: string;
  sourceRow: number;
  column: string | null;
  originalValue: string | null;
  message: string;
}

export interface MasRevenueSummary {
  sourceSheet: string;
  headerRow: number;
  scannedDataRows: number;
  nonTransactionRows: {
    blank: number;
    zeroPlaceholder: number;
    cancelled: number;
  };
  accounting: {
    transactionRowsRead: number;
    accepted: number;
    rejected: number;
  };
  totalsByCurrency: Record<
    string,
    { value: string; vat: string; total: string }
  >;
  journalGroups: Array<{ journalBatchNumber: string; lineCount: number }>;
  issueCount: number;
  issues: MasRevenueRowIssue[];
}

export type MasRevenueReviewStatus =
  | 'PREVIEWED'
  | 'SUBMITTING'
  | 'BATCH_CREATED'
  | 'SUBMIT_FAILED';

/** Review state returned by preview, read and submit. */
export interface MasRevenueReview {
  reviewId: string;
  company: string;
  fileName: string;
  templateVersion: number;
  status: MasRevenueReviewStatus;
  /** Submit is possible only when the upload is valid and configuration is complete. */
  canSubmit: boolean;
  /** The upload itself has no row issues and at least one receipt. */
  uploadValid: boolean;
  reviewVersion: number;
  payloadHash: string;
  receiptCount: number;
  summary: MasRevenueSummary | null;
  /** Configuration gates that currently block submission. */
  blockers: string[];
  batchId: string | null;
  submittedAt: string | null;
  lastError: string | null;
  correlationId: string;
}

export interface MasRevenueLine {
  position: number;
  sourceRow: number;
  invoiceNumber: string;
  transactionDate: string;
  currency: string;
  totalMajor: string;
  cashAccountDisplayName: string;
  customerName: string;
}

export interface MasRevenueLinesPage {
  reviewId: string;
  page: number;
  pageSize: number;
  total: number;
  items: MasRevenueLine[];
}

export interface MasRevenueSubmitBody {
  reviewVersion: number;
  payloadHash: string;
  idempotencyKey: string;
}

/** The batch fields the flow needs after submit. The full batch is loaded by id. */
export interface MasRevenueBatchRef {
  id: string;
}

export class MasRevenueApi {
  /** Downloads the cash receipts template (Receipts and Revenue Types). */
  public downloadTemplate = () =>
    sync.download(
      API_ROUTES.DATA_MIGRATION.CASH.CASH_IN_MAS_RECEIPTS_TEMPLATE,
      {
        downloadMethod: 'get',
        defaultFileName: `MAS-Cash-Receipts-Template-${MAS_REVENUE_TEMPLATE_LABEL}.xlsx`,
      },
    );

  /** Downloads the user guide that describes every column. */
  public downloadGuide = () =>
    sync.download(API_ROUTES.DATA_MIGRATION.CASH.CASH_IN_MAS_RECEIPTS_GUIDE, {
      downloadMethod: 'get',
      defaultFileName: `MAS-Cash-Receipts-Guide-${MAS_REVENUE_TEMPLATE_LABEL}.md`,
    });

  /**
   * Stage 1: review. The workbook is validated and a snapshot is stored. Nothing is
   * created in D365 and no batch is created.
   */
  public preview = (file: File) =>
    sync.save<MasRevenueReview, FormData | Record<string, unknown>>(
      API_ROUTES.DATA_MIGRATION.CASH.CASH_IN_MAS_REVENUE_PREVIEW,
      {
        companyId: MAS_REVENUE_COMPANY_ID,
        templateVersion: MAS_REVENUE_TEMPLATE_VERSION,
        dataFile: file,
      },
      { formData: true },
    );

  public getReview = (reviewId: string) =>
    sync.fetch<MasRevenueReview>(
      API_ROUTES.DATA_MIGRATION.CASH.CASH_IN_MAS_REVENUE_REVIEW,
      {
        params: { reviewId },
      },
    );

  public getLines = (reviewId: string, page: number, pageSize: number) =>
    sync.fetch<MasRevenueLinesPage>(
      API_ROUTES.DATA_MIGRATION.CASH.CASH_IN_MAS_REVENUE_LINES,
      {
        params: { reviewId },
        query: { page, pageSize },
      },
    );

  /**
   * Stage 2: create the Cash In batch from the reviewed snapshot. Sending the batch to
   * D365 is a separate action (PostToDFO on the batch page).
   */
  public submit = (reviewId: string, body: MasRevenueSubmitBody) =>
    sync.save<MasRevenueReview, MasRevenueSubmitBody>(
      API_ROUTES.DATA_MIGRATION.CASH.CASH_IN_MAS_REVENUE_SUBMIT,
      body,
      { params: { reviewId } },
    );
}

export const masRevenueApi = new MasRevenueApi();
