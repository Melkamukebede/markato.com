require('dotenv').config();

const express      = require('express');
const cors         = require('cors');
const cookieParser = require('cookie-parser');
const path         = require('path');

// ── Init DB (creates tables if they don't exist) ──
require('./config/database');

const app = express();

/* ─── CORS ──────────────────────────────────────────
   Allow your frontend to call this API.
   In production, change origin to your real domain.
─────────────────────────────────────────────────── */
app.use(cors({
  origin: [
    'http://localhost:5500',   // VS Code Live Server
    'http://127.0.0.1:5500',
    'http://localhost:3000',
    'https://melkamukebede.github.io'  // your GitHub Pages
  ],
  credentials: true            // allow cookies (refresh token)
}));

/* ─── Core Middleware ────────────────────────────── */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.COOKIE_SECRET));

/* ─── Serve static frontend files ───────────────── */
// This lets the backend also serve your HTML files in production
app.use(express.static(path.join(__dirname, '..')));

/* ─── API Routes ─────────────────────────────────── */
app.use('/api/auth', require('./routes/auth'));

/* ─── Health check ───────────────────────────────── */
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Merkato API is running',
    time: new Date().toISOString(),
    env: process.env.NODE_ENV
  });
});

/* ─── 404 handler for unknown API routes ─────────── */
app.use('/api/{*path}', (req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found.` });
});

/* ─── Global error handler ───────────────────────── */
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, message: 'An unexpected error occurred.' });
});

/* ─── Start ──────────────────────────────────────── */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('');
  console.log('🚀 Merkato API running on http://localhost:' + PORT);
  console.log('📋 Health check: http://localhost:' + PORT + '/api/health');
  console.log('🌍 Environment:', process.env.NODE_ENV || 'development');
  console.log('');
});
