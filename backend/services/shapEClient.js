const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const SHAPE_SERVICE_URL = process.env.SHAPE_SERVICE_URL || 'http://localhost:8000';

class ShapEClient {
  constructor(baseURL = SHAPE_SERVICE_URL) {
    this.baseURL = baseURL;
  }

  async generateModel({ imagePath, prompt, generationType = 'image' }) {
    try {
      const formData = new FormData();
      
      // Add image if provided
      if (imagePath) {
        // Обрабатываем как относительный путь (/uploads/filename) или полный путь
        let imageFullPath;
        if (imagePath.startsWith('/uploads/')) {
          imageFullPath = path.join(__dirname, '..', imagePath);
        } else if (path.isAbsolute(imagePath)) {
          imageFullPath = imagePath;
        } else {
          imageFullPath = path.join(__dirname, '../uploads', path.basename(imagePath));
        }
        
        if (!fs.existsSync(imageFullPath)) {
          throw new Error(`Image file not found: ${imageFullPath}`);
        }
        formData.append('image', fs.createReadStream(imageFullPath));
      }
      
      // Add prompt if provided
      if (prompt) {
        formData.append('prompt', prompt);
      }
      
      // Add generation type
      formData.append('generation_type', generationType);
      
      // Request preview generation
      formData.append('generate_preview', 'true');
      
      const response = await axios.post(`${this.baseURL}/generate`, formData, {
        headers: formData.getHeaders(),
        timeout: 300000 // 5 minutes timeout
      });
      
      // Преобразуем пути из контейнера в относительные пути для backend
      let modelPath = response.data.model_path;
      let previewPath = response.data.preview_path || null;
      
      // Если пути из контейнера SHAP-E, преобразуем их
      if (modelPath && modelPath.startsWith('/app/')) {
        modelPath = modelPath.replace('/app/models', '/models');
      }
      if (previewPath && previewPath.startsWith('/app/')) {
        previewPath = previewPath.replace('/app/previews', '/previews');
      }
      
      return {
        modelPath: modelPath,
        previewPath: previewPath,
        status: response.data.status
      };
    } catch (error) {
      console.error('Error calling SHAP-E service:', error);
      throw new Error(`Failed to generate model: ${error.message}`);
    }
  }

  async getStatus(taskId) {
    try {
      const response = await axios.get(`${this.baseURL}/status/${taskId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting status:', error);
      throw new Error(`Failed to get status: ${error.message}`);
    }
  }
}

module.exports = new ShapEClient();
