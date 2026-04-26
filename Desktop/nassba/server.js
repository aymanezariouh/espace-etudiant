/**
 * AHAMMAR Event Planning - Backend Server
 * Node.js + Express
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import contactRouter from './routes/contact.js';
import adminRouter from './routes/admin.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// ─────────────────────────────────────────
// SECURITY MIDDLEWARE
// ─────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: false, // allow admin dashboard inline styles
}));

// CORS — allow the frontend (any origin during dev, restrict in prod)
app.use(cors({
  origin: process.env.FRONTEND_ORIGIN || '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ─────────────────────────────────────────
// GENERAL MIDDLEWARE
// ─────────────────────────────────────────
app.use(morgan('combined'));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ─────────────────────────────────────────
// RATE LIMITING
// ─────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please try again later.' },
});

const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many contact submissions. Please wait before trying again.' },
  keyGenerator: (req) => ipKeyGenerator(req),
});

app.use(globalLimiter);

// ─────────────────────────────────────────
// SERVE STATIC FRONTEND FILES
// ─────────────────────────────────────────
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname)));

// ─────────────────────────────────────────
// API ROUTES
// ─────────────────────────────────────────
app.use('/api/contact', contactLimiter, contactRouter);
app.use('/admin', adminRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'AHAMMAR Backend is running',
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    success: false, 
    message: 'An internal server error occurred.',
  });
});

// ─────────────────────────────────────────
// START SERVER
// ─────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 AHAMMAR Backend running on http://localhost:${PORT}`);
  console.log(`📋 Admin dashboard: http://localhost:${PORT}/admin`);
  console.log(`📡 API health:      http://localhost:${PORT}/api/health\n`);
});

export default app;
