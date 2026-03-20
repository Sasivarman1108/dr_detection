import React from 'react';

export default function SignedOutView({ onSignIn }) {
  return (
    <section className="signed-out-shell">
      <div className="signed-out-card">
        <div className="logo-mark">
          <svg viewBox="0 0 24 24" className="logo-svg" aria-hidden="true">
            <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </div>
        <h1 className="signed-out-title">Signed Out</h1>
        <p className="signed-out-text">Your local doctor session has been closed for now.</p>
        <button type="button" className="btn btn-primary" onClick={onSignIn}>
          Sign In Again
        </button>
      </div>
    </section>
  );
}
