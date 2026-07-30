import express from 'express';
import { registerUser, loginUser, getUserProfile, resetPassword, generateApiKey, revokeApiKey } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/reset-password', resetPassword);
router.get('/profile', protect, getUserProfile);
router.post('/api-key', protect, generateApiKey);
router.delete('/api-key', protect, revokeApiKey);

export default router;
