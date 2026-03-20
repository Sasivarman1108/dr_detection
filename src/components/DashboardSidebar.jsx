import React, { useState } from 'react';

function LogoMark() {
  return (
    <svg viewBox="0 0 24 24" className="logo-svg" aria-hidden="true">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export default function DashboardSidebar({ sections, doctorProfile }) {
  const initialActiveId = sections.flatMap(section => section.items).find(item => item.active)?.id;
  const [selectedItemId, setSelectedItemId] = useState(initialActiveId ?? sections[0]?.items[0]?.id);

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-mark">
          <LogoMark />
        </div>
        <div>
          <div className="logo-name">Wings AI</div>
          <div className="logo-tag">DR Detection Platform</div>
        </div>
      </div>

      {sections.map(section => (
        <div key={section.label}>
          <span className="nav-group-label">{section.label}</span>

          {section.items.map(item => (
            <button
              key={item.id}
              type="button"
              className={`nav-item ${selectedItemId === item.id ? 'active' : ''}`}
              onClick={() => setSelectedItemId(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
              {item.badge ? (
                <span className={`nav-badge ${item.badgeVariant === 'info' ? 'info' : ''}`}>{item.badge}</span>
              ) : null}
            </button>
          ))}

          {section.label === 'Main Menu' ? <div className="sidebar-separator" /> : null}
        </div>
      ))}

      <div className="sidebar-footer">
        <button type="button" className="doctor-card">
          <div className="doctor-avatar">{doctorProfile.initials}</div>
          <div>
            <div className="doctor-name">{doctorProfile.name}</div>
            <div className="doctor-role">{doctorProfile.role}</div>
          </div>
          <div className="doctor-dots">...</div>
        </button>
      </div>
    </aside>
  );
}
