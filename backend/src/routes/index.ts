import { Router } from 'express';
import superUserRoutes from './superUserRoutes';
import companyRoutes from './companyRoutes';
import licenseRoutes from './licenseRoutes';

const router = Router();

router.use('/super-users', superUserRoutes);
router.use('/companies', companyRoutes);
router.use('/licenses', licenseRoutes);

export default router; 