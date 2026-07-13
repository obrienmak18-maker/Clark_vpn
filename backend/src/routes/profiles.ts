import { Router } from 'express';
import { getUserProfiles, createProfile, updateProfile, deleteProfile } from '../controllers/profiles';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = Router();

router.use(authenticateToken); // Protect all profile routes

router.get('/', getUserProfiles);
router.post('/', createProfile);
router.put('/:id', updateProfile);
router.delete('/:id', deleteProfile);

export default router;
