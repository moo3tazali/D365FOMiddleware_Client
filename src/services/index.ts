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
import { Observability } from './api/observability';
import { Users } from './api/users';
import { AccessAdmin } from './api/access-admin';

export const authService = new Auth();
export const accountReceivable = new AccountReceivable();
export const dataBatch = new DataBatch();
export const dataBatchError = new DataBatchError();
export const ledger = new Ledger();
export const cashIn = new CashIn();
export const cashOut = new CashOut();
export const appSetting = new AppSetting();
export const pagination = new Pagination();
export const masterData = new MasterData();
export const vendor = new Vendor();
export const observability = new Observability();
export const users = new Users();
export const accessAdmin = new AccessAdmin();

export const services = {
  authService,
  accountReceivable,
  dataBatch,
  dataBatchError,
  ledger,
  cashIn,
  cashOut,
  appSetting,
  pagination,
  masterData,
  vendor,
  observability,
  users,
  accessAdmin,
} as const;

export type TServices = typeof services;
