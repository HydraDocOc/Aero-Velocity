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
  const features = [
    {
      title: 'Downforce Optimization',
      gradient: 'red',
    },
    {
      title: 'Drag Reduction',
      gradient: 'yellow',
    },
    {
      title: 'AI-driven Precision',
      gradient: 'blue',
    },
    {
      title: 'Suspension Dynamics',
      gradient: 'green',
    },
    {
      title: 'Next Gen Prediction',
      gradient: 'purple',
    },
  ];

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
                <stop offset="0%" style={{ stopColor: "rgba(255, 0, 64, 0)", stopOpacity: 0 }} />
                <stop offset="50%" style={{ stopColor: "rgba(0, 212, 255, 0.4)", stopOpacity: 0.4 }} />
                <stop offset="100%" style={{ stopColor: "rgba(255, 0, 64, 0)", stopOpacity: 0 }} />
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
                  src="/car.png" 
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

      {/* Unique Features - moved to end before footer */}

      {/* Tires section (now glass cards like reference) */}
      <section className="tires-cards-section" style={{ ['--tires-bg']: "url('/car.png')" }}>
        <div className="container">
          <div className="tire-cards-grid">
            {[
              { title: 'Downforce Optimization', desc: 'Maximize downforce for superior grip and cornering performance.', ring: 'ring-red', img: '/tire-1.png' },
              { title: 'Drag Reduction', desc: 'Minimize air resistance for maximum straight-line speed.', ring: 'ring-yellow', img: '/tire-2.png' },
              { title: 'AI-driven Precision', desc: 'Harness artificial intelligence for predictive aerodynamic analysis.', ring: 'ring-blue', img: '/tire-3.png' },
              { title: 'Suspension Dynamics', desc: 'Optimize suspension systems for perfect balance and control.', ring: 'ring-green', img: '/tire-4.png' },
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

      {/* Technology section removed as requested */}

      {/* Removed intermediary sections as requested */}

      {/* Services/Features - reverted to simple four-card services */}
      <section id="features" className="features-section">
        <div className="container features-wrap">
          <div className="services-intro">
            <h3 className="section-kf">Key Features</h3>
          </div>
          <div className="services-grid">
            <div className="service-card service-featured">
              <div className="service-icon">&lt;/&gt;</div>
              <h3 className="service-title">AI Aerodynamics</h3>
              <p className="service-desc">Predict drag, downforce and balance in milliseconds with neural models.</p>
              <a href="#technology" className="service-link">Read more</a>
            </div>
            <div className="service-card">
              <div className="service-icon">∞</div>
              <h3 className="service-title">Performance Analytics</h3>
              <p className="service-desc">Live telemetry becomes insight — pace, stints, tyre wear and deltas.</p>
              <a href="#technology" className="service-link">Read more</a>
            </div>
            <div className="service-card">
              <div className="service-icon">👥</div>
              <h3 className="service-title">Adaptive Controls</h3>
              <p className="service-desc">Parameters auto‑tune to track conditions for consistent handling.</p>
              <a href="#technology" className="service-link">Read more</a>
            </div>
            <div className="service-card">
              <div className="service-icon">📈</div>
              <h3 className="service-title">Predictive Strategy</h3>
              <p className="service-desc">Probabilistic race strategy to maximise stint performance and outcomes.</p>
              <a href="#technology" className="service-link">Read more</a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer - minimal, clean, F1 style */}
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

          {/* Center - Quick links */}
          <div className="footer-col footer-center">
            <div className="footer-title">Our Store</div>
            <ul className="footer-list" aria-label="Footer links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/team">About</Link></li>
              <li><a href="#technology">Technology</a></li>
              <li><Link to="/contact">Contact</Link></li>
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
          © {new Date().getFullYear()} AERO VELOCITY · Built for performance
        </div>
      </motion.footer>
    </div>
  );
};

export default Home;
