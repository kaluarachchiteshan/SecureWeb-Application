import https from 'https';
import http from 'http';
import tls from 'tls';
import dns from 'dns';
import net from 'net';
import { URL } from 'url';

/**
 * Target network ports probed for security risk.
 */
const TARGET_PORTS = [
  { port: 21, service: 'FTP', risk: 'High' },
  { port: 22, service: 'SSH', risk: 'Medium' },
  { port: 80, service: 'HTTP', risk: 'Low' },
  { port: 443, service: 'HTTPS', risk: 'Low' },
  { port: 3306, service: 'MySQL Database', risk: 'Critical' },
  { port: 5432, service: 'PostgreSQL Database', risk: 'Critical' },
  { port: 27017, service: 'MongoDB Database', risk: 'Critical' },
  { port: 6379, service: 'Redis Cache', risk: 'High' },
  { port: 8080, service: 'Dev Web Server', risk: 'Medium' },
  { port: 8443, service: 'Dev HTTPS Server', risk: 'Medium' },
];

/**
 * Performs a comprehensive security audit of a website URL.
 * Checks HTTPS, TLS Certificate, Security Headers, Server Exposure, DNS/Email Security, and Port Exposure.
 */
export const runSecurityScan = async (targetUrl) => {
  const startTime = Date.now();
  let normalizedUrlStr = targetUrl.trim();
  
  if (!normalizedUrlStr.startsWith('http://') && !normalizedUrlStr.startsWith('https://')) {
    normalizedUrlStr = 'https://' + normalizedUrlStr;
  }

  let parsedUrl;
  try {
    parsedUrl = new URL(normalizedUrlStr);
  } catch (err) {
    throw new Error('Invalid URL format provided for scan');
  }

  const hostname = parsedUrl.hostname;
  const isHttps = parsedUrl.protocol === 'https:';

  let httpsEnabled = false;
  let sslDetails = {
    valid: false,
    daysRemaining: 0,
    issuer: 'N/A',
    validTo: 'N/A',
  };
  let headerAudit = {
    csp: false,
    xFrameOptions: false,
    xContentTypeOptions: false,
    hsts: false,
    referrerPolicy: false,
    serverExposure: 'None',
  };
  const vulnerabilities = [];

  // 1. SSL/TLS Certificate Audit
  if (isHttps) {
    try {
      const certInfo = await getSSLCertificateInfo(hostname, parsedUrl.port || 443);
      httpsEnabled = true;
      sslDetails = certInfo;

      if (!sslDetails.valid) {
        vulnerabilities.push({
          name: 'Invalid or Expired SSL Certificate',
          severity: 'Critical',
          description: 'The SSL/TLS certificate for this domain is expired, self-signed, or untrusted by public browsers.',
          recommendation: 'Renew or replace your SSL certificate using a trusted Certificate Authority (e.g. Let\'s Encrypt, Digicert).',
        });
      } else if (sslDetails.daysRemaining < 15) {
        vulnerabilities.push({
          name: 'SSL Certificate Expiring Soon',
          severity: 'High',
          description: `The SSL certificate expires in ${sslDetails.daysRemaining} days.`,
          recommendation: 'Initiate SSL certificate renewal before expiration to avoid website downtime and browser security warnings.',
        });
      }
    } catch (sslErr) {
      httpsEnabled = false;
      sslDetails = { valid: false, daysRemaining: 0, issuer: 'Failed to inspect', validTo: 'N/A' };
      vulnerabilities.push({
        name: 'HTTPS Connection Failed',
        severity: 'Critical',
        description: `Failed to establish a secure SSL/TLS connection to ${hostname}: ${sslErr.message}`,
        recommendation: 'Ensure HTTPS is properly configured on your web server port 443 with a valid certificate.',
      });
    }
  } else {
    vulnerabilities.push({
      name: 'Unencrypted HTTP Protocol Used',
      severity: 'Critical',
      description: 'The website is accessible over unencrypted HTTP, leaving data vulnerable to man-in-the-middle (MITM) attacks and eavesdropping.',
      recommendation: 'Enforce HTTPS for all web traffic and redirect all HTTP traffic to HTTPS.',
    });
  }

  // 2. HTTP Security Headers Audit
  try {
    const headers = await fetchHttpHeaders(normalizedUrlStr);
    
    // Check HSTS
    if (headers['strict-transport-security']) {
      headerAudit.hsts = true;
    } else {
      vulnerabilities.push({
        name: 'Missing HSTS (HTTP Strict Transport Security) Header',
        severity: 'High',
        description: 'The Strict-Transport-Security header is not present. Browsers may load the site over insecure HTTP.',
        recommendation: 'Add "Strict-Transport-Security: max-age=31536000; includeSubDomains; preload" to your web server configuration.',
      });
    }

    // Check Content-Security-Policy (CSP)
    if (headers['content-security-policy'] || headers['content-security-policy-report-only']) {
      headerAudit.csp = true;
    } else {
      vulnerabilities.push({
        name: 'Missing Content-Security-Policy (CSP) Header',
        severity: 'High',
        description: 'No Content-Security-Policy header detected. Your site is at higher risk for Cross-Site Scripting (XSS) and data injection attacks.',
        recommendation: 'Define a robust Content-Security-Policy header restricting valid sources of executable scripts, frames, and assets.',
      });
    }

    // Check X-Frame-Options
    if (headers['x-frame-options']) {
      headerAudit.xFrameOptions = true;
    } else {
      vulnerabilities.push({
        name: 'Missing X-Frame-Options Header',
        severity: 'Medium',
        description: 'The X-Frame-Options header is absent, making the site vulnerable to Clickjacking attacks where it can be embedded in an <iframe>.',
        recommendation: 'Configure X-Frame-Options header to "DENY" or "SAMEORIGIN".',
      });
    }

    // Check X-Content-Type-Options
    if (headers['x-content-type-options']) {
      headerAudit.xContentTypeOptions = true;
    } else {
      vulnerabilities.push({
        name: 'Missing X-Content-Type-Options Header',
        severity: 'Medium',
        description: 'Missing "nosniff" directive allows browsers to MIME-sniff responses, potentially leading to drive-by code execution.',
        recommendation: 'Add "X-Content-Type-Options: nosniff" header to all server responses.',
      });
    }

    // Check Referrer-Policy
    if (headers['referrer-policy']) {
      headerAudit.referrerPolicy = true;
    } else {
      vulnerabilities.push({
        name: 'Missing Referrer-Policy Header',
        severity: 'Low',
        description: 'No Referrer-Policy header found. Sensitive URL parameters may leak to external third-party origins in the Referer header.',
        recommendation: 'Set Referrer-Policy to "strict-origin-when-cross-origin" or "no-referrer".',
      });
    }

    // Check Information Disclosure
    const serverHeader = headers['server'] || '';
    const poweredByHeader = headers['x-powered-by'] || '';
    if (serverHeader || poweredByHeader) {
      headerAudit.serverExposure = [serverHeader, poweredByHeader].filter(Boolean).join(' | ');
      vulnerabilities.push({
        name: 'Server & Technology Information Exposure',
        severity: 'Low',
        description: `Server response headers expose backend tech details: ${headerAudit.serverExposure}`,
        recommendation: 'Remove or mask Server and X-Powered-By response headers in web server config to prevent fingerprinting by malicious actors.',
      });
    }

  } catch (httpErr) {
    vulnerabilities.push({
      name: 'HTTP Header Audit Error',
      severity: 'Medium',
      description: `Could not retrieve full HTTP headers: ${httpErr.message}`,
      recommendation: 'Ensure your server is online, reachable, and accepts standard HTTP/HTTPS connections.',
    });
  }

  // 3. DNS & Email Security Audit
  const dnsRes = await checkDnsAndEmailSecurity(hostname);
  vulnerabilities.push(...dnsRes.vulnerabilities);

  // 4. Network Port Probe Audit
  const portRes = await checkPortScan(hostname);
  vulnerabilities.push(...portRes.vulnerabilities);

  // 5. Calculate Security Score (0 - 100)
  let score = 100;
  vulnerabilities.forEach((vuln) => {
    if (vuln.severity === 'Critical') score -= 25;
    else if (vuln.severity === 'High') score -= 15;
    else if (vuln.severity === 'Medium') score -= 10;
    else if (vuln.severity === 'Low') score -= 5;
  });

  score = Math.max(0, Math.min(100, score));

  // Determine Risk Level
  let riskLevel = 'Low';
  if (score < 40) riskLevel = 'Critical';
  else if (score < 65) riskLevel = 'High';
  else if (score < 85) riskLevel = 'Medium';

  const responseTimeMs = Date.now() - startTime;

  return {
    securityScore: score,
    riskLevel,
    httpsEnabled,
    sslDetails,
    headerAudit,
    dnsAudit: dnsRes.dnsAudit,
    portAudit: portRes.portAudit,
    vulnerabilities,
    responseTimeMs,
    scanDate: new Date(),
  };
};

/**
 * Helper to fetch SSL Certificate information using node tls module
 */
const getSSLCertificateInfo = (hostname, port = 443) => {
  return new Promise((resolve, reject) => {
    const socket = tls.connect(port, hostname, { servername: hostname, timeout: 5000 }, () => {
      const cert = socket.getPeerCertificate();
      socket.end();

      if (!cert || Object.keys(cert).length === 0) {
        return resolve({ valid: false, daysRemaining: 0, issuer: 'Unknown', validTo: 'N/A' });
      }

      const validToDate = new Date(cert.valid_to);
      const now = new Date();
      const timeDiff = validToDate.getTime() - now.getTime();
      const daysRemaining = Math.max(0, Math.floor(timeDiff / (1000 * 3600 * 24)));
      const isValid = socket.authorized && daysRemaining > 0;
      const issuer = cert.issuer ? cert.issuer.O || cert.issuer.CN || 'Trusted Authority' : 'Unknown';

      resolve({
        valid: isValid,
        daysRemaining,
        issuer,
        validTo: validToDate.toISOString().split('T')[0],
      });
    });

    socket.on('error', (err) => resolve({ valid: false, daysRemaining: 0, issuer: 'Failed to Connect', validTo: 'N/A' }));
    socket.setTimeout(5000, () => {
      socket.destroy();
      resolve({ valid: false, daysRemaining: 0, issuer: 'Timeout', validTo: 'N/A' });
    });
  });
};

/**
 * Helper to fetch HTTP Response Headers
 */
const fetchHttpHeaders = (urlStr) => {
  return new Promise((resolve, reject) => {
    const isHttps = urlStr.startsWith('https://');
    const client = isHttps ? https : http;

    const req = client.request(urlStr, { method: 'HEAD', timeout: 5000 }, (res) => {
      resolve(res.headers);
    });

    req.on('error', (err) => {
      // Retry with GET if HEAD is not supported by remote server
      const getReq = client.get(urlStr, { timeout: 5000 }, (res) => {
        resolve(res.headers);
        getReq.destroy();
      });
      getReq.on('error', (getErr) => reject(getErr));
    });

    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Request timed out fetching HTTP headers'));
    });

    req.end();
  });
};

/**
 * Helper to check DNS & Email Security (SPF & DMARC records)
 */
const checkDnsAndEmailSecurity = async (hostname) => {
  const dnsAudit = {
    hasSpf: false,
    spfRecord: '',
    hasDmarc: false,
    dmarcRecord: '',
    mxRecords: [],
  };
  const vulnerabilities = [];

  try {
    const txtRecords = await dns.promises.resolveTxt(hostname).catch(() => []);
    const flattenedTxt = txtRecords.map((r) => r.join(''));

    const spf = flattenedTxt.find((record) => record.toLowerCase().startsWith('v=spf1'));
    if (spf) {
      dnsAudit.hasSpf = true;
      dnsAudit.spfRecord = spf;
    } else {
      vulnerabilities.push({
        name: 'Missing SPF (Sender Policy Framework) Record',
        severity: 'High',
        description: 'No SPF record found. Email spoofers can impersonate your domain in phishing campaigns.',
        recommendation: 'Add a TXT DNS record with "v=spf1 include:_spf.google.com ~all" (or your email provider settings).',
      });
    }

    const dmarcRecords = await dns.promises.resolveTxt(`_dmarc.${hostname}`).catch(() => []);
    const flattenedDmarc = dmarcRecords.map((r) => r.join(''));
    const dmarc = flattenedDmarc.find((record) => record.toLowerCase().startsWith('v=dmarc1'));
    if (dmarc) {
      dnsAudit.hasDmarc = true;
      dnsAudit.dmarcRecord = dmarc;
    } else {
      vulnerabilities.push({
        name: 'Missing DMARC (Domain-based Message Authentication) Policy',
        severity: 'High',
        description: `No DMARC policy found under _dmarc.${hostname}. Receiving servers cannot verify domain authenticity.`,
        recommendation: `Add a TXT DNS record at _dmarc.${hostname} with "v=DMARC1; p=reject; rua=mailto:dmarc-reports@${hostname}".`,
      });
    }

    const mx = await dns.promises.resolveMx(hostname).catch(() => []);
    dnsAudit.mxRecords = mx.map((m) => m.exchange);

  } catch (err) {
    // Soft ignore DNS lookup exceptions for invalid local domains
  }

  return { dnsAudit, vulnerabilities };
};

/**
 * Helper to probe common network ports for exposed database and server services
 */
const checkPortScan = async (hostname) => {
  const openPorts = [];
  const vulnerabilities = [];

  const promises = TARGET_PORTS.map((item) => {
    return new Promise((resolve) => {
      const socket = new net.Socket();
      socket.setTimeout(1000);

      socket.on('connect', () => {
        openPorts.push({ port: item.port, service: item.service, risk: item.risk });
        socket.destroy();

        if (['Critical', 'High'].includes(item.risk) && ![80, 443].includes(item.port)) {
          vulnerabilities.push({
            name: `Exposed Public Port ${item.port} (${item.service})`,
            severity: item.risk,
            description: `Port ${item.port} (${item.service}) is publicly accessible from the Internet. Potential vector for unauthorized DB access or brute force.`,
            recommendation: `Restrict port ${item.port} access using firewall rules (UFW / Cloud Security Groups) or bind service to 127.0.0.1.`,
          });
        }
        resolve();
      });

      socket.on('timeout', () => {
        socket.destroy();
        resolve();
      });

      socket.on('error', () => {
        socket.destroy();
        resolve();
      });

      try {
        socket.connect(item.port, hostname);
      } catch (err) {
        socket.destroy();
        resolve();
      }
    });
  });

  await Promise.all(promises);

  return {
    portAudit: {
      scannedPortsCount: TARGET_PORTS.length,
      openPorts,
    },
    vulnerabilities,
  };
};
