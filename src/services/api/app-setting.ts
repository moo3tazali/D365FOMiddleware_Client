import { queryOptions } from '@tanstack/react-query';

import { API_ROUTES } from '../core/api-routes';
import { Sync } from '../core/sync';
import type { D365FOSetting } from '@/interfaces/d365fo-setting';

interface AppSettingUpdatePayload {
  logicalName: string;
  value?: string;
}

export class AppSetting {
  private static _instance: AppSetting;
  private readonly syncService = Sync.getInstance();

  public readonly queryKey = ['admin.app-setting'];

  private constructor() {}

  public static getInstance(): AppSetting {
    if (!AppSetting._instance) {
      AppSetting._instance = new AppSetting();
    }

    return AppSetting._instance;
  }

  public list = async (): Promise<D365FOSetting[]> => {
    return this.syncService
      .fetch<{ settings: D365FOSetting[] }>(API_ROUTES.ADMIN.APP_SETTING.LIST)
      .then((res) => res.settings.slice().sort((a, b) => a.order - b.order));
  };

  public one = async (logicalName: string): Promise<D365FOSetting> => {
    return this.syncService.fetch<D365FOSetting>(
      API_ROUTES.ADMIN.APP_SETTING.ONE,
      {
        params: { logicalName },
      }
    );
  };

  public update = async ({
    logicalName,
    value,
  }: AppSettingUpdatePayload): Promise<D365FOSetting> => {
    return this.syncService.save<
      D365FOSetting,
      Pick<AppSettingUpdatePayload, 'value'>
    >(
      API_ROUTES.ADMIN.APP_SETTING.Update,
      { value },
      {
        saveMethod: 'put',
        params: { logicalName },
      }
    );
  };

  public listQueryOptions = () => {
    return queryOptions({
      queryKey: this.queryKey,
      queryFn: this.list,
    });
  };

  public oneQueryOptions = (logicalName: string) => {
    return queryOptions({
      queryKey: [...this.queryKey, { logicalName }],
      queryFn: () => this.one(logicalName),
    });
  };
}
