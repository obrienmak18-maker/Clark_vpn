import { Router } from 'express';
import { getActiveServers, getAllServers, createServer, updateServerStatus } from '../controllers/servers';
import { authenticateToken, requireAdmin } from '../middlewares/authMiddleware';

const router = Router();

// Public / User routes
router.get('/active', authenticateToken, getActiveServers);

// Admin routes
router.get('/', authenticateToken, requireAdmin, getAllServers);
router.post('/', authenticateToken, requireAdmin, createServer);
router.patch('/:id/status', authenticateToken, requireAdmin, updateServerStatus);

export default router;
