import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import Toast from "../components/Toast";
import "../styles/dashboard.css";
import "../styles/contact.css";

export default function Contact() {
  const { logout } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.message) {
      showToast("Please fill in all required fields.", "error");
      return;
    }
    setSending(true);
    try {
      const res = await fetch("https://formspree.io/f/xnnqkgko", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          subject: form.subject || "(no subject)",
          message: form.message,
        }),
      });
      if (res.ok) {
        showToast("Message sent! We'll get back to you within 24 hours.");
        setForm({ name: "", email: "", subject: "", message: "" });
      } else {
        throw new Error("Failed");
      }
    } catch {
      showToast("Something went wrong. Email us directly at solvers.real@gmail.com", "error");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="dash-layout">
      <Navbar onLogout={logout} />

      <div className="dash-main">
        <div className="contact-page">

          {/* Hero */}
          <div className="contact-hero">
            <div className="contact-hero__badge">
              <span className="badge-dot" />
              SUPPORT
            </div>
            <h1 className="contact-hero__title">How can we help?</h1>
            <p className="contact-hero__sub">
              Have a question, found a bug, or want to share feedback?<br />
              We read every message and typically respond within 24 hours.
            </p>
          </div>

          <div className="contact-grid">

            {/* Left — form */}
            <div className="contact-form-card">
              <div className="contact-form-card__header">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                Send a message
              </div>

              <div className="contact-form-row">
                <div className="field-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Your name"
                  />
                </div>
                <div className="field-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div className="field-group">
                <label>Subject</label>
                <input
                  type="text"
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  placeholder="What's this about?"
                />
              </div>

              <div className="field-group">
                <label>Message *</label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  placeholder="Tell us everything..."
                  rows={6}
                  style={{ resize: "vertical" }}
                />
              </div>

              <button
                className="contact-submit-btn"
                onClick={handleSubmit}
                disabled={sending}
              >
                {sending ? <span className="spinner" /> : (
                  <>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="22" y1="2" x2="11" y2="13"/>
                      <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                    </svg>
                    Send Message
                  </>
                )}
              </button>
            </div>

            {/* Right — info */}
            <div className="contact-info-col">

              <div className="contact-info-card">
                <div className="contact-info-card__icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                </div>
                <div>
                  <div className="contact-info-card__label">Email us directly</div>
                  <a href="mailto:solvers.real@gmail.com" className="contact-info-card__value">
                    solvers.real@gmail.com
                  </a>
                </div>
              </div>

              <div className="contact-info-card">
                <div className="contact-info-card__icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                </div>
                <div>
                  <div className="contact-info-card__label">Response time</div>
                  <div className="contact-info-card__value">Within 24 hours</div>
                </div>
              </div>

              <div className="contact-info-card">
                <div className="contact-info-card__icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.5 11H19V7a2 2 0 0 0-2-2h-4V3.5A2.5 2.5 0 0 0 10.5 1 2.5 2.5 0 0 0 8 3.5V5H4a2 2 0 0 0-2 2v3.8h1.5A2.7 2.7 0 0 1 6.2 13.5 2.7 2.7 0 0 1 3.5 16.2H2V20a2 2 0 0 0 2 2h3.8v-1.5A2.7 2.7 0 0 1 10.5 17.8a2.7 2.7 0 0 1 2.7 2.7V22H17a2 2 0 0 0 2-2v-4h1.5a2.5 2.5 0 0 0 2.5-2.5 2.5 2.5 0 0 0-2.5-2.5z"/>
                  </svg>
                </div>
                <div>
                  <div className="contact-info-card__label">Chrome Extension</div>
                  <a
                    href="https://chromewebstore.google.com/detail/autoslay-%E2%80%93-fill-any-form/lafjiaflpnifhglhjcolidljogmbigco"
                    target="_blank"
                    rel="noreferrer"
                    className="contact-info-card__value"
                  >
                    Install from Chrome Web Store
                  </a>
                </div>
              </div>

              <div className="contact-faq">
                <div className="contact-faq__title">Common topics</div>
                {[
                  "Bug report or broken form fill",
                  "Profile data not saving",
                  "Extension not working on a site",
                  "Feature request or feedback",
                  "Account or billing question",
                ].map((q) => (
                  <div key={q} className="contact-faq__item">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6"/>
                    </svg>
                    {q}
                  </div>
                ))}
              </div>

            </div>
          </div>
        </div>
      </div>

      {toast && <Toast message={toast.msg} type={toast.type} />}
    </div>
  );
}
