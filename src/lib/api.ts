// API Service สำหรับเชื่อมต่อ Backend
// ใช้ Next.js rewrites เป็น proxy เพื่อหลีกเลี่ยงปัญหา CORS
// Requests จะถูก proxy ไปที่ https://storage-backend-steel.vercel.app

// ใช้ relative URL เพื่อให้ Next.js proxy ทำงาน
const API_BASE_URL = '';

// ==================== Auth Helper ====================

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('ndr_token');
}

export function setToken(token: string): void {
  localStorage.setItem('ndr_token', token);
}

export function removeToken(): void {
  localStorage.removeItem('ndr_token');
  localStorage.removeItem('ndr_currentUser');
}

export function getCurrentUser(): { id: string; name: string; email: string; role: string } | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('ndr_currentUser');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setCurrentUser(user: { id: string; name: string; email: string; role: string }): void {
  localStorage.setItem('ndr_currentUser', JSON.stringify(user));
}

export function isAuthenticated(): boolean {
  return !!getToken() && !!getCurrentUser();
}

// ==================== API Call Helper ====================

interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
}

async function apiCall<T = unknown>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = getToken();
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (response.status === 401) {
      // Token expired
      removeToken();
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    return { success: false, message: 'เกิดข้อผิดพลาดในการเชื่อมต่อ' };
  }
}

// ==================== Auth API ====================

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    phone?: string;
  };
}

export async function login(email: string, password: string): Promise<ApiResponse<LoginResponse>> {
  const result = await apiCall<LoginResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  if (result.success && result.data) {
    setToken(result.data.token);
    setCurrentUser({
      id: result.data.user.id,
      name: result.data.user.name,
      email: result.data.user.email,
      role: result.data.user.role,
    });
  }

  return result;
}

export interface RegisterData {
  name: string;
  email: string;
  username: string;
  password: string;
  role?: string;
  phone?: string;
}

export async function register(data: RegisterData): Promise<ApiResponse<LoginResponse>> {
  return apiCall<LoginResponse>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      ...data,
      role: data.role || 'shelter_staff',
    }),
  });
}

export function logout(): void {
  removeToken();
  if (typeof window !== 'undefined') {
    window.location.href = '/';
  }
}

// ==================== Dashboard API ====================

export interface DashboardOverview {
  shelters: {
    total: number;
    normal: number;
    nearlyFull: number;
    full: number;
    avgOccupancy: number;
  };
  requests: {
    pending: number;
    approved: number;
    transferred: number;
    rejected: number;
    total: number;
  };
}

export async function getDashboardOverview(): Promise<ApiResponse<DashboardOverview>> {
  return apiCall<DashboardOverview>('/api/dashboard/overview');
}

export interface ShelterStatus {
  _id: string;
  name: string;
  province: string;
  district: string;
  address: string;
  capacity: number;
  currentPeople: number;
  occupancyPercentage: number;
  status: string;
  contactName: string;
  contactPhone: string;
}

export async function getShelterStatus(): Promise<ApiResponse<ShelterStatus[]>> {
  return apiCall<ShelterStatus[]>('/api/dashboard/shelter-status');
}

// ==================== Shelters API ====================

export interface Shelter {
  _id: string;
  name: string;
  province: string;
  district: string;
  address: string;
  capacity: number;
  currentPeople: number;
  status: 'normal' | 'nearly_full' | 'full';
  contactName: string;
  contactPhone: string;
  latitude?: number;
  longitude?: number;
}

export async function getShelters(province?: string): Promise<ApiResponse<Shelter[]>> {
  let url = '/api/shelters';
  if (province) {
    url += `?province=${encodeURIComponent(province)}`;
  }
  return apiCall<Shelter[]>(url);
}

// ==================== Warehouses API ====================

export interface Warehouse {
  _id: string;
  name: string;
  province: string;
  address: string;
  managerName: string;
  phone: string;
}

export async function getWarehouses(): Promise<ApiResponse<Warehouse[]>> {
  return apiCall<Warehouse[]>('/api/warehouses');
}

// ==================== Items/Stocks API ====================

export interface StockItem {
  _id: string;
  itemId: string;
  itemName: string;
  unit: string;
  quantity: number;
  minAlert: number;
  status: 'normal' | 'low_stock';
  warehouseId: string;
  warehouseName: string;
}

export interface StockStatusResponse {
  warehouseName: string;
  totalItems: number;
  lowStockItems: number;
  items: StockItem[];
}

export async function getStockStatus(warehouseId: string): Promise<ApiResponse<StockStatusResponse>> {
  return apiCall<StockStatusResponse>(`/api/dashboard/stock-status?warehouseId=${warehouseId}`);
}

export interface LowStockItem {
  _id: string;
  itemId: {
    _id: string;
    name: string;
    unit: string;
  };
  quantity: number;
  minAlert: number;
  warehouseId: {
    _id: string;
    name: string;
  };
}

export async function getLowStockItems(): Promise<ApiResponse<LowStockItem[]>> {
  return apiCall<LowStockItem[]>('/api/stocks/low-stock');
}

export interface AvailabilityCheck {
  itemId: string;
  quantityRequested: number;
  totalAvailable: number;
  isAvailable: boolean;
  availability: {
    warehouseId: string;
    warehouseName: string;
    available: number;
    canFulfill: boolean;
  }[];
}

export async function checkAvailability(
  itemId: string,
  quantity: number
): Promise<ApiResponse<AvailabilityCheck>> {
  return apiCall<AvailabilityCheck>('/api/stocks/check-availability', {
    method: 'POST',
    body: JSON.stringify({ itemId, quantity }),
  });
}

// ==================== Requests API ====================

export interface RequestItem {
  itemId: string;
  quantityRequested: number;
  quantityApproved?: number;
  quantityTransferred?: number;
}

export interface Request {
  _id: string;
  shelterId: {
    _id: string;
    name: string;
  };
  requestedBy: {
    _id: string;
    name: string;
    email: string;
  };
  items: {
    itemId: {
      _id: string;
      name: string;
      unit: string;
    };
    quantityRequested: number;
    quantityApproved?: number;
    quantityTransferred?: number;
  }[];
  status: 'pending' | 'approved' | 'transferred' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export async function getRequests(status?: string, shelterId?: string): Promise<ApiResponse<Request[]>> {
  const params = new URLSearchParams();
  if (status) params.append('status', status);
  if (shelterId) params.append('shelterId', shelterId);
  
  const queryString = params.toString();
  const url = queryString ? `/api/requests?${queryString}` : '/api/requests';
  
  return apiCall<Request[]>(url);
}

export async function getRequestDetail(requestId: string): Promise<ApiResponse<Request>> {
  return apiCall<Request>(`/api/requests/${requestId}`);
}

export async function submitRequest(
  shelterId: string,
  items: { itemId: string; quantityRequested: number }[]
): Promise<ApiResponse<Request>> {
  return apiCall<Request>('/api/requests', {
    method: 'POST',
    body: JSON.stringify({ shelterId, items }),
  });
}

export async function approveRequest(
  requestId: string,
  items: { itemId: string; quantityApproved: number }[],
  warehouseId: string
): Promise<ApiResponse<Request>> {
  return apiCall<Request>(`/api/requests/${requestId}/approve`, {
    method: 'POST',
    body: JSON.stringify({ items, warehouseId }),
  });
}

export async function transferRequest(
  requestId: string,
  items: { itemId: string; quantityTransferred: number }[],
  warehouseId: string
): Promise<ApiResponse<Request>> {
  return apiCall<Request>(`/api/requests/${requestId}/transfer`, {
    method: 'POST',
    body: JSON.stringify({ items, warehouseId }),
  });
}

// ==================== Items API ====================

export interface Item {
  _id: string;
  name: string;
  unit: string;
  categoryId: {
    _id: string;
    name: string;
  };
  description?: string;
}

export async function getItems(): Promise<ApiResponse<Item[]>> {
  return apiCall<Item[]>('/api/items');
}

export async function getItemDetail(itemId: string): Promise<ApiResponse<Item>> {
  return apiCall<Item>(`/api/items/${itemId}`);
}

// ==================== Users API (Admin) ====================

export interface User {
  _id: string;
  name: string;
  email: string;
  username: string;
  role: 'admin' | 'warehouse_staff' | 'shelter_staff';
  phone?: string;
  shelterId?: string;
  warehouseId?: string;
}

export async function getUsers(): Promise<ApiResponse<User[]>> {
  return apiCall<User[]>('/api/users');
}

// ==================== Stock Logs API ====================

export interface StockLog {
  _id: string;
  itemId: {
    _id: string;
    name: string;
  };
  warehouseId: {
    _id: string;
    name: string;
  };
  type: 'in' | 'out';
  quantity: number;
  reason: string;
  createdAt: string;
}

export async function getStockLogs(
  itemId?: string,
  warehouseId?: string
): Promise<ApiResponse<StockLog[]>> {
  const params = new URLSearchParams();
  if (itemId) params.append('itemId', itemId);
  if (warehouseId) params.append('warehouseId', warehouseId);
  
  const queryString = params.toString();
  const url = queryString ? `/api/stock-logs?${queryString}` : '/api/stock-logs';
  
  return apiCall<StockLog[]>(url);
}
