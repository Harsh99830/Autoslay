import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import "../styles/auth.css";

export default function Login() {
  const { login, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* ── Left Side: Brand Panel ── */}
      <aside className="auth-left">
        {/* Grid dot overlay */}
        <div className="auth-grid-dots" />

        {/* Brand mark */}
        <div className="auth-left-top">
          <div className="auth-brand-icon">⚡</div>
          <span className="auth-brand-name">Autoslay</span>
        </div>

        {/* Hero content */}
        <div className="auth-left-body">
          <div className="auth-hero-tag">
            <div className="auth-hero-dot" />
            <span>Auto-fill Extension</span>
          </div>
          <h2 className="auth-hero-heading">
            Fill any form.<br />
            In <em>one click.</em>
          </h2>
          <p className="auth-hero-sub">
            Store your profile once — Autoslay auto-fills job applications, college forms, internship portals, scholarship applications, and any web form instantly.
          </p>

          <ul className="auth-bullets">
            <li>Name, email, phone, DOB, gender &amp; nationality</li>
            <li>Full address — street, city, state, country &amp; pincode</li>
            <li>Education — college, degree, branch, year &amp; CGPA</li>
            <li>Work — company, job title, experience &amp; skills</li>
            <li>LinkedIn, GitHub, portfolio &amp; resume upload</li>
            <li>Works on job, internship, college &amp; scholarship forms</li>
          </ul>

        </div>

        {/* Social proof */}
        <div className="auth-left-bottom">
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div className="auth-avatars">
              <div className="auth-avatar">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="8" r="4"/>
                  <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                </svg>
              </div>
              <div className="auth-avatar">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="8" r="4"/>
                  <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                </svg>
              </div>
              <div className="auth-avatar">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="8" r="4"/>
                  <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                </svg>
              </div>
            </div>
            <div className="auth-proof-text">
              <strong>Thousands of applications</strong>
              filled automatically
            </div>
          </div>
        </div>
      </aside>

      {/* ── Right Side: Auth Form ── */}
      <section className="auth-right">
        <div className="auth-container">
          {/* Top bar */}
          <div className="auth-top-bar">
            <span className="auth-step-indicator">STEP 1 OF 1</span>
          </div>

          <div className="auth-card">
            <div className="auth-card-header">
              <span className="auth-tag">✔ Secure Access</span>
              <h1 className="auth-title">Welcome back.</h1>
              <p className="auth-subtitle">Sign in to manage your auto-fill profile.</p>
            </div>

            {error && <div className="auth-error">{error}</div>}

            <button
              type="button"
              className="google-btn"
              onClick={handleGoogleSignIn}
              disabled={loading}
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            <div className="auth-divider">
              <div className="auth-divider-line" />
              <span>OR</span>
              <div className="auth-divider-line" />
            </div>

            <form onSubmit={submit} className="auth-form">
              <div className="field-group">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="name@company.com"
                  value={form.email}
                  onChange={handle}
                  required
                  autoFocus
                />
              </div>

              <div className="field-group">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handle}
                  required
                />
              </div>

              <a href="#" className="auth-forgot">Forgot password?</a>

              <button type="submit" className="auth-btn" disabled={loading}>
                {loading ? <span className="spinner" /> : "Sign In →"}
              </button>
            </form>

            <p className="auth-switch">
              Don&apos;t have an account?
              <Link to="/signup">Create one →</Link>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
