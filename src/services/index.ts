import { AccountReceivable } from './api/account-receivable';
import { Auth } from './api/auth';
import { DataBatch } from './api/data-batch';
import { DataBatchError } from './api/data-batch-error';
import { Ledger } from './api/ledger';
import { AppSetting } from './api/app-setting';

export const services = {
  authService: Auth.getInstance(),
  accountReceivable: AccountReceivable.getInstance(),
  dataBatch: DataBatch.getInstance(),
  dataBatchError: DataBatchError.getInstance(),
  ledger: Ledger.getInstance(),
  appSetting: AppSetting.getInstance(),
} as const;

export type TServices = typeof services;
