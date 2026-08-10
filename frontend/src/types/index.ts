export type Role = 'ADMIN' | 'SALES' | 'WAREHOUSE' | 'ACCOUNTS';
export type CustomerType = 'RETAIL' | 'WHOLESALE' | 'DISTRIBUTOR';
export type CustomerStatus = 'LEAD' | 'ACTIVE' | 'INACTIVE';
export type StockMovementType = 'IN' | 'OUT';
export type ChallanStatus = 'DRAFT' | 'CONFIRMED' | 'CANCELLED';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  created_at: string;
}

export interface AuthData {
  token: string;
  user: User;
}

export interface Customer {
  id: string;
  customer_name: string;
  mobile: string;
  email?: string;
  business_name?: string;
  gst_number?: string;
  customer_type: CustomerType;
  address?: string;
  status: CustomerStatus;
  follow_up_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  followups?: CustomerFollowup[];
  challans?: Partial<Challan>[];
}

export interface CustomerFollowup {
  id: string;
  customer_id: string;
  note: string;
  follow_up_date?: string;
  created_at: string;
}

export interface Product {
  id: string;
  product_name: string;
  sku: string;
  category: string;
  unit_price: number;
  current_stock: number;
  minimum_stock: number;
  warehouse_location?: string;
  created_at: string;
  updated_at: string;
  stock_movements?: StockMovement[];
}

export interface StockMovement {
  id: string;
  product_id: string;
  quantity: number;
  type: StockMovementType;
  reason: string;
  created_by: string;
  created_at: string;
  product?: { product_name: string; sku: string };
  user?: { name: string };
}

export interface ChallanItem {
  id: string;
  challan_id: string;
  product_id: string;
  product_name: string;
  sku: string;
  unit_price: number;
  quantity: number;
  product?: { current_stock: number; warehouse_location?: string };
}

export interface Challan {
  id: string;
  challan_number: string;
  customer_id: string;
  total_quantity: number;
  status: ChallanStatus;
  created_by: string;
  created_at: string;
  updated_at: string;
  customer?: { customer_name: string; business_name?: string };
  creator?: { name: string; role?: string };
  items?: ChallanItem[];
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface DashboardStats {
  totalCustomers: number;
  totalProducts: number;
  lowStockCount: number;
  draftChallans: number;
  confirmedChallans: number;
}
