# AI-PPT Deployment Guide for Railway

## Overview
This project contains:
- Backend API service
- Frontend Vite app
- PostgreSQL database
- Redis
- Background worker for presentation generation

## Recommended Railway setup

### 1. Create services
- Create one Railway service for the backend
- Create one Railway service for the worker
- Create one Railway service for the frontend
- Add PostgreSQL and Redis plugins/services

### 2. Environment variables
Set these variables in the backend service:
- NODE_ENV=production
- PORT=4000
- DATABASE_URL=<postgresql connection url>
- REDIS_URL=<redis connection url>
- JWT_ACCESS_SECRET=<strong random secret>
- JWT_REFRESH_SECRET=<strong random secret>
- CLIENT_URL=<frontend-url>
- AI_PROVIDER_API_KEY=<optional>
- AI_PROVIDER_MODEL=gemini-1.5-flash
- UNSPLASH_ACCESS_KEY=<optional>

Set these variables in the frontend service:
- VITE_API_BASE_URL=<backend-url>/api/v1

### 3. Deploy order
1. Deploy PostgreSQL and Redis
2. Deploy backend service
3. Deploy worker service
4. Deploy frontend service

### 4. Health check
Backend health endpoint:
- /api/v1/health

### 5. Notes
- The backend image runs Prisma migrations automatically on startup.
- The frontend is built as a static Vite app and served by Railway.
