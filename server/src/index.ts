import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { initializeDatabase } from './db/database';
import { seedSampleDataIfEmpty } from './services/sampleData';
import { assessmentRouter } from './routes/assessmentRoutes';
import { guidelineRouter } from './routes/guidelineRoutes';
import { applicationRouter } from './routes/applicationRoutes';
import { exportRouter } from './routes/exportRoutes';
import { StructuredLogger } from './logger';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (!req.path.includes('/audit-logs')) {
      StructuredLogger.log('info', `${req.method} ${req.path} -> ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString(), service: 'Grant Completeness Assistant API' });
});

// API Routes
app.use('/api/assessments', assessmentRouter);
app.use('/api/guidelines', guidelineRouter);
app.use('/api/applications', applicationRouter);
app.use('/api/export', exportRouter);

// Serve static frontend in production if built
const clientDistPath = path.resolve(__dirname, '../../client/dist');
app.use(express.static(clientDistPath));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(clientDistPath, 'index.html'), (err) => {
    if (err) res.status(404).send('Backend API ready. Frontend running on dev server.');
  });
});

async function startServer() {
  try {
    await initializeDatabase();
    await seedSampleDataIfEmpty();

    app.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(` Grant Application Completeness Assistant Server`);
      console.log(` Backend listening on: http://localhost:${PORT}`);
      console.log(` API Health Check:     http://localhost:${PORT}/api/health`);
      console.log(`====================================================`);
    });
  } catch (err) {
    console.error('Failed to initialize and start server:', err);
    process.exit(1);
  }
}

startServer();
