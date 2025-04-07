import express, { Response } from 'express';
import PersonalPerformance, { PersonalPerformanceDocument, AgreementStatus, AssessmentStatus } from '../models/PersonalPerformance';
import { AuthenticatedRequest, authenticateToken } from '../middleware/auth';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import User from '../models/User';

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

router.get('/company-users', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const companyUsers = await User.find({ tenantId: req.user?.tenantId, _id: { $ne: req.user?._id } })
    return res.json(companyUsers.map(user => ({ id: user._id, name: user.name })));
  } catch (error) {
    console.error('Company users error:', error);
    return res.status(500).json({ error: 'Failed to get company users' });
  }
});


router.get('/personal-performance', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId, annualTargetId } = req.query;
    const personalPerformance = await PersonalPerformance.findOne({ userId, annualTargetId }) as PersonalPerformanceDocument;
    return res.json(personalPerformance);
  } catch (error) {
    console.error('Personal performance error:', error);
    return res.status(500).json({ error: 'Failed to get personal performance' });
  }
});

router.get('/personal-performances', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const annualTargetId = req.query.annualTargetId as string;
    const quarter = req.query.quarter as string;
    const personalPerformances = await PersonalPerformance.find({ annualTargetId, userId: req.user?._id }) as PersonalPerformanceDocument[];

    if(personalPerformances.length === 0) {
      const newPersonalPerformance = await PersonalPerformance.create({
        annualTargetId,
        quarter,
        userId: req.user?._id,
        teamId: annualTargetId,
        tenantId: req.user?.tenantId,
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

router.get('/team-performances', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { annualTargetId } = req.query;
    const allPersonalPerformances = await PersonalPerformance.find({ annualTargetId, tenantId: req.user?.tenantId }).populate('userId') as any[];
    const isTeamOwner = true;

    const teamPerformances: any[] = [];
    allPersonalPerformances.forEach(performance => {
      if(performance.quarterlyTargets[0].supervisorId === req.user?._id) {
        teamPerformances.push({...performance._doc, fullName: performance.userId.name, position: 'position', team: 'team'});
      } else {
        if(isTeamOwner) {
          teamPerformances.push({...performance._doc, fullName: performance.userId.name, position: 'position', team: 'team'});
        }
      }
    });

    return res.json(teamPerformances);
  } catch (error) {
    console.error('Team performances error:', error);
    return res.status(500).json({ error: 'Failed to get team performances' });
  }
});

router.put('/update-personal-performance/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
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

router.post('/upload', authenticateToken, upload.single('file'), async (req: AuthenticatedRequest, res: Response) => {
  console.log(req.file, '-------------------------');
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