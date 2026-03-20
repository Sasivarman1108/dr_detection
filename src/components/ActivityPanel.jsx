import React from 'react';

export default function ActivityPanel({ activities }) {
  return (
    <section className="card">
      <div className="card-header">
        <div>
          <div className="card-title">Recent Activity</div>
          <div className="card-subtitle">Live camp updates</div>
        </div>

        <button type="button" className="chip">View all</button>
      </div>

      {activities.map(activity => (
        <div key={activity.id} className="activity-item">
          <div className={`activity-icon activity-${activity.tone}`}>{activity.icon}</div>
          <div className="activity-body">
            <div className="activity-message">{activity.message}</div>
            <div className="activity-meta">
              <span className="activity-time">{activity.time}</span>
              <span className="activity-separator" />
              <span className="activity-source">{activity.source}</span>
            </div>
          </div>
        </div>
      ))}
    </section>
  );
}
