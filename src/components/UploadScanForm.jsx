import React, { useState } from 'react';

const INITIAL_FORM = {
  patientId: '',
  patientName: '',
  age: '',
  gender: 'M',
  fundusImage: null,
};
const CATEGORY_ORDER = [
  { key: 'nodr', label: 'No DR' },
  { key: 'mild', label: 'Mild NPDR' },
  { key: 'moderate', label: 'Moderate NPDR' },
  { key: 'severe', label: 'Severe NPDR' },
  { key: 'pdr', label: 'PDR' },
];

export default function UploadScanForm({ onSubmitScan, submitting, predictionResult, uploadError }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [fileName, setFileName] = useState('');

  const handleChange = event => {
    const { name, value } = event.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = event => {
    const file = event.target.files?.[0] ?? null;
    setForm(prev => ({ ...prev, fundusImage: file }));
    setFileName(file?.name ?? '');
  };

  const handleSubmit = async event => {
    event.preventDefault();
    await onSubmitScan(form);
    setForm(INITIAL_FORM);
    setFileName('');
    event.target.reset();
  };

  return (
    <section className="upload-shell">
      <div className="upload-card">
        <div className="upload-header">
          <div>
            <h2 className="upload-title">Upload Scan</h2>
            <p className="upload-subtitle">
              Submit patient details and fundus image for model prediction.
            </p>
          </div>
        </div>

        <form className="upload-form" onSubmit={handleSubmit}>
          <label className="form-field">
            <span>Patient ID</span>
            <input name="patientId" placeholder="PT-0108" required onChange={handleChange} />
          </label>

          <label className="form-field">
            <span>Name</span>
            <input name="patientName" placeholder="Patient name" required onChange={handleChange} />
          </label>

          <label className="form-field">
            <span>Age</span>
            <input name="age" type="number" min="1" max="120" placeholder="Age" required onChange={handleChange} />
          </label>

          <label className="form-field">
            <span>Gender</span>
            <select name="gender" value={form.gender} onChange={handleChange}>
              <option value="M">Male</option>
              <option value="F">Female</option>
              <option value="-">Not Specified</option>
            </select>
          </label>

          <label className="form-field form-field-file">
            <span>Fundus Image</span>
            <input name="fundusImage" type="file" accept="image/*" required onChange={handleFileChange} />
            <small>{fileName || 'Choose a retinal fundus image file'}</small>
          </label>

          <button type="submit" className="btn btn-primary upload-submit" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit for Prediction'}
          </button>

          {uploadError ? <div className="prediction-empty">{uploadError}</div> : null}
        </form>
      </div>

      <div className="upload-card prediction-card">
        <div className="upload-header">
          <div>
            <h2 className="upload-title">Latest Prediction</h2>
            <p className="upload-subtitle">
              Most recent prediction response from the upload flow.
            </p>
          </div>
        </div>

        {predictionResult ? (
          <>
            <div className="prediction-grid">
              <div className="prediction-row">
                <span>Patient</span>
                <strong>{predictionResult.name}</strong>
              </div>
              <div className="prediction-row">
                <span>Patient ID</span>
                <strong>{predictionResult.patientId}</strong>
              </div>
              <div className="prediction-row">
                <span>Predicted Stage</span>
                <strong className={`prediction-stage text-${predictionResult.stageTone}`}>{predictionResult.stage}</strong>
              </div>
              <div className="prediction-row">
                <span>Top Confidence</span>
                <strong>{predictionResult.confidence}%</strong>
              </div>
              <div className="prediction-row">
                <span>Image</span>
                <strong>{predictionResult.fileName}</strong>
              </div>
            </div>

            <div className="prediction-breakdown">
              <div className="prediction-breakdown-title">Class Probabilities</div>
              {CATEGORY_ORDER.map(category => {
                const value = predictionResult.confidenceByStage?.[category.key] ?? 0;

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
          </>
        ) : (
          <div className="prediction-empty">No prediction yet. Submit a scan to see the result here.</div>
        )}
      </div>
    </section>
  );
}
