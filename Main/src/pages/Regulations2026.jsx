import { useState } from 'react';
import { motion } from 'framer-motion';
import './Regulations2026.css';

const REGULATION_CARDS = [
  {
    id: 'aero',
    title: 'Active Aerodynamics',
    icon: '✈️',
    highlights: [
      'Front & rear adjustable wings',
      'Reduced wake turbulence',
      'MOM: Manual Override Mode - driver can manually activate active aero for overtaking',
      'Moveable aero elements for efficiency'
    ],
    description: 'Teams can now actively adjust aerodynamic components during the race to optimize performance and reduce drag.',
    color: '#FF1E00'
  },
  {
    id: 'power',
    title: 'Power Unit Evolution',
    icon: '⚡',
    highlights: [
      '50% electric deployment',
      '350kW battery capacity',
      'Reduced ICE output (1000hp)',
      'Strategic energy management'
    ],
    description: 'New hybrid system with equal split between internal combustion engine and electric motor for sustainable performance.',
    color: '#00D2BE'
  },
  {
    id: 'weight',
    title: 'Lighter & Agile',
    icon: '🏎️',
    highlights: [
      '~30kg weight reduction target',
      '768kg minimum weight',
      'More agile chassis design',
      'Enhanced cornering performance'
    ],
    description: 'Significant weight reduction allows for faster acceleration, improved braking, and more responsive handling.',
    color: '#FF8700'
  },
  {
    id: 'fuel',
    title: '100% Sustainable Fuels',
    icon: '🌱',
    highlights: [
      '100% sustainable E-fuel',
      'New thermal efficiency standards',
      'Carbon-neutral racing',
      'Advanced combustion technology'
    ],
    description: 'F1 moves to fully sustainable fuels, maintaining performance while eliminating carbon emissions from the fuel itself.',
    color: '#00E701'
  },
  {
    id: 'tyres',
    title: 'Tyre & Dynamics',
    icon: '🛞',
    highlights: [
      'Lower drag focus',
      'Narrower front/rear wings',
      'Revised suspension geometry',
      '18-inch tyres (standardized)'
    ],
    description: 'Optimized tyre dynamics and suspension for better grip, reduced degradation, and enhanced racing.',
    color: '#DC0000'
  }
];

const TEAM_ADAPTATIONS = [
  {
    team: 'Red Bull Racing',
    strength: 'Aero Expertise',
    challenge: 'PU Power Shift',
    color: '#1E41FF',
    advantage: 'Advanced active aero development'
  },
  {
    team: 'Mercedes-AMG Petronas',
    strength: 'Strong PU Tech',
    challenge: 'Chassis Agility',
    color: '#00D2BE',
    advantage: 'Hybrid system optimization and battery management'
  },
  {
    team: 'Scuderia Ferrari',
    strength: 'Efficient Power Development',
    challenge: 'Aero Stability',
    color: '#DC0000',
    advantage: 'Power unit reliability and sustainable fuel integration'
  },
  {
    team: 'McLaren',
    strength: 'Fast Development Cycles',
    challenge: 'PU Integration',
    color: '#FF8700',
    advantage: 'Rapid adaptation capability and innovative chassis design'
  },
  {
    team: 'Aston Martin',
    strength: 'Aerodynamic Innovation',
    challenge: 'Weight Optimization',
    color: '#00665E',
    advantage: 'Lightweight chassis design and wind tunnel efficiency'
  },
  {
    team: 'Alpine',
    strength: 'Power Unit Efficiency',
    challenge: 'Aero Consistency',
    color: '#0090FF',
    advantage: 'Energy management systems and Renault power unit expertise'
  },
  {
    team: 'Williams Racing',
    strength: 'Heritage & Legacy',
    challenge: 'Budget Constraints',
    color: '#00A0DE',
    advantage: 'Strategic partnerships and efficient resource allocation'
  },
  {
    team: 'Haas F1 Team',
    strength: 'Cost Efficiency',
    challenge: 'Development Resources',
    color: '#B6BABD',
    advantage: 'Streamlined operations and Ferrari collaboration'
  },
  {
    team: 'Sauber / Stake',
    strength: 'Audi Partnership',
    challenge: 'Transition Period',
    color: '#52C42A',
    advantage: 'Manufacturer backing and German engineering expertise'
  },
  {
    team: 'Racing Bulls / VCARB',
    strength: 'Red Bull Synergy',
    challenge: 'Independent Identity',
    color: '#2E2A72',
    advantage: 'Shared technology access and rapid development pipeline'
  },
  {
    team: 'Andretti Cadillac',
    strength: 'American Innovation',
    challenge: 'Entry Approval & Experience',
    color: '#1E1E1E',
    advantage: 'GM powertrain expertise and Andretti racing pedigree'
  }
];

const Regulations2026 = () => {
  const [comparisonPosition, setComparisonPosition] = useState(50);

  const handleSliderChange = (e) => {
    setComparisonPosition(e.target.value);
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="reg2026-page">
      {/* Animated Background Elements */}
      <div className="reg2026-bg-elements">
        <div className="reg2026-speed-line reg2026-speed-line-1"></div>
        <div className="reg2026-speed-line reg2026-speed-line-2"></div>
        <div className="reg2026-speed-line reg2026-speed-line-3"></div>
      </div>

      {/* Hero Section */}
      <section className="reg2026-hero">
        <div className="reg2026-hero-content">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="reg2026-hero-text"
          >
            <div className="reg2026-hero-badge">2026 Formula 1</div>
            <h1 className="reg2026-hero-title">The New Era</h1>
            <p className="reg2026-hero-subtitle">
              Experience the revolution: Hybrid aerodynamics, sustainable power units, lighter chassis, 
              and active aero systems that redefine Formula 1 performance and sustainability.
            </p>
            <div className="reg2026-hero-features">
              <span className="reg2026-feature-tag">Active Aero</span>
              <span className="reg2026-feature-tag">50% Electric</span>
              <span className="reg2026-feature-tag">100% Sustainable</span>
              <span className="reg2026-feature-tag">-30kg Weight</span>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="reg2026-hero-cta"
          >
            <button 
              className="reg2026-cta-btn reg2026-cta-primary"
              onClick={() => scrollToSection('regulations-section')}
            >
              View Changes
            </button>
            <button 
              className="reg2026-cta-btn reg2026-cta-secondary"
              onClick={() => scrollToSection('comparison-section')}
            >
              Performance Insights
            </button>
            <button 
              className="reg2026-cta-btn reg2026-cta-secondary"
              onClick={() => scrollToSection('teams-section')}
            >
              Team Predictions
            </button>
          </motion.div>
        </div>
      </section>

        {/* Key Regulation Changes */}
        <section id="regulations-section" className="reg2026-regulations">
        <div className="reg2026-container">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="reg2026-section-title"
          >
            🏁 Key Regulation Changes
          </motion.h2>
          <div className="reg2026-cards-grid">
            {REGULATION_CARDS.map((card, index) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="reg2026-card"
                whileHover={{ scale: 1.03, y: -8 }}
              >
                <div className="reg2026-card-header" style={{ borderTopColor: card.color }}>
                  <div className="reg2026-card-icon">{card.icon}</div>
                  <h3 className="reg2026-card-title">{card.title}</h3>
                </div>
                <p className="reg2026-card-description">{card.description}</p>
                <div className="reg2026-card-highlights">
                  {card.highlights.map((highlight, idx) => (
                    <div key={idx} className="reg2026-highlight-item">
                      <span className="reg2026-highlight-dot" style={{ background: card.color }}></span>
                      <span className="reg2026-highlight-text">{highlight}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

        {/* Before vs After Comparison */}
        <section id="comparison-section" className="reg2026-comparison">
        <div className="reg2026-container">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="reg2026-section-title"
          >
            📊 2025 vs 2026 Comparison
          </motion.h2>
          
          <div className="reg2026-comparison-wrapper">
            <div className="reg2026-comparison-viewer">
              <div className="reg2026-comparison-image-container">
                <div className="reg2026-car-image reg2026-car-2025">
                  <div className="reg2026-car-label">2025</div>
                  <div className="reg2026-car-specs">
                    <div className="reg2026-spec-item">
                      <span className="reg2026-spec-label">Width</span>
                      <span className="reg2026-spec-value">2000mm</span>
                    </div>
                    <div className="reg2026-spec-item">
                      <span className="reg2026-spec-label">Weight</span>
                      <span className="reg2026-spec-value">798kg</span>
                    </div>
                    <div className="reg2026-spec-item">
                      <span className="reg2026-spec-label">Power</span>
                      <span className="reg2026-spec-value">1050hp</span>
                    </div>
                  </div>
                </div>
                
                <div className="reg2026-comparison-slider-container">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={comparisonPosition}
                    onChange={handleSliderChange}
                    className="reg2026-comparison-slider"
                  />
                  <div className="reg2026-slider-handle">
                    <span>⇄</span>
                  </div>
                </div>

                <div className="reg2026-car-image reg2026-car-2026">
                  <div className="reg2026-car-label">2026</div>
                  <div className="reg2026-car-specs">
                    <div className="reg2026-spec-item">
                      <span className="reg2026-spec-label">Width</span>
                      <span className="reg2026-spec-value">1900mm</span>
                    </div>
                    <div className="reg2026-spec-item">
                      <span className="reg2026-spec-label">Weight</span>
                      <span className="reg2026-spec-value">768kg</span>
                    </div>
                    <div className="reg2026-spec-item">
                      <span className="reg2026-spec-label">Power</span>
                      <span className="reg2026-spec-value">1000hp</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="reg2026-comparison-details">
                <div className="reg2026-detail-card">
                  <div className="reg2026-detail-icon">🏎️</div>
                  <div className="reg2026-detail-title">Aerodynamics</div>
                  <div className="reg2026-detail-text">
                    Narrower bodywork, active front/rear wings, reduced wake turbulence
                  </div>
                </div>
                <div className="reg2026-detail-card">
                  <div className="reg2026-detail-icon">⚡</div>
                  <div className="reg2026-detail-title">Power Unit</div>
                  <div className="reg2026-detail-text">
                    50% electric, 350kW battery, strategic energy deployment
                  </div>
                </div>
                <div className="reg2026-detail-card">
                  <div className="reg2026-detail-icon">🌱</div>
                  <div className="reg2026-detail-title">Sustainability</div>
                  <div className="reg2026-detail-text">
                    100% sustainable E-fuels, carbon-neutral racing
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

        {/* Team Adaptation Predictions */}
        <section id="teams-section" className="reg2026-teams">
        <div className="reg2026-container">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="reg2026-section-title"
          >
            🏆 Team Adaptation Predictions
          </motion.h2>
          
          <div className="reg2026-teams-grid">
            {TEAM_ADAPTATIONS.map((team, index) => (
              <motion.div
                key={team.team}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="reg2026-team-card"
                whileHover={{ scale: 1.05, y: -8 }}
              >
                <div className="reg2026-team-header" style={{ borderLeft: `4px solid ${team.color}` }}>
                  <div className="reg2026-team-name">{team.team}</div>
                </div>
                <div className="reg2026-team-content">
                  <div className="reg2026-team-strength">
                    <div className="reg2026-team-label">Expected Strength</div>
                    <div className="reg2026-team-value">{team.strength}</div>
                  </div>
                  <div className="reg2026-team-challenge">
                    <div className="reg2026-team-label">Key Challenge</div>
                    <div className="reg2026-team-value challenge">{team.challenge}</div>
                  </div>
                  <div className="reg2026-team-advantage">
                    <div className="reg2026-advantage-icon">⭐</div>
                    <div className="reg2026-advantage-text">{team.advantage}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Regulations2026;

