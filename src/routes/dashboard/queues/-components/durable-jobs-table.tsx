import { Link } from '@tanstack/react-router';
import Trash2Icon from 'lucide-react/dist/esm/icons/trash-2';

import type { DurableQueueJob } from '@/interfaces/observability';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ROUTES } from '@/router';

interface DurableJobsTableProps {
  jobsList?: DurableQueueJob[];
  onDeleteJob?: (job: DurableQueueJob) => void;
  isDeleting?: boolean;
}

export function DurableJobsTable({
  jobsList,
  onDeleteJob,
  isDeleting,
}: DurableJobsTableProps) {
  if (!jobsList || jobsList.length === 0) {
    return (
      <Card className='border shadow-xs bg-card'>
        <CardContent className='p-6 text-center text-sm text-muted-foreground'>
          No recent durable job executions found.
        </CardContent>
      </Card>
    );
  }

  const statusColor = (s?: string) => {
    const lower = String(s).toLowerCase();
    if (lower === 'completed' || lower === 'finished') return 'success';
    if (lower === 'failed') return 'destructive';
    if (lower === 'active' || lower === 'processing') return 'info';
    if (lower === 'waiting' || lower === 'queued') return 'warning';
    return 'muted';
  };

  return (
    <Card className='overflow-hidden border shadow-xs bg-card'>
      <div className='border-b p-4'>
        <h2 className='text-sm font-semibold uppercase tracking-wider text-muted-foreground'>
          Recent Job Executions
        </h2>
      </div>
      <div className='overflow-x-auto'>
        <Table>
          <TableHeader>
            <TableRow className='bg-muted/30 hover:bg-muted/30'>
              <TableHead className='w-[150px] text-xs uppercase font-bold tracking-wider'>
                Created
              </TableHead>
              <TableHead className='w-[140px] text-xs uppercase font-bold tracking-wider'>
                Batch ID
              </TableHead>
              <TableHead className='w-[180px] text-xs uppercase font-bold tracking-wider'>
                Queue Name
              </TableHead>
              <TableHead className='w-[100px] text-xs uppercase font-bold tracking-wider'>
                Status
              </TableHead>
              <TableHead className='w-[120px] text-xs uppercase font-bold tracking-wider'>
                Progress
              </TableHead>
              <TableHead className='w-[100px] text-xs uppercase font-bold tracking-wider text-center'>
                Retries
              </TableHead>
              {onDeleteJob && (
                <TableHead className='w-[80px] text-xs uppercase font-bold tracking-wider text-right'>
                  Action
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobsList.map((job) => (
              <TableRow
                key={job.jobId}
                className='hover:bg-muted/10 transition-colors'
              >
                <TableCell className='text-xs font-mono text-muted-foreground'>
                  {new Date(job.createdAt).toLocaleString()}
                </TableCell>
                <TableCell
                  className='font-mono text-[11px] text-muted-foreground truncate max-w-[130px]'
                  title={job.batchId}
                >
                  {job.batchId || '-'}
                </TableCell>
                <TableCell
                  className='font-mono text-[11px] truncate max-w-[170px] text-foreground'
                  title={job.queueName}
                >
                  <Link
                    to={ROUTES.DASHBOARD.QUEUES.VIEW}
                    params={{ queueName: job.queueName }}
                    className='text-primary hover:underline font-semibold'
                  >
                    {job.queueName}
                  </Link>
                </TableCell>
                <TableCell>
                  <Badge
                    color={statusColor(job.status)}
                    size='small'
                    className='uppercase rounded-xs text-[9px] font-semibold px-1.5 py-0'
                  >
                    {job.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {job.totalGroups > 0 ? (
                    <div className='flex items-center gap-1.5 text-xs text-muted-foreground font-medium'>
                      <span>
                        {job.completedGroups}/{job.totalGroups}
                      </span>
                      <span className='text-[10px] text-muted-foreground/60'>
                        (
                        {Math.round(
                          (job.completedGroups / job.totalGroups) * 100,
                        )}
                        %)
                      </span>
                    </div>
                  ) : (
                    <span className='text-xs text-muted-foreground/60 italic'>
                      -
                    </span>
                  )}
                </TableCell>
                <TableCell className='font-mono text-xs text-center font-medium'>
                  {job.retryCount}
                </TableCell>
                {onDeleteJob && (
                  <TableCell className='text-right'>
                    <Button
                      variant='ghost'
                      size='sm'
                      className='h-7 w-7 p-0 text-destructive hover:bg-destructive/10'
                      onClick={() => onDeleteJob(job)}
                      disabled={isDeleting}
                      title='Delete job'
                    >
                      <Trash2Icon className='size-3.5' />
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
