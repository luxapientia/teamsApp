import express, { Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import { AuthenticatedRequest } from '../middleware/auth';
import Module, { ModuleDocument } from '../models/Module';
const router = express.Router();

// Get all companies
router.get('/feedback-companies', authenticateToken, async (_req: AuthenticatedRequest, res: Response) => {
    try {
        let modules = await Module.findOne({ moduleName: 'Feedback' }) as ModuleDocument;
        if (!modules) {
            modules = new Module({ moduleName: 'Feedback', companies: [] });
            await modules.save();
        }
        return res.json({
            data: modules?.companies,
            status: 200,
            message: 'Modules retrieved successfully'
        });
    } catch (error) {
        return res.status(500).json({
            data: [],
            status: 500,
            message: 'Failed to fetch modules'
        });
    }
});

router.post('/update-feedback-companies', authenticateToken, async (_req: AuthenticatedRequest, res: Response) => {
    try {
        const feedbackCompanies = _req.body.feedbackCompanies;
        const module = await Module.findOne({ moduleName: 'Feedback' }) as ModuleDocument;
        if (!module) {
            return res.status(404).json({
                status: 404,
                message: 'Module not found'
            });
        }
        module.companies = feedbackCompanies;
        await module.save();
        return res.json({
            status: 200,
            message: 'Company added to module successfully'
        });
    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: 'Failed to add company to module'
        });
    }
});

export default router; 