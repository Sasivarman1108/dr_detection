import React, { useMemo } from 'react';

function filterPatients(patients, filter, stageFilter) {
  let result = filter === 'All'
    ? patients
    : patients.filter(patient => patient.reviewStatus !== 'Reviewed');

  if (filter === 'Urgent') result = result.filter(patient => patient.stageTone === 'pdr' || patient.priority === 'critical');
  if (filter === 'Pending') result = result.filter(patient => patient.reviewStatus === 'Pending');
  if (filter === 'Under Review') result = result.filter(patient => patient.reviewStatus === 'Under Review');
  if (stageFilter !== 'all') result = result.filter(patient => patient.stageTone === stageFilter);

  return result;
}

export default function PatientQueueTable({
  patients,
  filters,
  activeFilter,
  onFilterChange,
  stageFilter,
  onClearStageFilter,
  onViewPatient,
}) {
  const visiblePatients = useMemo(
    () => filterPatients(patients, activeFilter, stageFilter),
    [patients, activeFilter, stageFilter]
  );

  return (
    <section className="card">
      <div className="card-header">
        <div>
          <div className="card-title">Patient Queue</div>
          <div className="card-subtitle">Sorted by severity | critical first</div>
          {stageFilter !== 'all' ? (
            <div className="active-stage-row">
              <span className={`severity-pill pill-${stageFilter}`}>Showing {stageFilter.toUpperCase()} patients</span>
              <button type="button" className="clear-stage-button" onClick={onClearStageFilter}>
                Clear
              </button>
            </div>
          ) : null}
        </div>

        <div className="chips">
          {filters.map(filter => (
            <button
              key={filter}
              type="button"
              className={`chip ${activeFilter === filter ? 'active' : ''}`}
              onClick={() => onFilterChange(filter)}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      <div className="table-wrap">
        <table className="queue-table">
          <thead>
            <tr>
              <th aria-label="Priority" />
              <th>Patient</th>
              <th>DR Stage</th>
              <th>Review Status</th>
              <th>Uploaded</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {visiblePatients.map(patient => (
              <tr key={patient.id}>
                <td><span className={`priority-dot priority-${patient.priority}`} /></td>
                <td>
                  <div className="patient-cell">
                    <div className={`patient-avatar avatar-${patient.avatarGradient}`}>{patient.initials}</div>
                    <div>
                      <div className="patient-name">{patient.name}</div>
                      <div className="patient-meta">{patient.patientMeta}</div>
                    </div>
                  </div>
                </td>
                <td><span className={`severity-pill pill-${patient.stageTone}`}>{patient.stage}</span></td>
                <td><span className={`review-badge review-${patient.reviewStatusTone}`}>{patient.reviewStatus}</span></td>
                <td className="uploaded-time">{patient.uploaded}</td>
                <td>
                  <div className="queue-actions">
                    <button
                      type="button"
                      className={`action-button ${patient.actionTone === 'urgent' ? 'urgent' : 'normal'}`}
                      onClick={() => onViewPatient(patient.id)}
                    >
                      {patient.actionLabel}
                    </button>
                    <button type="button" className="action-button secondary" onClick={() => onViewPatient(patient.id)}>
                      View Patient Details
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {visiblePatients.length === 0 ? (
              <tr>
                <td colSpan="6">
                  <div className="empty-table">No patients found for this filter.</div>
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}
