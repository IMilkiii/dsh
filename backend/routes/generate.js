const express = require('express');
const router = express.Router();
const axios = require('axios');
const { Pool } = require('pg');
const shapEClient = require('../services/shapEClient');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/dsh',
});

const SHAPE_SERVICE_URL = process.env.SHAPE_SERVICE_URL || 'http://localhost:8000';

// Generate 3D model
router.post('/', async (req, res) => {
  try {
    const { projectId, imagePath, prompt, generationType } = req.body;
    
    if (!projectId) {
      return res.status(400).json({ error: 'Project ID is required' });
    }
    
    // Validate input: either imagePath or prompt must be provided
    if (!imagePath && !prompt) {
      return res.status(400).json({ error: 'Either image path or prompt (text) is required' });
    }
    
    // Determine generation type
    const genType = generationType || (imagePath && prompt ? 'both' : imagePath ? 'image' : 'text');
    
    // Update project status to 'generating'
    await pool.query(
      'UPDATE projects SET status = $1, generation_type = $2, updated_at = NOW() WHERE id = $3',
      ['generating', genType, projectId]
    );
    
    // Call SHAP-E service
    const response = await shapEClient.generateModel({
      imagePath: imagePath || null,
      prompt: prompt || null,
      generationType: genType
    });
    
    // Update project with result
    await pool.query(
      'UPDATE projects SET status = $1, model_path = $2, preview_path = $3, updated_at = NOW() WHERE id = $4',
      ['completed', response.modelPath, response.previewPath || null, projectId]
    );
    
    res.json({
      message: '3D model generated successfully',
      projectId: projectId,
      modelPath: response.modelPath,
      previewPath: response.previewPath
    });
  } catch (error) {
    console.error('Error generating 3D model:', error);
    
    // Update project status to 'failed'
    if (req.body.projectId) {
      await pool.query(
        'UPDATE projects SET status = $1, updated_at = NOW() WHERE id = $2',
        ['failed', req.body.projectId]
      );
    }
    
    res.status(500).json({ error: 'Failed to generate 3D model', details: error.message });
  }
});

// Get generation status
router.get('/status/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const result = await pool.query('SELECT status, model_path, preview_path FROM projects WHERE id = $1', [projectId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    res.json({
      projectId: projectId,
      status: result.rows[0].status,
      modelPath: result.rows[0].model_path,
      previewPath: result.rows[0].preview_path
    });
  } catch (error) {
    console.error('Error fetching generation status:', error);
    res.status(500).json({ error: 'Failed to fetch generation status' });
  }
});

module.exports = router;
