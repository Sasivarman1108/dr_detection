import React from 'react';

export default function StaffDirectoryView({ staffMembers }) {
  return (
    <section className="card">
      <div className="card-header">
        <div>
          <div className="card-title">Staff Directory</div>
          <div className="card-subtitle">All active staff with role, station, email, and workload</div>
        </div>
      </div>

      <div className="table-wrap">
        <table className="queue-table">
          <thead>
            <tr>
              <th>Staff</th>
              <th>Role</th>
              <th>Station</th>
              <th>Email</th>
              <th>Workload</th>
            </tr>
          </thead>
          <tbody>
            {staffMembers.map(member => (
              <tr key={member.id}>
                <td>
                  <div className="patient-cell">
                    <div className={`staff-avatar avatar-${member.gradient}`}>{member.initials}</div>
                    <div>
                      <div className="staff-name">{member.name}</div>
                      <div className="patient-meta">{member.statusLabel}</div>
                    </div>
                  </div>
                </td>
                <td>{member.role}</td>
                <td>{member.station}</td>
                <td>
                  <a className="staff-mail" href={`mailto:${member.email}`}>
                    {member.email}
                  </a>
                </td>
                <td>{member.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
