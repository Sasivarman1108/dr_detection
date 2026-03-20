# dr_detection
# Wings AI

Wings AI is a diabetic retinopathy screening and triage platform built to help eye camps, clinics, and doctors review retinal fundus scans faster. The system supports scan upload, AI-assisted DR category prediction, patient review workflows, per-class probability breakdowns, and analytics for screening operations.

## Problem Overview

Diabetic retinopathy can cause preventable vision loss when screening and referral are delayed. In many rural and high-volume screening settings, specialists are limited, patient volume is high, and early prioritization is difficult. Wings AI addresses this by helping staff upload scans quickly and helping doctors focus on higher-risk cases first.

## What The Project Does

- Allows doctor and staff login
- Uploads patient details and retinal fundus images
- Runs diabetic retinopathy prediction across five categories
- Shows per-class probabilities for clinical review
- Displays original and preprocessed images
- Supports doctor review status updates and report writing
- Tracks patients, activities, and workflow analytics
- Provides a deployed frontend and backend-ready architecture

## DR Categories

- No DR
- Mild NPDR
- Moderate NPDR
- Severe NPDR
- Proliferative DR

## Key Features

- Role-based access for doctor and staff users
- Patient queue for pending and reviewed cases
- Detailed patient review page
- Model confidence breakdown for each class
- Analytics dashboard for DR burden and workflow
- Backend model inference integration using Python and TensorFlow
- Frontend deployed on Vercel
- Backend deployed separately for API access

## Tech Stack

### Frontend

- React
- CSS
- Create React App

### Backend

- Node.js
- Express
- Multer
- JSON file storage

### ML Inference

- Python
- TensorFlow
- OpenCV
- NumPy

## Novelty Of The Solution

Wings AI combines diabetic retinopathy classification with an actual review workflow instead of stopping at prediction alone. The platform is designed not just as a classifier, but as a screening support tool for practical use in doctor-led triage. It offers:

- class-wise prediction probabilities
- doctor review flow
- patient-specific reports
- retinal image preprocessing preview
- analytics for screening operations

This makes it more useful for real-world camp and clinic settings than a plain image classifier demo.

## Setup And Installation

### Prerequisites

- Node.js
- npm
- Python 3.11 recommended for ML inference
## DEPLOYED IN VERCEL

https://drdetectionhackwings.vercel.app
Default Login Credentials
doctor@drishtiai.local
Doctor@123

Staff:
staff@drishtiai.local
Staff@123

### Clone And Install

```powershell
git clone https://github.com/Sasivarman1108/dr_detection.git
cd dr_detection
npm install
cd backend
npm install
