import CloudUpload from 'lucide-react/dist/esm/icons/cloud-upload';
import AlertCircleIcon from 'lucide-react/dist/esm/icons/alert-circle';
import CheckCircle2Icon from 'lucide-react/dist/esm/icons/check-circle-2';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import {
  outcomeLabel,
  outcomeTone,
  summaryBlockingCount,
} from '@/lib/yard-invoice-state';
import type {
  YardInvoiceJob,
  YardInvoiceLine,
  YardInvoiceSummary,
} from '@/services/api/yard-invoice';

interface Props {
  job: YardInvoiceJob;
  lines: YardInvoiceLine[];
  linesTotal: number;
  page: number;
  pageSize: number;
  onPage: (page: number) => void;
  reviewConfirmed: boolean;
  onConfirmChange: (checked: boolean) => void;
  onSubmit: () => void;
  submitAllowed: boolean;
  submitting: boolean;
  hasFile: boolean;
}

/**
 * Review of an uploaded workbook, laid out like the other Cash In batches: a
 * result banner, the sheets and totals, a paged invoice list with the D365
 * values, and the same bottom "Post to D365FO" action. Posting stays off until the
 * server allows it and the reviewer has confirmed.
 */
export function YardInvoiceReview({
  job,
  lines,
  linesTotal,
  page,
  pageSize,
  onPage,
  reviewConfirmed,
  onConfirmChange,
  onSubmit,
  submitAllowed,
  submitting,
  hasFile,
}: Props) {
  const summary = job.summary;
  if (!summary) return null;
  const blocking = summaryBlockingCount(summary);
  const alreadySubmitted =
    job.status !== 'PREVIEWED' && job.status !== 'SUBMIT_FAILED';
  const pageCount = Math.max(1, Math.ceil(linesTotal / pageSize));

  return (
    <section className='space-y-5'>
      <ResultBanner summary={summary} blocking={blocking} />

      <div className='space-y-2'>
        <div className='flex flex-wrap items-center gap-3 text-sm'>
          <span className='font-medium'>{summary.fileName}</span>
          <Badge variant='outline'>{summary.formatLabel}</Badge>
          <span className='text-muted-foreground'>
            {summary.recordCount} record(s), {summary.distinctInvoiceCount}{' '}
            invoice(s)
          </span>
        </div>
        <p className='text-xs text-muted-foreground'>
          Review hash {summary.payloadHash.slice(0, 12)} · job{' '}
          {job.jobId.slice(0, 8)}
        </p>
      </div>

      {summary.sheets.length > 0 && (
        <div className='overflow-x-auto rounded-xl border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sheet</TableHead>
                <TableHead>Layout</TableHead>
                <TableHead>Rows with content</TableHead>
                <TableHead>Accepted</TableHead>
                <TableHead>Issues</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {summary.sheets.map((sheet) => (
                <TableRow key={sheet.sourceSheet}>
                  <TableCell className='text-xs'>{sheet.sourceSheet}</TableCell>
                  <TableCell className='font-mono text-xs'>
                    {sheet.layoutId}
                  </TableCell>
                  <TableCell className='text-xs'>{sheet.contentRows}</TableCell>
                  <TableCell className='text-xs'>
                    {sheet.acceptedRecords}
                  </TableCell>
                  <TableCell className='text-xs'>{sheet.issueCount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {summary.currencyTotals.length > 0 && (
        <div className='overflow-x-auto rounded-xl border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Currency</TableHead>
                <TableHead>Invoices</TableHead>
                <TableHead>Raw total (exact)</TableHead>
                <TableHead>Rounded total</TableHead>
                <TableHead>Rounding change</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {summary.currencyTotals.map((total) => (
                <TableRow key={total.currencyCode}>
                  <TableCell className='text-xs'>
                    {total.currencyCode}
                  </TableCell>
                  <TableCell className='text-xs'>
                    {total.invoiceCount}
                  </TableCell>
                  <TableCell className='font-mono text-xs'>
                    {total.rawTotal}
                  </TableCell>
                  <TableCell className='font-mono text-xs'>
                    {total.roundedTotal}
                  </TableCell>
                  <TableCell className='font-mono text-xs'>
                    {total.roundingChange}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <div className='space-y-2'>
        <div className='flex items-center justify-between text-sm'>
          <span className='font-medium'>Invoices</span>
          <span className='text-xs text-muted-foreground'>
            {linesTotal} total · page {page} of {pageCount}
          </span>
        </div>
        <div className='overflow-x-auto rounded-xl border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Source rows</TableHead>
                <TableHead>Amount (raw → rounded)</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Offset account</TableHead>
                <TableHead>Customer (workbook / D365)</TableHead>
                <TableHead>Dimensions and tag (workbook / D365)</TableHead>
                <TableHead>Open balance</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lines.map((line) => (
                <LineRow key={line.invoiceNumber} line={line} />
              ))}
            </TableBody>
          </Table>
        </div>
        <div className='flex items-center justify-end gap-2'>
          <Button
            type='button'
            size='sm'
            variant='outline'
            disabled={page <= 1}
            onClick={() => onPage(page - 1)}
          >
            Previous
          </Button>
          <Button
            type='button'
            size='sm'
            variant='outline'
            disabled={page >= pageCount}
            onClick={() => onPage(page + 1)}
          >
            Next
          </Button>
        </div>
      </div>

      {!alreadySubmitted && (
        <div className='space-y-3 border-t border-border pt-4'>
          <label className='flex items-center gap-2 text-sm'>
            <input
              type='checkbox'
              checked={reviewConfirmed}
              disabled={!summary.canSubmit}
              onChange={(event) => onConfirmChange(event.target.checked)}
            />
            I have reviewed the invoices, amounts, dimensions and tags, and
            approve posting them.
          </label>
          <div className='flex justify-end'>
            <Button
              size='lg'
              variant='success'
              className='w-full sm:max-w-xs'
              onClick={onSubmit}
              disabled={!submitAllowed || submitting}
              title={
                !summary.canSubmit
                  ? (summary.submitBlockedReason ?? 'Fix the errors first')
                  : !hasFile
                    ? 'Upload the same workbook again to submit'
                    : undefined
              }
            >
              <CloudUpload className='size-5' />
              {submitting
                ? 'Posting…'
                : job.status === 'SUBMIT_FAILED'
                  ? 'Retry posting'
                  : 'Post to D365FO'}
            </Button>
          </div>
        </div>
      )}

      <p className='text-xs text-muted-foreground'>
        Each invoice becomes one consolidated receipt. The invoice stays open
        after posting; settlement is not part of this flow.
      </p>
    </section>
  );
}

/** Same banner pattern as the other Cash In batches: a red error or a green success. */
function ResultBanner({
  summary,
  blocking,
}: {
  summary: YardInvoiceSummary;
  blocking: number;
}) {
  const recordIssues = [
    ...summary.issues.map(
      (issue) =>
        `${issue.sourceSheet}, row ${issue.sourceRow}, ${issue.column}: ${issue.message}`,
    ),
    ...summary.aggregationIssues.map(
      (issue) =>
        `${issue.invoiceNumber ? `${issue.invoiceNumber}: ` : ''}${issue.message}`,
    ),
  ];

  if (blocking > 0 || !summary.canSubmit) {
    return (
      <div
        className={cn(
          'relative flex flex-col gap-4 overflow-hidden rounded-xl sm:flex-row sm:items-center',
          'border border-destructive/20 dark:border-destructive/30',
          'bg-destructive/5 dark:bg-destructive/10',
          'px-5 py-4',
        )}
      >
        <div className='absolute inset-y-0 left-0 w-1 rounded-l-xl bg-gradient-to-b from-destructive/50 via-destructive to-destructive/50' />
        <div className='flex flex-1 min-w-0 items-start gap-3'>
          <div className='mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-destructive/10 dark:bg-destructive/20'>
            <AlertCircleIcon className='size-4 text-destructive' />
          </div>
          <div className='space-y-1'>
            <p className='text-sm font-semibold text-foreground'>
              {blocking > 0
                ? `${blocking} error${blocking !== 1 ? 's' : ''} found while processing this upload`
                : 'This upload cannot be posted yet'}
            </p>
            <p className='text-sm text-muted-foreground'>
              {summary.submitBlockedReason ??
                'Fix the blocked invoices or the workbook and upload again.'}
            </p>
            <p className='text-xs text-muted-foreground'>
              <span>
                Workbook vs D365 differences: {summary.discrepancyCount}
              </span>
              {' · '}
              <span>Credit notes (-CN): {summary.creditNoteInvoiceCount}</span>
              {' · '}
              <span>Lookups to retry: {summary.lookupFailedCount}</span>
            </p>
            {recordIssues.length > 0 && (
              <ul className='list-disc pl-5 text-sm text-muted-foreground'>
                {recordIssues.map((issue) => (
                  <li key={issue}>{issue}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'relative flex items-start gap-3 overflow-hidden rounded-xl',
        'border border-emerald-200 dark:border-emerald-800/50',
        'bg-emerald-50 dark:bg-emerald-950/20',
        'px-5 py-4',
      )}
    >
      <div className='absolute inset-y-0 left-0 w-1 rounded-l-xl bg-gradient-to-b from-emerald-400/60 via-emerald-500 to-emerald-400/60' />
      <div className='mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/40'>
        <CheckCircle2Icon className='size-4 text-emerald-600 dark:text-emerald-400' />
      </div>
      <div className='space-y-0.5'>
        <p className='text-sm font-semibold text-emerald-900 dark:text-emerald-100'>
          Entries processed successfully
        </p>
        <p className='text-sm text-emerald-800/80 dark:text-emerald-300/80'>
          All {summary.distinctInvoiceCount} invoices are ready. Click Post to
          D365FO to send them to Dynamics 365 Finance &amp; Operations.
        </p>
      </div>
    </div>
  );
}

function LineRow({ line }: { line: YardInvoiceLine }) {
  const blocked = line.status === 'BLOCKED';
  const workbookCustomer = line.workbook.customerAccounts.join(' | ') || '—';
  const d365Customer = line.d365.customerAccount ?? '—';
  return (
    <TableRow className={blocked ? 'bg-destructive/5' : undefined}>
      <TableCell className='font-mono text-xs'>
        {line.invoiceNumber}
        {line.creditNote && <div className='text-destructive'>credit note</div>}
      </TableCell>
      <TableCell className='text-xs'>
        <div className='break-all'>{line.sourceRefs.join(', ')}</div>
        {line.paymentSerials.length > 0 && (
          <div className='text-muted-foreground'>
            {line.paymentSerials.join(', ')}
          </div>
        )}
      </TableCell>
      <TableCell className='text-xs'>
        <div>
          {line.currencyCode} {line.rawTotal} → {line.roundedTotal}
        </div>
        <div className='text-muted-foreground'>
          change {line.roundingChange}
        </div>
      </TableCell>
      <TableCell className='text-xs'>
        <div>{line.paymentType}</div>
        <div className='text-muted-foreground'>{line.paymentDate}</div>
        {line.paymentReference && (
          <div className='break-all text-muted-foreground'>
            {line.paymentReference}
          </div>
        )}
      </TableCell>
      <TableCell className='text-xs'>
        <div>{line.safeBankAccount}</div>
        <div className='text-muted-foreground'>
          {line.offsetAccount
            ? `${line.offsetAccount.accountType ?? '—'} · ${line.offsetAccount.status}`
            : '—'}
        </div>
      </TableCell>
      <TableCell className='text-xs'>
        <div>workbook: {workbookCustomer}</div>
        <div className='text-muted-foreground'>D365: {d365Customer}</div>
      </TableCell>
      <TableCell className='text-xs'>
        <div className='break-all'>
          workbook: {line.workbook.dimensions.join(' | ') || '—'}
        </div>
        <div className='break-all'>
          D365: {line.d365.defaultDimensionDisplayValue ?? '—'}
        </div>
        <div className='break-all text-muted-foreground'>
          workbook tag: {line.workbook.financialTags.join(' | ') || '—'}
        </div>
        <div className='break-all text-muted-foreground'>
          D365 tag: {line.d365.financialTagDisplayValue ?? '—'}
        </div>
      </TableCell>
      <TableCell className='text-xs'>
        {line.d365.expectedOpenBalance ?? 'not validated'}
      </TableCell>
      <TableCell className='text-xs'>
        <Badge variant={blocked ? 'outline' : 'default'}>
          {outcomeLabel(line.outcome)}
        </Badge>
        <div
          className={
            outcomeTone(line.outcome) === 'error'
              ? 'text-destructive'
              : 'text-muted-foreground'
          }
        >
          {[...line.errors, ...line.warnings].map((message) => (
            <div key={message}>{message}</div>
          ))}
        </div>
      </TableCell>
    </TableRow>
  );
}
