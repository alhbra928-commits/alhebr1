export interface Farm {
  id: string;
  owner_id: string;
  name_ar: string;
  name_en: string;
  location: string;
  area_sqm: number;
  tree_type: 'palm' | 'olive';
  total_trees: number;
  available_trees: number;
  price_per_tree: number;
  expected_annual_return: number;
  description_ar: string;
  description_en: string;
  images: string[];
  documents: any[];
  status: 'active' | 'inactive' | 'full';
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  deleted_by?: string;
}

export interface FarmOwner {
  id: string;
  user_id?: string;
  full_name: string;
  phone: string;
  national_id: string;
  bank_account?: string;
  status: 'active' | 'suspended' | 'pending';
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  deleted_by?: string;
}

export interface Investor {
  id: string;
  user_id?: string;
  full_name: string;
  phone: string;
  email: string;
  national_id: string;
  total_invested: number;
  total_trees_owned: number;
  status: 'active' | 'suspended';
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  deleted_by?: string;
}

export interface Reservation {
  id: string;
  farm_id: string;
  investor_id: string;
  number_of_trees: number;
  price_per_tree: number;
  total_amount: number;
  reservation_date: string;
  contract_start_date: string;
  contract_end_date: string;
  status: 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'refunded';
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  deleted_by?: string;
}

export interface Wallet {
  id: string;
  user_id: string;
  user_type: 'investor' | 'owner';
  balance: number;
  total_deposits: number;
  total_withdrawals: number;
  currency: string;
  status: 'active' | 'frozen' | 'closed';
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  deleted_by?: string;
}

export interface WalletTransaction {
  id: string;
  wallet_id: string;
  transaction_type: 'deposit' | 'withdrawal' | 'payment' | 'refund' | 'return';
  amount: number;
  description_ar: string;
  description_en: string;
  reference_id?: string;
  reference_type?: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  created_at: string;
  deleted_at?: string;
  deleted_by?: string;
}

export interface AuditLog {
  id: string;
  table_name: string;
  record_id: string;
  operation: 'INSERT' | 'UPDATE' | 'DELETE' | 'SOFT_DELETE' | 'RESTORE';
  old_data: any;
  new_data: any;
  user_id?: string;
  user_email?: string;
  ip_address?: string;
  user_agent?: string;
  operation_timestamp: string;
  metadata: any;
  created_at: string;
}

export interface SystemLog {
  id: string;
  log_level: 'info' | 'warning' | 'error' | 'critical' | 'debug';
  log_type: 'auth' | 'transaction' | 'api' | 'database' | 'system' | 'security';
  message_ar: string;
  message_en: string;
  user_id?: string;
  ip_address?: string;
  request_path?: string;
  request_method?: string;
  stack_trace?: string;
  metadata: any;
  created_at: string;
}
