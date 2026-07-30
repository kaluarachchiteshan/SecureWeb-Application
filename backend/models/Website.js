import mongoose from 'mongoose';

const websiteSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    websiteName: {
      type: String,
      required: [true, 'Website name is required'],
      trim: true,
    },
    websiteURL: {
      type: String,
      required: [true, 'Website URL is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    lastScannedAt: {
      type: Date,
      default: null,
    },
    lastSecurityScore: {
      type: Number,
      default: null,
    },
    lastRiskLevel: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical', null],
      default: null,
    },
  },
  { timestamps: true }
);

const Website = mongoose.models.Website || mongoose.model('Website', websiteSchema);
export default Website;
