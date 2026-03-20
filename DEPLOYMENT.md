# Deployment Guide

## Recommended Architecture

- Frontend: Vercel
- Backend: Render / Railway / VPS

This project should not be deployed fully on Vercel as-is because the backend depends on:
- local file uploads
- a writable JSON data file
- Python/TensorFlow model execution

## Frontend Deployment (Vercel)

1. Import this repo into Vercel.
2. Set the root directory to the project root.
3. Set the build command to:

   `npm run build`

4. Set the output directory to:

   `build`

5. Add the environment variable:

   `REACT_APP_API_BASE=https://<your-backend-domain>`

## Backend Deployment

Deploy the `backend` app on a server that supports:
- Node.js
- Python 3.11
- TensorFlow
- writable local storage or persistent volume

Required backend environment variables:

```text
PORT=5000
ML_PYTHON_BIN=/path/to/python
ML_CHECKPOINT_PATH=/path/to/efficientnet_best_model.keras
ML_INFERENCE_TIMEOUT_MS=120000
CORS_ORIGINS=http://localhost:3000,https://<your-vercel-domain>
```

## Important Notes

- `backend/uploads` must be writable in production.
- `backend/data/db.json` is currently file-based storage and should persist between restarts if you want saved users/patients.
- If you want a production-grade deployment, replace the JSON database and local uploads with managed storage.
