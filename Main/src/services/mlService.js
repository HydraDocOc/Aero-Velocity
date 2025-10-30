/**
 * ML Service - API layer for communicating with the ML backend
 */

const ML_API_BASE_URL = import.meta.env.VITE_ML_API_URL || 'http://localhost:5000/api';

class MLService {
  /**
   * Generic API request handler
   */
  async request(endpoint, options = {}) {
    try {
      const response = await fetch(`${ML_API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`ML API Error (${endpoint}):`, error);
      throw error;
    }
  }

  /**
   * Health check
   */
  async healthCheck() {
    return this.request('/health');
  }

  /**
   * Get all available tracks
   */
  async getTracks() {
    return this.request('/tracks');
  }

  /**
   * Analyze a team at a specific track
   * @param {string} teamName - Name of the team
   * @param {string} trackName - Name of the track
   */
  async analyzeTeam(teamName, trackName) {
    return this.request('/analyze/team', {
      method: 'POST',
      body: JSON.stringify({
        team_name: teamName,
        track_name: trackName,
      }),
    });
  }

  /**
   * Analyze specific components
   * @param {string} teamName - Name of the team
   * @param {object} aeroConfig - Aerodynamic configuration
   * @param {string} trackName - Optional track name
   */
  async analyzeComponents(teamName, aeroConfig = {}, trackName = null) {
    return this.request('/analyze/components', {
      method: 'POST',
      body: JSON.stringify({
        team_name: teamName,
        aero_config: aeroConfig,
        track_name: trackName,
      }),
    });
  }

  /**
   * Predict performance
   * @param {object} aeroConfig - Aerodynamic configuration
   * @param {string} trackName - Track name
   */
  async predictPerformance(aeroConfig, trackName = null) {
    return this.request('/predict/performance', {
      method: 'POST',
      body: JSON.stringify({
        aero_config: aeroConfig,
        track_name: trackName,
      }),
    });
  }

  /**
   * Simulate lap time
   * @param {object} aeroConfig - Aerodynamic configuration
   * @param {object} carParams - Car parameters (mass, power, tire_grip)
   */
  async simulateLap(aeroConfig, carParams = {}) {
    return this.request('/simulate/lap', {
      method: 'POST',
      body: JSON.stringify({
        aero_config: aeroConfig,
        car_params: carParams,
      }),
    });
  }

  /**
   * Simulate circuit-specific analysis
   * @param {string} trackName - Track name
   * @param {object} aeroConfig - Aerodynamic configuration
   */
  async simulateCircuit(trackName, aeroConfig) {
    return this.request('/simulate/circuit', {
      method: 'POST',
      body: JSON.stringify({
        track_name: trackName,
        aero_config: aeroConfig,
      }),
    });
  }

  /**
   * Compare two teams
   * @param {string} team1 - First team name
   * @param {string} team2 - Second team name
   * @param {string} trackName - Track name
   */
  async compareTeams(team1, team2, trackName) {
    return this.request('/compare/teams', {
      method: 'POST',
      body: JSON.stringify({
        team1,
        team2,
        track_name: trackName,
      }),
    });
  }

  /**
   * Get upgrade recommendations
   * @param {object} aeroConfig - Current aerodynamic configuration
   * @param {number} budget - Budget in thousands
   * @param {array} upcomingTracks - Array of upcoming track names
   */
  async recommendUpgrades(aeroConfig, budget = 500, upcomingTracks = []) {
    return this.request('/upgrades/recommend', {
      method: 'POST',
      body: JSON.stringify({
        aero_config: aeroConfig,
        budget,
        upcoming_tracks: upcomingTracks,
      }),
    });
  }

  /**
   * Analyze car from image
   * @param {string} imageBase64 - Base64 encoded image
   * @param {string} teamName - Team name
   */
  async analyzeImage(imageBase64, teamName) {
    return this.request('/analyze/image', {
      method: 'POST',
      body: JSON.stringify({
        image_base64: imageBase64,
        team_name: teamName,
      }),
    });
  }

  /**
   * Get AI insights
   * @param {object} aeroConfig - Aerodynamic configuration
   * @param {object} performanceData - Performance data
   * @param {string} trackName - Track name
   */
  async getAIInsights(aeroConfig, performanceData = {}, trackName = null) {
    return this.request('/ai/insights', {
      method: 'POST',
      body: JSON.stringify({
        aero_config: aeroConfig,
        performance_data: performanceData,
        track_name: trackName,
      }),
    });
  }

  /**
   * Get corner-type performance matrix for a track
   */
  async getCornerPerformance(trackName) {
    return this.request(`/corner-performance/${trackName}`, {
      method: 'GET',
    });
  }

  /**
   * Build aero config from UI inputs
   */
  buildAeroConfig(params) {
    return {
      drag_coefficient: params.dragCoefficient || 0.70,
      cl_front: params.clFront || 1.5,
      cl_rear: params.clRear || 2.0,
      front_wing_angle: params.frontWingAngle || 25,
      rear_wing_angle: params.rearWingAngle || 35,
      ride_height_front: params.rideHeightFront || 0.035,
      ride_height_rear: params.rideHeightRear || 0.055,
    };
  }

  /**
   * Build car params from UI inputs
   */
  buildCarParams(params) {
    return {
      mass: params.mass || 740,
      power: params.power || 850,
      tire_grip: params.tireGrip || 1.8,
    };
  }
}

// Create singleton instance
const mlService = new MLService();

export default mlService;

// Export constants
export const TEAMS = [
  'Red Bull Racing',
  'Ferrari',
  'Mercedes',
  'McLaren',
  'Aston Martin',
  'Alpine',
  'Williams',
  'Racing Bulls',
  'Kick Sauber',
  'Haas',
];

export const AERODYNAMIC_COMPONENTS = [
  'Front Wing',
  'Rear Wing',
  'Floor',
  'Diffuser',
  'Sidepods',
  'Bargeboards',
  'Halo',
  'Engine Cover',
];

