# DSH - 3D Model Generator

Веб-приложение для генерации 3D моделей на основе фотографий с использованием SHAP-E.

## Структура проекта

- `backend/` - Node.js backend сервер
- `src/` - React frontend приложение
- `shap-e-service/` - Python сервис для генерации 3D моделей
- `public/` - Статические файлы

## Требования

- Node.js >= 16
- Docker и Docker Compose
- PostgreSQL (или через Docker)

## Установка и запуск

### С использованием Docker Compose

```bash
# Сборка и запуск всех сервисов
docker-compose up --build

# Запуск в фоновом режиме
docker-compose up -d --build

# Просмотр логов
docker-compose logs -f

# Остановка сервисов
docker-compose down

# Остановка с удалением volumes (удалит все данные)
docker-compose down -v
```

После запуска:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- SHAP-E Service: http://localhost:8000
- PostgreSQL: localhost:5432

### Локальная разработка

#### Backend

```bash
cd backend
npm install
npm run dev
```

Backend будет доступен на `http://localhost:3001`

#### Frontend

```bash
npm install
npm start
```

Frontend будет доступен на `http://localhost:3000`

#### SHAP-E Service

```bash
cd shap-e-service
# Установите зависимости Python
pip install -r requirements.txt
# (опционально) установите путь к кэшу, чтобы переиспользовать загруженные веса
set HF_HOME=%cd%/cache
# Запустите сервис
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

Кэш моделей SHAP-E сохраняется в `shap-e-service/cache`. В Docker Compose эта папка автоматически монтируется в контейнер, чтобы веса моделей скачивались один раз и переиспользовались при следующих запусках.

## Переменные окружения

### Для локальной разработки

Создайте файл `.env` в корне проекта:

```
REACT_APP_API_URL=http://localhost:3001
DATABASE_URL=postgresql://user:password@localhost:5432/dsh
SHAPE_SERVICE_URL=http://localhost:8000
```

### Для Docker

Переменные окружения уже настроены в `docker-compose.yml`. При необходимости можно создать `.env` файл для переопределения:

```
POSTGRES_USER=user
POSTGRES_PASSWORD=password
POSTGRES_DB=dsh
```

## Структура данных в Docker

Docker Compose создает следующие volumes для хранения данных:

- `postgres_data` - данные PostgreSQL
- `backend_uploads` - загруженные изображения
- `backend_models` - сгенерированные 3D модели
- `backend_previews` - превью моделей
- `shape_models` - модели из SHAP-E сервиса
- `shape_previews` - превью из SHAP-E сервиса

Все данные сохраняются между перезапусками контейнеров.

## API Endpoints

- `GET /api/projects` - Получить список проектов
- `POST /api/projects` - Создать новый проект (поддерживает prompt и generationType)
- `GET /api/projects/:id` - Получить проект по ID
- `PUT /api/projects/:id` - Обновить проект
- `DELETE /api/projects/:id` - Удалить проект
- `POST /api/upload` - Загрузить изображение
- `POST /api/generate` - Запустить генерацию 3D модели (поддерживает генерацию по тексту, изображению или обоим)
- `GET /api/generate/status/:projectId` - Получить статус генерации

## Возможности генерации

Проект поддерживает три типа генерации 3D моделей:

1. **По изображению** (`generationType: 'image'`) - генерация на основе загруженной фотографии
2. **По тексту** (`generationType: 'text'`) - генерация на основе текстового описания (промпта)
3. **Комбинированная** (`generationType: 'both'`) - генерация с использованием и изображения, и текстового промпта

### Примеры использования

**Генерация по тексту:**
```json
POST /api/generate
{
  "projectId": 1,
  "prompt": "a red sports car with sleek design",
  "generationType": "text"
}
```

**Генерация по изображению:**
```json
POST /api/generate
{
  "projectId": 1,
  "imagePath": "/uploads/image-123.jpg",
  "generationType": "image"
}
```

**Комбинированная генерация:**
```json
POST /api/generate
{
  "projectId": 1,
  "imagePath": "/uploads/image-123.jpg",
  "prompt": "make it more futuristic",
  "generationType": "both"
}
```

## Превью моделей

При генерации 3D модели автоматически создается превью (изображение), которое сохраняется в поле `preview_path` проекта. Превью можно использовать для быстрого просмотра результата без загрузки полной 3D модели.

## Технологии

- Frontend: React, TypeScript, React Router
- Backend: Node.js, Express, PostgreSQL
- 3D Generation: SHAP-E (Python)

