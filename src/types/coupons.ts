export interface Coupon {
  id: string;
  organization_name: string;
  title: string;
  short_description: string; // NEW: Max 50 chars
  description: string | null; // Max 500 chars
  coupon_code: string | null; // Can be null if not required
  image_url: string | null;
  expiry_date: string | null; // ISO string
  max_uses_per_user: number;
  total_max_uses: number | null;
  created_at: string;
  points_reward: number; // Points earned upon successful redemption
  points_cost: number;   // Points required to redeem
  is_code_required: boolean; // NEW: If true, requires admin validation code
}

export interface CouponInsert {
  title: string;
  short_description: string; // NEW
  description: string | null;
  coupon_code: string | null; // Can be null if not required
  image_url: string | null;
  expiry_date: string | null;
  max_uses_per_user: number;
  total_max_uses: number | null;
  points_reward: number;
  points_cost: number;
  is_code_required: boolean; // NEW
}