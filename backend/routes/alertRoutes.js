import express from 'express';
import { getAlerts, updateAlertStatus, deleteAlert } from '../controllers/alertController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getAlerts);
router.put('/:id/status', updateAlertStatus);
router.delete('/:id', deleteAlert);

export default router;
