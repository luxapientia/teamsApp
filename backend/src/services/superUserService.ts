import { SuperUser } from '../types';
import { SuperUserModel } from '../models/superUser';
import User from '../models/User';
import { UserRole } from '../types/user';

export class SuperUserService {
  async getAll(): Promise<SuperUser[]> {
    return SuperUserModel.find()
      .populate('companyId', 'name')
      .sort({ firstName: 1, lastName: 1 });
  }

  async create(data: Omit<SuperUser, '_id' | '__v'>): Promise<SuperUser> {
    const superUser = new SuperUserModel(data);
    const savedSuperUser = await superUser.save();
    
    // Find and update corresponding user in User collection if exists
    await this.syncUserRole(data.email, UserRole.SUPER_USER);
    
    return savedSuperUser.populate('companyId', 'name');
  }

  async update(id: string, data: Partial<Omit<SuperUser, '_id' | '__v'>>): Promise<SuperUser | null> {
    const superUser = await SuperUserModel.findById(id);
    
    // If email is changing, update the role for both old and new email
    if (data.email && superUser && data.email !== superUser.email) {
      // Find user with old email and update role if no longer in super users
      const oldEmailStillExists = await SuperUserModel.findOne({ 
        email: superUser.email, 
        _id: { $ne: id } 
      });
      
      if (!oldEmailStillExists) {
        await this.syncUserRole(superUser.email, UserRole.USER);
      }
      
      // Update role for new email
      await this.syncUserRole(data.email, UserRole.SUPER_USER);
    } else if (superUser) {
      // Just make sure the role is set correctly for the current email
      await this.syncUserRole(superUser.email, UserRole.SUPER_USER);
    }
    
    return SuperUserModel.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true }
    ).populate('companyId', 'name');
  }

  async delete(id: string): Promise<void> {
    const superUser = await SuperUserModel.findById(id);
    
    if (superUser) {
      // Check if this is the only SuperUser record with this email
      const otherSuperUserRecords = await SuperUserModel.findOne({ 
        email: superUser.email, 
        _id: { $ne: id } 
      });
      
      // If no other records exist with this email, downgrade the role to USER
      if (!otherSuperUserRecords) {
        await this.syncUserRole(superUser.email, UserRole.USER);
      }
    }
    
    await SuperUserModel.findByIdAndDelete(id);
  }

  async getById(id: string): Promise<SuperUser | null> {
    return SuperUserModel.findById(id).populate('companyId', 'name');
  }

  async getByEmail(email: string): Promise<SuperUser | null> {
    return SuperUserModel.findOne({ email }).populate('companyId', 'name');
  }
  
  // Helper method to sync user roles
  private async syncUserRole(email: string, role: UserRole): Promise<void> {
    // Find user with the given email and update their role
    const user = await User.findOne({ email });
    
    if (user) {
      console.log(`Updating user ${email} to role ${role}`);
      await User.findByIdAndUpdate(user._id, { role });
    }
  }
}

export const superUserService = new SuperUserService(); 