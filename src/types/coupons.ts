export interface Coupon {
  id: string;
  organization_name: string;
  title: string;
  description: string | null;
  coupon_code: string;
  image_url: string | null;
  expiry_date: string | null; // ISO string
  max_uses_per_user: number;
  total_max_uses: number | null;
  created_at: string;
}

export interface CouponInsert {
  title: string;
  description: string | null;
  coupon_code: string;
  image_url: string | null;
  expiry_date: string | null;
  max_uses_per_user: number;
  total_max_uses: number | null;
}