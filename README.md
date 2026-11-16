# SecureWeb Application

SecureWeb is a cybersecurity and web application monitoring platform built on the MERN stack (MongoDB, Express, React, Node.js).

## Tech stack

- **Backend:** Node.js, Express, MongoDB (Mongoose), JWT auth, Helmet, express-rate-limit, PDFKit
- **Frontend:** React 18, Vite, Tailwind CSS, React Router, Recharts, Axios

## Project structure

```
backend/    Express API (config, controllers, middleware, models, routes, services, utils)
frontend/   React + Vite client
```

## Getting started

1. Install dependencies:
   ```bash
   npm install --prefix backend
   npm install --prefix frontend
   ```
2. Create `backend/.env` with your MongoDB connection string and JWT secret.
3. (Optional) Seed the database:
   ```bash
   npm run seed --prefix backend
   ```
4. Run backend and frontend together:
   ```bash
   npm run dev
   ```
