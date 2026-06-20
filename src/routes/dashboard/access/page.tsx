import { useEffect, useState } from 'react';
import { createFileRoute, redirect } from '@tanstack/react-router';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ROUTES } from '@/router';
import { useServices } from '@/hooks/use-services';
import type { AccessRequestUser } from '@/services/api/access-admin';
import type { AccessDecisionRecord } from '@/services/api/access-admin';
import type { TUser } from '@/interfaces/user';

export const Route = createFileRoute('/dashboard/access/')({
  beforeLoad: ({ context }) => {
    if (context.auth.user?.role !== 'ADMIN') {
      throw redirect({ to: ROUTES.DASHBOARD.HOME });
    }
  },
  component: AccessDashboard,
});

function AccessDashboard() {
  const { accessAdmin } = useServices();
  const [items, setItems] = useState<AccessRequestUser[]>([]);
  const [status, setStatus] = useState<TUser['accessStatus']>();
  const [search, setSearch] = useState('');
  const [history, setHistory] = useState<{
    userId: string;
    decisions: AccessDecisionRecord[];
  } | null>(null);

  function load() {
    accessAdmin
      .list(status, search)
      .then((response) => setItems(response.items));
  }

  useEffect(load, [accessAdmin, search, status]);

  async function act(
    user: AccessRequestUser,
    action: 'approve' | 'reject' | 'revoke' | 'reconsider',
  ) {
    const reason = window.prompt('Optional reason') || undefined;
    await accessAdmin.decide(user.id, action, {
      reason,
      targetStatus: action === 'reconsider' ? 'PENDING' : undefined,
    });
    load();
  }

  return (
    <div className='space-y-5'>
      <h1 className='text-2xl font-semibold'>User access requests</h1>
      <div className='flex gap-3'>
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder='Search name or email'
        />
        <select
          className='rounded-md border bg-background px-3'
          value={status ?? ''}
          onChange={(event) =>
            setStatus(
              (event.target.value || undefined) as TUser['accessStatus'],
            )
          }
        >
          <option value=''>All statuses</option>
          {['PENDING', 'APPROVED', 'REJECTED', 'REVOKED'].map((value) => (
            <option key={value}>{value}</option>
          ))}
        </select>
      </div>
      <div className='space-y-3'>
        {items.map((user) => (
          <article className='rounded-lg border p-4' key={user.id}>
            <div className='flex flex-wrap items-start justify-between gap-4'>
              <div>
                <h2 className='font-medium'>{user.username || user.email}</h2>
                <p className='text-sm'>{user.email}</p>
                <p className='text-xs text-muted-foreground'>
                  {user.accessStatus} · OID {user.entraObjectId ?? '—'}
                </p>
                <p className='text-xs text-muted-foreground'>
                  Last sign-in {user.lastSignInAt ?? '—'} · {user.lastIp ?? '—'}
                </p>
              </div>
              <div className='flex gap-2'>
                <Button
                  size='sm'
                  variant='outline'
                  onClick={() =>
                    accessAdmin.details(user.id).then((details) =>
                      setHistory({
                        userId: user.id,
                        decisions: details.decisions,
                      }),
                    )
                  }
                >
                  History
                </Button>
                {user.accessStatus === 'PENDING' && (
                  <>
                    <Button size='sm' onClick={() => act(user, 'approve')}>
                      Approve
                    </Button>
                    <Button
                      size='sm'
                      variant='destructive'
                      onClick={() => act(user, 'reject')}
                    >
                      Reject
                    </Button>
                  </>
                )}
                {user.accessStatus === 'APPROVED' && (
                  <Button
                    size='sm'
                    variant='destructive'
                    onClick={() => act(user, 'revoke')}
                  >
                    Revoke
                  </Button>
                )}
                {(user.accessStatus === 'REJECTED' ||
                  user.accessStatus === 'REVOKED') && (
                  <Button size='sm' onClick={() => act(user, 'reconsider')}>
                    Reconsider
                  </Button>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
      {history && (
        <section className='rounded-lg border p-4'>
          <div className='flex justify-between'>
            <h2 className='font-medium'>Decision history</h2>
            <Button variant='ghost' onClick={() => setHistory(null)}>
              Close
            </Button>
          </div>
          <div className='mt-3 space-y-2'>
            {history.decisions.map((decision, index) => (
              <p className='text-sm' key={`${decision.createdAt}-${index}`}>
                {decision.createdAt}: {decision.previousStatus} →{' '}
                {decision.newStatus} ({decision.action})
                {decision.reason ? ` — ${decision.reason}` : ''}
              </p>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
