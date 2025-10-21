export interface Event {
  id: string;
  organization_name: string;
  title: string;
  description: string | null;
  start_time: string; // ISO string
  location: string | null;
  image_url: string | null;
  coupon_id: string | null;
  created_at: string;
  
  // Optional relation data (fetched via join)
  coupon?: {
    id: string;
    title: string;
    coupon_code: string;
  } | null;
}

export interface EventInsert {
  title: string;
  description: string | null;
  start_time: string;
  location: string | null;
  image_url: string | null;
  coupon_id: string | null;
}