import mongoose from 'mongoose';

const alertSchema = new mongoose.Schema(
  {
    websiteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Website',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    alertType: {
      type: String,
      required: true,
      enum: ['Expired SSL certificate', 'Missing security headers', 'Website downtime', 'High-risk vulnerabilities', 'Server info exposure', 'General'],
    },
    severity: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'resolved', 'dismissed'],
      default: 'active',
    },
  },
  { timestamps: true }
);

const Alert = mongoose.models.Alert || mongoose.model('Alert', alertSchema);
export default Alert;
