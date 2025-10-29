export interface Coupon {
    id: string;
    organization_name: string;
    title: string;
    description: string | null;
    short_description: string;
    coupon_code: string | null;
    image_url: string | null;
    expiry_date: string | null; // ISO date string
    max_uses_per_user: number;
    total_max_uses: number | null;
    created_at: string;
    points_reward: number;
    points_cost: number;
    is_code_required: boolean;
    is_active: boolean;
    is_archived: boolean;
}

export type CouponInsert = Omit<Coupon, 'id' | 'created_at' | 'organization_name' | 'is_active' | 'is_archived' | 'short_description'> & {
    organization_name?: string; // Optional during client-side creation, added by hook
    short_description: string;
};