export interface D365FOSetting {
  id: string;
  displayName: string;
  logicalName: string;
  value?: string;
  groupName?: string;
  hasAction: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}
