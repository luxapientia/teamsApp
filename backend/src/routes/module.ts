import express, { Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import { AuthenticatedRequest } from '../middleware/auth';
import Module, { ModuleDocument } from '../models/Module';
const router = express.Router();

// Get all companies for a module
router.get('/:moduleName/companies', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { moduleName } = req.params;
        let module = await Module.findOne({ moduleName }) as ModuleDocument;
        if (!module) {
            module = new Module({ moduleName, companies: [] });
            await module.save();
        }
        return res.json({
            data: module.companies,
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

// Update companies for a module
router.post('/:moduleName/companies', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { moduleName } = req.params;
        const { companies } = req.body;
        console.log(moduleName, 'moduleName');
        console.log(companies, 'companies');
        const module = await Module.findOne({ moduleName }) as ModuleDocument;
        if (!module) {
            return res.status(404).json({
                status: 404,
                message: 'Module not found'
            });
        }
        module.companies = companies;
        await module.save();
        return res.json({
            status: 200,
            message: 'Companies updated for module successfully'
        });
    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: 'Failed to update companies for module'
        });
    }
});

// Check if module is enabled for company
router.get('/:moduleName/is-enabled', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { moduleName } = req.params;
        const tenantId = req.user?.tenantId;
        const module = await Module.findOne({ moduleName }).populate('companies') as ModuleDocument;
        if (!module) {
            return res.status(404).json({
                status: 404,
                message: 'Module not found'
            });
        }
        const isEnabled = module.companies.some((company: any) => company.tenantId === tenantId);
        return res.json({
            status: 200,
            message: 'Module enabled for company',
            isEnabled
        });
    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: 'Failed to check if module is enabled for company'
        });
    }
});

// Get all modules (not just companies)
router.get('/', async (_req, res) => {
    try {
        const modules = await Module.find({ enabled: true }, { _id: 0, description: 1 });
        return res.json({
            status: 200,
            data: modules,
            message: 'Modules retrieved successfully'
        });
    } catch (error) {
        return res.status(500).json({
            status: 500,
            data: [],
            message: 'Failed to fetch modules'
        });
    }
});

export default router; 