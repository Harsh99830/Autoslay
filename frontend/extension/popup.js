// popup.js — AutoSlay Extension Popup

const DASHBOARD_URL = "http://localhost:5173"; // Your React app URL

const mainContent = document.getElementById("main-content");
const statusDot   = document.getElementById("status-dot");
const toast       = document.getElementById("toast");

function showToast(msg, duration = 2500) {
  toast.textContent = msg;
  toast.style.display = "block";
  setTimeout(() => { toast.style.display = "none"; }, duration);
}

function renderLoggedIn(user) {
  statusDot.style.background = "#22c55e";
  statusDot.style.boxShadow  = "0 0 6px #22c55e";

  const emails = user.emails || [];
  const phones = user.phone_numbers || [];

  mainContent.innerHTML = `
    <div class="body">
      <div class="user-card">
        <div class="user-name">${user.name || "—"}</div>
        <div class="user-email">${emails[0] || "No email saved"}</div>
      </div>

      ${emails.length > 1 ? `
        <div class="section-label">Saved Emails</div>
        <div class="pill-row">
          ${emails.map(e => `<div class="pill">${e}</div>`).join("")}
        </div>
      ` : ""}

      ${phones.length ? `
        <div class="section-label">Phone Numbers</div>
        <div class="pill-row">
          ${phones.map(p => `<div class="pill">${p}</div>`).join("")}
        </div>
      ` : ""}

      <div class="section-label">Resumes</div>
      <div class="pill-row">
        ${(user.resumes || []).length
          ? user.resumes.map((_, i) => `<div class="pill">Resume ${i + 1}</div>`).join("")
          : `<div style="font-size:12px;color:rgba(255,255,255,0.35);">No resumes uploaded</div>`
        }
      </div>

      <button class="action-btn btn-fill" id="fill-page-btn">⚡ Fill Current Page</button>
      <button class="action-btn btn-secondary" id="open-dashboard-btn">⚙ Open Dashboard</button>
    </div>

    <div class="footer">
      <span class="footer-text">AutoSlay v1.0</span>
      <button class="logout-btn" id="logout-btn">Log out</button>
    </div>
  `;

  document.getElementById("fill-page-btn").onclick = () => {
    chrome.runtime.sendMessage({ type: "GET_USER_DATA" }, ({ user, token }) => {
      if (!user || !token) {
        showToast("Please log in first");
        return;
      }
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { type: "FILL_FORM", user: user }, (response) => {
          if (response && response.success) {
            showToast(`Filled ${response.filled} fields!`);
          } else {
            showToast("Failed to fill form");
          }
          setTimeout(() => window.close(), 1200);
        });
      });
    });
  };

  document.getElementById("open-dashboard-btn").onclick = () => {
    chrome.tabs.create({ url: DASHBOARD_URL });
  };

  document.getElementById("logout-btn").onclick = () => {
    chrome.runtime.sendMessage({ type: "LOGOUT" }, () => {
      showToast("Logged out");
      setTimeout(renderLoggedOut, 800);
    });
  };
}

function renderLoggedOut() {
  statusDot.style.background = "#6b7280";
  statusDot.style.boxShadow  = "none";

  mainContent.innerHTML = `
    <div class="not-logged-in">
      <p>Sign in to your AutoSlay account to start auto-filling forms.</p>
      <button class="action-btn btn-fill" id="open-login-btn">Open Dashboard & Sign In</button>
    </div>
    <div class="footer">
      <span class="footer-text">AutoSlay v1.0</span>
    </div>
  `;

  document.getElementById("open-login-btn").onclick = () => {
    chrome.tabs.create({ url: DASHBOARD_URL });
  };
}

// ─── Init ───────────────────────────────────────────────────────────────────
chrome.runtime.sendMessage({ type: "GET_USER_DATA" }, ({ user, token }) => {
  if (user && token) {
    renderLoggedIn(user);
  } else {
    renderLoggedOut();
  }
});
