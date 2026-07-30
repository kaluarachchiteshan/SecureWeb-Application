import dotenv from 'dotenv';
import User from '../models/User.js';
import Website from '../models/Website.js';
import ScanResult from '../models/ScanResult.js';
import Alert from '../models/Alert.js';
import KnowledgeItem from '../models/KnowledgeItem.js';
import { connectDB } from '../config/db.js';

dotenv.config();

export const initialKnowledgeItems = [
  {
    topicId: 'owasp-top-10',
    title: 'OWASP Top 10 Web Application Security Risks',
    category: 'OWASP Top 10',
    description: 'The OWASP Top 10 is a standard awareness document for developers and web application security. It represents a broad consensus about the most critical security risks to web applications.',
    severity: 'Critical',
    vulnerableSnippet: `// Vulnerable: Direct exposure of sensitive endpoints and missing authorization controls
app.get('/api/admin/config', (req, res) => {
  res.json(systemConfig); // No access control check!
});`,
    secureSnippet: `// Secure: Role-Based Access Control (RBAC) & JWT Middleware
app.get('/api/admin/config', protect, adminOnly, (req, res) => {
  res.json(systemConfig);
});`,
    preventionSteps: [
      'Implement broken access control tests in CI/CD pipelines.',
      'Apply Principle of Least Privilege across all API routes.',
      'Enforce multi-factor authentication (MFA) and rate limiting on sensitive endpoints.',
    ],
    references: ['https://owasp.org/www-project-top-ten/'],
  },
  {
    topicId: 'sql-injection',
    title: 'SQL Injection (SQLi) Vulnerabilities',
    category: 'Injection',
    description: 'SQL Injection occurs when untrusted user input is directly concatenated into dynamic database queries, allowing attackers to manipulate queries, bypass login screens, or exfiltrate databases.',
    severity: 'Critical',
    vulnerableSnippet: `// Dangerous SQL Query Construction
const query = "SELECT * FROM users WHERE email = '" + req.body.email + "' AND password = '" + req.body.password + "'";
db.query(query);`,
    secureSnippet: `// Parameterized Queries using Mongoose / ORM
const user = await User.findOne({ email: req.body.email });
if (user && await user.matchPassword(req.body.password)) {
  // Authenticated safely
}`,
    preventionSteps: [
      'Always use parameterized statements or Object Relational Mapping (ORM/ODM) libraries.',
      'Never concatenate raw user strings into SQL or NoSQL command strings.',
      'Enforce input validation and sanitization using libraries like express-validator.',
    ],
    references: ['https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html'],
  },
  {
    topicId: 'cross-site-scripting',
    title: 'Cross-Site Scripting (XSS)',
    category: 'Injection',
    description: 'XSS flaws occur when an application includes untrusted data in a web page without proper validation or escaping, allowing attackers to execute scripts in the victim browser to steal session cookies.',
    severity: 'High',
    vulnerableSnippet: `// Unescaped HTML rendering in React/Vanilla JS
document.getElementById('welcome').innerHTML = "Welcome " + userInput;
// OR in React:
<div dangerouslySetInnerHTML={{ __html: userInput }} />`,
    secureSnippet: `// Automatic escaping via standard JSX
<div>Welcome {userInput}</div>
// Sanitized HTML if rich text rendering is needed:
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userInput) }} />`,
    preventionSteps: [
      'Context-aware output encoding (HTML, JavaScript, CSS context).',
      'Implement strict Content-Security-Policy (CSP) HTTP headers.',
      'Use HttpOnly flags on session cookies to prevent JavaScript exfiltration.',
    ],
    references: ['https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html'],
  },
  {
    topicId: 'csrf-protection',
    title: 'Cross-Site Request Forgery (CSRF)',
    category: 'Defensive Coding',
    description: 'CSRF forces an end user to execute unwanted actions on a web application in which they are currently authenticated, leading to state-changing exploits like email or password changes.',
    severity: 'Medium',
    vulnerableSnippet: `// State-changing endpoint accepting plain GET/POST without anti-CSRF token or SameSite cookies
app.post('/account/transfer-funds', (req, res) => {
  transfer(req.user.id, req.body.amount);
});`,
    secureSnippet: `// Anti-CSRF Protection with SameSite Cookies and Headers
res.cookie('token', token, {
  httpOnly: true,
  secure: true,
  sameSite: 'strict',
});`,
    preventionSteps: [
      'Use SameSite=Strict or SameSite=Lax cookie attribute for all session cookies.',
      'Implement anti-CSRF tokens for state-changing requests.',
      'Require re-authentication or step-up MFA for critical administrative operations.',
    ],
    references: ['https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html'],
  },
  {
    topicId: 'phishing-awareness',
    title: 'Phishing Awareness & Social Engineering',
    category: 'General Security',
    description: 'Phishing attacks leverage psychological manipulation to trick users into revealing credentials, MFA tokens, or sensitive financial information via spoofed domain names and emails.',
    severity: 'High',
    vulnerableSnippet: `// Missing domain verification or spoofable link redirection
window.location.href = req.query.redirectUrl; // Open Redirect vulnerability!`,
    secureSnippet: `// Domain whitelisting for safe redirects
const ALLOWED_HOSTS = ['secureweb.com', 'dashboard.secureweb.com'];
const target = new URL(req.query.redirectUrl, 'https://secureweb.com');
if (ALLOWED_HOSTS.includes(target.hostname)) {
  res.redirect(target.href);
}`,
    preventionSteps: [
      'Enforce FIDO2 / WebAuthn Hardware Keys for strong MFA.',
      'Implement SPF, DKIM, and DMARC record checks for organization domains.',
      'Conduct regular phishing simulation drills and staff security awareness training.',
    ],
    references: ['https://www.cisa.gov/phishing-guidance'],
  },
  {
    topicId: 'password-security',
    title: 'Password Security & Storage Best Practices',
    category: 'Authentication',
    description: 'Storing passwords in plain text or with weak hashing algorithms (MD5, SHA1) guarantees data breach disasters. Modern applications must use memory-hard key derivation algorithms.',
    severity: 'Critical',
    vulnerableSnippet: `// Insecure Hash Algorithm (MD5 / SHA1)
const hash = crypto.createHash('md5').update(password).digest('hex');`,
    secureSnippet: `// Robust Salting & Hashing using bcrypt (or Argon2id)
const salt = await bcrypt.genSalt(12);
const hashedPassword = await bcrypt.hash(password, salt);`,
    preventionSteps: [
      'Use bcrypt with work factor >= 10, or Argon2id for password hashing.',
      'Enforce NIST Special Publication 800-63B password guidelines (no arbitrary character restrictions, check against pwned password lists).',
      'Rate-limit login endpoints to prevent automated credential stuffing attacks.',
    ],
    references: ['https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html'],
  },
];

export const seedData = async () => {
  try {
    const isConnected = await connectDB();
    if (!isConnected) {
      console.log('Skipping DB seeding as MongoDB connection is not active.');
      return;
    }

    console.log('Seeding initial data into MongoDB...');

    // Clear existing collections
    await User.deleteMany();
    await Website.deleteMany();
    await ScanResult.deleteMany();
    await Alert.deleteMany();
    await KnowledgeItem.deleteMany();

    // Create Admin User
    const adminUser = await User.create({
      name: 'System Admin',
      email: 'admin@secureweb.com',
      password: 'admin123Password!',
      role: 'admin',
    });

    // Create Standard User
    const normalUser = await User.create({
      name: 'DevOps Security Lead',
      email: 'user@secureweb.com',
      password: 'user123Password!',
      role: 'user',
    });

    // Create Monitored Websites
    const site1 = await Website.create({
      userId: normalUser._id,
      websiteName: 'Production E-Commerce API',
      websiteURL: 'https://google.com',
      description: 'Main public facing customer checkout and payment API service.',
      lastScannedAt: new Date(),
      lastSecurityScore: 92,
      lastRiskLevel: 'Low',
    });

    const site2 = await Website.create({
      userId: normalUser._id,
      websiteName: 'Legacy Admin Portal',
      websiteURL: 'http://httpbin.org',
      description: 'Internal legacy operational dashboard web application.',
      lastScannedAt: new Date(),
      lastSecurityScore: 48,
      lastRiskLevel: 'High',
    });

    // Create Initial Scan Results
    await ScanResult.create({
      websiteId: site1._id,
      userId: normalUser._id,
      securityScore: 92,
      riskLevel: 'Low',
      httpsEnabled: true,
      sslDetails: {
        valid: true,
        daysRemaining: 180,
        issuer: 'Google Trust Services',
        validTo: '2026-12-31',
      },
      headerAudit: {
        csp: true,
        xFrameOptions: true,
        xContentTypeOptions: true,
        hsts: true,
        referrerPolicy: true,
        serverExposure: 'None',
      },
      vulnerabilities: [
        {
          name: 'Missing Referrer-Policy Strict Directive',
          severity: 'Low',
          description: 'Referrer policy is using default browser behavior instead of strict-origin-when-cross-origin.',
          recommendation: 'Explicitly define Referrer-Policy header on web server.',
        },
      ],
      scanDate: new Date(),
    });

    await ScanResult.create({
      websiteId: site2._id,
      userId: normalUser._id,
      securityScore: 48,
      riskLevel: 'High',
      httpsEnabled: false,
      sslDetails: {
        valid: false,
        daysRemaining: 0,
        issuer: 'None',
        validTo: 'N/A',
      },
      headerAudit: {
        csp: false,
        xFrameOptions: false,
        xContentTypeOptions: false,
        hsts: false,
        referrerPolicy: false,
        serverExposure: 'gunicorn/19.9.0',
      },
      vulnerabilities: [
        {
          name: 'Unencrypted HTTP Protocol',
          severity: 'Critical',
          description: 'Website serves traffic over unencrypted HTTP.',
          recommendation: 'Enable HTTPS and redirect HTTP traffic to port 443.',
        },
        {
          name: 'Missing Content-Security-Policy (CSP)',
          severity: 'High',
          description: 'No CSP header set to defend against XSS.',
          recommendation: 'Implement strict Content-Security-Policy response header.',
        },
        {
          name: 'Server Header Disclosure',
          severity: 'Low',
          description: 'Exposes server version gunicorn/19.9.0.',
          recommendation: 'Remove Server header in reverse proxy config.',
        },
      ],
      scanDate: new Date(),
    });

    // Create Initial Alerts
    await Alert.create({
      websiteId: site2._id,
      userId: normalUser._id,
      alertType: 'Expired SSL certificate',
      severity: 'Critical',
      title: 'Unencrypted Target Domain: Legacy Admin Portal',
      message: 'Website is currently transmitting data in plaintext without HTTPS encryption.',
      status: 'active',
    });

    await Alert.create({
      websiteId: site2._id,
      userId: normalUser._id,
      alertType: 'Missing security headers',
      severity: 'High',
      title: 'Missing Core Defense Headers',
      message: 'Missing HSTS, CSP, and X-Frame-Options security headers.',
      status: 'active',
    });

    // Create Knowledge Items
    await KnowledgeItem.insertMany(initialKnowledgeItems);

    console.log('[Seed Success]: Seeded admin, user, websites, scans, alerts, and OWASP knowledge base!');
  } catch (err) {
    console.error('Seeding error:', err);
  }
};

if (process.argv[1].includes('seeder.js')) {
  seedData().then(() => process.exit());
}
