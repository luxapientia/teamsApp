import { ObjectId } from 'mongodb';

export enum UserRole {
  APP_OWNER = 'AppOwner',
  SUPER_USER = 'SuperUser',
  USER = 'User'
}

export interface dUser {
  _id?: string;
  MicrosoftId: string; // Microsoft ID
  name: string;
  email: string;
  role: UserRole;
  tenantId?: string;
  teamId?: ObjectId;
  jobTitle?: string;
  isDevMember?: boolean;
  isPerformanceCalibrationMember?: boolean;
  status?: 'active' | 'inactive';
}
