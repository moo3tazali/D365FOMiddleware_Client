import { createRouter } from '@tanstack/react-router';
// Import the generated route tree

import { routeTree } from './routeTree.gen';
import type { FlattenObj } from './lib/utils';
// Create a new router instance
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

// Register the router instance for type safety
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
      },
    },
    ACCOUNTS_RECEIVABLE: {
      HOME: '/dashboard/accounts-receivable',
      BATCH: {
        NEW: '/dashboard/accounts-receivable/batch/new',
        VIEW: '/dashboard/accounts-receivable/batch/$batchId',
        ERRORS: '/dashboard/accounts-receivable/batch/$batchId/errors',
      },
    },
    CASH_MANAGEMENT: {
      HOME: '/dashboard/cash-management',
      BATCH: {
        NEW: '/dashboard/cash-management/batch/new',
        VIEW: '/dashboard/cash-management/batch/$batchId',
        ERRORS: '/dashboard/cash-management/batch/$batchId/errors',
      },
    },
    LEDGER: {
      HOME: '/dashboard/ledger',
      BATCH: {
        NEW: '/dashboard/ledger/batch/new',
        VIEW: '/dashboard/ledger/batch/$batchId',
        ERRORS: '/dashboard/ledger/batch/$batchId/errors',
      },
    },
    VENDOR: {
      HOME: '/dashboard/vendor',
      BATCH: {
        NEW: '/dashboard/vendor/batch/new',
        VIEW: '/dashboard/vendor/batch/$batchId',
        ERRORS: '/dashboard/vendor/batch/$batchId/errors',
      },
    },
    SETTINGS: {
      HOME: '/dashboard/settings',
    },
  },
  AUTH: {
    LOGIN: '/login',
    FORGET_PW: '/forget-password',
  },
} as const;

type FlattenRoutes = FlattenObj<typeof ROUTES>;

export type TRoutes = FlattenRoutes | '..' | '.';
