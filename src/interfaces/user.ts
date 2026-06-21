export interface TUser {
  id: string;
  username: string;
  email: string;
  avatarPath: string;
  role?: 'ADMIN' | 'OPS';
  identityProvider: 'LOCAL' | 'ENTRA';
  accessStatus?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'REVOKED';
  mustChangePassword: boolean;
  firstName?: string;
  lastName?: string;
}
