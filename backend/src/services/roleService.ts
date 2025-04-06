import { UserRole, dUser } from '../types/role';
import User from '../models/User';
import { ApiError } from '../utils/apiError';
import { SuperUserModel } from '../models/superUser';


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

    const existingUser = await User.findOne({ MicrosoftId });
    if (existingUser) {
      throw new ApiError('User already exists', 400);
    }

    // Validate tenant ID for Super User
    if (role === UserRole.SUPER_USER && !tenantId) {
      throw new ApiError('Tenant ID is required for Super User role', 400);
    }

    const user = await User.create({
      MicrosoftId,
      name,
      email,
      role,
      ...(tenantId && role === UserRole.SUPER_USER ? { tenantId } : {})
    });

    return user;
  }

  async updateUser(microsoftId: string, user: dUser): Promise<dUser> {
    const updatedUser = await User.findOneAndUpdate({ MicrosoftId: microsoftId }, user, { new: true });
    if (!updatedUser) {
      throw new ApiError('User not found', 404);
    }
    return updatedUser;
  }

  async getUser(MicrosoftId: string): Promise<dUser | null> {
    const user = await User.findOne({ MicrosoftId });
    if (!user) {
      return null;
    }
    return user;
  }

  async getUserByEmail(email: string): Promise<dUser | null> {
    const user = await User.findOne({ email });
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

    return User.find({ role });
  }

  async getAllUsersWithTenantID(tenantId: string): Promise<dUser[]> {

    return User.find({ tenantId });
  }

  async getRoleByEmail(email: string): Promise<UserRole | null> {
    console.log(process.env.APP_OWNER_EMAIL, 'process.env.APP_OWNER_EMAIL');
    if(email===process.env.APP_OWNER_EMAIL){
      return UserRole.APP_OWNER;
    }
    const superUser = await SuperUserModel.findOne({ email });
    if (superUser) {
      return UserRole.SUPER_USER;
    }
    const user = await User.findOne({ email });
    if (!user) {
      return null;
    } else {
      return UserRole.USER;
    }
  }
}

export const roleService = new RoleService(); 