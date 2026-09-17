export type MealType = 'lunch' | 'dinner';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
}

export interface Group {
  id: string;
  name: string;
  currency: string;
  owner_id: string;
  created_at: string;
  updated_at?: string;
}

export interface GroupMember {
  id: string;
  group_id: string;
  name: string;
  user_id?: string | null;
  avatar_color?: string;
  is_active: boolean;
  created_at: string;
}

export interface MealMember {
  id?: string;
  meal_id?: string;
  member_id: string;
  share_amount: number;
}

export interface Meal {
  id: string;
  group_id: string;
  date: string; // YYYY-MM-DD
  meal_type: MealType;
  total_amount: number;
  paid_by: string; // member_id
  notes?: string;
  created_by?: string;
  created_at: string;
  eater_ids: string[]; // convenience member_ids who ate
  shares?: Record<string, number>; // member_id -> share_amount
}

export interface MemberBalance {
  member_id: string;
  member_name: string;
  avatar_color: string;
  is_active: boolean;
  total_paid: number;
  total_share: number;
  net_balance: number; // positive: will receive / get back, negative: needs to pay
  meals_eaten_count: number;
  lunch_count: number;
  dinner_count: number;
}

export interface SettlementInstruction {
  from_id: string;
  from_name: string;
  to_id: string;
  to_name: string;
  amount: number;
}

export interface SettlementRecord {
  id: string;
  group_id: string;
  from_member_id: string;
  to_member_id: string;
  amount: number;
  date: string;
  notes?: string;
  created_at: string;
}

export interface MonthlyStats {
  month_str: string; // "September 2026"
  month_key: string; // "2026-09"
  total_expense: number;
  total_meals: number;
  lunch_count: number;
  dinner_count: number;
  avg_cost_per_meal: number;
  total_person_meals: number;
  member_summaries: {
    member_id: string;
    member_name: string;
    avatar_color: string;
    meals_count: number;
    total_share: number;
    total_paid: number;
    net_balance: number;
  }[];
  settlements: SettlementInstruction[];
}
