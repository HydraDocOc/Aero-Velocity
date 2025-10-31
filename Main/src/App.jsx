import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Auth from './pages/Auth/Auth';
import Predict from './pages/Predict';
import Simulate from './pages/Simulate';
import Chat from './pages/Chat';
import Compare from './pages/Compare';
import CornerPerformance from './pages/CornerPerformance';
import Contact from './pages/Contact';
import Quiz from './pages/Quiz';
import Regulations2026 from './pages/Regulations2026';
import './App.css';

function App() {
  console.log('🚀 App component rendering...');
  
  return (
    <Router>
      <div className="app">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/predict" element={<Predict />} />
            <Route path="/simulate" element={<Simulate />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/compare" element={<Compare />} />
            <Route path="/corner-performance" element={<CornerPerformance />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/quiz" element={<Quiz />} />
            <Route path="/regulations-2026" element={<Regulations2026 />} />
            <Route path="/auth" element={<Auth />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
