const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export interface Project {
  id: number;
  name: string;
  description?: string;
  status: 'pending' | 'generating' | 'completed' | 'failed';
  image_path?: string;
  model_path?: string;
  preview_path?: string;
  prompt?: string;
  generation_type?: 'image' | 'text' | 'both';
  created_at: string;
  updated_at: string;
}

export interface UploadResponse {
  message: string;
  filename: string;
  path: string;
  size: number;
}

export interface GenerateResponse {
  message: string;
  projectId: number;
  modelPath: string;
  previewPath?: string;
}

class ApiService {
  private baseURL: string;

  constructor() {
    this.baseURL = API_URL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Projects
  async getProjects(): Promise<Project[]> {
    return this.request<Project[]>('/api/projects');
  }

  async getProject(id: number): Promise<Project> {
    return this.request<Project>(`/api/projects/${id}`);
  }

  async createProject(
    name: string,
    description?: string,
    prompt?: string,
    generationType?: 'image' | 'text' | 'both'
  ): Promise<Project> {
    return this.request<Project>('/api/projects', {
      method: 'POST',
      body: JSON.stringify({ name, description, prompt, generationType }),
    });
  }

  async updateProject(
    id: number,
    data: Partial<Project>
  ): Promise<Project> {
    return this.request<Project>(`/api/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteProject(id: number): Promise<void> {
    return this.request<void>(`/api/projects/${id}`, {
      method: 'DELETE',
    });
  }

  // Upload
  async uploadImage(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`${this.baseURL}/api/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Generate
  async generateModel(
    projectId: number,
    imagePath?: string,
    prompt?: string,
    generationType?: 'image' | 'text' | 'both'
  ): Promise<GenerateResponse> {
    return this.request<GenerateResponse>('/api/generate', {
      method: 'POST',
      body: JSON.stringify({ projectId, imagePath, prompt, generationType }),
    });
  }

  async getGenerationStatus(projectId: number): Promise<{
    projectId: number;
    status: string;
    modelPath?: string;
    previewPath?: string;
  }> {
    return this.request(`/api/generate/status/${projectId}`);
  }
}

export default new ApiService();
