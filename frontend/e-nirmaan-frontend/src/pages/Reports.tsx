export default function Reports() {
  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Reports</h1>
        <p className="page-subtitle">Analytics and project insights</p>
      </div>

      <div className="section">
        <div className="grid grid-3">
          <div className="stat-card">
            <div className="stat-card-value" style={{ fontSize: '1.5rem' }}>📊</div>
            <div className="stat-card-label">Project Analytics</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-value" style={{ fontSize: '1.5rem' }}>📈</div>
            <div className="stat-card-label">Budget Tracking</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-value" style={{ fontSize: '1.5rem' }}>📋</div>
            <div className="stat-card-label">Task Summaries</div>
          </div>
        </div>
      </div>

      <div className="section">
        <div className="card">
          <div className="card-body" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚧</div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '0.5rem' }}>
              Coming Soon
            </h2>
            <p style={{ color: 'var(--text-muted)', maxWidth: '480px', margin: '0 auto', lineHeight: 1.6 }}>
              The Reports module is currently under development. You'll soon be able to view
              project analytics, budget tracking, task completion rates, and more.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
