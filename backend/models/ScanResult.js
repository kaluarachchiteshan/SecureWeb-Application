import mongoose from 'mongoose';

const vulnerabilitySchema = new mongoose.Schema({
  name: { type: String, required: true },
  severity: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], required: true },
  description: { type: String, required: true },
  recommendation: { type: String, required: true },
});

const scanResultSchema = new mongoose.Schema(
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
    securityScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    riskLevel: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      required: true,
    },
    httpsEnabled: {
      type: Boolean,
      default: false,
    },
    sslDetails: {
      valid: { type: Boolean, default: false },
      daysRemaining: { type: Number, default: 0 },
      issuer: { type: String, default: 'Unknown' },
      validTo: { type: String, default: '' },
    },
    headerAudit: {
      csp: { type: Boolean, default: false },
      xFrameOptions: { type: Boolean, default: false },
      xContentTypeOptions: { type: Boolean, default: false },
      hsts: { type: Boolean, default: false },
      referrerPolicy: { type: Boolean, default: false },
      serverExposure: { type: String, default: 'None' },
    },
    dnsAudit: {
      hasSpf: { type: Boolean, default: false },
      spfRecord: { type: String, default: '' },
      hasDmarc: { type: Boolean, default: false },
      dmarcRecord: { type: String, default: '' },
      mxRecords: [{ type: String }],
    },
    portAudit: {
      scannedPortsCount: { type: Number, default: 0 },
      openPorts: [
        {
          port: { type: Number },
          service: { type: String },
          risk: { type: String },
        },
      ],
    },
    vulnerabilities: [vulnerabilitySchema],
    scanDate: {
      type: Date,
      default: Date.now,
    },
    responseTimeMs: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const ScanResult = mongoose.models.ScanResult || mongoose.model('ScanResult', scanResultSchema);
export default ScanResult;
