import express, { Response } from 'express';
import PersonalPerformance, { PersonalPerformanceDocument, AgreementStatus, AssessmentStatus } from '../models/PersonalPerformance';
import { AuthenticatedRequest, authenticateToken } from '../middleware/auth';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import User from '../models/User';
import AnnualTarget from '../models/AnnualTarget';
import { ApiError } from '../utils/apiError';
import { graphService } from '../services/graphService';

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
    const companyUsers = await User.find({ tenantId: req.user?.tenantId, _id: { $ne: req.user?._id } }).populate('teamId') as any[];
    return res.json(companyUsers.map((user: any) => ({ id: user._id, name: user.name, team: user.teamId?.name, position: user?.jobTitle })));
  } catch (error) {
    console.error('Company users error:', error);
    return res.status(500).json({ error: 'Failed to get company users' });
  }
});

router.get('/manage-performance-agreement/company-users', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { annualTargetId, quarter } = req.query;
    const personalPerformances = await PersonalPerformance.find({ tenantId: req.user?.tenantId, annualTargetId, quarterlyTargets: { $elemMatch: { quarter, agreementStatus: 'Approved' } } }).populate('userId').populate('teamId') as any[];
    const users = personalPerformances.map((performance: any) => {
      return {
        id: performance.userId._id,
        name: performance.userId.name,
        team: performance.teamId?.name,
        position: performance.userId?.jobTitle
      }
    });
    return res.json(users);
  } catch (error) {
    console.error('Company users error:', error);
    return res.status(500).json({ error: 'Failed to get company users' });
  }
});

router.get('/manage-performance-assessment/company-users', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { annualTargetId, quarter } = req.query;
    const personalPerformances = await PersonalPerformance.find({ tenantId: req.user?.tenantId, annualTargetId, quarterlyTargets: { $elemMatch: { quarter, assessmentStatus: 'Approved' } } }).populate('userId').populate('teamId') as any[];
    const users = personalPerformances.map((performance: any) => {
      return {
        id: performance.userId._id,
        name: performance.userId.name,
        team: performance.teamId?.name,
        position: performance.userId?.jobTitle
      }
    });
    return res.json(users);
  } catch (error) {
    console.error('Company users error:', error);
    return res.status(500).json({ error: 'Failed to get company users' });
  }
});

router.get('/company-users-all', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const companyUsers = await User.find({ tenantId: req.user?.tenantId }).populate('teamId') as any[];
    return res.json(companyUsers.map((user: any) => ({ id: user._id, name: user.name, team: user.teamId?.name, position: user?.jobTitle })));
  } catch (error) {
    console.error('Company users error:', error);
    return res.status(500).json({ error: 'Failed to get company users' });
  }
});

router.post('/send-back', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { emailSubject, emailBody, supervisorId, userId, manageType, performanceId, quarter } = req.body;

    const personalPerformance = await PersonalPerformance.findOne({ _id: performanceId });
    if (personalPerformance) {
      const quarterlyTargets = personalPerformance.quarterlyTargets;
      const newQuarterlyTargets = quarterlyTargets.map((quarterlyTarget: any) => {
        if (quarterlyTarget.quarter === quarter) {
          if (manageType === 'Agreement') {
            return {
              ...quarterlyTarget._doc,
              agreementStatus: 'Send Back'
            };
          } else {
            return {
              ...quarterlyTarget._doc,
              assessmentStatus: 'Send Back'
            };
          }
        }
        return quarterlyTarget;
      });
      await PersonalPerformance.updateOne(
        { _id: performanceId },
        { $set: { quarterlyTargets: newQuarterlyTargets } }
      );

      const userEmail = (await User.findById(userId))?.email;
      const supervisorEmail = (await User.findById(supervisorId))?.email;
      if (!userEmail) {
        return res.status(404).json({ error: 'Sender email not found' });
      }
      if(!supervisorEmail) {
        return res.status(404).json({ error: 'Supervisor email not found' });
      }
      // Send email notification using the provided subject
      const emailContent = `
        <html>
          <body>
            <h2>Performance ${manageType} Update</h2>
            <p>Your ${manageType} has been sent back for revision.</p>
            <p>Here goes the reason:</p>
            <p>${emailBody}</p>
            <p>Please log in to the system to review and make the necessary changes.</p>
          </body>
        </html>
      `;

      // Use the current user's ID (req.user.MicrosoftId) to send the email
      await graphService.sendMail(
        req.user?.tenantId || '',
        req.user?.MicrosoftId || '',
        supervisorEmail,
        emailSubject,
        emailContent
      );

      // Use the current user's ID (req.user.MicrosoftId) to send the email
      await graphService.sendMail(
        req.user?.tenantId || '',
        req.user?.MicrosoftId || '',
        userEmail,
        emailSubject,
        emailContent
      );

      // Use the current user's ID (req.user.MicrosoftId) to send the email
      await graphService.sendMail(
        req.user?.tenantId || '',
        req.user?.MicrosoftId || '',
        req.user?.email || '',
        emailSubject,
        emailContent
      );
    }
    
    return res.status(200).json({ message: 'email sent back successfully' });
  } catch (error) {
    console.error('Send back error:', error);
    return res.status(500).json({ error: 'Failed to send back' });
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
        teamId: req.user?.teamId || annualTargetId,
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
    const allPersonalPerformances = await PersonalPerformance.find({ annualTargetId, tenantId: req.user?.tenantId }).populate('userId').populate('teamId') as any[];
    const isTeamOwner = true;

    console.log('allPersonalPerformances', allPersonalPerformances);

    const teamPerformances: any[] = [];
    allPersonalPerformances.forEach(performance => {
      if(performance.quarterlyTargets[0].supervisorId === req.user?._id) {
        teamPerformances.push({...performance._doc, fullName: performance.userId.name, jobTitle: performance.userId.jobTitle, team: performance.teamId?.name});
      } else {
        if(isTeamOwner) {
          teamPerformances.push({...performance._doc, fullName: performance.userId.name, jobTitle: performance.userId.jobTitle, team: performance.teamId?.name});
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

router.post('/copy-initiatives', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { sourceScorecardId, targetPerformanceId } = req.body;

    // Find the source scorecard
    const sourceScorecard = await AnnualTarget.findById(sourceScorecardId);
    if (!sourceScorecard) {
      throw new ApiError('Source scorecard not found', 404);
    }
    // Find the target personal performance
    const targetPerformance = await PersonalPerformance.findById(targetPerformanceId);
    if (!targetPerformance) {
      throw new ApiError('Target performance not found', 404);
    }

    // Get Q1 objectives from source scorecard
    const q1Objectives = sourceScorecard.content.objectives.map(obj => ({
      perspectiveId: obj.perspectiveId,
      name: obj.name,
      initiativeName: obj.name, // Using objective name as initiative name by default
      KPIs: obj.KPIs.map(kpi => ({
        indicator: kpi.indicator,
        weight: kpi.weight,
        baseline: kpi.baseline,
        target: kpi.target,
        ratingScales: kpi.ratingScales,
        ratingScore: -1,
        actualAchieved: '',
        evidence: '',
        attachments: []
      }))
    }));
    // Update all quarters with the same objectives
    const updatedQuarterlyTargets = targetPerformance.quarterlyTargets.map(target => {
      // Create a deep copy of q1Objectives to avoid reference issues
      const objectives = JSON.parse(JSON.stringify(q1Objectives));
      
      return {
        quarter: target.quarter,
        agreementStatus: target.quarter === 'Q1' ? AgreementStatus.Draft : target.agreementStatus,
        assessmentStatus: target.assessmentStatus,
        isEditable: target.quarter === 'Q1' ? true : false,
        supervisorId: target.supervisorId || '',
        objectives: objectives  // Use the deep copied objectives
      };
    });

    // Update the personal performance document with proper MongoDB update operators
    const updatedPerformance = await PersonalPerformance.findByIdAndUpdate(
      targetPerformanceId,
      { 
        $set: { 
          quarterlyTargets: updatedQuarterlyTargets
        }
      },
      { 
        new: true,
        runValidators: true
      }
    );

    if (!updatedPerformance) {
      throw new ApiError('Failed to update performance', 500);
    }

    return res.json(updatedPerformance);

  } catch (error) {
    console.error('Copy initiatives error:', error);
    if (error instanceof ApiError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Failed to copy initiatives' });
  }
});

export default router; 