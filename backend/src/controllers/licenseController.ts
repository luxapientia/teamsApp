import { Request, Response } from 'express';
import License from '../models/License';

export const getLicenses = async (req: Request, res: Response) => {
  try {
    const licenses = await License.find().populate('companyId', 'name');
    res.json(licenses);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching licenses', error });
  }
};

export const createLicense = async (req: Request, res: Response) => {
  try {
    const license = new License(req.body);
    await license.save();
    res.status(201).json(license);
  } catch (error) {
    res.status(400).json({ message: 'Error creating license', error });
  }
};

export const updateLicense = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const license = await License.findByIdAndUpdate(id, req.body, { new: true });
    if (!license) {
      return res.status(404).json({ message: 'License not found' });
    }
    res.json(license);
  } catch (error) {
    res.status(400).json({ message: 'Error updating license', error });
  }
};

export const deleteLicense = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const license = await License.findByIdAndDelete(id);
    if (!license) {
      return res.status(404).json({ message: 'License not found' });
    }
    res.json({ message: 'License deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Error deleting license', error });
  }
}; 