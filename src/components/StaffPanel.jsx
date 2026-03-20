import React from 'react';

export default function StaffPanel({ staffMembers }) {
  return (
    <section className="card">
      <div className="card-header">
        <div className="card-title">Staff on Duty</div>
        <span className="online-dot" />
      </div>

      {staffMembers.map(member => (
        <div key={member.id} className="staff-row">
          <div className={`staff-avatar avatar-${member.gradient}`}>{member.initials}</div>
          <div className="staff-body">
            <div className="staff-name">{member.name}</div>
            <div className="staff-meta">
              <span className="staff-role">{member.role}</span>
              <span className="staff-separator" />
              <span className="staff-station">{member.station}</span>
            </div>
          </div>
          <div className="staff-right">
            <span className="staff-count">{member.count}</span>
            <span className="online-dot" />
          </div>
        </div>
      ))}
    </section>
  );
}
