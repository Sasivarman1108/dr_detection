import React, { useEffect, useState } from 'react';

function getClock() {
  return new Date().toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export default function DashboardTopbar({ sections, doctorProfile, campName, activeItemId, onNavChange, onSignOut }) {
  const [clock, setClock] = useState(getClock);
  const mainMenuItems = sections.find(section => section.label === 'Main Menu')?.items ?? [];
  const recordItems = sections.find(section => section.label === 'Records')?.items ?? [];

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setClock(getClock());
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, []);

  return (
    <header className="topbar">
      <div className="topbar-main">
        <div className="topbar-brand">
          <div className="logo-mark">
            <svg viewBox="0 0 24 24" className="logo-svg" aria-hidden="true">
              <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </div>
          <div>
            <div className="logo-name">Wings AI</div>
            <div className="logo-tag">DR Detection Platform</div>
          </div>
        </div>

        <div className="camp-badge">
          <span className="live-dot" />
          {campName} | Day 1
        </div>

        <div className="topbar-tools">
          <div className="search-box">Search patient...</div>
          <div className="time-badge">{clock}</div>

          <div className="topbar-doctor">
            <div className="doctor-avatar">{doctorProfile.initials}</div>
            <div>
              <div className="doctor-name">{doctorProfile.name}</div>
              <div className="doctor-role">{doctorProfile.title || doctorProfile.role}</div>
            </div>
            <button type="button" className="sign-out-button" onClick={onSignOut}>
              Sign Out
            </button>
          </div>

          <button type="button" className="notification-button" aria-label="Notifications">
            <span>NT</span>
            <span className="notification-dot" />
          </button>
        </div>
      </div>

      <div className="topbar-subnav">
        <nav className="topbar-nav" aria-label="Primary navigation">
          {mainMenuItems.map(item => (
            <button
              key={item.id}
              type="button"
              className={`topbar-nav-item ${activeItemId === item.id ? 'active' : ''}`}
              onClick={() => onNavChange(item.id)}
            >
              <span className="topbar-nav-icon">{item.icon}</span>
              <span>{item.label}</span>
              {item.badge ? (
                <span className={`nav-badge ${item.badgeVariant === 'info' ? 'info' : ''}`}>{item.badge}</span>
              ) : null}
            </button>
          ))}
        </nav>

        <div className="topbar-records">
          {recordItems.map(item => (
            <button
              key={item.id}
              type="button"
              className={`record-link ${activeItemId === item.id ? 'active' : ''}`}
              onClick={() => onNavChange(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
