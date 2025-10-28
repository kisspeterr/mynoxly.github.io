export interface Event {
  id: string;
  organization_name: string;
  title: string;
  description: string | null;
  start_time: string; // ISO string
  end_time: string | null; // NEW: ISO string
  location: string | null;
  image_url: string | null;
  coupon_id: string | null;
  created_at: string;
  latitude: number | null;
  longitude: number | null;
  event_link: string | null;
  link_title: string | null; // NEW FIELD
  is_active: boolean; // NEW FIELD
  is_archived: boolean; // NEW FIELD
  
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
  end_time: string | null; // NEW
  location: string | null;
  image_url: string | null;
  coupon_id: string | null;
  event_link: string | null; // NEW
  link_title: string | null; // NEW
}