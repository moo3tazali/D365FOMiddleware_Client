import { sync } from '@/services/core/sync';
import { API_ROUTES } from '@/services/core/api-routes';
import type { TUser } from '@/interfaces/user';

export class Users {
  me(): Promise<TUser> {
    return sync.fetch<TUser>(API_ROUTES.PUBLIC.USER.ME);
  }

  updateProfile(input: {
    firstName?: string;
    lastName?: string;
    avatarPath?: string;
  }): Promise<TUser> {
    return sync.save<TUser, typeof input>(API_ROUTES.PUBLIC.USER.ME, input, {
      saveMethod: 'patch',
    });
  }

  changePassword(input: {
    currentPassword: string;
    newPassword: string;
  }): Promise<void> {
    return sync.save<void, typeof input>(
      API_ROUTES.PUBLIC.USER.CHANGE_PASSWORD,
      input,
    );
  }
}
