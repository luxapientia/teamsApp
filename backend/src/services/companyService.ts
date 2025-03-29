import { Company } from '../types';
import { CompanyModel } from '../models/company';

export class CompanyService {
  async getAll(): Promise<Company[]> {
    return CompanyModel.find().sort({ createdOn: -1 });
  }

  async create(data: Omit<Company, '_id' | '__v'>): Promise<Company> {
    const company = new CompanyModel(data);
    return company.save();
  }

  async update(id: string, data: Partial<Omit<Company, '_id' | '__v'>>): Promise<Company | null> {
    return CompanyModel.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true }
    );
  }

  async delete(id: string): Promise<void> {
    await CompanyModel.findByIdAndDelete(id);
  }

  async getById(id: string): Promise<Company | null> {
    return CompanyModel.findById(id);
  }
}

export const companyService = new CompanyService(); 