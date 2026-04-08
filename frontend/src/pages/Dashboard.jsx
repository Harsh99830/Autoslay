import { useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import TagInput from "../components/TagInput";
import Toast from "../components/Toast";
import "../styles/dashboard.css";

// ── Icon Components ──────────────────────────────────────────────────────
const Icon = ({ type, size = 16 }) => {
  const s = { width: size, height: size };
  const icons = {
    search: <svg {...s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
    logout: <svg {...s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
    id: <svg {...s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/></svg>,
    calendar: <svg {...s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
    mail: <svg {...s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
    phone: <svg {...s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.18 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 6.29 6.29l.97-.97a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>,
    user: <svg {...s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>,
    globe: <svg {...s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
    chevronDown: <svg {...s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>,
    pin: <svg {...s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
    link: <svg {...s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>,
    briefcase: <svg {...s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>,
    book: <svg {...s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
    file: <svg {...s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
    delete: <svg {...s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>,
  };
  return <span style={{ display: "inline-flex", alignItems: "center", color: "currentColor" }}>{icons[type]}</span>;
};

export default function Dashboard() {
  const { user, updateUser, logout } = useAuth();

  // Identity
  const [name, setName] = useState(user?.name || "");
  const [emails, setEmails] = useState(user?.emails || []);
  const [phones, setPhones] = useState(user?.phone_numbers || []);
  
  // Online presence
  const [linkedin, setLinkedin] = useState(user?.linkedin || "");
  const [github, setGithub] = useState(user?.github || "");
  const [website, setWebsite] = useState(user?.website || "");

  // Address
  const [address, setAddress] = useState(user?.address || "");
  const [city, setCity] = useState(user?.city || "");
  const [state, setState] = useState(user?.state || "");
  const [country, setCountry] = useState(user?.country || "");
  const [pincode, setPincode] = useState(user?.pincode || "");

  // Education
  const [college, setCollege] = useState(user?.college || "");
  const [degree, setDegree] = useState(user?.degree || "");
  const [branch, setBranch] = useState(user?.branch || "");
  const [graduationYear, setGraduationYear] = useState(user?.graduation_year || "");
  const [cgpa, setCgpa] = useState(user?.cgpa || "");

  // Personal
  const [dob, setDob] = useState(user?.date_of_birth || "");
  const [gender, setGender] = useState(user?.gender || "");
  const [nationality, setNationality] = useState(user?.nationality || "");

  // Professional
  const [currentCompany, setCurrentCompany] = useState(user?.current_company || "");
  const [jobTitle, setJobTitle] = useState(user?.job_title || "");
  const [experience, setExperience] = useState(user?.years_of_experience || "");
  const [skills, setSkills] = useState(user?.skills || []);
  const [languages, setLanguages] = useState(user?.languages || []);

  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      await updateUser({
        name, emails, phone_numbers: phones,
        linkedin, github, website,
        address, city, state, country, pincode,
        college, degree, branch,
        graduation_year: graduationYear, cgpa,
        date_of_birth: dob, gender, nationality,
        current_company: currentCompany, job_title: jobTitle,
        years_of_experience: experience, skills, languages,
      });
      showToast("Profile saved!");
    } catch {
      showToast("Failed to save.", "error");
    } finally {
      setSaving(false);
    }
  };

  
  const matchesSearch = (text) => {
    if (!searchQuery) return true;
    return text.toLowerCase().includes(searchQuery.toLowerCase());
  };

  return (
    <div className="dash-layout">
      <Navbar onLogout={logout} user={user} />

      <div className="dash-main">
        {/* ── Top bar with search ── */}
        <div className="dash-topbar">
          <div className="dash-search-wrap">
            <span className="dash-search-icon"><Icon type="search" size={15} /></span>
            <input
              className="dash-search-input"
              type="text"
              placeholder="Search identity fields..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="dash-topbar-logout" onClick={logout} title="Sign out">
            <Icon type="logout" size={18} />
          </button>
        </div>

        {/* ── Content ── */}
        <div className="dash-content">

          {/* ── Hero ── */}
          <div className="dash-hero">
            <div className="dash-hero__badge">
              <span className="badge-dot" />
              Extension Active
            </div>
            <div className="dash-hero__row">
              <div className="dash-hero__text">
                <h1>Your Profile</h1>
                <p>Manage your core identity data used for automated form fulfillment across premium platforms.</p>
              </div>
              <button className="save-btn" onClick={saveProfile} disabled={saving}>
                {saving ? <span className="spinner" /> : "SAVE CHANGES"}
              </button>
            </div>
          </div>

          {/* ── Grid ── */}
          <div className="dash-grid">

            {/* Legal Identity */}
            {matchesSearch("name legal identity") && (
              <div className="dash-section">
                <div className="dash-section__header">
                  <span className="dash-section__title">Legal Identity</span>
                  <span className="dash-section__icon"><Icon type="id" size={16} /></span>
                </div>
                <div>
                  <div className="field-group" style={{ marginBottom: 0 }}>
                    <label>Full Name</label>
                  </div>
                  <div className="field-card" style={{ marginTop: 8 }}>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your full name"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Chronology / DOB */}
            {matchesSearch("date of birth dob chronology") && (
              <div className="dash-section">
                <div className="dash-section__header">
                  <span className="dash-section__title">Chronology</span>
                  <span className="dash-section__icon"><Icon type="calendar" size={16} /></span>
                </div>
                <div>
                  <div className="field-group" style={{ marginBottom: 0 }}>
                    <label>Date of Birth</label>
                  </div>
                  <div className="field-date-wrap" style={{ marginTop: 8 }}>
                    <input
                      type="date"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                    />
                    <span className="field-card__icon"><Icon type="calendar" size={15} /></span>
                  </div>
                </div>
              </div>
            )}

            {/* Communications / Email */}
            {matchesSearch("email communications") && (
              <div className="dash-section">
                <div className="dash-section__header">
                  <span className="dash-section__title">Communications</span>
                </div>
                {emails.map((email, index) => (
                  <div key={index} className="field-card">
                    <span className="field-card__icon"><Icon type="mail" size={15} /></span>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        const updated = [...emails];
                        updated[index] = e.target.value;
                        setEmails(updated);
                      }}
                      placeholder="your@email.com"
                    />
                    {index === 0 && email && <span className="field-card__badge">PRIMARY</span>}
                    {emails.length > 1 && (
                      <button 
                        className="field-delete-btn"
                        onClick={() => setEmails(emails.filter((_, i) => i !== index))}
                      >
                        <Icon type="delete" size={14} />
                      </button>
                    )}
                  </div>
                ))}
                <button className="field-add-btn" onClick={() => setEmails([...emails, ""])}>
                  + ADD EMAIL
                </button>
              </div>
            )}

            {/* Verification / Phone */}
            {matchesSearch("phone verification") && (
              <div className="dash-section">
                <div className="dash-section__header">
                  <span className="dash-section__title">Verification</span>
                </div>
                {phones.map((phone, index) => (
                  <div key={index} className="field-card">
                    <span className="field-card__icon"><Icon type="phone" size={15} /></span>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => {
                        const updated = [...phones];
                        updated[index] = e.target.value;
                        setPhones(updated);
                      }}
                      placeholder="+91 00000 00000"
                    />
                    {phones.length > 1 && (
                      <button 
                        className="field-delete-btn"
                        onClick={() => setPhones(phones.filter((_, i) => i !== index))}
                      >
                        <Icon type="delete" size={14} />
                      </button>
                    )}
                  </div>
                ))}
                <button className="field-add-btn" onClick={() => setPhones([...phones, ""])}>
                  + ADD PHONE
                </button>
              </div>
            )}

            {/* Personal Info / Gender */}
            {matchesSearch("gender personal info") && (
              <div className="dash-section">
                <div className="dash-section__header">
                  <span className="dash-section__title">Personal Info</span>
                  <span className="dash-section__icon"><Icon type="user" size={16} /></span>
                </div>
                <div>
                  <div className="field-group" style={{ marginBottom: 0 }}>
                    <label>Gender</label>
                  </div>
                  <div className="field-select-wrap" style={{ marginTop: 8 }}>
                    <select value={gender} onChange={(e) => setGender(e.target.value)}>
                      <option value="">Select gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Non-binary">Non-binary</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Citizenship / Nationality */}
            {matchesSearch("nationality citizenship") && (
              <div className="dash-section">
                <div className="dash-section__header">
                  <span className="dash-section__title">Citizenship</span>
                  <span className="dash-section__icon"><Icon type="globe" size={16} /></span>
                </div>
                <div>
                  <div className="field-group" style={{ marginBottom: 0 }}>
                    <label>Nationality</label>
                  </div>
                  <div className="field-card" style={{ marginTop: 8 }}>
                    <input
                      type="text"
                      value={nationality}
                      onChange={(e) => setNationality(e.target.value)}
                      placeholder="e.g., India, USA"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Address */}
            {matchesSearch("address street city state country pincode zip") && (
              <div className="dash-section" style={{ gridColumn: "1 / -1" }}>
                <div className="dash-section__header">
                  <span className="dash-section__title">Address</span>
                  <span className="dash-section__icon"><Icon type="pin" size={16} /></span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <div className="field-group" style={{ marginBottom: 0 }}>
                      <label>Street Address</label>
                    </div>
                    <div className="field-card" style={{ marginTop: 8 }}>
                      <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="House / flat / street"
                      />
                    </div>
                  </div>
                  {[
                    { label: "City", val: city, set: setCity, ph: "e.g., Mumbai" },
                    { label: "State / Province", val: state, set: setState, ph: "e.g., Maharashtra" },
                    { label: "Country", val: country, set: setCountry, ph: "e.g., India" },
                    { label: "Pincode / ZIP", val: pincode, set: setPincode, ph: "e.g., 400001" },
                  ].map(({ label, val, set, ph }) => (
                    <div key={label}>
                      <div className="field-group" style={{ marginBottom: 0 }}>
                        <label>{label}</label>
                      </div>
                      <div className="field-card" style={{ marginTop: 8 }}>
                        <input type="text" value={val} onChange={(e) => set(e.target.value)} placeholder={ph} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            {matchesSearch("college university degree branch graduation cgpa education") && (
              <div className="dash-section" style={{ gridColumn: "1 / -1" }}>
                <div className="dash-section__header">
                  <span className="dash-section__title">Education</span>
                  <span className="dash-section__icon"><Icon type="book" size={16} /></span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  {[
                    { label: "College / University", val: college, set: setCollege, ph: "e.g., IIT Bombay" },
                    { label: "Degree", val: degree, set: setDegree, ph: "e.g., B.Tech, MBA" },
                    { label: "Branch / Major", val: branch, set: setBranch, ph: "e.g., Computer Science" },
                    { label: "Graduation Year", val: graduationYear, set: setGraduationYear, ph: "e.g., 2025" },
                    { label: "CGPA / Percentage", val: cgpa, set: setCgpa, ph: "e.g., 8.5 or 85%" },
                  ].map(({ label, val, set, ph }) => (
                    <div key={label}>
                      <div className="field-group" style={{ marginBottom: 0 }}>
                        <label>{label}</label>
                      </div>
                      <div className="field-card" style={{ marginTop: 8 }}>
                        <input type="text" value={val} onChange={(e) => set(e.target.value)} placeholder={ph} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Professional */}
            {matchesSearch("company job title experience skills professional") && (
              <div className="dash-section" style={{ gridColumn: "1 / -1" }}>
                <div className="dash-section__header">
                  <span className="dash-section__title">Professional</span>
                  <span className="dash-section__icon"><Icon type="briefcase" size={16} /></span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  {[
                    { label: "Current Company", val: currentCompany, set: setCurrentCompany, ph: "e.g., Google, Infosys" },
                    { label: "Job Title", val: jobTitle, set: setJobTitle, ph: "e.g., Software Engineer" },
                    { label: "Years of Experience", val: experience, set: setExperience, ph: "e.g., 2, 3.5, Fresher" },
                  ].map(({ label, val, set, ph }) => (
                    <div key={label}>
                      <div className="field-group" style={{ marginBottom: 0 }}>
                        <label>{label}</label>
                      </div>
                      <div className="field-card" style={{ marginTop: 8 }}>
                        <input type="text" value={val} onChange={(e) => set(e.target.value)} placeholder={ph} />
                      </div>
                    </div>
                  ))}
                </div>
                <div>
                  <div className="field-group" style={{ marginBottom: 8 }}>
                    <label>Skills</label>
                  </div>
                  <TagInput values={skills} onChange={setSkills} placeholder="Add skill and press Enter" />
                </div>
                <div>
                  <div className="field-group" style={{ marginBottom: 8 }}>
                    <label>Languages Known</label>
                  </div>
                  <TagInput values={languages} onChange={setLanguages} placeholder="Add language and press Enter" />
                </div>
              </div>
            )}

            {/* Online Presence */}
            {matchesSearch("linkedin github website portfolio online") && (
              <div className="dash-section" style={{ gridColumn: "1 / -1" }}>
                <div className="dash-section__header">
                  <span className="dash-section__title">Online Presence</span>
                  <span className="dash-section__icon"><Icon type="link" size={16} /></span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  {[
                    { label: "LinkedIn", val: linkedin, set: setLinkedin, ph: "https://linkedin.com/in/username" },
                    { label: "GitHub", val: github, set: setGithub, ph: "https://github.com/username" },
                    { label: "Website / Portfolio", val: website, set: setWebsite, ph: "https://yourwebsite.com" },
                  ].map(({ label, val, set, ph }) => (
                    <div key={label}>
                      <div className="field-group" style={{ marginBottom: 0 }}>
                        <label>{label}</label>
                      </div>
                      <div className="field-card" style={{ marginTop: 8 }}>
                        <input type="url" value={val} onChange={(e) => set(e.target.value)} placeholder={ph} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="dash-footer">
        <div className="dash-footer__left">
          <span className="dash-footer__dot" />
          END-TO-END ENCRYPTED IDENTITY VAULT
        </div>
        <div className="dash-footer__right">AUTOSLAY ENGINE V4.2.0</div>
      </div>

      {toast && <Toast message={toast.msg} type={toast.type} />}
    </div>
  );
}
