import { Types } from 'mongoose';
import { Training, ITraining } from '../models/Training';
import OrgDevPlan from '../models/OrgDevPlan';
import { IOrgDevPlan } from '../models/OrgDevPlan';

export enum TrainingStatus {
  PLANNED = 'Planned',
  COMPLETED = 'Completed'
}

export class TrainingService {
  async create(name: string) {
    const training = new Training({
      name,
      status: TrainingStatus.PLANNED,
      requestedDate: new Date()
    });
    return await training.save();
  }

  async getAll() {
    return await Training.find().sort({ createdAt: -1 });
  }

  async getById(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error('Invalid training ID');
    }
    return await Training.findById(id);
  }

  async update(id: string, updates: Partial<{
    name: string;
    status: TrainingStatus;
    planId: Types.ObjectId | null;
    plannedDate: Date | null;
    completedDate: Date | null;
  }>) {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error('Invalid training ID');
    }

    // Update status-related dates
    if (updates.status) {
      switch (updates.status) {
        case TrainingStatus.PLANNED:
          updates.plannedDate = new Date();
          break;
        case TrainingStatus.COMPLETED:
          updates.completedDate = new Date();
          break;
      }
    }

    return await Training.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true }
    );
  }

  async delete(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error('Invalid training ID');
    }
    return await Training.findByIdAndDelete(id);
  }

  async getByPlanId(planId: string) {
    if (!Types.ObjectId.isValid(planId)) {
      throw new Error('Invalid plan ID');
    }
    return await Training.find({ planId: new Types.ObjectId(planId) });
  }

  async getByStatus(status: TrainingStatus) {
    return await Training.find({ status }).sort({ createdAt: -1 });
  }

  async getTrainingsByPlanId(planId: string): Promise<ITraining[]> {
    return Training.find({ planId: new Types.ObjectId(planId) });
  }

  async addEmployeesToPlan(
    planId: string,
    employees: Array<{
      userId: string;
      displayName: string;
      email: string;
      jobTitle?: string;
      team?: string;
      trainingRequested?: string;
      description?: string;
      status?: TrainingStatus;
      dateRequested: Date;
      annualTargetId: string;
      quarter: string;
    }>
  ): Promise<ITraining[]> {
    const trainings = employees.map(employee => ({
      planId: new Types.ObjectId(planId),
      userId: employee.userId,
      displayName: employee.displayName,
      email: employee.email,
      jobTitle: employee.jobTitle,
      team: employee.team,
      trainingRequested: employee.trainingRequested || '',
      description: employee.description || '',
      status: employee.status || TrainingStatus.PLANNED,
      dateRequested: employee.dateRequested,
      annualTargetId: new Types.ObjectId(employee.annualTargetId),
      quarter: employee.quarter
    }));

    const docs = await Training.insertMany(trainings);
    return docs.map(doc => doc.toObject());
  }

  async removeEmployeeFromPlan(
    planId: string, 
    email: string,
    trainingRequested: string,
    annualTargetId: string,
    quarter: string
  ): Promise<boolean> {
    const result = await Training.deleteOne({
      planId: new Types.ObjectId(planId),
      email,
      trainingRequested,
      annualTargetId: new Types.ObjectId(annualTargetId),
      quarter
    });
    return result.deletedCount > 0;
  }

  async updateTrainingStatus(
    planId: string,
    email: string,
    trainingRequested: string,
    annualTargetId: string,
    quarter: string,
    status: TrainingStatus
  ): Promise<ITraining | null> {
    return Training.findOneAndUpdate(
      { 
        planId: new Types.ObjectId(planId), 
        email,
        trainingRequested,
        annualTargetId: new Types.ObjectId(annualTargetId),
        quarter
      },
      { $set: { status } },
      { new: true }
    );
  }

  async updateTrainingRequest(
    planId: string,
    email: string,
    trainingRequested: string
  ): Promise<ITraining | null> {
    return Training.findOneAndUpdate(
      { planId: new Types.ObjectId(planId), email },
      { trainingRequested },
      { new: true }
    );
  }

  async getTrainingsByUserId(userId: string): Promise<ITraining[]> {
    return Training.find({ userId }).sort({ createdAt: -1 });
  }

  async getTrainingsByEmail(email: string): Promise<ITraining[]> {
    return Training.find({ email }).sort({ createdAt: -1 });
  }

  async getTrainingsByAnnualTarget(annualTargetId: string): Promise<ITraining[]> {
    if (!Types.ObjectId.isValid(annualTargetId)) {
      throw new Error('Invalid annual target ID');
    }
    return Training.find({ annualTargetId: new Types.ObjectId(annualTargetId) }).sort({ createdAt: -1 });
  }

  async getTrainingsByQuarter(annualTargetId: string, quarter: string): Promise<ITraining[]> {
    if (!Types.ObjectId.isValid(annualTargetId)) {
      throw new Error('Invalid annual target ID');
    }
    return Training.find({
      annualTargetId: new Types.ObjectId(annualTargetId),
      quarter
    }).sort({ createdAt: -1 });
  }

  async getAllEmployeesAcrossPlans(tenantId: string) {
    try {
      // First get all plans for this tenant
      const plans = await OrgDevPlan.find({ tenantId });
      const planIds = plans.map((plan: IOrgDevPlan) => plan._id);
      
      // Then get all trainings for these plans
      const allTrainings = await Training.find({
        planId: { $in: planIds }
      }).select('userId displayName email jobTitle team trainingRequested dateRequested status description annualTargetId quarter planId')
        .sort({ dateRequested: -1 })
        .lean();

      return allTrainings;
    } catch (error) {
      console.error('Error in getAllEmployeesAcrossPlans:', error);
      throw error;
    }
  }
} 