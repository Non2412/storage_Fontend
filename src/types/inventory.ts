export type ItemCategory = 'food' | 'clothing' | 'medical' | 'hygiene' | 'general';

export type ItemStatus = 'available' | 'low' | 'out';

export interface InventoryItem {
    id: string;
    name: string;
    category: ItemCategory;
    quantity: number;
    maxQuantity: number;
    unit: string;
    description?: string;
    imageUrl?: string;
}

export interface ItemRequest {
    id: string;
    itemId: string;
    itemName: string;
    quantity: number;
    requestedBy: string;
    requestedAt: Date;
    reason?: string;
    status: 'pending' | 'approved' | 'rejected';
}

export interface ActivityLog {
    id: string;
    type: 'request' | 'distribution' | 'receipt';
    itemName: string;
    quantity: number;
    user: string;
    timestamp: Date;
    details?: string;
}

export const CATEGORY_LABELS: Record<ItemCategory, string> = {
    food: 'อาหารและเครื่องดื่ม',
    clothing: 'เสื้อผ้าและผ้าห่ม',
    medical: 'ยาและเวชภัณฑ์',
    hygiene: 'อุปกรณ์สุขอนามัย',
    general: 'อุปกรณ์ทั่วไป'
};

export const STATUS_LABELS: Record<ItemStatus, string> = {
    available: 'มี',
    low: 'ใกล้หมด',
    out: 'หมด'
};

export function getItemStatus(quantity: number, maxQuantity: number): ItemStatus {
    if (quantity === 0) return 'out';
    if (quantity < maxQuantity * 0.2) return 'low';
    return 'available';
}
