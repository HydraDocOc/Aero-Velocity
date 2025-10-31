import { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import './Quiz.css';

const QUIZ_DATA = [
  { question: "It's Friday night. What's your ideal plan?", answers: [
    { text: 'A sophisticated dinner at the most exclusive new restaurant.', team: 'AST' },
    { text: 'An extreme sports event or a high-energy concert.', team: 'RBR' },
    { text: 'A passionate, loud dinner with my entire extended family.', team: 'FER' },
    { text: 'A quiet night in, optimizing my smart home setup.', team: 'MER' },
    { text: 'Re-watching a classic film and appreciating its history.', team: 'WIL' },
  ]},
  { question: 'When facing a major challenge, your first instinct is to:', answers: [
    { text: 'Trust your gut and emotions completely.', team: 'FER' },
    { text: "Find a clever, unconventional solution nobody has thought of.", team: 'RBR' },
    { text: 'Analyze all available data before making a single move.', team: 'MER' },
    { text: 'Stay tough and just keep pushing forward, no matter what.', team: 'WIL' },
    { text: 'Reinvent your approach; a setback is a chance for a comeback.', team: 'MCL' },
  ]},
  { question: 'What do you value most in a team?', answers: [
    { text: 'A long, storied history and a legacy that everyone respects.', team: 'FER' },
    { text: 'Raw ambition and the resources to get to the top, fast.', team: 'AST' },
    { text: "A 'work hard, play hard' culture that breaks the rules.", team: 'RBR' },
    { text: 'A culture of innovation and thinking differently.', team: 'MCL' },
    { text: 'A tight-knit, family-like atmosphere.', team: 'WIL' },
  ]},
  { question: 'Your personal style is best described as:', answers: [
    { text: 'Sleek, modern, and a bit edgy.', team: 'SAU' },
    { text: 'Bold, colorful, and designed to be noticed.', team: 'RBL' },
    { text: 'Elegant, stylish, and unmistakably French.', team: 'ALP' },
    { text: 'Classic, understated, and luxurious.', team: 'AST' },
    { text: 'Practical, direct, and no-nonsense.', team: 'HAS' },
  ]},
  { question: 'How do you react to a setback?', answers: [
    { text: "With passion. Everyone will know I'm upset, but I'll be back.", team: 'FER' },
    { text: 'I get angry, and then work twice as hard to beat them.', team: 'RBR' },
    { text: 'I study the failure obsessively until I have a 10-point plan.', team: 'MER' },
    { text: 'I just lower my head and keep grinding. This is part of the journey.', team: 'WIL' },
    { text: 'I see it as an opportunity to innovate. Time for a new plan.', team: 'MCL' },
  ]},
  { question: "What's your career motto?", answers: [
    { text: "Tradition isn't everything, but it's a lot.", team: 'FER' },
    { text: "If you're not living on the edge, you're taking up too much space.", team: 'RBR' },
    { text: 'Good, better, best. Never let it rest.', team: 'MER' },
    { text: 'Be practical. Get the job done.', team: 'HAS' },
    { text: 'Style is a way to say who you are without having to speak.', team: 'ALP' },
  ]},
  { question: "You're at a party. Where are you?", answers: [
    { text: 'In the center, telling a loud, passionate story.', team: 'FER' },
    { text: 'On the DJ booth, or convincing everyone to go somewhere more exciting.', team: 'RBR' },
    { text: 'In a quiet corner, having an intense discussion about technology.', team: 'MER' },
    { text: 'Networking with the most important people in the room.', team: 'AST' },
    { text: 'Making sure the playlist is perfect and the design is on point.', team: 'MCL' },
  ]},
  { question: "What's the most important factor for you in a new car?", answers: [
    { text: 'The sound of the engine and the feeling it gives you.', team: 'FER' },
    { text: 'The cutting-edge, experimental technology inside.', team: 'MCL' },
    { text: "The brand's reputation for engineering perfection and efficiency.", team: 'MER' },
    { text: 'How it looks. It needs to be the most beautiful car on the road.', team: 'AST' },
    { text: "It just needs to be reliable and not waste my money.", team: 'HAS' },
  ]},
  { question: "What's your 'driving' style in life?", answers: [
    { text: 'Aggressive, bold, and always pushing the limits.', team: 'RBR' },
    { text: 'Smooth, calculated, and efficient.', team: 'MER' },
    { text: 'Passionate and instinctive, sometimes a bit fiery.', team: 'FER' },
    { text: 'Resilient. I can take a hit and keep going.', team: 'WIL' },
    { text: "I'm the 'protégé,' learning fast and eager to prove myself.", team: 'RBL' },
  ]},
  { question: 'Which of these sounds most like you?', answers: [
    { text: "I'm young, energetic, and here to make a name for myself.", team: 'RBL' },
    { text: 'I\'m independent and do things my own way.', team: 'SAU' },
    { text: "I'm practical and focused on making the most of what I have.", team: 'HAS' },
    { text: "I'm stylish, ambitious, and I have impeccable taste.", team: 'AST' },
    { text: 'I\'m a perfectionist. Every detail matters.', team: 'MER' },
  ]},
];

const RESULT_DATA = {
  FER: { name: 'Scuderia Ferrari', description: "You're driven by passion, emotion, and legacy. You act with your heart and have a fiery spirit that inspires everyone around you. Tifosi for life." },
  RBR: { name: 'Red Bull Racing', description: "You're a maverick who loves to push the limits and take risks. You're high-energy, rebellious, and you work (and play) harder than anyone else." },
  MER: { name: 'Mercedes-AMG Petronas', description: 'You are a perfectionist, driven by data, precision, and relentless efficiency. You believe in a calculated approach and continuous improvement.' },
  MCL: { name: 'McLaren', description: "You're an innovator and a resilient spirit. You have a flair for style, appreciate cutting-edge tech, and you're always ready for a comeback." },
  AST: { name: 'Aston Martin', description: 'You are ambitious, stylish, and appreciate the finer things. You have a sense of luxury and are determined to build a new legacy.' },
  ALP: { name: 'Alpine', description: "You've got flair, style, and a touch of national pride. You can be unpredictable, but you always do things with a certain 'panache'." },
  WIL: { name: 'Williams Racing', description: "You're all about heritage, grit, and determination. You're an underdog with a soul, and you value family and history above all." },
  SAU: { name: 'Sauber / Stake', description: "You're an independent spirit. You're sleek, modern, and do things your own way, often with an edgy, contemporary style." },
  RBL: { name: 'Racing Bulls / VCARB', description: "You're the protégé. You're youthful, energetic, and on a proving ground. You're here to learn fast, make a statement, and take the next big step." },
  HAS: { name: 'Haas F1 Team', description: "You are a pragmatist. You're direct, no-nonsense, and focused on being as efficient and practical as possible. You make the most of what you've got." },
};

function computeWinner(scores) {
  let best = 'FER';
  let bestScore = -1;
  Object.entries(scores).forEach(([k, v]) => {
    if (v > bestScore) { bestScore = v; best = k; }
  });
  return best;
}

const TEAM_META = {
  FER: { color: '#DC0000' },
  RBR: { color: '#1E41FF' },
  MER: { color: '#00D2BE' },
  MCL: { color: '#FF8700' },
  AST: { color: '#00665E' },
  ALP: { color: '#0090FF' },
  WIL: { color: '#00A0DE' },
  SAU: { color: '#00E701' },
  RBL: { color: '#2E2A72' },
  HAS: { color: '#B6BABD' },
};

function buildLogoCandidates(teamKey) {
  const keys = [teamKey, teamKey.toLowerCase(), teamKey.toUpperCase()];
  const exts = ['png', 'svg', 'webp', 'jpg', 'jpeg'];
  const paths = [];
  keys.forEach((k) => {
    exts.forEach((e) => paths.push(`/logos/${k}.${e}`));
  });
  return Array.from(new Set(paths));
}

function ImageWithFallback({ candidates, alt, bg, label }) {
  const [idx, setIdx] = useState(0);
  const src = candidates && candidates[idx];
  if (!src) {
    return (
      <div className="quiz-logo-badge" style={{ background: bg }} aria-label={alt}>
        {label}
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      className="quiz-logo-img"
      onError={() => setIdx((i) => i + 1)}
    />
  );
}

const Quiz = () => {
  const [stage, setStage] = useState('welcome');
  const [index, setIndex] = useState(0);
  const [scores, setScores] = useState({ FER: 0, RBR: 0, MER: 0, MCL: 0, AST: 0, ALP: 0, WIL: 0, SAU: 0, RBL: 0, HAS: 0 });
  const [lights, setLights] = useState(false);
  const winnerKey = useMemo(() => computeWinner(scores), [scores]);
  const winner = RESULT_DATA[winnerKey];

  // Get top teams for leaderboard
  const topTeams = useMemo(() => {
    return Object.entries(scores)
      .map(([key, value]) => ({ key, value, name: RESULT_DATA[key]?.name, color: TEAM_META[key]?.color }))
      .filter(t => t.name)
      .sort((a, b) => b.value - a.value)
      .slice(0, 3);
  }, [scores]);

  function playClick() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'square';
      o.frequency.setValueAtTime(220, ctx.currentTime);
      g.gain.setValueAtTime(0.08, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.08);
      o.connect(g); g.connect(ctx.destination); o.start(); o.stop(ctx.currentTime + 0.09);
    } catch {}
  }

  const start = () => {
    setIndex(0);
    setScores({ FER: 0, RBR: 0, MER: 0, MCL: 0, AST: 0, ALP: 0, WIL: 0, SAU: 0, RBL: 0, HAS: 0 });
    setLights(true);
    setTimeout(() => { setStage('quiz'); setLights(false); }, 1200);
  };

  const pick = (team) => {
    setScores((s) => ({ ...s, [team]: (s[team] || 0) + 1 }));
    const next = index + 1;
    if (next >= QUIZ_DATA.length) {
      setStage('result');
    } else {
      setIndex(next);
    }
  };

  // Get score breakdown for result page
  const scoreBreakdown = useMemo(() => {
    return Object.entries(scores)
      .map(([key, value]) => ({ key, value, name: RESULT_DATA[key]?.name, color: TEAM_META[key]?.color }))
      .filter(t => t.name && t.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [scores]);

  const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);

  return (
    <div className={`quiz-page ${stage === 'result' ? 'center' : ''}`}>
      {/* Floating F1 Elements */}
      <div className="quiz-float-elements">
        <div className="float-icon float-icon-1">🏁</div>
        <div className="float-icon float-icon-2">⚡</div>
        <div className="float-icon float-icon-3">🏎️</div>
        <div className="float-icon float-icon-4">🏆</div>
        <div className="float-icon float-icon-5">🔥</div>
      </div>

      {/* Checkered Flag Pattern */}
      <div className="quiz-checkered-flag-top"></div>
      <div className="quiz-checkered-flag-bottom"></div>

      {/* Welcome Stage */}
      {stage === 'welcome' && (
        <div className="quiz-welcome-layout">
          <div className="quiz-card quiz-card-elev" style={{ maxWidth: 820 }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="quiz-hero" style={{ marginBottom: 24 }}>
                <div className="quiz-hero-title">Which F1 Team's Vibe Are You?</div>
                <div className="quiz-hero-sub">Answer 10 quick personality questions to reveal your team match.</div>
              </div>
              <div className="quiz-submit-row">
                <button onClick={start} className="btn-primary">🏁 Start Quiz</button>
              </div>
            </motion.div>
          </div>

          {/* Team Preview Grid */}
          <div className="quiz-teams-preview">
            <div className="quiz-section-title">All 10 F1 Teams</div>
            <div className="quiz-teams-grid">
              {Object.entries(TEAM_META).map(([key, meta]) => (
                <motion.div
                  key={key}
                  className="quiz-team-card"
                  whileHover={{ scale: 1.05, y: -4 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: key.charCodeAt(0) * 0.02 }}
                >
                  <div className="quiz-team-card-color" style={{ background: meta.color }}></div>
                  <div className="quiz-team-card-name">{RESULT_DATA[key]?.name}</div>
                  <div className="quiz-team-card-code">{key}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Quiz Stage */}
      {stage === 'quiz' && (
        <div className="quiz-quiz-layout">
          <div className="quiz-card quiz-card-elev" style={{ maxWidth: 820 }}>
            {lights && (
              <div className="quiz-lights" aria-hidden="true">
                <div className="lights-row">
                  <span className="light" />
                  <span className="light" />
                  <span className="light" />
                  <span className="light" />
                  <span className="light" />
                </div>
                <div className="lights-text">Lights out and away we go!</div>
              </div>
            )}

            <motion.div key={index} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
              <div className="quiz-progress">
                <div className="quiz-progress-track">
                  <div className="quiz-progress-bar" style={{ width: `${Math.min(100, Math.round((index / QUIZ_DATA.length) * 100))}%` }} />
                </div>
                <div className="quiz-progress-text">Question {index + 1} of {QUIZ_DATA.length}</div>
              </div>
              <div className="quiz-q">
                <div className="quiz-q-title-lg">{QUIZ_DATA[index].question}</div>
                <div className="quiz-choices grid">
                  {QUIZ_DATA[index].answers.map((a, i) => (
                    <button key={i} className="quiz-choice pill" onClick={() => { playClick(); pick(a.team); }}>
                      <span className="pill-dot" />
                      <span className="pill-text">{a.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Live Leaderboard */}
          <div className="quiz-leaderboard">
            <div className="quiz-section-title">🏆 Live Standings</div>
            <div className="quiz-leaderboard-list">
              {topTeams.map((team, idx) => (
                <div key={team.key} className="quiz-leaderboard-item" style={{ borderLeft: `4px solid ${team.color}` }}>
                  <div className="quiz-leaderboard-position">#{idx + 1}</div>
                  <div className="quiz-leaderboard-name">{team.name}</div>
                  <div className="quiz-leaderboard-score">{team.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Result Stage */}
      {stage === 'result' && (
        <div className="quiz-result-layout">
          <div className="quiz-card quiz-card-elev" style={{ maxWidth: 900 }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="quiz-result">
              <div className="quiz-result-badge">🏁 Your Match</div>
              <div className="quiz-result-head">
                <div className="quiz-text">
                  <div className="quiz-car-name" style={{ color: TEAM_META[winnerKey]?.color, textShadow: '0 0 16px rgba(255,255,255,0.08)' }}>{winner?.name}</div>
                  <div className="quiz-expl" style={{ marginTop: 8 }}>{winner?.description}</div>
                </div>
                <div className="quiz-logo-wrap">
                  <ImageWithFallback
                    candidates={buildLogoCandidates(winnerKey)}
                    alt={winner?.name}
                    bg={TEAM_META[winnerKey]?.color}
                    label={winnerKey}
                  />
                </div>
              </div>

              {/* Score Breakdown */}
              {scoreBreakdown.length > 0 && (
                <div className="quiz-score-breakdown">
                  <div className="quiz-section-title">📊 Score Breakdown</div>
                  <div className="quiz-breakdown-list">
                    {scoreBreakdown.map((team, idx) => {
                      const percentage = totalScore > 0 ? Math.round((team.value / totalScore) * 100) : 0;
                      return (
                        <div key={team.key} className="quiz-breakdown-item">
                          <div className="quiz-breakdown-rank">#{idx + 1}</div>
                          <div className="quiz-breakdown-bar-container">
                            <div className="quiz-breakdown-label">
                              <span className="quiz-breakdown-name">{team.name}</span>
                              <span className="quiz-breakdown-value">{team.value} ({percentage}%)</span>
                            </div>
                            <div className="quiz-breakdown-bar-track">
                              <motion.div
                                className="quiz-breakdown-bar-fill"
                                initial={{ width: 0 }}
                                animate={{ width: `${percentage}%` }}
                                transition={{ duration: 0.8, delay: idx * 0.1 }}
                                style={{ background: team.color }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="quiz-actions" style={{ marginTop: 24 }}>
                <button className="btn-secondary" onClick={() => setStage('welcome')}>🔄 Try Again</button>
              </div>
            </motion.div>
          </div>

          {/* All Teams Overview */}
          <div className="quiz-all-teams-result">
            <div className="quiz-section-title">🏎️ All Teams Performance</div>
            <div className="quiz-teams-result-grid">
              {Object.entries(TEAM_META).map(([key, meta]) => {
                const score = scores[key] || 0;
                const isWinner = key === winnerKey;
                return (
                  <div key={key} className={`quiz-team-result-card ${isWinner ? 'winner' : ''}`}>
                    <div className="quiz-team-result-color" style={{ background: meta.color }}></div>
                    <div className="quiz-team-result-name">{RESULT_DATA[key]?.name}</div>
                    <div className="quiz-team-result-code">{key}</div>
                    <div className="quiz-team-result-score">Score: {score}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Quiz;

