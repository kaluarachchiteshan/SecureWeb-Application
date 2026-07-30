/**
 * Utility to generate exact configuration code snippets for remediation.
 * Supports Nginx, Apache, Express.js (Node), and Cloudflare.
 */
export const getRemediationSnippets = (vulnerabilityName, domain = 'example.com') => {
  const name = (vulnerabilityName || '').toLowerCase();

  if (name.includes('hsts')) {
    return {
      title: 'Remediate Missing HSTS Header',
      nginx: `add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;`,
      apache: `Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"`,
      express: `app.use(helmet.hsts({\n  maxAge: 31536000,\n  includeSubDomains: true,\n  preload: true\n}));`,
      cloudflare: `Enable "HTTP Strict Transport Security (HSTS)" in Cloudflare Dashboard -> SSL/TLS -> Edge Certificates.`,
    };
  }

  if (name.includes('content-security-policy') || name.includes('csp')) {
    return {
      title: 'Remediate Missing Content-Security-Policy',
      nginx: `add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;" always;`,
      apache: `Header always set Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;"`,
      express: `app.use(helmet.contentSecurityPolicy({\n  directives: {\n    defaultSrc: ["'self'"],\n    scriptSrc: ["'self'", "'unsafe-inline'"],\n    styleSrc: ["'self'", "'unsafe-inline'"],\n  }\n}));`,
      cloudflare: `Create a Transform Rule under Rules -> Transform Rules -> Modify Response Header -> Add Header -> Content-Security-Policy.`,
    };
  }

  if (name.includes('frame-options') || name.includes('clickjacking')) {
    return {
      title: 'Remediate Missing X-Frame-Options',
      nginx: `add_header X-Frame-Options "SAMEORIGIN" always;`,
      apache: `Header always set X-Frame-Options "SAMEORIGIN"`,
      express: `app.use(helmet.frameguard({ action: 'sameorigin' }));`,
      cloudflare: `Add Response Header "X-Frame-Options" with value "SAMEORIGIN" in Cloudflare Transform Rules.`,
    };
  }

  if (name.includes('content-type-options') || name.includes('mime')) {
    return {
      title: 'Remediate Missing X-Content-Type-Options',
      nginx: `add_header X-Content-Type-Options "nosniff" always;`,
      apache: `Header always set X-Content-Type-Options "nosniff"`,
      express: `app.use(helmet.noSniff());`,
      cloudflare: `Add Response Header "X-Content-Type-Options" with value "nosniff" in Cloudflare Transform Rules.`,
    };
  }

  if (name.includes('referrer')) {
    return {
      title: 'Remediate Missing Referrer-Policy',
      nginx: `add_header Referrer-Policy "strict-origin-when-cross-origin" always;`,
      apache: `Header always set Referrer-Policy "strict-origin-when-cross-origin"`,
      express: `app.use(helmet.referrerPolicy({ policy: 'strict-origin-when-cross-origin' }));`,
      cloudflare: `Add Response Header "Referrer-Policy" with value "strict-origin-when-cross-origin" in Cloudflare.`,
    };
  }

  if (name.includes('spf')) {
    return {
      title: 'Remediate Missing SPF Record',
      nginx: `# DNS Record Configuration (Not Web Server Code)`,
      apache: `# DNS Record Configuration (Not Web Server Code)`,
      express: `// Managed at DNS Registrar (Cloudflare, Route53, GoDaddy, Namecheap)`,
      cloudflare: `Type: TXT\nName: @\nValue: v=spf1 include:_spf.google.com ~all\nTTL: Auto`,
    };
  }

  if (name.includes('dmarc')) {
    return {
      title: 'Remediate Missing DMARC Policy',
      nginx: `# DNS Record Configuration (Not Web Server Code)`,
      apache: `# DNS Record Configuration (Not Web Server Code)`,
      express: `// Managed at DNS Registrar (Cloudflare, Route53, GoDaddy, Namecheap)`,
      cloudflare: `Type: TXT\nName: _dmarc\nValue: v=DMARC1; p=reject; rua=mailto:security-reports@${domain}\nTTL: Auto`,
    };
  }

  if (name.includes('port') || name.includes('exposed')) {
    return {
      title: 'Remediate Exposed Database / Administrative Port',
      nginx: `# Firewall rule (Ubuntu UFW):\nsudo ufw deny 3306/tcp`,
      apache: `# Firewall rule (Ubuntu UFW):\nsudo ufw deny 5432/tcp`,
      express: `// Bind database server to 127.0.0.1 in postgresql.conf / my.cnf / mongod.conf`,
      cloudflare: `In AWS Security Groups / Cloud Firewall, remove 0.0.0.0/0 ingress for non-HTTP ports.`,
    };
  }

  return {
    title: `Remediate ${vulnerabilityName}`,
    nginx: `# Apply standard security hardening directives in nginx.conf\nadd_header X-Content-Type-Options "nosniff" always;`,
    apache: `# Enable mod_headers in Apache\nHeader always set X-Content-Type-Options "nosniff"`,
    express: `import helmet from 'helmet';\napp.use(helmet());`,
    cloudflare: `Configure Security & WAF Rules under Cloudflare Dashboard.`,
  };
};
