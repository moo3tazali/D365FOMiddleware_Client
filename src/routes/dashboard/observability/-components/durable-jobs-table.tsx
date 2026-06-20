import type { DurableQueueJob } from '@/interfaces/observability';

interface DurableJobsTableProps {
  jobsList?: DurableQueueJob[];
}

export function DurableJobsTable({ jobsList }: DurableJobsTableProps) {
  if (!jobsList) return null;

  return (
    <section className='overflow-hidden rounded-lg border'>
      <h2 className='border-b p-4 font-semibold'>Durable jobs</h2>
      <div className='overflow-x-auto'>
        <table className='w-full text-sm'>
          <thead className='bg-muted/50 text-left'>
            <tr>
              <th className='p-3'>Created</th>
              <th className='p-3'>Batch</th>
              <th className='p-3'>Queue</th>
              <th className='p-3'>Status</th>
              <th className='p-3'>Progress</th>
              <th className='p-3'>Retries</th>
            </tr>
          </thead>
          <tbody>
            {jobsList.map((job) => (
              <tr key={job.jobId} className='border-t'>
                <td className='p-3'>
                  {new Date(job.createdAt).toLocaleString()}
                </td>
                <td className='p-3 font-mono text-xs'>{job.batchId}</td>
                <td className='max-w-52 truncate p-3'>{job.queueName}</td>
                <td className='p-3'>{job.status}</td>
                <td className='p-3'>
                  {job.completedGroups}/{job.totalGroups}
                </td>
                <td className='p-3'>{job.retryCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
