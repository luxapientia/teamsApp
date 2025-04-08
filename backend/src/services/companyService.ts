import { Company } from '../types';
import { CompanyModel } from '../models/company';
import { licenseService } from './licenseService';

export class CompanyService {
  async getAll(): Promise<Company[]> {
    return CompanyModel.find().sort({ createdOn: -1 });
  }

  async findByTenantId(tenantId: string): Promise<Company | null> {
    return CompanyModel.findOne({ tenantId });
  }

  async isTenantIdUnique(tenantId: string, excludeCompanyId?: string): Promise<boolean> {
    const query: any = { tenantId };
    
    // If updating an existing company, exclude it from the uniqueness check
    if (excludeCompanyId) {
      query._id = { $ne: excludeCompanyId };
    }
    
    const existingCompany = await CompanyModel.findOne(query);
    return !existingCompany;
  }

  async create(data: Omit<Company, '_id' | '__v'>): Promise<Company> {
    const company = await new CompanyModel(data).save();
    // Create blank license for the new company
    await licenseService.createBlankLicense(company._id.toString());
    return company;
  }

  async update(id: string, data: Partial<Omit<Company, '_id' | '__v'>>): Promise<Company | null> {
    const company = await CompanyModel.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true }
    );
    if (company) {
      // Ensure license exists and is up to date
      await licenseService.handleCompanyUpdate(company._id.toString());
    }
    return company;
  }

  async delete(id: string): Promise<void> {
    await CompanyModel.findByIdAndDelete(id);
    // Delete associated license
    await licenseService.handleCompanyDelete(id);
  }

  async getById(id: string): Promise<Company | null> {
    return CompanyModel.findById(id);
  }
}

export const companyService = new CompanyService(); 