# AutoSlay Chrome Extension

## How to Load in Chrome

1. Open Chrome and go to `chrome://extensions`
2. Enable **Developer mode** (top-right toggle)
3. Click **"Load unpacked"**
4. Select the `frontend/extension/` folder
5. The AutoSlay extension will appear in your toolbar

## How It Works

1. Start the backend: `cd backend && npm install && npm run dev`
2. Start the React dashboard: `cd frontend && npm install && npm run dev`
3. Open `http://localhost:5173` and sign up / log in (Google OAuth supported)
4. Fill in your profile (emails, phone, name, resumes)
5. Visit any website with a form
6. The **⚡ AutoSlay** button appears bottom-right
7. Click it → pick your info → click **Fill Form**

## Extension Files

| File | Role |
|------|------|
| `manifest.json` | Extension config (Manifest V3) |
| `background.js` | Service worker — stores user data in `chrome.storage` |
| `content.js` | Injected into pages — detects forms, shows overlay, autofills |
| `popup.html/js` | Toolbar popup UI |

## Authentication Flow

- The extension gets auth token from the React app via `chrome.runtime.sendMessage`
- Token is stored in `chrome.storage.local` and used for API calls
- When user logs out from dashboard, extension is notified and clears stored data

## Configuration

- `popup.js`: Update `DASHBOARD_URL` for production
- Extension works with Supabase JWT tokens automatically
