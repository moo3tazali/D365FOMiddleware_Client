import { sync } from '../core/sync';
import { API_ROUTES } from '../core/api-routes';
import { assertUploadCompany } from '@/constants/company';

export type YardInvoiceFormat = 'TEMPLATE_8' | 'YARDS_SOURCE';

export interface YardRecordIssue {
  sourceSheet: string;
  sourceRow: number;
  column: string;
  message: string;
}

export interface YardAggregationIssue {
  invoiceNumber: string;
  sourceRefs: string[];
  message: string;
}

export interface YardSheetSummary {
  sourceSheet: string;
  layoutId: string;
  contentRows: number;
  acceptedRecords: number;
  issueCount: number;
}

export interface YardInvoiceSummary {
  format: YardInvoiceFormat;
  formatLabel: string;
  fileName: string;
  companyId: string;
  sheets: YardSheetSummary[];
  recordCount: number;
  distinctInvoiceCount: number;
  blockedInvoiceCount: number;
  issueCount: number;
  aggregationIssueCount: number;
  creditNoteInvoiceCount: number;
  discrepancyCount: number;
  lookupFailedCount: number;
  currencyTotals: {
    currencyCode: string;
    invoiceCount: number;
    rawTotal: string;
    roundedTotal: string;
    roundingChange: string;
  }[];
  offsetAccountCounts: { status: string; count: number }[];
  issues: YardRecordIssue[];
  aggregationIssues: YardAggregationIssue[];
  canSubmit: boolean;
  submitBlockedReason: string | null;
  payloadHash: string;
  correlationId: string;
}

export type YardInvoiceJobStatus =
  | 'REVIEWING'
  | 'REVIEW_FAILED'
  | 'PREVIEWED'
  | 'SUBMITTING'
  | 'BATCH_CREATED'
  | 'QUEUED'
  | 'SUBMIT_FAILED'
  | 'REVIEW_INTERRUPTED'
  | 'RECONCILE_REQUIRED';

/** Job state returned by upload, review polling, submit and status polling. */
export interface YardInvoiceJob {
  jobId: string;
  company: string;
  fileName: string;
  status: YardInvoiceJobStatus;
  format: YardInvoiceFormat | null;
  payloadHash: string | null;
  canSubmit: boolean;
  summary: YardInvoiceSummary | null;
  batchId: string | null;
  batchStatus: string | null;
  batchErrorCount: number;
  postingJobId: string | null;
  submissionStatus: string | null;
  /** Journal posting only. Yard receipts are unmarked, so invoices are not settled. */
  settlement: 'NOT_SETTLED_UNMARKED';
  lastError: string | null;
  correlationId: string;
}

export interface YardInvoiceLine {
  invoiceNumber: string;
  status: 'VALID' | 'BLOCKED';
  creditNote: boolean;
  sourceRefs: string[];
  paymentSerials: string[];
  currencyCode: string;
  paymentType: string;
  paymentDate: string;
  safeBankAccount: string;
  paymentReference: string;
  rawTotal: string;
  roundedTotal: string;
  roundingChange: string;
  roundingVariance: string;
  workbook: {
    customerAccounts: string[];
    dimensions: string[];
    financialTags: string[];
  };
  d365: {
    customerAccount: string | null;
    defaultDimensionDisplayValue: string | null;
    financialTagDisplayValue: string | null;
    voucher: string | null;
    expectedOpenBalance: string | null;
  };
  offsetAccount: {
    status: string;
    accountType: string | null;
    message: string;
  } | null;
  errors: string[];
  warnings: string[];
  outcome: string;
}

export interface YardInvoiceLinesPage {
  jobId: string;
  page: number;
  pageSize: number;
  total: number;
  items: YardInvoiceLine[];
}

interface UploadBody {
  companyId: string;
  dataFile: File;
}

class YardInvoiceApi {
  /** Starts a background review. Returns the job in REVIEWING; poll getJob until it settles. */
  public startReview(
    file: File,
    companyId: string,
    flow: 'YARD' | 'SHIPLINK' = 'YARD',
  ): Promise<YardInvoiceJob> {
    assertUploadCompany(companyId);
    const route =
      flow === 'SHIPLINK'
        ? API_ROUTES.DATA_MIGRATION.CASH.CASH_IN_SHIPLINK_INVOICE_PREVIEW
        : API_ROUTES.DATA_MIGRATION.CASH.CASH_IN_YARD_INVOICE_PREVIEW;
    return sync.save<YardInvoiceJob, UploadBody>(
      route,
      { companyId, dataFile: file },
      { formData: true },
    );
  }

  /**
   * The same file is sent again: the server re-reviews it and must match the job's payload hash.
   * The company is not sent: submit uses the company saved on the job at review time.
   */
  public submit(jobId: string, file: File): Promise<YardInvoiceJob> {
    return sync.save<YardInvoiceJob, Pick<UploadBody, 'dataFile'>>(
      API_ROUTES.DATA_MIGRATION.CASH.CASH_IN_YARD_INVOICE_JOB_SUBMIT,
      { dataFile: file },
      { formData: true, params: { jobId } },
    );
  }

  public getJob(jobId: string): Promise<YardInvoiceJob> {
    return sync.fetch<YardInvoiceJob>(
      API_ROUTES.DATA_MIGRATION.CASH.CASH_IN_YARD_INVOICE_JOB,
      {
        params: { jobId },
      },
    );
  }

  public getLines(
    jobId: string,
    page: number,
    pageSize: number,
  ): Promise<YardInvoiceLinesPage> {
    return sync.fetch<YardInvoiceLinesPage>(
      API_ROUTES.DATA_MIGRATION.CASH.CASH_IN_YARD_INVOICE_JOB_LINES,
      {
        params: { jobId },
        query: { page, pageSize },
      },
    );
  }
}

export const yardInvoiceApi = new YardInvoiceApi();
