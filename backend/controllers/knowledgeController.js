import KnowledgeItem from '../models/KnowledgeItem.js';
import { initialKnowledgeItems } from '../utils/seeder.js';

// @desc    Get all Knowledge Center articles
// @route   GET /api/knowledge
export const getKnowledgeItems = async (req, res) => {
  try {
    const { category, search } = req.query;

    try {
      const query = {};
      if (category) query.category = category;
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
        ];
      }

      const items = await KnowledgeItem.find(query).sort({ createdAt: -1 });

      if (items.length === 0) {
        // Return seeded fallback articles if DB collection is empty
        return res.json({ success: true, count: initialKnowledgeItems.length, items: initialKnowledgeItems });
      }

      return res.json({ success: true, count: items.length, items });
    } catch (dbErr) {
      return res.json({ success: true, count: initialKnowledgeItems.length, items: initialKnowledgeItems });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single Knowledge Item by topic ID
// @route   GET /api/knowledge/:topicId
export const getKnowledgeByTopicId = async (req, res) => {
  try {
    const { topicId } = req.params;

    try {
      const item = await KnowledgeItem.findOne({ topicId });
      if (item) return res.json({ success: true, item });
    } catch (e) {
      // Fallback
    }

    const fallback = initialKnowledgeItems.find((k) => k.topicId === topicId);
    if (fallback) return res.json({ success: true, item: fallback });

    return res.status(404).json({ success: false, message: 'Knowledge article not found' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
