import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import Toast from "../components/Toast";
import "../styles/dashboard.css";
import "../styles/settings.css";

export default function Settings() {
  const { user, logout, deleteUserData } = useAuth();

  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleDeleteData = async () => {
    if (confirmText.trim().toLowerCase() !== "delete my data") return;
    setDeleting(true);
    try {
      await deleteUserData();
      setShowConfirm(false);
      setConfirmText("");
      showToast("All profile data has been deleted. Your account is still active.", "success");
    } catch (err) {
      showToast(err.message || "Failed to delete data.", "error");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="dash-layout">
      <Navbar onLogout={logout} user={user} />

      <div className="dash-main">
        <div className="dash-topbar">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}>
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
            <span style={{ fontSize: 13, opacity: 0.5, letterSpacing: "0.08em", fontWeight: 600 }}>SETTINGS</span>
          </div>
        </div>

        <div className="dash-content">
          <div className="dash-hero">
            <div className="dash-hero__row">
              <div className="dash-hero__text">
                <h1>Settings</h1>
                <p>Manage your account preferences and data.</p>
              </div>
            </div>
          </div>

          <div className="settings-sections">

            {/* Account info */}
            <div className="settings-card">
              <div className="settings-card__header">
                <span className="settings-card__title">Account</span>
              </div>
              <div className="settings-card__body">
                <div className="settings-row">
                  <span className="settings-label">Email</span>
                  <span className="settings-value">{user?.email || "—"}</span>
                </div>
                <div className="settings-row">
                  <span className="settings-label">Name</span>
                  <span className="settings-value">{user?.name || "—"}</span>
                </div>
                <div className="settings-row">
                  <span className="settings-label">Account status</span>
                  <span className="settings-value settings-value--active">Active</span>
                </div>
              </div>
            </div>

            {/* Danger zone */}
            <div className="settings-card settings-card--danger">
              <div className="settings-card__header">
                <span className="settings-card__title settings-card__title--danger">Danger Zone</span>
              </div>
              <div className="settings-card__body">
                <div className="settings-danger-row">
                  <div>
                    <div className="settings-danger-title">Delete profile data</div>
                    <div className="settings-danger-desc">
                      Permanently removes all stored identity information — name, emails, phone numbers, education, professional details, and more — from our database.
                      <br />
                      <strong>Your account remains active.</strong> You can log back in and re-enter your data at any time.
                    </div>
                  </div>
                  <button
                    className="settings-delete-btn"
                    onClick={() => { setShowConfirm(true); setConfirmText(""); }}
                  >
                    Delete My Data
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      <div className="dash-footer">
        <div className="dash-footer__left">
          <span className="dash-footer__dot" />
          END-TO-END ENCRYPTED IDENTITY VAULT
        </div>
        <div className="dash-footer__right">AUTOSLAY ENGINE V1.0.2</div>
      </div>

      {/* Confirmation modal */}
      {showConfirm && (
        <div className="settings-modal-overlay" onClick={() => !deleting && setShowConfirm(false)}>
          <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
            <div className="settings-modal__icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </div>
            <h2 className="settings-modal__title">Delete all profile data?</h2>
            <p className="settings-modal__desc">
              This will wipe every field saved in your profile from our database. Your login account will remain intact — you'll still be able to sign in.
            </p>
            <p className="settings-modal__prompt">
              Type <strong>delete my data</strong> to confirm:
            </p>
            <input
              className="settings-modal__input"
              type="text"
              placeholder="delete my data"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && confirmText.trim().toLowerCase() === "delete my data") {
                  handleDeleteData();
                }
              }}
              autoFocus
            />
            <div className="settings-modal__actions">
              <button
                className="settings-modal__cancel"
                onClick={() => setShowConfirm(false)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                className="settings-modal__confirm"
                onClick={handleDeleteData}
                disabled={deleting || confirmText.trim().toLowerCase() !== "delete my data"}
              >
                {deleting ? <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> : "Yes, Delete My Data"}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.msg} type={toast.type} />}
    </div>
  );
}
