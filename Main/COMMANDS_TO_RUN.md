# Commands to Run

## 📦 Required Commands

You need to run these commands to complete the Firebase integration:

### 1. Install Firebase Package

```bash
npm install
```

This will install the `firebase` package (version 11.1.0) that was added to `package.json`.

---

## 🚀 Running the Application

### Development (Mock Mode - Works Now)

```bash
npm run dev
```

- App works without Firebase configured
- Shows warning: "Firebase not configured"
- All features work with mock data
- No persistence

### Development (With Real Firebase)

1. Configure Firebase (see `FIREBASE_SETUP.md`)
2. Add credentials to `.env` file
3. Then run:

```bash
npm run dev
```

- Real authentication
- Real file storage
- Real database

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

---

## 📝 Setup Steps Summary

1. **Run:** `npm install` (to install Firebase)
2. **Create:** Firebase project (optional, for full features)
3. **Create:** `.env` file (copy from `.env.example`)
4. **Add:** Firebase credentials to `.env`
5. **Run:** `npm run dev`

---

## ⚠️ Important

- **First command:** `npm install` - Install Firebase package
- **Without Firebase:** App works in mock mode (see warnings)
- **With Firebase:** Configure `.env` first, then run `npm run dev`

---

## 🎯 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start development server (works now without Firebase)
npm run dev

# 3. Open browser to http://localhost:5173
```

**That's it!** The app is ready to use.

To enable full Firebase features later, just configure `.env` as described in `FIREBASE_SETUP.md`.

