import Website from '../models/Website.js';
import ScanResult from '../models/ScanResult.js';
import Alert from '../models/Alert.js';
import { runSecurityScan } from './scanner.js';

/**
 * Background Scheduler Service
 * Periodically checks monitored websites and triggers automatic security scans
 */
export const startScheduler = () => {
  console.log('⏰ SECUREWEB BACKGROUND SCAN SCHEDULER INITIALIZED');

  // Check every 30 minutes
  const INTERVAL_MS = 30 * 60 * 1000;

  const runScheduledScanTask = async () => {
    try {
      const websites = await Website.find();
      const now = Date.now();

      for (const site of websites) {
        let intervalMs = 24 * 60 * 60 * 1000; // Daily default
        if (site.scanInterval === 'weekly') intervalMs = 7 * 24 * 60 * 60 * 1000;
        if (site.scanInterval === 'monthly') intervalMs = 30 * 24 * 60 * 60 * 1000;

        const lastScan = site.lastScannedAt ? new Date(site.lastScannedAt).getTime() : 0;

        if (now - lastScan >= intervalMs) {
          console.log(`🔍 [Scheduler] Running background security scan for ${site.websiteURL}`);
          try {
            const scanData = await runSecurityScan(site.websiteURL);

            await ScanResult.create({
              websiteId: site._id,
              userId: site.userId,
              ...scanData,
            });

            site.lastScannedAt = scanData.scanDate;
            site.lastSecurityScore = scanData.securityScore;
            site.lastRiskLevel = scanData.riskLevel;
            await site.save();

            // Auto alert on critical findings
            if (scanData.riskLevel === 'Critical' || scanData.riskLevel === 'High') {
              await Alert.create({
                websiteId: site._id,
                userId: site.userId,
                alertType: 'Automated scan elevated risk',
                severity: scanData.riskLevel,
                title: `Automated Scheduled Audit: ${scanData.riskLevel} Risk on ${site.websiteName}`,
                message: `Automated background scan found security issues lowering score to ${scanData.securityScore}/100.`,
              });
            }
          } catch (err) {
            console.error(`❌ [Scheduler] Scan failed for ${site.websiteURL}:`, err.message);
          }
        }
      }
    } catch (dbErr) {
      // Ignore background DB connection errors
    }
  };

  // Run initial check after 10s server startup
  setTimeout(runScheduledScanTask, 10000);

  // Set recurring interval
  setInterval(runScheduledScanTask, INTERVAL_MS);
};
