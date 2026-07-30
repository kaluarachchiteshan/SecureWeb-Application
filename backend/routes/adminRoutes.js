import express from 'express';
import {
  getAdminAnalytics,
  getAllUsers,
  updateUserRole,
  deleteUser,
  getAllWebsitesAdmin,
} from '../controllers/adminController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect, adminOnly);

router.get('/analytics', getAdminAnalytics);
router.get('/users', getAllUsers);
router.put('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);
router.get('/websites', getAllWebsitesAdmin);

export default router;
