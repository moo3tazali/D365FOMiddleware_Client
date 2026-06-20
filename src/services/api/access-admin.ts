import { Sync } from '@/services/core/sync';
import { API_ROUTES } from '@/services/core/api-routes';
import type { TUser } from '@/interfaces/user';

export interface AccessRequestUser extends TUser {
  id: string;
  entraObjectId?: string;
  firstSignInAt?: string;
  lastSignInAt?: string;
  lastIp?: string;
  lastUserAgent?: string;
}

export interface AccessDecisionRecord {
  action: string;
  previousStatus: TUser['accessStatus'];
  newStatus: TUser['accessStatus'];
  reason?: string;
  createdAt: string;
}

const sync = Sync.getInstance();

export class AccessAdmin {
  list(status?: TUser['accessStatus'], search?: string) {
    return sync.fetch<{
      items: AccessRequestUser[];
      nextCursor: string | null;
    }>(API_ROUTES.ADMIN.ACCESS.LIST, { query: { status, search } });
  }

  details(userId: string) {
    return sync.fetch<{
      user: AccessRequestUser;
      decisions: AccessDecisionRecord[];
    }>(API_ROUTES.ADMIN.ACCESS.ONE, { params: { userId } });
  }

  decide(
    userId: string,
    action: 'approve' | 'reject' | 'revoke' | 'reconsider',
    input: { reason?: string; targetStatus?: 'PENDING' | 'APPROVED' } = {},
  ) {
    const routes = {
      approve: API_ROUTES.ADMIN.ACCESS.APPROVE,
      reject: API_ROUTES.ADMIN.ACCESS.REJECT,
      revoke: API_ROUTES.ADMIN.ACCESS.REVOKE,
      reconsider: API_ROUTES.ADMIN.ACCESS.RECONSIDER,
    } as const;
    return sync.save<AccessRequestUser, typeof input>(routes[action], input, {
      params: { userId },
    });
  }
}
