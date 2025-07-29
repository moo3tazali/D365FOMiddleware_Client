import { queryOptions } from '@tanstack/react-query';

import { API_ROUTES } from '../core/api-routes';
import { Sync } from '../core/sync';
import type { D365FOSetting } from '@/interfaces/d365fo-setting';

interface AppSettingUpdatePayload {
  id: string;
  logicalName: string;
  newValue?: string;
}

export class AppSetting {
  private static _instance: AppSetting;
  private readonly syncService = Sync.getInstance();

  public readonly queryKey = 'admin.app-setting';

  private constructor() {}

  public static getInstance(): AppSetting {
    if (!AppSetting._instance) {
      AppSetting._instance = new AppSetting();
    }

    return AppSetting._instance;
  }

  public list = async (): Promise<D365FOSetting[]> => {
    return this.syncService.fetch<D365FOSetting[]>(
      API_ROUTES.ADMIN.APP_SETTING
    );
  };

  public update = async (payload: AppSettingUpdatePayload): Promise<void> => {
    await this.syncService.save(API_ROUTES.ADMIN.APP_SETTING, payload);
  };

  public queryOptions = () => {
    return queryOptions({
      queryKey: [this.queryKey],
      queryFn: this.list,
    });
  };
}
