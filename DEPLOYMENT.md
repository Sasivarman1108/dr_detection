# Deployment Guide

This guide explains how to run Wings AI on another computer for evaluation.

## Project Overview

Wings AI is a diabetic retinopathy screening and triage platform with:
- React frontend
- Node.js + Express backend
- Python + TensorFlow based ML inference

## Prerequisites

Install these first:

- Node.js
- npm
- Python 3.11
- Git

## Step 1: Clone The Repository

```powershell
git clone https://github.com/Sasivarman1108/dr_detection.git
cd dr_detection
npm install
cd backend
npm install
cd ..
cd C:\Users\Sasi\Downloads\retinascan\ml
py -3.11 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
PORT=5000
ML_PYTHON_BIN=C:\Users\Sasi\Downloads\retinascan\ml\.venv\Scripts\python.exe
ML_CHECKPOINT_PATH=C:\Users\Sasi\Downloads\retinascan\ml\models\efficientnet_best_model.keras
ML_INFERENCE_TIMEOUT_MS=120000
CORS_ORIGINS=http://localhost:3000


