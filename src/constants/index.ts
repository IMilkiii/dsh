export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  PROJECT_NEW: '/project/new',
  PROJECT_RESULT: '/project/result',
} as const;

export const MAX_UPLOAD_IMAGES = 4;
export const MIN_UPLOAD_IMAGES = 1;

export const SUPPORTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export const PROJECT_STATUS = {
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
} as const;

export const API_ENDPOINTS = {
  LOGIN: '/api/auth/login',
  REGISTER: '/api/auth/register',
  PROJECTS: '/api/projects',
  UPLOAD: '/api/upload',
  GENERATE: '/api/generate',
} as const;
