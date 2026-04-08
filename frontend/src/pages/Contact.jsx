import "../styles/dashboard.css";

export default function Contact() {
  return (
    <div className="dash-layout">
      <div className="dash-main">
        <div className="dash-content">
          <div className="dash-section">
            <div className="dash-section__header">
              <span className="dash-section__title">Contact Us</span>
            </div>
            <div style={{
              background: 'var(--bg3)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              padding: '32px',
              textAlign: 'center',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              <div style={{
                fontSize: '48px',
                marginBottom: '16px',
                color: 'var(--cyan)'
              }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
              </div>
              <h2 style={{
                fontSize: '24px',
                fontWeight: '600',
                color: 'var(--text)',
                marginBottom: '12px'
              }}>
                Get in Touch
              </h2>
              <p style={{
                fontSize: '16px',
                color: 'var(--muted)',
                marginBottom: '24px',
                lineHeight: '1.6'
              }}>
                Have questions, feedback, or need support? We're here to help.
              </p>
              
              <div style={{
                background: 'var(--bg2)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '20px',
                marginBottom: '24px'
              }}>
                <div style={{
                  fontSize: '14px',
                  color: 'var(--muted2)',
                  marginBottom: '8px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em'
                }}>
                  Email
                </div>
                <div style={{
                  fontSize: '18px',
                  color: 'var(--cyan)',
                  fontWeight: '500',
                  fontFamily: 'Space Mono, monospace'
                }}>
                  support@autoslay.com
                </div>
              </div>

              <div style={{
                fontSize: '14px',
                color: 'var(--muted)',
                lineHeight: '1.6'
              }}>
                We typically respond within 24 hours during business days.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
