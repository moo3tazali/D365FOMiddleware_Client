import { AccountReceivable } from './api/account-receivable';
import { Auth } from './api/auth';
import { DataBatch } from './api/data-batch';
import { DataBatchError } from './api/data-batch-error';
import { Ledger } from './api/ledger';
import { AppSetting } from './api/app-setting';
import { Pagination } from './core/pagination';
import { MasterData } from './api/master-data';
import { Vendor } from './api/vendor';
import { CashIn } from './api/cash-in';
import { CashOut } from './api/cash-out';

export const services = {
  authService: Auth.getInstance(),
  accountReceivable: AccountReceivable.getInstance(),
  dataBatch: DataBatch.getInstance(),
  dataBatchError: DataBatchError.getInstance(),
  ledger: Ledger.getInstance(),
  cashIn: CashIn.getInstance(),
  cashOut: CashOut.getInstance(),
  appSetting: AppSetting.getInstance(),
  pagination: Pagination.getInstance(),
  masterData: MasterData.getInstance(),
  vendor: Vendor.getInstance(),
} as const;

export type TServices = typeof services;
