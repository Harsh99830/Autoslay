// content.js — AutoSlay Form Detection & Autofill

(function () {
  if (window.__autoslayInjected) return;
  window.__autoslayInjected = true;

  // ─── Field Keywords ─────────────────────────────────────────────────────────
  const FIELD_KEYWORDS = {
    name: [
      "\\bname\\b", "full.?name", "fullname", "your.?name",
      "applicant.?name", "candidate.?name", "legal.?name",
      "complete.?name", "display.?name", "contact.?name",
      "student.?name", "employee.?name", "member.?name",
    ],
    firstName: [
      "first.?name", "\\bfname\\b", "given.?name", "firstname", "\\bforename\\b",
    ],
    lastName: [
      "last.?name", "\\blname\\b", "surname", "family.?name", "lastname",
    ],
    middleName: [
      "middle.?name", "middle.?initial",
    ],
    email: [
      "\\bemail\\b", "e.?mail", "email.?address", "\\bmail\\b",
      "contact.?email", "email.?id", "your.?email",
      "work.?email", "personal.?email", "primary.?email", "alternate.?email",
    ],
    phone: [
      "\\bphone\\b", "\\bmobile\\b", "\\btel\\b", "contact.?number",
      "\\bcell\\b", "\\bwhatsapp\\b", "mobile.?number", "phone.?number",
      "\\btelephone\\b", "work.?phone", "home.?phone", "\\bphno\\b",
    ],
    address: [
      "\\baddress\\b", "street.?address", "mailing.?address",
      "residential.?address", "current.?address", "permanent.?address",
      "\\bstreet\\b", "address.?line.?1",
    ],
    addressLine2: [
      "address.?line.?2", "\\bapartment\\b", "\\bsuite\\b", "\\bfloor\\b", "\\bunit\\b",
    ],
    // ⚠️ cityState MUST be checked before city and state individually
    cityState: [
      "city\\s*[&,/]\\s*state", "city\\s*and\\s*state",
      "city\\s*&\\s*state", "city\\s*/\\s*state",
    ],
    city: [
      "\\bcity\\b", "\\btown\\b", "\\bmunicipality\\b",
      "\\blocality\\b", "city.?name", "current.?city",
    ],
    state: [
      "\\bstate\\b", "\\bprovince\\b", "\\bregion\\b", "state.?name",
    ],
    country: [
      "\\bcountry\\b", "country.?name", "country.?of.?residence",
    ],
    pincode: [
      "\\bpincode\\b", "\\bzip\\b", "zip.?code", "postal.?code", "\\bpostcode\\b",
    ],
    dob: [
      "date.?of.?birth", "\\bdob\\b", "birth.?date", "\\bbirthday\\b", "born.?on",
    ],
    gender: [
      "\\bgender\\b", "\\bsex\\b", "gender.?identity",
    ],
    nationality: [
      "\\bnationality\\b", "\\bcitizenship\\b",
    ],
    college: [
      "\\bcollege\\b", "\\buniversity\\b", "\\binstitution\\b",
      "college.?name", "university.?name", "alma.?mater",
    ],
    degree: [
      "\\bdegree\\b", "\\bqualification\\b", "field.?of.?study",
      "course.?name", "academic.?degree",
    ],
    branch: [
      "\\bbranch\\b", "\\bspecialization\\b", "\\bstream\\b", "\\bdepartment\\b",
    ],
    graduationYear: [
      "graduation.?year", "passing.?year", "year.?of.?graduation", "\\bbatch\\b",
    ],
    cgpa: [
      "\\bcgpa\\b", "\\bgpa\\b", "\\bpercentage\\b", "aggregate.?marks",
    ],
    currentCompany: [
      "current.?company", "\\bcompany\\b", "\\borganization\\b",
      "\\bemployer\\b", "company.?name",
    ],
    jobTitle: [
      "job.?title", "\\bdesignation\\b", "current.?role", "\\bposition\\b",
    ],
    experience: [
      "years.?of.?experience", "work.?experience", "\\bexperience\\b", "\\byoe\\b",
    ],
    skills: [
      "\\bskills\\b", "technical.?skills", "key.?skills", "\\bexpertise\\b",
    ],
    languages: [
      "languages.?known", "\\blanguages\\b", "spoken.?languages",
    ],
    linkedin: ["\\blinkedin\\b", "linkedin.?url", "linkedin.?profile"],
    github:   ["\\bgithub\\b", "github.?url", "github.?profile"],
    website:  ["\\bwebsite\\b", "\\bportfolio\\b", "personal.?website", "portfolio.?url"],
    resume:   ["\\bresume\\b", "\\bcv\\b", "curriculum.?vitae", "upload.?resume"],
  };

  // ─── Core keyword matcher ──────────────────────────────────────────────────
  function matchesKeywords(str, keys) {
    if (!str) return false;
    return keys.some(k => new RegExp(k, "i").test(str));
  }

  // Classify a string against all field types.
  // cityState is checked before city/state; email checked before name.
  function classifyText(text) {
    if (!text || !text.trim()) return null;
    if (matchesKeywords(text, FIELD_KEYWORDS.email))     return "email";
    if (matchesKeywords(text, FIELD_KEYWORDS.cityState)) return "cityState";
    for (const [type, keys] of Object.entries(FIELD_KEYWORDS)) {
      if (type === "email" || type === "cityState") continue;
      if (matchesKeywords(text, keys)) return type;
    }
    return null;
  }

  // ─── Get the question label text for an element ────────────────────────────
  // The key insight: Google Forms puts the question text in a sibling/ancestor
  // div ABOVE the input. We need to find just the label portion, not grab the
  // entire section (which includes all option texts and blows past size limits).
  //
  // Strategy: walk UP the DOM looking for the *first* ancestor whose direct
  // text content (not including children's text) contains a keyword match,
  // OR whose first child text node contains one. This avoids the 200-char trap.
  function findQuestionLabel(el, maxLevels = 8) {
    let node = el.parentElement;
    for (let i = 0; i < maxLevels && node; i++) {
      // 1. Check only the direct text nodes of this element (not all descendants)
      //    This isolates "City & State" from "City & State\nYour answer"
      const directText = Array.from(node.childNodes)
        .filter(n => n.nodeType === Node.TEXT_NODE)
        .map(n => n.textContent.trim())
        .join(" ")
        .trim();
      if (directText.length > 0) {
        const m = classifyText(directText);
        if (m) return { type: m, text: directText };
      }

      // 2. Check the first element child if it looks like a label/heading
      //    (Google Forms uses a <div> or <span> as the question title)
      const firstChild = node.firstElementChild;
      if (firstChild) {
        const fc = (firstChild.innerText || firstChild.textContent || "").trim();
        // Only use it if it's short enough to be a label (not a whole section)
        if (fc.length > 0 && fc.length <= 120) {
          const m = classifyText(fc);
          if (m) return { type: m, text: fc };
        }
      }

      // 3. Also try aria-label / data attributes on the ancestor
      const ariaLabel = node.getAttribute("aria-label") || node.getAttribute("data-params") || "";
      if (ariaLabel) {
        const m = classifyText(ariaLabel);
        if (m) return { type: m, text: ariaLabel };
      }

      node = node.parentElement;
    }
    return null;
  }

  // ─── Classify a single input element ──────────────────────────────────────
  function classifyField(el) {
    // 1. Input type
    if (el.type === "email") return "email";
    if (el.type === "tel")   return "phone";
    if (el.type === "file")  return "resume";

    // 2. Own attributes (name, id, placeholder, aria-label, title)
    const ownText = [
      el.getAttribute("name")        || "",
      el.getAttribute("id")          || "",
      el.getAttribute("placeholder") || "",
      el.getAttribute("aria-label")  || "",
      el.getAttribute("title")       || "",
    ].join(" ");
    const ownMatch = classifyText(ownText);
    if (ownMatch) return ownMatch;

    // 3. <label for="id">
    if (el.id) {
      const lbl = document.querySelector(`label[for="${CSS.escape(el.id)}"]`);
      if (lbl) {
        const m = classifyText(lbl.innerText || lbl.textContent || "");
        if (m) return m;
      }
    }

    // 4. Immediately preceding sibling text
    const prev = el.previousElementSibling;
    if (prev) {
      const prevText = (prev.innerText || prev.textContent || "").trim();
      if (prevText.length <= 120) {
        const m = classifyText(prevText);
        if (m) return m;
      }
    }

    // 5. Walk ancestor DOM — using the smarter label finder
    const found = findQuestionLabel(el);
    if (found) return found.type;

    return null;
  }

  // ─── Text field detection ──────────────────────────────────────────────────
  function detectTextFields() {
    const inputs = document.querySelectorAll(
      "input:not([type='hidden']):not([type='submit']):not([type='button'])" +
      ":not([type='checkbox']):not([type='radio']):not([type='file'])," +
      "textarea,[contenteditable='true'],[role='textbox']"
    );
    const fields = [];
    inputs.forEach(el => {
      const type = classifyField(el);
      if (type) fields.push({ el, type, kind: "text" });
    });
    return fields;
  }

  // ─── Radio group detection ─────────────────────────────────────────────────
  function detectRadioGroups() {
    const allRadios = document.querySelectorAll("input[type='radio']");
    if (!allRadios.length) return [];

    // Group radios by their name attribute
    const groups = {};
    allRadios.forEach(r => {
      const key = r.name || "__unnamed__";
      if (!groups[key]) groups[key] = [];
      groups[key].push(r);
    });

    const result = [];
    Object.values(groups).forEach(radios => {
      // Find the group question label using the smarter finder
      const found = findQuestionLabel(radios[0], 8);
      if (!found) return;

      // Collect each radio's visible label text
      const options = radios.map(r => {
        let label = "";
        // Try <label for="id">
        if (r.id) {
          const lbl = document.querySelector(`label[for="${CSS.escape(r.id)}"]`);
          if (lbl) label = (lbl.innerText || lbl.textContent || "").trim();
        }
        // Try next text sibling
        if (!label) {
          let sib = r.nextSibling;
          while (sib) {
            const t = (sib.textContent || "").trim();
            if (t) { label = t; break; }
            sib = sib.nextSibling;
          }
        }
        // Try parent element text (excluding the radio itself)
        if (!label && r.parentElement) {
          label = (r.parentElement.innerText || r.parentElement.textContent || "")
            .replace(/\s+/g, " ").trim();
        }
        return { el: r, label };
      });

      result.push({ type: found.type, radios: options });
      console.log(`[AutoSlay] Radio group "${found.text}" → type: ${found.type}, options:`, options.map(o => o.label));
    });

    return result;
  }

  // ─── Select/dropdown detection ─────────────────────────────────────────────
  function detectSelectFields() {
    const selects = document.querySelectorAll("select");
    const result = [];
    selects.forEach(sel => {
      let type = classifyText([
        sel.getAttribute("name")        || "",
        sel.getAttribute("id")          || "",
        sel.getAttribute("aria-label")  || "",
      ].join(" "));

      if (!type && sel.id) {
        const lbl = document.querySelector(`label[for="${CSS.escape(sel.id)}"]`);
        if (lbl) type = classifyText(lbl.innerText || "");
      }
      if (!type) {
        const found = findQuestionLabel(sel);
        if (found) type = found.type;
      }
      if (type) result.push({ el: sel, type, kind: "select" });
    });
    return result;
  }

  // ─── Master detection ──────────────────────────────────────────────────────
  function detectFormFields() {
    const textFields   = detectTextFields();
    const radioGroups  = detectRadioGroups();
    const selectFields = detectSelectFields();

    // Positional fallback if nothing at all was found
    if (textFields.length === 0 && radioGroups.length === 0 && selectFields.length === 0) {
      const all = document.querySelectorAll(
        "input[type='text'],input[type='email'],input[type='tel'],input:not([type]),textarea"
      );
      all.forEach((el, idx) => {
        const hint = (el.placeholder + " " + el.name + " " + el.id).toLowerCase();
        if      (hint.includes("email") || el.type === "email")     textFields.push({ el, type: "email", kind: "text" });
        else if (hint.includes("name"))                              textFields.push({ el, type: "name",  kind: "text" });
        else if (hint.includes("phone") || hint.includes("mobile")) textFields.push({ el, type: "phone", kind: "text" });
        else if (idx === 0)                                          textFields.push({ el, type: "name",  kind: "text" });
        else if (idx === 1)                                          textFields.push({ el, type: "email", kind: "text" });
        else if (idx === 2)                                          textFields.push({ el, type: "phone", kind: "text" });
      });
    }

    const all = [
      ...textFields,
      ...selectFields,
      ...radioGroups.map(g => ({ type: g.type, kind: "radio", radios: g.radios })),
    ];

    console.log("[AutoSlay] Detected fields →", all.map(f => `${f.type}(${f.kind})`).join(", "));
    return all;
  }

  // ─── Fill helpers ──────────────────────────────────────────────────────────
  function fillTextField(el, value) {
    if (!value) return;
    try {
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value");
      if (setter) setter.set.call(el, value);
      else el.value = value;
    } catch (_) { el.value = value; }
    el.dispatchEvent(new Event("input",  { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  }

  function fillSelectField(el, value) {
    if (!value) return false;
    const val = String(value).toLowerCase().trim();
    for (const opt of el.options) {
      if (opt.value.toLowerCase() === val || opt.text.toLowerCase() === val) {
        el.value = opt.value;
        el.dispatchEvent(new Event("change", { bubbles: true }));
        return true;
      }
    }
    for (const opt of el.options) {
      if (opt.value.toLowerCase().includes(val) || opt.text.toLowerCase().includes(val)) {
        el.value = opt.value;
        el.dispatchEvent(new Event("change", { bubbles: true }));
        return true;
      }
    }
    return false;
  }

  function fillRadioGroup(radios, value) {
    if (!value) return false;
    const val = String(value).toLowerCase().trim();
    let best = null, bestScore = -1;
    radios.forEach(({ el, label }) => {
      const lbl = label.toLowerCase().trim();
      let score = -1;
      if (lbl === val)                                     score = 3;
      else if (lbl.startsWith(val) || val.startsWith(lbl)) score = 2;
      else if (lbl.includes(val)   || val.includes(lbl))   score = 1;
      if (score > bestScore) { best = el; bestScore = score; }
    });
    if (best && bestScore >= 1) {
      best.checked = true;
      best.dispatchEvent(new Event("change", { bubbles: true }));
      best.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      return true;
    }
    return false;
  }

  // ─── Selection Panel ───────────────────────────────────────────────────────
  function showSelectionPanel(user, detectedFields, onConfirm) {
    document.getElementById("__autoslay_select_panel")?.remove();
    document.getElementById("__autoslay_backdrop")?.remove();

    const detectedTypes = new Set(detectedFields.map(f => f.type));
    const cityStateValue = [user.city, user.state].filter(Boolean).join(", ");

    const PANEL_FIELDS = [
      { type: "name",          label: "Full Name",            value: user.name },
      { type: "firstName",     label: "First Name",           value: (user.name || "").split(" ")[0] },
      { type: "lastName",      label: "Last Name",            value: (user.name || "").split(" ").slice(1).join(" ") },
      { type: "middleName",    label: "Middle Name",          value: user.middle_name },
      { type: "email",         label: "Email",                value: (user.emails || [])[0], options: user.emails },
      { type: "phone",         label: "Phone",                value: (user.phone_numbers || [])[0], options: user.phone_numbers },
      { type: "address",       label: "Address",              value: user.address },
      { type: "addressLine2",  label: "Address Line 2",       value: user.address_line2 },
      { type: "cityState",     label: "City & State",         value: cityStateValue },
      { type: "city",          label: "City",                 value: user.city },
      { type: "state",         label: "State / Province",     value: user.state },
      { type: "country",       label: "Country",              value: user.country },
      { type: "pincode",       label: "Pincode / ZIP",        value: user.pincode },
      { type: "dob",           label: "Date of Birth",        value: user.date_of_birth },
      { type: "gender",        label: "Gender",               value: user.gender },
      { type: "nationality",   label: "Nationality",          value: user.nationality },
      { type: "college",       label: "College / University", value: user.college },
      { type: "degree",        label: "Degree",               value: user.degree },
      { type: "branch",        label: "Branch / Major",       value: user.branch },
      { type: "graduationYear",label: "Graduation Year",      value: user.graduation_year },
      { type: "cgpa",          label: "CGPA / Percentage",    value: user.cgpa },
      { type: "currentCompany",label: "Current Company",      value: user.current_company },
      { type: "jobTitle",      label: "Job Title",            value: user.job_title },
      { type: "experience",    label: "Years of Experience",  value: user.years_of_experience },
      { type: "skills",        label: "Skills",               value: Array.isArray(user.skills) ? user.skills.join(", ") : user.skills },
      { type: "languages",     label: "Languages",            value: Array.isArray(user.languages) ? user.languages.join(", ") : user.languages },
      { type: "linkedin",      label: "LinkedIn",             value: user.linkedin },
      { type: "github",        label: "GitHub",               value: user.github },
      { type: "website",       label: "Website / Portfolio",  value: user.website },
    ];

    const fillableFields = PANEL_FIELDS.filter(f =>
      f.value && String(f.value).trim().length > 0 && detectedTypes.has(f.type)
    );

    const panel = document.createElement("div");
    panel.id = "__autoslay_select_panel";
    panel.style.cssText = `
      position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);
      z-index:2147483647;width:400px;max-height:82vh;overflow-y:auto;
      background:#0f0e17;border:1px solid rgba(255,255,255,0.15);
      border-radius:16px;padding:24px;
      font-family:'Segoe UI',sans-serif;color:#fff;
      box-shadow:0 20px 60px rgba(0,0,0,0.6);
    `;

    if (fillableFields.length === 0) {
      panel.innerHTML = `
        <div style="font-size:18px;font-weight:700;text-align:center;margin-bottom:8px;">⚡ No Matches</div>
        <div style="font-size:13px;color:rgba(255,255,255,0.5);text-align:center;margin-bottom:20px;">
          No fields on this page match your saved profile.<br>Try completing more fields in your dashboard.
        </div>
        <button id="__autoslay_cancel" style="width:100%;padding:12px;background:rgba(255,255,255,0.1);
          border:none;border-radius:10px;color:#fff;font-size:14px;cursor:pointer;">Close</button>`;
    } else {
      const rows = fillableFields.map((f, i) => {
        const id = `__asf_${i}`;
        const multi = f.options && f.options.length > 1;
        const valueHtml = multi
          ? `<select id="${id}_sel" style="flex:1;min-width:0;padding:7px 10px;background:#1a1929;
               border:1px solid rgba(255,255,255,0.15);border-radius:6px;color:#fff;font-size:12px;">
               ${f.options.map(o => `<option value="${o}">${o}</option>`).join("")}
             </select>`
          : `<span style="flex:1;font-size:12px;color:rgba(255,255,255,0.75);
               overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${String(f.value)}</span>`;
        return `
          <div class="__as_row" data-idx="${i}" data-type="${f.type}"
            style="display:flex;align-items:center;gap:10px;padding:9px 10px;
            background:rgba(255,255,255,0.05);border-radius:8px;margin-bottom:7px;">
            <input type="checkbox" id="${id}_chk" checked
              style="width:16px;height:16px;accent-color:#7c5cfc;cursor:pointer;flex-shrink:0;">
            <label for="${id}_chk"
              style="font-size:11px;color:rgba(255,255,255,0.5);text-transform:uppercase;
              letter-spacing:.06em;min-width:110px;cursor:pointer;flex-shrink:0;">${f.label}</label>
            ${valueHtml}
          </div>`;
      }).join("");

      panel.innerHTML = `
        <div style="font-size:17px;font-weight:700;text-align:center;margin-bottom:6px;">⚡ Confirm Fields to Fill</div>
        <div style="font-size:12px;color:rgba(255,255,255,0.45);text-align:center;margin-bottom:18px;">
          Uncheck anything you'd like to skip
        </div>
        <div style="margin-bottom:18px;">${rows}</div>
        <div style="display:flex;gap:10px;">
          <button id="__autoslay_cancel"
            style="flex:1;padding:11px;background:rgba(255,255,255,0.09);border:none;
            border-radius:10px;color:#fff;font-size:14px;cursor:pointer;">Cancel</button>
          <button id="__autoslay_fill"
            style="flex:1;padding:11px;background:linear-gradient(135deg,#7c5cfc,#f472b6);
            border:none;border-radius:10px;color:#fff;font-size:14px;font-weight:700;cursor:pointer;">
            Fill Form ⚡</button>
        </div>`;
    }

    const backdrop = document.createElement("div");
    backdrop.id = "__autoslay_backdrop";
    backdrop.style.cssText = `position:fixed;inset:0;background:rgba(0,0,0,0.55);z-index:2147483646;`;
    backdrop.onclick = () => { panel.remove(); backdrop.remove(); };
    document.body.appendChild(backdrop);
    document.body.appendChild(panel);

    panel.querySelector("#__autoslay_cancel").onclick = () => { panel.remove(); backdrop.remove(); };
    const fillBtn = panel.querySelector("#__autoslay_fill");
    if (fillBtn) {
      fillBtn.onclick = () => {
        const selected = {};
        panel.querySelectorAll(".__as_row").forEach(row => {
          const idx  = row.dataset.idx;
          const type = row.dataset.type;
          const chk  = panel.querySelector(`#__asf_${idx}_chk`);
          if (!chk?.checked) return;
          const sel = panel.querySelector(`#__asf_${idx}_sel`);
          selected[type] = sel ? sel.value : fillableFields[+idx].value;
        });
        panel.remove();
        backdrop.remove();
        onConfirm(selected);
      };
    }
  }

  // ─── Fill form ─────────────────────────────────────────────────────────────
  function fillFormWithUserData(user, selectedFields) {
    const fillData = { ...selectedFields };

    if (fillData.name) {
      const parts = String(fillData.name).trim().split(/\s+/);
      if (!fillData.firstName) fillData.firstName = parts[0];
      if (!fillData.lastName)  fillData.lastName  = parts.slice(1).join(" ");
    }
    if (!fillData.cityState && (fillData.city || fillData.state)) {
      fillData.cityState = [fillData.city, fillData.state].filter(Boolean).join(", ");
    }
    if (Array.isArray(fillData.skills))    fillData.skills    = fillData.skills.join(", ");
    if (Array.isArray(fillData.languages)) fillData.languages = fillData.languages.join(", ");

    const fields = detectFormFields();
    let filled = 0;
    const usedTypes = new Set();

    fields.forEach(field => {
      const { type, kind } = field;
      if (!fillData[type] || usedTypes.has(type)) return;
      const value = String(fillData[type]);

      if (kind === "radio") {
        if (fillRadioGroup(field.radios, value)) { filled++; usedTypes.add(type); }
      } else if (kind === "select") {
        if (fillSelectField(field.el, value))    { filled++; usedTypes.add(type); }
      } else {
        fillTextField(field.el, value);
        filled++;
        usedTypes.add(type);
      }
    });

    showToast(`✅ Filled ${filled} field${filled !== 1 ? "s" : ""}!`);
    return filled;
  }

  // ─── Toast ─────────────────────────────────────────────────────────────────
  function showToast(message) {
    document.getElementById("__autoslay_toast")?.remove();
    const t = document.createElement("div");
    t.id = "__autoslay_toast";
    t.style.cssText = `
      position:fixed;bottom:22px;right:22px;z-index:2147483647;
      padding:11px 20px;background:#0f0e17;
      border:1px solid rgba(255,255,255,0.15);border-radius:12px;
      color:#fff;font-family:'Segoe UI',sans-serif;font-size:13px;
      box-shadow:0 8px 30px rgba(0,0,0,0.4);
    `;
    t.textContent = message;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 3000);
  }

  // ─── Message listener ──────────────────────────────────────────────────────
  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.type === "FILL_FORM") {
      const detectedFields = detectFormFields();
      showSelectionPanel(message.user, detectedFields, (selected) => {
        fillFormWithUserData(message.user, selected);
      });
      sendResponse({ success: true });
      return true;
    }
  });

  console.log("[AutoSlay] Content script ready.");
})();
