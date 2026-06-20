import { useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import CalendarIcon from 'lucide-react/dist/esm/icons/calendar';
import ChevronLeftIcon from 'lucide-react/dist/esm/icons/chevron-left';
import ChevronRightIcon from 'lucide-react/dist/esm/icons/chevron-right';
import ChevronsLeftIcon from 'lucide-react/dist/esm/icons/chevrons-left';
import ChevronsRightIcon from 'lucide-react/dist/esm/icons/chevrons-right';
import CopyIcon from 'lucide-react/dist/esm/icons/copy';
import EyeIcon from 'lucide-react/dist/esm/icons/eye';
import RefreshCwIcon from 'lucide-react/dist/esm/icons/refresh-cw';
import SlidersHorizontalIcon from 'lucide-react/dist/esm/icons/sliders-horizontal';
import Trash2Icon from 'lucide-react/dist/esm/icons/trash-2';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { OperationalLog } from '@/interfaces/observability';
import { cn } from '@/lib/utils';

// Define Prop types for hook return values
interface OperationalEventsSectionProps {
  obs: {
    activeTab: 'live' | 'explorer';
    setActiveTab: (tab: 'live' | 'explorer') => void;

    // Live Mode
    liveSearch: string;
    setLiveSearch: (val: string) => void;
    liveBatchId: string;
    setLiveBatchId: (val: string) => void;
    liveLevel: string;
    setLiveLevel: (val: string) => void;
    liveAutoRefresh: boolean;
    setLiveAutoRefresh: (val: boolean) => void;
    liveLogs?: OperationalLog[];
    isLoadingLive: boolean;
    isRefetchingLive: boolean;
    refetchLive: () => void;

    // Explorer Mode
    explorerSearch: string;
    setExplorerSearch: (val: string) => void;
    explorerRoute: string;
    setExplorerRoute: (val: string) => void;
    explorerBatchId: string;
    setExplorerBatchId: (val: string) => void;
    explorerJobId: string;
    setExplorerJobId: (val: string) => void;
    explorerRequestId: string;
    setExplorerRequestId: (val: string) => void;
    explorerLevel: string;
    setExplorerLevel: (val: string) => void;
    explorerMethod: string;
    setExplorerMethod: (val: string) => void;
    explorerStatus: string;
    setExplorerStatus: (val: string) => void;
    explorerQueue: string;
    setExplorerQueue: (val: string) => void;
    timePreset: string;
    setTimePreset: (val: string) => void;
    customFrom: string;
    setCustomFrom: (val: string) => void;
    customTo: string;
    setCustomTo: (val: string) => void;
    fromState: string;
    toState: string;
    page: number;
    setPage: (val: number) => void;
    limit: number;
    setLimit: (val: number) => void;
    sortBy: string;
    setSortBy: (val: string) => void;
    sortDirection: 'asc' | 'desc';
    setSortDirection: (val: 'asc' | 'desc') => void;
    explorerLogs?: OperationalLog[];
    explorerPagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
    explorerSummary?: {
      total: number;
      error: number;
      warn: number;
      info: number;
    };
    isLoadingExplorer: boolean;
    isRefetchingExplorer: boolean;
    refetchExplorer: () => void;
    clearExplorerFilters: () => void;
  };
}

export function OperationalEventsSection({
  obs,
}: OperationalEventsSectionProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedLog, setSelectedLog] = useState<OperationalLog | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const pagination = obs.explorerPagination;

  const handleRowClick = (log: OperationalLog) => {
    setSelectedLog(log);
    setDrawerOpen(true);
  };

  const copyToClipboard = (text?: string, label?: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.success(`${label || 'Value'} copied to clipboard`);
  };

  // Generate page numbers for explorer pagination footer
  const paginationRange = useMemo(() => {
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

  const toggleSort = (field: string) => {
    if (obs.sortBy === field) {
      obs.setSortDirection(obs.sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      obs.setSortBy(field);
      obs.setSortDirection('desc');
    }
  };

  return (
    <section className='overflow-hidden rounded-lg border bg-card text-card-foreground shadow-xs'>
      {/* Dynamic Tabs Bar */}
      <div className='flex items-center justify-between border-b px-4 py-2.5 bg-muted/40'>
        <div className='flex gap-1.5'>
          <button
            onClick={() => obs.setActiveTab('live')}
            className={cn(
              'relative rounded-md px-3.5 py-1.5 text-xs font-semibold tracking-wide transition-all uppercase',
              obs.activeTab === 'live'
                ? 'bg-background text-foreground shadow-xs border'
                : 'text-muted-foreground hover:bg-muted/80 hover:text-foreground',
            )}
          >
            <span className='flex items-center gap-1.5'>
              <span
                className={cn(
                  'h-1.5 w-1.5 rounded-full bg-red-500',
                  obs.liveAutoRefresh && 'animate-ping',
                )}
              />
              Live Feed
            </span>
          </button>
          <button
            onClick={() => obs.setActiveTab('explorer')}
            className={cn(
              'rounded-md px-3.5 py-1.5 text-xs font-semibold tracking-wide transition-all uppercase',
              obs.activeTab === 'explorer'
                ? 'bg-background text-foreground shadow-xs border'
                : 'text-muted-foreground hover:bg-muted/80 hover:text-foreground',
            )}
          >
            Logs Explorer
          </button>
        </div>
        <div className='flex items-center gap-2'>
          {obs.activeTab === 'live' ? (
            <>
              <div className='flex items-center gap-2 mr-2'>
                <input
                  type='checkbox'
                  id='auto-refresh-check'
                  checked={obs.liveAutoRefresh}
                  onChange={(e) => obs.setLiveAutoRefresh(e.target.checked)}
                  className='rounded border-gray-300 text-primary focus:ring-primary size-4'
                />
                <label
                  htmlFor='auto-refresh-check'
                  className='text-xs text-muted-foreground select-none cursor-pointer'
                >
                  Auto-refresh (5s)
                </label>
              </div>
              <Button
                variant='outline'
                size='sm'
                className='h-8 gap-1.5 text-xs'
                onClick={obs.refetchLive}
                disabled={obs.isLoadingLive || obs.isRefetchingLive}
              >
                <RefreshCwIcon
                  className={cn(
                    'size-3',
                    (obs.isLoadingLive || obs.isRefetchingLive) &&
                      'animate-spin',
                  )}
                />
                Refresh
              </Button>
            </>
          ) : (
            <Button
              variant='outline'
              size='sm'
              className='h-8 gap-1.5 text-xs'
              onClick={obs.refetchExplorer}
              disabled={obs.isLoadingExplorer || obs.isRefetchingExplorer}
            >
              <RefreshCwIcon
                className={cn(
                  'size-3',
                  (obs.isLoadingExplorer || obs.isRefetchingExplorer) &&
                    'animate-spin',
                )}
              />
              Refresh Explorer
            </Button>
          )}
        </div>
      </div>

      {/* FILTERS CONTAINER */}
      <div className='border-b p-4 space-y-3 bg-muted/10'>
        {obs.activeTab === 'live' ? (
          /* Live Filters */
          <div className='grid gap-3 sm:grid-cols-3'>
            <div>
              <label className='text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1'>
                Message Search
              </label>
              <Input
                placeholder='Search live events...'
                className='h-9 text-xs'
                value={obs.liveSearch}
                onChange={(e) => obs.setLiveSearch(e.target.value)}
              />
            </div>
            <div>
              <label className='text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1'>
                Batch ID
              </label>
              <Input
                placeholder='Filter by batch ID...'
                className='h-9 text-xs'
                value={obs.liveBatchId}
                onChange={(e) => obs.setLiveBatchId(e.target.value)}
              />
            </div>
            <div>
              <label className='text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1'>
                Log Level
              </label>
              <Select value={obs.liveLevel} onValueChange={obs.setLiveLevel}>
                <SelectTrigger className='h-9 text-xs'>
                  <SelectValue placeholder='All Levels' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='__ALL__'>All Levels</SelectItem>
                  <SelectItem value='info'>Info</SelectItem>
                  <SelectItem value='warn'>Warning</SelectItem>
                  <SelectItem value='error'>Error</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        ) : (
          /* Explorer Filters */
          <div className='space-y-3'>
            <div className='grid gap-3 sm:grid-cols-3 lg:grid-cols-4'>
              <div>
                <label className='text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1'>
                  Search Message Text
                </label>
                <Input
                  placeholder='Search messages...'
                  className='h-9 text-xs'
                  value={obs.explorerSearch}
                  onChange={(e) => obs.setExplorerSearch(e.target.value)}
                />
              </div>

              <div>
                <label className='text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1'>
                  Log Level
                </label>
                <Select
                  value={obs.explorerLevel}
                  onValueChange={obs.setExplorerLevel}
                >
                  <SelectTrigger className='h-9 text-xs'>
                    <SelectValue placeholder='All Levels' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='__ALL__'>All Levels</SelectItem>
                    <SelectItem value='info'>Info</SelectItem>
                    <SelectItem value='warn'>Warning</SelectItem>
                    <SelectItem value='error'>Error</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className='text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1'>
                  Time Frame Range
                </label>
                <Select
                  value={obs.timePreset}
                  onValueChange={obs.setTimePreset}
                >
                  <SelectTrigger className='h-9 text-xs'>
                    <SelectValue placeholder='Select Time Range' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='1h'>Last 1 hour</SelectItem>
                    <SelectItem value='24h'>Last 24 hours</SelectItem>
                    <SelectItem value='today'>Today</SelectItem>
                    <SelectItem value='yesterday'>Yesterday</SelectItem>
                    <SelectItem value='7d'>Last 7 days</SelectItem>
                    <SelectItem value='custom'>Custom Range</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='flex items-end gap-2'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className='h-9 w-full gap-1.5 text-xs'
                >
                  <SlidersHorizontalIcon className='size-3.5' />
                  {showAdvanced ? 'Hide Advanced' : 'Advanced Filters'}
                </Button>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={obs.clearExplorerFilters}
                  title='Clear Filters'
                  className='h-9 px-3 hover:text-destructive'
                >
                  <Trash2Icon className='size-4' />
                </Button>
              </div>
            </div>

            {/* Custom Range picker inputs */}
            {obs.timePreset === 'custom' && (
              <div className='grid gap-3 sm:grid-cols-2 rounded-md border p-3 bg-muted/20 animate-in fade-in slide-in-from-top-1 duration-200'>
                <div>
                  <label className='text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1'>
                    From Date / Time
                  </label>
                  <div className='relative'>
                    <Input
                      type='datetime-local'
                      className='h-9 text-xs pl-8'
                      value={obs.customFrom}
                      onChange={(e) => obs.setCustomFrom(e.target.value)}
                    />
                    <CalendarIcon className='absolute left-2.5 top-2.5 size-4 text-muted-foreground' />
                  </div>
                </div>
                <div>
                  <label className='text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1'>
                    To Date / Time
                  </label>
                  <div className='relative'>
                    <Input
                      type='datetime-local'
                      className='h-9 text-xs pl-8'
                      value={obs.customTo}
                      onChange={(e) => obs.setCustomTo(e.target.value)}
                    />
                    <CalendarIcon className='absolute left-2.5 top-2.5 size-4 text-muted-foreground' />
                  </div>
                </div>
              </div>
            )}

            {/* Advanced Filters Panel */}
            {showAdvanced && (
              <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-4 rounded-md border p-3.5 bg-muted/30 animate-in fade-in slide-in-from-top-2 duration-200'>
                <div>
                  <label className='text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1'>
                    HTTP Method
                  </label>
                  <Select
                    value={obs.explorerMethod}
                    onValueChange={obs.setExplorerMethod}
                  >
                    <SelectTrigger className='h-9 text-xs'>
                      <SelectValue placeholder='All Methods' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='__ALL__'>All Methods</SelectItem>
                      <SelectItem value='GET'>GET</SelectItem>
                      <SelectItem value='POST'>POST</SelectItem>
                      <SelectItem value='PUT'>PUT</SelectItem>
                      <SelectItem value='DELETE'>DELETE</SelectItem>
                      <SelectItem value='PATCH'>PATCH</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className='text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1'>
                    Route / Path Path
                  </label>
                  <Input
                    placeholder='e.g. /api/v1/DataMigration'
                    className='h-9 text-xs'
                    value={obs.explorerRoute}
                    onChange={(e) => obs.setExplorerRoute(e.target.value)}
                  />
                </div>

                <div>
                  <label className='text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1'>
                    HTTP Status Code
                  </label>
                  <Input
                    placeholder='e.g. 500, 200'
                    className='h-9 text-xs'
                    value={obs.explorerStatus}
                    onChange={(e) => obs.setExplorerStatus(e.target.value)}
                  />
                </div>

                <div>
                  <label className='text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1'>
                    Queue Name
                  </label>
                  <Input
                    placeholder='e.g. data-migration-queue'
                    className='h-9 text-xs'
                    value={obs.explorerQueue}
                    onChange={(e) => obs.setExplorerQueue(e.target.value)}
                  />
                </div>

                <div>
                  <label className='text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1'>
                    Batch ID
                  </label>
                  <Input
                    placeholder='Filter by batch ID...'
                    className='h-9 text-xs'
                    value={obs.explorerBatchId}
                    onChange={(e) => obs.setExplorerBatchId(e.target.value)}
                  />
                </div>

                <div>
                  <label className='text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1'>
                    Job ID
                  </label>
                  <Input
                    placeholder='Filter by BullMQ job ID...'
                    className='h-9 text-xs'
                    value={obs.explorerJobId}
                    onChange={(e) => obs.setExplorerJobId(e.target.value)}
                  />
                </div>

                <div>
                  <label className='text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1'>
                    Request ID
                  </label>
                  <Input
                    placeholder='Filter by API request ID...'
                    className='h-9 text-xs'
                    value={obs.explorerRequestId}
                    onChange={(e) => obs.setExplorerRequestId(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Explorer Summary Breakdown Pills */}
      {obs.activeTab === 'explorer' && obs.explorerSummary && (
        <div className='flex flex-wrap items-center justify-between gap-2 border-b bg-card px-4 py-2 text-xs'>
          <div className='flex items-center gap-2'>
            <span className='font-medium text-muted-foreground'>
              Breakdown counts:
            </span>
            <div className='flex gap-1.5'>
              <span className='inline-flex items-center gap-1 rounded bg-gray-100 dark:bg-zinc-800 px-2 py-0.5 font-medium'>
                Total:{' '}
                <strong className='text-foreground'>
                  {obs.explorerSummary.total}
                </strong>
              </span>
              <span className='inline-flex items-center gap-1 rounded bg-red-50 dark:bg-red-950/20 px-2 py-0.5 font-medium text-red-600 dark:text-red-400'>
                Errors: <strong>{obs.explorerSummary.error}</strong>
              </span>
              <span className='inline-flex items-center gap-1 rounded bg-yellow-50 dark:bg-yellow-950/20 px-2 py-0.5 font-medium text-amber-600 dark:text-amber-400'>
                Warnings: <strong>{obs.explorerSummary.warn}</strong>
              </span>
              <span className='inline-flex items-center gap-1 rounded bg-blue-50 dark:bg-blue-950/20 px-2 py-0.5 font-medium text-blue-600 dark:text-blue-400'>
                Info: <strong>{obs.explorerSummary.info}</strong>
              </span>
            </div>
          </div>
          {obs.fromState && obs.toState && (
            <span className='text-[11px] text-muted-foreground italic'>
              Active Range: {new Date(obs.fromState).toLocaleString()} -{' '}
              {new Date(obs.toState).toLocaleString()}
            </span>
          )}
        </div>
      )}

      {/* DATA TABLE CONTAINER */}
      <div className='overflow-x-auto max-h-[500px] overflow-y-auto relative border-t'>
        {obs.activeTab === 'live' ? (
          /* Live Feed View */
          <Table className='min-w-[800px] border-collapse'>
            <TableHeader className='bg-muted/50 sticky top-0 z-10'>
              <TableRow>
                <TableHead className='w-[160px]'>Timestamp</TableHead>
                <TableHead className='w-[80px]'>Level</TableHead>
                <TableHead className='w-[160px]'>
                  Event Context / Type
                </TableHead>
                <TableHead>Message / Payload</TableHead>
                <TableHead className='w-[80px] text-right'>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {obs.liveLogs && obs.liveLogs.length > 0 ? (
                obs.liveLogs.map((log) => (
                  <TableRow
                    key={log.eventId}
                    onClick={() => handleRowClick(log)}
                    className='cursor-pointer hover:bg-muted/40 transition-colors'
                  >
                    <TableCell className='font-mono text-xs whitespace-nowrap text-muted-foreground'>
                      {new Date(log.timestamp).toLocaleString()}
                    </TableCell>
                    <TableCell>{levelBadge(log.level)}</TableCell>
                    <TableCell className='truncate max-w-[160px] text-xs font-semibold'>
                      {log.context || log.eventType}
                    </TableCell>
                    <TableCell className='text-xs font-mono truncate max-w-[400px]'>
                      {log.message}
                    </TableCell>
                    <TableCell
                      className='text-right'
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        variant='ghost'
                        size='sm'
                        className='h-7 w-7 p-0'
                        onClick={() => handleRowClick(log)}
                      >
                        <EyeIcon className='size-3.5' />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : !obs.isLoadingLive ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className='h-40 text-center text-sm text-muted-foreground'
                  >
                    No live logs match the selected filters.
                  </TableCell>
                </TableRow>
              ) : null}

              {/* Live Loading Overlay */}
              {obs.isLoadingLive && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className='h-40 text-center text-sm text-muted-foreground'
                  >
                    <div className='flex items-center justify-center gap-2'>
                      <RefreshCwIcon className='size-4 animate-spin text-primary' />
                      Streaming live logs...
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        ) : (
          /* Explorer Advanced Paginated View */
          <Table className='min-w-[950px] border-collapse'>
            <TableHeader className='bg-muted/50 sticky top-0 z-10 select-none'>
              <TableRow>
                <TableHead
                  className='w-[160px] cursor-pointer hover:bg-muted'
                  onClick={() => toggleSort('timestamp')}
                >
                  Timestamp{' '}
                  {renderSortArrow('timestamp', obs.sortBy, obs.sortDirection)}
                </TableHead>
                <TableHead
                  className='w-[80px] cursor-pointer hover:bg-muted'
                  onClick={() => toggleSort('level')}
                >
                  Level{' '}
                  {renderSortArrow('level', obs.sortBy, obs.sortDirection)}
                </TableHead>
                <TableHead className='w-[80px]'>Method</TableHead>
                <TableHead
                  className='w-[80px] cursor-pointer hover:bg-muted'
                  onClick={() => toggleSort('status')}
                >
                  Status{' '}
                  {renderSortArrow('status', obs.sortBy, obs.sortDirection)}
                </TableHead>
                <TableHead>Route / Message Path</TableHead>
                <TableHead
                  className='w-[90px] cursor-pointer hover:bg-muted text-right'
                  onClick={() => toggleSort('durationMs')}
                >
                  Duration{' '}
                  {renderSortArrow('durationMs', obs.sortBy, obs.sortDirection)}
                </TableHead>
                <TableHead className='w-[80px] text-right'>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {obs.explorerLogs && obs.explorerLogs.length > 0 ? (
                obs.explorerLogs.map((log) => (
                  <TableRow
                    key={log.eventId}
                    onClick={() => handleRowClick(log)}
                    className='cursor-pointer hover:bg-muted/40 transition-colors'
                  >
                    <TableCell className='font-mono text-xs whitespace-nowrap text-muted-foreground'>
                      {new Date(log.timestamp).toLocaleString()}
                    </TableCell>
                    <TableCell>{levelBadge(log.level)}</TableCell>
                    <TableCell className='font-semibold text-xs'>
                      {log.metadata?.method || log.status
                        ? (log.metadata?.method as string) || 'API'
                        : '-'}
                    </TableCell>
                    <TableCell>{statusBadge(log.status)}</TableCell>
                    <TableCell
                      className='text-xs font-mono max-w-[350px] truncate'
                      title={log.message}
                    >
                      {log.metadata?.path
                        ? (log.metadata.path as string)
                        : log.message}
                    </TableCell>
                    <TableCell className='text-right font-mono text-xs text-muted-foreground'>
                      {log.durationMs !== undefined
                        ? `${log.durationMs}ms`
                        : '-'}
                    </TableCell>
                    <TableCell
                      className='text-right'
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        variant='ghost'
                        size='sm'
                        className='h-7 w-7 p-0'
                        onClick={() => handleRowClick(log)}
                      >
                        <EyeIcon className='size-3.5' />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : !obs.isLoadingExplorer ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className='h-40 text-center text-sm text-muted-foreground'
                  >
                    No logs match the selected filters.
                  </TableCell>
                </TableRow>
              ) : null}

              {/* Explorer Loading Overlay */}
              {obs.isLoadingExplorer && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className='h-40 text-center text-sm text-muted-foreground'
                  >
                    <div className='flex items-center justify-center gap-2'>
                      <RefreshCwIcon className='size-4 animate-spin text-primary' />
                      Querying historical logs...
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Explorer Pagination Footer */}
      {obs.activeTab === 'explorer' && pagination && (
        <div className='flex flex-col sm:flex-row items-center justify-between gap-4 border-t p-4 bg-muted/10'>
          <div className='flex items-center gap-3 text-xs text-muted-foreground'>
            <span>
              Showing{' '}
              <strong>
                {pagination.total === 0 ? 0 : (obs.page - 1) * obs.limit + 1}
              </strong>{' '}
              to{' '}
              <strong>
                {Math.min(obs.page * obs.limit, pagination.total)}
              </strong>{' '}
              of <strong>{pagination.total}</strong> logs
            </span>

            <div className='flex items-center gap-1.5'>
              <span>| Limit:</span>
              <Select
                value={String(obs.limit)}
                onValueChange={(val) => {
                  obs.setLimit(Number(val));
                  obs.setPage(1);
                }}
              >
                <SelectTrigger className='h-7 w-[70px] text-xs py-0'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='25'>25</SelectItem>
                  <SelectItem value='50'>50</SelectItem>
                  <SelectItem value='100'>100</SelectItem>
                  <SelectItem value='200'>200</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className='flex items-center gap-1.5'>
            <Button
              variant='outline'
              size='sm'
              className='h-8 w-8 p-0'
              disabled={obs.page === 1 || obs.isLoadingExplorer}
              onClick={() => obs.setPage(1)}
              title='First Page'
            >
              <ChevronsLeftIcon className='size-4' />
            </Button>
            <Button
              variant='outline'
              size='sm'
              className='h-8 w-8 p-0'
              disabled={obs.page === 1 || obs.isLoadingExplorer}
              onClick={() => obs.setPage(obs.page - 1)}
              title='Previous Page'
            >
              <ChevronLeftIcon className='size-4' />
            </Button>

            {paginationRange.map((pNum) => (
              <Button
                key={pNum}
                variant={obs.page === pNum ? 'default' : 'outline'}
                size='sm'
                className='h-8 w-8 text-xs font-semibold'
                onClick={() => obs.setPage(pNum)}
                disabled={obs.isLoadingExplorer}
              >
                {pNum}
              </Button>
            ))}

            <Button
              variant='outline'
              size='sm'
              className='h-8 w-8 p-0'
              disabled={
                obs.page === pagination.totalPages || obs.isLoadingExplorer
              }
              onClick={() => obs.setPage(obs.page + 1)}
              title='Next Page'
            >
              <ChevronRightIcon className='size-4' />
            </Button>
            <Button
              variant='outline'
              size='sm'
              className='h-8 w-8 p-0'
              disabled={
                obs.page === pagination.totalPages || obs.isLoadingExplorer
              }
              onClick={() => obs.setPage(pagination.totalPages)}
              title='Last Page'
            >
              <ChevronsRightIcon className='size-4' />
            </Button>
          </div>
        </div>
      )}

      {/* DETAIL DRAWER / SHEET */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent className='sm:max-w-2xl overflow-y-auto flex flex-col h-full bg-background border-l'>
          {selectedLog && (
            <>
              <SheetHeader className='pb-4 border-b'>
                <div className='flex items-center gap-2.5'>
                  {levelBadge(selectedLog.level)}
                  <span className='text-xs font-mono text-muted-foreground'>
                    {selectedLog.eventId}
                  </span>
                </div>
                <SheetTitle className='text-base font-semibold tracking-tight mt-2 text-foreground font-mono truncate'>
                  {selectedLog.eventType}
                </SheetTitle>
                <SheetDescription className='text-xs text-muted-foreground'>
                  Logged at {new Date(selectedLog.timestamp).toLocaleString()}
                </SheetDescription>
              </SheetHeader>

              <div className='flex-1 py-4 space-y-5 text-sm'>
                {/* Message block */}
                <div className='rounded-md border p-3 bg-muted/10 relative group'>
                  <h4 className='text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1'>
                    Full Message
                  </h4>
                  <p className='font-mono text-xs text-foreground whitespace-pre-wrap break-all leading-relaxed pr-8'>
                    {selectedLog.message}
                  </p>
                  <Button
                    variant='ghost'
                    size='sm'
                    className='absolute top-2 right-2 h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity'
                    onClick={() =>
                      copyToClipboard(selectedLog.message, 'Message')
                    }
                    title='Copy Message'
                  >
                    <CopyIcon className='size-3.5' />
                  </Button>
                </div>

                {/* HTTP Request metadata if present */}
                {(selectedLog.metadata?.method || selectedLog.status) && (
                  <div className='grid grid-cols-2 gap-3 border rounded-md p-3.5 bg-muted/5'>
                    <div>
                      <span className='text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block'>
                        HTTP Method
                      </span>
                      <span className='font-mono text-xs mt-0.5 block font-semibold'>
                        {(selectedLog.metadata?.method as string) || '-'}
                      </span>
                    </div>
                    <div>
                      <span className='text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block'>
                        Status Code
                      </span>
                      <span className='mt-0.5 block'>
                        {statusBadge(selectedLog.status)}
                      </span>
                    </div>
                    <div className='col-span-2 mt-1'>
                      <span className='text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block'>
                        Target Path
                      </span>
                      <span className='font-mono text-xs mt-0.5 block break-all leading-relaxed text-blue-600 dark:text-blue-400'>
                        {(selectedLog.metadata?.path as string) || '-'}
                      </span>
                    </div>
                  </div>
                )}

                {/* Technical / Operations Context IDs */}
                <div className='space-y-2 border-t pt-4'>
                  <h4 className='text-[11px] font-bold text-foreground uppercase tracking-wider mb-2.5'>
                    Execution Context
                  </h4>
                  <div className='grid gap-2.5 sm:grid-cols-2'>
                    {idDetailRow('Request ID', selectedLog.requestId, () =>
                      copyToClipboard(selectedLog.requestId, 'Request ID'),
                    )}
                    {idDetailRow('Batch ID', selectedLog.batchId, () =>
                      copyToClipboard(selectedLog.batchId, 'Batch ID'),
                    )}
                    {idDetailRow('Job ID', selectedLog.jobId, () =>
                      copyToClipboard(selectedLog.jobId, 'Job ID'),
                    )}
                    {idDetailRow('Queue Name', selectedLog.queueName, () =>
                      copyToClipboard(selectedLog.queueName, 'Queue Name'),
                    )}
                    {idDetailRow(
                      'Correlation ID',
                      selectedLog.correlationId,
                      () =>
                        copyToClipboard(
                          selectedLog.correlationId,
                          'Correlation ID',
                        ),
                    )}
                    {selectedLog.durationMs !== undefined && (
                      <div className='border rounded-md px-3 py-1.5 bg-muted/10'>
                        <span className='text-[9px] font-semibold text-muted-foreground uppercase block'>
                          Duration
                        </span>
                        <span className='text-xs font-mono font-semibold'>
                          {selectedLog.durationMs}ms
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Error Stack Trace if present */}
                {selectedLog.error && (
                  <div className='border rounded-md overflow-hidden animate-in fade-in duration-200'>
                    <div className='flex items-center justify-between border-b px-3 py-1.5 bg-destructive/10 text-destructive dark:text-red-400'>
                      <span className='text-[10px] font-semibold uppercase tracking-wider'>
                        Error Stack Trace ({selectedLog.error.name || 'Error'})
                      </span>
                      <Button
                        variant='ghost'
                        size='sm'
                        className='h-6 w-6 p-0 hover:bg-destructive/20 text-destructive dark:text-red-400'
                        onClick={() =>
                          copyToClipboard(
                            selectedLog.error?.stack,
                            'Stack trace',
                          )
                        }
                        title='Copy Stack Trace'
                      >
                        <CopyIcon className='size-3' />
                      </Button>
                    </div>
                    <pre className='p-3 max-h-56 overflow-auto bg-zinc-950 text-red-300 font-mono text-[10px] leading-relaxed break-all whitespace-pre-wrap'>
                      {selectedLog.error.message}
                      {selectedLog.error.stack &&
                        `\n\n${selectedLog.error.stack}`}
                    </pre>
                  </div>
                )}

                {/* Full Log Document JSON */}
                <div className='border rounded-md overflow-hidden'>
                  <div className='flex items-center justify-between border-b px-3 py-1.5 bg-muted/40'>
                    <span className='text-[10px] font-semibold text-muted-foreground uppercase tracking-wider'>
                      Complete Metadata Document
                    </span>
                    <Button
                      variant='ghost'
                      size='sm'
                      className='h-6 w-6 p-0'
                      onClick={() =>
                        copyToClipboard(
                          JSON.stringify(selectedLog, null, 2),
                          'Metadata JSON',
                        )
                      }
                      title='Copy Document'
                    >
                      <CopyIcon className='size-3' />
                    </Button>
                  </div>
                  <pre className='p-3 max-h-60 overflow-auto bg-muted/30 font-mono text-[11px] leading-relaxed text-foreground'>
                    {JSON.stringify(selectedLog, null, 2)}
                  </pre>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </section>
  );
}

// Subcomponent: level badge helper
function levelBadge(level: string) {
  const normLevel = String(level).toLowerCase();
  if (normLevel === 'error') {
    return (
      <Badge
        color='destructive'
        size='small'
        className='px-2 py-0.5 rounded text-[10px] font-bold uppercase'
      >
        Error
      </Badge>
    );
  }
  if (normLevel === 'warn' || normLevel === 'warning') {
    return (
      <Badge
        color='warning'
        size='small'
        className='px-2 py-0.5 rounded text-[10px] font-bold uppercase'
      >
        Warning
      </Badge>
    );
  }
  return (
    <Badge
      color='info'
      size='small'
      className='px-2 py-0.5 rounded text-[10px] font-bold uppercase'
    >
      Info
    </Badge>
  );
}

// Subcomponent: status badge helper
function statusBadge(status?: string | number) {
  if (!status) return <span className='text-xs text-muted-foreground'>-</span>;
  const numStatus = Number(status);
  if (isNaN(numStatus)) {
    return (
      <Badge
        color='muted'
        size='small'
        className='px-1.5 rounded-sm font-mono text-[10px]'
      >
        {status}
      </Badge>
    );
  }
  if (numStatus >= 500) {
    return (
      <Badge
        color='destructive'
        size='small'
        className='px-1.5 rounded-sm font-mono text-[10px] font-semibold'
      >
        {status}
      </Badge>
    );
  }
  if (numStatus >= 400) {
    return (
      <Badge
        color='warning'
        size='small'
        className='px-1.5 rounded-sm font-mono text-[10px] font-semibold'
      >
        {status}
      </Badge>
    );
  }
  if (numStatus >= 300) {
    return (
      <Badge
        color='sky'
        size='small'
        className='px-1.5 rounded-sm font-mono text-[10px] font-semibold'
      >
        {status}
      </Badge>
    );
  }
  return (
    <Badge
      color='success'
      size='small'
      className='px-1.5 rounded-sm font-mono text-[10px] font-semibold'
    >
      {status}
    </Badge>
  );
}

// Subcomponent: ID Detail row helper
function idDetailRow(label: string, idVal?: string, onCopy?: () => void) {
  return (
    <div className='border rounded-md px-3 py-1.5 bg-muted/10 relative group'>
      <span className='text-[9px] font-semibold text-muted-foreground uppercase block'>
        {label}
      </span>
      <span className='text-xs font-mono font-medium block truncate mt-0.5 pr-6'>
        {idVal || (
          <span className='text-muted-foreground/60 italic'>Not Available</span>
        )}
      </span>
      {idVal && (
        <Button
          variant='ghost'
          size='sm'
          className='absolute top-1.5 right-1.5 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity'
          onClick={onCopy}
          title={`Copy ${label}`}
        >
          <CopyIcon className='size-3' />
        </Button>
      )}
    </div>
  );
}

// Render Sort Arrow
function renderSortArrow(
  field: string,
  currentSort: string,
  direction: 'asc' | 'desc',
) {
  if (currentSort !== field) return null;
  return (
    <span className='ml-1 text-[10px] font-semibold text-primary inline-block transform transition-transform'>
      {direction === 'asc' ? '▲' : '▼'}
    </span>
  );
}
