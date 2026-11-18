# SecureWeb Application

SecureWeb is a cybersecurity and web application monitoring platform built on the MERN stack (MongoDB, Express, React, Node.js). Register your websites, run security scans, track vulnerabilities over time, receive alerts and export PDF reports.

## Features

- **Website management** – add and monitor the websites you own
- **Security scanner** – checks each site for:
  - SSL/TLS certificate validity and upcoming expiry
  - HTTPS availability and unencrypted HTTP usage
  - Missing security headers (HSTS, Content-Security-Policy, X-Frame-Options, X-Content-Type-Options, Referrer-Policy)
  - Server / technology information exposure
  - Email security DNS records (SPF, DMARC)
  - Commonly exposed public ports
- **Scheduled scans** – background re-scans every 30 minutes (`backend/services/scheduler.js`)
- **Dashboard** – security score gauge and vulnerability charts (Recharts)
- **Alerts** – notifications when new issues are found
- **Reports** – downloadable PDF scan reports (PDFKit)
- **Knowledge Center** – remediation guides for common web vulnerabilities (SQL injection, XSS, CSRF, phishing, …)
- **Admin panel** – user and platform management for admin accounts

## Tech stack

- **Backend:** Node.js, Express, MongoDB (Mongoose), JWT, bcryptjs, Helmet, express-rate-limit, PDFKit
- **Frontend:** React 18, Vite, Tailwind CSS, React Router, Recharts, Axios, lucide-react

## Security features

- JWT-based authentication and role-based access (`backend/middleware/authMiddleware.js`)
- Password hashing with bcryptjs
- HTTP security headers via Helmet
- API rate limiting with express-rate-limit
- Centralised error handling (`backend/middleware/errorMiddleware.js`)
- Secrets kept in `backend/.env`, which is excluded from version control

## Project structure

```
SecureWeb/
├── backend/            Express REST API
│   ├── config/         Database connection
│   ├── controllers/    Route handlers
│   ├── middleware/     Auth and error handling
│   ├── models/         Mongoose models (User, Website, ScanResult, Alert, KnowledgeItem)
│   ├── routes/         API routes
│   ├── services/       Scanner, scheduler, PDF report generation
│   ├── utils/          Remediation guide and database seeder
│   └── server.js       App entry point
├── frontend/           React + Vite client
│   └── src/            Pages, components, context, API service
└── package.json        Scripts to run backend and frontend together
```

## Getting started

### Prerequisites

- Node.js 18 or newer
- A MongoDB database (local or MongoDB Atlas)

### 1. Install dependencies

```bash
npm install
npm install --prefix backend
npm install --prefix frontend
```

### 2. Configure environment variables

Copy `backend/.env.example` to `backend/.env` and fill in your values:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/secureweb
JWT_SECRET=replace-with-a-long-random-string
NODE_ENV=development
```

> Never commit `backend/.env`. It is already listed in `.gitignore`.

### 3. Seed the database (optional)

Creates demo admin/user accounts and Knowledge Center content (see `backend/utils/seeder.js`):

```bash
npm run seed --prefix backend
```

### 4. Run the app

```bash
npm run dev
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api

Run them separately with `npm run dev:backend` and `npm run dev:frontend`.

### Production build

```bash
npm run build --prefix frontend
npm start
```

## API routes

| Route             | Purpose                         |
|-------------------|---------------------------------|
| `/api/auth`       | Register, login, profile        |
| `/api/websites`   | Manage monitored websites       |
| `/api/scans`      | Run and view security scans     |
| `/api/alerts`     | Security alerts                 |
| `/api/reports`    | PDF report generation           |
| `/api/knowledge`  | Knowledge Center content        |
| `/api/admin`      | Admin-only management           |
