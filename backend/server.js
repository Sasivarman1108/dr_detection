require('dotenv').config();

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { spawn } = require('child_process');

const app = express();
const PORT = process.env.PORT || 5000;
const dataPath = path.join(__dirname, 'data', 'db.json');
const uploadDir = path.join(__dirname, 'uploads');
const mlRuntimeDir = path.join(__dirname, 'ml_runtime');
const externalMlDir = path.resolve(__dirname, '..', '..', 'retinascan', 'ml');
const defaultCheckpointPath = path.join(externalMlDir, 'models', 'efficientnet_best_model.keras');
const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:3000')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);

fs.mkdirSync(uploadDir, { recursive: true });

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error('Not allowed by CORS'));
  },
}));
app.use(express.json({ limit: '10mb' }));
app.use('/uploads', express.static(uploadDir));

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`),
});
const upload = multer({ storage });

function readDb() {
  return JSON.parse(fs.readFileSync(dataPath, 'utf8'));
}

function writeDb(data) {
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
}

function createToken() {
  return crypto.randomBytes(24).toString('hex');
}

function normalizeReviewStatus(status) {
  if (status === 'Reviewed') return 'Reviewed';
  if (status === 'Under Review') return 'Under Review';
  return 'Pending';
}

function reviewTone(status) {
  return {
    Pending: 'pending',
    'Under Review': 'under-review',
    Reviewed: 'reviewed',
  }[normalizeReviewStatus(status)];
}

function stageMeta(stageTone) {
  return {
    nodr: { stage: 'No DR', priority: 'low', avatarGradient: 'green' },
    mild: { stage: 'Mild NPDR', priority: 'low', avatarGradient: 'green' },
    moderate: { stage: 'Moderate', priority: 'medium', avatarGradient: 'indigo' },
    severe: { stage: 'Severe NPDR', priority: 'high', avatarGradient: 'orange' },
    pdr: { stage: 'PDR', priority: 'critical', avatarGradient: 'danger' },
  }[stageTone];
}

function mockPredict(age) {
  const numericAge = Number(age);
  if (numericAge >= 65) return { stageTone: 'pdr', confidence: 96 };
  if (numericAge >= 58) return { stageTone: 'severe', confidence: 91 };
  if (numericAge >= 50) return { stageTone: 'moderate', confidence: 86 };
  if (numericAge >= 40) return { stageTone: 'mild', confidence: 80 };
  return { stageTone: 'nodr', confidence: 74 };
}

function buildConfidenceBreakdown(stageTone, topConfidence) {
  const keys = ['nodr', 'mild', 'moderate', 'severe', 'pdr'];
  const remaining = Math.max(100 - topConfidence, 0);
  const others = keys.filter(key => key !== stageTone);
  const base = Math.floor(remaining / others.length);
  let extra = remaining % others.length;
  const values = Object.fromEntries(keys.map(key => [key, 0]));
  values[stageTone] = topConfidence;
  others.forEach(key => {
    values[key] = base + (extra > 0 ? 1 : 0);
    if (extra > 0) extra -= 1;
  });
  return values;
}

function probabilitiesToBreakdown(probabilities = []) {
  const keys = ['nodr', 'mild', 'moderate', 'severe', 'pdr'];
  return Object.fromEntries(
    keys.map((key, index) => [key, Math.round((Number(probabilities[index]) || 0) * 100)])
  );
}

function severityToStageTone(severity) {
  return ['nodr', 'mild', 'moderate', 'severe', 'pdr'][Number(severity)] || 'nodr';
}

function relativeUploadPath(filePath) {
  const relative = path.relative(uploadDir, filePath);
  return `/${path.join('uploads', relative).replace(/\\/g, '/')}`;
}

function runPythonInference(args, cwd) {
  return new Promise((resolve, reject) => {
    const pythonBin = process.env.ML_PYTHON_BIN || 'python';
    const child = spawn(pythonBin, args, { cwd, stdio: ['ignore', 'pipe', 'pipe'] });
    const timeoutMs = Number(process.env.ML_INFERENCE_TIMEOUT_MS || 15000);

    let stdout = '';
    let stderr = '';
    let settled = false;

    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      child.kill();
      reject(new Error(`Inference timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    child.stdout.on('data', chunk => {
      stdout += chunk.toString();
    });

    child.stderr.on('data', chunk => {
      stderr += chunk.toString();
    });

    child.on('error', error => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      reject(error);
    });
    child.on('close', code => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);

      if (code !== 0) {
        reject(new Error(stderr || `Inference failed with code ${code}`));
        return;
      }

      try {
        resolve(JSON.parse(stdout.trim()));
      } catch (error) {
        reject(new Error(`Unable to parse inference output: ${stdout || stderr}`));
      }
    });
  });
}

async function inferPredictionFromModel(filePath, scanId) {
  const checkpointPath = process.env.ML_CHECKPOINT_PATH || defaultCheckpointPath;
  if (!checkpointPath || !fs.existsSync(checkpointPath)) {
    return null;
  }

  if (!fs.existsSync(mlRuntimeDir)) {
    return null;
  }

  const processedDir = path.join(uploadDir, 'processed');
  fs.mkdirSync(processedDir, { recursive: true });

  const result = await runPythonInference(
    [
      '-m',
      'retinascan_ml.predict',
      '--image',
      filePath,
      '--checkpoint',
      path.resolve(checkpointPath),
      '--output-dir',
      processedDir,
      '--scan-id',
      scanId,
    ],
    mlRuntimeDir
  );

  const stageTone = severityToStageTone(result.severity);
  const meta = stageMeta(stageTone);
  const breakdown = probabilitiesToBreakdown(result.probabilities);

  return {
    stageTone,
    stage: result.severityLabel || meta.stage,
    confidence: Math.round((Number(result.confidence) || 0) * 100),
    confidenceByStage: breakdown,
    priority: meta.priority,
    avatarGradient: meta.avatarGradient,
    preprocessedImageUrl: result.heatmapImagePath ? relativeUploadPath(result.heatmapImagePath) : null,
    modelSummary: result.summary || '',
    lesions: result.lesions || [],
    source: 'model',
  };
}

function decoratePatient(patient) {
  return {
    ...patient,
    reviewStatus: normalizeReviewStatus(patient.reviewStatus),
    reviewStatusTone: reviewTone(patient.reviewStatus),
  };
}

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    title: user.title,
    initials: user.initials,
  };
}

function auth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  const db = readDb();
  const session = db.sessions.find(item => item.token === token);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });
  const user = db.users.find(item => item.id === session.userId);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  req.db = db;
  req.user = user;
  req.token = token;
  next();
}

function requireDoctor(req, res, next) {
  if (req.user.role !== 'doctor') return res.status(403).json({ error: 'Doctor access required' });
  next();
}

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const db = readDb();
  const user = db.users.find(item => item.email.toLowerCase() === String(email).toLowerCase());
  if (!user || user.password !== password) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const token = createToken();
  db.sessions = db.sessions.filter(item => item.userId !== user.id);
  db.sessions.push({ token, userId: user.id, createdAt: new Date().toISOString() });
  writeDb(db);

  return res.json({ token, user: publicUser(user) });
});

app.get('/api/auth/me', auth, (req, res) => {
  res.json({ user: publicUser(req.user) });
});

app.post('/api/auth/logout', auth, (req, res) => {
  const db = req.db;
  db.sessions = db.sessions.filter(item => item.token !== req.token);
  writeDb(db);
  res.json({ ok: true });
});

app.get('/api/bootstrap', auth, (req, res) => {
  const db = req.db;
  res.json({
    user: publicUser(req.user),
    patients: db.patients.map(decoratePatient),
    activities: db.activities,
    staffMembers: db.staffMembers,
    settings: db.settings,
  });
});

app.get('/api/staff', auth, (req, res) => {
  res.json({ staffMembers: req.db.staffMembers });
});

app.patch('/api/settings', auth, requireDoctor, (req, res) => {
  const db = req.db;
  db.settings = { ...db.settings, ...req.body };
  writeDb(db);
  res.json({ settings: db.settings });
});

app.post('/api/scans/upload', auth, upload.single('fundusImage'), (req, res) => {
  const { patientId, patientName, age, gender = '-', eye = 'OD' } = req.body;
  const db = req.db;
  const imagePath = req.file ? `/uploads/${req.file.filename}` : '';
  const scanId = `patient-${Date.now()}`;
  const checkpointPath = process.env.ML_CHECKPOINT_PATH || defaultCheckpointPath;
  const shouldUseModel = Boolean(req.file && checkpointPath && fs.existsSync(checkpointPath));

  const finalizePatient = async () => {
    const modelResult = shouldUseModel
      ? await inferPredictionFromModel(req.file.path, scanId)
      : null;
    const prediction = modelResult || mockPredict(age);
    const meta = stageMeta(prediction.stageTone);

    return decoratePatient({
      id: scanId,
      patientId,
      name: patientName,
      initials: patientName.split(' ').filter(Boolean).slice(0, 2).map(part => part[0].toUpperCase()).join(''),
    age: Number(age),
    gender,
    eye,
      stage: modelResult?.stage || meta.stage,
      stageTone: prediction.stageTone,
      confidence: prediction.confidence,
      uploaded: 'Just now',
      priority: modelResult?.priority || meta.priority,
      avatarGradient: modelResult?.avatarGradient || meta.avatarGradient,
      reviewStatus: 'Pending',
      report: '',
      imageUrl: imagePath,
      preprocessedImageUrl: modelResult?.preprocessedImageUrl || imagePath,
      confidenceByStage: modelResult?.confidenceByStage || buildConfidenceBreakdown(prediction.stageTone, prediction.confidence),
      modelSummary: modelResult?.modelSummary || '',
      lesions: modelResult?.lesions || [],
      predictionSource: modelResult ? 'model' : 'mock',
    });
  };

  finalizePatient()
    .then(patient => {
      db.patients.unshift(patient);
      db.activities.unshift(
        {
          id: `activity-${Date.now()}-1`,
          tone: 'model',
          icon: 'AI',
          message: `${patient.stage} predicted for ${patient.patientId}`,
          time: 'Just now',
          source: patient.modelSummary ? 'Model Inference' : 'Mock Prediction',
        },
        {
          id: `activity-${Date.now()}-2`,
          tone: 'upload',
          icon: 'UP',
          message: `Scan uploaded for ${patient.patientId}`,
          time: 'Just now',
          source: req.user.role === 'staff' ? 'Staff Upload' : 'Doctor Upload',
        }
      );
      writeDb(db);

      res.status(201).json({ patient, activities: db.activities });
    })
    .catch(error => {
      res.status(500).json({ error: error.message || 'Unable to process scan' });
    });
});

app.patch('/api/patients/:id/report', auth, requireDoctor, (req, res) => {
  const { report } = req.body;
  const db = req.db;
  const patient = db.patients.find(item => item.id === req.params.id);
  if (!patient) return res.status(404).json({ error: 'Patient not found' });
  patient.report = report || '';
  db.activities.unshift({
    id: `activity-${Date.now()}`,
    tone: 'done',
    icon: 'OK',
    message: `Doctor report saved for ${patient.name}`,
    time: 'Just now',
    source: 'Doctor Review',
  });
  writeDb(db);
  res.json({ patient: decoratePatient(patient), activities: db.activities });
});

app.patch('/api/patients/:id/review-status', auth, requireDoctor, (req, res) => {
  const { reviewStatus } = req.body;
  const db = req.db;
  const patient = db.patients.find(item => item.id === req.params.id);
  if (!patient) return res.status(404).json({ error: 'Patient not found' });
  patient.reviewStatus = normalizeReviewStatus(reviewStatus);
  db.activities.unshift({
    id: `activity-${Date.now()}`,
    tone: 'done',
    icon: 'OK',
    message: `${patient.name} marked as ${patient.reviewStatus}`,
    time: 'Just now',
    source: 'Doctor Review',
  });
  writeDb(db);
  res.json({ patient: decoratePatient(patient), activities: db.activities });
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`dr_hackwings backend running on http://localhost:${PORT}`);
});
