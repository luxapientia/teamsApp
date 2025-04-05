export enum UserRole {
  APP_OWNER = 'AppOwner',
  SUPER_USER = 'SuperUser',
  USER = 'User'
}

export interface UserRoleAssignment {
  _id?: string;
  userId: string;
  email: string;
  role: UserRole;
  status: 'active' | 'inactive';
  companyId?: string; // Optional, used for SUPER_USER role
}

export interface RoleChangeLog {
  _id?: string;
  userId: string;
  oldRole?: UserRole;
  newRole: UserRole;
  changedBy: string;
  changedAt: Date;
  reason?: string;
} 