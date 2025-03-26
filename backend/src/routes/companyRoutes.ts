import { Router } from 'express';
import {
  getCompanies,
  createCompany,
  updateCompany,
  deleteCompany,
} from '../controllers/companyController';

const router = Router();

router.get('/', getCompanies);
router.post('/', createCompany);
router.put('/:id', updateCompany);
router.delete('/:id', deleteCompany);

export default router; 