# Chrome Web Store Deployment Guide

## Step 1: Prepare Extension for Publishing

### 1.1 Update URLs to Production

Edit `frontend/extension/popup.js`:
```javascript
// Change from localhost to production
const DASHBOARD_URL = "https://your-frontend.vercel.app/dashboard";
const API_BASE = "https://your-backend.onrender.com";
```

### 1.2 Create Icons

Create icon files in `frontend/extension/icons/`:
- `icon16.png` - 16x16px (toolbar icon)
- `icon32.png` - 32x32px
- `icon48.png` - 48x48px (Chrome Web Store)
- `icon128.png` - 128x128px (Chrome Web Store)

Use a tool like https://favicon.io or design your own.

### 1.3 Update Manifest

Ensure `manifest.json` has:
```json
{
  "manifest_version": 3,
  "name": "AutoSlay - Form Autofill",
  "description": "Automatically fill job application and contact forms with your saved profile data",
  "version": "1.0.0",
  "icons": {
    "16": "icons/icon16.png",
    "32": "icons/icon32.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  },
  "action": {
    "default_popup": "popup.html",
    "default_icon": {
      "16": "icons/icon16.png",
      "32": "icons/icon32.png"
    }
  },
  "permissions": [
    "activeTab",
    "storage"
  ],
  "host_permissions": [
    "http://localhost:5173/*",
    "https://*.vercel.app/*"
  ],
  "background": {
    "service_worker": "background.js"
  },
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["content.js"],
      "run_at": "document_idle"
    }
  ]
}
```

### 1.4 Zip Extension Files

Navigate to extension folder and create zip:
```bash
cd frontend/extension
zip -r ../../autoslay-extension.zip . -x "*.DS_Store"
```

Or on Windows:
```powershell
Compress-Archive -Path "frontend/extension\*" -DestinationPath "autoslay-extension.zip"
```

---

## Step 2: Create Chrome Web Store Developer Account

1. Go to https://chrome.google.com/webstore/devconsole
2. Sign in with Google account
3. Pay **$5 one-time registration fee** (required)
4. Fill out developer profile

---

## Step 3: Upload Extension

### 3.1 Create New Item

1. In Developer Dashboard, click **"New Item"**
2. Accept terms and conditions
3. Click **"Choose file"** and select your `autoslay-extension.zip`

### 3.2 Fill Store Listing

**Required fields:**

- **Description**: Detailed explanation of what your extension does
  ```
  AutoSlay automatically fills job application and contact forms with your saved profile data. 
  
  Features:
  - One-click form filling
  - Store multiple emails and phone numbers
  - Secure data storage
  - Works on any website
  ```

- **Category**: Select "Productivity" or "Developer Tools"

- **Language**: English (or your preferred language)

- **Screenshots** (required, at least 1):
  - 1280x800 or 640x400
  - Show extension popup and form filling in action
  - Save as PNG or JPEG

- **Icon** (will use your 128x128 icon)

**Optional but recommended:**
- **Promotional images**: 
  - Small: 440x280
  - Large: 920x680
  - Marquee: 1400x560
- **Video**: YouTube link demoing the extension

---

## Step 4: Privacy & Permissions

### 4.1 Privacy Policy URL

Add your privacy policy. If you don't have one, create a simple page at:
```
https://your-frontend.vercel.app/privacy
```

Or use a generator like https://app-privacy-policy-generator.firebaseapp.com

### 4.2 Single Purpose Description

Explain what the extension does in one sentence:
```
This extension automatically fills forms on websites using user-provided profile data.
```

### 4.3 Permission Justification

For each permission, explain why it's needed:

| Permission | Justification |
|------------|---------------|
| `activeTab` | To detect and fill form fields on the current page |
| `storage` | To store user profile data locally in the browser |

---

## Step 5: Submit for Review

1. Click **"Submit for review"** button
2. Review usually takes **1-3 business days**
3. You'll receive email notification when approved or if changes are needed

---

## Common Rejection Reasons & Fixes

### "Code readability" or "minified code"
Remove any minified code. Chrome Web Store requires readable source code.

### "Missing privacy policy"
Add a privacy policy URL that explains what data you collect and how you use it.

### "Broad host permissions"
If rejected for `<all_urls>`, explain that the extension needs to work on any form on any website.

### "Remote code"
Do not load external scripts. All code must be bundled in the extension.

---

## Step 6: After Approval

### 6.1 Get Extension ID
Once approved, your extension will have a unique ID like:
```
abcdefghijklmnopabcdefghijklmnop
```

### 6.2 Update Allowed Origins (if needed)

In your backend CORS settings, add the extension origin:
```javascript
// backend/server.js
app.use(cors({ 
  origin: [
    'http://localhost:5173', 
    'https://your-frontend.vercel.app',
    'chrome-extension://abcdefghijklmnopabcdefghijklmnop'
  ] 
}));
```

### 6.3 Promote Your Extension

Share your listing URL:
```
https://chrome.google.com/webstore/detail/autoslay/YOUR_EXTENSION_ID
```

---

## Quick Checklist

- [ ] URLs updated to production
- [ ] Icons created (16, 32, 48, 128)
- [ ] Extension zipped
- [ ] $5 developer fee paid
- [ ] Store listing filled out
- [ ] Screenshots uploaded
- [ ] Privacy policy added
- [ ] Permissions justified
- [ ] Submitted for review

---

## Updating Extension

To release updates:
1. Update version in `manifest.json` (e.g., "1.0.1")
2. Make changes and zip again
3. Go to Developer Dashboard → Your Item → "Package" tab
4. Upload new zip
5. Submit for review
