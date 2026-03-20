import React, { useEffect, useState } from 'react';

const CATEGORY_ORDER = [
  { key: 'nodr', label: 'No DR' },
  { key: 'mild', label: 'Mild NPDR' },
  { key: 'moderate', label: 'Moderate NPDR' },
  { key: 'severe', label: 'Severe NPDR' },
  { key: 'pdr', label: 'PDR' },
];

export default function PatientDetailsView({
  patient,
  onBack,
  onSaveReport,
  onUpdateReviewStatus,
  canManageReview,
  canEditReport,
}) {
  const [reportText, setReportText] = useState(patient.report ?? '');
  const isPending = patient.reviewStatus === 'Pending';
  const isUnderReview = patient.reviewStatus === 'Under Review';
  const isReviewed = patient.reviewStatus === 'Reviewed';

  useEffect(() => {
    setReportText(patient.report ?? '');
  }, [patient]);

  return (
    <section className="details-shell">
      <div className="details-header">
        <div>
          <button type="button" className="btn btn-ghost back-button" onClick={onBack}>
            Back to Queue
          </button>
          <h2 className="details-title">{patient.name}</h2>
          <p className="details-subtitle">
            {patient.patientId} | {patient.age} years | {patient.gender} | {patient.eye}
          </p>
        </div>
        <div className="details-summary">
          <span className={`severity-pill pill-${patient.stageTone}`}>{patient.stage}</span>
          <span className="summary-chip">Confidence {patient.confidence}%</span>
          <span className={`review-badge review-${patient.reviewStatusTone}`}>{patient.reviewStatus}</span>
        </div>
      </div>

      <div className="details-grid">
        <section className="card detail-card">
          <div className="card-header">
            <div>
              <div className="card-title">Patient Details</div>
              <div className="card-subtitle">Clinical and screening metadata</div>
            </div>
          </div>
          <div className="detail-list">
            <div className="detail-row"><span>Patient ID</span><strong>{patient.patientId}</strong></div>
            <div className="detail-row"><span>Name</span><strong>{patient.name}</strong></div>
            <div className="detail-row"><span>Age</span><strong>{patient.age}</strong></div>
            <div className="detail-row"><span>Gender</span><strong>{patient.gender}</strong></div>
            <div className="detail-row"><span>Eye</span><strong>{patient.eye}</strong></div>
            <div className="detail-row"><span>Uploaded</span><strong>{patient.uploaded}</strong></div>
            <div className="detail-row"><span>Review Status</span><strong>{patient.reviewStatus}</strong></div>
            <div className="detail-row"><span>Prediction</span><strong>{patient.stage}</strong></div>
            {canManageReview ? <div className="status-actions">
              {isPending ? (
                <button type="button" className="action-button secondary" onClick={() => onUpdateReviewStatus(patient.id, 'Under Review')}>
                  Start Review
                </button>
              ) : null}
              {(isPending || isUnderReview) ? (
                <button type="button" className="action-button normal" onClick={() => onUpdateReviewStatus(patient.id, 'Reviewed')}>
                  Mark Reviewed
                </button>
              ) : null}
              {(isUnderReview || isReviewed) ? (
                <button type="button" className="action-button secondary" onClick={() => onUpdateReviewStatus(patient.id, 'Pending')}>
                  Re-open
                </button>
              ) : null}
            </div> : null}
          </div>
        </section>

        <section className="card detail-card">
          <div className="card-header">
            <div>
              <div className="card-title">Model Confidence Breakdown</div>
              <div className="card-subtitle">Per-class probabilities for doctor review</div>
            </div>
          </div>
          <div className="confidence-breakdown">
            {CATEGORY_ORDER.map(category => {
              const value = patient.confidenceByStage?.[category.key] ?? 0;
              return (
                <div key={category.key} className="breakdown-row">
                  <div className="breakdown-head">
                    <span>{category.label}</span>
                    <strong>{value}%</strong>
                  </div>
                  <div className="breakdown-track">
                    <div className={`breakdown-fill confidence-${category.key}`} style={{ width: `${value}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      <div className="image-grid">
        <section className="card detail-card">
          <div className="card-header">
            <div>
              <div className="card-title">Fundus Image</div>
              <div className="card-subtitle">Original uploaded image</div>
            </div>
          </div>
          <div className="image-panel">
            <img src={patient.imageUrl} alt={`${patient.name} fundus`} className="retina-image" />
          </div>
        </section>

        <section className="card detail-card">
          <div className="card-header">
            <div>
              <div className="card-title">Preprocessed Image</div>
              <div className="card-subtitle">Model-ready normalized representation</div>
            </div>
          </div>
          <div className="image-panel">
            <img src={patient.preprocessedImageUrl} alt={`${patient.name} preprocessed fundus`} className="retina-image retina-image-processed" />
          </div>
        </section>
      </div>

      <section className="card detail-card">
        <div className="card-header">
          <div>
            <div className="card-title">Patient Report</div>
            <div className="card-subtitle">Doctor notes, referral advice, and follow-up plan</div>
          </div>
        </div>
        <div className="report-panel">
          <textarea
            className="report-input"
            value={reportText}
            onChange={event => setReportText(event.target.value)}
            placeholder="Add the doctor report here..."
            readOnly={!canEditReport}
          />
          {canEditReport ? (
            <div className="report-actions">
              <button type="button" className="btn btn-primary" onClick={() => onSaveReport(patient.id, reportText)}>
                Save Report
              </button>
            </div>
          ) : (
            <div className="readonly-note">Staff can view the report but cannot modify doctor notes.</div>
          )}
        </div>
      </section>
    </section>
  );
}
