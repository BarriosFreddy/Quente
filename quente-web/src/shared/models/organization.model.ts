export interface Organization {
  _id?: string;
  uid: string;
  name: string;
  nit: string;
  address: string;
  city: string;
  country: string;
  phoneNumber: string;
  logoLink?: string;
  status: OrganizationStatus;
  createdAt?: {
    date: number;
    offset: number;
  };
  updatedAt?: {
    date: number;
    offset: number;
  };
  modifiedBy?: string;
}

export enum OrganizationStatus {
  CREATING = 'CREATING',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE'
}

export interface OrganizationState {
  organizations: Organization[];
  selectedOrganization: Organization | null;
  loading: boolean;
  error: string | null;
}
