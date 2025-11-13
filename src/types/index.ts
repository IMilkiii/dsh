export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  images: string[];
  createdAt: Date;
  updatedAt: Date;
  status: 'processing' | 'completed' | 'failed';
  resultFile?: string;
}

export interface UploadedImage {
  id: string;
  file: File;
  preview: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  name: string;
  confirmPassword: string;
}
