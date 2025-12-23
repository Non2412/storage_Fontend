"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  BarChart3, Users, Home, Package, AlertCircle,
  LogOut, Menu, X, Plus, Bell, Settings, Search,
  TrendingUp, TrendingDown, DollarSign, Calendar,
  FileText, ThumbsUp, ChevronDown, Grid3x3, Type, FileQuestion,
  Truck, ClipboardList, ArrowUpRight, ArrowDownLeft, ShieldCheck, Database,
  UserCheck, Newspaper, Save, LayoutDashboard
} from 'lucide-react';
import {
  LineChart, Line, PieChart, Pie, Cell,
  Tooltip, ResponsiveContainer
} from 'recharts';
import styles from './admin.module.css';
import {
  getDashboardOverview, getShelterStatus, getRequests, getLowStockItems,
  getItems, getUsers, isAuthenticated, getCurrentUser,
  logout, approveRequest, getShelters, getDistributionTasks,
  getWarehouses, getStockStatus,
  type DashboardOverview,
  type ShelterStatus, type Request, type User, type Shelter, type StockItem
} from '@/lib/api';

export default function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [inventorySubTab, setInventorySubTab] = useState('overview');
  const [settingsSubTab, setSettingsSubTab] = useState('general');
  const router = useRouter();

  // API Data State
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardOverview | null>(null);
  const [shelters, setShelters] = useState<ShelterStatus[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [approvedRequests, setApprovedRequests] = useState<Request[]>([]);
  const [systemUsers, setSystemUsers] = useState<User[]>([]);
  const [lowStockItems, setLowStockItems] = useState<any[]>([]);
  const [totalPeopleCount, setTotalPeopleCount] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    if (!isAuthenticated()) {
      router.replace('/');
      return;
    }

    const user = getCurrentUser();
    if (user?.role !== 'admin') {
      alert('คุณไม่มีสิทธิ์เข้าถึงหน้านี้');
      router.replace('/dashboard');
      return;
    }

    fetchInitialData();
  }, [isMounted, router]);

  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      const [
        overviewRes,
        sheltersRes,
        pendingRequestsRes,
        approvedRequestsRes,
        usersRes,
        stockRes // Added stockRes
      ] = await Promise.all([
        getDashboardOverview(),
        getShelterStatus(),
        getRequests('pending'),
        getRequests('approved'),
        getUsers(),
        getWarehouses() // Fetch Warehouses instead of getStock
      ]);

      if (overviewRes.success) setDashboardData(overviewRes.data || null);
      if (sheltersRes.success) {
        const sheltersData = sheltersRes.data || [];
        setShelters(sheltersData);
        const total = sheltersData.reduce((sum, s) => sum + (s.currentPeople || 0), 0);
        setTotalPeopleCount(total);
      }
      if (pendingRequestsRes.success) setRequests(pendingRequestsRes.data || []);
      if (approvedRequestsRes.success) setApprovedRequests(approvedRequestsRes.data || []);
      if (usersRes.success) setSystemUsers(usersRes.data || []);

      const lowStockResult = await getLowStockItems();
      if (lowStockResult.success) setLowStockItems(lowStockResult.data || []);

      // Calculate Stock Data from Warehouses (Same logic as User Inventory)
      if (stockRes.success && stockRes.data) {
        let foodQty = 0;
        let medicalQty = 0;
        let clothingQty = 0;
        let hygieneQty = 0;

        // Fetch stock for each warehouse
        for (const warehouse of stockRes.data) {
          try {
            const warehouseStock = await getStockStatus(warehouse._id);
            if (warehouseStock.success && warehouseStock.data?.items) {
              warehouseStock.data.items.forEach((item: any) => {
                // Map by category name or simple keywords
                const catName = item.itemId?.categoryId?.name || "";
                const name = item.itemId?.name || "";
                const n = name.toLowerCase();

                // 1. Food (User keywords excluding 'water' related for separation)
                // 1. Food (Includes Water to match User Inventory logic)
                if (n.includes('ข้าว') || n.includes('นม') || n.includes('อาหาร') || n.includes('rice') || n.includes('food') || n.includes('milk') || n.includes('bread') || n.includes('egg') ||
                  n.includes('น้ำ') || n.includes('water')) {
                  foodQty += item.quantity;
                }
                // 2. Clothing
                else if (n.includes('เสื้อ') || n.includes('ผ้า') || n.includes('blanket') || n.includes('shirt') || n.includes('pants') || n.includes('clothing')) {
                  clothingQty += item.quantity;
                }
                // 3. Medical
                else if (n.includes('ยา') || n.includes('พลาส') || n.includes('แอลกอฮอล') || n.includes('medicine') || n.includes('first aid') || n.includes('paracetamol') || n.includes('diarrheal')) {
                  medicalQty += item.quantity;
                }
                // 4. Hygiene (New category to match User)
                else if (n.includes('สบู่') || n.includes('แปรง') || n.includes('soap') || n.includes('toothbrush') || n.includes('towel')) {
                  hygieneQty += item.quantity;
                }
              });
            }
          } catch (e) { console.error("Error fetching warehouse stock", e); }
        }

        setStockData([
          { category: 'อาหารและน้ำดื่ม', quantity: foodQty.toLocaleString(), unit: 'ชุด', status: foodQty > 1000 ? 'เพียงพอ' : 'ต้องเติม', color: '#40c057' },
          { category: 'เครื่องนุ่งห่ม', quantity: clothingQty.toLocaleString(), unit: 'ชิ้น', status: clothingQty > 500 ? 'เพียงพอ' : 'วิกฤต', color: '#fa5252' },
          { category: 'เวชภัณฑ์', quantity: medicalQty.toLocaleString(), unit: 'ชุด', status: medicalQty > 500 ? 'เพียงพอ' : 'ต้องเติม', color: '#339af0' },
          { category: 'ของใช้/สุขอนามัย', quantity: hygieneQty.toLocaleString(), unit: 'ชิ้น', status: hygieneQty > 500 ? 'เพียงพอ' : 'ต้องเติม', color: '#fab005' },
        ]);
      }

    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = (message: string) => {
    console.log(`Action triggered: ${message}`);
    alert(`กำลังดำเนินการ: ${message}`);
  };

  const handleLogout = () => {
    if (confirm('คุณต้องการออกจากระบบใช่หรือไม่?')) {
      logout();
    }
  };

  // ดึงข้อมูลสรุปจาก API
  const shelterStats = {
    total: dashboardData?.shelters?.total || 0,
    critical: dashboardData?.shelters?.full || 0,
    warning: dashboardData?.shelters?.nearlyFull || 0,
    normal: dashboardData?.shelters?.normal || 0,
    totalPeople: totalPeopleCount
  };

  // Replace hardcoded stockData with state
  const [stockData, setStockData] = useState<any[]>([]);

  const handleApprove = async (id: string) => {
    if (!confirm('ยืนยันการอนุมัติคำร้อง?')) return;

    try {
      // สำหรับ Demo เราจะเลือกคลังแรกหรือส่งค่าว่างไปก่อน
      const result = await approveRequest(id, [], "");
      if (result.success) {
        alert('อนุมัติคำร้องขอเรียบร้อยแล้ว');
        fetchInitialData(); // Refresh data
      } else {
        alert(result.message || 'เกิดข้อผิดพลาด');
      }
    } catch (error) {
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    }
  };

  const [shelterFilter, setShelterFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // สถานะสำหรับ Modal เพิ่มศูนย์ใหม่
  const [isShelterModalOpen, setIsShelterModalOpen] = useState(false);
  const [newShelter, setNewShelter] = useState({
    name: '',
    province: '',
    district: '',
    address: '',
    capacity: 0,
    currentPeople: 0,
    phone: '',
    contactName: ''
  });

  const handleSaveShelter = async () => {
    if (!newShelter.name || !newShelter.province || !newShelter.capacity) {
      alert('กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน');
      return;
    }

    try {
      // ใน lib/api ยังไม่มีฟังก์ชัน createShelter โดยตรง แต่เราสามารถใช้ fetch
      const result = await fetch('/api/shelters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('ndr_token')}`
        },
        body: JSON.stringify({
          ...newShelter,
          status: 'normal'
        })
      });

      if (result.ok) {
        alert('เพิ่มศูนย์พักพิงใหม่เรียบร้อยแล้ว');
        setIsShelterModalOpen(false);
        setNewShelter({ name: '', province: '', district: '', address: '', capacity: 0, currentPeople: 0, phone: '', contactName: '' });
        fetchInitialData();
      } else {
        alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
      }
    } catch (error) {
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    }
  };

  // ข้อมูลจำลองสำหรับคลังสินค้า (ยังไม่มี API คลังโดยตรง)
  const provincesStock = [
    { name: 'คลังกลาง (กรุงเทพฯ)', items: 5400, status: 'ปกติ' },
    { name: 'คลังประจำจังหวัดขอนแก่น', items: 1200, status: 'ของเริ่มน้อย' },
    { name: 'คลังประจำจังหวัดเชียงใหม่', items: 3200, status: 'ปกติ' },
    { name: 'คลังประจำจังหวัดนครศรีธรรมราช', items: 850, status: 'วิกฤต' },
  ];

  // ข้อมูลแจ้งสถานะการกระจายสิ่งของ
  const distributionTasks = [
    { id: 'DIST-001', shelter: 'ศูนย์กีฬาบางกอก', items: 'น้ำดื่ม 200 แพ็ค', status: 'delivered', time: '10:30 น.', staff: 'นายสมชาย' },
    { id: 'DIST-002', shelter: 'หอประชุมแจ้งวัฒนะ', items: 'อาหาร 100 ชุด', status: 'shipping', time: '14:20 น.', staff: 'นายวิชัย' },
    { id: 'DIST-003', shelter: 'วัดไร่ขิง', items: 'ยา 50 กล่อง', status: 'preparing', time: '15:45 น.', staff: 'นส.สายใจ' },
  ];

  // ข้อมูลการเคลื่อนไหวสต็อก (In/Out)
  const stockMovements = [
    { id: 1, type: 'in', item: 'น้ำดื่ม', qty: 1000, from: 'บริษัท สิงห์ฯ', date: '22/12/2025 09:00' },
    { id: 2, type: 'out', item: 'อาหารชุด', qty: 500, to: 'ศูนย์อุบลฯ', date: '22/12/2025 10:15' },
    { id: 3, type: 'in', item: 'ข้าวสาร', qty: 2000, from: 'กระทรวงเกษตรฯ', date: '22/12/2025 11:30' },
    { id: 4, type: 'out', item: 'ยา', qty: 100, to: 'ดอนเมือง', date: '22/12/2025 13:45' },
  ];

  // ข้อมูลแจ้งเตือนล่าสุด
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'critical', msg: 'ศูนย์กีฬาบางกอก: ทรัพยากรอาหารเข้าขั้นวิกฤต', time: '5 นาทีที่แล้ว', shelterId: 1 },
    { id: 2, type: 'request', msg: 'โรงเรียนวัดดอนเมือง: ส่งคำร้องขอเวชภัณฑ์ด่วน', time: '15 นาทีที่แล้ว', shelterId: 2 },
    { id: 3, type: 'stock', msg: 'คลังสต็อกน้ำดื่มรวมทั้งประเทศต่ำกว่า 20%', time: '1 ชม. ที่แล้ว' },
  ]);

  const [selectedAlertId, setSelectedAlertId] = useState<number | null>(null);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);

  // ข้อมูลจำลองสำหรับการกระจายสิ่งของแบบละเอียด
  const [selectedDistId, setSelectedDistId] = useState<string | null>(null);
  const [isDistModalOpen, setIsDistModalOpen] = useState(false);

  const distributionDetails: Record<string, { itemsList: { name: string, qty: number, unit: string }[], timeline: { status: string, time: string, desc: string }[], driver: string, phone: string }> = {
    'DIST-001': {
      itemsList: [
        { name: 'น้ำดื่ม 600ml', qty: 200, unit: 'แพ็ค' },
        { name: 'ข้าวสาร 5kg', qty: 50, unit: 'ถุง' }
      ],
      timeline: [
        { status: 'ยืนยันคำร้อง', time: '09:00 น.', desc: 'คำร้อง REQ-001 ได้รับการอนุมัติ' },
        { status: 'แพ็คของเสร็จ', time: '10:00 น.', desc: 'บรรจุลงหีบห่อ ณ คลังกลาง' },
        { status: 'ส่งมอบสำเร็จ', time: '10:30 น.', desc: 'เจ้าหน้าที่เซ็นรับสินค้าปลายทางแล้ว' }
      ],
      driver: 'นายสมชาย ใจดี',
      phone: '081-xxx-xxxx'
    },
    'DIST-002': {
      itemsList: [
        { name: 'อาหารชุดเร่งด่วน', qty: 100, unit: 'ชุด' },
        { name: 'ผ้าห่มกันหนาว', qty: 40, unit: 'ผืน' }
      ],
      timeline: [
        { status: 'ยืนยันคำร้อง', time: '12:00 น.', desc: 'คำร้อง REQ-002 ได้รับการอนุมัติ' },
        { status: 'กำลังขนส่ง', time: '14:20 น.', desc: 'รถขนส่งทะเบียน 88-xxxx กำลังมุ่งหน้าปลายทาง' }
      ],
      driver: 'นายวิชัย รวยลาภ',
      phone: '082-xxx-xxxx'
    },
    'DIST-003': {
      itemsList: [
        { name: 'ชุดยาสามัญประจำบ้าน', qty: 50, unit: 'กล่อง' },
        { name: 'หน้ากากอนามัย', qty: 10, unit: 'กล่อง' }
      ],
      timeline: [
        { status: 'ยืนยันคำร้อง', time: '15:00 น.', desc: 'คำร้อง REQ-003 ได้รับการอนุมัติ' },
        { status: 'กำลังเตรียมของ', time: '15:45 น.', desc: 'อยู่ระหว่างเบิกจ่ายสินค้าจากคลัง' }
      ],
      driver: 'นส.สายใจ มั่นคง',
      phone: '083-xxx-xxxx'
    }
  };

  const handleShowDistDetails = (id: string) => {
    setSelectedDistId(id);
    setIsDistModalOpen(true);
  };

  // ข้อมูลบันทึกเหตุการณ์ (Audit Logs)
  const auditLogs = [
    { id: 1, user: 'สมปอง', action: 'อนุมัติคำร้อง REQ-001', module: 'Distribution', time: '22/12/2025 10:30', ip: '192.168.1.45' },
    { id: 2, user: 'วิชัย', action: 'แก้ไขสถานะ DIST-002', module: 'Logistics', time: '22/12/2025 14:20', ip: '10.0.0.12' },
    { id: 3, user: 'สายใจ', action: 'เบิกจ่ายยา 100 ชุด', module: 'Inventory', time: '22/12/2025 13:45', ip: '172.16.8.2' },
    { id: 4, user: 'System', action: 'สำรองข้อมูลอัตโนมัติ', module: 'Database', time: '22/12/2025 00:00', ip: 'localhost' },
  ];

  // ข้อมูลผู้ส่งมอบ (Suppliers)
  const [managedSuppliers, setManagedSuppliers] = useState([
    { id: 1, name: 'บริษัท สิงห์ คอร์เปอเรชั่น', contact: 'คุณเทอดไท', phone: '02-xxx-xxxx', type: 'Donor', items: 'น้ำดื่ม, โซดา' },
    { id: 2, name: 'มูลนิธิกระจกเงา', contact: 'คุณสมบัติ', phone: '02-xxx-xxxx', type: 'Partner', items: 'ชุดอาสา, ยา' },
    { id: 3, name: 'สภากาชาดไทย', contact: 'เจ้าหน้าที่ฝ่ายบรรเทาฯ', phone: '02-xxx-xxxx', type: 'Partner', items: 'ถุงยังชีพ, เลือด' },
    { id: 4, name: 'CP Group', contact: 'ฝ่าย CSR', phone: '02-xxx-xxxx', type: 'Donor', items: 'อาหารสำเร็จรูป' },
  ]);

  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [isEditingSupplier, setIsEditingSupplier] = useState(false);
  const [supplierFormData, setSupplierFormData] = useState({
    id: 0,
    name: '',
    contact: '',
    phone: '',
    type: 'Donor',
    items: ''
  });

  const handleOpenAddSupplier = () => {
    setSupplierFormData({ id: 0, name: '', contact: '', phone: '', type: 'Donor', items: '' });
    setIsEditingSupplier(false);
    setIsSupplierModalOpen(true);
  };

  const handleOpenEditSupplier = (supplier: any) => {
    setSupplierFormData({ ...supplier });
    setIsEditingSupplier(true);
    setIsSupplierModalOpen(true);
  };

  const handleSaveSupplier = () => {
    if (!supplierFormData.name) {
      alert('กรุณากรอกชื่อหน่วยงาน');
      return;
    }

    if (isEditingSupplier) {
      setManagedSuppliers(managedSuppliers.map(s => s.id === supplierFormData.id ? supplierFormData : s));
      alert('แก้ไขข้อมูลเรียบร้อยแล้ว');
    } else {
      const newEntry = { ...supplierFormData, id: Date.now() };
      setManagedSuppliers([...managedSuppliers, newEntry]);
      alert('เพิ่มข้อมูลผู้ส่งมอบใหม่เรียบร้อยแล้ว');
    }
    setIsSupplierModalOpen(false);
  };

  // เกณฑ์การแจ้งเตือน (Thresholds)
  const [thresholds, setThresholds] = useState({
    food: 2000,
    water: 5000,
    medicine: 1000,
    clothing: 500
  });

  const [inventorySearch, setInventorySearch] = useState('');
  const [inventoryCategory, setInventoryCategory] = useState('ทั้งหมด');
  const [inventoryStatus, setInventoryStatus] = useState('สถานะทั้งหมด');

  // Admin Inventory State (Same as User Inventory)
  const [adminInventoryItems, setAdminInventoryItems] = useState<Array<{
    id: string;
    name: string;
    categoryLabel: string;
    quantity: number;
    maxQuantity: number;
    unit: string;
  }>>([]);

  // Load Admin Inventory Data (Same logic as User Inventory)
  useEffect(() => {
    if (!isMounted) return;

    const loadAdminInventory = async () => {
      try {
        const warehousesResult = await getWarehouses();

        if (!warehousesResult.success || !warehousesResult.data || warehousesResult.data.length === 0) {
          return;
        }

        const allStockItems: Map<string, { itemName: string; totalQuantity: number; maxQuantity: number; unit: string }> = new Map();

        for (const warehouse of warehousesResult.data) {
          const stockResult = await getStockStatus(warehouse._id);

          if (stockResult.success && stockResult.data && stockResult.data.items) {
            for (const stockItem of stockResult.data.items) {
              const existing = allStockItems.get(stockItem.itemId);
              if (existing) {
                existing.totalQuantity += stockItem.quantity;
                existing.maxQuantity += stockItem.minAlert * 3;
              } else {
                allStockItems.set(stockItem.itemId, {
                  itemName: stockItem.itemName,
                  totalQuantity: stockItem.quantity,
                  maxQuantity: stockItem.minAlert * 3,
                  unit: stockItem.unit
                });
              }
            }
          }
        }

        const inventoryItems = Array.from(allStockItems.entries()).map(([itemId, data]) => {
          const name = data.itemName.toLowerCase();
          let categoryLabel = 'อุปกรณ์ทั่วไป';

          if (name.includes('ข้าว') || name.includes('นม') || name.includes('อาหาร') || name.includes('rice') || name.includes('food') || name.includes('milk') || name.includes('bread') || name.includes('egg') || name.includes('น้ำ') || name.includes('water')) {
            categoryLabel = 'อาหารและเครื่องดื่ม';
          } else if (name.includes('เสื้อ') || name.includes('ผ้า') || name.includes('blanket') || name.includes('shirt') || name.includes('pants') || name.includes('clothing')) {
            categoryLabel = 'เสื้อผ้าและผ้าห่ม';
          } else if (name.includes('ยา') || name.includes('พลาส') || name.includes('แอลกอฮอล') || name.includes('medicine') || name.includes('first aid') || name.includes('paracetamol') || name.includes('diarrheal')) {
            categoryLabel = 'ยาและเวชภัณฑ์';
          } else if (name.includes('สบู่') || name.includes('แปรง') || name.includes('soap') || name.includes('toothbrush') || name.includes('towel')) {
            categoryLabel = 'อุปกรณ์สุขอนามัย';
          }

          return {
            id: itemId,
            name: data.itemName,
            categoryLabel,
            quantity: data.totalQuantity,
            maxQuantity: data.maxQuantity,
            unit: data.unit
          };
        });

        setAdminInventoryItems(inventoryItems);
      } catch (err) {
        console.error('Error loading admin inventory:', err);
      }
    };

    loadAdminInventory();
  }, [isMounted]);

  // Filter Admin Inventory (Same logic as User Inventory)
  const adminFilteredInventory = adminInventoryItems.filter(item => {
    const matchSearch = item.name.toLowerCase().includes(inventorySearch.toLowerCase());
    const matchCategory = inventoryCategory === 'ทั้งหมด' || item.categoryLabel === inventoryCategory;

    const percentage = (item.quantity / item.maxQuantity) * 100;
    const status = item.quantity === 0 ? 'หมด' : percentage <= 30 ? 'ใกล้หมด' : 'มี';
    const matchStatus = inventoryStatus === 'สถานะทั้งหมด' || status === inventoryStatus;

    return matchSearch && matchCategory && matchStatus;
  });

  // ข้อมูลสินค้าในคลังแบบใหม่ (Legacy - kept for compatibility)
  const newInventoryData = [
    { id: 1, name: 'Paracetamol 500mg', category: 'ยาและเวชภัณฑ์', qty: 200, target: 30, unit: 'box', percentage: 667, status: 'ปกติ' },
    { id: 2, name: 'Blanket', category: 'เสื้อผ้าและผ้าห่ม', qty: 800, target: 60, unit: 'piece', percentage: 1333, status: 'ปกติ' },
    { id: 3, name: 'Rice 10kg', category: 'อาหารและเครื่องดื่ม', qty: 1800, target: 60, unit: 'box', percentage: 3000, status: 'ปกติ' },
    { id: 4, name: 'Drinking Water', category: 'อาหารและเครื่องดื่ม', qty: 5400, target: 5000, unit: 'pack', percentage: 108, status: 'ปกติ' },
    { id: 5, name: 'First Aid Kit', category: 'ยาและเวชภัณฑ์', qty: 15, target: 50, unit: 'box', percentage: 30, status: 'ใกล้หมด' },
    { id: 6, name: 'Canned Food', category: 'อาหารและเครื่องดื่ม', qty: 0, target: 1000, unit: 'can', percentage: 0, status: 'หมด' },
  ];

  const inventoryCategories = ['ทั้งหมด', 'อาหารและเครื่องดื่ม', 'เสื้อผ้าและผ้าห่ม', 'ยาและเวชภัณฑ์', 'อุปกรณ์สุขอนามัย', 'อุปกรณ์ทั่วไป'];

  const filteredInventory = newInventoryData.filter(item => {
    const matchSearch = item.name.toLowerCase().includes(inventorySearch.toLowerCase());
    const matchCategory = inventoryCategory === 'ทั้งหมด' || item.category === inventoryCategory;
    const matchStatus = inventoryStatus === 'สถานะทั้งหมด' || item.status === inventoryStatus;
    return matchSearch && matchCategory && matchStatus;
  });

  const [announcement, setAnnouncement] = useState('');

  return (
    <div className={styles.container}>
      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : styles.sidebarClosed}`}>
        {/* Sidebar Header */}
        <div className={styles.sidebarHeader}>
          {sidebarOpen ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <div className={styles.sidebarTitle}>MATERIALLY</div>
              <button onClick={() => setSidebarOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6c757d', display: 'flex' }}>
                <X size={18} />
              </button>
            </div>
          ) : (
            <button onClick={() => setSidebarOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6c757d', width: '100%', display: 'flex', justifyContent: 'center' }}>
              <Menu size={20} />
            </button>
          )}
        </div>

        {/* Sidebar Menu */}
        <div className={styles.sidebarMenu}>
          {[
            { icon: LayoutDashboard, label: 'ภาพรวมระบบ', id: 'overview' },
            { icon: FileText, label: 'รายการคำร้อง', id: 'requests' },
            { icon: Home, label: 'ศูนย์พักพิง', id: 'shelters' },
            { icon: Package, label: 'คลังสินค้า', id: 'inventory' },
            { icon: Truck, label: 'การกระจายสิ่งของ', id: 'distribution' },
            { icon: ShieldCheck, label: 'ผู้ส่งมอบ', id: 'suppliers' },
            { icon: ClipboardList, label: 'ประวัติการอนุมัติ', id: 'logs' },
            { icon: Settings, label: 'ตั้งค่าระบบ', id: 'settings' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`${styles.navItem} ${activeTab === item.id ? styles.navItemActive : ''}`}
            >
              <item.icon size={20} />
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </div>

        {/* Sidebar Footer */}
        <div style={{ padding: '16px', borderTop: '1px solid #f0f2f5' }}>
          <button
            onClick={handleLogout}
            className={styles.navItem}
            style={{ backgroundColor: '#fff5f5', color: '#ff6b6b' }}
          >
            <LogOut size={18} />
            {sidebarOpen && <span>ออกจากระบบ</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={styles.main}>
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.logoOuter}>
              <BarChart3 size={20} style={{ color: '#4361ee' }} />
            </div>
            <span className={styles.logoText}>Materially</span>
          </div>

          <div className={styles.searchBar}>
            <Search size={16} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="ค้นหา..."
              className={styles.searchInput}
            />
          </div>

          <div className={styles.headerRight}>
            <div className={styles.headerBtn}>
              <Bell size={20} />
            </div>
            <div className={styles.headerBtn} onClick={() => setActiveTab('settings')}>
              <Settings size={20} />
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className={styles.content}>
          <div className={styles.contentWrapper}>
            {activeTab === 'overview' && (
              <>
                {/* Welcome Banner */}
                <div className={styles.welcomeBanner}>
                  <div className={styles.welcomeTitle}>สวัสดีครับ, แอดมิน 👋</div>
                  <div className={styles.welcomeSubtitle}>ขณะนี้ระบบกำลังช่วยดูแลศูนย์พักพิงทั้งหมด {shelterStats.total} แห่ง และผู้ประสบภัย {shelterStats.totalPeople.toLocaleString()} คน อย่างเต็มกำลัง</div>

                  <div className={styles.bannerStats}>
                    <div className={styles.bannerStatItem}>
                      <span className={styles.bannerStatLabel}>เซิร์ฟเวอร์</span>
                      <span className={styles.bannerStatValue}>ออนไลน์ 100%</span>
                    </div>
                    <div className={styles.bannerStatItem}>
                      <span className={styles.bannerStatLabel}>การซิงค์ข้อมูล</span>
                      <span className={styles.bannerStatValue}>12 วินาทีที่แล้ว</span>
                    </div>
                    <div className={styles.bannerStatItem}>
                      <span className={styles.bannerStatLabel}>สถานะคลังรวม</span>
                      <span className={styles.bannerStatValue} style={{ color: '#fed7aa' }}>ควรระวัง</span>
                    </div>
                  </div>
                </div>

                {/* Top Stats Cards */}
                <div className={styles.statsGrid}>
                  <div className={styles.statCard}>
                    <div>
                      <div className={styles.statValue}>{shelterStats.totalPeople.toLocaleString()}</div>
                      <div className={styles.statLabel}>ผู้ประสบภัยทั้งหมด</div>
                    </div>
                    <div className={styles.statIconBox} style={{ backgroundColor: '#e7f5ff' }}>
                      <Users size={24} style={{ color: '#339af0' }} />
                    </div>
                  </div>

                  <div className={styles.statCard}>
                    <div>
                      <div className={styles.statValue}>{shelterStats.total}</div>
                      <div className={styles.statLabel}>ศูนย์พักพิงทั้งหมด</div>
                    </div>
                    <div className={styles.statIconBox} style={{ backgroundColor: '#f8f9fa' }}>
                      <Home size={24} style={{ color: '#495057' }} />
                    </div>
                  </div>

                  <div className={styles.statCard}>
                    <div>
                      <div className={styles.statValue} style={{ color: '#fa5252' }}>{shelterStats.critical}</div>
                      <div className={styles.statLabel}>ศูนย์ที่สถานะ "วิกฤต"</div>
                    </div>
                    <div className={styles.statIconBox} style={{ backgroundColor: '#fff5f5' }}>
                      <AlertCircle size={24} style={{ color: '#fa5252' }} />
                    </div>
                  </div>

                  <div className={styles.statCard}>
                    <div>
                      <div className={styles.statValue} style={{ color: '#fab005' }}>{requests.length}</div>
                      <div className={styles.statLabel}>คำร้องรออนุมัติ</div>
                    </div>
                    <div className={styles.statIconBox} style={{ backgroundColor: '#fff9db' }}>
                      <Package size={24} style={{ color: '#fab005' }} />
                    </div>
                  </div>
                </div>

                {/* Main Dashboard Content Grid */}
                <div className={styles.chartsGrid}>
                  {/* Quick Request Approval */}
                  <div className={styles.chartCard}>
                    <div className={styles.chartHeader}>
                      <h3 className={styles.chartTitle}>คำร้องขอสิ่งของเร่งด่วน</h3>
                      <button onClick={() => setActiveTab('requests')} className={styles.navItem} style={{ width: 'auto', fontSize: '12px', padding: '4px 12px' }}>ดูทั้งหมด</button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {requests.map(req => (
                        <div key={req._id} className={styles.requestItem}>
                          <div>
                            <div style={{ fontWeight: '600', fontSize: '14px' }}>{req.shelterId?.name || 'Unknown Shelter'}</div>
                            <div style={{ fontSize: '12px', color: '#868e96' }}>
                              {req.items.map(i => i.itemId?.name).join(', ')}
                            </div>
                          </div>
                          <button
                            onClick={() => handleApprove(req._id)}
                            className={styles.approveBtn}
                          >
                            อนุมัติ
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Distribution Tracking */}
                  <div className={styles.chartCard}>
                    <div className={styles.chartHeader}>
                      <h3 className={styles.chartTitle}>ติดตามการกระจายของ</h3>
                      <button onClick={() => setActiveTab('distribution')} className={styles.navItem} style={{ width: 'auto', fontSize: '12px', padding: '4px 12px' }}>ดูทั้งหมด</button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      {distributionTasks.map(task => (
                        <div key={task.id} className={styles.distributionItem}>
                          <div className={styles.statusDot} style={{
                            backgroundColor: task.status === 'delivered' ? '#40c057' : task.status === 'shipping' ? '#339af0' : '#fab005'
                          }}></div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '14px', fontWeight: '600' }}>{task.items}</div>
                            <div style={{ fontSize: '12px', color: '#868e96' }}>→ {task.shelter}</div>
                          </div>
                          <div style={{ fontSize: '12px', fontWeight: '500', color: '#495057' }}>{task.time}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* System Notifications */}
                  <div className={styles.chartCard}>
                    <div className={styles.chartHeader}>
                      <h3 className={styles.chartTitle}>การแจ้งเตือนระบบ</h3>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      {notifications.map(notif => (
                        <div key={notif.id} className={styles.notificationItem}>
                          <div className={styles.notifIcon} style={{
                            backgroundColor: notif.type === 'critical' ? '#fff5f5' : notif.type === 'request' ? '#e7f5ff' : '#fff9db'
                          }}>
                            {notif.type === 'critical' ? <AlertCircle size={18} color="#fa5252" /> :
                              notif.type === 'request' ? <FileText size={18} color="#228be6" /> :
                                <Package size={18} color="#f08c00" />}
                          </div>
                          <div className={styles.notifContent}>
                            <div className={styles.notifMsg}>{notif.msg}</div>
                            <div className={styles.notifTime}>{notif.time}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Stock Status Central */}
                  <div className={styles.chartCard} style={{ gridColumn: sidebarOpen ? 'span 2' : 'span 1' }}>
                    <h3 className={styles.chartTitle} style={{ marginBottom: '20px' }}>สถานะคลังสินค้ากองกลาง</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                      {lowStockItems.length > 0 ? (
                        lowStockItems.slice(0, 4).map((stock) => (
                          <div key={stock._id}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                              <span style={{ fontWeight: '500', fontSize: '14px' }}>{stock.itemId?.name || 'Unknown Item'}</span>
                              <span style={{ fontSize: '14px', color: '#fa5252', fontWeight: 'bold' }}>{stock.quantity} {stock.itemId?.unit || ''}</span>
                            </div>
                            <div className={styles.progressBarOuter}>
                              <div className={styles.progressBarInner} style={{
                                width: `${Math.min((stock.quantity / (stock.minAlert || 1)) * 100, 100)}%`,
                                backgroundColor: '#fa5252'
                              }}></div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div style={{ gridColumn: 'span 2', textAlign: 'center', color: '#868e96', padding: '20px' }}>
                          ไม่มีรายการสินค้าที่ต้องเติมเร่งด่วน
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Shelter Health Grid (500+ Summary) */}
                  <div className={styles.chartCard}>
                    <div className={styles.chartHeader}>
                      <h3 className={styles.chartTitle}>สรุปภาพรวมศูนย์ฯ</h3>
                      <button onClick={() => setActiveTab('shelters')} className={styles.navItem} style={{ width: 'auto', fontSize: '12px', padding: '4px 12px' }}>ดูละเอียด</button>
                    </div>
                    <div className={styles.chartContainer} style={{ height: '220px', position: 'relative' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'วิกฤต', value: shelterStats.critical, color: '#fa5252' },
                              { name: 'ใกล้เต็ม', value: shelterStats.warning, color: '#fab005' },
                              { name: 'ปกติ', value: shelterStats.normal, color: '#40c057' },
                            ]}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none"
                          >
                            <Cell fill="#fa5252" />
                            <Cell fill="#fab005" />
                            <Cell fill="#40c057" />
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                      <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        textAlign: 'center'
                      }}>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#333' }}>{shelterStats.total}</div>
                        <div style={{ fontSize: '12px', color: '#868e96' }}>ศูนย์ทั้งหมด</div>
                      </div>
                    </div>

                    <div className={styles.statusLegend}>
                      <div className={styles.legendItem}>
                        <div className={styles.legendColor} style={{ backgroundColor: '#fa5252' }}></div>
                        วิกฤต ({shelterStats.critical})
                      </div>
                      <div className={styles.legendItem}>
                        <div className={styles.legendColor} style={{ backgroundColor: '#fab005' }}></div>
                        ใกล้เต็ม ({shelterStats.warning})
                      </div>
                      <div className={styles.legendItem}>
                        <div className={styles.legendColor} style={{ backgroundColor: '#40c057' }}></div>
                        ปกติ ({shelterStats.normal})
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'shelters' && (
              <div className={styles.chartCard} style={{ animation: 'fadeIn 0.4s ease-out' }}>
                <div className={styles.chartHeader}>
                  <div>
                    <h3 className={styles.chartTitle}>จัดการข้อมูลศูนย์พักพิง</h3>
                    <p style={{ color: '#868e96', fontSize: '14px' }}>รองรับรายการศูนย์กว่า 500 แห่งทั่วประเทศ</p>
                  </div>
                  <button
                    onClick={() => setIsShelterModalOpen(true)}
                    className={styles.approveBtn}
                    style={{ backgroundColor: '#4361ee' }}
                  >
                    + เพิ่มศูนย์ใหม่
                  </button>
                </div>

                <div className={styles.filterBar}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#adb5bd' }} />
                    <input
                      type="text"
                      placeholder="ค้นหาชื่อศูนย์ หรือจังหวัด..."
                      className={styles.filterInput}
                      style={{ paddingLeft: '40px', width: '100%' }}
                      value={shelterFilter}
                      onChange={(e) => setShelterFilter(e.target.value)}
                    />
                  </div>
                  <select
                    className={styles.filterInput}
                    style={{ minWidth: '150px' }}
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all">ทุกสถานะ (จัดลำดับอัตโนมัติ)</option>
                    <option value="critical">วิกฤต (เต็ม)</option>
                    <option value="warning">ใกล้เต็ม</option>
                    <option value="normal">ปกติ</option>
                  </select>
                </div>

                <div className={styles.tableContainer}>
                  <table className={styles.customTable}>
                    <thead>
                      <tr>
                        <th>ชื่อศูนย์พักพิง</th>
                        <th>จังหวัด</th>
                        <th>ความจุ (คน)</th>
                        <th>สถานะ</th>
                        <th>ข้อมูลติดต่อ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {shelters
                        .filter((s: any) => (s.name.includes(shelterFilter) || s.province.includes(shelterFilter)) && (statusFilter === 'all' || s.status === statusFilter))
                        .sort((a: any, b: any) => {
                          const severity: Record<string, number> = { full: 0, nearly_full: 1, normal: 2 };
                          return (severity[a.status] ?? 3) - (severity[b.status] ?? 3);
                        })
                        .map((shelter: any) => (
                          <tr key={shelter._id}>
                            <td style={{ fontWeight: '600' }}>{shelter.name}</td>
                            <td>{shelter.province}</td>
                            <td>
                              <div style={{ fontSize: '13px' }}>{shelter.currentPeople} / {shelter.capacity}</div>
                              <div className={styles.progressBarOuter} style={{ height: '4px', width: '100px', marginTop: '4px' }}>
                                <div className={styles.progressBarInner} style={{
                                  width: `${(shelter.currentPeople / shelter.capacity) * 100}%`,
                                  backgroundColor: shelter.status === 'full' ? '#fa5252' : shelter.status === 'nearly_full' ? '#fab005' : '#40c057'
                                }}></div>
                              </div>
                            </td>
                            <td>
                              <span className={`${styles.statusBadge} ${shelter.status === 'full' ? styles.badgeCritical :
                                shelter.status === 'nearly_full' ? styles.badgeWarning : styles.badgeNormal
                                }`}>
                                {shelter.status === 'full' ? 'เต็ม (วิกฤต)' : shelter.status === 'nearly_full' ? 'ใกล้เต็ม' : 'ปกติ'}
                              </span>
                            </td>
                            <td style={{ color: '#4361ee', cursor: 'pointer' }}>{shelter.contactPhone}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>

                {/* Modal เพิ่มศูนย์พักพิงใหม่ */}
                {isShelterModalOpen && (
                  <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                      <div className={styles.modalHeader}>
                        <h3 className={styles.modalTitle}>เพิ่มศูนย์พักพิงใหม่</h3>
                        <button onClick={() => setIsShelterModalOpen(false)} className={styles.closeBtn}>
                          <X size={20} />
                        </button>
                      </div>

                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>ชื่อศูนย์พักพิง *</label>
                        <input
                          type="text"
                          className={styles.formInput}
                          placeholder="เช่น ศูนย์กีฬาบางกอก"
                          value={newShelter.name}
                          onChange={(e) => setNewShelter({ ...newShelter, name: e.target.value })}
                        />
                      </div>

                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>จังหวัด *</label>
                        <input
                          type="text"
                          className={styles.formInput}
                          placeholder="เช่น กรุงเทพฯ"
                          value={newShelter.province}
                          onChange={(e) => setNewShelter({ ...newShelter, province: e.target.value })}
                        />
                      </div>

                      <div style={{ display: 'flex', gap: '16px' }}>
                        <div className={styles.formGroup} style={{ flex: 1 }}>
                          <label className={styles.formLabel}>จำนวนคนปัจจุบัน</label>
                          <input
                            type="number"
                            className={styles.formInput}
                            value={newShelter.currentPeople}
                            onChange={(e) => setNewShelter({ ...newShelter, currentPeople: parseInt(e.target.value) || 0 })}
                          />
                        </div>
                        <div className={styles.formGroup} style={{ flex: 1 }}>
                          <label className={styles.formLabel}>ความจุทั้งหมด *</label>
                          <input
                            type="number"
                            className={styles.formInput}
                            value={newShelter.capacity}
                            onChange={(e) => setNewShelter({ ...newShelter, capacity: parseInt(e.target.value) || 0 })}
                          />
                        </div>
                      </div>

                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>เบอร์โทรศัพท์ติดต่อ</label>
                        <input
                          type="text"
                          className={styles.formInput}
                          placeholder="02-xxx-xxxx"
                          value={newShelter.phone}
                          onChange={(e) => setNewShelter({ ...newShelter, phone: e.target.value })}
                        />
                      </div>

                      <div className={styles.modalActions}>
                        <button onClick={() => setIsShelterModalOpen(false)} className={styles.cancelBtn}>ยกเลิก</button>
                        <button onClick={handleSaveShelter} className={styles.saveBtn}>บันทึกข้อมูล</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'inventory' && (
              <div className={styles.inventoryContainer} style={{ animation: 'fadeIn 0.4s ease-out' }}>
                <h1 className={styles.inventoryTitle}>คลังสิ่งของ</h1>
                <p className={styles.inventorySubTitle}>จัดการและติดตามสิ่งของในคลัง</p>

                {/* Summary Cards */}
                <div className={styles.inventorySummaryGrid}>
                  <div className={styles.inventorySummaryCard}>
                    <div className={styles.summaryLabel}>ทั้งหมด</div>
                    <div className={styles.summaryValue}>{adminInventoryItems.length}</div>
                  </div>
                  <div className={styles.inventorySummaryCard}>
                    <div className={styles.summaryLabel}>มี</div>
                    <div className={styles.summaryValue} style={{ color: '#22c55e' }}>
                      {adminInventoryItems.filter(i => {
                        const percentage = (i.quantity / i.maxQuantity) * 100;
                        return percentage > 30;
                      }).length}
                    </div>
                  </div>
                  <div className={styles.inventorySummaryCard}>
                    <div className={styles.summaryLabel}>ใกล้หมด</div>
                    <div className={styles.summaryValue} style={{ color: '#f59e0b' }}>
                      {adminInventoryItems.filter(i => {
                        const percentage = (i.quantity / i.maxQuantity) * 100;
                        return percentage > 0 && percentage <= 30;
                      }).length}
                    </div>
                  </div>
                  <div className={styles.inventorySummaryCard}>
                    <div className={styles.summaryLabel}>หมด</div>
                    <div className={styles.summaryValue} style={{ color: '#ef4444' }}>
                      {adminInventoryItems.filter(i => i.quantity === 0).length}
                    </div>
                  </div>
                </div>

                {/* Category Tabs */}
                <div className={styles.categoryTabsScroll}>
                  {inventoryCategories.map(cat => (
                    <button
                      key={cat}
                      className={`${styles.categoryTabButton} ${inventoryCategory === cat ? styles.categoryTabButtonActive : ''}`}
                      onClick={() => setInventoryCategory(cat)}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Controls */}
                <div className={styles.inventoryControls}>
                  <div className={styles.searchWrapper}>
                    <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#adb5bd' }} />
                    <input
                      type="text"
                      className={styles.inventorySearchInput}
                      placeholder="ค้นหาสิ่งของ..."
                      value={inventorySearch}
                      onChange={(e) => setInventorySearch(e.target.value)}
                    />
                  </div>
                  <select
                    className={styles.inventoryStatusSelect}
                    value={inventoryStatus}
                    onChange={(e) => setInventoryStatus(e.target.value)}
                  >
                    <option>สถานะทั้งหมด</option>
                    <option>มี</option>
                    <option>ใกล้หมด</option>
                    <option>หมด</option>
                  </select>
                </div>

                {/* Item Grid */}
                <div className={styles.itemGrid}>
                  {adminFilteredInventory.map(item => {
                    const percentage = (item.quantity / item.maxQuantity) * 100;
                    const status = item.quantity === 0 ? 'หมด' : percentage <= 30 ? 'ใกล้หมด' : 'มี';

                    return (
                      <div key={item.id} className={styles.itemCardDark}>
                        <div className={styles.itemCardHeader}>
                          <div className={styles.itemIconWrapper}>
                            <Package size={24} />
                          </div>
                          <div className={`${styles.itemStatusBadgeSmall} ${status === 'มี' ? '' : status === 'ใกล้หมด' ? styles.badgeWarning : styles.badgeCritical}`} style={{
                            backgroundColor: status === 'มี' ? 'rgba(34, 197, 94, 0.1)' : status === 'ใกล้หมด' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                            color: status === 'มี' ? '#22c55e' : status === 'ใกล้หมด' ? '#f59e0b' : '#ef4444'
                          }}>
                            {status}
                          </div>
                        </div>

                        <h3 className={styles.itemTitleDark}>{item.name}</h3>
                        <p className={styles.itemCategoryDark}>{item.categoryLabel}</p>

                        <div className={styles.itemStatsContainer}>
                          <div>
                            <span className={styles.itemMainQty}>{item.quantity}</span>
                            <span className={styles.itemSubQty}> / {item.maxQuantity} {item.unit}</span>
                          </div>
                          <div className={styles.itemPercentage}>{Math.round(percentage)}%</div>
                        </div>

                        <div className={styles.inventoryProgressBar}>
                          <div
                            className={styles.inventoryProgressFill}
                            style={{
                              width: `${Math.min(percentage, 100)}%`,
                              backgroundColor: status === 'มี' ? '#22c55e' : status === 'ใกล้หมด' ? '#f59e0b' : '#ef4444'
                            }}
                          ></div>
                        </div>

                        <div className={styles.itemFooterStatus}>สถานะ: {status}</div>
                      </div>
                    );
                  })}
                </div>

                {adminFilteredInventory.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '48px', color: '#868e96' }}>
                    ไม่พบข้อมูลที่ค้นหา
                  </div>
                )}
              </div>
            )}

            {activeTab === 'distribution' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', animation: 'fadeIn 0.4s ease-out' }}>
                <div className={styles.chartCard}>
                  <div className={styles.chartHeader}>
                    <div>
                      <h3 className={styles.chartTitle}>ติดตามการกระจายสิ่งของ (Distribution Tracking)</h3>
                      <p style={{ color: '#868e96', fontSize: '14px' }}>ตรวจสอบสถานะการส่งมอบของไปยังศูนย์พักพิงต่างๆ</p>
                    </div>
                    <button
                      onClick={() => handleAction('ออกใบส่งของใหม่')}
                      className={styles.approveBtn}
                      style={{ backgroundColor: '#4361ee' }}
                    >
                      + ออกใบส่งของใหม่
                    </button>
                  </div>

                  <div className={styles.tableContainer} style={{ marginTop: '24px' }}>
                    <table className={styles.customTable}>
                      <thead>
                        <tr>
                          <th>เลขอ้างอิง</th>
                          <th>ปลายทาง (ศูนย์พักพิง)</th>
                          <th>รายการ</th>
                          <th>ผู้รับผิดชอบ</th>
                          <th>สถานะปัจจุบัน</th>
                          <th>จัดการ</th>
                        </tr>
                      </thead>
                      <tbody>
                        {distributionTasks.map(task => (
                          <tr key={task.id}>
                            <td style={{ color: '#868e96' }}>{task.id}</td>
                            <td style={{ fontWeight: '600' }}>{task.shelter}</td>
                            <td>{task.items}</td>
                            <td>{task.staff}</td>
                            <td>
                              <span className={`${styles.statusBadge} ${task.status === 'delivered' ? styles.badgeNormal :
                                task.status === 'shipping' ? styles.badgeWarning : styles.badgeCritical
                                }`}>
                                {task.status === 'delivered' ? 'ส่งแล้ว' : task.status === 'shipping' ? 'อยู่ระหว่างส่ง' : 'กำลังเตรียม'}
                              </span>
                            </td>
                            <td>
                              <button
                                onClick={() => handleShowDistDetails(task.id)}
                                style={{ background: 'none', border: 'none', color: '#4361ee', cursor: 'pointer', fontSize: '14px', textDecoration: 'underline' }}
                              >
                                รายละเอียด
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Modal รายละเอียดการกระจายสิ่งของ */}
                {isDistModalOpen && selectedDistId && distributionDetails[selectedDistId] && (
                  <div className={styles.modalOverlay}>
                    <div className={styles.modalContent} style={{ maxWidth: '600px' }}>
                      <div className={styles.modalHeader}>
                        <div>
                          <h3 className={styles.modalTitle}>รายละเอียดการส่งมอบ: {selectedDistId}</h3>
                          <div style={{ fontSize: '13px', color: '#868e96', marginTop: '4px' }}>
                            ปลายทาง: {distributionTasks.find((t: any) => t.id === selectedDistId)?.shelter}
                          </div>
                        </div>
                        <button onClick={() => setIsDistModalOpen(false)} className={styles.closeBtn}>
                          <X size={20} />
                        </button>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                        {/* Items Section */}
                        <div style={{ flex: 1 }}>
                          <h4 className={styles.formLabel} style={{ marginBottom: '16px', color: '#212529', borderBottom: '2px solid #f1f3f5', paddingBottom: '8px' }}>
                            รายการสิ่งของ
                          </h4>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {distributionDetails[selectedDistId].itemsList.map((item: any, idx: number) => (
                              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                                <span style={{ color: '#495057' }}>{item.name}</span>
                                <span style={{ fontWeight: '600' }}>{item.qty} {item.unit}</span>
                              </div>
                            ))}
                          </div>

                          <div style={{ marginTop: '32px', padding: '16px', backgroundColor: '#f8f9fa', borderRadius: '12px' }}>
                            <div style={{ fontSize: '12px', color: '#868e96', marginBottom: '8px' }}>ผู้รับผิดชอบการขนส่ง</div>
                            <div style={{ fontWeight: '600', color: '#212529' }}>{distributionDetails[selectedDistId].driver}</div>
                            <div style={{ fontSize: '13px', color: '#4361ee', marginTop: '4px' }}>📞 {distributionDetails[selectedDistId].phone}</div>
                          </div>
                        </div>

                        {/* Timeline Section */}
                        <div style={{ flex: 1 }}>
                          <h4 className={styles.formLabel} style={{ marginBottom: '16px', color: '#212529', borderBottom: '2px solid #f1f3f5', paddingBottom: '8px' }}>
                            ประวัติสถานะ (Timeline)
                          </h4>
                          <div className={styles.timelineCompact}>
                            {distributionDetails[selectedDistId].timeline.map((step: any, idx: number) => (
                              <div key={idx} className={styles.timelineItemCompact}>
                                <div className={styles.timelineDotCompact} style={{
                                  backgroundColor: idx === distributionDetails[selectedDistId].timeline.length - 1 ? '#4361ee' : '#dee2e6'
                                }}></div>
                                <div style={{ marginBottom: idx !== distributionDetails[selectedDistId].timeline.length - 1 ? '16px' : '0' }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '13px', fontWeight: '700' }}>{step.status}</span>
                                    <span style={{ fontSize: '11px', color: '#adb5bd' }}>{step.time}</span>
                                  </div>
                                  <div style={{ fontSize: '12px', color: '#868e96', marginTop: '2px' }}>{step.desc}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className={styles.modalActions}>
                        <button onClick={() => setIsDistModalOpen(false)} className={styles.cancelBtn} style={{ flex: 1 }}>ปิดหน้าต่าง</button>
                        <button
                          onClick={() => { alert('กำลังออกใบกำกับสินค้าซ้ำ...'); setIsDistModalOpen(false); }}
                          className={styles.saveBtn}
                          style={{ flex: 1, backgroundColor: '#000', color: '#fff' }}
                        >
                          พิมพ์ใบส่งของ
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div className={styles.chartsGrid}>
                  <div className={styles.chartCard} style={{ flex: '1' }}>
                    <h3 className={styles.chartTitle} style={{ marginBottom: '20px' }}>ตัวอย่างกระบวนการส่งมอบ (Active Timeline)</h3>
                    <div className={styles.timeline}>
                      <div className={styles.timelineItem}>
                        <div className={`${styles.timelineDot} ${styles.dotSuccess}`}></div>
                        <div style={{ fontWeight: '600' }}>ยืนยันคำร้อง (10:00 น.)</div>
                        <div style={{ fontSize: '13px', color: '#868e96' }}>คำร้อง REQ-001 ได้รับการอนุมัติ</div>
                      </div>
                      <div className={styles.timelineItem}>
                        <div className={`${styles.timelineDot} ${styles.dotSuccess}`}></div>
                        <div style={{ fontWeight: '600' }}>จัดเตรียมของ (10:30 น.)</div>
                        <div style={{ fontSize: '13px', color: '#868e96' }}>บรรจุลงหีบห่อ ณ คลังกลาง กทม.</div>
                      </div>
                      <div className={styles.timelineItem}>
                        <div className={`${styles.timelineDot} ${styles.dotActive}`}></div>
                        <div style={{ fontWeight: '600' }}>อยู่ระหว่างขนส่ง (14:00 น.)</div>
                        <div style={{ fontSize: '13px', color: '#868e96' }}>รถขนส่งหมายเลขทะเบียน 88-xxxx กำลังมุ่งหน้าอุบลฯ</div>
                      </div>
                      <div className={styles.timelineItem}>
                        <div className={styles.timelineDot}></div>
                        <div style={{ fontWeight: '600', color: '#ced4da' }}>ยืนยันการรับของ</div>
                        <div style={{ fontSize: '13px', color: '#dee2e6' }}>รอรหัสยืนยันจากปลายทาง</div>
                      </div>
                    </div>
                  </div>

                  <div className={styles.chartCard} style={{ flex: '1' }}>
                    <h3 className={styles.chartTitle} style={{ marginBottom: '20px' }}>สถิติการส่งมอบรายวัน</h3>
                    <div style={{ height: '200px' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={[
                          { name: '08:00', val: 5 },
                          { name: '10:00', val: 12 },
                          { name: '12:00', val: 8 },
                          { name: '14:00', val: 15 },
                          { name: '16:00', val: 7 },
                        ]}>
                          <Line type="monotone" dataKey="val" stroke="#4361ee" strokeWidth={3} dot={{ r: 4 }} />
                          <Tooltip />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    <p style={{ fontSize: '12px', color: '#868e96', textAlign: 'center', marginTop: '12px' }}>จำนวนเที่ยวรถขนส่งที่ปล่อยออกจากคลังรายชั่วโมง</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'suppliers' && (
              <div className={styles.chartCard} style={{ animation: 'fadeIn 0.4s ease-out' }}>
                <div className={styles.chartHeader}>
                  <div>
                    <h3 className={styles.chartTitle}>จัดการข้อมูลผู้ส่งมอบ / หน่วยงานพันธมิตร</h3>
                    <p style={{ color: '#868e96', fontSize: '14px' }}>รวบรวมรายชื่อผู้บริจาคและซัพพลายเออร์เพื่อความรวดเร็วในการจัดหา</p>
                  </div>
                  <button
                    onClick={handleOpenAddSupplier}
                    className={styles.approveBtn}
                    style={{ backgroundColor: '#4361ee' }}
                  >
                    + เพิ่มผู้ส่งมอบใหม่
                  </button>
                </div>

                <div className={styles.tableContainer} style={{ marginTop: '24px' }}>
                  <table className={styles.customTable}>
                    <thead>
                      <tr>
                        <th>ชื่อหน่วยงาน</th>
                        <th>ประเภท</th>
                        <th>สิ่งของที่สนับสนุน</th>
                        <th>ผู้ติดต่อ</th>
                        <th>เบอร์โทรศัพท์</th>
                        <th>จัดการ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {managedSuppliers.map(sup => (
                        <tr key={sup.id}>
                          <td style={{ fontWeight: '600' }}>{sup.name}</td>
                          <td>
                            <span className={`${styles.statusBadge} ${sup.type === 'Donor' ? styles.badgeNormal : styles.badgeWarning}`}>
                              {sup.type === 'Donor' ? 'ผู้บริจาค' : 'พันธมิตร/คู่ค้า'}
                            </span>
                          </td>
                          <td>{sup.items}</td>
                          <td>{sup.contact}</td>
                          <td style={{ color: '#4361ee' }}>{sup.phone}</td>
                          <td>
                            <button
                              onClick={() => handleOpenEditSupplier(sup)}
                              style={{ background: 'none', border: 'none', color: '#4361ee', cursor: 'pointer', fontSize: '14px' }}
                            >
                              แก้ไข
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Modal เพิ่ม/แก้ไข ผู้ส่งมอบ */}
                {isSupplierModalOpen && (
                  <div className={styles.modalOverlay}>
                    <div className={styles.modalContent} style={{ maxWidth: '450px' }}>
                      <div className={styles.modalHeader}>
                        <h3 className={styles.modalTitle}>{isEditingSupplier ? 'แก้ไขข้อมูลผู้ส่งมอบ' : 'เพิ่มผู้ส่งมอบใหม่'}</h3>
                        <button onClick={() => setIsSupplierModalOpen(false)} className={styles.closeBtn}>
                          <X size={20} />
                        </button>
                      </div>

                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>ชื่อหน่วยงาน/บริษัท *</label>
                        <input
                          type="text"
                          className={styles.formInput}
                          value={supplierFormData.name}
                          onChange={(e) => setSupplierFormData({ ...supplierFormData, name: e.target.value })}
                          placeholder="ชื่อเต็มของหน่วยงาน"
                        />
                      </div>

                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>ประเภท</label>
                        <select
                          className={styles.formInput}
                          value={supplierFormData.type}
                          onChange={(e) => setSupplierFormData({ ...supplierFormData, type: e.target.value })}
                        >
                          <option value="Donor">ผู้บริจาค</option>
                          <option value="Partner">พันธมิตร/คู่ค้า</option>
                        </select>
                      </div>

                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>สิ่งของที่สนับสนุน</label>
                        <input
                          type="text"
                          className={styles.formInput}
                          value={supplierFormData.items}
                          onChange={(e) => setSupplierFormData({ ...supplierFormData, items: e.target.value })}
                          placeholder="เช่น น้ำดื่ม, ข้าวสาร, ยา"
                        />
                      </div>

                      <div style={{ display: 'flex', gap: '16px' }}>
                        <div className={styles.formGroup} style={{ flex: 1 }}>
                          <label className={styles.formLabel}>ชื่อผู้ติดต่อ</label>
                          <input
                            type="text"
                            className={styles.formInput}
                            value={supplierFormData.contact}
                            onChange={(e) => setSupplierFormData({ ...supplierFormData, contact: e.target.value })}
                          />
                        </div>
                        <div className={styles.formGroup} style={{ flex: 1 }}>
                          <label className={styles.formLabel}>เบอร์โทรศัพท์</label>
                          <input
                            type="text"
                            className={styles.formInput}
                            value={supplierFormData.phone}
                            onChange={(e) => setSupplierFormData({ ...supplierFormData, phone: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className={styles.modalActions}>
                        <button onClick={() => setIsSupplierModalOpen(false)} className={styles.cancelBtn}>ยกเลิก</button>
                        <button onClick={handleSaveSupplier} className={styles.saveBtn}>
                          {isEditingSupplier ? 'บันทึกการแก้ไข' : 'เพิ่มรายการใหม่'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'logs' && (
              <div className={styles.chartCard} style={{ animation: 'fadeIn 0.4s ease-out' }}>
                <div className={styles.chartHeader}>
                  <div>
                    <h3 className={styles.chartTitle}>ประวัติการอนุมัติคำร้องขอสิ่งของ</h3>
                    <p style={{ color: '#868e96', fontSize: '14px' }}>รายการคำร้องที่ผ่านการอนุมัติและเตรียมจัดส่งแล้ว</p>
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ padding: '8px 16px', backgroundColor: '#e7f5ff', borderRadius: '8px', textAlign: 'center' }}>
                      <div style={{ fontSize: '10px', color: '#1971c2', fontWeight: 'bold', textTransform: 'uppercase' }}>อนุมัติแล้วรวม</div>
                      <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#1971c2' }}>{approvedRequests.length}</div>
                    </div>
                  </div>
                </div>

                <div className={styles.tableContainer} style={{ marginTop: '24px' }}>
                  <table className={styles.customTable}>
                    <thead>
                      <tr>
                        <th>วัน-เวลาที่อนุมัติ</th>
                        <th>หน่วยงานที่ขอ</th>
                        <th>รายการสิ่งของ</th>
                        <th>ผู้ขอ (หน่วยงาน)</th>
                        <th>สถานะ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {approvedRequests.length > 0 ? (
                        approvedRequests.map(req => (
                          <tr key={req._id}>
                            <td style={{ fontSize: '13px', color: '#868e96' }}>
                              {new Date(req.updatedAt || req.createdAt).toLocaleString('th-TH')}
                            </td>
                            <td style={{ fontWeight: '600' }}>{req.shelterId?.name || 'Unknown'}</td>
                            <td>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                {req.items.map((item, idx) => (
                                  <span key={idx} style={{ fontSize: '12px', padding: '2px 8px', backgroundColor: '#f1f3f5', borderRadius: '4px' }}>
                                    {item.itemId?.name} ({item.quantityRequested} {item.itemId?.unit})
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td>{req.requestedBy?.name}</td>
                            <td>
                              <span className={`${styles.statusBadge} ${styles.badgeNormal}`} style={{ backgroundColor: '#e7f5ff', color: '#1d3557' }}>
                                <ThumbsUp size={12} style={{ marginRight: '4px' }} /> อนุมัติแล้ว
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: '#adb5bd' }}>
                            ไม่มีประวัติการอนุมัติในขณะนี้
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'requests' && (
              <div className={styles.chartCard} style={{ animation: 'fadeIn 0.4s ease-out' }}>
                <div className={styles.chartHeader}>
                  <div>
                    <h3 className={styles.chartTitle}>รายการคำร้องที่รอการอนุมัติ</h3>
                    <p style={{ color: '#868e96', fontSize: '14px' }}>ตรวจสอบและพิจารณาคำขอสิ่งของเร่งด่วนจากศูนย์พักพิงต่างๆ</p>
                  </div>
                  <div style={{ padding: '8px 16px', backgroundColor: '#fff9db', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '10px', color: '#f08c00', fontWeight: 'bold', textTransform: 'uppercase' }}>รออนุมัติ</div>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#f08c00' }}>{requests.length}</div>
                  </div>
                </div>

                <div className={styles.tableContainer} style={{ marginTop: '24px' }}>
                  <table className={styles.customTable}>
                    <thead>
                      <tr>
                        <th>วัน-เวลาที่ขอ</th>
                        <th>ศูนย์พักพิง</th>
                        <th>รายการสิ่งของ</th>
                        <th>ผู้ขอ</th>
                        <th>เหตุผล/ความจำเป็น</th>
                        <th>จัดการ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {requests.length > 0 ? (
                        requests.map(req => (
                          <tr key={req._id}>
                            <td style={{ fontSize: '13px', color: '#868e96' }}>
                              {new Date(req.createdAt).toLocaleString('th-TH')}
                            </td>
                            <td style={{ fontWeight: '600' }}>{req.shelterId?.name || 'Unknown'}</td>
                            <td>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                {req.items.map((item, idx) => (
                                  <span key={idx} style={{ fontSize: '12px', padding: '2px 8px', backgroundColor: '#f8f9fa', borderRadius: '4px', border: '1px solid #dee2e6' }}>
                                    {item.itemId?.name} ({item.quantityRequested} {item.itemId?.unit})
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td>{req.requestedBy?.name || 'N/A'}</td>
                            <td style={{ fontSize: '13px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {req.reason || '-'}
                            </td>
                            <td>
                              <button
                                onClick={() => handleApprove(req._id)}
                                className={styles.approveBtn}
                                style={{ padding: '6px 12px', fontSize: '13px' }}
                              >
                                อนุมัติ
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#adb5bd' }}>
                            ไม่มีคำร้องที่รอการอนุมัติในขณะนี้
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
                <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px', color: '#343a40' }}>ตั้งค่าระบบ (Settings)</h2>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                  {/* Profile Settings */}
                  <div className={styles.chartCard}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                      <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#e7f5ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <UserCheck size={32} color="#339af0" />
                      </div>
                      <div>
                        <h3 className={styles.chartTitle} style={{ marginBottom: '4px' }}>ข้อมูลส่วนตัว</h3>
                        <p style={{ fontSize: '14px', color: '#868e96' }}>จัดการข้อมูลบัญชีของคุณ</p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#495057', marginBottom: '6px' }}>ชื่อ-นามสกุล</label>
                        <input type="text" defaultValue="Admin User" className={styles.filterInput} style={{ width: '100%' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#495057', marginBottom: '6px' }}>อีเมล</label>
                        <input type="email" defaultValue="admin@materially.com" className={styles.filterInput} style={{ width: '100%' }} disabled />
                      </div>
                      <button className={styles.approveBtn} style={{ marginTop: '8px', backgroundColor: '#339af0' }}>บันทึกข้อมูล</button>
                    </div>
                  </div>

                  {/* System Preferences */}
                  <div className={styles.chartCard}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                      <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#fff4e6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Settings size={32} color="#fd7e14" />
                      </div>
                      <div>
                        <h3 className={styles.chartTitle} style={{ marginBottom: '4px' }}>การตั้งค่าระบบ</h3>
                        <p style={{ fontSize: '14px', color: '#868e96' }}>ปรับแต่งการทำงานของระบบ</p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f1f3f5' }}>
                        <div>
                          <div style={{ fontWeight: '500', fontSize: '14px' }}>โหมดมืด (Dark Mode)</div>
                          <div style={{ fontSize: '12px', color: '#adb5bd' }}>ใช้งานธีมสีเข้ม</div>
                        </div>
                        <div style={{ width: '40px', height: '20px', backgroundColor: '#e9ecef', borderRadius: '10px', position: 'relative' }}>
                          <div style={{ width: '16px', height: '16px', backgroundColor: 'white', borderRadius: '50%', position: 'absolute', top: '2px', left: '2px', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}></div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f1f3f5' }}>
                        <div>
                          <div style={{ fontWeight: '500', fontSize: '14px' }}>การแจ้งเตือนเสียง</div>
                          <div style={{ fontSize: '12px', color: '#adb5bd' }}>เล่นเสียงเมื่อมีคำขอใหม่</div>
                        </div>
                        <div style={{ width: '40px', height: '20px', backgroundColor: '#40c057', borderRadius: '10px', position: 'relative' }}>
                          <div style={{ width: '16px', height: '16px', backgroundColor: 'white', borderRadius: '50%', position: 'absolute', top: '2px', right: '2px', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Security & Backup */}
                  <div className={styles.chartCard} style={{ gridColumn: '1 / -1' }}>
                    <h3 className={styles.chartTitle} style={{ marginBottom: '20px' }}>ความปลอดภัยและการสำรองข้อมูล</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                      <div style={{ padding: '24px', border: '1px solid #dee2e6', borderRadius: '8px', textAlign: 'center' }}>
                        <ShieldCheck size={32} color="#40c057" style={{ marginBottom: '12px' }} />
                        <div style={{ fontWeight: '600', marginBottom: '8px' }}>เปลี่ยนรหัสผ่าน</div>
                        <button className={styles.navItem} style={{ width: '100%', justifyContent: 'center', border: '1px solid #dee2e6' }}>แก้ไข</button>
                      </div>
                      <div style={{ padding: '24px', border: '1px solid #dee2e6', borderRadius: '8px', textAlign: 'center' }}>
                        <Database size={32} color="#339af0" style={{ marginBottom: '12px' }} />
                        <div style={{ fontWeight: '600', marginBottom: '8px' }}>สำรองฐานข้อมูล</div>
                        <button className={styles.navItem} style={{ width: '100%', justifyContent: 'center', border: '1px solid #dee2e6' }}>Backup Now</button>
                      </div>
                      <div style={{ padding: '24px', border: '1px solid #dee2e6', borderRadius: '8px', textAlign: 'center' }}>
                        <FileText size={32} color="#fab005" style={{ marginBottom: '12px' }} />
                        <div style={{ fontWeight: '600', marginBottom: '8px' }}>Activity Logs</div>
                        <button className={styles.navItem} style={{ width: '100%', justifyContent: 'center', border: '1px solid #dee2e6' }}>ดูประวัติ</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {/* Modal รายละเอียดการแจ้งเตือน */}
            {isAlertModalOpen && selectedAlertId && (
              <div className={styles.modalOverlay}>
                {(() => {
                  const activeAlert = notifications.find(n => n.id === selectedAlertId);
                  const shelter = shelters.find(s => s._id === (activeAlert as any)?.shelterId);

                  return (
                    <div className={styles.modalContent} style={{ maxWidth: '500px' }}>
                      <div className={styles.modalHeader}>
                        <div>
                          <div style={{
                            display: 'inline-block',
                            padding: '4px 12px',
                            borderRadius: '20px',
                            fontSize: '11px',
                            fontWeight: 'bold',
                            textTransform: 'uppercase',
                            backgroundColor: activeAlert?.type === 'critical' ? '#fff5f5' : '#e7f5ff',
                            color: activeAlert?.type === 'critical' ? '#fa5252' : '#339af0',
                            marginBottom: '8px'
                          }}>
                            {activeAlert?.type === 'critical' ? 'วิกฤต (Critical)' : 'แจ้งเตือน (Alert)'}
                          </div>
                          <h3 className={styles.modalTitle}>{activeAlert?.msg ? activeAlert.msg.split(':')[0] : 'แจ้งเตือน'}</h3>
                        </div>
                        <button onClick={() => setIsAlertModalOpen(false)} className={styles.closeBtn}>
                          <X size={20} />
                        </button>
                      </div>

                      <div style={{ marginBottom: '24px', padding: '16px', backgroundColor: '#f8f9fa', borderRadius: '12px' }}>
                        <div style={{ fontWeight: '700', fontSize: '15px', color: '#212529', marginBottom: '4px' }}>ข้อความแจ้งเตือน:</div>
                        <div style={{ fontSize: '14px', color: '#495057' }}>{activeAlert?.msg}</div>
                      </div>

                      {shelter ? (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '32px' }}>
                          <div>
                            <div style={{ fontSize: '12px', color: '#868e96', marginBottom: '4px' }}>ประชากรในศูนย์</div>
                            <div style={{ fontWeight: '600', fontSize: '18px' }}>{shelter.currentPeople} / {shelter.capacity}</div>
                            <div className={styles.progressBarOuter} style={{ height: '6px', marginTop: '8px' }}>
                              <div className={styles.progressBarInner} style={{
                                width: `${(shelter.currentPeople / (shelter.capacity || 1)) * 100}%`,
                                backgroundColor: (shelter.currentPeople / (shelter.capacity || 1)) >= 0.9 ? '#fa5252' : '#fab005'
                              }}></div>
                            </div>
                          </div>
                          <div>
                            <div style={{ fontSize: '12px', color: '#868e96', marginBottom: '4px' }}>เบอร์ผู้ประสานงาน</div>
                            <div style={{ fontWeight: '600', fontSize: '16px', color: '#4361ee' }}>📞 {shelter.contactPhone}</div>
                            <div style={{ fontSize: '11px', color: '#adb5bd', marginTop: '4px' }}>จังหวัด: {shelter.province}</div>
                          </div>
                        </div>
                      ) : (
                        <div style={{ marginBottom: '32px', padding: '16px', textAlign: 'center', border: '1px dashed #dee2e6', borderRadius: '8px', color: '#868e96' }}>
                          <Package size={24} style={{ marginBottom: '8px', opacity: 0.5 }} />
                          <div>เป็นการแจ้งเตือนระบบทั่วไป</div>
                        </div>
                      )}

                      <div className={styles.modalActions}>
                        <button onClick={() => setIsAlertModalOpen(false)} className={styles.cancelBtn} style={{ flex: 1 }}>ปิด</button>
                        {activeAlert?.type === 'critical' && (
                          <button
                            onClick={() => { alert('กำลังประสานงานคลังสินค้าเพื่อส่งของเร่งด่วน...'); setIsAlertModalOpen(false); }}
                            className={styles.saveBtn}
                            style={{ flex: 2, backgroundColor: '#fa5252' }}
                          >
                            จัดส่งสิ่งของด่วนที่สุด
                          </button>
                        )}
                        {activeAlert?.type === 'request' && (
                          <button
                            onClick={() => { setActiveTab('requests'); setIsAlertModalOpen(false); }}
                            className={styles.saveBtn}
                            style={{ flex: 2 }}
                          >
                            ไปยังหน้าการกระจายของ
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </div >
      </main >
    </div >
  );
}
