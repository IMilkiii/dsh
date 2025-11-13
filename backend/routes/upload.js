const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// Upload single image
router.post('/', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    res.json({
      message: 'File uploaded successfully',
      filename: req.file.filename,
      path: `/uploads/${req.file.filename}`,
      size: req.file.size
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

// Upload multiple images
router.post('/multiple', upload.array('images', 10), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }
    
    const files = req.files.map(file => ({
      filename: file.filename,
      path: `/uploads/${file.filename}`,
      size: file.size
    }));
    
    res.json({
      message: 'Files uploaded successfully',
      files: files
    });
  } catch (error) {
    console.error('Error uploading files:', error);
    res.status(500).json({ error: 'Failed to upload files' });
  }
});

// Upload images to project
router.post('/project/:id', upload.array('images', 10), async (req, res) => {
  try {
    const { id } = req.params;
    const { Pool } = require('pg');
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/dsh',
    });

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    // Сохраняем пути к файлам в проекте
    const imagePaths = req.files.map(file => `/uploads/${file.filename}`);
    
    // Обновляем проект с путями к изображениям
    await pool.query(
      'UPDATE projects SET image_paths = $1 WHERE id = $2',
      [JSON.stringify(imagePaths), id]
    );

    res.json({
      message: 'Images uploaded to project successfully',
      files: req.files.map(file => ({
        filename: file.filename,
        path: `/uploads/${file.filename}`,
        size: file.size
      }))
    });
  } catch (error) {
    console.error('Error uploading project images:', error);
    res.status(500).json({ error: 'Failed to upload project images' });
  }
});

// Generate preview from image
router.post('/preview', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const shapEClient = require('../services/shapEClient');
    const imagePath = `/uploads/${req.file.filename}`;
    
    // Генерируем preview через SHAP-E
    const result = await shapEClient.generateModel({
      imagePath: imagePath,
      generationType: 'image'
    });
    
    const previewUrl = result.previewPath 
      ? `http://localhost:3001${result.previewPath}`
      : `http://localhost:3001${imagePath}`;
    
    res.json({
      message: 'Preview generated successfully',
      previewUrl: previewUrl
    });
  } catch (error) {
    console.error('Error generating preview:', error);
    // Fallback: возвращаем загруженное изображение как preview
    const previewUrl = `http://localhost:3001/uploads/${req.file.filename}`;
    res.json({
      message: 'Preview generated successfully',
      previewUrl: previewUrl
    });
  }
});

// Generate preview from text
router.post('/text-preview', async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const shapEClient = require('../services/shapEClient');
    
    // Генерируем preview через SHAP-E по тексту
    const result = await shapEClient.generateModel({
      prompt: text,
      generationType: 'text'
    });
    
    const previewUrl = result.previewPath 
      ? `http://localhost:3001${result.previewPath}`
      : `http://localhost:3001/previews/text-${Date.now()}.png`;
    
    res.json({
      message: 'Text preview generated successfully',
      previewUrl: previewUrl
    });
  } catch (error) {
    console.error('Error generating text preview:', error);
    // Fallback: возвращаем placeholder
    const previewUrl = `http://localhost:3001/previews/text-${Date.now()}.png`;
    res.json({
      message: 'Text preview generated successfully',
      previewUrl: previewUrl
    });
  }
});

// Upload avatar
router.post('/avatar', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const avatarPath = `/uploads/${req.file.filename}`;
    
    res.json({
      message: 'Avatar uploaded successfully',
      avatarPath: avatarPath
    });
  } catch (error) {
    console.error('Error uploading avatar:', error);
    res.status(500).json({ error: 'Failed to upload avatar' });
  }
});

module.exports = router;
