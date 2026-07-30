import express from 'express';
import {
  triggerScan,
  getScanHistory,
  getLatestScan,
  getDashboardMetrics,
} from '../controllers/scanController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/run', triggerScan);
router.get('/metrics', getDashboardMetrics);
router.get('/history/:websiteId', getScanHistory);
router.get('/latest/:websiteId', getLatestScan);

export default router;
