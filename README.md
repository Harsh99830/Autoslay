# AutoSlay

**Stop filling out the same forms over and over again.**

AutoSlay is a browser extension + web app that remembers your personal info — name, email, phone, address, education, work experience — and automatically fills it into any online form with one click.

---

## What It Does

Every time you apply for a job, register on a new platform, or fill out any kind of form online, you type the same stuff: your name, your email, your college, your skills... AutoSlay stores all of that once, and then fills it in for you automatically using its Chrome extension.

---

## How It Works

There are two parts:

### 1. The Web App (autoslay.online)
This is where you log in and manage your profile. You fill in your details once — things like:

- Your name, email, phone numbers
- Your address (street, city, state, country, pincode)
- Your education (college, degree, branch, graduation year, CGPA)
- Your work info (company, job title, years of experience, skills, languages)
- Your online profiles (LinkedIn, GitHub, portfolio website)

Everything you save here is **end-to-end encrypted** — meaning even the database doesn't store your data in plain text.

### 2. The Chrome Extension
Once your profile is saved, install the AutoSlay Chrome extension. When you're on a website with a form, the extension reads your saved profile and fills in the matching fields automatically.

You can find the extension here:
👉 [AutoSlay on Chrome Web Store](https://chromewebstore.google.com/detail/autoslay-%E2%80%93-fill-any-form/lafjiaflpnifhglhjcolidljogmbigco)

---

## Pages in the App

| Page | What it does |
|------|--------------|
| **Login / Signup** | Create an account or sign in (Google OAuth supported) |
| **Dashboard** | Your main profile page — fill in and edit all your details |
| **Settings** | View your account info, or delete your stored data |
| **Contact** | Reach out to the team |
| **Legal** | Privacy policy |

---

## Your Data & Privacy

- All profile fields are **encrypted before being saved** to the database.
- You can **delete all your profile data** anytime from the Settings page. Your account stays active — you just lose the saved info.
- Deleting your data requires you to type `delete my data` to confirm — just to make sure it's intentional.

---

## Tech Stack (for developers)

| Part | Technology |
|------|-----------|
| Frontend | React + Vite |
| Backend | Node.js + Express |
| Database & Auth | Supabase |
| Hosting | Vercel |
| Extension | Chrome Extension (in `/frontend/extension`) |

---

## Project Structure

```
autoslay/
├── frontend/        # React web app
│   └── src/
│       ├── pages/       # Login, Dashboard, Settings, etc.
│       ├── components/  # Navbar, Toast, TagInput
│       └── context/     # Auth context (user session)
├── backend/         # Express API server
│   ├── server.js    # All API routes
│   └── crypto.js    # Encryption/decryption logic
└── Dockerfile       # For containerized deployment
```

---

## Key Features at a Glance

- ✅ One-time profile setup, infinite form fills
- ✅ Multiple emails and phone numbers supported
- ✅ Tag-based input for skills and languages
- ✅ Resume upload support
- ✅ Searchable profile fields (just type in the search bar on the dashboard)
- ✅ End-to-end encrypted storage
- ✅ Google sign-in support