import { Router } from 'express';
import {
  getSuperUsers,
  createSuperUser,
  updateSuperUser,
  deleteSuperUser,
} from '../controllers/superUserController';

const router = Router();

router.get('/', getSuperUsers);
router.post('/', createSuperUser);
router.put('/:id', updateSuperUser);
router.delete('/:id', deleteSuperUser);

export default router; 