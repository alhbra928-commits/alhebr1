export interface PublicFarm {
  id: string;
  barcode: string;
  farm_name: string;
  total_trees: number;
  available_trees: number;
  base_price: number;
  tree_type: 'palm' | 'olive' | 'mixed';
  location_city: string;
  location_region: string;
  description?: string;
  aerial_image?: string;
  ground_images?: string[];
  video_url?: string;
  google_map_link?: string;
  status: 'open' | 'almost_full' | 'full';
  completion_percentage: number;
  booking_percentage: number;
  latitude?: number;
  longitude?: number;
  harvest_duration?: string;
  soil_type?: string;
  services_available?: string[];
  created_at: string;
}

export interface FarmSuggestion {
  barcode: string;
  farm_name: string;
  reason: 'most_booked' | 'highest_return' | 'new_opening' | 'similar';
  badge: string;
}
