import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useState } from 'react';
import CopyIcon from 'lucide-react/dist/esm/icons/copy';
import CheckIcon from 'lucide-react/dist/esm/icons/check';
import RefreshCwIcon from 'lucide-react/dist/esm/icons/refresh-cw';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { useServices } from '@/hooks/use-services';

interface JobDetailsDrawerProps {
  queueName: string;
  jobId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function JobDetailsDrawer({
  queueName,
  jobId,
  open,
  onOpenChange,
}: JobDetailsDrawerProps) {
  const { observability } = useServices();
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Fetch job details only when jobId is set and drawer is open
  const {
    data: jobInfo,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['admin.observability.jobDetail', queueName, jobId],
    queryFn: () => observability.getJobDetail(queueName, jobId!),
    enabled: !!jobId && open,
  });

  const handleCopy = (text?: string, fieldName?: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName || 'text');
    toast.success(`${fieldName || 'Value'} copied to clipboard`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const statusColor = (status?: string) => {
    const s = String(status).toLowerCase();
    if (s === 'completed' || s === 'finished') return 'success';
    if (s === 'failed') return 'destructive';
    if (s === 'active' || s === 'processing') return 'info';
    if (s === 'waiting' || s === 'queued') return 'warning';
    return 'muted';
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className='sm:max-w-2xl overflow-y-auto flex flex-col h-full bg-background border-l'>
        <SheetHeader className='pb-4 border-b'>
          <div className='flex items-center justify-between gap-2.5'>
            <div className='flex items-center gap-2'>
              {jobInfo?.durableJob?.status && (
                <Badge
                  color={statusColor(jobInfo.durableJob.status)}
                  size='small'
                  className='uppercase rounded px-2 py-0.5 text-[10px] font-bold'
                >
                  {jobInfo.durableJob.status}
                </Badge>
              )}
              {jobInfo?.redisState &&
                jobInfo.redisState !== jobInfo.durableJob?.status && (
                  <Badge
                    color='muted'
                    size='small'
                    className='uppercase rounded px-2 py-0.5 text-[10px]'
                  >
                    Redis: {jobInfo.redisState}
                  </Badge>
                )}
            </div>
            <Button
              variant='ghost'
              size='sm'
              className='h-8 w-8 p-0'
              onClick={() => void refetch()}
              disabled={isLoading}
              title='Refresh Job Details'
            >
              <RefreshCwIcon
                className={`size-4 ${isLoading ? 'animate-spin' : ''}`}
              />
            </Button>
          </div>
          <SheetTitle className='text-base font-semibold tracking-tight mt-2 text-foreground font-mono truncate'>
            Job: {jobId}
          </SheetTitle>
          <SheetDescription className='text-xs text-muted-foreground'>
            Queue: <span className='font-mono font-semibold'>{queueName}</span>
          </SheetDescription>
        </SheetHeader>

        {isLoading ? (
          <div className='flex-1 flex flex-col items-center justify-center h-full text-sm text-muted-foreground gap-2 py-10'>
            <RefreshCwIcon className='size-5 animate-spin text-primary' />
            Loading job details...
          </div>
        ) : isError || !jobInfo ? (
          <div className='flex-1 flex flex-col items-center justify-center h-full text-sm text-muted-foreground py-10'>
            Failed to load job details. The job may have completed and been
            removed from Redis.
          </div>
        ) : (
          <div className='flex-1 py-4 space-y-5 text-sm'>
            {/* Context Metrics Group */}
            <div className='grid gap-3 sm:grid-cols-2'>
              {infoCard(
                'Batch ID',
                jobInfo.durableJob?.batchId,
                () => handleCopy(jobInfo.durableJob?.batchId, 'Batch ID'),
                copiedField === 'Batch ID',
              )}
              {infoCard(
                'Correlation ID',
                jobInfo.durableJob?.correlationId,
                () =>
                  handleCopy(
                    jobInfo.durableJob?.correlationId,
                    'Correlation ID',
                  ),
                copiedField === 'Correlation ID',
              )}
              {infoCard('Source Module', jobInfo.durableJob?.sourceModule)}
              {infoCard('Company', jobInfo.durableJob?.company)}
            </div>

            {/* Progress indicator */}
            {jobInfo.durableJob && jobInfo.durableJob.totalGroups > 0 && (
              <div className='border rounded-md p-3.5 bg-muted/10 space-y-2'>
                <div className='flex items-center justify-between text-xs font-semibold'>
                  <span className='text-muted-foreground uppercase tracking-wider text-[10px]'>
                    Processing Progress
                  </span>
                  <span>
                    {jobInfo.durableJob.completedGroups} /{' '}
                    {jobInfo.durableJob.totalGroups} groups
                  </span>
                </div>
                <Progress
                  progress={
                    (jobInfo.durableJob.completedGroups /
                      jobInfo.durableJob.totalGroups) *
                    100
                  }
                  size='md'
                />
              </div>
            )}

            {/* Attempt configuration stats */}
            <div className='grid gap-3 sm:grid-cols-3 border rounded-md p-3.5 bg-muted/5'>
              <div>
                <span className='text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block'>
                  Attempts Made
                </span>
                <span className='font-mono text-sm mt-0.5 block font-semibold'>
                  {jobInfo.durableJob?.retryCount ?? 0} attempts
                </span>
              </div>
              <div>
                <span className='text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block'>
                  Created At
                </span>
                <span className='text-xs mt-0.5 block text-muted-foreground font-mono'>
                  {jobInfo.durableJob?.createdAt
                    ? new Date(jobInfo.durableJob.createdAt).toLocaleString()
                    : '-'}
                </span>
              </div>
              <div>
                <span className='text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block'>
                  Last Updated
                </span>
                <span className='text-xs mt-0.5 block text-muted-foreground font-mono'>
                  {jobInfo.durableJob?.completedAt ||
                  jobInfo.durableJob?.failedAt
                    ? new Date(
                        jobInfo.durableJob.completedAt ||
                          jobInfo.durableJob.failedAt!,
                      ).toLocaleString()
                    : jobInfo.durableJob?.heartbeatAt
                      ? new Date(
                          jobInfo.durableJob.heartbeatAt,
                        ).toLocaleString()
                      : '-'}
                </span>
              </div>
            </div>

            {/* Error reason */}
            {(jobInfo.failedReason || jobInfo.durableJob?.error) && (
              <div className='border rounded-md overflow-hidden border-destructive/20'>
                <div className='flex items-center justify-between border-b px-3 py-1.5 bg-destructive/10 text-destructive dark:text-red-400'>
                  <span className='text-[10px] font-semibold uppercase tracking-wider'>
                    Failure Reason
                  </span>
                  <Button
                    variant='ghost'
                    size='sm'
                    className='h-6 w-6 p-0 hover:bg-destructive/20 text-destructive dark:text-red-400'
                    onClick={() =>
                      handleCopy(
                        jobInfo.failedReason || jobInfo.durableJob?.error,
                        'Error message',
                      )
                    }
                  >
                    {copiedField === 'Error message' ? (
                      <CheckIcon className='size-3' />
                    ) : (
                      <CopyIcon className='size-3' />
                    )}
                  </Button>
                </div>
                <div className='p-3 bg-zinc-950/5 dark:bg-zinc-950/20 font-mono text-xs text-red-600 dark:text-red-400 whitespace-pre-wrap break-all leading-relaxed'>
                  {jobInfo.failedReason || jobInfo.durableJob?.error}
                </div>
                {jobInfo.stacktrace && jobInfo.stacktrace.length > 0 && (
                  <pre className='border-t p-3 max-h-40 overflow-auto bg-zinc-950 text-red-300 font-mono text-[10px] leading-relaxed break-all whitespace-pre-wrap'>
                    {jobInfo.stacktrace.join('\n')}
                  </pre>
                )}
              </div>
            )}

            {/* Payload JSON */}
            {!!jobInfo.data && (
              <div className='border rounded-md overflow-hidden'>
                <div className='flex items-center justify-between border-b px-3 py-1.5 bg-muted/40'>
                  <span className='text-[10px] font-semibold text-muted-foreground uppercase tracking-wider'>
                    Data Payload JSON
                  </span>
                  <Button
                    variant='ghost'
                    size='sm'
                    className='h-6 w-6 p-0'
                    onClick={() =>
                      handleCopy(
                        JSON.stringify(jobInfo.data, null, 2),
                        'Payload JSON',
                      )
                    }
                  >
                    {copiedField === 'Payload JSON' ? (
                      <CheckIcon className='size-3' />
                    ) : (
                      <CopyIcon className='size-3' />
                    )}
                  </Button>
                </div>
                <pre className='p-3 max-h-52 overflow-auto bg-muted/20 font-mono text-[11px] leading-relaxed text-foreground'>
                  {JSON.stringify(jobInfo.data, null, 2)}
                </pre>
              </div>
            )}

            {/* Return Value JSON */}
            {!!jobInfo.returnValue && (
              <div className='border rounded-md overflow-hidden'>
                <div className='flex items-center justify-between border-b px-3 py-1.5 bg-muted/40'>
                  <span className='text-[10px] font-semibold text-muted-foreground uppercase tracking-wider'>
                    Return Value JSON
                  </span>
                  <Button
                    variant='ghost'
                    size='sm'
                    className='h-6 w-6 p-0'
                    onClick={() =>
                      handleCopy(
                        JSON.stringify(jobInfo.returnValue, null, 2),
                        'Return Value JSON',
                      )
                    }
                  >
                    {copiedField === 'Return Value JSON' ? (
                      <CheckIcon className='size-3' />
                    ) : (
                      <CopyIcon className='size-3' />
                    )}
                  </Button>
                </div>
                <pre className='p-3 max-h-52 overflow-auto bg-muted/20 font-mono text-[11px] leading-relaxed text-foreground'>
                  {JSON.stringify(jobInfo.returnValue, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

function infoCard(
  label: string,
  value?: string,
  onCopy?: () => void,
  isCopied = false,
) {
  return (
    <div className='border rounded-md px-3 py-1.5 bg-muted/10 relative group'>
      <span className='text-[9px] font-semibold text-muted-foreground uppercase block'>
        {label}
      </span>
      <span className='text-xs font-mono font-medium block truncate mt-0.5 pr-6'>
        {value || (
          <span className='text-muted-foreground/60 italic'>Not Available</span>
        )}
      </span>
      {value && onCopy && (
        <Button
          variant='ghost'
          size='sm'
          className='absolute top-1.5 right-1.5 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity'
          onClick={onCopy}
        >
          {isCopied ? (
            <CheckIcon className='size-3 text-emerald-600' />
          ) : (
            <CopyIcon className='size-3' />
          )}
        </Button>
      )}
    </div>
  );
}
