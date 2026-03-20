import React from 'react';

export default function PatientsListView({ patients, onViewPatient }) {
  return (
    <section className="card">
      <div className="card-header">
        <div>
          <div className="card-title">Patients & Reports</div>
          <div className="card-subtitle">All patients with review state and doctor report status</div>
        </div>
      </div>

      <div className="table-wrap">
        <table className="queue-table">
          <thead>
            <tr>
              <th>Patient</th>
              <th>DR Stage</th>
              <th>Review Status</th>
              <th>Report</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {patients.map(patient => {
              const hasReport = Boolean(patient.report?.trim());

              return (
                <tr key={patient.id}>
                  <td>
                    <div className="patient-cell">
                      <div className={`patient-avatar avatar-${patient.avatarGradient}`}>{patient.initials}</div>
                      <div>
                        <div className="patient-name">{patient.name}</div>
                        <div className="patient-meta">{patient.patientId}</div>
                      </div>
                    </div>
                  </td>
                  <td><span className={`severity-pill pill-${patient.stageTone}`}>{patient.stage}</span></td>
                  <td><span className={`review-badge review-${patient.reviewStatusTone}`}>{patient.reviewStatus}</span></td>
                  <td>
                    <span className={`report-badge ${hasReport ? 'reported' : 'not-reported'}`}>
                      {hasReport ? patient.report : 'Not Reported'}
                    </span>
                  </td>
                  <td>
                    <button type="button" className="action-button secondary" onClick={() => onViewPatient(patient.id)}>
                      View Patient Details
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
