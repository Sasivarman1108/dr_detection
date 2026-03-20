import React, { useState } from 'react';

export default function LoginView({ onLogin, errorMessage, loading }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async event => {
    event.preventDefault();
    await onLogin({ email, password });
  };

  return (
    <section className="signed-out-shell">
      <form className="signed-out-card login-card" onSubmit={handleSubmit}>
        <div className="logo-mark">
          <svg viewBox="0 0 24 24" className="logo-svg" aria-hidden="true">
            <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </div>
        <h1 className="signed-out-title">Sign In</h1>
        <p className="signed-out-text">Sign in with your assigned account credentials.</p>

        <label className="settings-field login-field">
          <span>Email</span>
          <input value={email} onChange={event => setEmail(event.target.value)} />
        </label>

        <label className="settings-field login-field">
          <span>Password</span>
          <input type="password" value={password} onChange={event => setPassword(event.target.value)} />
        </label>

        {errorMessage ? <div className="login-error">{errorMessage}</div> : null}

        <button type="submit" className="btn btn-primary login-button" disabled={loading}>
          {loading ? 'Signing In...' : 'Sign In'}
        </button>
      </form>
    </section>
  );
}
