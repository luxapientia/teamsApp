import { SuperUser } from '../types';
import { SuperUserModel } from '../models/superUser';

export class SuperUserService {
  async getAll(): Promise<SuperUser[]> {
    return SuperUserModel.find()
      .populate('companyId', 'name')
      .sort({ firstName: 1, lastName: 1 });
  }

  async create(data: Omit<SuperUser, '_id' | '__v'>): Promise<SuperUser> {
    const superUser = new SuperUserModel(data);
    return (await superUser.save()).populate('companyId', 'name');
  }

  async update(id: string, data: Partial<Omit<SuperUser, '_id' | '__v'>>): Promise<SuperUser | null> {
    return SuperUserModel.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true }
    ).populate('companyId', 'name');
  }

  async delete(id: string): Promise<void> {
    await SuperUserModel.findByIdAndDelete(id);
  }

  async getById(id: string): Promise<SuperUser | null> {
    return SuperUserModel.findById(id).populate('companyId', 'name');
  }

  async getByEmail(email: string): Promise<SuperUser | null> {
    return SuperUserModel.findOne({ email }).populate('companyId', 'name');
  }
}

export const superUserService = new SuperUserService(); 