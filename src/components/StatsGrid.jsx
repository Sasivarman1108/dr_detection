import React from 'react';

export default function StatsGrid({ stats, onViewStage }) {
  return (
    <section className="stats-row">
      {stats.map(stat => (
        <article key={stat.id} className={`stat-card tone-${stat.tone}`}>
          <div className="stat-top">
            <div className="stat-icon">{stat.icon}</div>
            <div className="stat-percent">{stat.percent}%</div>
          </div>

          <div>
            <div className="stat-number">{stat.value}</div>
            <div className="stat-label">{stat.label}</div>
          </div>

          <div className="stat-bar">
            <div className="stat-bar-fill" style={{ width: `${stat.barWidth}%` }} />
          </div>

          <button
            type="button"
            className="stat-link"
            onClick={() => onViewStage(stat.stageTone)}
          >
            View Patients
          </button>
        </article>
      ))}
    </section>
  );
}
