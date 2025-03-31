import express, { Request, Response } from 'express';
import AnnualTarget, { AnnualTargetDocument } from '../models/AnnualTarget';
import { authenticateToken } from '../middleware/auth';
import multer from 'multer';
import fs from 'fs';

const router = express.Router();

// Configure multer for file storage
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const uploadDir = 'public/uploads';
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    // Keep original filename but make it unique with timestamp
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  }
});

const upload = multer({ storage });

router.get('/annual-targets', authenticateToken, async (_req: Request, res: Response) => {
  try {
    const annualTargets = await AnnualTarget.find() as AnnualTargetDocument[];
    return res.json(annualTargets);
  } catch (error) {
    console.error('Annual targets error:', error);
    return res.status(500).json({ error: 'Failed to get annual targets' });
  }
});

router.post('/create-annual-target', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { annualTarget } = req.body;
    const existingAnnualTarget = await AnnualTarget.findOne({ name: annualTarget.name });
    if (existingAnnualTarget) {
      return res.status(400).json({ error: 'Annual target already exists' });
    }

    const newAnnualTarget = await AnnualTarget.create(annualTarget) as AnnualTargetDocument;
    return res.json(newAnnualTarget);
  } catch (error) {
    console.error('Create annual target error:', error);
    return res.status(500).json({ error: 'Failed to create annual target' });
  }
});

router.put('/update-annual-target/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { annualTarget } = req.body;

    const updatedAnnualTarget = await AnnualTarget.findByIdAndUpdate(id, annualTarget, { new: true });
    return res.json(updatedAnnualTarget);
  } catch (error) {
    console.error('Update annual target error:', error);
    return res.status(500).json({ error: 'Failed to update annual target' });
  }
});

router.delete('/delete-annual-target/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await AnnualTarget.findByIdAndDelete(id);
    return res.json({ message: 'Annual target deleted successfully' });
  } catch (error) {
    console.error('Delete annual target error:', error);
    return res.status(500).json({ error: 'Failed to delete annual target' });
  }
});

router.put('/update-quarterly-target/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { quarterlyTarget } = req.body;

    const updatedQuarterlyTarget = await AnnualTarget.findByIdAndUpdate(id, quarterlyTarget, { new: true });
    return res.json(updatedQuarterlyTarget);
  } catch (error) {
    console.error('Update quarterly target error:', error);
    return res.status(500).json({ error: 'Failed to update quarterly target' });
  }
});

router.post('/upload', authenticateToken, upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Return the URL for accessing the file
    const fileUrl = `/uploads/${req.file.filename}`;
    return res.json(fileUrl);

  } catch (error) {
    console.error('Upload file error:', error);
    return res.status(500).json({ error: 'Failed to upload file' });
  }
});

export default router; 