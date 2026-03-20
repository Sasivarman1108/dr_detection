import React from 'react';

export default function SettingsView({ settings, onSettingChange }) {
  return (
    <section className="settings-shell">
      <section className="card settings-card">
        <div className="card-header">
          <div>
            <div className="card-title">Queue Preferences</div>
            <div className="card-subtitle">Basic doctor workflow defaults</div>
          </div>
        </div>
        <div className="settings-body">
          <label className="settings-field">
            <span>Default Queue Filter</span>
            <select value={settings.defaultQueueFilter} onChange={event => onSettingChange('defaultQueueFilter', event.target.value)}>
              <option value="Pending">Pending</option>
              <option value="Under Review">Under Review</option>
              <option value="Urgent">Urgent</option>
              <option value="All">All</option>
            </select>
          </label>

          <label className="settings-toggle">
            <input
              type="checkbox"
              checked={settings.showReviewedInPatients}
              onChange={event => onSettingChange('showReviewedInPatients', event.target.checked)}
            />
            <span>Show reviewed patients in Patients page</span>
          </label>
        </div>
      </section>

      <section className="card settings-card">
        <div className="card-header">
          <div>
            <div className="card-title">Notifications</div>
            <div className="card-subtitle">Basic alert preferences for camp operation</div>
          </div>
        </div>
        <div className="settings-body">
          <label className="settings-toggle">
            <input
              type="checkbox"
              checked={settings.urgentAlerts}
              onChange={event => onSettingChange('urgentAlerts', event.target.checked)}
            />
            <span>Urgent PDR alerts</span>
          </label>
          <label className="settings-toggle">
            <input
              type="checkbox"
              checked={settings.reportReminders}
              onChange={event => onSettingChange('reportReminders', event.target.checked)}
            />
            <span>Report completion reminders</span>
          </label>
        </div>
      </section>

      <section className="card settings-card">
        <div className="card-header">
          <div>
            <div className="card-title">Report Defaults</div>
            <div className="card-subtitle">Quick defaults for doctor reporting</div>
          </div>
        </div>
        <div className="settings-body">
          <label className="settings-field">
            <span>Default Report Template</span>
            <select value={settings.reportTemplate} onChange={event => onSettingChange('reportTemplate', event.target.value)}>
              <option value="Referral Advice">Referral Advice</option>
              <option value="Routine Follow Up">Routine Follow Up</option>
              <option value="Detailed Clinical Note">Detailed Clinical Note</option>
            </select>
          </label>

          <label className="settings-field">
            <span>Camp Name</span>
            <input value={settings.campName} onChange={event => onSettingChange('campName', event.target.value)} />
          </label>
        </div>
      </section>
    </section>
  );
}
