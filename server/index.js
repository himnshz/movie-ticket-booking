import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import moviesRouter from './routes/movies.js';
import theatresRouter from './routes/theatres.js';
import showsRouter from './routes/shows.js';
import bookingsRouter from './routes/bookings.js';

dotenv.config();

const app = express();
const PORT = process.env.API_PORT || 3001;

// ─── Middleware ──────────────────────────────────────────
app.use(cors());
app.use(express.json());

// Request logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const ms = Date.now() - start;
    console.log(`${req.method} ${req.originalUrl} → ${res.statusCode} (${ms}ms)`);
  });
  next();
});

// ─── API Routes ─────────────────────────────────────────
app.use('/api/movies',    moviesRouter);
app.use('/api/theatres',  theatresRouter);
app.use('/api/shows',     showsRouter);
app.use('/api/bookings',  bookingsRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── Error Handler ──────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('🔥 Server Error:', err.message);
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// ─── Start ──────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 CinePass API server running on http://localhost:${PORT}`);
  console.log(`   Routes: /api/movies, /api/theatres, /api/shows, /api/bookings`);
});
