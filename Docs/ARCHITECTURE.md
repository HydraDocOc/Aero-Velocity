# AeroVelocity - Architecture Overview

## 🏗️ Project Structure Explained

### How Everything Connects

```
┌─────────────────────────────────────────────────────────┐
│                    index.html                            │
│              (Entry HTML file)                          │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│                    main.jsx                              │
│              (React entry point)                        │
│         Renders: <App />                                │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│                    App.jsx                               │
│         - Sets up React Router                          │
│         - Renders Navbar                                │
│         - Handles all route definitions                 │
└──────────────────┬──────────────────────────────────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
        ▼                     ▼
┌──────────────────┐   ┌───────────────────────┐
│   Navbar.jsx     │   │   Route Components    │
│  (Navigation)    │   │   (Page components)   │
└──────────────────┘   └───────────────────────┘
```

## 📦 Folder Structure Breakdown

### 1. **src/components/** - Reusable Components

#### `Navbar.jsx` + `Navbar.css`
- **Purpose:** Fixed navigation bar at the top
- **Features:**
  - Glassmorphism effect (semi-transparent with blur)
  - Active route highlighting
  - Hover effects with neon accents
  - Responsive design
- **Uses:** React Router's `useLocation` for active link styling

#### `GlowingButton.jsx` + `GlowingButton.css`
- **Purpose:** Neon glowing button component
- **Variants:** red, blue, gold
- **Features:**
  - Gradient border animation on hover
  - Glowing shadow effect
  - Lift animation on hover
- **Props:** `variant`, `onClick`, `children`, `type`

#### `AnimatedCard.jsx` + `AnimatedCard.css`
- **Purpose:** Glass morphism card for content display
- **Features:**
  - Gradient glow effect
  - Mouse-hover interaction
  - Smooth animations
- **Props:** `title`, `description`, `icon`, `gradient`

### 2. **src/pages/** - Route Pages

#### `Home.jsx` + `Home.css`
- **Route:** `/`
- **Sections:**
  1. **Hero Section** - Large animated section with:
     - Gradient orbs background
     - Animated racing track visual
     - Call-to-action buttons
  2. **Features Grid** - 3 feature cards
  3. **Stats Section** - Project statistics
  4. **CTA Section** - Call-to-action

#### Other Pages
- `Dashboard.jsx` - Analytics dashboard (coming soon)
- `Predict.jsx` - Prediction interface (coming soon)
- `Simulate.jsx` - Simulation controls (coming soon)
- `Chat.jsx` - AI chat interface (coming soon)
- `Team.jsx` - Team member display
- `Contact.jsx` - Contact form

### 3. **src/utils/** - Utilities

#### `constants.js`
- **Purpose:** Centralized constants
- **Exports:**
  - `APP_NAME`, `APP_DESCRIPTION`
  - `ROUTES` - Route paths
  - `COLORS` - Theme colors
  - `TEAM_INFO` - Team metadata

### 4. **Styling Architecture**

#### `index.css` - Global Theme
- **CSS Variables:** Theme definitions
- **Animations:** Reusable keyframes
- **Utility Classes:** Common patterns
- **Base Styles:** Typography, resets, scrollbar

#### Component-Specific CSS
- Each component has its own CSS file
- Uses CSS variables from `index.css`
- Modular and maintainable

## 🔄 Data Flow

### Routing Flow
```
User clicks Navbar link
         ↓
    URL changes
         ↓
React Router matches route
         ↓
    Renders Page component
         ↓
    Page uses components
```

### Component Communication
```
App.jsx
├── Navbar (receives route info via useLocation)
├── Routes (matches paths to components)
└── Page Components (display content)
```

## 🎨 Design System Flow

```
CSS Variables (index.css)
         ↓
   ↓           ↓           ↓
Navbar    Button      Card
 CSS       CSS         CSS
   ↓           ↓           ↓
       Apply to Components
```

## 🚀 How to Add New Features

### 1. Add a New Page
```javascript
// 1. Create file: src/pages/NewPage.jsx
// 2. Add route in App.jsx:
<Route path="/newpage" element={<NewPage />} />
// 3. Add link in Navbar.jsx
```

### 2. Add a New Component
```javascript
// 1. Create: src/components/NewComponent.jsx
// 2. Create: src/components/NewComponent.css
// 3. Import and use in pages
```

### 3. Add ML Integration (Future)
```javascript
// 1. Create: src/api/mlService.js
// 2. Create: src/utils/fileUpload.js
// 3. Integrate in Predict.jsx or Simulate.jsx
```

## 📊 Integration Points for ML/Firebase

### Firebase Integration
1. Install Firebase SDK
2. Create `src/config/firebase.js`
3. Create `src/services/auth.js` for authentication
4. Create `src/services/database.js` for Firestore

### ML Model Integration
1. Create backend API endpoint
2. Create `src/api/mlService.js` to call API
3. Update `Predict.jsx` to use ML service
4. Add file upload handling

### Analytics Integration
1. Create `src/services/analytics.js`
2. Update `Dashboard.jsx` to fetch and display data
3. Use Recharts for visualizations

## 🎯 Current Features

✅ **Working Now:**
- Navigation between pages
- Responsive design
- Futuristic UI with animations
- Glass morphism effects
- Neon gradients
- Sample interactive components

🚧 **Coming Next:**
- Firebase authentication
- File upload functionality
- ML model predictions
- Real-time dashboards
- AI chat interface
- Data analytics

## 📝 Key Decisions

1. **No Tailwind:** Using pure CSS for more control
2. **CSS Variables:** Centralized theme management
3. **Component-Based:** Reusable and modular
4. **React Router v7:** Latest routing features
5. **Responsive First:** Mobile-friendly design

## 🔍 File Dependencies

```
index.css ← (imported by all components)
    ↓
App.jsx ← (imports components + pages)
    ↓
├── Navbar.jsx
├── Home.jsx (uses: GlowingButton, AnimatedCard)
├── Dashboard.jsx
├── Predict.jsx
├── Simulate.jsx
├── Chat.jsx
├── Team.jsx
└── Contact.jsx (uses: GlowingButton)
```

## 🎨 CSS Architecture

```
Global Styles (index.css)
├── CSS Variables (theme)
├── Animations (keyframes)
├── Utility Classes
└── Base Styles

Component Styles (*.css)
├── Import variables
├── Component-specific rules
└── Media queries
```

---

**All files created and ready for development! 🚀**

