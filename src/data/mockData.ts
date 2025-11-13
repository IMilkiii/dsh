import { Project } from '../types';

export const mockProjects: Project[] = [
  {
    id: '1',
    name: 'Моя первая модель',
    description: '3D модель созданная из фотографии архитектурного объекта',
    images: [
      'https://via.placeholder.com/400x300/667eea/ffffff?text=Building+1',
      'https://via.placeholder.com/400x300/764ba2/ffffff?text=Building+2'
    ],
    createdAt: new Date('2024-03-15'),
    updatedAt: new Date('2024-03-15'),
    status: 'completed',
    resultFile: 'building-model.fbx'
  },
  {
    id: '2',
    name: 'Архитектурный проект',
    description: 'Детализированная модель здания с текстурами',
    images: [
      'https://via.placeholder.com/400x300/28a745/ffffff?text=Architecture+1',
      'https://via.placeholder.com/400x300/20c997/ffffff?text=Architecture+2',
      'https://via.placeholder.com/400x300/17a2b8/ffffff?text=Architecture+3'
    ],
    createdAt: new Date('2024-03-12'),
    updatedAt: new Date('2024-03-12'),
    status: 'completed',
    resultFile: 'architecture-model.fbx'
  },
  {
    id: '3',
    name: 'Игровой объект',
    description: '3D модель для использования в игровом движке',
    images: [
      'https://via.placeholder.com/400x300/dc3545/ffffff?text=Game+Object+1'
    ],
    createdAt: new Date('2024-03-10'),
    updatedAt: new Date('2024-03-10'),
    status: 'completed',
    resultFile: 'game-object.fbx'
  },
  {
    id: '4',
    name: 'Персонаж',
    description: '3D модель персонажа для анимации',
    images: [
      'https://via.placeholder.com/400x300/ffc107/ffffff?text=Character+1',
      'https://via.placeholder.com/400x300/fd7e14/ffffff?text=Character+2'
    ],
    createdAt: new Date('2024-03-08'),
    updatedAt: new Date('2024-03-08'),
    status: 'completed',
    resultFile: 'character-model.fbx'
  },
  {
    id: '5',
    name: 'Интерьер',
    description: '3D модель интерьера комнаты',
    images: [
      'https://via.placeholder.com/400x300/6f42c1/ffffff?text=Interior+1',
      'https://via.placeholder.com/400x300/e83e8c/ffffff?text=Interior+2',
      'https://via.placeholder.com/400x300/20c997/ffffff?text=Interior+3',
      'https://via.placeholder.com/400x300/17a2b8/ffffff?text=Interior+4'
    ],
    createdAt: new Date('2024-03-05'),
    updatedAt: new Date('2024-03-05'),
    status: 'completed',
    resultFile: 'interior-model.fbx'
  }
];

export const mockUser = {
  id: '1',
  email: 'user@example.com',
  name: 'Пользователь',
  avatar: undefined
};
