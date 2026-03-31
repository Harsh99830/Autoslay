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
  function showSelectionPanel(user, detectedFields, onConfirm) {
    // Remove existing panel
    const existing = document.getElementById("__autoslay_select_panel");
    if (existing) existing.remove();
    const existingBackdrop = document.getElementById("__autoslay_backdrop");
    if (existingBackdrop) existingBackdrop.remove();

    const panel = document.createElement("div");
    panel.id = "__autoslay_select_panel";
    panel.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 2147483647;
      width: 380px;
      max-height: 80vh;
      overflow-y: auto;
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

    // Build list of all fillable fields
    const fillableFields = [];
    
    if (user.name) {
      fillableFields.push({ type: 'name', label: 'Name', value: user.name });
    }
    
    // Email selector (if multiple)
    if (emails.length > 0) {
      if (emails.length === 1) {
        fillableFields.push({ type: 'email', label: 'Email', value: emails[0] });
      } else {
        fillableFields.push({ type: 'email', label: 'Email', value: emails[0], isSelectable: true, options: emails });
      }
    }
    
    // Phone selector (if multiple)
    if (phones.length > 0) {
      if (phones.length === 1) {
        fillableFields.push({ type: 'phone', label: 'Phone', value: phones[0] });
      } else {
        fillableFields.push({ type: 'phone', label: 'Phone', value: phones[0], isSelectable: true, options: phones });
      }
    }
    
    if (user.linkedin) {
      fillableFields.push({ type: 'linkedin', label: 'LinkedIn', value: user.linkedin });
    }
    if (user.website) {
      fillableFields.push({ type: 'website', label: 'Website', value: user.website });
    }
    if (user.github) {
      fillableFields.push({ type: 'github', label: 'GitHub', value: user.github });
    }
    if (user.address) {
      fillableFields.push({ type: 'address', label: 'Address', value: user.address });
    }
    if (user.college) {
      fillableFields.push({ type: 'college', label: 'College/University', value: user.college });
    }
    if (user.degree) {
      fillableFields.push({ type: 'degree', label: 'Degree', value: user.degree });
    }

    // Build field items HTML
    const fieldsHtml = fillableFields.map((field, index) => {
      const fieldId = `__autoslay_field_${index}`;
      const valueDisplay = field.isSelectable 
        ? `<select id="${fieldId}_select" style="flex:1; min-width:0; max-width:calc(100% - 120px); padding:8px 10px; background:#1a1929; border:1px solid rgba(255,255,255,0.15); border-radius:6px; color:#fff; font-size:13px; margin-left:10px; box-sizing:border-box;">
            ${field.options.map(opt => `<option value="${opt}">${opt}</option>`).join('')}
           </select>`
        : `<span style="flex:1; margin-left:10px; font-size:13px; color:rgba(255,255,255,0.8); overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${field.value}</span>`;
      
      return `
        <div class="__autoslay_field_item" data-type="${field.type}" data-index="${index}" style="display:flex; align-items:center; padding:10px; background:rgba(255,255,255,0.05); border-radius:8px; margin-bottom:8px;">
          <input type="checkbox" id="${fieldId}_check" checked style="width:18px; height:18px; accent-color:#6C47FF; cursor:pointer;">
          <label for="${fieldId}_check" style="font-size:12px; color:rgba(255,255,255,0.6); text-transform:uppercase; min-width:80px; margin-left:8px; cursor:pointer;">${field.label}</label>
          ${valueDisplay}
        </div>
      `;
    }).join('');

    panel.innerHTML = `
      <div style="font-size:18px; font-weight:700; margin-bottom:8px; text-align:center;">
        ⚡ Confirm Data to Fill
      </div>
      <div style="font-size:12px; color:rgba(255,255,255,0.5); margin-bottom:20px; text-align:center;">
        Uncheck items you don't want to fill
      </div>
      
      <div style="margin-bottom:20px; max-height:40vh; overflow-y:auto;">
        ${fieldsHtml}
      </div>
      
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
      // Collect selected fields
      const selectedFields = {};
      const fieldItems = panel.querySelectorAll('.__autoslay_field_item');
      
      fieldItems.forEach(item => {
        const type = item.getAttribute('data-type');
        const index = item.getAttribute('data-index');
        const checkbox = document.getElementById(`__autoslay_field_${index}_check`);
        
        if (checkbox.checked) {
          // Get value (either from select or from the field data)
          const selectEl = document.getElementById(`__autoslay_field_${index}_select`);
          if (selectEl) {
            selectedFields[type] = selectEl.value;
          } else {
            // Find the value from fillableFields
            const field = fillableFields[parseInt(index)];
            selectedFields[type] = field.value;
          }
        }
      });
      
      panel.remove();
      backdrop.remove();
      onConfirm(selectedFields);
    };
  }

  // ─── Fill Form Function ────────────────────────────────────────────────────
  function fillFormWithUserData(user, selectedFields) {
    // Only include fields that were actually checked (present in selectedFields)
    const fillData = {};
    
    if (selectedFields.name) {
      fillData.name = selectedFields.name;
      fillData.firstName = selectedFields.name.split(" ")[0];
      fillData.lastName = selectedFields.name.split(" ").slice(1).join(" ");
    }
    if (selectedFields.email) fillData.email = selectedFields.email;
    if (selectedFields.phone) fillData.phone = selectedFields.phone;
    if (selectedFields.linkedin) fillData.linkedin = selectedFields.linkedin;
    if (selectedFields.website) fillData.website = selectedFields.website;
    if (selectedFields.github) fillData.github = selectedFields.github;
    if (selectedFields.address) fillData.address = selectedFields.address;
    if (selectedFields.college) fillData.college = selectedFields.college;
    if (selectedFields.degree) fillData.degree = selectedFields.degree;

    const fields = detectFormFields();
    console.log("Detected fields:", fields.map(f => ({ type: f.type, name: f.el.name, id: f.el.id })));
    console.log("Fill data:", fillData);
    
    let filled = 0;
    const filledTypes = new Set();
    
    fields.forEach(({ el, type }) => {
      if (fillData[type] && !filledTypes.has(type)) {
        fillField(el, fillData[type]);
        filled++;
        filledTypes.add(type);
      }
    });

    // Fallback: fill any empty text/email/tel inputs
    if (filled === 0) {
      const allInputs = document.querySelectorAll("input[type='text'], input[type='email'], input[type='tel'], input:not([type]), textarea");
      const values = Object.values(fillData).filter(v => v);
      allInputs.forEach((el, index) => {
        if (!el.value && index < values.length) {
          fillField(el, values[index]);
          filled++;
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
      
      // Always show selection panel so user can confirm what to fill
      showSelectionPanel(user, null, (selectedFields) => {
        const filled = fillFormWithUserData(user, selectedFields);
        showToast(`✅ Filled ${filled} field${filled !== 1 ? "s" : ""}!`);
      });
      sendResponse({ success: true, showingSelector: true });
      return true;
    }
  });

  // ─── Init ──────────────────────────────────────────────────────────────────
  // No button injection - form filling happens via extension popup only
  console.log("AutoSlay content script loaded - waiting for fill command from popup");
})();
