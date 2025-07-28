import { AccountReceivable } from './account-receivable';
import { Auth } from './auth';
import { DataBatch } from './data-batch';
import { DataBatchError } from './data-batch-error';
import { Ledger } from './ledger';

export const services = {
  authService: Auth.getInstance(),
  accountReceivable: AccountReceivable.getInstance(),
  dataBatch: DataBatch.getInstance(),
  dataBatchError: DataBatchError.getInstance(),
  ledger: Ledger.getInstance(),
} as const;

export type TServices = typeof services;
