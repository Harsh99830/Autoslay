import "../styles/privacy.css";

export default function PrivacyPolicy() {
  return (
    <div className="privacy-page">
      <div className="privacy-container">
        <header className="privacy-header">
          <div className="privacy-brand">
            <span className="privacy-logo">⚡</span>
            <h1>AutoSlay</h1>
          </div>
          <h2>Privacy Policy</h2>
        </header>

        <div className="privacy-content">
          <p className="privacy-intro">
            AutoSlay (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) respects your privacy.
          </p>

          <section className="privacy-section">
            <h3>1. Information We Collect</h3>
            <p>
              We collect user-provided information such as name, email address, and other form-related data to enable autofill functionality.
            </p>
          </section>

          <section className="privacy-section">
            <h3>2. How We Use Information</h3>
            <p>We use this data solely to:</p>
            <ul>
              <li>Autofill forms on websites</li>
              <li>Improve user experience</li>
            </ul>
          </section>

          <section className="privacy-section">
            <h3>3. Data Storage</h3>
            <p>
              User data is stored securely and is not shared with third parties.
            </p>
          </section>

          <section className="privacy-section">
            <h3>4. Authentication</h3>
            <p>
              We use Google authentication to securely log users into the application.
            </p>
          </section>

          <section className="privacy-section">
            <h3>5. Data Sharing</h3>
            <p>
              We do not sell, trade, or transfer user data to third parties.
            </p>
          </section>

          <section className="privacy-section">
            <h3>6. Permissions</h3>
            <p>
              The extension uses permissions such as activeTab, scripting, and storage only to detect and fill form fields.
            </p>
          </section>

          <section className="privacy-section">
            <h3>7. Security</h3>
            <p>
              We take reasonable measures to protect user data.
            </p>
          </section>

          <section className="privacy-section">
            <h3>8. Changes</h3>
            <p>
              We may update this policy from time to time.
            </p>
          </section>

          <section className="privacy-section">
            <h3>9. Contact</h3>
            <p>
              For questions, contact:{" "}
              <a href="mailto:harshagrawal7878@gmail.com">
                harshagrawal7878@gmail.com
              </a>
            </p>
          </section>
        </div>

        <footer className="privacy-footer">
          <p>&copy; {new Date().getFullYear()} AutoSlay. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}
