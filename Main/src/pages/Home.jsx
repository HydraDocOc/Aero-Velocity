import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import GlowingButton from '../components/GlowingButton';
import './Home.css';

const Home = () => {
  console.log('🏠 Home component rendering...');
  
  // Scroll-driven horizontal motion that is scoped to the hero only
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  // Move right as user scrolls through the hero, then return as hero ends
  const carX = useTransform(scrollYProgress, [0, 0.5, 1], [0, 200, 0]);
  // Subtle bottom blur overlay opacity mapping
  const blurOpacity = useTransform(scrollYProgress, [0, 0.25, 0.5, 1], [0, 0.2, 0.32, 0.45]);

  return (
    <div className="home-new">
      {/* Animated Background */}
      <div className="hero-background-new">
        <div className="speed-lines"></div>
        <div className="grid-overlay"></div>
        <div className="gradient-orb orb-red"></div>
        <div className="gradient-orb orb-blue"></div>
        <div className="bg-streaks"></div>
        
        {/* Unique Background Elements */}
        <div className="racing-elements">
          <div className="race-track-line line-1"></div>
          <div className="race-track-line line-2"></div>
          <div className="race-track-line line-3"></div>
        </div>
        
        <div className="aerodynamics-flow">
          <svg className="flow-svg" viewBox="0 0 1200 800" preserveAspectRatio="none">
            <defs>
              <linearGradient id="flowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style={{ stopColor: "rgba(0, 100, 200, 0)", stopOpacity: 0 }} />
                <stop offset="50%" style={{ stopColor: "rgba(0, 150, 255, 0.5)", stopOpacity: 0.5 }} />
                <stop offset="100%" style={{ stopColor: "rgba(0, 100, 200, 0)", stopOpacity: 0 }} />
              </linearGradient>
            </defs>
            <path 
              d="M 100 400 Q 300 200, 500 400 T 900 400 T 1300 400" 
              stroke="url(#flowGradient)" 
              strokeWidth="2" 
              fill="none"
              className="aerodynamic-curve"
            />
          </svg>
        </div>
        
        <div className="particle-effects">
          <div className="particle particle-1"></div>
          <div className="particle particle-2"></div>
          <div className="particle particle-3"></div>
          <div className="particle particle-4"></div>
        </div>

        {/* Subtle bottom-area scroll blur overlay */}
        <motion.div
          aria-hidden
          className="scroll-blur-overlay"
          style={{ opacity: blurOpacity }}
        />
      </div>

      {/* Main Hero Content */}
      <section ref={heroRef} className="hero-section-new">
        <div className="hero-container container">
          {/* Left Side - Text Content */}
          <div className="hero-text-new">
            <h1 className="hero-title-new">
              <span className="aero-base">AERO</span>
              <span className="velocity-accent">VELOCITY</span>
              <span className="headline-accent" />
            </h1>
            <p className="hero-subtitle-new">
              Where AI Meets Speed
            </p>
            <p className="hero-description-new">
              Visualizing aerodynamic flow, precision, and velocity in motion.
            </p>
            
            <div className="hero-cta-new">
              <Link to="/dashboard">
                <GlowingButton variant="red">
                  Explore Aerodynamics
                </GlowingButton>
              </Link>
            </div>
          </div>

          {/* Right Side - Car Image */}
          <div className="hero-visual-new">
            <div className="car-container overlap-car">
              <motion.div 
                className="car-rotation-wrapper"
                style={{ x: carX }}
              >
                <motion.img 
                  src="/RBR25.webp" 
                  alt="AeroVelocity F1 Car" 
                  className="hero-car" 
                  loading="lazy"
                  initial={{ x: 200, opacity: 0, filter: 'blur(6px)', scale: 0.98 }}
                  animate={{ x: 0, opacity: 1, filter: 'blur(0px)', scale: 1 }}
                  transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
                />
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Tires section (2x2 grid with 4 cards) */}
      <section className="tires-cards-section" style={{ ['--tires-bg']: "url('/car.png')" }}>
        <div className="container">
          <div className="tire-cards-grid">
            {[
              { title: 'Downforce Optimization', desc: 'Maximize downforce for superior grip and cornering performance.', ring: 'ring-red', img: '/tire-1.png' },
              { title: 'Drag Reduction', desc: 'Minimize air resistance for maximum straight-line speed.', ring: 'ring-yellow', img: '/tire-2.png' },
              { title: 'AI-driven Precision', desc: 'Harness artificial intelligence for predictive aerodynamic analysis.', ring: 'ring-blue', img: '/tire-3.png' },
              { title: 'Next Gen Prediction (2026)', desc: 'Future-ready predictions for next-generation F1 regulations.', ring: 'ring-purple', img: '/tire-1.png' },
            ].map((f) => (
              <div key={f.title} className="tire-card glass">
                <div className={`wheel-badge card ${f.ring}`}>
                  <img src={f.img} alt={f.title} className="wheel-img card" />
                </div>
                <h3 className="tire-title">{f.title}</h3>
                <p className="tire-desc">{f.desc}</p>
                <a href="#features" className="tire-cta">Explore Feature</a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services/Features - Only AI Aerodynamics expanded */}
      <section id="features" className="features-section">
        <div className="container features-wrap">
          <div className="services-intro">
            <h3 className="section-kf">AI Aerodynamics</h3>
          </div>

          <div className="ai-aero-expanded">
            <div className="ai-aero-header">
              <div className="service-icon-large">&lt;/&gt;</div>
              <h2 className="ai-aero-title">AI Aerodynamics</h2>
              <p className="ai-aero-subtitle">Neural Network-Powered Performance Optimization</p>
            </div>
            
            <div className="ai-aero-content">
              <div className="ai-aero-description">
                <h3>Deep Learning Meets Advanced Physics</h3>
                <p>Our revolutionary AI aerodynamics system combines cutting-edge deep neural networks with real-world physics formulas to predict drag, downforce, and aerodynamic balance with unprecedented precision. By leveraging advanced machine learning models alongside fundamental fluid dynamics equations, we achieve accuracy that surpasses traditional methods.</p>
                
                <h3>Core Technologies</h3>
                <ul>
                  <li><strong>Deep Neural Networks:</strong> Multi-layer architectures trained on millions of real telemetry data points</li>
                  <li><strong>Physics-Based Modeling:</strong> Navier-Stokes equations, Bernoulli's principle, and boundary layer theory</li>
                  <li><strong>FastF1 Integration:</strong> Real-time telemetry analysis from actual F1 sessions and races</li>
                  <li><strong>Hybrid AI-Physics:</strong> ML predictions validated by computational physics for maximum accuracy</li>
                  <li><strong>Adaptive Learning:</strong> Continuous model refinement based on live track data</li>
                </ul>

                <h3>How It Works</h3>
                <p>Our system combines deep learning models with advanced physics formulas including drag coefficient calculations, lift-to-drag ratio optimization, and ground effect dynamics. The AI analyzes pressure distributions, velocity fields, and vortex formations using real physics equations, while machine learning identifies patterns impossible for traditional analysis to detect. This hybrid approach delivers insights in milliseconds.</p>

                <h3>Proven Performance</h3>
                <p>By merging deep AI-ML with rigorous physics modeling, our platform achieves 99.7% prediction accuracy. Teams leveraging our technology report up to 2.5% lap time improvements through optimized aerodynamic setups. What traditional methods take hours to compute, our AI-physics hybrid delivers in under 2 milliseconds—enabling real-time race strategy adjustments.</p>
              </div>
              
              <div className="ai-aero-visual">
                <div className="neural-network-diagram">
                  <div className="network-layer">
                    <div className="neuron"></div>
                    <div className="neuron"></div>
                    <div className="neuron"></div>
                  </div>
                  <div className="network-layer">
                    <div className="neuron"></div>
                    <div className="neuron"></div>
                    <div className="neuron"></div>
                    <div className="neuron"></div>
                  </div>
                  <div className="network-layer">
                    <div className="neuron"></div>
                    <div className="neuron"></div>
                    <div className="neuron"></div>
                  </div>
                </div>

                <div className="ai-stats">
                  <div className="stat-item">
                    <span className="stat-value">2ms</span>
                    <span className="stat-label">Prediction Time</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value">99.7%</span>
                    <span className="stat-label">Accuracy</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value">1M+</span>
                    <span className="stat-label">Training Simulations</span>
                  </div>
            </div>
            </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer - Enhanced Modern Design */}
      <motion.footer
        id="footer"
        className="site-footer"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        viewport={{ once: true, amount: 0.3 }}
      >
        <div className="container footer-content">
          {/* Left - Logo, blurb, socials */}
          <div className="footer-col footer-left">
            <div className="footer-logo">AERO VELOCITY</div>
            <p className="footer-blurb">AI-powered aerodynamics, simulation and analytics engineered for speed and control.</p>
            <div className="footer-social" aria-label="Social links">
              <a href="#" aria-label="Instagram" className="icon ig">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor"/><circle cx="12" cy="12" r="4" stroke="currentColor"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>
              </a>
              <a href="#" aria-label="LinkedIn" className="icon li">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor"/><path d="M8 17V10" stroke="currentColor"/><circle cx="8" cy="7" r="1" fill="currentColor"/><path d="M12 17V12.5C12 11.12 13.12 10 14.5 10C15.88 10 17 11.12 17 12.5V17" stroke="currentColor"/></svg>
              </a>
              <a href="#" aria-label="YouTube" className="icon yt">
                <svg width="20" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="6" width="20" height="12" rx="3" stroke="currentColor"/><path d="M11 10L15 12L11 14V10Z" fill="currentColor"/></svg>
              </a>
            </div>
          </div>

          {/* Center - Navigation Links */}
          <div className="footer-col footer-center">
            <div className="footer-title">
              <span className="racing-flag">🏁</span> Navigation
            </div>
            <ul className="footer-list" aria-label="Footer navigation">
              <li>
                <Link to="/">
                  <span className="link-icon">🏠</span> Home
                </Link>
              </li>
              <li>
                <Link to="/dashboard">
                  <span className="link-icon">📊</span> Dashboard
                </Link>
              </li>
              <li>
                <Link to="/simulate">
                  <span className="link-icon">⚡</span> Simulate
                </Link>
              </li>
              <li>
                <Link to="/compare">
                  <span className="link-icon">🔬</span> Compare
                </Link>
              </li>
              <li>
                <Link to="/corner-performance">
                  <span className="link-icon">🏎️</span> Corner Analysis
                </Link>
              </li>
            </ul>
          </div>

          {/* Right - Contact info */}
          <div className="footer-col footer-right">
            <div className="footer-title">Get In Touch</div>
            <ul className="footer-contact">
              <li>
                <span className="ci">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C7.58 2 4 5.58 4 10c0 5.25 8 12 8 12s8-6.75 8-12c0-4.42-3.58-8-8-8Z" stroke="currentColor"/></svg>
                </span>
                2440 Oak Ridge, Omaha, CA 68005
              </li>
              <li>
                <span className="ci">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M22 16.92V19a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.05 4.18 2 2 0 0 1 4 2h2.09A2 2 0 0 1 8 3.72l1.2 2.8a2 2 0 0 1-.45 2.11L7.91 9.47a16 16 0 0 0 6.62 6.62l.84-.84a2 2 0 0 1 2.11-.45l2.8 1.2A2 2 0 0 1 22 16.92Z" stroke="currentColor"/></svg>
                </span>
                (01) 234 567 8901
              </li>
              <li>
                <span className="ci">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 4h16v16H4z" stroke="currentColor"/><path d="M4 7l8 6 8-6" stroke="currentColor"/></svg>
                </span>
                support@aerovelocity.com
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          © {new Date().getFullYear()} <span>AERO VELOCITY</span> · Built for performance · 🏁 Racing Ahead
        </div>
      </motion.footer>
    </div>
  );
};

export default Home;
