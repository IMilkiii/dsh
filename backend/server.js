const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Create necessary directories
const dirs = ['uploads', 'models', 'previews'];
dirs.forEach(dir => {
  const dirPath = path.join(__dirname, dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/models', express.static(path.join(__dirname, 'models')));
app.use('/previews', express.static(path.join(__dirname, 'previews')));

// Routes
const projectsRouter = require('./routes/projects');
const uploadRouter = require('./routes/upload');
const generateRouter = require('./routes/generate');

app.use('/api/projects', projectsRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/generate', generateRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend server is running' });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Backend server is running on port ${PORT}`);
});
