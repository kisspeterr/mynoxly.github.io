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
  
  // NEW Email fields
  send_email_notification: boolean;
  email_subject: string | null;
  email_body: string | null;
  
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
  
  // NEW Email fields
  send_email_notification: boolean;
  email_subject: string | null;
  email_body: string | null;
}