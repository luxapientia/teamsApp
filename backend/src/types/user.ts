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
  tenantId?: string; // Optional, used for SUPER_USER role
  teamId?: ObjectId; // Optional, used for SUPER_USER role
}