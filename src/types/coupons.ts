export interface Coupon {
  id: string;
  organization_name: string;
  title: string;
  description: string | null;
  coupon_code: string | null; // Can be null if not required
  image_url: string | null;
  expiry_date: string | null; // ISO string
  max_uses_per_user: number;
  total_max_uses: number | null;
  created_at: string;
  points_reward: number; // Points earned upon successful redemption
  points_cost: number;   // Points required to redeem
  is_code_required: boolean; // If true, requires admin validation code
  is_active: boolean; // NEW: If false, coupon is hidden from public view
  is_archived: boolean; // NEW: If true, coupon is moved to archive tab
}

export interface CouponInsert {
  title: string;
  description: string | null;
  coupon_code: string | null; // Can be null if not required
  image_url: string | null;
  expiry_date: string | null;
  max_uses_per_user: number;
  total_max_uses: number | null;
  points_reward: number;
  points_cost: number;
  is_code_required: boolean;
}