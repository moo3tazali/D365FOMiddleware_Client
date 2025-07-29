export interface D365FOSetting {
  id: string;
  creationDate: string;
  createdBy: string | null;
  lastModifiedDate: string | null;
  lastModifiedBy: string | null;
  notes: string | null;
  logicalName: string;
  displayName: string;
  value: string | null;
  hasAction: boolean;
}
