export interface Property {
  id: string;
  external_id?: string;
  source: 'zillow' | 'loopnet' | 'manual';
  title: string;
  description?: string;
  property_type: string;
  listing_type: 'rent' | 'lease';
  price: number;
  price_period: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  bedrooms?: number;
  bathrooms?: number;
  sqft?: number;
  year_built?: number;
  image_url?: string;
  images?: string[];
  amenities?: string[];
  broker_name?: string;
  broker_phone?: string;
  broker_email?: string;
  status: string;
  badge?: string;
  date_listed?: string;
  last_updated?: string;
  created_at?: string;
}

export interface PropertyFilters {
  search: string;
  city: string;
  state: string;
  property_type: string;
  listing_type: string;
  min_price: number;
  max_price: number;
  bedrooms: number;
  bathrooms: number;
  min_sqft: number;
  sort_by: string;
  sort_order: string;
}

export interface AdminStats {
  properties: {
    total: number;
    zillow: number;
    loopnet: number;
    manual: number;
    rentals: number;
    leases: number;
  };
  api_usage: {
    last_24h: {
      zillow_calls: number;
      loopnet_calls: number;
      errors: number;
      total: number;
    };
  };
  recent_logs: ApiLog[];
}

export interface ApiLog {
  id: string;
  api_source: string;
  endpoint: string;
  status_code: number;
  response_count: number;
  error_message?: string;
  request_params?: any;
  created_at: string;
}
