"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  BarChart3, Users, Home, Package, AlertCircle,
  LogOut, Menu, X, Bell, Search,
  FileText, ClipboardList, LayoutDashboard, Edit3, Check, XCircle, Upload, FileSpreadsheet, Download
} from 'lucide-react';
import * as XLSX from 'xlsx';
import {
  LineChart, Line, PieChart, Pie, Cell,
  Tooltip, ResponsiveContainer
} from 'recharts';
import styles from './admin.module.css';
import {
  getDashboardOverview, getShelterStatus, getRequests, getLowStockItems,
  getItems, getUsers, isAuthenticated, getCurrentUser,
  logout, approveRequest, transferRequest, getShelters, getDistributionTasks,
  getWarehouses, getStockStatus, getRequestDetail, updateStock, bulkImportInventory,
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

  // Edit Request Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingRequest, setEditingRequest] = useState<Request | null>(null);
  const [editedQuantities, setEditedQuantities] = useState<{[itemId: string]: number}>({});

  // Excel Upload Modal State (Shelters)
  const [excelModalOpen, setExcelModalOpen] = useState(false);
  const [excelData, setExcelData] = useState<any[]>([]);
  const [excelFileName, setExcelFileName] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Excel Upload Modal State (Inventory)
  const [inventoryExcelModalOpen, setInventoryExcelModalOpen] = useState(false);
  const [inventoryExcelData, setInventoryExcelData] = useState<any[]>([]);
  const [inventoryExcelFileName, setInventoryExcelFileName] = useState('');
  const [isUploadingInventory, setIsUploadingInventory] = useState(false);

  // Add Stock Modal State
  const [addStockModalOpen, setAddStockModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<{id: string; name: string; quantity: number; unit: string} | null>(null);
  const [addQuantity, setAddQuantity] = useState(0);
  const [isAddingStock, setIsAddingStock] = useState(false);

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
        transferredRequestsRes,
        usersRes,
        stockRes // Added stockRes
      ] = await Promise.all([
        getDashboardOverview(),
        getShelterStatus(),
        getRequests('pending'),
        getRequests('approved'),
        getRequests('transferred'),
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
      // Combine approved and transferred requests for history
      const approved = approvedRequestsRes.success ? (approvedRequestsRes.data || []) : [];
      const transferred = transferredRequestsRes.success ? (transferredRequestsRes.data || []) : [];
      const allApprovedHistory = [...approved, ...transferred].sort(
        (a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime()
      );
      setApprovedRequests(allApprovedHistory);
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

  // เปิด Modal แก้ไขจำนวน
  const handleOpenEditModal = async (request: Request) => {
    // ตั้งค่า quantities เริ่มต้นจากที่ขอมา
    const initialQuantities: {[itemId: string]: number} = {};
    request.items.forEach(item => {
      const itemId = typeof item.itemId === 'object' ? item.itemId._id : item.itemId;
      initialQuantities[itemId] = item.quantityRequested;
    });
    setEditedQuantities(initialQuantities);
    setEditingRequest(request);
    setEditModalOpen(true);
  };

  // อัพเดทจำนวนใน Modal
  const handleQuantityChange = (itemId: string, quantity: number) => {
    setEditedQuantities(prev => ({
      ...prev,
      [itemId]: Math.max(1, quantity) // ต้องมีอย่างน้อย 1
    }));
  };

  // อนุมัติด้วยจำนวนที่แก้ไข
  const handleApproveWithEditedQuantity = async () => {
    if (!editingRequest) return;
    if (!confirm('ยืนยันการอนุมัติและโอนของ? (Stock จะถูกตัดออกจากคลังทันที)')) return;

    try {
      const warehousesRes = await getWarehouses();
      if (!warehousesRes.success || !warehousesRes.data || warehousesRes.data.length === 0) {
        alert('ไม่พบข้อมูลคลังสินค้า');
        return;
      }

      const mainWarehouse = warehousesRes.data.find(w => w._id === '69480e65cfe460b6bd8ecc2b');
      const warehouseId = mainWarehouse?._id || warehousesRes.data[warehousesRes.data.length - 1]._id;

      // สร้าง items array ด้วยจำนวนที่แก้ไข
      const itemsToApprove = editingRequest.items.map(item => {
        const itemId = typeof item.itemId === 'object' ? item.itemId._id : item.itemId;
        return {
          itemId: itemId,
          quantityApproved: editedQuantities[itemId] || item.quantityRequested
        };
      });

      // ขั้นตอนที่ 1: อนุมัติ
      const approveResult = await approveRequest(editingRequest._id, itemsToApprove, warehouseId);
      if (!approveResult.success) {
        alert(approveResult.message || 'เกิดข้อผิดพลาดในการอนุมัติ');
        return;
      }

      // ขั้นตอนที่ 2: โอนของทันที
      const itemsToTransfer = editingRequest.items.map(item => {
        const itemId = typeof item.itemId === 'object' ? item.itemId._id : item.itemId;
        return {
          itemId: itemId,
          quantityTransferred: editedQuantities[itemId] || item.quantityRequested
        };
      });

      const transferResult = await transferRequest(editingRequest._id, itemsToTransfer, warehouseId);
      if (transferResult.success) {
        alert('✅ อนุมัติและโอนของเรียบร้อยแล้ว! Stock ถูกตัดออกจากคลัง');
        setEditModalOpen(false);
        setEditingRequest(null);
        fetchInitialData();
      } else {
        alert('อนุมัติสำเร็จ แต่โอนของไม่สำเร็จ: ' + (transferResult.message || 'เกิดข้อผิดพลาด'));
        setEditModalOpen(false);
        fetchInitialData();
      }
    } catch (error) {
      console.error('Approve error:', error);
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    }
  };

  const handleApprove = async (id: string) => {
    if (!confirm('ยืนยันการอนุมัติและโอนของ? (Stock จะถูกตัดออกจากคลังทันที)')) return;

    try {
      // ดึงข้อมูล request ใหม่จาก API เพื่อให้ได้ข้อมูลครบถ้วน
      const requestRes = await getRequestDetail(id);
      console.log('Request detail from API:', requestRes);

      if (!requestRes.success || !requestRes.data) {
        alert('ไม่พบคำร้องขอ');
        return;
      }

      const requestToApprove = requestRes.data;

      if (!requestToApprove.items || requestToApprove.items.length === 0) {
        alert('ไม่พบรายการสิ่งของในคำร้อง');
        return;
      }

      // ดึงรายการ warehouse
      const warehousesRes = await getWarehouses();
      if (!warehousesRes.success || !warehousesRes.data || warehousesRes.data.length === 0) {
        alert('ไม่พบข้อมูลคลังสินค้า');
        return;
      }

      // ใช้คลังกลางศรีสะเกษ (ID: 69480e65cfe460b6bd8ecc2b) หรือคลังสุดท้ายในรายการ
      // เพราะคลังนี้มี Stock หลัก
      const mainWarehouse = warehousesRes.data.find(w => w._id === '69480e65cfe460b6bd8ecc2b');
      const warehouseId = mainWarehouse?._id || warehousesRes.data[warehousesRes.data.length - 1]._id;

      // สร้าง items array จาก request โดยอนุมัติจำนวนที่ขอทั้งหมด
      const itemsToApprove = requestToApprove.items.map(item => {
        // Handle both cases: itemId as object or string
        let extractedItemId: string;
        if (typeof item.itemId === 'object' && item.itemId !== null) {
          extractedItemId = item.itemId._id;
        } else {
          extractedItemId = item.itemId as string;
        }

        console.log('Processing item:', item);
        console.log('Extracted itemId:', extractedItemId);

        return {
          itemId: extractedItemId,
          quantityApproved: item.quantityRequested
        };
      });

      // Validate items before sending
      const hasInvalidItems = itemsToApprove.some(i => !i.itemId || i.itemId === 'undefined');
      if (hasInvalidItems) {
        console.error('Invalid items detected:', itemsToApprove);
        alert('ข้อมูล items ไม่ถูกต้อง กรุณาลองใหม่');
        return;
      }

      console.log('Items to approve:', itemsToApprove);
      console.log('Warehouse ID:', warehouseId);

      // ขั้นตอนที่ 1: อนุมัติ
      const approveResult = await approveRequest(id, itemsToApprove, warehouseId);
      if (!approveResult.success) {
        alert(approveResult.message || 'เกิดข้อผิดพลาดในการอนุมัติ');
        return;
      }

      // ขั้นตอนที่ 2: โอนของทันที (Stock จะถูกตัด)
      const itemsToTransfer = requestToApprove.items.map(item => ({
        itemId: typeof item.itemId === 'object' ? item.itemId._id : item.itemId,
        quantityTransferred: item.quantityRequested
      }));

      const transferResult = await transferRequest(id, itemsToTransfer, warehouseId);
      if (transferResult.success) {
        alert('✅ อนุมัติและโอนของเรียบร้อยแล้ว! Stock ถูกตัดออกจากคลัง');
        fetchInitialData(); // Refresh data
      } else {
        alert('อนุมัติสำเร็จ แต่โอนของไม่สำเร็จ: ' + (transferResult.message || 'เกิดข้อผิดพลาด'));
        fetchInitialData();
      }
    } catch (error) {
      console.error('Approve & Transfer error:', error);
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    }
  };

  const handleTransfer = async (id: string) => {
    if (!confirm('ยืนยันการโอนสิ่งของ? (Stock จะถูกตัดออกจากคลัง)')) return;

    try {
      // หา request ที่ต้องการโอน (จาก approvedRequests)
      const requestToTransfer = approvedRequests.find(r => r._id === id);
      if (!requestToTransfer) {
        alert('ไม่พบคำร้องขอ');
        return;
      }

      // ดึงรายการ warehouse
      const warehousesRes = await getWarehouses();
      if (!warehousesRes.success || !warehousesRes.data || warehousesRes.data.length === 0) {
        alert('ไม่พบข้อมูลคลังสินค้า');
        return;
      }

      // ใช้คลังแรก
      const warehouseId = warehousesRes.data[0]._id;

      // สร้าง items array สำหรับ transfer
      const itemsToTransfer = requestToTransfer.items.map(item => ({
        itemId: typeof item.itemId === 'object' ? item.itemId._id : item.itemId,
        quantityTransferred: item.quantityApproved || item.quantityRequested
      }));

      const result = await transferRequest(id, itemsToTransfer, warehouseId);
      if (result.success) {
        alert('โอนสิ่งของเรียบร้อยแล้ว! Stock ถูกตัดออกจากคลัง');
        fetchInitialData(); // Refresh data
      } else {
        alert(result.message || 'เกิดข้อผิดพลาด');
      }
    } catch (error) {
      console.error('Transfer error:', error);
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

  // ฟังก์ชันอ่านไฟล์ Excel
  const handleExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setExcelFileName(file.name);
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const data = event.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        // Map column names to our format
        const mappedData = jsonData.map((row: any, index: number) => ({
          id: index + 1,
          name: row['ชื่อศูนย์พักพิง'] || row['name'] || row['ชื่อ'] || '',
          province: row['จังหวัด'] || row['province'] || '',
          district: row['อำเภอ'] || row['district'] || '',
          address: row['ที่อยู่'] || row['address'] || '',
          capacity: parseInt(row['ความจุทั้งหมด'] || row['capacity'] || row['ความจุ'] || 0),
          currentPeople: parseInt(row['จำนวนคนปัจจุบัน'] || row['currentPeople'] || row['จำนวนคน'] || 0),
          phone: row['เบอร์โทร'] || row['phone'] || row['โทรศัพท์'] || '',
          contactName: row['ผู้ติดต่อ'] || row['contactName'] || ''
        })).filter((item: any) => item.name); // กรองเฉพาะที่มีชื่อ
        
        setExcelData(mappedData);
      } catch (error) {
        console.error('Error reading Excel:', error);
        alert('ไม่สามารถอ่านไฟล์ได้ กรุณาตรวจสอบรูปแบบไฟล์');
      }
    };
    
    reader.readAsBinaryString(file);
  };

  // ฟังก์ชันบันทึกข้อมูลจาก Excel (ใช้ bulk API)
  const handleExcelSubmit = async () => {
    if (excelData.length === 0) {
      alert('ไม่มีข้อมูลที่จะบันทึก');
      return;
    }

    setIsUploading(true);

    try {
      // เตรียมข้อมูลสำหรับ bulk insert
      const sheltersToInsert = excelData.map(shelter => ({
        name: shelter.name,
        province: shelter.province,
        district: shelter.district,
        address: shelter.address,
        capacity: shelter.capacity,
        currentPeople: shelter.currentPeople,
        phone: shelter.phone,
        contactName: shelter.contactName,
        status: 'normal'
      }));

      const result = await fetch('/api/shelters/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('ndr_token')}`
        },
        body: JSON.stringify({ shelters: sheltersToInsert })
      });

      const data = await result.json();

      setIsUploading(false);

      if (result.ok && data.success) {
        alert(`✅ นำเข้าสำเร็จ ${data.data?.inserted || excelData.length} รายการ!`);
        setExcelModalOpen(false);
        setExcelData([]);
        setExcelFileName('');
        fetchInitialData();
      } else {
        alert(`❌ เกิดข้อผิดพลาด: ${data.message || 'ไม่สามารถนำเข้าข้อมูลได้'}`);
      }
    } catch (error) {
      setIsUploading(false);
      alert('❌ เกิดข้อผิดพลาดในการเชื่อมต่อ');
    }
  };

  // ฟังก์ชัน Export ข้อมูลศูนย์พักพิงเป็น Excel
  const handleExportExcel = () => {
    if (shelters.length === 0) {
      alert('ไม่มีข้อมูลที่จะส่งออก');
      return;
    }

    // แปลงข้อมูลเป็นรูปแบบที่ต้องการ
    const exportData = shelters.map((shelter: any, index: number) => ({
      'ลำดับ': index + 1,
      'ชื่อศูนย์พักพิง': shelter.name || '',
      'จังหวัด': shelter.province || '',
      'อำเภอ': shelter.district || '',
      'ที่อยู่': shelter.address || '',
      'ความจุทั้งหมด': shelter.capacity || 0,
      'จำนวนคนปัจจุบัน': shelter.currentPeople || 0,
      'สถานะ': shelter.status === 'critical' ? 'วิกฤต' : shelter.status === 'warning' ? 'ใกล้เต็ม' : 'ปกติ',
      'เบอร์โทร': shelter.phone || '',
      'ผู้ติดต่อ': shelter.contactName || ''
    }));

    // สร้าง workbook และ worksheet
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'ศูนย์พักพิง');

    // ปรับความกว้างคอลัมน์
    const colWidths = [
      { wch: 6 },   // ลำดับ
      { wch: 30 },  // ชื่อศูนย์
      { wch: 15 },  // จังหวัด
      { wch: 15 },  // อำเภอ
      { wch: 40 },  // ที่อยู่
      { wch: 12 },  // ความจุ
      { wch: 15 },  // จำนวนคน
      { wch: 10 },  // สถานะ
      { wch: 15 },  // เบอร์โทร
      { wch: 20 },  // ผู้ติดต่อ
    ];
    worksheet['!cols'] = colWidths;

    // ดาวน์โหลดไฟล์
    const fileName = `ศูนย์พักพิง_${new Date().toLocaleDateString('th-TH').replace(/\//g, '-')}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  // ฟังก์ชัน Handle Excel Upload สำหรับคลังสิ่งของ
  const handleInventoryExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setInventoryExcelFileName(file.name);

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws);

      // แปลงชื่อคอลัมน์ภาษาไทยเป็น key
      const mappedData = data.map((row: any) => ({
        name: row['ชื่อสิ่งของ'] || row['name'] || '',
        category: row['หมวดหมู่'] || row['category'] || 'other',
        quantity: parseInt(row['จำนวน'] || row['quantity'] || 0),
        unit: row['หน่วย'] || row['unit'] || 'ชิ้น',
        minAlert: parseInt(row['แจ้งเตือนเมื่อต่ำกว่า'] || row['minAlert'] || 10)
      }));

      setInventoryExcelData(mappedData);
    };
    reader.readAsBinaryString(file);
  };

  // ฟังก์ชัน Submit ข้อมูลสิ่งของจาก Excel ไป API
  const handleInventoryExcelSubmit = async () => {
    if (inventoryExcelData.length === 0) {
      alert('ไม่มีข้อมูลที่จะนำเข้า');
      return;
    }

    setIsUploadingInventory(true);

    try {
      // ดึง warehouseId แรก (หรือให้เลือกได้)
      const warehousesResult = await getWarehouses();
      if (!warehousesResult.success || !warehousesResult.data || warehousesResult.data.length === 0) {
        throw new Error('ไม่พบคลังสินค้าในระบบ');
      }
      const warehouseId = warehousesResult.data[0]._id;

      // เรียก API bulk ผ่าน proxy
      const result = await bulkImportInventory(warehouseId, inventoryExcelData);

      if (result.success) {
        const data = result.data;
        alert(`นำเข้าสำเร็จ ${data?.inserted || 0} รายการใหม่, อัพเดท ${data?.updated || 0} รายการ`);
        setInventoryExcelModalOpen(false);
        setInventoryExcelData([]);
        setInventoryExcelFileName('');
        // รีโหลดข้อมูล inventory
        await loadAdminInventory();
      } else {
        throw new Error(result.message || 'เกิดข้อผิดพลาด');
      }
    } catch (error: any) {
      alert('เกิดข้อผิดพลาด: ' + error.message);
    } finally {
      setIsUploadingInventory(false);
    }
  };

  // ฟังก์ชันเพิ่มจำนวนของในคลัง
  const handleAddStock = async () => {
    if (!selectedItem || addQuantity <= 0) {
      alert('กรุณาระบุจำนวนที่ต้องการเพิ่ม');
      return;
    }

    setIsAddingStock(true);

    try {
      // ดึง warehouseId แรก
      const warehousesResult = await getWarehouses();
      if (!warehousesResult.success || !warehousesResult.data || warehousesResult.data.length === 0) {
        throw new Error('ไม่พบคลังสินค้าในระบบ');
      }
      const warehouseId = warehousesResult.data[0]._id;

      // ดึง stock จริงของ warehouse นี้ก่อน
      const stockResult = await getStockStatus(warehouseId);
      let currentStockInWarehouse = 0;
      
      if (stockResult.success && stockResult.data?.items) {
        const stockItem = stockResult.data.items.find(
          (s: any) => s.itemId === selectedItem.id || s.itemId?._id === selectedItem.id
        );
        if (stockItem) {
          currentStockInWarehouse = stockItem.quantity || 0;
        }
      }

      // เรียก API เพิ่ม stock ผ่าน proxy (บวกจาก stock จริงของ warehouse นี้)
      const result = await updateStock(
        warehouseId,
        selectedItem.id,
        currentStockInWarehouse + addQuantity
      );

      if (result.success) {
        alert(`เพิ่มจำนวน ${selectedItem.name} สำเร็จ (+${addQuantity} ${selectedItem.unit})`);
        setAddStockModalOpen(false);
        setSelectedItem(null);
        setAddQuantity(0);
        // รีโหลดข้อมูล inventory ใหม่ (ไม่ reload หน้า)
        await loadAdminInventory();
      } else {
        throw new Error(result.message || 'เกิดข้อผิดพลาด');
      }
    } catch (error: any) {
      alert('เกิดข้อผิดพลาด: ' + error.message);
    } finally {
      setIsAddingStock(false);
    }
  };

  // ฟังก์ชัน Export ข้อมูลคลังสิ่งของเป็น Excel
  const handleExportInventoryExcel = () => {
    if (adminInventoryItems.length === 0) {
      alert('ไม่มีข้อมูลที่จะส่งออก');
      return;
    }

    // แปลงข้อมูลเป็นรูปแบบที่ต้องการ
    const exportData = adminInventoryItems.map((item, index) => ({
      'ลำดับ': index + 1,
      'ชื่อสิ่งของ': item.name || '',
      'หมวดหมู่': item.categoryLabel || '',
      'จำนวน': item.quantity || 0,
      'จำนวนสูงสุด': item.maxQuantity || 0,
      'หน่วย': item.unit || '',
      'เปอร์เซ็นต์': Math.round((item.quantity / item.maxQuantity) * 100) + '%',
      'สถานะ': item.quantity === 0 ? 'หมด' : (item.quantity / item.maxQuantity) * 100 <= 30 ? 'ใกล้หมด' : 'มี'
    }));

    // สร้าง workbook และ worksheet
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'คลังสิ่งของ');

    // ปรับความกว้างคอลัมน์
    const colWidths = [
      { wch: 6 },   // ลำดับ
      { wch: 25 },  // ชื่อสิ่งของ
      { wch: 20 },  // หมวดหมู่
      { wch: 10 },  // จำนวน
      { wch: 12 },  // จำนวนสูงสุด
      { wch: 10 },  // หน่วย
      { wch: 10 },  // เปอร์เซ็นต์
      { wch: 10 },  // สถานะ
    ];
    worksheet['!cols'] = colWidths;

    // ดาวน์โหลดไฟล์
    const fileName = `คลังสิ่งของ_${new Date().toLocaleDateString('th-TH').replace(/\//g, '-')}.xlsx`;
    XLSX.writeFile(workbook, fileName);
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

  // Load Admin Inventory Function
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

  // Load Admin Inventory Data on mount
  useEffect(() => {
    if (!isMounted) return;
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
            { icon: ClipboardList, label: 'ประวัติการอนุมัติ', id: 'logs' },
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
                            <div style={{ fontWeight: '600', fontSize: '14px' }}>{typeof req.shelterId === 'object' ? req.shelterId.name : req.shelterId || 'Unknown Shelter'}</div>
                            <div style={{ fontSize: '12px', color: '#868e96' }}>
                              {req.items.map(i => i.itemId?.name).join(', ')}
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                              onClick={() => handleOpenEditModal(req)}
                              style={{ 
                                padding: '4px 8px', 
                                fontSize: '12px',
                                backgroundColor: '#fff3bf',
                                color: '#e67700',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                              title="แก้ไขจำนวน"
                            >
                              <Edit3 size={12} />
                            </button>
                            <button
                              onClick={() => handleApprove(req._id)}
                              className={styles.approveBtn}
                            >
                              <Package size={14} style={{ marginRight: '4px' }} /> อนุมัติ & โอนของ
                            </button>
                          </div>
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
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => setExcelModalOpen(true)}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#40c057',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '14px',
                        fontWeight: '500'
                      }}
                    >
                      <FileSpreadsheet size={16} /> นำเข้าจาก Excel
                    </button>
                    <button
                      onClick={handleExportExcel}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#228be6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '14px',
                        fontWeight: '500'
                      }}
                    >
                      <Download size={16} /> ส่งออก Excel
                    </button>
                    <button
                      onClick={() => setIsShelterModalOpen(true)}
                      className={styles.approveBtn}
                      style={{ backgroundColor: '#4361ee' }}
                    >
                      + เพิ่มศูนย์ใหม่
                    </button>
                  </div>
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

                {/* Excel Import/Export Buttons */}
                <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                  <button
                    onClick={() => setInventoryExcelModalOpen(true)}
                    className={styles.approveBtn}
                    style={{ backgroundColor: '#22c55e', display: 'flex', alignItems: 'center', gap: '8px' }}
                  >
                    <Upload size={18} />
                    นำเข้าจาก Excel
                  </button>
                  <button
                    onClick={handleExportInventoryExcel}
                    className={styles.approveBtn}
                    style={{ backgroundColor: '#3b82f6', display: 'flex', alignItems: 'center', gap: '8px' }}
                  >
                    <Download size={18} />
                    ส่งออก Excel
                  </button>
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

                        <div style={{ marginTop: '16px', marginBottom: '16px' }}>
                          <span style={{ fontSize: '28px', fontWeight: '700', color: '#495057' }}>{item.quantity}</span>
                          <span style={{ fontSize: '14px', color: '#868e96', marginLeft: '6px' }}>{item.unit}</span>
                        </div>

                        <button
                          onClick={() => {
                            setSelectedItem({ id: item.id, name: item.name, quantity: item.quantity, unit: item.unit });
                            setAddQuantity(0);
                            setAddStockModalOpen(true);
                          }}
                          style={{
                            width: '100%',
                            padding: '10px',
                            backgroundColor: '#4361ee',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '500',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px'
                          }}
                        >
                          <Package size={16} />
                          เพิ่มจำนวน
                        </button>
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
                            <td style={{ fontWeight: '600' }}>{typeof req.shelterId === 'object' ? req.shelterId?.name : req.shelterId || 'Unknown'}</td>
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
                              <span className={`${styles.statusBadge} ${styles.badgeNormal}`} style={{
                                backgroundColor: '#d3f9d8',
                                color: '#2b8a3e'
                              }}>
                                <Package size={12} style={{ marginRight: '4px' }} />
                                อนุมัติแล้ว
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
                            <td style={{ fontWeight: '600' }}>{typeof req.shelterId === 'object' ? req.shelterId?.name : req.shelterId || 'Unknown'}</td>
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
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                  onClick={() => handleOpenEditModal(req)}
                                  style={{ 
                                    padding: '6px 10px', 
                                    fontSize: '13px',
                                    backgroundColor: '#fff3bf',
                                    color: '#e67700',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                  }}
                                  title="แก้ไขจำนวน"
                                >
                                  <Edit3 size={14} /> แก้ไข
                                </button>
                                <button
                                  onClick={() => handleApprove(req._id)}
                                  className={styles.approveBtn}
                                  style={{ padding: '6px 12px', fontSize: '13px' }}
                                >
                                  <Package size={14} style={{ marginRight: '4px' }} /> อนุมัติ & โอนของ
                                </button>
                              </div>
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

            {/* Modal แก้ไขจำนวนก่อนอนุมัติ */}
            {editModalOpen && editingRequest && (
              <div className={styles.modalOverlay}>
                <div className={styles.modalContent} style={{ maxWidth: '600px' }}>
                  <div className={styles.modalHeader}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '18px' }}>แก้ไขจำนวนก่อนอนุมัติ</h3>
                      <p style={{ color: '#868e96', fontSize: '14px', margin: '4px 0 0' }}>
                        ศูนย์พักพิง: {typeof editingRequest.shelterId === 'object' ? editingRequest.shelterId?.name : editingRequest.shelterId}
                      </p>
                    </div>
                    <button
                      onClick={() => { setEditModalOpen(false); setEditingRequest(null); }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                    >
                      <X size={20} color="#868e96" />
                    </button>
                  </div>

                  <div style={{ padding: '20px', maxHeight: '400px', overflowY: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ borderBottom: '2px solid #e9ecef' }}>
                          <th style={{ textAlign: 'left', padding: '12px 8px', color: '#495057' }}>รายการ</th>
                          <th style={{ textAlign: 'center', padding: '12px 8px', color: '#495057', width: '120px' }}>ขอมา</th>
                          <th style={{ textAlign: 'center', padding: '12px 8px', color: '#495057', width: '150px' }}>อนุมัติ</th>
                        </tr>
                      </thead>
                      <tbody>
                        {editingRequest.items.map((item, idx) => {
                          const itemId = typeof item.itemId === 'object' ? item.itemId._id : item.itemId;
                          const itemName = typeof item.itemId === 'object' ? item.itemId.name : 'Unknown';
                          const itemUnit = typeof item.itemId === 'object' ? item.itemId.unit : '';
                          return (
                            <tr key={idx} style={{ borderBottom: '1px solid #f1f3f5' }}>
                              <td style={{ padding: '12px 8px' }}>
                                <span style={{ fontWeight: '500' }}>{itemName}</span>
                                <span style={{ color: '#868e96', marginLeft: '8px' }}>({itemUnit})</span>
                              </td>
                              <td style={{ textAlign: 'center', padding: '12px 8px', color: '#868e96' }}>
                                {item.quantityRequested}
                              </td>
                              <td style={{ textAlign: 'center', padding: '12px 8px' }}>
                                <input
                                  type="number"
                                  min="1"
                                  max={item.quantityRequested * 2}
                                  value={editedQuantities[itemId] || item.quantityRequested}
                                  onChange={(e) => handleQuantityChange(itemId, parseInt(e.target.value) || 1)}
                                  style={{
                                    width: '80px',
                                    padding: '8px 12px',
                                    border: '2px solid #228be6',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    textAlign: 'center',
                                    fontWeight: '600'
                                  }}
                                />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div style={{ padding: '16px 20px', borderTop: '1px solid #e9ecef', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                    <button
                      onClick={() => { setEditModalOpen(false); setEditingRequest(null); }}
                      style={{
                        padding: '10px 20px',
                        backgroundColor: '#f8f9fa',
                        color: '#495057',
                        border: '1px solid #dee2e6',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      <XCircle size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                      ยกเลิก
                    </button>
                    <button
                      onClick={handleApproveWithEditedQuantity}
                      className={styles.approveBtn}
                      style={{ padding: '10px 20px', fontSize: '14px' }}
                    >
                      <Check size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                      อนุมัติ & โอนของ
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Modal นำเข้าจาก Excel */}
            {excelModalOpen && (
              <div className={styles.modalOverlay}>
                <div className={styles.modalContent} style={{ maxWidth: '900px', maxHeight: '80vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                  <div className={styles.modalHeader}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FileSpreadsheet size={20} color="#40c057" />
                        นำเข้าศูนย์พักพิงจาก Excel
                      </h3>
                      <p style={{ color: '#868e96', fontSize: '14px', margin: '4px 0 0' }}>
                        อัพโหลดไฟล์ .xlsx หรือ .xls ที่มีข้อมูลศูนย์พักพิง
                      </p>
                    </div>
                    <button
                      onClick={() => { setExcelModalOpen(false); setExcelData([]); setExcelFileName(''); }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                    >
                      <X size={20} color="#868e96" />
                    </button>
                  </div>

                  <div style={{ padding: '20px', flex: 1, overflowY: 'auto' }}>
                    {/* Upload Zone */}
                    <div style={{
                      border: '2px dashed #dee2e6',
                      borderRadius: '12px',
                      padding: '30px',
                      textAlign: 'center',
                      backgroundColor: '#f8f9fa',
                      marginBottom: '20px'
                    }}>
                      <input
                        type="file"
                        accept=".xlsx,.xls"
                        onChange={handleExcelUpload}
                        style={{ display: 'none' }}
                        id="excel-upload"
                      />
                      <label htmlFor="excel-upload" style={{ cursor: 'pointer' }}>
                        <Upload size={48} color="#adb5bd" style={{ marginBottom: '12px' }} />
                        <p style={{ fontSize: '16px', fontWeight: '500', color: '#495057', margin: '0 0 8px' }}>
                          คลิกเพื่อเลือกไฟล์ หรือลากไฟล์มาวางที่นี่
                        </p>
                        <p style={{ fontSize: '13px', color: '#868e96', margin: 0 }}>
                          รองรับไฟล์ .xlsx, .xls
                        </p>
                      </label>
                      {excelFileName && (
                        <div style={{ marginTop: '12px', padding: '8px 16px', backgroundColor: '#e7f5ff', borderRadius: '8px', display: 'inline-block' }}>
                          <span style={{ color: '#1971c2', fontWeight: '500' }}>📄 {excelFileName}</span>
                        </div>
                      )}
                    </div>

                    {/* รูปแบบไฟล์ที่รองรับ */}
                    <div style={{ backgroundColor: '#fff9db', borderRadius: '8px', padding: '12px 16px', marginBottom: '20px' }}>
                      <p style={{ fontSize: '13px', color: '#e67700', margin: 0, fontWeight: '500' }}>
                        💡 รูปแบบคอลัมน์ที่รองรับ: ชื่อศูนย์พักพิง, จังหวัด, อำเภอ, ที่อยู่, ความจุทั้งหมด, จำนวนคนปัจจุบัน, เบอร์โทร, ผู้ติดต่อ
                      </p>
                    </div>

                    {/* Preview Table */}
                    {excelData.length > 0 && (
                      <div>
                        <h4 style={{ margin: '0 0 12px', color: '#495057' }}>
                          ตัวอย่างข้อมูล ({excelData.length} รายการ)
                        </h4>
                        <div style={{ overflowX: 'auto', maxHeight: '300px', border: '1px solid #e9ecef', borderRadius: '8px' }}>
                          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                            <thead>
                              <tr style={{ backgroundColor: '#f8f9fa', position: 'sticky', top: 0 }}>
                                <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #e9ecef' }}>#</th>
                                <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #e9ecef' }}>ชื่อศูนย์</th>
                                <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #e9ecef' }}>จังหวัด</th>
                                <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #e9ecef' }}>อำเภอ</th>
                                <th style={{ padding: '10px', textAlign: 'center', borderBottom: '2px solid #e9ecef' }}>ความจุ</th>
                                <th style={{ padding: '10px', textAlign: 'center', borderBottom: '2px solid #e9ecef' }}>จำนวนคน</th>
                                <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #e9ecef' }}>เบอร์โทร</th>
                              </tr>
                            </thead>
                            <tbody>
                              {excelData.slice(0, 10).map((row, idx) => (
                                <tr key={idx} style={{ borderBottom: '1px solid #f1f3f5' }}>
                                  <td style={{ padding: '10px', color: '#868e96' }}>{idx + 1}</td>
                                  <td style={{ padding: '10px', fontWeight: '500' }}>{row.name}</td>
                                  <td style={{ padding: '10px' }}>{row.province}</td>
                                  <td style={{ padding: '10px' }}>{row.district}</td>
                                  <td style={{ padding: '10px', textAlign: 'center' }}>{row.capacity}</td>
                                  <td style={{ padding: '10px', textAlign: 'center' }}>{row.currentPeople}</td>
                                  <td style={{ padding: '10px' }}>{row.phone}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          {excelData.length > 10 && (
                            <div style={{ padding: '10px', textAlign: 'center', color: '#868e96', backgroundColor: '#f8f9fa' }}>
                              ... และอีก {excelData.length - 10} รายการ
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div style={{ padding: '16px 20px', borderTop: '1px solid #e9ecef', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                    <button
                      onClick={() => { setExcelModalOpen(false); setExcelData([]); setExcelFileName(''); }}
                      style={{
                        padding: '10px 20px',
                        backgroundColor: '#f8f9fa',
                        color: '#495057',
                        border: '1px solid #dee2e6',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      ยกเลิก
                    </button>
                    <button
                      onClick={handleExcelSubmit}
                      disabled={excelData.length === 0 || isUploading}
                      style={{
                        padding: '10px 24px',
                        backgroundColor: excelData.length === 0 ? '#adb5bd' : '#40c057',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: excelData.length === 0 ? 'not-allowed' : 'pointer',
                        fontSize: '14px',
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      {isUploading ? (
                        <>กำลังนำเข้า...</>
                      ) : (
                        <>
                          <Check size={16} />
                          นำเข้า {excelData.length} รายการ
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Modal นำเข้าสิ่งของจาก Excel */}
            {inventoryExcelModalOpen && (
              <div className={styles.modalOverlay}>
                <div className={styles.modalContent} style={{ maxWidth: '900px', maxHeight: '80vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                  <div className={styles.modalHeader}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FileSpreadsheet size={20} color="#40c057" />
                        นำเข้าสิ่งของจาก Excel
                      </h3>
                      <p style={{ color: '#868e96', fontSize: '14px', margin: '4px 0 0' }}>
                        อัพโหลดไฟล์ .xlsx หรือ .xls ที่มีข้อมูลสิ่งของ
                      </p>
                    </div>
                    <button
                      onClick={() => { setInventoryExcelModalOpen(false); setInventoryExcelData([]); setInventoryExcelFileName(''); }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                    >
                      <X size={20} color="#868e96" />
                    </button>
                  </div>

                  <div style={{ padding: '20px', flex: 1, overflowY: 'auto' }}>
                    {/* Upload Zone */}
                    <div style={{
                      border: '2px dashed #dee2e6',
                      borderRadius: '12px',
                      padding: '30px',
                      textAlign: 'center',
                      backgroundColor: '#f8f9fa',
                      marginBottom: '20px'
                    }}>
                      <input
                        type="file"
                        accept=".xlsx,.xls"
                        onChange={handleInventoryExcelUpload}
                        style={{ display: 'none' }}
                        id="inventory-excel-upload"
                      />
                      <label htmlFor="inventory-excel-upload" style={{ cursor: 'pointer' }}>
                        <Upload size={48} color="#adb5bd" style={{ marginBottom: '12px' }} />
                        <p style={{ fontSize: '16px', fontWeight: '500', color: '#495057', margin: '0 0 8px' }}>
                          คลิกเพื่อเลือกไฟล์ หรือลากไฟล์มาวางที่นี่
                        </p>
                        <p style={{ fontSize: '13px', color: '#868e96', margin: 0 }}>
                          รองรับไฟล์ .xlsx, .xls
                        </p>
                      </label>
                      {inventoryExcelFileName && (
                        <div style={{ marginTop: '12px', padding: '8px 16px', backgroundColor: '#e7f5ff', borderRadius: '8px', display: 'inline-block' }}>
                          <span style={{ color: '#1971c2', fontWeight: '500' }}>📄 {inventoryExcelFileName}</span>
                        </div>
                      )}
                    </div>

                    {/* รูปแบบไฟล์ที่รองรับ */}
                    <div style={{ backgroundColor: '#fff9db', borderRadius: '8px', padding: '12px 16px', marginBottom: '20px' }}>
                      <p style={{ fontSize: '13px', color: '#e67700', margin: 0, fontWeight: '500' }}>
                        💡 รูปแบบคอลัมน์ที่รองรับ: ชื่อสิ่งของ, หมวดหมู่, จำนวน, หน่วย, แจ้งเตือนเมื่อต่ำกว่า
                      </p>
                    </div>

                    {/* Preview Table */}
                    {inventoryExcelData.length > 0 && (
                      <div>
                        <h4 style={{ margin: '0 0 12px', color: '#495057' }}>
                          ตัวอย่างข้อมูล ({inventoryExcelData.length} รายการ)
                        </h4>
                        <div style={{ overflowX: 'auto', maxHeight: '300px', border: '1px solid #e9ecef', borderRadius: '8px' }}>
                          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                            <thead>
                              <tr style={{ backgroundColor: '#f8f9fa', position: 'sticky', top: 0 }}>
                                <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #e9ecef' }}>#</th>
                                <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #e9ecef' }}>ชื่อสิ่งของ</th>
                                <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #e9ecef' }}>หมวดหมู่</th>
                                <th style={{ padding: '10px', textAlign: 'center', borderBottom: '2px solid #e9ecef' }}>จำนวน</th>
                                <th style={{ padding: '10px', textAlign: 'center', borderBottom: '2px solid #e9ecef' }}>หน่วย</th>
                                <th style={{ padding: '10px', textAlign: 'center', borderBottom: '2px solid #e9ecef' }}>แจ้งเตือน</th>
                              </tr>
                            </thead>
                            <tbody>
                              {inventoryExcelData.slice(0, 10).map((row, idx) => (
                                <tr key={idx} style={{ borderBottom: '1px solid #f1f3f5' }}>
                                  <td style={{ padding: '10px', color: '#868e96' }}>{idx + 1}</td>
                                  <td style={{ padding: '10px', fontWeight: '500' }}>{row.name}</td>
                                  <td style={{ padding: '10px' }}>{row.category}</td>
                                  <td style={{ padding: '10px', textAlign: 'center' }}>{row.quantity}</td>
                                  <td style={{ padding: '10px', textAlign: 'center' }}>{row.unit}</td>
                                  <td style={{ padding: '10px', textAlign: 'center' }}>{row.minAlert}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          {inventoryExcelData.length > 10 && (
                            <div style={{ padding: '10px', textAlign: 'center', color: '#868e96', backgroundColor: '#f8f9fa' }}>
                              ... และอีก {inventoryExcelData.length - 10} รายการ
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div style={{ padding: '16px 20px', borderTop: '1px solid #e9ecef', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                    <button
                      onClick={() => { setInventoryExcelModalOpen(false); setInventoryExcelData([]); setInventoryExcelFileName(''); }}
                      style={{
                        padding: '10px 20px',
                        backgroundColor: '#f8f9fa',
                        color: '#495057',
                        border: '1px solid #dee2e6',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      ยกเลิก
                    </button>
                    <button
                      onClick={handleInventoryExcelSubmit}
                      disabled={inventoryExcelData.length === 0 || isUploadingInventory}
                      style={{
                        padding: '10px 24px',
                        backgroundColor: inventoryExcelData.length === 0 ? '#adb5bd' : '#40c057',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: inventoryExcelData.length === 0 ? 'not-allowed' : 'pointer',
                        fontSize: '14px',
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      {isUploadingInventory ? (
                        <>กำลังนำเข้า...</>
                      ) : (
                        <>
                          <Check size={16} />
                          นำเข้า {inventoryExcelData.length} รายการ
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Modal เพิ่มจำนวนของ */}
            {addStockModalOpen && selectedItem && (
              <div className={styles.modalOverlay}>
                <div className={styles.modalContent} style={{ maxWidth: '450px' }}>
                  <div className={styles.modalHeader}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Package size={20} color="#4361ee" />
                        เพิ่มจำนวนของ
                      </h3>
                      <p style={{ color: '#868e96', fontSize: '14px', margin: '4px 0 0' }}>
                        {selectedItem.name}
                      </p>
                    </div>
                    <button
                      onClick={() => { setAddStockModalOpen(false); setSelectedItem(null); setAddQuantity(0); }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                    >
                      <X size={20} color="#868e96" />
                    </button>
                  </div>

                  <div style={{ padding: '24px' }}>
                    <div style={{ backgroundColor: '#f8f9fa', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#868e96', fontSize: '14px' }}>จำนวนปัจจุบัน</span>
                        <span style={{ fontSize: '24px', fontWeight: '700', color: '#495057' }}>
                          {selectedItem.quantity} <span style={{ fontSize: '14px', fontWeight: '400', color: '#868e96' }}>{selectedItem.unit}</span>
                        </span>
                      </div>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#495057' }}>
                        จำนวนที่ต้องการเพิ่ม
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={addQuantity || ''}
                        onChange={(e) => setAddQuantity(parseInt(e.target.value) || 0)}
                        placeholder="0"
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          fontSize: '18px',
                          fontWeight: '600',
                          border: '2px solid #e9ecef',
                          borderRadius: '10px',
                          textAlign: 'center',
                          outline: 'none'
                        }}
                      />
                    </div>

                    {addQuantity > 0 && (
                      <div style={{ backgroundColor: '#e7f5ff', borderRadius: '8px', padding: '12px', marginBottom: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ color: '#1971c2', fontSize: '14px' }}>จำนวนหลังเพิ่ม</span>
                          <span style={{ fontSize: '18px', fontWeight: '700', color: '#1971c2' }}>
                            {selectedItem.quantity + addQuantity} {selectedItem.unit}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div style={{ padding: '16px 24px', borderTop: '1px solid #e9ecef', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                    <button
                      onClick={() => { setAddStockModalOpen(false); setSelectedItem(null); setAddQuantity(0); }}
                      style={{
                        padding: '10px 20px',
                        backgroundColor: '#f8f9fa',
                        color: '#495057',
                        border: '1px solid #dee2e6',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      ยกเลิก
                    </button>
                    <button
                      onClick={handleAddStock}
                      disabled={addQuantity <= 0 || isAddingStock}
                      style={{
                        padding: '10px 24px',
                        backgroundColor: addQuantity <= 0 ? '#adb5bd' : '#4361ee',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: addQuantity <= 0 ? 'not-allowed' : 'pointer',
                        fontSize: '14px',
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      {isAddingStock ? (
                        <>กำลังเพิ่ม...</>
                      ) : (
                        <>
                          <Check size={16} />
                          เพิ่มจำนวน
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div >
      </main >
    </div >
  );
}
