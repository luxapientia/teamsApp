import { Router } from 'express';
import {
  getLicenses,
  createLicense,
  updateLicense,
  deleteLicense,
} from '../controllers/licenseController';

const router = Router();

router.get('/', getLicenses);
router.post('/', createLicense);
router.put('/:id', updateLicense);
router.delete('/:id', deleteLicense);

export default router; 