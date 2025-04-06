import { UserRole, dUser } from '../types/role';
import { UserModel } from '../models/role';
import { ApiError } from '../utils/apiError';


export class RoleService {
  async createUser(
    MicrosoftId: string,
    name: string,
    email: string,
    role: UserRole,
    tenantId?: string
  ): Promise<dUser> {
    // Validate role
    if (!Object.values(UserRole).includes(role)) {
      throw new ApiError('Invalid role', 400);
    }

    const existingUser = await UserModel.findOne({ MicrosoftId });
    if (existingUser) {
      throw new ApiError('User already exists', 400);
    }

    // Validate tenant ID for Super User
    if (role === UserRole.SUPER_USER && !tenantId) {
      throw new ApiError('Tenant ID is required for Super User role', 400);
    }

    const user = await UserModel.create({
      MicrosoftId,
      name,
      email,
      role,
      ...(tenantId && role === UserRole.SUPER_USER ? { tenantId } : {})
    });

    return user;
  }

  async updateUser(microsoftId: string, user: dUser): Promise<dUser> {
    const updatedUser = await UserModel.findOneAndUpdate({ MicrosoftId: microsoftId }, user, { new: true });
    if (!updatedUser) {
      throw new ApiError('User not found', 404);
    }
    return updatedUser;
  }

  async getUser(MicrosoftId: string): Promise<dUser | null> {
    const user = await UserModel.findOne({ MicrosoftId });
    if (!user) {
      return null;
    }
    return user;
  }

  async getUserByEmail(email: string): Promise<dUser | null> {
    const user = await UserModel.findOne({ email });
    if (!user) {
      return null;
    }
    return user;
  }

  async getAllUsersWithRole(role: UserRole): Promise<dUser[]> {
    // Validate role
    if (!Object.values(UserRole).includes(role)) {
      throw new ApiError('Invalid role', 400);
    }

    return UserModel.find({ role });
  }

  async getAllUsersWithTenantID(tenantId: string): Promise<dUser[]> {

    return UserModel.find({ tenantId });
  }
}

export const roleService = new RoleService(); 