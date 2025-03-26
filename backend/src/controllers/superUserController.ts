import { Request, Response } from 'express';
import mongoose from 'mongoose';
import SuperUser from '../models/SuperUser';

export const getSuperUsers = async (req: Request, res: Response) => {
  try {
    const superUsers = await SuperUser.find().populate('companyId', 'name');
    res.json(superUsers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching super users', error });
  }
};

export const createSuperUser = async (req: Request, res: Response) => {
  try {
    // Convert companyId string to ObjectId
    const companyId = new mongoose.Types.ObjectId(req.body.companyId);
    const superUser = new SuperUser({
      ...req.body,
      companyId
    });
    await superUser.save();
    res.status(201).json(superUser);
  } catch (error) {
    console.error('Error creating super user:', error);
    res.status(400).json({ message: 'Error creating super user', error });
  }
};

export const updateSuperUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    // Convert companyId string to ObjectId if it exists in the request body
    if (req.body.companyId) {
      req.body.companyId = new mongoose.Types.ObjectId(req.body.companyId);
    }
    const superUser = await SuperUser.findByIdAndUpdate(id, req.body, { new: true });
    if (!superUser) {
      return res.status(404).json({ message: 'Super user not found' });
    }
    res.json(superUser);
  } catch (error) {
    console.error('Error updating super user:', error);
    res.status(400).json({ message: 'Error updating super user', error });
  }
};

export const deleteSuperUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const superUser = await SuperUser.findByIdAndDelete(id);
    if (!superUser) {
      return res.status(404).json({ message: 'Super user not found' });
    }
    res.json({ message: 'Super user deleted successfully' });
  } catch (error) {
    console.error('Error deleting super user:', error);
    res.status(400).json({ message: 'Error deleting super user', error });
  }
}; 