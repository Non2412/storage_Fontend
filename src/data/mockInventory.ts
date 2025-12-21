import { InventoryItem } from '@/types/inventory';

export const MOCK_INVENTORY: InventoryItem[] = [
    // อาหารและเครื่องดื่ม
    {
        id: '1',
        name: 'ข้าวสาร',
        category: 'food',
        quantity: 500,
        maxQuantity: 1000,
        unit: 'กก.',
        description: 'ข้าวสารหอมมะลิ'
    },
    {
        id: '2',
        name: 'น้ำดื่ม',
        category: 'food',
        quantity: 50,
        maxQuantity: 500,
        unit: 'ลัง',
        description: 'น้ำดื่มบรรจุขวด'
    },
    {
        id: '3',
        name: 'อาหารกระป๋อง',
        category: 'food',
        quantity: 0,
        maxQuantity: 200,
        unit: 'กระป๋อง',
        description: 'อาหารกระป๋องพร้อมทาน'
    },
    {
        id: '4',
        name: 'นมกล่อง UHT',
        category: 'food',
        quantity: 30,
        maxQuantity: 300,
        unit: 'กล่อง',
        description: 'นมพาสเจอร์ไรส์'
    },

    // เสื้อผ้าและผ้าห่ม
    {
        id: '5',
        name: 'ผ้าห่ม',
        category: 'clothing',
        quantity: 80,
        maxQuantity: 200,
        unit: 'ผืน',
        description: 'ผ้าห่มกันหนาว'
    },
    {
        id: '6',
        name: 'เสื้อผ้ามือสอง',
        category: 'clothing',
        quantity: 150,
        maxQuantity: 300,
        unit: 'ชิ้น',
        description: 'เสื้อผ้าบริจาค'
    },
    {
        id: '7',
        name: 'รองเท้า',
        category: 'clothing',
        quantity: 20,
        maxQuantity: 100,
        unit: 'คู่',
        description: 'รองเท้าแตะและรองเท้าผ้าใบ'
    },

    // ยาและเวชภัณฑ์
    {
        id: '8',
        name: 'ยาพาราเซตามอล',
        category: 'medical',
        quantity: 500,
        maxQuantity: 1000,
        unit: 'เม็ด',
        description: 'ยาแก้ปวดลดไข้'
    },
    {
        id: '9',
        name: 'พลาสเตอร์',
        category: 'medical',
        quantity: 100,
        maxQuantity: 500,
        unit: 'แผ่น',
        description: 'พลาสเตอร์ปิดแผล'
    },
    {
        id: '10',
        name: 'แอลกอฮอล์',
        category: 'medical',
        quantity: 0,
        maxQuantity: 50,
        unit: 'ขวด',
        description: 'แอลกอฮอล์เช็ดแผล 70%'
    },

    // อุปกรณ์สุขอนามัย
    {
        id: '11',
        name: 'สบู่',
        category: 'hygiene',
        quantity: 200,
        maxQuantity: 500,
        unit: 'ก้อน',
        description: 'สบู่ก้อน'
    },
    {
        id: '12',
        name: 'ยาสีฟัน',
        category: 'hygiene',
        quantity: 80,
        maxQuantity: 200,
        unit: 'หลอด',
        description: 'ยาสีฟันสูตรฟลูออไรด์'
    },
    {
        id: '13',
        name: 'ผ้าอนามัย',
        category: 'hygiene',
        quantity: 15,
        maxQuantity: 100,
        unit: 'แพ็ค',
        description: 'ผ้าอนามัยสำหรับสตรี'
    },
    {
        id: '14',
        name: 'แชมพู',
        category: 'hygiene',
        quantity: 0,
        maxQuantity: 100,
        unit: 'ขวด',
        description: 'แชมพูสระผม'
    },

    // อุปกรณ์ทั่วไป
    {
        id: '15',
        name: 'ไฟฉาย',
        category: 'general',
        quantity: 30,
        maxQuantity: 50,
        unit: 'อัน',
        description: 'ไฟฉายพกพา LED'
    },
    {
        id: '16',
        name: 'ถ่านไฟฉาย',
        category: 'general',
        quantity: 100,
        maxQuantity: 200,
        unit: 'ก้อน',
        description: 'ถ่านอัลคาไลน์ AA'
    },
    {
        id: '17',
        name: 'เทียนไข',
        category: 'general',
        quantity: 50,
        maxQuantity: 100,
        unit: 'เล่ม',
        description: 'เทียนไขสำหรับฉุกเฉิน'
    },
    {
        id: '18',
        name: 'ที่นอน',
        category: 'general',
        quantity: 5,
        maxQuantity: 50,
        unit: 'ผืน',
        description: 'ที่นอนพับได้'
    }
];
