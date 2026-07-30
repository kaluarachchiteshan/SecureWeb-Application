import mongoose from 'mongoose';

const knowledgeItemSchema = new mongoose.Schema(
  {
    topicId: {
      type: String,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: ['OWASP Top 10', 'Injection', 'Authentication', 'Security Architecture', 'Defensive Coding', 'General Security'],
    },
    description: {
      type: String,
      required: true,
    },
    severity: {
      type: String,
      enum: ['High', 'Critical', 'Medium', 'Informational'],
      default: 'High',
    },
    vulnerableSnippet: {
      type: String,
      default: '',
    },
    secureSnippet: {
      type: String,
      default: '',
    },
    preventionSteps: [{ type: String }],
    references: [{ type: String }],
  },
  { timestamps: true }
);

const KnowledgeItem = mongoose.models.KnowledgeItem || mongoose.model('KnowledgeItem', knowledgeItemSchema);
export default KnowledgeItem;
