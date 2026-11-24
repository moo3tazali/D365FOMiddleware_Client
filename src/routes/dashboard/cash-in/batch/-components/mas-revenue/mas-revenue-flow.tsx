import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useServices } from '@/hooks/use-services';
import type { TDataBatch } from '@/interfaces/data-batch';
import { API_ROUTES } from '@/services/core/api-routes';
import { sync } from '@/services/core/sync';
import {
  MAS_REVENUE_COMPANY_ID,
  MAS_REVENUE_TEMPLATE_LABEL,
  masRevenueApi,
  type MasRevenueLinesPage,
  type MasRevenueReview,
} from '@/services/api/mas-revenue';
import { ROUTES } from '@/router';

import { useBatchQueryData } from '../../-hooks/use-batch-query-data';
import {
  createBatchGate,
  issuesToCsv,
  newIdempotencyKey,
  normalizeCurrencyInput,
  totalsRows,
} from './mas-revenue-view-model';

const LINES_PAGE_SIZE = 50;

/**
 * MAS Revenue Cash In flow, shown in place of the generic uploader when this target
 * is selected. Three separate stages:
 *   1. Upload and review: validates the workbook and shows rows, errors and totals.
 *   2. Create batch: builds the Cash In batch from the reviewed snapshot.
 *   3. Send to D365FO: done on the batch page, with the existing PostToDFO action.
 */
export const MasRevenueFlow = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { dataBatch } = useServices();
  const [, setBatch] = useBatchQueryData();

  const [file, setFile] = useState<File | null>(null);
  const [currency, setCurrency] = useState('');
  const [review, setReview] = useState<MasRevenueReview | null>(null);
  const [idempotencyKey, setIdempotencyKey] = useState<string | null>(null);
  const [lines, setLines] = useState<MasRevenueLinesPage | null>(null);
  const [linesPageNumber, setLinesPageNumber] = useState(1);
  const [busy, setBusy] = useState<
    'validate' | 'submit' | 'template' | 'guide' | 'lines' | null
  >(null);
  const [error, setError] = useState<string | null>(null);

  const currencyCode = normalizeCurrencyInput(currency);
  const gate = createBatchGate(review, currency);

  /** Any change to the file or currency invalidates the review, so a stale preview cannot be submitted. */
  const resetReview = () => {
    setReview(null);
    setIdempotencyKey(null);
    setLines(null);
    setLinesPageNumber(1);
    setError(null);
  };

  const handleFile = (next: File | null) => {
    setFile(next);
    resetReview();
  };

  const handleCurrency = (value: string) => {
    setCurrency(value.toUpperCase());
    resetReview();
  };

  const handleValidate = async () => {
    if (!file || !currencyCode) return;
    setBusy('validate');
    setError(null);
    try {
      const result = await masRevenueApi.preview(file, currencyCode);
      setReview(result);
      setIdempotencyKey(newIdempotencyKey());
      setLinesPageNumber(1);
      setLines(
        await masRevenueApi.getLines(result.reviewId, 1, LINES_PAGE_SIZE),
      );
    } catch (caught) {
      setError(messageOf(caught, 'The workbook could not be reviewed.'));
    } finally {
      setBusy(null);
    }
  };

  const handleLinesPage = async (pageNumber: number) => {
    if (!review) return;
    setBusy('lines');
    try {
      setLines(
        await masRevenueApi.getLines(
          review.reviewId,
          pageNumber,
          LINES_PAGE_SIZE,
        ),
      );
      setLinesPageNumber(pageNumber);
    } catch (caught) {
      setError(messageOf(caught, 'The receipts could not be loaded.'));
    } finally {
      setBusy(null);
    }
  };

  const handleCreateBatch = async () => {
    if (!review || !idempotencyKey || !gate.allowed) return;
    setBusy('submit');
    setError(null);
    try {
      const submitted = await masRevenueApi.submit(review.reviewId, {
        reviewVersion: review.reviewVersion,
        payloadHash: review.payloadHash,
        idempotencyKey,
      });
      if (!submitted.batchId) {
        throw new Error(
          'The batch was not created. Review the messages and try again.',
        );
      }
      const batch = await sync.fetch<TDataBatch>(
        API_ROUTES.DATA_MIGRATION.DATA_BATCH.ONE,
        {
          params: { batchId: submitted.batchId },
        },
      );
      setBatch(batch);
      await queryClient.invalidateQueries({ queryKey: dataBatch.queryKey });
      toast.success(
        'MAS Revenue batch created. Send it to D365FO from the batch page.',
      );
      navigate({
        to: ROUTES.DASHBOARD.CASH_IN.BATCH.VIEW,
        params: { batchId: submitted.batchId },
      });
    } catch (caught) {
      setError(messageOf(caught, 'The batch could not be created.'));
      // Refresh the review so the current blockers are shown, not a stale list.
      try {
        setReview(await masRevenueApi.getReview(review.reviewId));
      } catch {
        // The original error is already shown.
      }
    } finally {
      setBusy(null);
    }
  };

  const handleDownload = async (kind: 'template' | 'guide') => {
    setBusy(kind);
    try {
      const { blob, fileName } =
        kind === 'template'
          ? await masRevenueApi.downloadTemplate()
          : await masRevenueApi.downloadGuide();
      saveBlob(blob, fileName);
    } catch (caught) {
      toast.error(messageOf(caught, 'The download failed.'));
    } finally {
      setBusy(null);
    }
  };

  const handleExportErrors = () => {
    if (!review?.summary) return;
    const text = issuesToCsv(review.summary.issues);
    saveBlob(
      new Blob([text], { type: 'text/csv;charset=utf-8' }),
      `MAS-Revenue-upload-errors-${review.fileName.replace(/\.xlsx$/i, '')}.csv`,
    );
  };

  const summary = review?.summary ?? null;
  const totals = totalsRows(review);
  const pageCount = lines
    ? Math.max(1, Math.ceil(lines.total / LINES_PAGE_SIZE))
    : 1;

  return (
    <section
      aria-labelledby='mas-revenue-heading'
      className='space-y-6 rounded-xl border border-border bg-card p-5'
    >
      <header className='flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'>
        <div className='space-y-2'>
          <div className='flex flex-wrap items-center gap-2'>
            <Badge
              variant='default'
              className='bg-primary text-primary-foreground text-sm font-semibold'
            >
              Company: MAS (mas)
            </Badge>
            <Badge variant='outline'>
              Template {MAS_REVENUE_TEMPLATE_LABEL}
            </Badge>
          </div>
          <h2 id='mas-revenue-heading' className='text-lg font-semibold'>
            MAS Revenue Cash In
          </h2>
          <p className='text-sm text-muted-foreground'>
            Direct cash revenue: each receipt debits its cash account and
            credits the revenue account for its Revenue type, with VAT credited
            once through the tax configuration. Credit-customer invoices are not
            supported. The company is fixed to{' '}
            {MAS_REVENUE_COMPANY_ID.toUpperCase()}.
          </p>
        </div>
        <div className='flex flex-wrap gap-2'>
          <Button
            type='button'
            variant='outline'
            onClick={() => handleDownload('template')}
            disabled={busy !== null}
          >
            Download Upload Template
          </Button>
          <Button
            type='button'
            variant='ghost'
            onClick={() => handleDownload('guide')}
            disabled={busy !== null}
          >
            Column guide
          </Button>
        </div>
      </header>

      {error && (
        <Alert variant='destructive' role='alert'>
          <AlertTitle>Action needed</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className='space-y-4'>
        <h3 className='text-sm font-semibold'>1. Upload and review</h3>
        <div className='grid gap-4 md:grid-cols-2'>
          <label className='space-y-1.5'>
            <span className='text-sm font-medium'>Transaction currency</span>
            <Input
              value={currency}
              onChange={(event) => handleCurrency(event.target.value)}
              placeholder='For example EGP'
              maxLength={3}
              autoComplete='off'
              aria-describedby='mas-currency-help'
              aria-invalid={currency !== '' && currencyCode === null}
              disabled={busy !== null}
            />
            <span
              id='mas-currency-help'
              className='block text-xs text-muted-foreground'
            >
              Required. The workbook has no currency column, so choose the
              currency of every receipt in this file.
            </span>
          </label>
          <label className='space-y-1.5'>
            <span className='text-sm font-medium'>Workbook (.xlsx)</span>
            <input
              type='file'
              accept='.xlsx'
              className='block w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-primary/10 file:px-3 file:py-2 file:text-sm file:font-medium'
              onChange={(event) => handleFile(event.target.files?.[0] ?? null)}
              disabled={busy !== null}
            />
            <span className='block text-xs text-muted-foreground'>
              Sheet "Row Data", up to 10 MB. Use the downloaded template.
            </span>
          </label>
        </div>
        <Button
          type='button'
          onClick={handleValidate}
          disabled={!file || currencyCode === null || busy !== null}
        >
          {busy === 'validate' ? 'Validating…' : 'Validate & Review'}
        </Button>
      </div>

      {review && summary && (
        <div className='space-y-5'>
          <h3 className='text-sm font-semibold'>2. Review</h3>
          <dl className='grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4'>
            <Fact label='File' value={review.fileName} />
            <Fact label='Sheet' value={summary.sourceSheet} />
            <Fact
              label='Rows scanned'
              value={String(summary.scannedDataRows)}
            />
            <Fact
              label='Receipts accepted'
              value={String(summary.accounting.accepted)}
            />
            <Fact
              label='Rows rejected'
              value={String(summary.accounting.rejected)}
            />
            <Fact
              label='Blank rows'
              value={String(summary.nonTransactionRows.blank)}
            />
            <Fact
              label='Zero placeholder rows'
              value={String(summary.nonTransactionRows.zeroPlaceholder)}
            />
            <Fact
              label='Cancelled rows'
              value={String(summary.nonTransactionRows.cancelled)}
            />
          </dl>

          <div className='space-y-2'>
            <h4 className='text-sm font-medium'>Totals per currency</h4>
            <table className='w-full max-w-xl text-sm'>
              <thead>
                <tr className='text-left text-muted-foreground'>
                  <th className='py-1 pr-3 font-medium'>Currency</th>
                  <th className='py-1 pr-3 font-medium'>Value</th>
                  <th className='py-1 pr-3 font-medium'>VAT</th>
                  <th className='py-1 font-medium'>Total</th>
                </tr>
              </thead>
              <tbody>
                {totals.map((row) => (
                  <tr key={row.currency} className='border-t border-border'>
                    <td className='py-1 pr-3'>{row.currency}</td>
                    <td className='py-1 pr-3 tabular-nums'>{row.value}</td>
                    <td className='py-1 pr-3 tabular-nums'>{row.vat}</td>
                    <td className='py-1 tabular-nums'>{row.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {summary.journalGroups.length > 0 && (
              <p className='text-xs text-muted-foreground'>
                Planned journals: {summary.journalGroups.length} (
                {summary.journalGroups
                  .map(
                    (group) =>
                      `${group.journalBatchNumber}: ${group.lineCount} line(s)`,
                  )
                  .join('; ')}
                )
              </p>
            )}
          </div>

          {review.blockers.length > 0 && (
            <Alert variant='destructive'>
              <AlertTitle>
                Submission is blocked by MAS configuration
              </AlertTitle>
              <AlertDescription>
                <ul className='list-disc pl-5'>
                  {review.blockers.map((blocker) => (
                    <li key={blocker}>{blocker}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {summary.issueCount > 0 && (
            <div className='space-y-2'>
              <div className='flex flex-wrap items-center justify-between gap-2'>
                <h4 className='text-sm font-medium'>
                  Row issues ({summary.issueCount})
                  {summary.issueCount > summary.issues.length
                    ? ` — first ${summary.issues.length} shown in full in the error export`
                    : ''}
                </h4>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={handleExportErrors}
                >
                  Export errors (CSV)
                </Button>
              </div>
              <div className='max-h-72 overflow-auto rounded-md border border-border'>
                <table className='w-full text-sm'>
                  <thead className='sticky top-0 bg-muted text-left'>
                    <tr>
                      <th className='px-2 py-1.5 font-medium'>Sheet</th>
                      <th className='px-2 py-1.5 font-medium'>Row</th>
                      <th className='px-2 py-1.5 font-medium'>Column</th>
                      <th className='px-2 py-1.5 font-medium'>Value</th>
                      <th className='px-2 py-1.5 font-medium'>Problem</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.issues.map((issue, index) => (
                      <tr
                        key={`${issue.sourceRow}-${issue.column}-${index}`}
                        className='border-t border-border'
                      >
                        <td className='px-2 py-1.5'>{issue.sourceSheet}</td>
                        <td className='px-2 py-1.5 tabular-nums'>
                          {issue.sourceRow}
                        </td>
                        <td className='px-2 py-1.5'>{issue.column ?? '—'}</td>
                        <td className='px-2 py-1.5 break-all'>
                          {issue.originalValue ?? '—'}
                        </td>
                        <td className='px-2 py-1.5'>{issue.message}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {lines && lines.total > 0 && (
            <div className='space-y-2'>
              <h4 className='text-sm font-medium'>Receipts ({lines.total})</h4>
              <div className='overflow-auto rounded-md border border-border'>
                <table className='w-full text-sm'>
                  <thead className='bg-muted text-left'>
                    <tr>
                      <th className='px-2 py-1.5 font-medium'>Row</th>
                      <th className='px-2 py-1.5 font-medium'>Invoice No</th>
                      <th className='px-2 py-1.5 font-medium'>Date</th>
                      <th className='px-2 py-1.5 font-medium'>Currency</th>
                      <th className='px-2 py-1.5 font-medium'>Total</th>
                      <th className='px-2 py-1.5 font-medium'>Cash account</th>
                      <th className='px-2 py-1.5 font-medium'>Customer</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lines.items.map((line) => (
                      <tr
                        key={line.position}
                        className='border-t border-border'
                      >
                        <td className='px-2 py-1.5 tabular-nums'>
                          {line.sourceRow}
                        </td>
                        <td className='px-2 py-1.5'>{line.invoiceNumber}</td>
                        <td className='px-2 py-1.5'>{line.transactionDate}</td>
                        <td className='px-2 py-1.5'>{line.currency}</td>
                        <td className='px-2 py-1.5 tabular-nums'>
                          {line.totalMajor}
                        </td>
                        <td className='px-2 py-1.5'>
                          {line.cashAccountDisplayName}
                        </td>
                        <td className='px-2 py-1.5'>{line.customerName}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className='flex items-center justify-end gap-2 text-sm'>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  disabled={busy !== null || linesPageNumber <= 1}
                  onClick={() => handleLinesPage(linesPageNumber - 1)}
                >
                  Previous
                </Button>
                <span className='tabular-nums'>
                  Page {linesPageNumber} of {pageCount}
                </span>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  disabled={busy !== null || linesPageNumber >= pageCount}
                  onClick={() => handleLinesPage(linesPageNumber + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}

          <div className='space-y-3 border-t border-border pt-4'>
            <h3 className='text-sm font-semibold'>3. Create batch</h3>
            <p className='text-xs text-muted-foreground'>
              Creating the batch stores it for review. It does not send anything
              to D365FO. Send the batch from its page when you are ready.
            </p>
            {!gate.allowed && gate.reasons.length > 0 && (
              <ul className='list-disc pl-5 text-sm text-muted-foreground'>
                {gate.reasons.map((reason) => (
                  <li key={reason}>{reason}</li>
                ))}
              </ul>
            )}
            <Button
              type='button'
              onClick={handleCreateBatch}
              disabled={!gate.allowed || busy !== null}
            >
              {busy === 'submit' ? 'Creating batch…' : 'Create batch'}
            </Button>
          </div>
        </div>
      )}
    </section>
  );
};

const Fact = ({ label, value }: { label: string; value: string }) => (
  <div className='space-y-0.5'>
    <dt className='text-xs text-muted-foreground'>{label}</dt>
    <dd className='break-all font-medium'>{value}</dd>
  </div>
);

function messageOf(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

function saveBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
