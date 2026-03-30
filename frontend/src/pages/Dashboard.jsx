import { useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import TagInput from "../components/TagInput";
import Toast from "../components/Toast";
import "../styles/dashboard.css";

export default function Dashboard() {
  const { user, updateUser, uploadResume, logout } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [emails, setEmails] = useState(user?.emails || []);
  const [phones, setPhones] = useState(user?.phone_numbers || []);
  const [resumes] = useState(user?.resumes || []);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState(null);
  const fileRef = useRef();

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      await updateUser({ name, emails, phone_numbers: phones });
      showToast("Profile saved!");
    } catch {
      showToast("Failed to save.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      await uploadResume(file);
      showToast("Resume uploaded!");
    } catch {
      showToast("Upload failed.", "error");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="dash-layout">
      <Navbar onLogout={logout} user={user} />

      <main className="dash-main">
        {/* ── Hero strip ── */}
        <div className="dash-hero">
          <div className="dash-hero__text">
            <h1>Your Profile</h1>
            <p>Everything saved here gets auto-filled on any form, instantly.</p>
          </div>
          <div className="dash-hero__badge">
            <span className="badge-dot" />
            Extension Active
          </div>
        </div>

        <div className="dash-grid">
          {/* ── Identity card ── */}
          <section className="dash-card">
            <div className="card-header">
              <div className="card-icon">👤</div>
              <div>
                <h2>Identity</h2>
                <p>Your name used on forms</p>
              </div>
            </div>

            <div className="field-group">
              <label>Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
              />
            </div>
          </section>

          {/* ── Emails card ── */}
          <section className="dash-card">
            <div className="card-header">
              <div className="card-icon">✉️</div>
              <div>
                <h2>Email Addresses</h2>
                <p>Add multiple, pick one when filling</p>
              </div>
            </div>
            <TagInput
              values={emails}
              onChange={setEmails}
              placeholder="Add email and press Enter"
              type="email"
            />
          </section>

          {/* ── Phone card ── */}
          <section className="dash-card">
            <div className="card-header">
              <div className="card-icon">📱</div>
              <div>
                <h2>Phone Numbers</h2>
                <p>Add multiple numbers</p>
              </div>
            </div>
            <TagInput
              values={phones}
              onChange={setPhones}
              placeholder="Add phone and press Enter"
              type="tel"
            />
          </section>

          {/* ── Resume card ── */}
          <section className="dash-card">
            <div className="card-header">
              <div className="card-icon">📄</div>
              <div>
                <h2>Resumes</h2>
                <p>Uploaded resume files</p>
              </div>
            </div>

            <div className="resume-list">
              {resumes.length === 0 && (
                <p className="empty-state">No resumes uploaded yet.</p>
              )}
              {resumes.map((url, i) => (
                <div className="resume-item" key={i}>
                  <span className="resume-icon">📎</span>
                  <a href={url} target="_blank" rel="noreferrer">
                    Resume {i + 1}
                  </a>
                </div>
              ))}
            </div>

            <button
              className="upload-btn"
              onClick={() => fileRef.current.click()}
              disabled={uploading}
            >
              {uploading ? (
                <span className="spinner" />
              ) : (
                <>
                  <span>+</span> Upload Resume (PDF)
                </>
              )}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.doc,.docx"
              style={{ display: "none" }}
              onChange={handleResumeUpload}
            />
          </section>
        </div>

        {/* ── Save bar ── */}
        <div className="save-bar">
          <button className="save-btn" onClick={saveProfile} disabled={saving}>
            {saving ? <span className="spinner" /> : "Save Changes"}
          </button>
        </div>
      </main>

      {toast && <Toast message={toast.msg} type={toast.type} />}
    </div>
  );
}
