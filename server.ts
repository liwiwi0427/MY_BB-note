import express from 'express';
import path from 'path';

const app = express();
const PORT = 3000;

app.use(express.json());

// API health route
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve static files in production
const distPath = path.join(process.cwd(), 'dist');
app.use(express.static(distPath));

// Fallback to SPA index.html
app.get('*', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Baby Health Tracker Server is running on port ${PORT}`);
});
