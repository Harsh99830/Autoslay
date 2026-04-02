import { useState, useRef, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import TagInput from "../components/TagInput";
import Toast from "../components/Toast";
import "../styles/dashboard.css";

export default function Dashboard() {
  const { user, updateUser, uploadResume, logout } = useAuth();
  // Identity
  const [name, setName] = useState(user?.name || "");
  const [emails, setEmails] = useState(user?.emails || []);
  const [phones, setPhones] = useState(user?.phone_numbers || []);
  const [resumes] = useState(user?.resumes || []);
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
        linkedin, github, website,
        address, city, state, country, pincode,
        college, degree, branch,
        graduation_year: graduationYear,
        cgpa,
        date_of_birth: dob,
        gender, nationality,
        current_company: currentCompany,
        job_title: jobTitle,
        years_of_experience: experience,
        skills, languages,
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

          {/* ────────────────────── IDENTITY ────────────────────── */}
          {matchesSearch("name") && (
          <section className="dash-card">
            <div className="card-header">
              <div className="card-icon">👤</div>
              <div><h2>Identity</h2><p>Your name used on forms</p></div>
            </div>
            <div className="field-group">
              <label>Full Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" />
            </div>
          </section>
          )}

          {matchesSearch("email") && (
          <section className="dash-card">
            <div className="card-header">
              <div className="card-icon">✉️</div>
              <div><h2>Email Addresses</h2><p>Add multiple, pick one when filling</p></div>
            </div>
            <TagInput values={emails} onChange={setEmails} placeholder="Add email and press Enter" type="email" />
          </section>
          )}

          {matchesSearch("phone") && (
          <section className="dash-card">
            <div className="card-header">
              <div className="card-icon">📱</div>
              <div><h2>Phone Numbers</h2><p>Add multiple numbers</p></div>
            </div>
            <TagInput values={phones} onChange={setPhones} placeholder="Add phone and press Enter" type="tel" />
          </section>
          )}

          {/* ────────────────────── PERSONAL ────────────────────── */}
          {matchesSearch("date of birth dob") && (
          <section className="dash-card">
            <div className="card-header">
              <div className="card-icon">🎂</div>
              <div><h2>Date of Birth</h2><p>Used on government &amp; official forms</p></div>
            </div>
            <div className="field-group">
              <label>Date of Birth</label>
              <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} />
            </div>
          </section>
          )}

          {matchesSearch("gender") && (
          <section className="dash-card">
            <div className="card-header">
              <div className="card-icon">🧑</div>
              <div><h2>Gender</h2><p>As required on official forms</p></div>
            </div>
            <div className="field-group">
              <label>Gender</label>
              <select value={gender} onChange={(e) => setGender(e.target.value)}>
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Non-binary">Non-binary</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>
          </section>
          )}

          {matchesSearch("nationality") && (
          <section className="dash-card">
            <div className="card-header">
              <div className="card-icon">🌍</div>
              <div><h2>Nationality</h2><p>Your citizenship / nationality</p></div>
            </div>
            <div className="field-group">
              <label>Nationality</label>
              <input type="text" value={nationality} onChange={(e) => setNationality(e.target.value)} placeholder="e.g., Indian, American" />
            </div>
          </section>
          )}

          {/* ────────────────────── ADDRESS ────────────────────── */}
          {matchesSearch("address street") && (
          <section className="dash-card">
            <div className="card-header">
              <div className="card-icon">📍</div>
              <div><h2>Street Address</h2><p>House / flat / street details</p></div>
            </div>
            <div className="field-group">
              <label>Street Address</label>
              <textarea value={address} onChange={(e) => setAddress(e.target.value)} placeholder="e.g., 42 MG Road, Apt 3B" rows="2" />
            </div>
          </section>
          )}

          {matchesSearch("city") && (
          <section className="dash-card">
            <div className="card-header">
              <div className="card-icon">🏙️</div>
              <div><h2>City</h2><p>Your current city</p></div>
            </div>
            <div className="field-group">
              <label>City</label>
              <input type="text" value={city} onChange={(e) => setCity(e.target.value)} placeholder="e.g., Mumbai, Bangalore" />
            </div>
          </section>
          )}

          {matchesSearch("state province") && (
          <section className="dash-card">
            <div className="card-header">
              <div className="card-icon">🗻</div>
              <div><h2>State / Province</h2><p>Your state or region</p></div>
            </div>
            <div className="field-group">
              <label>State / Province</label>
              <input type="text" value={state} onChange={(e) => setState(e.target.value)} placeholder="e.g., Maharashtra, Karnataka" />
            </div>
          </section>
          )}

          {matchesSearch("country") && (
          <section className="dash-card">
            <div className="card-header">
              <div className="card-icon">🇳🇬</div>
              <div><h2>Country</h2><p>Your country of residence</p></div>
            </div>
            <div className="field-group">
              <label>Country</label>
              <input type="text" value={country} onChange={(e) => setCountry(e.target.value)} placeholder="e.g., India, USA" />
            </div>
          </section>
          )}

          {matchesSearch("pincode zip postal") && (
          <section className="dash-card">
            <div className="card-header">
              <div className="card-icon">📮</div>
              <div><h2>Pincode / ZIP</h2><p>Postal / ZIP code</p></div>
            </div>
            <div className="field-group">
              <label>Pincode / ZIP</label>
              <input type="text" value={pincode} onChange={(e) => setPincode(e.target.value)} placeholder="e.g., 400001" />
            </div>
          </section>
          )}

          {/* ────────────────────── EDUCATION ────────────────────── */}
          {matchesSearch("college university") && (
          <section className="dash-card">
            <div className="card-header">
              <div className="card-icon">🎓</div>
              <div><h2>College / University</h2><p>Institution name</p></div>
            </div>
            <div className="field-group">
              <label>College / University</label>
              <input type="text" value={college} onChange={(e) => setCollege(e.target.value)} placeholder="e.g., IIT Bombay, Delhi University" />
            </div>
          </section>
          )}

          {matchesSearch("degree") && (
          <section className="dash-card">
            <div className="card-header">
              <div className="card-icon">📜</div>
              <div><h2>Degree</h2><p>Your qualification</p></div>
            </div>
            <div className="field-group">
              <label>Degree</label>
              <input type="text" value={degree} onChange={(e) => setDegree(e.target.value)} placeholder="e.g., B.Tech, B.Sc, MBA" />
            </div>
          </section>
          )}

          {matchesSearch("branch specialization major") && (
          <section className="dash-card">
            <div className="card-header">
              <div className="card-icon">🔬</div>
              <div><h2>Branch / Major</h2><p>Your specialization or stream</p></div>
            </div>
            <div className="field-group">
              <label>Branch / Major</label>
              <input type="text" value={branch} onChange={(e) => setBranch(e.target.value)} placeholder="e.g., Computer Science, Electronics" />
            </div>
          </section>
          )}

          {matchesSearch("graduation year passing year") && (
          <section className="dash-card">
            <div className="card-header">
              <div className="card-icon">📅</div>
              <div><h2>Graduation Year</h2><p>Year of passing / expected graduation</p></div>
            </div>
            <div className="field-group">
              <label>Graduation Year</label>
              <input type="text" value={graduationYear} onChange={(e) => setGraduationYear(e.target.value)} placeholder="e.g., 2025" />
            </div>
          </section>
          )}

          {matchesSearch("cgpa gpa percentage marks") && (
          <section className="dash-card">
            <div className="card-header">
              <div className="card-icon">📊</div>
              <div><h2>CGPA / Percentage</h2><p>Your academic score</p></div>
            </div>
            <div className="field-group">
              <label>CGPA / Percentage</label>
              <input type="text" value={cgpa} onChange={(e) => setCgpa(e.target.value)} placeholder="e.g., 8.5 or 85%" />
            </div>
          </section>
          )}

          {/* ────────────────────── PROFESSIONAL ───────────────────── */}
          {matchesSearch("company employer organization") && (
          <section className="dash-card">
            <div className="card-header">
              <div className="card-icon">🏢</div>
              <div><h2>Current Company</h2><p>Your current employer</p></div>
            </div>
            <div className="field-group">
              <label>Company Name</label>
              <input type="text" value={currentCompany} onChange={(e) => setCurrentCompany(e.target.value)} placeholder="e.g., Google, Infosys" />
            </div>
          </section>
          )}

          {matchesSearch("job title role designation") && (
          <section className="dash-card">
            <div className="card-header">
              <div className="card-icon">💼</div>
              <div><h2>Job Title / Designation</h2><p>Your current role</p></div>
            </div>
            <div className="field-group">
              <label>Job Title</label>
              <input type="text" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="e.g., Software Engineer, Product Manager" />
            </div>
          </section>
          )}

          {matchesSearch("experience years") && (
          <section className="dash-card">
            <div className="card-header">
              <div className="card-icon">⏳</div>
              <div><h2>Years of Experience</h2><p>Total work experience</p></div>
            </div>
            <div className="field-group">
              <label>Years of Experience</label>
              <input type="text" value={experience} onChange={(e) => setExperience(e.target.value)} placeholder="e.g., 2, 3.5, Fresher" />
            </div>
          </section>
          )}

          {matchesSearch("skills technologies") && (
          <section className="dash-card">
            <div className="card-header">
              <div className="card-icon">⚒️</div>
              <div><h2>Skills</h2><p>Technical &amp; professional skills</p></div>
            </div>
            <TagInput values={skills} onChange={setSkills} placeholder="Add skill and press Enter" />
          </section>
          )}

          {matchesSearch("languages spoken") && (
          <section className="dash-card">
            <div className="card-header">
              <div className="card-icon">🗣️</div>
              <div><h2>Languages Known</h2><p>Languages you speak or write</p></div>
            </div>
            <TagInput values={languages} onChange={setLanguages} placeholder="Add language and press Enter" />
          </section>
          )}

          {/* ────────────────────── ONLINE PRESENCE ──────────────────── */}
          {matchesSearch("linkedin") && (
          <section className="dash-card">
            <div className="card-header">
              <div className="card-icon">🔗</div>
              <div><h2>LinkedIn</h2><p>Your LinkedIn profile URL</p></div>
            </div>
            <div className="field-group">
              <input type="url" value={linkedin} onChange={(e) => setLinkedin(e.target.value)} placeholder="https://linkedin.com/in/username" />
            </div>
          </section>
          )}

          {matchesSearch("github") && (
          <section className="dash-card">
            <div className="card-header">
              <div className="card-icon">🐙</div>
              <div><h2>GitHub</h2><p>Your GitHub profile URL</p></div>
            </div>
            <div className="field-group">
              <input type="url" value={github} onChange={(e) => setGithub(e.target.value)} placeholder="https://github.com/username" />
            </div>
          </section>
          )}

          {matchesSearch("website portfolio") && (
          <section className="dash-card">
            <div className="card-header">
              <div className="card-icon">🌐</div>
              <div><h2>Website / Portfolio</h2><p>Your personal website URL</p></div>
            </div>
            <div className="field-group">
              <input type="url" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://yourwebsite.com" />
            </div>
          </section>
          )}

          {/* ────────────────────── RESUME ──────────────────────── */}
          {matchesSearch("resume") && (
          <section className="dash-card">
            <div className="card-header">
              <div className="card-icon">📄</div>
              <div><h2>Resumes</h2><p>Uploaded resume files</p></div>
            </div>
            <div className="resume-list">
              {resumes.length === 0 && (
                <p className="empty-state">No resumes uploaded yet.</p>
              )}
              {resumes.map((url, i) => (
                <div className="resume-item" key={i}>
                  <span className="resume-icon">📎</span>
                  <a href={url} target="_blank" rel="noreferrer">Resume {i + 1}</a>
                </div>
              ))}
            </div>
            <button className="upload-btn" onClick={() => fileRef.current.click()} disabled={uploading}>
              {uploading ? <span className="spinner" /> : <><span>+</span> Upload Resume (PDF)</>}
            </button>
            <input ref={fileRef} type="file" accept=".pdf,.doc,.docx" style={{ display: "none" }} onChange={handleResumeUpload} />
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
