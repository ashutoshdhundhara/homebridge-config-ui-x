import { ServiceType } from '@ashutoshdhundhara/hap-client';

export type ServiceTypeX = ServiceType & {
  customName?: string;
  hidden?: boolean;
  onDashboard?: boolean;
};
