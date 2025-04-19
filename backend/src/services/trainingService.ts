import { Training, TrainingStatus } from '../models/Training';
import { Types } from 'mongoose';

class TrainingService {
  async create(name: string) {
    const training = new Training({
      name,
      status: TrainingStatus.REQUESTED,
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
}

export default new TrainingService(); 