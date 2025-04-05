import express, { Request, Response } from 'express';
import PersonalPerformance, { PersonalPerformanceDocument } from '../models/PersonalPerformance';
import { authenticateToken } from '../middleware/auth';
// import multer from 'multer';
// import fs from 'fs';

const router = express.Router();

// // Configure multer for file storage
// const storage = multer.diskStorage({
//   destination: (_req, _file, cb) => {
//     const uploadDir = 'public/uploads';
//     // Create directory if it doesn't exist
//     if (!fs.existsSync(uploadDir)) {
//       fs.mkdirSync(uploadDir, { recursive: true });
//     }
//     cb(null, uploadDir);
//   },
//   filename: (_req, file, cb) => {
//     // Keep original filename but make it unique with timestamp
//     const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
//     cb(null, `${uniqueSuffix}-${file.originalname}`);
//   }
// });

// const upload = multer({ storage });

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
            isAgreementDraft: true,
            isAssessmentDraft: true,
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

// router.delete('/delete-annual-target/:id', authenticateToken, async (req: Request, res: Response) => {
//   try {
//     const { id } = req.params;
//     await AnnualTarget.findByIdAndDelete(id);
//     return res.json({ message: 'Annual target deleted successfully' });
//   } catch (error) {
//     console.error('Delete annual target error:', error);
//     return res.status(500).json({ error: 'Failed to delete annual target' });
//   }
// });

// router.put('/update-quarterly-target/:id', authenticateToken, async (req: Request, res: Response) => {
//   try {
//     const { id } = req.params;
//     const { quarterlyTarget } = req.body;

//     const updatedQuarterlyTarget = await AnnualTarget.findByIdAndUpdate(id, quarterlyTarget, { new: true });
//     return res.json(updatedQuarterlyTarget);
//   } catch (error) {
//     console.error('Update quarterly target error:', error);
//     return res.status(500).json({ error: 'Failed to update quarterly target' });
//   }
// });

// router.post('/upload', authenticateToken, upload.single('file'), async (req: Request, res: Response) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ error: 'No file uploaded' });
//     }

//     // Return the URL for accessing the file
//     const fileUrl = `/uploads/${req.file.filename}`;
//     return res.json(fileUrl);

//   } catch (error) {
//     console.error('Upload file error:', error);
//     return res.status(500).json({ error: 'Failed to upload file' });
//   }
// });

export default router; 