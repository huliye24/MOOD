/**
 * MOOD Network Backend API
 * Version: v0.1.0
 * 
 * This is the main entry point for the MOOD Network backend services.
 */

const express = require('express');
const cors = require('cors');

// Import routes
const contributionsRouter = require('./api/contributions');
const contributorsRouter = require('./api/contributors');
const proofsRouter = require('./api/proofs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    network: 'MOOD',
    version: 'v0.1.0',
    phase: 'genesis'
  });
});

// API routes
app.use('/api/contributions', contributionsRouter);
app.use('/api/contributors', contributorsRouter);
app.use('/api/proofs', proofsRouter);

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Start server (for development)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`MOOD Network API running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
  });
}

module.exports = app;
