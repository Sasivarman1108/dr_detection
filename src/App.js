import React, { useEffect, useMemo, useState } from 'react';
import DashboardTopbar from './components/DashboardTopbar';
import StatsGrid from './components/StatsGrid';
import PatientQueueTable from './components/PatientQueueTable';
import ActivityPanel from './components/ActivityPanel';
import StaffPanel from './components/StaffPanel';
import UploadScanForm from './components/UploadScanForm';
import PatientDetailsView from './components/PatientDetailsView';
import PatientsListView from './components/PatientsListView';
import AnalyticsView from './components/AnalyticsView';
import StaffDirectoryView from './components/StaffDirectoryView';
import SettingsView from './components/SettingsView';
import LoginView from './components/LoginView';
import {
  queueFilters,
  stats,
} from './data/dashboardData';
import {
  API_BASE,
  clearStoredToken,
  getBootstrap,
  getStoredToken,
  login,
  logout,
  savePatientReport,
  updateReviewStatus,
  updateSettings as persistSettings,
  uploadScan,
} from './lib/api';

const CATEGORY_KEYS = ['nodr', 'mild', 'moderate', 'severe', 'pdr'];
const REVIEW_STATUS_TONE = {
  Pending: 'pending',
  'Under Review': 'under-review',
  Reviewed: 'reviewed',
};

function normalizeReviewStatus(status) {
  if (status === 'Reviewed') return 'Reviewed';
  if (status === 'Under Review') return 'Under Review';
  return 'Pending';
}

function buildConfidenceBreakdown(stageTone, topConfidence) {
  const remainder = Math.max(100 - topConfidence, 0);
  const otherKeys = CATEGORY_KEYS.filter(key => key !== stageTone);
  const base = Math.floor(remainder / otherKeys.length);
  let extra = remainder % otherKeys.length;

  const result = Object.fromEntries(CATEGORY_KEYS.map(key => [key, 0]));
  result[stageTone] = topConfidence;

  otherKeys.forEach(key => {
    result[key] = base + (extra > 0 ? 1 : 0);
    if (extra > 0) extra -= 1;
  });

  return result;
}

function createPlaceholderImage(label, tone, subtitle) {
  const backgrounds = {
    nodr: ['#d1fae5', '#10b981'],
    mild: ['#ecfccb', '#84cc16'],
    moderate: ['#fef3c7', '#f59e0b'],
    severe: ['#ffedd5', '#f97316'],
    pdr: ['#fee2e2', '#ef4444'],
  };

  const [bg, accent] = backgrounds[tone] ?? backgrounds.nodr;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="640" height="480" viewBox="0 0 640 480">
      <defs>
        <radialGradient id="g" cx="50%" cy="45%" r="58%">
          <stop offset="0%" stop-color="${accent}" stop-opacity="0.95"/>
          <stop offset="62%" stop-color="${bg}" stop-opacity="0.96"/>
          <stop offset="100%" stop-color="#111827" stop-opacity="1"/>
        </radialGradient>
      </defs>
      <rect width="640" height="480" fill="#0f172a"/>
      <circle cx="320" cy="220" r="165" fill="url(#g)"/>
      <circle cx="320" cy="220" r="120" fill="none" stroke="rgba(255,255,255,0.16)" stroke-width="10"/>
      <text x="320" y="395" text-anchor="middle" font-family="Arial, sans-serif" font-size="26" fill="#e5e7eb">${label}</text>
      <text x="320" y="430" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" fill="#94a3b8">${subtitle}</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function enrichPatient(patient) {
  const patientId = patient.patientId ?? patient.patientMeta.split('|')[0].trim().replace('#', '');
  const age = patient.age ?? patient.patientMeta.split('|')[1]?.trim().replace('y', '') ?? '';
  const gender = patient.gender ?? patient.patientMeta.split('|')[2]?.trim() ?? '-';
  const topConfidence = patient.confidence ?? 80;
  const imageUrl = patient.imageUrl
    ? `${API_BASE}${patient.imageUrl}`
    : createPlaceholderImage(patient.name, patient.stageTone, 'Fundus Image');
  const preprocessedImageUrl = patient.preprocessedImageUrl
    ? `${API_BASE}${patient.preprocessedImageUrl}`
    : imageUrl;

  const normalizedReviewStatus = normalizeReviewStatus(patient.reviewStatus ?? patient.status);
  const patientMeta = `#${patientId} | ${age}y | ${gender}`;
  const actionTone = patient.stageTone === 'pdr' ? 'urgent' : 'normal';
  const actionLabel = patient.stageTone === 'pdr' ? 'Review Now' : 'Review';

  return {
    ...patient,
    patientId,
    age,
    gender,
    imageUrl,
    preprocessedImageUrl,
    confidenceByStage: patient.confidenceByStage ?? buildConfidenceBreakdown(patient.stageTone, topConfidence),
    report: patient.report ?? '',
    patientMeta,
    actionLabel,
    actionTone,
    reviewStatus: normalizedReviewStatus,
    reviewStatusTone: REVIEW_STATUS_TONE[normalizedReviewStatus],
  };
}

export default function App() {
  const [authReady, setAuthReady] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loginError, setLoginError] = useState('');
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [activeNavId, setActiveNavId] = useState('severity-queue');
  const [patientsState, setPatientsState] = useState([]);
  const [activitiesState, setActivitiesState] = useState([]);
  const [staffMembersState, setStaffMembersState] = useState([]);
  const [queueFilter, setQueueFilter] = useState('Pending');
  const [stageFilter, setStageFilter] = useState('all');
  const [submittingScan, setSubmittingScan] = useState(false);
  const [predictionResult, setPredictionResult] = useState(null);
  const [uploadError, setUploadError] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [settings, setSettings] = useState({
    defaultQueueFilter: 'Pending',
    showReviewedInPatients: true,
    urgentAlerts: true,
    reportReminders: true,
    reportTemplate: 'Referral Advice',
    campName: 'Villupuram Rural Eye Camp',
  });

  const loadBootstrap = async () => {
    const data = await getBootstrap();
    setCurrentUser(data.user);
    setPatientsState((data.patients || []).map(enrichPatient));
    setActivitiesState(data.activities || []);
    setStaffMembersState(data.staffMembers || []);
    setSettings(prev => ({ ...prev, ...(data.settings || {}) }));
  };

  useEffect(() => {
    const initialize = async () => {
      const token = getStoredToken();
      if (!token) {
        setAuthReady(true);
        return;
      }

      try {
        await loadBootstrap();
      } catch (_error) {
        clearStoredToken();
        setCurrentUser(null);
      } finally {
        setAuthReady(true);
      }
    };

    initialize();
  }, []);

  useEffect(() => {
    setQueueFilter(settings.defaultQueueFilter);
  }, [settings.defaultQueueFilter]);

  const navSections = useMemo(() => {
    if (!currentUser) return [];

    const commonRecords = [
      { id: 'patients', label: 'Patients', icon: 'PT' },
      { id: 'staff', label: 'Staff', icon: 'SF' },
    ];

    const doctorSections = [
      {
        label: 'Main Menu',
        items: [
          { id: 'severity-queue', label: 'Severity Queue', icon: 'SQ', badge: String(patientsState.filter(patient => patient.reviewStatus !== 'Reviewed').length), active: true },
          { id: 'upload-scan', label: 'Upload Scan', icon: 'US' },
          { id: 'analytics', label: 'Analytics', icon: 'AN', badgeVariant: 'info' },
        ],
      },
      {
        label: 'Records',
        items: [...commonRecords, { id: 'settings', label: 'Settings', icon: 'ST' }],
      },
    ];

    const staffSections = [
      {
        label: 'Main Menu',
        items: [
          { id: 'severity-queue', label: 'Severity Queue', icon: 'SQ', badge: String(patientsState.filter(patient => patient.reviewStatus !== 'Reviewed').length), active: true },
          { id: 'upload-scan', label: 'Upload Scan', icon: 'US' },
          { id: 'analytics', label: 'Analytics', icon: 'AN' },
        ],
      },
      {
        label: 'Records',
        items: commonRecords,
      },
    ];

    return currentUser.role === 'doctor' ? doctorSections : staffSections;
  }, [currentUser, patientsState]);

  const derivedStats = useMemo(() => {
    const total = patientsState.length || 1;

    return stats.map(stat => {
      const count = patientsState.filter(patient => patient.stageTone === stat.stageTone).length;
      const percent = Math.round((count / total) * 100);

      return {
        ...stat,
        value: count,
        percent,
        barWidth: percent,
      };
    });
  }, [patientsState]);

  const handleViewStage = tone => {
    setActiveNavId('severity-queue');
    setQueueFilter(settings.defaultQueueFilter);
    setStageFilter(tone);
  };

  const selectedPatient = useMemo(
    () => patientsState.find(patient => patient.id === selectedPatientId) ?? null,
    [patientsState, selectedPatientId]
  );

  const isDoctor = currentUser?.role === 'doctor';

  const handleSubmitScan = async form => {
    setSubmittingScan(true);
    setUploadError('');

    try {
      const response = await uploadScan(form);
      setPatientsState(prev => [enrichPatient(response.patient), ...prev]);
      setActivitiesState(response.activities || []);
      setPredictionResult({
        patientId: response.patient.patientId,
        name: response.patient.name,
        stage: response.patient.stage,
        stageTone: response.patient.stageTone,
        confidence: response.patient.confidence,
        confidenceByStage: response.patient.confidenceByStage,
        fileName: form.fundusImage?.name ?? 'Uploaded image',
      });
      setActiveNavId('severity-queue');
      setQueueFilter(settings.defaultQueueFilter);
      setStageFilter(response.patient.stageTone);
    } catch (error) {
      setUploadError(error.message || 'Upload failed');
    } finally {
      setSubmittingScan(false);
    }
  };

  const handleViewPatient = patientId => {
    setSelectedPatientId(patientId);
    setActiveNavId('patient-details');
  };

  const handleSaveReport = async (patientId, report) => {
    const response = await savePatientReport(patientId, report);
    setPatientsState(prev => prev.map(patient => (patient.id === patientId ? enrichPatient(response.patient) : patient)));
    setActivitiesState(response.activities || []);
  };

  const handleUpdateReviewStatus = async (patientId, reviewStatus) => {
    const response = await updateReviewStatus(patientId, reviewStatus);
    setPatientsState(prev => prev.map(patient => (patient.id === patientId ? enrichPatient(response.patient) : patient)));
    setActivitiesState(response.activities || []);
  };

  const handleSettingChange = (key, value) => {
    const nextSettings = { ...settings, [key]: value };
    setSettings(nextSettings);
    if (isDoctor) {
      persistSettings(nextSettings).then(response => {
        setSettings(response.settings);
      });
    }
  };

  const handleSignIn = async credentials => {
    setIsSigningIn(true);
    setLoginError('');
    try {
      await login(credentials);
      await loadBootstrap();
    } catch (error) {
      setLoginError(error.message);
    } finally {
      setIsSigningIn(false);
      setAuthReady(true);
    }
  };

  const handleSignOut = async () => {
    await logout();
    setCurrentUser(null);
    setPatientsState([]);
    setActivitiesState([]);
    setStaffMembersState([]);
    setPredictionResult(null);
    setSelectedPatientId(null);
  };

  if (!authReady) {
    return (
      <section className="signed-out-shell">
        <div className="signed-out-card">
          <div className="signed-out-title">Loading...</div>
          <p className="signed-out-text">Restoring your session.</p>
        </div>
      </section>
    );
  }

  if (!currentUser) {
    return <LoginView onLogin={handleSignIn} errorMessage={loginError} loading={isSigningIn} />;
  }

  return (
    <div className="page-shell">
      <div className="main-area">
        <DashboardTopbar
          sections={navSections}
          doctorProfile={currentUser}
          campName={settings.campName}
          activeItemId={activeNavId}
          onNavChange={setActiveNavId}
          onSignOut={handleSignOut}
        />

        <main className="content">
          <section className="page-header">
            <div>
              <h1 className="page-title">
                {activeNavId === 'upload-scan'
                  ? 'Upload Scan'
                  : activeNavId === 'patient-details'
                    ? 'Patient Review'
                    : activeNavId === 'analytics'
                      ? 'Analytics'
                      : activeNavId === 'patients'
                        ? 'Patients'
                        : activeNavId === 'staff'
                          ? 'Staff'
                          : activeNavId === 'settings'
                            ? 'Settings'
                    : 'Severity Queue'}
              </h1>
              <p className="page-subtitle">
                {activeNavId === 'upload-scan'
                  ? 'Submit patient details and retinal image to get a model prediction'
                  : activeNavId === 'patient-details'
                    ? 'Review the patient, understand the model output, and add the doctor report'
                    : activeNavId === 'analytics'
                      ? 'Three low-cognitive-load views to understand age patterns, DR burden, and review progress'
                    : activeNavId === 'patients'
                      ? 'Browse all patients and check whether a doctor report has been added'
                      : activeNavId === 'staff'
                        ? 'View all staff members, their roles, stations, email contacts, and current workload'
                        : activeNavId === 'settings'
                          ? 'Basic app preferences for queue behavior, alerts, and report defaults'
                      : `${patientsState.filter(patient => patient.reviewStatus !== 'Reviewed').length} patients pending doctor action`}
              </p>
            </div>

            <div className="header-actions">
              {activeNavId === 'upload-scan' || activeNavId === 'patient-details' ? (
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setActiveNavId('severity-queue')}
                >
                  Back to Queue
                </button>
              ) : (
                <>
                  <button type="button" className="btn btn-ghost" onClick={() => setStageFilter('all')}>Refresh</button>
                  <button type="button" className="btn btn-primary" onClick={() => setActiveNavId('upload-scan')}>
                    Upload Scan
                  </button>
                </>
              )}
            </div>
          </section>

          {activeNavId === 'upload-scan' ? (
            <UploadScanForm
              onSubmitScan={handleSubmitScan}
              submitting={submittingScan}
              predictionResult={predictionResult}
              uploadError={uploadError}
            />
          ) : activeNavId === 'patient-details' && selectedPatient ? (
            <PatientDetailsView
              patient={selectedPatient}
              onBack={() => setActiveNavId('severity-queue')}
              onSaveReport={handleSaveReport}
              onUpdateReviewStatus={handleUpdateReviewStatus}
              canManageReview={isDoctor}
              canEditReport={isDoctor}
            />
          ) : activeNavId === 'analytics' ? (
            <AnalyticsView patients={patientsState} />
          ) : activeNavId === 'staff' ? (
            <StaffDirectoryView staffMembers={staffMembersState} />
          ) : activeNavId === 'settings' && isDoctor ? (
            <SettingsView settings={settings} onSettingChange={handleSettingChange} />
          ) : activeNavId === 'patients' ? (
            <PatientsListView
              patients={settings.showReviewedInPatients ? patientsState : patientsState.filter(patient => patient.reviewStatus !== 'Reviewed')}
              onViewPatient={handleViewPatient}
            />
          ) : (
            <>
              <StatsGrid stats={derivedStats} onViewStage={handleViewStage} />

              <section className="two-column">
                <PatientQueueTable
                  patients={patientsState}
                  filters={queueFilters}
                  stageFilter={stageFilter}
                  onClearStageFilter={() => setStageFilter('all')}
                  activeFilter={queueFilter}
                  onFilterChange={setQueueFilter}
                  onViewPatient={handleViewPatient}
                />

                <div className="side-panels">
                  <ActivityPanel activities={activitiesState} />
                  <StaffPanel staffMembers={staffMembersState} />
                </div>
              </section>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
