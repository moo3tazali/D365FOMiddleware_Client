import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  MAS_REVENUE_COMPANY_ID,
  MAS_REVENUE_TEMPLATE_LABEL,
} from '@/services/api/mas-revenue';

import {
  MAS_LINES_PAGE_SIZE,
  type MasRevenueReviewState,
} from './use-mas-revenue-review';
import { totalsRows } from './mas-revenue-view-model';

/**
 * MAS Revenue review, shown in the results area of the standard Cash In page. The
 * file comes from the standard upload form and "Create batch" is in the standard
 * footer. This component only shows the review and its blockers.
 */
export const MasRevenueReview = ({ mas }: { mas: MasRevenueReviewState }) => {
  const { review, lines, linesPageNumber, busy, error, gate } = mas;
  const summary = review?.summary ?? null;
  const totals = totalsRows(review);
  const pageCount = lines
    ? Math.max(1, Math.ceil(lines.total / MAS_LINES_PAGE_SIZE))
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
              Company: MAS ({MAS_REVENUE_COMPANY_ID})
            </Badge>
            <Badge variant='outline'>
              Template {MAS_REVENUE_TEMPLATE_LABEL}
            </Badge>
          </div>
          <h2 id='mas-revenue-heading' className='text-lg font-semibold'>
            MAS Revenue Cash In review
          </h2>
          <p className='text-sm text-muted-foreground'>
            Each receipt takes the currency of its D365 cash account.
            Credit-customer invoices are not supported.
          </p>
        </div>
        <div className='flex flex-wrap gap-2'>
          <Button
            type='button'
            variant='outline'
            onClick={() => mas.download('template')}
            disabled={busy !== null}
          >
            Download Upload Template
          </Button>
          <Button
            type='button'
            variant='ghost'
            onClick={() => mas.download('guide')}
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

      {review && summary && (
        <div className='space-y-5'>
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
                  onClick={mas.exportErrors}
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
                        <td className='px-2 py-1.5'>
                          {line.currency || 'unresolved'}
                        </td>
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
                  onClick={() => mas.loadLinesPage(linesPageNumber - 1)}
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
                  onClick={() => mas.loadLinesPage(linesPageNumber + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}

          {!gate.allowed && gate.reasons.length > 0 && (
            <div className='space-y-2 border-t border-border pt-4'>
              <h4 className='text-sm font-medium'>
                Create batch is not available yet
              </h4>
              <ul className='list-disc pl-5 text-sm text-muted-foreground'>
                {gate.reasons.map((reason) => (
                  <li key={reason}>{reason}</li>
                ))}
              </ul>
            </div>
          )}
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
