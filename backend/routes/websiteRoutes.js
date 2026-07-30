import express from 'express';
import {
  getWebsites,
  getWebsiteById,
  addWebsite,
  updateWebsite,
  deleteWebsite,
  getWebsiteBadge,
} from '../controllers/websiteController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public SVG Badge Endpoint
router.get('/:id/badge.svg', getWebsiteBadge);

// Protected Operations
router.use(protect);

router.route('/')
  .get(getWebsites)
  .post(addWebsite);

router.route('/:id')
  .get(getWebsiteById)
  .put(updateWebsite)
  .delete(deleteWebsite);

export default router;
