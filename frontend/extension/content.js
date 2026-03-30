// content.js — AutoSlay Form Detection & Autofill

(function () {
  if (window.__autoslayInjected) return;
  window.__autoslayInjected = true;

  // ─── Constants ─────────────────────────────────────────────────────────────
  const FIELD_KEYWORDS = {
    name:      ["name", "full.?name", "fullname", "your.?name", "applicant.?name", "candidate.?name"],
    firstName: ["first.?name", "fname", "given.?name", "firstname"],
    lastName:  ["last.?name", "lname", "surname", "family.?name", "lastname"],
    email:     ["e.?mail", "email.?address", "mail", "contact.?email"],
    phone:     ["phone", "mobile", "tel", "contact.?number", "cell", "whatsapp", "contact"],
    address:   ["address", "street", "city", "location", "residence", "current.?address"],
    linkedin:  ["linkedin", "linked.?in", "profile"],
    website:   ["website", "portfolio", "url", "personal.?site", "github"],
    resume:    ["resume", "cv", "curriculum", "upload", "attachment"],
    college:   ["college", "university", "institution", "school", "education"],
    degree:    ["degree", "qualification", "major", "field.?of.?study"],
    year:      ["year", "graduation", "passing.?year", "batch"],
    experience:["experience", "work.?experience", "employment"],
  };

  // ─── Helpers ───────────────────────────────────────────────────────────────
  function matchesKeywords(str, keys) {
    if (!str) return false;
    const lower = str.toLowerCase();
    return keys.some(k => new RegExp(k, "i").test(lower));
  }

  function classifyField(el) {
    const attrs = [
      el.getAttribute("name") || "",
      el.getAttribute("id") || "",
      el.getAttribute("placeholder") || "",
      el.getAttribute("aria-label") || "",
    ];
    const labelEl = el.id
      ? document.querySelector(`label[for="${el.id}"]`)
      : null;
    if (labelEl) attrs.push(labelEl.innerText || "");

    const combined = attrs.join(" ");
    for (const [type, keys] of Object.entries(FIELD_KEYWORDS)) {
      if (matchesKeywords(combined, keys)) return type;
    }
    if (el.type === "email") return "email";
    if (el.type === "tel") return "phone";
    if (el.type === "file") return "resume";
    return null;
  }

  function detectFormFields() {
    const inputs = document.querySelectorAll(
      "input:not([type='hidden']):not([type='submit']):not([type='button']):not([type='checkbox']):not([type='radio']), textarea"
    );
    const fields = [];
    inputs.forEach(el => {
      const type = classifyField(el);
      if (type) fields.push({ el, type });
    });
    return fields;
  }

  function fillField(el, value) {
    if (!value) return;
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype, "value"
    );
    if (nativeInputValueSetter) {
      nativeInputValueSetter.set.call(el, value);
    } else {
      el.value = value;
    }
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  }

  // ─── Overlay Button ────────────────────────────────────────────────────────
  function injectOverlayButton() {
    if (document.getElementById("__autoslay_btn")) return;

    const btn = document.createElement("button");
    btn.id = "__autoslay_btn";
    btn.innerHTML = `
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 2L2 7l10 5 10-5-10-5z"/>
        <path d="M2 17l10 5 10-5"/>
        <path d="M2 12l10 5 10-5"/>
      </svg>
      <span>AutoSlay</span>
    `;
    btn.style.cssText = `
      position: fixed;
      bottom: 28px;
      right: 28px;
      z-index: 2147483647;
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 18px;
      background: linear-gradient(135deg, #6C47FF, #FF4785);
      color: #fff;
      border: none;
      border-radius: 50px;
      font-family: 'Segoe UI', sans-serif;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 4px 20px rgba(108, 71, 255, 0.45);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    `;
    btn.onmouseenter = () => {
      btn.style.transform = "scale(1.06)";
      btn.style.boxShadow = "0 6px 28px rgba(108,71,255,0.6)";
    };
    btn.onmouseleave = () => {
      btn.style.transform = "scale(1)";
      btn.style.boxShadow = "0 4px 20px rgba(108,71,255,0.45)";
    };
    btn.onclick = openOverlayPanel;
    document.body.appendChild(btn);
  }

  // ─── Overlay Panel ─────────────────────────────────────────────────────────
  function openOverlayPanel() {
    if (document.getElementById("__autoslay_panel")) return;

    chrome.runtime.sendMessage({ type: "GET_USER_DATA" }, ({ user, token }) => {
      if (!user || !token) {
        showToast("⚠️ Please log in on the AutoSlay dashboard first.");
        return;
      }
      buildPanel(user);
    });
  }

  function buildPanel(user) {
    const overlay = document.createElement("div");
    overlay.id = "__autoslay_panel";
    overlay.style.cssText = `
      position: fixed;
      bottom: 90px;
      right: 28px;
      z-index: 2147483647;
      width: 320px;
      background: #0f0e17;
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 16px;
      padding: 20px;
      font-family: 'Segoe UI', sans-serif;
      color: #fff;
      box-shadow: 0 20px 60px rgba(0,0,0,0.6);
      animation: __autoslay_slide_in 0.2s ease;
    `;

    const styleEl = document.createElement("style");
    styleEl.textContent = `
      @keyframes __autoslay_slide_in {
        from { opacity: 0; transform: translateY(10px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      #__autoslay_panel select {
        width: 100%;
        background: #1a1929;
        color: #fff;
        border: 1px solid rgba(255,255,255,0.15);
        border-radius: 8px;
        padding: 8px 12px;
        font-size: 13px;
        margin-top: 5px;
        outline: none;
        cursor: pointer;
      }
      #__autoslay_panel label {
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: rgba(255,255,255,0.5);
      }
      #__autoslay_fill_btn {
        width: 100%;
        margin-top: 16px;
        padding: 11px;
        background: linear-gradient(135deg, #6C47FF, #FF4785);
        border: none;
        border-radius: 10px;
        color: #fff;
        font-size: 14px;
        font-weight: 700;
        cursor: pointer;
        transition: opacity 0.2s;
      }
      #__autoslay_fill_btn:hover { opacity: 0.9; }
    `;
    document.head.appendChild(styleEl);

    const emails = user.emails || [];
    const phones = user.phone_numbers || [];
    const resumes = user.resumes || [];

    overlay.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
        <div style="font-size:15px; font-weight:700; background: linear-gradient(135deg,#a78bfa,#f472b6); -webkit-background-clip:text; -webkit-text-fill-color:transparent;">
          ⚡ AutoSlay
        </div>
        <button id="__autoslay_close" style="background:none;border:none;color:rgba(255,255,255,0.5);cursor:pointer;font-size:18px;">✕</button>
      </div>

      <div style="margin-bottom:12px;">
        <label>Name</label>
        <div style="background:#1a1929;border:1px solid rgba(255,255,255,0.15);border-radius:8px;padding:8px 12px;font-size:13px;margin-top:5px;color:rgba(255,255,255,0.8);">
          ${user.name || "—"}
        </div>
      </div>

      <div style="margin-bottom:12px;">
        <label>Email</label>
        <select id="__autoslay_email">
          ${emails.length ? emails.map(e => `<option value="${e}">${e}</option>`).join("") : `<option value="">No emails saved</option>`}
        </select>
      </div>

      <div style="margin-bottom:12px;">
        <label>Phone</label>
        <select id="__autoslay_phone">
          ${phones.length ? phones.map(p => `<option value="${p}">${p}</option>`).join("") : `<option value="">No phones saved</option>`}
        </select>
      </div>

      <div style="margin-bottom:12px;">
        <label>Resume</label>
        <select id="__autoslay_resume">
          ${resumes.length ? resumes.map((r, i) => `<option value="${r}">Resume ${i + 1}</option>`).join("") : `<option value="">No resumes saved</option>`}
        </select>
      </div>

      <button id="__autoslay_fill_btn">⚡ Fill Form</button>
    `;

    document.body.appendChild(overlay);

    document.getElementById("__autoslay_close").onclick = () => overlay.remove();

    document.getElementById("__autoslay_fill_btn").onclick = () => {
      const selectedEmail  = document.getElementById("__autoslay_email").value;
      const selectedPhone  = document.getElementById("__autoslay_phone").value;
      const selectedResume = document.getElementById("__autoslay_resume").value;

      const fillData = {
        name:  user.name,
        firstName: (user.name || "").split(" ")[0],
        lastName:  (user.name || "").split(" ").slice(1).join(" ") || (user.name || "").split(" ")[0],
        email: selectedEmail,
        phone: selectedPhone,
        linkedin: user.linkedin || "",
        website:  user.website || "",
      };

      const fields = detectFormFields();
      console.log("Detected fields:", fields.map(f => ({ type: f.type, name: f.el.name, id: f.el.id })));
      
      let filled = 0;
      const filledTypes = new Set();
      
      fields.forEach(({ el, type }) => {
        if (fillData[type] !== undefined && !filledTypes.has(type)) {
          fillField(el, fillData[type]);
          filled++;
          filledTypes.add(type);
        }
      });

      // Fallback: fill any empty text/email/tel inputs with name/email/phone if we haven't filled them yet
      if (filled === 0) {
        const allInputs = document.querySelectorAll("input[type='text'], input[type='email'], input[type='tel'], input:not([type]), textarea");
        allInputs.forEach((el, index) => {
          if (!el.value && index < 3) { // Only fill first 3 empty fields as fallback
            if (index === 0 && user.name) {
              fillField(el, user.name);
              filled++;
            } else if (index === 1 && selectedEmail) {
              fillField(el, selectedEmail);
              filled++;
            } else if (index === 2 && selectedPhone) {
              fillField(el, selectedPhone);
              filled++;
            }
          }
        });
      }

      showToast(`✅ Filled ${filled} field${filled !== 1 ? "s" : ""}!`);
      setTimeout(() => overlay.remove(), 1000);
    };
  }

  // ─── Toast ─────────────────────────────────────────────────────────────────
  function showToast(message) {
    const toast = document.createElement("div");
    toast.style.cssText = `
      position: fixed;
      bottom: 90px;
      right: 28px;
      z-index: 2147483647;
      padding: 12px 20px;
      background: #0f0e17;
      border: 1px solid rgba(255,255,255,0.15);
      border-radius: 12px;
      color: #fff;
      font-family: 'Segoe UI', sans-serif;
      font-size: 13px;
      box-shadow: 0 8px 30px rgba(0,0,0,0.4);
      animation: __autoslay_slide_in 0.2s ease;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }

  // ─── Init ──────────────────────────────────────────────────────────────────
  function init() {
    const inputs = document.querySelectorAll(
      "input[type='text'], input[type='email'], input[type='tel'], input:not([type]), textarea"
    );
    // Show button if there are any text inputs (more lenient detection)
    if (inputs.length >= 1) {
      injectOverlayButton();
    }
  }

  // Run on load + watch for dynamic forms
  init();
  const observer = new MutationObserver(() => {
    if (!document.getElementById("__autoslay_btn")) {
      init();
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
})();
