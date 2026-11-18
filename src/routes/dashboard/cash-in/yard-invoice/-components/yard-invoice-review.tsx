import CloudUpload from 'lucide-react/dist/esm/icons/cloud-upload';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
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
import {
  outcomeLabel,
  outcomeTone,
  summaryBlockingCount,
} from '@/lib/yard-invoice-state';
import type {
  YardInvoiceJob,
  YardInvoiceLine,
} from '@/services/api/yard-invoice';

export type YardUploadMode = 'review' | 'post';

interface Props {
  job: YardInvoiceJob;
  lines: YardInvoiceLine[];
  linesTotal: number;
  page: number;
  pageSize: number;
  onPage: (page: number) => void;
  mode: YardUploadMode;
  onModeChange: (mode: YardUploadMode) => void;
  reviewConfirmed: boolean;
  onConfirmChange: (checked: boolean) => void;
  onSubmit: () => void;
  submitAllowed: boolean;
  submitting: boolean;
  hasFile: boolean;
}

/**
 * Review of an uploaded workbook: which format was detected, the sheets, the
 * totals and rounding, credit notes, discrepancies, record-level issues, and a
 * paged list of invoices with their D365 values. Submit stays off until the server
 * allows it and the reviewer has confirmed.
 */
export function YardInvoiceReview({
  job,
  lines,
  linesTotal,
  page,
  pageSize,
  onPage,
  mode,
  onModeChange,
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
      <div className='space-y-2'>
        <div className='flex flex-wrap items-center gap-3 text-sm'>
          <span className='font-medium'>{summary.fileName}</span>
          <Badge variant='outline'>{summary.formatLabel}</Badge>
          <span className='text-muted-foreground'>
            {summary.recordCount} record(s), {summary.distinctInvoiceCount}{' '}
            invoice(s)
          </span>
        </div>
        <div className='flex flex-wrap gap-2 text-xs'>
          <Chip
            label='Blocked invoices'
            value={summary.blockedInvoiceCount}
            tone={summary.blockedInvoiceCount ? 'error' : 'ok'}
          />
          <Chip
            label='Credit notes (-CN)'
            value={summary.creditNoteInvoiceCount}
            tone={summary.creditNoteInvoiceCount ? 'error' : 'ok'}
          />
          <Chip
            label='Workbook vs D365 differences'
            value={summary.discrepancyCount}
            tone={summary.discrepancyCount ? 'error' : 'ok'}
          />
          <Chip
            label='Record issues'
            value={summary.issueCount}
            tone={summary.issueCount ? 'error' : 'ok'}
          />
          <Chip
            label='Lookups to retry'
            value={summary.lookupFailedCount}
            tone={summary.lookupFailedCount ? 'warn' : 'ok'}
          />
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

      {(summary.issues.length > 0 || summary.aggregationIssues.length > 0) && (
        <Alert variant='destructive'>
          <AlertTitle>Items that block submission</AlertTitle>
          <AlertDescription>
            <ul className='list-disc pl-5'>
              {summary.issues.map((issue, index) => (
                <li key={`rec-${index}`}>
                  {issue.sourceSheet}, row {issue.sourceRow}, {issue.column}:{' '}
                  {issue.message}
                </li>
              ))}
              {summary.aggregationIssues.map((issue, index) => (
                <li key={`agg-${index}`}>
                  {issue.invoiceNumber ? `${issue.invoiceNumber}: ` : ''}
                  {issue.message}
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
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

      {blocking > 0 && (
        <p className='text-sm text-destructive'>
          {blocking} item(s) block submission. Correct the workbook or the D365
          data, then upload again.
        </p>
      )}

      <fieldset className='space-y-2 rounded-xl border p-4'>
        <legend className='px-1 text-sm font-medium'>
          What to do with this upload
        </legend>
        <label className='flex items-center gap-2 text-sm'>
          <input
            type='radio'
            name='yard-upload-mode'
            value='review'
            checked={mode === 'review'}
            disabled={alreadySubmitted}
            onChange={() => onModeChange('review')}
          />
          Review only. Nothing is posted.
        </label>
        <label className='flex items-center gap-2 text-sm'>
          <input
            type='radio'
            name='yard-upload-mode'
            value='post'
            checked={mode === 'post'}
            disabled={alreadySubmitted}
            onChange={() => onModeChange('post')}
          />
          Post to D365 Finance now.
        </label>

        {mode === 'post' && (
          <div className='space-y-3 pt-2'>
            <Alert variant='destructive'>
              <AlertDescription>
                Posting creates journal entries in the D365 company set up for
                this environment. It cannot be undone from this screen.
              </AlertDescription>
            </Alert>
            <div className='flex flex-col gap-3 sm:flex-row sm:items-center'>
              <label className='flex items-center gap-2 text-sm'>
                <input
                  type='checkbox'
                  checked={reviewConfirmed}
                  disabled={!summary.canSubmit || alreadySubmitted}
                  onChange={(event) => onConfirmChange(event.target.checked)}
                />
                I have reviewed the invoices, amounts, rounding, accounts and
                tags, and approve posting them.
              </label>
            </div>
          </div>
        )}
      </fieldset>

      {mode === 'post' && (
        <div className='pt-4 border-t border-border'>
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
                ? 'Submitting…'
                : job.status === 'SUBMIT_FAILED'
                  ? 'Retry queueing'
                  : 'Post to D365 Finance'}
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

function Chip({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: 'ok' | 'warn' | 'error';
}) {
  const cls =
    tone === 'error'
      ? 'border-destructive/50 text-destructive'
      : tone === 'warn'
        ? 'border-amber-500/50 text-amber-700 dark:text-amber-400'
        : 'border-border text-muted-foreground';
  return (
    <span className={`rounded-md border px-2 py-1 ${cls}`}>
      {label}: {value}
    </span>
  );
}
