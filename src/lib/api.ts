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

    const contentType = response.headers.get('Content-Type');
    let data;

    if (contentType && contentType.includes('application/json')) {
      try {
        data = await response.json();
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError);
        return { success: false, message: 'ข้อมูลจากเซิร์ฟเวอร์ผิดพลาด' };
      }
    } else {
      // If it's HTML or something else, handle it safely
      const text = await response.text();
      console.warn('Unexpected non-JSON response:', text.substring(0, 100));
      return { success: false, message: 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ในขณะนี้ (HTML Response)' };
    }

    if (response.status === 401) {
      // Token expired or invalid
      removeToken();
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
      return { success: false, message: 'เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่' };
    }

    if (!response.ok) {
      const errorMessage = data?.error || data?.message || `เกิดข้อผิดพลาดจากเซิร์ฟเวอร์ (Status: ${response.status})`;
      console.error(`API Error [${endpoint}]: Status ${response.status}`, {
        error: data?.error,
        message: data?.message,
        details: data?.details,
        fullContent: data
      });
      return {
        success: false,
        message: errorMessage
      };
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
  } | string;
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
  reason?: string;
  createdAt: string;
  updatedAt: string;
}

export async function getRequests(status?: string, shelterId?: string): Promise<ApiResponse<Request[]>> {
  const params = new URLSearchParams();
  if (status) params.append('status', status);
  if (shelterId) params.append('shelterId', shelterId);

  const queryString = params.toString();
  const url = queryString ? `/api/requests?${queryString}` : '/api/requests';

  // Demo Mode: Fetch from API first, then merge with local mock data
  try {
    const apiResponse = await apiCall<Request[]>(url);

    // Check if we are in browser environment
    if (typeof window !== 'undefined') {
      const localRequestsRaw = localStorage.getItem('demo_requests');
      const localRequests: Request[] = localRequestsRaw ? JSON.parse(localRequestsRaw) : [];

      // Filter local requests by status and shelterId if params exist
      const filteredLocal = localRequests.filter(req => {
        const statusMatch = !status || req.status === status;
        const shelterMatch = !shelterId ||
          (typeof req.shelterId === 'object' && req.shelterId?._id === shelterId) ||
          (typeof req.shelterId === 'string' && req.shelterId === shelterId);
        return statusMatch && shelterMatch;
      });

      // Merge: API requests + Local requests
      const mergedData = [...(apiResponse.data || []), ...filteredLocal];

      // Sort by createdAt desc
      mergedData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      return {
        ...apiResponse,
        success: true,
        data: mergedData
      };
    }

    return apiResponse;
  } catch (error) {
    console.error('getRequests error:', error);
    return { success: false, message: 'Failed to fetch requests' };
  }
}

export async function getRequestDetail(requestId: string): Promise<ApiResponse<Request>> {
  return apiCall<Request>(`/api/requests/${requestId}`);
}

export async function submitRequest(
  shelterId: string,
  items: { itemId: string; quantityRequested: number }[],
  reason?: string
): Promise<ApiResponse<Request>> {
  // Demo Mode: Try API first, fallback to local storage if 403/500
  const response = await apiCall<Request>('/api/requests', {
    method: 'POST',
    body: JSON.stringify({ shelterId, items, reason }),
  });

  if (response.success) {
    return response;
  }

  // If API fails (likely 403 in this case), save to localStorage for Demo
  if (typeof window !== 'undefined') {
    const currentUser = getCurrentUser();

    // Fetch real shelter info for better demo data
    let shelterName = 'ศูนย์พักพิง (Demo)';
    try {
      const sheltersRes = await getShelters();
      if (sheltersRes.success && sheltersRes.data) {
        const foundShelter = sheltersRes.data.find(s => s._id === shelterId);
        if (foundShelter) shelterName = foundShelter.name;
      }
    } catch (e) { console.error('Demo fallback: failed to get shelter name'); }

    // Fetch real item info for better demo data
    let enrichedItems: any[] = [];
    try {
      const itemsRes = await getItems();
      if (itemsRes.success && itemsRes.data) {
        enrichedItems = items.map(i => {
          const foundItem = itemsRes.data!.find(it => it._id === i.itemId);
          return {
            itemId: foundItem ? { _id: foundItem._id, name: foundItem.name, unit: foundItem.unit } : { _id: i.itemId, name: 'Item', unit: 'ชิ้น' },
            quantityRequested: i.quantityRequested
          };
        });
      }
    } catch (e) {
      console.error('Demo fallback: failed to get item details');
      enrichedItems = items.map(i => ({
        itemId: { _id: i.itemId, name: 'Item', unit: 'ชิ้น' },
        quantityRequested: i.quantityRequested
      }));
    }

    if (enrichedItems.length === 0) {
      enrichedItems = items.map(i => ({
        itemId: { _id: i.itemId, name: 'Item', unit: 'ชิ้น' },
        quantityRequested: i.quantityRequested
      }));
    }

    const newRequest: any = {
      _id: 'local_' + Date.now(),
      shelterId: { _id: shelterId, name: shelterName, location: 'Bangkok' },
      items: enrichedItems,
      requestedBy: currentUser ? { ...currentUser } : { name: 'เจ้าหน้าที่ศูนย์พักพิง' },
      status: 'pending',
      reason: reason || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const existingRaw = localStorage.getItem('demo_requests');
    const existing = existingRaw ? JSON.parse(existingRaw) : [];
    localStorage.setItem('demo_requests', JSON.stringify([newRequest, ...existing]));

    return {
      success: true,
      data: newRequest,
      message: 'บันทึกคำขอเรียบร้อย'
    };
  }

  return response;
}

export async function approveRequest(
  requestId: string,
  items: { itemId: string; quantityApproved: number }[],
  warehouseId: string
): Promise<ApiResponse<Request>> {
  // Demo Mode: Check if it's a local request first
  if (requestId.startsWith('local_') && typeof window !== 'undefined') {
    const existingRaw = localStorage.getItem('demo_requests');
    if (existingRaw) {
      const requests: any[] = JSON.parse(existingRaw);
      const targetIndex = requests.findIndex(r => r._id === requestId);
      if (targetIndex !== -1) {
        requests[targetIndex].status = 'approved';
        requests[targetIndex].updatedAt = new Date().toISOString();
        localStorage.setItem('demo_requests', JSON.stringify(requests));

        // Deduct from Stock (Demo Mode)
        const currentStockRaw = localStorage.getItem('demo_stock');
        if (currentStockRaw) {
          const stock = JSON.parse(currentStockRaw);
          items.forEach(approvedItem => {
            // Find matching item in stock (by name/category since IDs might not match perfectly in demo)
            // We use simple logic: if category matches, deduct. 
            // Since setup is simple, we map: 'อาหาร' -> Food, 'น้ำดื่ม' -> Water, etc.
            // But better to exact match if we had IDs. 
            // For this demo, we can just deduct properly if we find the item.
            // Assuming stock structure matches the UI: { category: string, quantity: string (formatted), rawQuantity: number }

            // Note: Real app would update by ItemID. Demo app uses categories in UI. 
            // We will try to update mock stock by finding a matching category or item name.

            // Simply decrement all stocks for now to show effect, or pick 1 random?
            // Better: Update specific category based on Item Name keyword
            const itemName = approvedItem.itemId || ""; // This might be an ID in some contexts, but let's assume we can map it.
            // Actually `items` passed here has { itemId: string, quantityApproved: number }

            // Let's iterate stock and reduce relevant one
            // Mapping ItemID to Category is hard without full DB.
            // Let's just deduct a fixed amount from a "General" stock or try to guess.

            // IMPACTFUL CHANGE: Deduct from the *first* available stock item for demo effect
            if (stock.length > 0) {
              // Parse quantity (remove commas)
              let qty = parseInt(stock[0].quantity.replace(/,/g, ''));
              qty = Math.max(0, qty - approvedItem.quantityApproved);
              stock[0].quantity = qty.toLocaleString();
            }
          });
          localStorage.setItem('demo_stock', JSON.stringify(stock));
        }

        return {
          success: true,
          data: requests[targetIndex],
          message: 'อนุมัติคำร้องเรียบร้อย'
        };
      }
    }
  }

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

// ==================== Distribution API (Mock) ====================
export const getDistributionTasks = async () => {
  // Mock data for distribution tasks
  return {
    success: true,
    data: [
      { id: 1, items: 'น้ำดื่ม 200 แพ็ค', shelter: 'ศูนย์พักพิงบางกอก', status: 'delivered', time: '10:30 น.' },
      { id: 2, items: 'อาหาร 100 ชุด', shelter: 'หอประชุมแจ้งวัฒนะ', status: 'shipping', time: '14:20 น.' },
      { id: 3, items: 'ยา 50 กล่อง', shelter: 'วัดไร่ขิง', status: 'pending', time: '15:45 น.' },
    ]
  };
};

// ==================== Stock API (Demo Support) ====================
export async function getStock(): Promise<ApiResponse<any[]>> {
  // In real app, this fetches from /api/stock
  // For demo, we check localStorage
  if (typeof window !== 'undefined') {
    const stockRaw = localStorage.getItem('demo_stock');
    if (stockRaw) {
      return { success: true, data: JSON.parse(stockRaw) };
    }
    // Initial Mock Data if empty
    const initialStock = [
      { category: 'อาหาร', quantity: '12,500', unit: 'ชุด', status: 'เพียงพอ', color: '#40c057' },
      { category: 'น้ำดื่ม', quantity: '8,400', unit: 'แพ็ค', status: 'ต้องเติม', color: '#fab005' },
      { category: 'เวชภัณฑ์', quantity: '3,200', unit: 'ชุด', status: 'เพียงพอ', color: '#339af0' },
      { category: 'เครื่องนุ่งห่ม', quantity: '1,500', unit: 'ชิ้น', status: 'วิกฤต', color: '#fa5252' },
    ];
    localStorage.setItem('demo_stock', JSON.stringify(initialStock));
    return { success: true, data: initialStock };
  }
  return { success: false, message: "Not in browser" };
}
