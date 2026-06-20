import { createRouter } from '@tanstack/react-router';

import { routeTree } from './routeTree.gen';
import type { FlattenObj } from './lib/utils';

export const router = createRouter({
  routeTree,
  context: {
    auth: undefined!,
    queryClient: undefined!,
    services: undefined!,
  },
  defaultPreload: 'intent',
  scrollRestoration: true,
  defaultStructuralSharing: true,
  defaultPreloadStaleTime: 0,
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export const ROUTES = {
  PUBLIC: {
    HOME: '/',
  },
  DASHBOARD: {
    HOME: '/dashboard',
    ACCOUNTS_PAYABLE: {
      HOME: '/dashboard/accounts-payable',
      BATCH: {
        NEW: '/dashboard/accounts-payable/batch/new',
        VIEW: '/dashboard/accounts-payable/batch/$batchId',
        ERRORS: '/dashboard/accounts-payable/batch/$batchId/errors',
        REMEDIATIONS: '/dashboard/accounts-payable/batch/$batchId/remediations',
      },
    },
    ACCOUNTS_RECEIVABLE: {
      HOME: '/dashboard/accounts-receivable',
      BATCH: {
        NEW: '/dashboard/accounts-receivable/batch/new',
        VIEW: '/dashboard/accounts-receivable/batch/$batchId',
        ERRORS: '/dashboard/accounts-receivable/batch/$batchId/errors',
        REMEDIATIONS:
          '/dashboard/accounts-receivable/batch/$batchId/remediations',
      },
    },
    CASH_MANAGEMENT: {
      HOME: '/dashboard/cash-management',
      BATCH: {
        NEW: '/dashboard/cash-management/batch/new',
        VIEW: '/dashboard/cash-management/batch/$batchId',
        ERRORS: '/dashboard/cash-management/batch/$batchId/errors',
        REMEDIATIONS: '/dashboard/cash-management/batch/$batchId/remediations',
      },
    },
    LEDGER: {
      HOME: '/dashboard/ledger',
      BATCH: {
        NEW: '/dashboard/ledger/batch/new',
        VIEW: '/dashboard/ledger/batch/$batchId',
        ERRORS: '/dashboard/ledger/batch/$batchId/errors',
        REMEDIATIONS: '/dashboard/ledger/batch/$batchId/remediations',
      },
    },
    CASH_IN: {
      HOME: '/dashboard/cash-in',
      BATCH: {
        NEW: '/dashboard/cash-in/batch/new',
        VIEW: '/dashboard/cash-in/batch/$batchId',
        ERRORS: '/dashboard/cash-in/batch/$batchId/errors',
        REMEDIATIONS: '/dashboard/cash-in/batch/$batchId/remediations',
      },
    },
    CASH_OUT: {
      HOME: '/dashboard/cash-out',
      BATCH: {
        NEW: '/dashboard/cash-out/batch/new',
        VIEW: '/dashboard/cash-out/batch/$batchId',
        ERRORS: '/dashboard/cash-out/batch/$batchId/errors',
        REMEDIATIONS: '/dashboard/cash-out/batch/$batchId/remediations',
      },
    },
    VENDOR: {
      HOME: '/dashboard/vendor',
      BATCH: {
        NEW: '/dashboard/vendor/batch/new',
        VIEW: '/dashboard/vendor/batch/$batchId',
        ERRORS: '/dashboard/vendor/batch/$batchId/errors',
        REMEDIATIONS: '/dashboard/vendor/batch/$batchId/remediations',
      },
    },
    SETTINGS: {
      HOME: '/dashboard/settings',
    },
    OBSERVABILITY: {
      HOME: '/dashboard/observability',
    },
    QUEUES: {
      HOME: '/dashboard/queues',
      VIEW: '/dashboard/queues/$queueName',
    },
    ACCESS: {
      HOME: '/dashboard/access',
    },
    PROFILE: {
      HOME: '/dashboard/profile',
    },
  },
  AUTH: {
    LOGIN: '/login',
    MICROSOFT_CALLBACK: '/microsoft-callback',
    CHANGE_PASSWORD: '/change-password',
  },
  ACCESS: {
    PENDING: '/access/pending',
    REJECTED: '/access/rejected',
    REVOKED: '/access/revoked',
  },
} as const;

type FlattenRoutes = FlattenObj<typeof ROUTES>;

export type TRoutes = FlattenRoutes | '..' | '.';
