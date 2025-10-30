# AeroVelocity Backend API

Backend server for the AeroVelocity AI Chat Engineer, providing OpenAI integration for Formula 1 aerodynamics insights.

## 🚀 Quick Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Setup
- Copy `.env.example` to `.env`
- Add your OpenAI API key to `.env`:
  ```
  OPENAI_API_KEY=your_actual_api_key_here
  ```

### 3. Start Server
```bash
npm run dev
```

The API will run on `http://localhost:5000`

## 📡 API Endpoints

- `POST /chat` - Send message to AI
- `GET /health` - Health check

## 🔧 Configuration

- **Model**: GPT-4o-mini
- **Max Tokens**: 300
- **Temperature**: 0.7
- **CORS**: Enabled for localhost:3000 (React app)

## 🎯 Integration

The frontend React app connects to this backend via:
```javascript
fetch('http://localhost:5000/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message: 'your message' })
})
```

## 🚨 Error Handling

- API key validation
- Quota exceeded handling
- Network error fallbacks
- Input validation

---

**Ready to serve F1 AI insights! 🏎️**
