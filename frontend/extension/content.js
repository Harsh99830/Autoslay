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

  // ─── Selection Panel ───────────────────────────────────────────────────────
  function showSelectionPanel(user, onConfirm) {
    // Remove existing panel
    const existing = document.getElementById("__autoslay_select_panel");
    if (existing) existing.remove();

    const panel = document.createElement("div");
    panel.id = "__autoslay_select_panel";
    panel.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 2147483647;
      width: 340px;
      background: #0f0e17;
      border: 1px solid rgba(255,255,255,0.15);
      border-radius: 16px;
      padding: 24px;
      font-family: 'Segoe UI', sans-serif;
      color: #fff;
      box-shadow: 0 20px 60px rgba(0,0,0,0.6);
    `;

    const emails = user.emails || [];
    const phones = user.phone_numbers || [];

    panel.innerHTML = `
      <div style="font-size:18px; font-weight:700; margin-bottom:20px; text-align:center;">
        ⚡ Select Data to Fill
      </div>
      
      ${emails.length > 0 ? `
        <div style="margin-bottom:16px;">
          <label style="display:block; font-size:12px; color:rgba(255,255,255,0.5); margin-bottom:8px; text-transform:uppercase;">Email</label>
          <select id="__autoslay_sel_email" style="width:100%; padding:10px 12px; background:#1a1929; border:1px solid rgba(255,255,255,0.15); border-radius:8px; color:#fff; font-size:14px;">
            ${emails.map(e => `<option value="${e}">${e}</option>`).join("")}
          </select>
        </div>
      ` : ""}
      
      ${phones.length > 0 ? `
        <div style="margin-bottom:20px;">
          <label style="display:block; font-size:12px; color:rgba(255,255,255,0.5); margin-bottom:8px; text-transform:uppercase;">Phone</label>
          <select id="__autoslay_sel_phone" style="width:100%; padding:10px 12px; background:#1a1929; border:1px solid rgba(255,255,255,0.15); border-radius:8px; color:#fff; font-size:14px;">
            ${phones.map(p => `<option value="${p}">${p}</option>`).join("")}
          </select>
        </div>
      ` : ""}
      
      <div style="display:flex; gap:12px;">
        <button id="__autoslay_cancel" style="flex:1; padding:12px; background:rgba(255,255,255,0.1); border:none; border-radius:10px; color:#fff; font-size:14px; cursor:pointer;">Cancel</button>
        <button id="__autoslay_fill" style="flex:1; padding:12px; background:linear-gradient(135deg, #6C47FF, #FF4785); border:none; border-radius:10px; color:#fff; font-size:14px; font-weight:600; cursor:pointer;">Fill Form</button>
      </div>
    `;

    // Backdrop
    const backdrop = document.createElement("div");
    backdrop.id = "__autoslay_backdrop";
    backdrop.style.cssText = `
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.5);
      z-index: 2147483646;
    `;
    backdrop.onclick = () => {
      panel.remove();
      backdrop.remove();
    };

    document.body.appendChild(backdrop);
    document.body.appendChild(panel);

    document.getElementById("__autoslay_cancel").onclick = () => {
      panel.remove();
      backdrop.remove();
    };

    document.getElementById("__autoslay_fill").onclick = () => {
      const selectedEmail = document.getElementById("__autoslay_sel_email")?.value || emails[0] || "";
      const selectedPhone = document.getElementById("__autoslay_sel_phone")?.value || phones[0] || "";
      panel.remove();
      backdrop.remove();
      onConfirm(selectedEmail, selectedPhone);
    };
  }

  // ─── Fill Form Function ────────────────────────────────────────────────────
  function fillFormWithUserData(user, selectedEmail, selectedPhone) {
    const fillData = {
      name:  user.name,
      firstName: (user.name || "").split(" ")[0],
      lastName:  (user.name || "").split(" ").slice(1).join(" ") || (user.name || "").split(" ")[0],
      email: selectedEmail || (user.emails || [])[0] || "",
      phone: selectedPhone || (user.phone_numbers || [])[0] || "",
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
        if (!el.value && index < 3) {
          if (index === 0 && user.name) {
            fillField(el, user.name);
            filled++;
          } else if (index === 1 && fillData.email) {
            fillField(el, fillData.email);
            filled++;
          } else if (index === 2 && fillData.phone) {
            fillField(el, fillData.phone);
            filled++;
          }
        }
      });
    }

    showToast(`✅ Filled ${filled} field${filled !== 1 ? "s" : ""}!`);
    return filled;
  }

  // ─── Toast ─────────────────────────────────────────────────────────────────
  function showToast(message) {
    const toast = document.createElement("div");
    toast.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
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

  // ─── Message Listener ──────────────────────────────────────────────────────
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "FILL_FORM") {
      const user = message.user;
      const emails = user.emails || [];
      const phones = user.phone_numbers || [];
      
      // If user has multiple emails or phones, show selection panel
      if (emails.length > 1 || phones.length > 1) {
        showSelectionPanel(user, (selectedEmail, selectedPhone) => {
          const filled = fillFormWithUserData(user, selectedEmail, selectedPhone);
          showToast(`✅ Filled ${filled} field${filled !== 1 ? "s" : ""}!`);
        });
        sendResponse({ success: true, showingSelector: true });
      } else {
        // Single option, fill directly
        const filled = fillFormWithUserData(user, emails[0], phones[0]);
        sendResponse({ success: true, filled });
      }
      return true;
    }
  });

  // ─── Init ──────────────────────────────────────────────────────────────────
  // No button injection - form filling happens via extension popup only
  console.log("AutoSlay content script loaded - waiting for fill command from popup");
})();
