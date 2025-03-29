import express from 'express';
import { authService } from '../services/authService';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.get('/login', (req, res) => authService.login(req, res));
router.get('/callback', (req, res) => authService.callback(req, res));
router.get('/profile', authenticateToken, (req, res) => authService.getProfile(req, res));
router.post('/logout', authenticateToken, (req, res) => authService.logout(req, res));

export default router; 