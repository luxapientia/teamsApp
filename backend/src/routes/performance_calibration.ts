import express from 'express';
import { authenticateToken } from '../middleware/auth';
import User from '../models/User';
import { ApiError } from '../utils/apiError';

const router = express.Router();

router.get('/get-all-members/:tenantId', authenticateToken, async (req, res, next) => {
    try {
        const { tenantId } = req.params;
        console.log('tenantId', tenantId);

        if (!tenantId) {
            throw new ApiError('Tenant ID is required', 400);
        }

        const calibrationMembers = await User.find({
            tenantId,
            isPerformanceCalibrationMember: true
        }).select('MicrosoftId name email jobTitle');

        return res.json({
            status: 'success',
            data: calibrationMembers
        });
    } catch (error) {
        return next(error);
    }
});

router.post('/add-member', authenticateToken, async (req, res, next) => {
    try {
        const { userIds } = req.body;

        if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
            throw new ApiError('User IDs array is required', 400);
        }

        await User.updateMany(
            { MicrosoftId: { $in: userIds } },
            { $set: { isPerformanceCalibrationMember: true } }
        );

        return res.json({
            status: 'success',
            message: 'Members added to performance calibration team successfully'
        });
    } catch (error) {
        return next(error);
    }
});

router.delete('/remove-member/:userId', authenticateToken, async (req, res, next) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            throw new ApiError('User ID is required', 400);
        }

        await User.findOneAndUpdate(
            { MicrosoftId: userId },
            { $set: { isPerformanceCalibrationMember: false } }
        );

        return res.json({
            status: 'success',
            message: 'Member removed from performance calibration team successfully'
        });
    } catch (error) {
        return next(error);
    }
});

export default router;
