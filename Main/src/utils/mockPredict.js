// Mock utilities to be replaced by Python API later

export function predictPerformance(params) {
  // simple deterministic mock
  const { weight = 740, wing = 15, wind = 20, tyre = 'soft' } = params || {};
  const tyreFactor = tyre === 'soft' ? 0.96 : tyre === 'medium' ? 1.0 : 1.06;

  const dragCoefficient = Math.max(0.7, 0.9 + wing * 0.01 + wind * 0.001 - (800 - weight) * 0.0005);
  const efficiency = Math.max(0.6, 1.2 - dragCoefficient * 0.4) * (tyre === 'soft' ? 1.05 : tyre === 'hard' ? 0.95 : 1);
  const lapTime = 80 * tyreFactor + dragCoefficient * 12 + (weight - 740) * 0.03 + wind * 0.05; // seconds

  return {
    dragCoefficient: Number(dragCoefficient.toFixed(3)),
    efficiency: Number(efficiency.toFixed(3)),
    lapTime: Number(lapTime.toFixed(2)),
  };
}

export function simulateRace(params) {
  // Return array of laps with time deltas
  const base = predictPerformance(params);
  const laps = Array.from({ length: 10 }).map((_, i) => {
    const noise = (Math.sin(i * 1.1) + Math.random() * 0.6 - 0.3) * 0.8;
    return { lap: i + 1, time: Number((base.lapTime + noise).toFixed(2)) };
  });
  return { base, laps };
}


