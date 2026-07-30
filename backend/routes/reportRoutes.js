import express from 'express';
import { downloadPdfReport, downloadCsvReport } from '../controllers/reportController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/pdf/:websiteId', downloadPdfReport);
router.get('/csv/:websiteId', downloadCsvReport);

export default router;
