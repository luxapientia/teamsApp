import express, { Request, Response } from 'express';
import PersonalPerformance, { PersonalPerformanceDocument, AgreementStatus, AssessmentStatus } from '../models/PersonalPerformance';
import { authenticateToken } from '../middleware/auth';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
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

router.get('/personal-performance', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    console.log(userId);
    const personalPerformance = await PersonalPerformance.findOne({  }) as PersonalPerformanceDocument;
    return res.json(personalPerformance);
  } catch (error) {
    console.error('Personal performance error:', error);
    return res.status(500).json({ error: 'Failed to get personal performance' });
  }
});

router.get('/personal-performances', authenticateToken, async (_req: Request, res: Response) => {
  try {
    const annualTargetId = _req.query.annualTargetId as string;
    const quarter = _req.query.quarter as string;
    const personalPerformances = await PersonalPerformance.find({ annualTargetId }) as PersonalPerformanceDocument[];

    if(personalPerformances.length === 0) {
      const newPersonalPerformance = await PersonalPerformance.create({
        annualTargetId,
        quarter,
        userId: annualTargetId,
        quarterlyTargets: ['Q1', 'Q2', 'Q3', 'Q4'].map(quarter => {
          return {
            quarter,
            agreementStatus: AgreementStatus.Draft,
            assessmentStatus: AssessmentStatus.Draft,
            isEditable: quarter === 'Q1' ? true : false,
            supervisorId: '',
            objectives: []
          }
        })
      }) as PersonalPerformanceDocument;
      personalPerformances.push(newPersonalPerformance);
    }

    return res.json(personalPerformances);
  } catch (error) {
    console.error('Annual targets error:', error);
    return res.status(500).json({ error: 'Failed to get annual targets' });
  }
});

router.get('/team-performances', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { annualTargetId } = req.query;
    const teamPerformances = await PersonalPerformance.find({ annualTargetId }) as PersonalPerformanceDocument[];
    return res.json(teamPerformances);
  } catch (error) {
    console.error('Team performances error:', error);
    return res.status(500).json({ error: 'Failed to get team performances' });
  }
});

router.put('/update-personal-performance/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { personalPerformance } = req.body;

    const updatedPersonalPerformance = await PersonalPerformance.findByIdAndUpdate(id, personalPerformance, { new: true });
    return res.json(updatedPersonalPerformance);
  } catch (error) {
    console.error('Update personal performance error:', error);
    return res.status(500).json({ error: 'Failed to update personal performance' });
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
    return res.status(500).json({ 
      error: 'Failed to upload file',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.delete('/delete-file', authenticateToken, async (req: Request, res: Response) => {
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