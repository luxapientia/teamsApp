import express, { Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import { checkLicenseStatus } from '../middleware/licenseCheck';
import { AuthenticatedRequest } from '../types/user';
import User from '../models/User';

const router = express.Router();

router.get('/tenant', authenticateToken, checkLicenseStatus, async (_req: AuthenticatedRequest, res: Response) => {
    try {
        const complianceUsers = await User.find({ isComplianceUser: true, tenantId: _req.user?.tenantId });
        res.json(complianceUsers);
    } catch (error) {
        console.error('Error fetching compliance users:', error);
        res.status(500).json({ error: 'Failed to fetch compliance users' });
    }
});

router.post('/tenant', authenticateToken, checkLicenseStatus, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { email } = req.body;
        const complianceUser = await User.findOneAndUpdate({ email, tenantId: req.user?.tenantId }, { isComplianceUser: true });
        res.json(complianceUser);
    } catch (error) {
        console.error('Error fetching compliance users:', error);
        res.status(500).json({ error: 'Failed to fetch compliance users' });
    }
});

router.delete('/tenant/by-email/:email', authenticateToken, checkLicenseStatus, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { email } = req.params;
        const complianceUser = await User.findOneAndUpdate({ email, tenantId: req.user?.tenantId }, { isComplianceUser: false });
        res.json(complianceUser);
    } catch (error) {
        console.error('Error deleting compliance user:', error);
        res.status(500).json({ error: 'Failed to delete compliance user' });
    }
});

export default router;
