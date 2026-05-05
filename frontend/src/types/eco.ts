// Eco Footprint Test Types
export interface EcoQuestion {
  id: number;
  text: string;
  options: EcoOption[];
}

export interface EcoOption {
  value: number;
  label: string;
}

export interface EcoTestResult {
  category: string;
  description: string;
  total_score: number;
  tips: string[];
}

export interface EcoLatestResult {
  category: string;
  description: string;
  total_score: number;
  tips: string[];
  taken_at: string;
}

// Rating System Types
export interface ActionResponse {
  new_rating: number;
  new_level: number;
  new_league: string;
}