import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createFileRoute, Link, redirect } from '@tanstack/react-router';
import { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import RefreshCwIcon from 'lucide-react/dist/esm/icons/refresh-cw';
import PlayIcon from 'lucide-react/dist/esm/icons/play';
import PauseIcon from 'lucide-react/dist/esm/icons/pause';
import EyeIcon from 'lucide-react/dist/esm/icons/eye';
import Trash2Icon from 'lucide-react/dist/esm/icons/trash-2';
import ClockIcon from 'lucide-react/dist/esm/icons/clock';
import ActivityIcon from 'lucide-react/dist/esm/icons/activity';
import CheckCircleIcon from 'lucide-react/dist/esm/icons/check-circle';
import AlertTriangleIcon from 'lucide-react/dist/esm/icons/alert-triangle';
import ChevronLeftIcon from 'lucide-react/dist/esm/icons/chevron-left';
import ChevronRightIcon from 'lucide-react/dist/esm/icons/chevron-right';
import ArrowUpDownIcon from 'lucide-react/dist/esm/icons/arrow-up-down';
import ArrowUpIcon from 'lucide-react/dist/esm/icons/arrow-up';
import ArrowDownIcon from 'lucide-react/dist/esm/icons/arrow-down';
import SlidersHorizontalIcon from 'lucide-react/dist/esm/icons/sliders-horizontal';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { useServices } from '@/hooks/use-services';
import { ROUTES } from '@/router';
import { cn } from '@/lib/utils';
import { JobDetailsDrawer } from '../-components/job-details-drawer';

export const Route = createFileRoute('/dashboard/queues/$queueName/')({
  beforeLoad: ({ context }) => {
    if (context.auth.user?.role !== 'ADMIN') {
      throw redirect({ to: ROUTES.DASHBOARD.HOME });
    }
  },
  component: QueueDetailPage,
});

function QueueDetailPage() {
  const { queueName } = Route.useParams();
  const { observability } = useServices();
  const queryClient = useQueryClient();

  // Auto refresh for queue status/metrics (not jobs list directly to avoid disruption)
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Job Details Drawer State
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Pagination & Filtering States
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [status, setStatus] = useState<string>('__ALL__');
  const [jobId, setJobId] = useState('');
  const [batchId, setBatchId] = useState('');
  const [timePreset, setTimePreset] = useState<string>('24h');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');

  // Sorting States
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Debounced input states (400ms)
  const [debouncedJobId, setDebouncedJobId] = useState('');
  const [debouncedBatchId, setDebouncedBatchId] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedJobId(jobId), 400);
    return () => clearTimeout(timer);
  }, [jobId]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedBatchId(batchId), 400);
    return () => clearTimeout(timer);
  }, [batchId]);

  // Compute from/to ISO dates
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  useEffect(() => {
    const now = new Date();
    if (timePreset === '1h') {
      setFrom(new Date(now.getTime() - 60 * 60 * 1000).toISOString());
      setTo(now.toISOString());
    } else if (timePreset === '24h') {
      setFrom(new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString());
      setTo(now.toISOString());
    } else if (timePreset === '7d') {
      setFrom(new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString());
      setTo(now.toISOString());
    } else if (timePreset === 'custom') {
      setFrom(customFrom ? new Date(customFrom).toISOString() : '');
      setTo(customTo ? new Date(customTo).toISOString() : '');
    } else {
      setFrom('');
      setTo('');
    }
  }, [timePreset, customFrom, customTo]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [
    status,
    debouncedJobId,
    debouncedBatchId,
    from,
    to,
    sortBy,
    sortDirection,
  ]);

  // 1. Fetch Queue Detail
  const {
    data: queueDetail,
    isLoading: isDetailLoading,
    refetch: refetchDetail,
  } = useQuery({
    ...observability.queueDetailQueryOptions(queueName),
    refetchInterval: autoRefresh ? 5_000 : false,
  });

  // 2. Fetch Jobs List (Paginated & Filtered)
  const filters = useMemo(() => {
    return {
      page,
      limit,
      status: status === '__ALL__' ? undefined : status,
      jobId: debouncedJobId || undefined,
      batchId: debouncedBatchId || undefined,
      from: from || undefined,
      to: to || undefined,
      sortBy,
      sortDirection,
    };
  }, [
    page,
    limit,
    status,
    debouncedJobId,
    debouncedBatchId,
    from,
    to,
    sortBy,
    sortDirection,
  ]);

  const {
    data: jobsData,
    isLoading: isJobsLoading,
    isRefetching: isJobsRefetching,
    refetch: refetchJobs,
  } = useQuery(observability.queueJobsQueryOptions(queueName, filters));

  // Refresh handler
  const handleRefresh = async () => {
    await Promise.all([refetchDetail(), refetchJobs()]);
  };

  // 3. Queue Pause/Resume Mutations
  const pauseMutation = useMutation({
    mutationFn: () => observability.pauseQueue(queueName),
    onSuccess: () => {
      toast.success('Queue paused successfully');
      void queryClient.invalidateQueries({
        queryKey: ['admin.observability.queueDetail', queueName],
      });
      void queryClient.invalidateQueries({
        queryKey: ['admin.observability.queues'],
      });
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to pause queue');
    },
  });

  const resumeMutation = useMutation({
    mutationFn: () => observability.resumeQueue(queueName),
    onSuccess: () => {
      toast.success('Queue resumed successfully');
      void queryClient.invalidateQueries({
        queryKey: ['admin.observability.queueDetail', queueName],
      });
      void queryClient.invalidateQueries({
        queryKey: ['admin.observability.queues'],
      });
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to resume queue');
    },
  });

  // 4. Job Retry/Delete Mutations
  const retryMutation = useMutation({
    mutationFn: (id: string) => observability.retryJob(queueName, id),
    onSuccess: () => {
      toast.success('Job retry request submitted successfully');
      void refetchJobs();
      void refetchDetail();
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to retry job');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => observability.deleteJob(queueName, id),
    onSuccess: () => {
      toast.success('Job deleted successfully');
      void refetchJobs();
      void refetchDetail();
      void queryClient.invalidateQueries({
        queryKey: ['admin.observability.queues'],
      });
      void queryClient.invalidateQueries({
        queryKey: ['admin.observability.postings'],
      });
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to delete job');
    },
  });

  const handleDeleteJob = (id: string) => {
    if (
      window.confirm(`Are you sure you want to permanently delete job ${id}?`)
    ) {
      deleteMutation.mutate(id);
    }
  };

  // Sort toggle handler
  const toggleSort = (field: string) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('desc');
    }
  };

  const clearFilters = () => {
    setStatus('__ALL__');
    setJobId('');
    setBatchId('');
    setTimePreset('24h');
    setCustomFrom('');
    setCustomTo('');
    setPage(1);
    setSortBy('createdAt');
    setSortDirection('desc');
  };

  const statusColor = (s?: string) => {
    const lower = String(s).toLowerCase();
    if (lower === 'completed' || lower === 'finished') return 'success';
    if (lower === 'failed') return 'destructive';
    if (lower === 'active' || lower === 'processing') return 'info';
    if (lower === 'waiting' || lower === 'queued') return 'warning';
    return 'muted';
  };

  // Render Sort Header Indicator
  const renderSortIndicator = (field: string) => {
    if (sortBy !== field) {
      return (
        <ArrowUpDownIcon className='ml-1.5 size-3 text-muted-foreground/60' />
      );
    }
    return sortDirection === 'asc' ? (
      <ArrowUpIcon className='ml-1.5 size-3 text-primary' />
    ) : (
      <ArrowDownIcon className='ml-1.5 size-3 text-primary' />
    );
  };

  const queueStats = queueDetail?.stats;
  const isPaused = queueDetail?.isPaused;
  const jobsList = jobsData?.data ?? [];
  const pagination = jobsData?.pagination;

  // Generate page numbers
  const pageNumbers = useMemo(() => {
    if (!pagination) return [];
    const { page: current, totalPages: total } = pagination;
    const maxVisible = 5;
    const pages: number[] = [];

    if (total <= maxVisible) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      let start = Math.max(current - 2, 1);
      const end = Math.min(start + maxVisible - 1, total);
      if (end === total) {
        start = Math.max(end - maxVisible + 1, 1);
      }
      for (let i = start; i <= end; i++) pages.push(i);
    }
    return pages;
  }, [pagination]);

  return (
    <div className='space-y-6'>
      {/* Breadcrumbs */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to={ROUTES.DASHBOARD.HOME}>Dashboard</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to={ROUTES.DASHBOARD.QUEUES.HOME}>Queues</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className='font-mono font-semibold'>
              {queueName}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header View */}
      <header className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-5'>
        <div className='space-y-1.5'>
          <div className='flex items-center gap-3'>
            <h1 className='text-2xl font-bold tracking-tight font-mono text-foreground'>
              {queueName}
            </h1>
            {isDetailLoading ? (
              <Badge color='muted' size='small' className='animate-pulse'>
                Loading...
              </Badge>
            ) : (
              <Badge
                color={isPaused ? 'warning' : 'success'}
                size='small'
                className='uppercase font-bold tracking-wider rounded px-2 py-0.5 text-[10px]'
              >
                {isPaused ? 'Paused' : 'Active'}
              </Badge>
            )}
          </div>
          <p className='text-xs text-muted-foreground'>
            Detailed BullMQ processing engine metrics, execution configurations,
            and job diagnostics history.
          </p>
        </div>

        <div className='flex flex-wrap items-center gap-3 self-start sm:self-auto'>
          {/* Auto Refresh Switch */}
          <div className='flex items-center gap-2 mr-1'>
            <input
              type='checkbox'
              id='detail-auto-refresh'
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className='rounded border-gray-300 text-primary focus:ring-primary size-4'
            />
            <label
              htmlFor='detail-auto-refresh'
              className='text-xs text-muted-foreground select-none cursor-pointer'
            >
              Auto-refresh (5s)
            </label>
          </div>

          {/* Pause / Resume Button */}
          {!isDetailLoading && (
            <Button
              variant={isPaused ? 'default' : 'destructive'}
              size='sm'
              className='h-9 gap-1.5 text-xs font-semibold'
              onClick={() => {
                if (isPaused) {
                  resumeMutation.mutate();
                } else {
                  if (
                    window.confirm(
                      `Are you sure you want to pause queue ${queueName}? No new jobs will be processed until resumed.`,
                    )
                  ) {
                    pauseMutation.mutate();
                  }
                }
              }}
              disabled={pauseMutation.isPending || resumeMutation.isPending}
            >
              {isPaused ? (
                <>
                  <PlayIcon className='size-3.5 fill-current' />
                  Resume Queue
                </>
              ) : (
                <>
                  <PauseIcon className='size-3.5 fill-current' />
                  Pause Queue
                </>
              )}
            </Button>
          )}

          {/* Manual Refresh */}
          <Button
            variant='outline'
            size='sm'
            onClick={() => void handleRefresh()}
            disabled={isDetailLoading || isJobsLoading || isJobsRefetching}
            className='h-9 gap-1.5 text-xs'
          >
            <RefreshCwIcon
              className={cn(
                'size-3.5',
                (isDetailLoading || isJobsLoading || isJobsRefetching) &&
                  'animate-spin',
              )}
            />
            Refresh
          </Button>
        </div>
      </header>

      {/* Metrics breakdown Cards */}
      <section className='grid gap-4 grid-cols-2 md:grid-cols-5'>
        {metricCard(
          'Waiting',
          queueStats?.waiting ?? 0,
          'bg-sky-50 text-sky-600 dark:bg-sky-950/30 dark:text-sky-400',
          <ClockIcon className='size-4' />,
        )}
        {metricCard(
          'Active',
          queueStats?.active ?? 0,
          'bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400',
          <ActivityIcon
            className={queueStats?.active ? 'animate-pulse' : ''}
          />,
        )}
        {metricCard(
          'Completed',
          queueStats?.completed ?? 0,
          'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400',
          <CheckCircleIcon className='size-4' />,
        )}
        {metricCard(
          'Failed',
          queueStats?.failed ?? 0,
          'bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400',
          <AlertTriangleIcon className='size-4' />,
        )}
        {metricCard(
          'Delayed',
          queueStats?.delayed ?? 0,
          'bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400',
          <ClockIcon className='size-4' />,
        )}
      </section>

      {/* Filters Container */}
      <section className='border rounded-lg p-4 bg-muted/10 space-y-4'>
        <div className='flex items-center justify-between border-b pb-2.5'>
          <h2 className='text-sm font-semibold flex items-center gap-1.5 uppercase tracking-wider text-muted-foreground'>
            <SlidersHorizontalIcon className='size-4 text-primary' />
            Queue Jobs Search Filter
          </h2>
          <Button
            variant='ghost'
            size='sm'
            className='h-7 text-xs font-semibold text-primary hover:underline'
            onClick={clearFilters}
          >
            Clear Filters
          </Button>
        </div>

        <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-5'>
          <div>
            <label className='text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1'>
              Job ID
            </label>
            <Input
              placeholder='Search Job ID...'
              className='h-9 text-xs font-mono'
              value={jobId}
              onChange={(e) => setJobId(e.target.value)}
            />
          </div>

          <div>
            <label className='text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1'>
              Batch ID
            </label>
            <Input
              placeholder='Search Batch ID...'
              className='h-9 text-xs font-mono'
              value={batchId}
              onChange={(e) => setBatchId(e.target.value)}
            />
          </div>

          <div>
            <label className='text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1'>
              Job Status
            </label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className='h-9 text-xs'>
                <SelectValue placeholder='All Statuses' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='__ALL__'>All Statuses</SelectItem>
                <SelectItem value='waiting'>Waiting</SelectItem>
                <SelectItem value='active'>Active</SelectItem>
                <SelectItem value='completed'>Completed</SelectItem>
                <SelectItem value='failed'>Failed</SelectItem>
                <SelectItem value='delayed'>Delayed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className='text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1'>
              Time Period
            </label>
            <Select value={timePreset} onValueChange={setTimePreset}>
              <SelectTrigger className='h-9 text-xs'>
                <SelectValue placeholder='Select period...' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='1h'>Last 1 Hour</SelectItem>
                <SelectItem value='24h'>Last 24 Hours</SelectItem>
                <SelectItem value='7d'>Last 7 Days</SelectItem>
                <SelectItem value='custom'>Custom Range</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {timePreset === 'custom' && (
            <div className='col-span-1 sm:col-span-2 lg:col-span-1 flex gap-2 items-center'>
              <div className='flex-1'>
                <label className='text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1'>
                  From
                </label>
                <Input
                  type='datetime-local'
                  className='h-9 text-xs'
                  value={customFrom}
                  onChange={(e) => setCustomFrom(e.target.value)}
                />
              </div>
              <div className='flex-1'>
                <label className='text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1'>
                  To
                </label>
                <Input
                  type='datetime-local'
                  className='h-9 text-xs'
                  value={customTo}
                  onChange={(e) => setCustomTo(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Jobs Table Container */}
      <section className='border rounded-lg overflow-hidden bg-card shadow-xs'>
        {isJobsLoading ? (
          <div className='flex flex-col items-center justify-center py-24 text-sm text-muted-foreground gap-2'>
            <RefreshCwIcon className='size-6 animate-spin text-primary' />
            Querying database trace documents...
          </div>
        ) : jobsList.length === 0 ? (
          <div className='flex flex-col items-center justify-center py-16 text-center text-sm text-muted-foreground'>
            <AlertTriangleIcon className='size-8 text-amber-500 mb-2' />
            No background jobs matched the active search filters.
          </div>
        ) : (
          <div className='overflow-x-auto'>
            <Table>
              <TableHeader>
                <TableRow className='bg-muted/30 hover:bg-muted/30'>
                  <TableHead className='w-[140px] text-xs uppercase font-bold tracking-wider'>
                    Job ID
                  </TableHead>
                  <TableHead className='w-[140px] text-xs uppercase font-bold tracking-wider'>
                    Batch ID
                  </TableHead>
                  <TableHead
                    className='w-[100px] text-xs uppercase font-bold tracking-wider cursor-pointer select-none'
                    onClick={() => toggleSort('status')}
                  >
                    <span className='flex items-center'>
                      Status
                      {renderSortIndicator('status')}
                    </span>
                  </TableHead>
                  <TableHead className='w-[130px] text-xs uppercase font-bold tracking-wider'>
                    Progress
                  </TableHead>
                  <TableHead
                    className='w-[100px] text-xs uppercase font-bold tracking-wider cursor-pointer select-none text-center'
                    onClick={() => toggleSort('retryCount')}
                  >
                    <span className='flex items-center justify-center'>
                      Attempts
                      {renderSortIndicator('retryCount')}
                    </span>
                  </TableHead>
                  <TableHead
                    className='w-[150px] text-xs uppercase font-bold tracking-wider cursor-pointer select-none'
                    onClick={() => toggleSort('createdAt')}
                  >
                    <span className='flex items-center'>
                      Created At
                      {renderSortIndicator('createdAt')}
                    </span>
                  </TableHead>
                  <TableHead className='w-[150px] text-xs uppercase font-bold tracking-wider'>
                    Finished At
                  </TableHead>
                  <TableHead className='w-[100px] text-right text-xs uppercase font-bold tracking-wider'>
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobsList.map((job) => {
                  const finishedDate = job.completedAt || job.failedAt;
                  return (
                    <TableRow
                      key={job.jobId}
                      className='hover:bg-muted/10 transition-colors cursor-pointer group/row'
                      onClick={() => {
                        setSelectedJobId(job.jobId);
                        setDrawerOpen(true);
                      }}
                    >
                      <TableCell
                        className='font-mono text-[11px] font-semibold text-foreground truncate max-w-[130px] group-hover/row:text-primary transition-colors'
                        title={job.jobId}
                      >
                        {job.jobId}
                      </TableCell>
                      <TableCell
                        className='font-mono text-[11px] text-muted-foreground truncate max-w-[130px]'
                        title={job.batchId}
                      >
                        {job.batchId || '-'}
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
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        {job.totalGroups > 0 ? (
                          <div className='space-y-1 max-w-[120px]'>
                            <div className='flex items-center justify-between text-[10px] text-muted-foreground font-semibold'>
                              <span>
                                {Math.round(
                                  (job.completedGroups / job.totalGroups) * 100,
                                )}
                                %
                              </span>
                              <span>
                                {job.completedGroups}/{job.totalGroups}
                              </span>
                            </div>
                            <Progress
                              progress={
                                (job.completedGroups / job.totalGroups) * 100
                              }
                              size='xs'
                            />
                          </div>
                        ) : (
                          <span className='text-xs text-muted-foreground/60 italic'>
                            -
                          </span>
                        )}
                      </TableCell>
                      <TableCell className='font-mono text-xs text-center font-medium'>
                        {job.retryCount ?? 0}
                      </TableCell>
                      <TableCell className='text-xs font-mono text-muted-foreground'>
                        {job.createdAt
                          ? new Date(job.createdAt).toLocaleString()
                          : '-'}
                      </TableCell>
                      <TableCell className='text-xs font-mono text-muted-foreground'>
                        {finishedDate
                          ? new Date(finishedDate).toLocaleString()
                          : '-'}
                      </TableCell>
                      <TableCell
                        className='text-right'
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className='flex items-center justify-end gap-1.5'>
                          <Button
                            variant='ghost'
                            size='sm'
                            className='h-7 w-7 p-0'
                            onClick={() => {
                              setSelectedJobId(job.jobId);
                              setDrawerOpen(true);
                            }}
                            title='View Details'
                          >
                            <EyeIcon className='size-3.5 text-muted-foreground group-hover/row:text-primary transition-colors' />
                          </Button>
                          <Button
                            variant='ghost'
                            size='sm'
                            className='h-7 w-7 p-0 hover:bg-emerald-50 dark:hover:bg-emerald-950/20'
                            onClick={() => retryMutation.mutate(job.jobId)}
                            disabled={
                              retryMutation.isPending ||
                              (job.status !== 'failed' &&
                                job.status !== 'completed')
                            }
                            title='Retry Job'
                          >
                            <RefreshCwIcon
                              className={cn(
                                'size-3.5 text-emerald-600',
                                retryMutation.isPending && 'animate-spin',
                              )}
                            />
                          </Button>
                          <Button
                            variant='ghost'
                            size='sm'
                            className='h-7 w-7 p-0 hover:bg-destructive/10 text-destructive'
                            onClick={() => handleDeleteJob(job.jobId)}
                            disabled={deleteMutation.isPending}
                            title='Delete Job'
                          >
                            <Trash2Icon className='size-3.5' />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Pagination Footer */}
        {pagination && pagination.totalPages > 1 && (
          <footer className='flex items-center justify-between border-t px-4 py-3 bg-muted/20'>
            <div className='flex items-center gap-1.5 text-xs text-muted-foreground'>
              <span>
                Showing Page <strong>{pagination.page}</strong> of{' '}
                <strong>{pagination.totalPages}</strong>
              </span>
              <span>•</span>
              <span>
                Total <strong>{pagination.total}</strong> records
              </span>
            </div>

            <div className='flex items-center gap-4'>
              {/* Limit Selector */}
              <div className='flex items-center gap-2'>
                <span className='text-xs text-muted-foreground hidden sm:inline'>
                  Rows per page:
                </span>
                <Select
                  value={String(limit)}
                  onValueChange={(val) => setLimit(Number(val))}
                >
                  <SelectTrigger className='h-8 w-16 text-xs'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='10'>10</SelectItem>
                    <SelectItem value='20'>20</SelectItem>
                    <SelectItem value='50'>50</SelectItem>
                    <SelectItem value='100'>100</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Page Buttons */}
              <div className='flex items-center gap-1'>
                <Button
                  variant='outline'
                  size='sm'
                  className='h-8 w-8 p-0'
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  disabled={!pagination.hasPreviousPage}
                >
                  <ChevronLeftIcon className='size-4' />
                </Button>
                {pageNumbers.map((p) => (
                  <Button
                    key={p}
                    variant={p === page ? 'default' : 'outline'}
                    size='sm'
                    className='h-8 w-8 p-0 text-xs font-semibold'
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </Button>
                ))}
                <Button
                  variant='outline'
                  size='sm'
                  className='h-8 w-8 p-0'
                  onClick={() =>
                    setPage((prev) => Math.min(prev + 1, pagination.totalPages))
                  }
                  disabled={!pagination.hasNextPage}
                >
                  <ChevronRightIcon className='size-4' />
                </Button>
              </div>
            </div>
          </footer>
        )}
      </section>

      {/* Job Details Slide-out Drawer */}
      <JobDetailsDrawer
        queueName={queueName}
        jobId={selectedJobId}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
    </div>
  );
}

// Metric Breakdown Card Helper
function metricCard(
  title: string,
  value: number,
  iconClass: string,
  icon: React.ReactNode,
) {
  return (
    <Card className='overflow-hidden border shadow-xs bg-card'>
      <CardContent className='flex items-center gap-3 p-3.5'>
        <div className={cn('rounded-full p-2', iconClass)}>{icon}</div>
        <div className='min-w-0'>
          <p className='text-[10px] font-bold text-muted-foreground uppercase tracking-wider'>
            {title}
          </p>
          <h3 className='text-base font-bold font-mono text-foreground mt-0.5'>
            {value}
          </h3>
        </div>
      </CardContent>
    </Card>
  );
}
