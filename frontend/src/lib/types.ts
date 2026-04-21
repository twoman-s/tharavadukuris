// ============================================================
// TypeScript interfaces for Tharavadu Kuris
// ============================================================

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  role: 'admin' | 'user';
  is_active: boolean;
  date_joined: string;
  full_name?: string;
}

export interface UserMinimal {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  full_name: string;
}

export interface ChitGroup {
  id: number;
  name: string;
  total_amount: string;
  individual_chit_amount: string;
  start_date: string;
  end_date: string;
  total_members: number;
  total_chits: number;
  allocations?: UserChitAllocation[];
  created_at: string;
  updated_at: string;
}

export interface UserChitAllocation {
  id: number;
  user: number;
  chitgroup: number;
  number_of_chits: number;
  total_chit_amount: string;
  monthly_contribution: string;
  user_detail?: UserMinimal;
}

export interface Payment {
  id: number;
  user: number;
  chitgroup: number;
  chitgroup_name: string;
  amount_paid: string;
  screenshot_url: string;
  screenshot_full_url: string | null;
  payment_month: string;
  created_at: string;
  updated_at: string;
  user_detail?: UserMinimal;
}

export interface MonthlyChitWinner {
  id: number;
  user: number;
  chitgroup: number;
  chitgroup_name: string;
  total_amount_won: string;
  month: string;
  payment_confirmation_url?: string;
  payment_confirmation_full_url?: string | null;
  created_at: string;
  user_detail?: UserMinimal;
}

export interface AdminDashboard {
  total_groups: number;
  total_users: number;
  monthly_collection: string;
  total_collected: string;
  recent_payments_count: number;
  total_winners: number;
  current_month: string;
}

export interface UserDashboard {
  my_groups: number;
  my_allocations: number;
  total_paid: string;
  total_wins: number;
  monthly_contribution: string;
  current_month: string;
}

export interface PaymentReport {
  total_payments: number;
  total_amount: string;
  by_user: {
    user__id: number;
    user__username: string;
    user__first_name: string;
    user__last_name: string;
    total_paid: string;
    payment_count: number;
  }[];
  by_group: {
    chitgroup__id: number;
    chitgroup__name: string;
    total_collected: string;
    payment_count: number;
  }[];
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}
