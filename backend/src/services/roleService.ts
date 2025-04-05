import { UserRole, UserRoleAssignment } from '../types/role';
import { UserRoleModel } from '../models/role';
import { ApiError } from '../utils/apiError';

type UserStatus = 'active' | 'inactive';

export class RoleService {
  async createUserRole(
    userId: string,
    email: string,
    role: UserRole,
    companyId?: string
  ): Promise<UserRoleAssignment> {
    // Validate role
    if (!Object.values(UserRole).includes(role)) {
      throw new ApiError('Invalid role', 400);
    }

    // Check if user already has a role
    const existingRole = await UserRoleModel.findOne({ userId });
    if (existingRole) {
      throw new ApiError('User already has a role assigned', 400);
    }

    // Validate company ID for Super User
    if (role === UserRole.SUPER_USER && !companyId) {
      throw new ApiError('Company ID is required for Super User role', 400);
    }

    // Create new role assignment
    const roleAssignment = await UserRoleModel.create({
      userId,
      email,
      role,
      status: 'active' as UserStatus,
      ...(companyId && role === UserRole.SUPER_USER ? { companyId } : {})
    });

    return roleAssignment;
  }

  async getUserRole(userId: string): Promise<UserRole | null> {
    const userRole = await UserRoleModel.findOne({ userId });
    if (!userRole) {
      return null;
    }
    return userRole.role;
  }

  async getUserRoleByEmail(email: string): Promise<UserRole | null> {
    const userRole = await UserRoleModel.findOne({ email });
    if (!userRole) {
      return null;
    }
    return userRole.role;
  }

  async updateUserStatus(
    userId: string, 
    status: UserStatus
  ): Promise<UserRoleAssignment> {
    // Validate status
    if (!['active', 'inactive'].includes(status)) {
      throw new ApiError('Invalid status value', 400);
    }

    const userRole = await UserRoleModel.findOneAndUpdate(
      { userId },
      { status },
      { new: true }
    );

    if (!userRole) {
      throw new ApiError('User role not found', 404);
    }

    return userRole;
  }

  async getAllUsersWithRole(role: UserRole): Promise<UserRoleAssignment[]> {
    // Validate role
    if (!Object.values(UserRole).includes(role)) {
      throw new ApiError('Invalid role', 400);
    }

    return UserRoleModel.find({ role }).populate('companyId', 'name');
  }

  async validateRoleAssignment(
    assignerRole: UserRole,
    targetRole: UserRole
  ): Promise<boolean> {
    // Validate roles
    if (!Object.values(UserRole).includes(assignerRole) || 
        !Object.values(UserRole).includes(targetRole)) {
      throw new ApiError('Invalid role value', 400);
    }

    // APP_OWNER can assign any role
    if (assignerRole === UserRole.APP_OWNER) {
      return true;
    }

    // SUPER_USER can only assign USER role
    if (assignerRole === UserRole.SUPER_USER && targetRole === UserRole.USER) {
      return true;
    }

    // All other combinations are invalid
    return false;
  }
}

export const roleService = new RoleService(); 