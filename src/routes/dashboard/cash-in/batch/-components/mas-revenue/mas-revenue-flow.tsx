import UploadCloud from 'lucide-react/dist/esm/icons/upload-cloud';
import SlidersHorizontal from 'lucide-react/dist/esm/icons/sliders-horizontal';
import CloudAlert from 'lucide-react/dist/esm/icons/cloud-alert';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Description } from '@/components/ui/description';
import { CompanyBadge } from '@/components/company-badge';
import { CloudCheck } from '@/assets/icons/cloud-check';
import { MAS_REVENUE_COMPANY_ID } from '@/services/api/mas-revenue';

import { StatCard } from '../batch-result';
import {
  MAS_LINES_PAGE_SIZE,
  type MasRevenueReviewState,
} from './use-mas-revenue-review';
import { totalsRows } from './mas-revenue-view-model';

/**
 * MAS Revenue review in the standard "Batch Results" layout. The file comes from the
 * standard upload form and "Create batch" is in the standard footer. The four cards
 * show the same counts the batch page shows, mapped from the review.
 */
export const MasRevenueReview = ({ mas }: { mas: MasRevenueReviewState }) => {
  const { review, lines, linesPageNumber, busy, error, gate } = mas;
  const summary = review?.summary ?? null;
  const pageCount = lines
    ? Math.max(1, Math.ceil(lines.total / MAS_LINES_PAGE_SIZE))
    : 1;
  const totals = totalsRows(review);

  const stats = [
    {
      label: 'Total Uploaded',
      total: formatCount(summary?.scannedDataRows),
      color: 'sky' as const,
      icon: <UploadCloud className='size-5 text-sky-500 dark:text-sky-400' />,
    },
    {
      label: 'Total Formatted',
      total: formatCount(summary?.accounting.accepted),
      color: 'indigo' as const,
      icon: (
        <SlidersHorizontal className='size-5 text-indigo-500 dark:text-indigo-400' />
      ),
    },
    {
      label: 'Success Count',
      total: formatCount(
        review ? (review.canSubmit ? review.receiptCount : 0) : undefined,
      ),
      color: 'emerald' as const,
      icon: (
        <CloudCheck className='size-5 text-emerald-500 dark:text-emerald-400' />
      ),
    },
    {
      label: 'Error Count',
      total: formatCount(summary?.accounting.rejected),
      color: 'red' as const,
      icon: <CloudAlert className='size-5 text-red-500 dark:text-red-400' />,
    },
  ];

  return (
    <div className='flex-1 space-y-5'>
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <div>
          <h3>Batch Results</h3>
          <Description>
            {review
              ? `MAS Revenue Cash In review: ${review.fileName}`
              : 'MAS Revenue Cash In. Upload a workbook to review it.'}
          </Description>
          <CompanyBadge company={MAS_REVENUE_COMPANY_ID} className='mt-2' />
        </div>
        <Button
          type='button'
          variant='outline'
          size='sm'
          onClick={() => mas.download('template')}
          disabled={busy !== null}
        >
          Download Upload Template
        </Button>
      </div>

      <div className='grid grid-cols-2 sm:grid-cols-4 gap-3'>
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      {error && (
        <Alert variant='destructive' role='alert'>
          <AlertTitle>Action needed</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {review && summary && (
        <div className='space-y-5'>
          <div className='space-y-1 text-sm'>
            {totals.map((row) => (
              <p key={row.currency}>
                <span className='font-medium'>{row.currency}</span>: value{' '}
                {row.value}, VAT {row.vat}, total {row.total}
              </p>
            ))}
            {summary.journalGroups.length > 0 && (
              <p className='text-xs text-muted-foreground'>
                Planned journals:{' '}
                {summary.journalGroups
                  .map(
                    (group) =>
                      `${group.journalBatchNumber} (${group.lineCount} GL lines)`,
                  )
                  .join('; ')}
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
            <div className='space-y-2'>
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
    </div>
  );
};

/** Count for a card: "--" until a review exists, the standard placeholder. */
function formatCount(value: number | undefined): string {
  return value === undefined ? '--' : value.toLocaleString('en-US');
}
