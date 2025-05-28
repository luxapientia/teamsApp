import express, { Response } from 'express';
import Obligation from '../models/Obligation';
import { AuthenticatedRequest } from '../types/user';
import { authenticateToken } from '../middleware/auth';
import multer from 'multer';
import path from 'path';
import fs from 'fs';


const router = express.Router();

// Configure multer for file storage
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const uploadDir = path.join(__dirname, '../../public/uploads');
    console.log('Upload directory:', uploadDir);

    try {
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
        console.log('Created upload directory');
      }
      cb(null, uploadDir);
    } catch (error) {
      console.error('Error creating upload directory:', error);
      cb(error as Error, uploadDir);
    }
  },
  filename: (_req, file, cb) => {
    // Keep original filename but make it unique with timestamp
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const filename = `${uniqueSuffix}-${file.originalname}`;
    console.log('Generated filename:', filename);
    cb(null, filename);
  }
});

const upload = multer({ storage });

// Get all obligations for the tenant
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const obligations = await Obligation.find({ tenantId: req.user?.tenantId })
      .populate('complianceArea')
      .populate('owner');
    return res.json({ data: obligations });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching obligations' });
  }
});

// Create a new obligation
router.post('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { complianceObligation, complianceArea, frequency, lastDueDate, owner, riskLevel, status } = req.body;
    const obligation = new Obligation({
      complianceObligation,
      complianceArea,
      frequency,
      lastDueDate,
      owner,
      riskLevel,
      status: status || 'Active',
      tenantId: req.user?.tenantId
    });
    await obligation.save();
    const populatedObligation = await Obligation.findById(obligation._id)
      .populate('complianceArea')
      .populate('owner');
    return res.status(201).json({ data: populatedObligation });
  } catch (error) {
    return res.status(400).json({ message: 'Error creating obligation' });
  }
});

// Update an obligation
router.put('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { complianceObligation, complianceArea, frequency, lastDueDate, owner, riskLevel, status } = req.body;
    const obligation = await Obligation.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.user?.tenantId },
      {
        complianceObligation,
        complianceArea,
        frequency,
        lastDueDate,
        owner,
        riskLevel,
        status
      },
      { new: true }
    ).populate('complianceArea').populate('owner');

    if (!obligation) {
      return res.status(404).json({ message: 'Obligation not found' });
    }
    return res.json({ data: obligation });
  } catch (error) {
    return res.status(400).json({ message: 'Error updating obligation' });
  }
});

// Update an obligation
router.put('/:id/update', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { complianceStatus, comments, attachments } = req.body;
    console.log(attachments, 'attachments')
    const obligation = await Obligation.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.user?.tenantId },
      {
        complianceStatus,
        comments,
        attachments: attachments // <-- Fix: Use the entire attachments array
      },
      { new: true }
    ).populate('complianceArea').populate('owner');

    if (!obligation) {
      return res.status(404).json({ message: 'Obligation not found' });
    }
    return res.json({ data: obligation });
  } catch (error) {
    return res.status(400).json({ message: 'Error updating obligation' });
  }
});

// Delete an obligation
router.delete('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const obligation = await Obligation.findOneAndDelete({
      _id: req.params.id,
      tenantId: req.user?.tenantId
    });
    if (!obligation) {
      return res.status(404).json({ message: 'Obligation not found' });
    }
    return res.json({ message: 'Obligation deleted successfully' });
  } catch (error) {
    return res.status(400).json({ message: 'Error deleting obligation' });
  }
});

router.post('/upload', authenticateToken, upload.single('file'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Return the URL for accessing the file
    const fileUrl = `/uploads/${req.file.filename}`;
    return res.json(fileUrl);

  } catch (error) {
    console.error('Upload file error:', error);
    return res.status(500).json({
      error: 'Failed to upload file',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.delete('/delete-file', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { fileUrl } = req.body;
    const filePath = path.join(__dirname, '../../public/', fileUrl);
    fs.unlinkSync(filePath);
    return res.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Delete file error:', error);
    return res.status(500).json({ error: 'Failed to delete file' });
  }
});

export default router; 