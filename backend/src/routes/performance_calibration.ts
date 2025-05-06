import express from 'express';
import { authenticateToken } from '../middleware/auth';
import User from '../models/User';
import { ApiError } from '../utils/apiError';
import PersonalPerformance from '../models/PersonalPerformance';
import { AgreementReviewStatus } from '../models/PersonalPerformance';

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

router.post('/pm-committee-action', authenticateToken, async (req, res, next) => {
    try {
        const { performanceId, quarter, action } = req.body;

        if (!performanceId || !quarter || !action) {
            throw new ApiError('Performance ID, quarter, and action are required', 400);
        }

        let newStatus;
        if (action === 'accept') {
            newStatus = AgreementReviewStatus.Reviewed;
        } else if (action === 'unaccept') {
            newStatus = AgreementReviewStatus.NotReviewed;
        } else if (action === 'sendBack') {
            newStatus = AgreementReviewStatus.SendBack;
        } else {
            throw new ApiError('Invalid action', 400);
        }

        const result = await PersonalPerformance.updateOne(
            { _id: performanceId, "quarterlyTargets.quarter": quarter },
            { $set: { "quarterlyTargets.$.agreementReviewStatus": newStatus } }
        );

        if (result.modifiedCount === 0) {
            throw new ApiError('Performance or quarter not found', 404);
        }

        return res.json({
            status: 'success',
            message: `Agreement ${action}ed successfully`
        });
    } catch (error) {
        return next(error);
    }
});

export default router;
