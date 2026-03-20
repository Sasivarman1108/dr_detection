import React from 'react';

const STAGE_META = {
  nodr: { label: 'No DR', className: 'pill-nodr' },
  mild: { label: 'Mild NPDR', className: 'pill-mild' },
  moderate: { label: 'Moderate NPDR', className: 'pill-moderate' },
  severe: { label: 'Severe NPDR', className: 'pill-severe' },
  pdr: { label: 'PDR', className: 'pill-pdr' },
};

function buildAgeBuckets(patients) {
  const buckets = [
    { label: '< 40', min: 0, max: 39 },
    { label: '40-49', min: 40, max: 49 },
    { label: '50-59', min: 50, max: 59 },
    { label: '60+', min: 60, max: 200 },
  ];

  return buckets.map(bucket => {
    const bucketPatients = patients.filter(patient => {
      const age = Number(patient.age);
      return age >= bucket.min && age <= bucket.max;
    });

    const total = bucketPatients.length || 1;

    return {
      ...bucket,
      total: bucketPatients.length,
      stages: Object.keys(STAGE_META).map(key => {
        const count = bucketPatients.filter(patient => patient.stageTone === key).length;
        const percent = bucketPatients.length ? Math.round((count / bucketPatients.length) * 100) : 0;
        return {
          key,
          count,
          percent,
        };
      }),
    };
  });
}

function buildPieGradient(stages) {
  const colorMap = {
    nodr: '#10b981',
    mild: '#84cc16',
    moderate: '#f59e0b',
    severe: '#f97316',
    pdr: '#ef4444',
  };

  const nonZeroStages = stages.filter(stage => stage.percent > 0);
  if (nonZeroStages.length === 0) {
    return 'conic-gradient(#e8eaf2 0deg 360deg)';
  }

  let current = 0;
  const stops = nonZeroStages.map(stage => {
    const start = current;
    const sweep = (stage.percent / 100) * 360;
    current += sweep;
    return `${colorMap[stage.key]} ${start}deg ${current}deg`;
  });

  return `conic-gradient(${stops.join(', ')})`;
}

function buildStageTotals(patients) {
  const total = patients.length || 1;

  return Object.entries(STAGE_META).map(([key, meta]) => {
    const count = patients.filter(patient => patient.stageTone === key).length;
    return {
      key,
      ...meta,
      count,
      percent: Math.round((count / total) * 100),
    };
  });
}

function buildWorkflowMetrics(patients) {
  const total = patients.length || 1;
  const reviewed = patients.filter(patient => patient.reviewStatus === 'Reviewed').length;
  const underReview = patients.filter(patient => patient.reviewStatus === 'Under Review').length;
  const reported = patients.filter(patient => patient.report?.trim()).length;

  return [
    { label: 'Reviewed Cases', value: reviewed, percent: Math.round((reviewed / total) * 100), tone: 'nodr' },
    { label: 'Under Review', value: underReview, percent: Math.round((underReview / total) * 100), tone: 'moderate' },
    { label: 'Reports Added', value: reported, percent: Math.round((reported / total) * 100), tone: 'accent' },
  ];
}

export default function AnalyticsView({ patients }) {
  const ageBuckets = buildAgeBuckets(patients);
  const stageTotals = buildStageTotals(patients);
  const workflowMetrics = buildWorkflowMetrics(patients);

  return (
    <section className="analytics-shell">
      <div className="analytics-grid">
        <section className="card analytics-card">
          <div className="card-header">
            <div>
              <div className="card-title">Age vs DR Category</div>
              <div className="card-subtitle">Pie-style age buckets showing DR mix by percentage</div>
            </div>
          </div>
          <div className="analytics-body">
            <div className="analytics-legend">
              {Object.entries(STAGE_META).map(([key, meta]) => (
                <span key={key} className={`severity-pill ${meta.className}`}>{meta.label}</span>
              ))}
            </div>

            <div className="age-pie-grid">
              {ageBuckets.map(bucket => (
                <div key={bucket.label} className="age-pie-card">
                  <div className="age-bucket-head">
                    <span className="age-bucket-label">{bucket.label}</span>
                    <span className="age-bucket-count">{bucket.total} patients</span>
                  </div>
                  <div className="age-pie-layout">
                    <div
                      className="age-pie-chart"
                      style={{ background: buildPieGradient(bucket.stages) }}
                      aria-label={`${bucket.label} age bucket distribution`}
                    >
                      <div className="age-pie-center">{bucket.total}</div>
                    </div>

                    <div className="age-pie-list">
                      {bucket.stages.map(stage => (
                        <div key={stage.key} className="age-pie-item">
                          <span className={`age-pie-dot fill-${stage.key}`} />
                          <span className="age-pie-name">{STAGE_META[stage.key].label}</span>
                          <strong className="age-pie-value">{stage.percent}%</strong>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="card analytics-card">
          <div className="card-header">
            <div>
              <div className="card-title">DR Category Distribution</div>
              <div className="card-subtitle">Single bars so stage prevalence is easy to compare at a glance</div>
            </div>
          </div>
          <div className="analytics-body">
            {stageTotals.map(stage => (
              <div key={stage.key} className="distribution-row">
                <div className="distribution-head">
                  <span>{stage.label}</span>
                  <strong>{stage.count} patients</strong>
                </div>
                <div className="distribution-track">
                  <div className={`distribution-fill fill-${stage.key}`} style={{ width: `${stage.percent}%` }} />
                </div>
                <div className="distribution-foot">{stage.percent}% of all screened patients</div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="card analytics-card">
        <div className="card-header">
          <div>
            <div className="card-title">Review Workflow Snapshot</div>
            <div className="card-subtitle">Operational progress without forcing the doctor to decode a complex chart</div>
          </div>
        </div>
        <div className="analytics-body workflow-grid">
          {workflowMetrics.map(metric => (
            <div key={metric.label} className="workflow-card">
              <div className="workflow-top">
                <span className="workflow-label">{metric.label}</span>
                <strong className={`workflow-value text-${metric.tone}`}>{metric.value}</strong>
              </div>
              <div className="workflow-track">
                <div className={`workflow-fill fill-${metric.tone === 'accent' ? 'moderate' : metric.tone}`} style={{ width: `${metric.percent}%` }} />
              </div>
              <div className="workflow-foot">{metric.percent}% completion</div>
            </div>
          ))}
        </div>
      </section>
    </section>
  );
}
