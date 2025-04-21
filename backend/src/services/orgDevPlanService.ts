import { Types } from 'mongoose';
import OrgDevPlan from '../models/OrgDevPlan';
import { Training, TrainingStatus } from '../models/Training';

export interface IOrgDevPlan {
  _id?: string;
  name: string;
  tenantId: string;
  trainings: ITraining[];
}

export interface ITraining {
  _id?: string;
  UserName: string;
  JobTitle: string;
  Team: string;
  CourseName: string;
  RequestedDate: Date;
  Status: TrainingStatus;
}

export class OrgDevPlanService {
  async getAllPlans(tenantId: string): Promise<IOrgDevPlan[]> {
    const plans = await OrgDevPlan.find({ tenantId }).lean().sort({ createdAt: -1 });
    return plans as unknown as IOrgDevPlan[];
  }

  async createPlan(name: string, tenantId: string): Promise<IOrgDevPlan> {
    const plan = new OrgDevPlan({
      name,
      tenantId,
      trainings: []
    });
    const savedPlan = await plan.save();
    return savedPlan.toObject() as unknown as IOrgDevPlan;
  }

  async deletePlan(planId: string): Promise<IOrgDevPlan | null> {
    const plan = await OrgDevPlan.findByIdAndDelete(planId);
    return plan as unknown as IOrgDevPlan | null;
  }

  async getPlanById(planId: string): Promise<IOrgDevPlan | null> {
    const plan = await OrgDevPlan.findById(planId).populate('trainings').lean();
    return plan as unknown as IOrgDevPlan | null;
  }

  async getRequestedTrainings(): Promise<ITraining[]> {
    const trainings = await Training.find({ Status: TrainingStatus.REQUESTED })
      .lean()
      .sort({ RequestedDate: -1 });
    return trainings as unknown as ITraining[];
  }

  async addTrainingsToPlan(planId: string, trainingIds: string[]): Promise<IOrgDevPlan | null> {
    const plan = await OrgDevPlan.findById(planId);
    if (!plan) {
      throw new Error('Plan not found');
    }

    await Training.updateMany(
      { _id: { $in: trainingIds } },
      { $set: { planId: new Types.ObjectId(planId) } }
    );

    const updatedPlan = await OrgDevPlan.findById(planId).populate('trainings').lean();
    return updatedPlan as unknown as IOrgDevPlan | null;
  }

  async updateTrainingStatus(
    planId: string,
    trainingId: string,
    status: TrainingStatus
  ): Promise<ITraining | null> {
    const training = await Training.findOneAndUpdate(
      { _id: trainingId, planId },
      { $set: { Status: status } },
      { new: true }
    ).lean();

    if (!training) {
      throw new Error('Training not found or not associated with this plan');
    }

    return training as unknown as ITraining;
  }

  async updatePlan(planId: string, name: string): Promise<IOrgDevPlan | null> {
    const updatedPlan = await OrgDevPlan.findByIdAndUpdate(
      planId,
      { $set: { name } },
      { new: true }
    ).lean();
    return updatedPlan as unknown as IOrgDevPlan | null;
  }
} 