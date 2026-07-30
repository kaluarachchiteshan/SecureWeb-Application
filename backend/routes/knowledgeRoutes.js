import express from 'express';
import { getKnowledgeItems, getKnowledgeByTopicId } from '../controllers/knowledgeController.js';

const router = express.Router();

router.get('/', getKnowledgeItems);
router.get('/:topicId', getKnowledgeByTopicId);

export default router;
