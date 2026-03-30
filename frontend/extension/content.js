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

  // ─── Fill Form Function ────────────────────────────────────────────────────
  function fillFormWithUserData(user) {
    const emails = user.emails || [];
    const phones = user.phone_numbers || [];
    const primaryEmail = emails[0] || "";
    const primaryPhone = phones[0] || "";

    const fillData = {
      name:  user.name,
      firstName: (user.name || "").split(" ")[0],
      lastName:  (user.name || "").split(" ").slice(1).join(" ") || (user.name || "").split(" ")[0],
      email: primaryEmail,
      phone: primaryPhone,
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
          } else if (index === 1 && primaryEmail) {
            fillField(el, primaryEmail);
            filled++;
          } else if (index === 2 && primaryPhone) {
            fillField(el, primaryPhone);
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
      const filled = fillFormWithUserData(message.user);
      sendResponse({ success: true, filled });
      return true;
    }
  });

  // ─── Init ──────────────────────────────────────────────────────────────────
  // No button injection - form filling happens via extension popup only
  console.log("AutoSlay content script loaded - waiting for fill command from popup");
})();
