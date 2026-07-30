import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { connectDB } from './config/db.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

import authRoutes from './routes/authRoutes.js';
import websiteRoutes from './routes/websiteRoutes.js';
import scanRoutes from './routes/scanRoutes.js';
import alertRoutes from './routes/alertRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import knowledgeRoutes from './routes/knowledgeRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { seedData } from './utils/seeder.js';
import { startScheduler } from './services/scheduler.js';

dotenv.config();

const app = express();

// 1. Security Middleware
app.use(
  helmet({
    contentSecurityPolicy: false, // Disabled for flexible API responses & PDF streaming
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// 2. CORS Policy Configuration
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// 3. Express Rate Limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes window
  max: 300, // max 300 requests per windowMs
  message: { success: false, message: 'Too many requests from this IP, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// 4. Request Body Parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 5. Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    platform: 'SecureWeb Security Monitoring Platform',
    timestamp: new Date().toISOString(),
  });
});

// 6. Mount API Route Modules
app.use('/api/auth', authRoutes);
app.use('/api/websites', websiteRoutes);
app.use('/api/scans', scanRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/knowledge', knowledgeRoutes);
app.use('/api/admin', adminRoutes);

// 7. Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  await seedData();
  startScheduler();

  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🚀 SECUREWEB BACKEND RUNNING ON PORT ${PORT}`);
    console.log(`🌐 API Endpoint: http://localhost:${PORT}/api`);
    console.log(`====================================================`);
  });
};

startServer();
