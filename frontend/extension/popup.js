// popup.js — AutoSlay Extension Popup

const DASHBOARD_URL = CONFIG.FRONTEND_URL + '/dashboard';

const mainContent = document.getElementById("main-content");
const toast       = document.getElementById("toast");

function showToast(msg, duration = 2500) {
  toast.textContent = msg;
  toast.style.display = "block";
  setTimeout(() => { toast.style.display = "none"; }, duration);
}

function getInitials(name) {
  if (!name) return "?";
  return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
}

function truncateEmail(email, max = 22) {
  if (!email || email.length <= max) return email;
  const [local, domain] = email.split("@");
  if (!domain) return email.slice(0, max) + "…";
  if (local.length > 8) return local.slice(0, 8) + "…@" + domain;
  return email;
}

// SVG icons
const IconSettings = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`;

const IconBolt = `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>`;

const IconMail = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`;

const IconPhone = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.58 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.56a16 16 0 0 0 6.29 6.29l.87-.87a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`;

const IconExternalLink = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>`;

const IconUser = `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>`;

// ─── Logged-in render ────────────────────────────────────────────────────────
function renderLoggedIn(user) {
  const emails  = user.emails || (user.email ? [user.email] : []);
  const phones  = user.phone_numbers || [];
  const initials = getInitials(user.name);
  const photoUrl = user.avatar_url || user.picture || "";

  const avatarHTML = photoUrl
    ? `<img src="${photoUrl}" alt="avatar" />`
    : initials;

  const emailPills = emails.length
    ? emails.map(e => `<div class="pill">${truncateEmail(e)}</div>`).join("")
    : `<span class="empty-text">No emails saved</span>`;

  const phonePills = phones.length
    ? phones.map(p => `<div class="pill">${p}</div>`).join("")
    : `<span class="empty-text">No phones saved</span>`;

  mainContent.innerHTML = `
    <!-- Header -->
    <div class="header">
      <div class="header-left">
        <div class="avatar">${avatarHTML}</div>
        <div class="header-info">
          <div class="header-name">${user.name || "—"}</div>
          <div class="header-email">${emails[0] ? emails[0].toUpperCase() : "NO EMAIL"}</div>
        </div>
      </div>
      <button class="settings-btn" id="settings-btn" title="Open Dashboard">${IconSettings}</button>
    </div>

    <!-- Brand strip -->
    <div class="brand-strip">
      <div class="brand-strip-left">
        <div class="brand-name">AUTOSLAY</div>
      </div>
      <div class="brand-line"></div>
    </div>

    <!-- Fill button -->
    <div class="fill-wrap">
      <button class="fill-btn" id="fill-page-btn">
        ${IconBolt}
        Fill Current Page
      </button>
    </div>

    <!-- Open full dashboard -->
    <div class="dashboard-link-wrap">
      <button class="dashboard-link-btn" id="open-dashboard-btn">
        Open Full Dashboard ${IconExternalLink}
      </button>
    </div>

    <!-- Sign out -->
    <div class="signout-wrap">
      <button class="signout-btn" id="logout-btn">Sign Out of Session</button>
    </div>

    <!-- Footer -->
    <div class="footer">
    </div>
  `;

  // ── Event listeners ──────────────────────────────────────────────────────
  document.getElementById("fill-page-btn").onclick = () => {
    chrome.runtime.sendMessage({ type: "GET_USER_DATA" }, (res) => {
      if (!res || !res.user || !res.token) {
        showToast("Please log in first");
        return;
      }
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { type: "FILL_FORM", user: res.user }, (response) => {
          if (response && response.success) {
            if (response.showingSelector) {
              window.close();
            } else {
              showToast(`✓ Filled ${response.filled} fields`);
              setTimeout(() => window.close(), 1400);
            }
          } else {
            showToast("No fillable fields found");
            setTimeout(() => window.close(), 1400);
          }
        });
      });
    });
  };

  document.getElementById("open-dashboard-btn").onclick = () => {
    chrome.tabs.create({ url: DASHBOARD_URL });
  };

  document.getElementById("settings-btn").onclick = () => {
    chrome.tabs.create({ url: DASHBOARD_URL });
  };

  document.getElementById("logout-btn").onclick = () => {
    chrome.runtime.sendMessage({ type: "LOGOUT" }, () => {
      showToast("Signed out");
      setTimeout(renderLoggedOut, 900);
    });
  };
}

// ─── Logged-out render ───────────────────────────────────────────────────────
function renderLoggedOut() {
  mainContent.innerHTML = `
    <!-- Brand strip -->
    <div class="brand-strip" style="padding-top:24px;">
      <div class="brand-strip-left">
        <div class="brand-name">AUTOSLAY</div>
      </div>
      <div class="brand-line"></div>
    </div>

    <div class="not-logged">
      <div class="not-logged-icon">${IconUser}</div>
      <p>Sign in to your AutoSlay account to start auto-filling forms instantly.</p>
      <button class="fill-btn" id="open-login-btn" style="width:100%;font-size:13px;padding:14px;">
        Open Dashboard &amp; Sign In
      </button>
    </div>

    <!-- Footer -->
    <div class="footer">
    </div>
  `;

  document.getElementById("open-login-btn").onclick = () => {
    chrome.tabs.create({ url: DASHBOARD_URL });
  };
}

// ─── Init ────────────────────────────────────────────────────────────────────
chrome.runtime.sendMessage({ type: "GET_USER_DATA" }, (res) => {
  if (res && res.user && res.token) {
    renderLoggedIn(res.user);
  } else {
    renderLoggedOut();
  }
});
