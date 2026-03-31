import { useState, useRef, useMemo } from "react";
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
  const [linkedin, setLinkedin] = useState(user?.linkedin || "");
  const [github, setGithub] = useState(user?.github || "");
  const [website, setWebsite] = useState(user?.website || "");
  const [address, setAddress] = useState(user?.address || "");
  const [college, setCollege] = useState(user?.college || "");
  const [degree, setDegree] = useState(user?.degree || "");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const fileRef = useRef();

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      await updateUser({ 
        name, 
        emails, 
        phone_numbers: phones,
        linkedin,
        github,
        website,
        address,
        college,
        degree
      });
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

  // Filter fields based on search query
  const matchesSearch = (text) => {
    if (!searchQuery) return true;
    return text.toLowerCase().includes(searchQuery.toLowerCase());
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

        {/* ── Search bar ── */}
        <div className="dash-search-bar">
          <input
            type="text"
            placeholder="Search fields..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="dash-search-input"
          />
        </div>

        <div className="dash-grid">
          {/* ── Identity card ── */}
          {matchesSearch("name") && (
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
          )}

          {/* ── Emails card ── */}
          {matchesSearch("email") && (
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
          )}

          {/* ── Phone card ── */}
          {matchesSearch("phone") && (
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
          )}

          {/* ── Resume card ── */}
          {matchesSearch("resume") && (
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
          )}

          {/* ── LinkedIn card ── */}
          {matchesSearch("linkedin") && (
          <section className="dash-card">
            <div className="card-header">
              <div className="card-icon">💼</div>
              <div>
                <h2>LinkedIn</h2>
                <p>Your LinkedIn profile URL</p>
              </div>
            </div>
            <div className="field-group">
              <input
                type="url"
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
                placeholder="https://linkedin.com/in/username"
              />
            </div>
          </section>
          )}

          {/* ── GitHub card ── */}
          {matchesSearch("github") && (
          <section className="dash-card">
            <div className="card-header">
              <div className="card-icon">🐙</div>
              <div>
                <h2>GitHub</h2>
                <p>Your GitHub profile URL</p>
              </div>
            </div>
            <div className="field-group">
              <input
                type="url"
                value={github}
                onChange={(e) => setGithub(e.target.value)}
                placeholder="https://github.com/username"
              />
            </div>
          </section>
          )}

          {/* ── Website card ── */}
          {matchesSearch("website") && (
          <section className="dash-card">
            <div className="card-header">
              <div className="card-icon">🌐</div>
              <div>
                <h2>Website/Portfolio</h2>
                <p>Your personal website URL</p>
              </div>
            </div>
            <div className="field-group">
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://yourwebsite.com"
              />
            </div>
          </section>
          )}

          {/* ── Address card ── */}
          {matchesSearch("address") && (
          <section className="dash-card">
            <div className="card-header">
              <div className="card-icon">📍</div>
              <div>
                <h2>Address</h2>
                <p>Your location or address</p>
              </div>
            </div>
            <div className="field-group">
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter your address"
                rows="3"
              />
            </div>
          </section>
          )}

          {/* ── College card ── */}
          {matchesSearch("college") && (
          <section className="dash-card">
            <div className="card-header">
              <div className="card-icon">🎓</div>
              <div>
                <h2>College/University</h2>
                <p>Your institution name</p>
              </div>
            </div>
            <div className="field-group">
              <input
                type="text"
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                placeholder="e.g., MIT, Stanford, IIT"
              />
            </div>
          </section>
          )}

          {/* ── Degree card ── */}
          {matchesSearch("degree") && (
          <section className="dash-card">
            <div className="card-header">
              <div className="card-icon">📜</div>
              <div>
                <h2>Degree</h2>
                <p>Your qualification</p>
              </div>
            </div>
            <div className="field-group">
              <input
                type="text"
                value={degree}
                onChange={(e) => setDegree(e.target.value)}
                placeholder="e.g., B.Tech, B.Sc, MBA"
              />
            </div>
          </section>
          )}
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
