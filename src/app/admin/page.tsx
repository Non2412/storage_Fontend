'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  BarChart3, Users, Home, Package, AlertCircle,
  LogOut, Menu, X, Plus, Bell, Settings, Search,
  TrendingUp, TrendingDown, DollarSign, Calendar,
  FileText, ThumbsUp, ChevronDown, Grid3x3, Type, FileQuestion,
  Truck, ClipboardList, ArrowUpRight, ArrowDownLeft, ShieldCheck, Database,
  UserCheck, Newspaper, Save
} from 'lucide-react';
import {
  LineChart, Line, PieChart, Pie, Cell,
  Tooltip, ResponsiveContainer
} from 'recharts';
import styles from './admin.module.css';

export default function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [inventorySubTab, setInventorySubTab] = useState('overview');
  const [settingsSubTab, setSettingsSubTab] = useState('general');
  const router = useRouter();

  const handleAction = (message: string) => {
    console.log(`Action triggered: ${message}`);
    alert(`กำลังดำเนินการ: ${message}`);
  };

  const handleLogout = () => {
    console.log('Logout attempt');
    if (confirm('คุณต้องการออกจากระบบใช่หรือไม่?')) {
      router.push('/');
    }
  };

  // สถานะสรุปภาพรวมศูนย์ (จำลองข้อมูลจาก 500+ ศูนย์)
  const shelterStats = {
    total: 512,
    critical: 42,
    warning: 128,
    normal: 342,
    totalPeople: 12450
  };

  // รายการคำร้องขอล่าสุด (เน้น 3-click rule)
  const [requests, setRequests] = useState([
    { id: 'REQ-001', shelter: 'ศูนย์กีฬาบางกอก', items: 'อาหาร, น้ำดื่ม', province: 'กรุงเทพฯ', time: '5 น. ที่แล้ว', status: 'pending' },
    { id: 'REQ-002', shelter: 'โรงเรียนวัดดอนเมือง', items: 'ผ้าห่ม, ยา', province: 'กรุงเทพฯ', time: '12 น. ที่แล้ว', status: 'pending' },
    { id: 'REQ-003', shelter: 'หอประชุมแจ้งวัฒนะ', items: 'ชุดสุขอนามัย', province: 'นนทบุรี', time: '20 น. ที่แล้ว', status: 'pending' },
  ]);

  // ขลังสินค้ากองกลาง/จังหวัด (แยกหมวดหมู่)
  const stockData = [
    { category: 'อาหาร', quantity: '12,500', unit: 'ชุด', status: 'เพียงพอ', color: '#40c057' },
    { category: 'น้ำดื่ม', quantity: '8,400', unit: 'แพ็ค', status: 'ต้องเติม', color: '#fab005' },
    { category: 'เวชภัณฑ์', quantity: '3,200', unit: 'ชุด', status: 'เพียงพอ', color: '#339af0' },
    { category: 'เครื่องนุ่งห่ม', quantity: '1,500', unit: 'ชิ้น', status: 'วิกฤต', color: '#fa5252' },
  ];

  const handleApprove = (id: string) => {
    setRequests(requests.filter(req => req.id !== id));
    // ในอนาคตจะมีการตัดสต็อกผ่าน API ตรงนี้
    alert('อนุมัติและหักสต็อกอัตโนมัติเรียบร้อย');
  };

  // ข้อมูลจำลองสำหรับหน้าศูนย์พักพิง
  const [shelterFilter, setShelterFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [shelters, setShelters] = useState([
    { id: 1, name: 'ศูนย์กีฬาบางกอก', province: 'กรุงเทพฯ', people: 300, capacity: 300, status: 'critical', phone: '02-xxx-xxxx' },
    { id: 2, name: 'โรงเรียนวัดดอนเมือง', province: 'กรุงเทพฯ', people: 190, capacity: 200, status: 'warning', phone: '02-xxx-xxxx' },
    { id: 3, name: 'ศาลาประชาคมปากเกร็ด', province: 'นนทบุรี', people: 120, capacity: 400, status: 'normal', phone: '02-xxx-xxxx' },
    { id: 4, name: 'วัดไร่ขิง', province: 'นครปฐม', people: 450, capacity: 500, status: 'warning', phone: '034-xxx-xxxx' },
    { id: 5, name: 'สนามกีฬาจังหวัดอุบลฯ', province: 'อุบลราชธานี', people: 800, capacity: 800, status: 'critical', phone: '045-xxx-xxxx' },
  ]);

  // สถานะสำหรับ Modal เพิ่มศูนย์ใหม่
  const [isShelterModalOpen, setIsShelterModalOpen] = useState(false);
  const [newShelter, setNewShelter] = useState({
    name: '',
    province: '',
    people: 0,
    capacity: 0,
    phone: ''
  });

  const handleSaveShelter = () => {
    if (!newShelter.name || !newShelter.province || !newShelter.capacity) {
      alert('กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน');
      return;
    }

    const occupancyRate = newShelter.people / newShelter.capacity;
    let status = 'normal';
    if (occupancyRate >= 1) status = 'critical';
    else if (occupancyRate >= 0.8) status = 'warning';

    const entry = {
      ...newShelter,
      id: Date.now(),
      status
    };

    setShelters([...shelters, entry]);
    setIsShelterModalOpen(false);
    setNewShelter({ name: '', province: '', people: 0, capacity: 0, phone: '' });
    alert('เพิ่มศูนย์พักพิงใหม่เรียบร้อยแล้ว');
  };

  // ข้อมูลจำลองสำหรับคลังสินค้า
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

  // ข้อมูลผู้ใช้งานและสิทธิ์ (RBAC)
  const [systemUsers, setSystemUsers] = useState([
    { id: 1, name: 'แอดมิน สมปอง', email: 'sompong@disaster.go.th', role: 'Super Admin', status: 'active', lastLogin: '10 นาทีที่แล้ว' },
    { id: 2, name: 'เจ้าหน้าที่ วิชัย', email: 'wichai@logistics.com', role: 'Logistics', status: 'active', lastLogin: '1 ชม. ที่แล้ว' },
    { id: 3, name: 'เจ้าหน้าที่ สายใจ', email: 'saijai@warehouse.io', role: 'Warehouse', status: 'offline', lastLogin: '5 ชม. ที่แล้ว' },
  ]);

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

  // ข้อมูลสินค้าในคลังแบบใหม่
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
            { icon: BarChart3, label: 'หน้าหลัก', id: 'dashboard' },
            { icon: Home, label: 'ศูนย์พักพิง', id: 'shelters' },
            { icon: Package, label: 'คลังสินค้า', id: 'inventory' },
            { icon: Truck, label: 'การกระจายสิ่งของ', id: 'distribution' },
            { icon: ShieldCheck, label: 'ผู้ส่งมอบ', id: 'suppliers' },
            { icon: Database, label: 'บันทึกเหตุการณ์', id: 'logs' },
            { icon: AlertCircle, label: 'แจ้งเตือน', id: 'alerts' },
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
            <div className={styles.headerBtn} onClick={() => setActiveTab('alerts')}>
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
            {activeTab === 'dashboard' && (
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
                      <button onClick={() => setActiveTab('alerts')} className={styles.navItem} style={{ width: 'auto', fontSize: '12px', padding: '4px 12px' }}>ดูทั้งหมด</button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {requests.map(req => (
                        <div key={req.id} className={styles.requestItem}>
                          <div>
                            <div style={{ fontWeight: '600', fontSize: '14px' }}>{req.shelter}</div>
                            <div style={{ fontSize: '12px', color: '#868e96' }}>{req.items} • {req.province}</div>
                          </div>
                          <button
                            onClick={() => handleApprove(req.id)}
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
                      <button onClick={() => setActiveTab('alerts')} className={styles.navItem} style={{ width: 'auto', fontSize: '12px', padding: '4px 12px' }}>ดูทั้งหมด</button>
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
                      {stockData.map((stock, idx) => (
                        <div key={idx}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span style={{ fontWeight: '500', fontSize: '14px' }}>{stock.category}</span>
                            <span style={{ fontSize: '14px', color: stock.color, fontWeight: 'bold' }}>{stock.quantity} {stock.unit}</span>
                          </div>
                          <div className={styles.progressBarOuter}>
                            <div className={styles.progressBarInner} style={{ width: idx === 3 ? '25%' : '75%', backgroundColor: stock.color }}></div>
                          </div>
                        </div>
                      ))}
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
                        วิกฤต (42)
                      </div>
                      <div className={styles.legendItem}>
                        <div className={styles.legendColor} style={{ backgroundColor: '#fab005' }}></div>
                        ใกล้เต็ม (128)
                      </div>
                      <div className={styles.legendItem}>
                        <div className={styles.legendColor} style={{ backgroundColor: '#40c057' }}></div>
                        ปกติ (342)
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
                          const severity: Record<string, number> = { critical: 0, warning: 1, normal: 2 };
                          return (severity[a.status] ?? 3) - (severity[b.status] ?? 3);
                        })
                        .map((shelter: any) => (
                          <tr key={shelter.id}>
                            <td style={{ fontWeight: '600' }}>{shelter.name}</td>
                            <td>{shelter.province}</td>
                            <td>
                              <div style={{ fontSize: '13px' }}>{shelter.people} / {shelter.capacity}</div>
                              <div className={styles.progressBarOuter} style={{ height: '4px', width: '100px', marginTop: '4px' }}>
                                <div className={styles.progressBarInner} style={{
                                  width: `${(shelter.people / shelter.capacity) * 100}%`,
                                  backgroundColor: shelter.status === 'critical' ? '#fa5252' : shelter.status === 'warning' ? '#fab005' : '#40c057'
                                }}></div>
                              </div>
                            </td>
                            <td>
                              <span className={`${styles.statusBadge} ${shelter.status === 'critical' ? styles.badgeCritical :
                                shelter.status === 'warning' ? styles.badgeWarning : styles.badgeNormal
                                }`}>
                                {shelter.status === 'critical' ? 'เต็ม (วิกฤต)' : shelter.status === 'warning' ? 'ใกล้เต็ม' : 'ปกติ'}
                              </span>
                            </td>
                            <td style={{ color: '#4361ee', cursor: 'pointer' }}>{shelter.phone}</td>
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
                            value={newShelter.people}
                            onChange={(e) => setNewShelter({ ...newShelter, people: parseInt(e.target.value) || 0 })}
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
                    <div className={styles.summaryValue}>16</div>
                  </div>
                  <div className={styles.inventorySummaryCard}>
                    <div className={styles.summaryLabel}>มี</div>
                    <div className={styles.summaryValue} style={{ color: '#22c55e' }}>16</div>
                  </div>
                  <div className={styles.inventorySummaryCard}>
                    <div className={styles.summaryLabel}>ใกล้หมด</div>
                    <div className={styles.summaryValue} style={{ color: '#f59e0b' }}>0</div>
                  </div>
                  <div className={styles.inventorySummaryCard}>
                    <div className={styles.summaryLabel}>หมด</div>
                    <div className={styles.summaryValue} style={{ color: '#ef4444' }}>0</div>
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
                    <option>ปกติ</option>
                    <option>ใกล้หมด</option>
                    <option>หมด</option>
                  </select>
                </div>

                {/* Item Grid */}
                <div className={styles.itemGrid}>
                  {filteredInventory.map(item => (
                    <div key={item.id} className={styles.itemCardDark}>
                      <div className={styles.itemCardHeader}>
                        <div className={styles.itemIconWrapper}>
                          <Package size={24} />
                        </div>
                        <div className={`${styles.itemStatusBadgeSmall} ${item.status === 'ปกติ' ? '' : item.status === 'ใกล้หมด' ? styles.badgeWarning : styles.badgeCritical}`} style={{
                          backgroundColor: item.status === 'ปกติ' ? 'rgba(34, 197, 94, 0.1)' : item.status === 'ใกล้หมด' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                          color: item.status === 'ปกติ' ? '#22c55e' : item.status === 'ใกล้หมด' ? '#f59e0b' : '#ef4444'
                        }}>
                          {item.status === 'ปกติ' ? 'มี' : item.status}
                        </div>
                      </div>

                      <h3 className={styles.itemTitleDark}>{item.name}</h3>
                      <p className={styles.itemCategoryDark}>{item.category}</p>

                      <div className={styles.itemStatsContainer}>
                        <div>
                          <span className={styles.itemMainQty}>{item.qty}</span>
                          <span className={styles.itemSubQty}> / {item.target} {item.unit}</span>
                        </div>
                        <div className={styles.itemPercentage}>{item.percentage}%</div>
                      </div>

                      <div className={styles.inventoryProgressBar}>
                        <div
                          className={styles.inventoryProgressFill}
                          style={{
                            width: `${Math.min(item.percentage, 100)}%`,
                            backgroundColor: item.status === 'ปกติ' ? '#22c55e' : item.status === 'ใกล้หมด' ? '#f59e0b' : '#ef4444'
                          }}
                        ></div>
                      </div>

                      <div className={styles.itemFooterStatus}>สถานะ: {item.status}</div>
                    </div>
                  ))}
                </div>

                {filteredInventory.length === 0 && (
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
                    <h3 className={styles.chartTitle}>บันทึกเหตุการณ์ระบบ (Audit Logs)</h3>
                    <p style={{ color: '#868e96', fontSize: '14px' }}>ตรวจสอบประวัติการใช้งานและการเข้าถึงข้อมูลของเจ้าหน้าที่ทุกคน</p>
                  </div>
                  <button
                    onClick={() => handleAction('ส่งออกบันทึกเหตุการณ์ (CSV)')}
                    className={styles.approveBtn}
                    style={{ backgroundColor: '#f1f3f5', color: '#495057' }}
                  >
                    Export to CSV
                  </button>
                </div>

                <div className={styles.tableContainer} style={{ marginTop: '24px' }}>
                  <table className={styles.customTable}>
                    <thead>
                      <tr>
                        <th>วัน-เวลา</th>
                        <th>ผู้ใช้งาน</th>
                        <th>กิจกรรม</th>
                        <th>โมดูล</th>
                        <th>IP Address</th>
                      </tr>
                    </thead>
                    <tbody>
                      {auditLogs.map(log => (
                        <tr key={log.id}>
                          <td style={{ fontSize: '13px', color: '#868e96' }}>{log.time}</td>
                          <td style={{ fontWeight: '600' }}>{log.user}</td>
                          <td>{log.action}</td>
                          <td>
                            <span style={{ fontSize: '12px', padding: '2px 8px', borderRadius: '4px', backgroundColor: '#e9ecef', color: '#495057' }}>{log.module}</span>
                          </td>
                          <td style={{ fontFamily: 'monospace', fontSize: '12px' }}>{log.ip}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', animation: 'fadeIn 0.4s ease-out' }}>
                <div className={styles.subTabs}>
                  <div onClick={() => setSettingsSubTab('general')} className={`${styles.subTabItem} ${settingsSubTab === 'general' ? styles.subTabActive : ''}`}>ทั่วไป</div>
                  <div onClick={() => setSettingsSubTab('users')} className={`${styles.subTabItem} ${settingsSubTab === 'users' ? styles.subTabActive : ''}`}>จัดการสิทธิ์ (RBAC)</div>
                  <div onClick={() => setSettingsSubTab('thresholds')} className={`${styles.subTabItem} ${settingsSubTab === 'thresholds' ? styles.subTabActive : ''}`}>จุดแจ้งเตือน</div>
                  <div onClick={() => setSettingsSubTab('broadcast')} className={`${styles.subTabItem} ${settingsSubTab === 'broadcast' ? styles.subTabActive : ''}`}>ประกาศข่าวสาร</div>
                  <div onClick={() => setSettingsSubTab('archive')} className={`${styles.subTabItem} ${settingsSubTab === 'archive' ? styles.subTabActive : ''}`}>จัดการข้อมูลย้อนหลัง</div>
                </div>

                {settingsSubTab === 'general' && (
                  <div className={styles.chartCard}>
                    <h3 className={styles.chartTitle}>ตั้งค่าทั่วไป</h3>
                    <div style={{ padding: '20px 0', borderBottom: '1px solid #f1f3f5' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontWeight: '600' }}>โหมดการแสดงผล</div>
                          <div style={{ fontSize: '13px', color: '#868e96' }}>เลือกธีมมืดหรือสว่างสำหรับ Dashboard</div>
                        </div>
                        <span style={{ color: '#868e96' }}>ธีมมืด (Dark Mode) - ล็อกไว้โดยผู้ดูแล</span>
                      </div>
                    </div>
                    <div style={{ padding: '20px 0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontWeight: '600' }}>อัปเดตข้อมูลอัตโนมัติ</div>
                          <div style={{ fontSize: '13px', color: '#868e96' }}>รีเฟรชข้อมูลทุกๆ 30 วินาที</div>
                        </div>
                        <button
                          onClick={() => handleAction('สวิตช์ระบบอัปเดตอัตโนมัติ')}
                          className={styles.approveBtn}
                          style={{ backgroundColor: '#40c057' }}
                        >
                          เปิดใช้งาน
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {settingsSubTab === 'users' && (
                  <div className={styles.chartCard}>
                    <div className={styles.chartHeader}>
                      <h3 className={styles.chartTitle}>ผู้ใช้งานในระบบ (RBAC)</h3>
                      <button
                        onClick={() => handleAction('เพิ่มผู้ใช้ใหม่')}
                        className={styles.approveBtn}
                        style={{ backgroundColor: '#4361ee' }}
                      >
                        + เพิ่มผู้ใช้
                      </button>
                    </div>
                    <div className={styles.tableContainer} style={{ marginTop: '20px' }}>
                      <table className={styles.customTable}>
                        <thead>
                          <tr>
                            <th>ชื่อ-นามสกุล</th>
                            <th>อีเมล</th>
                            <th>บทบาท/สิทธิ์</th>
                            <th>สถานะ</th>
                            <th>เข้าใช้งานล่าสุด</th>
                            <th>จัดการ</th>
                          </tr>
                        </thead>
                        <tbody>
                          {systemUsers.map((user: any) => (
                            <tr key={user.id}>
                              <td style={{ fontWeight: '600' }}>{user.name}</td>
                              <td>{user.email}</td>
                              <td>
                                <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '12px', backgroundColor: '#e7f5ff', color: '#1971c2', fontWeight: 'bold' }}>{user.role}</span>
                              </td>
                              <td>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: user.status === 'active' ? '#40c057' : '#adb5bd' }}></div>
                                  {user.status === 'active' ? 'ออนไลน์' : 'ออฟไลน์'}
                                </span>
                              </td>
                              <td style={{ fontSize: '12px', color: '#868e96' }}>{user.lastLogin}</td>
                              <td>
                                <button
                                  onClick={() => handleAction(`แก้ไขสิทธิ์ของ ${user.name}`)}
                                  style={{ background: 'none', border: 'none', color: '#4361ee', cursor: 'pointer', fontSize: '14px' }}
                                >
                                  แก้ไขสิทธิ์
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {settingsSubTab === 'thresholds' && (
                  <div className={styles.chartCard} style={{ maxWidth: '600px' }}>
                    <h3 className={styles.chartTitle} style={{ marginBottom: '24px' }}>ตั้งค่าจุดแจ้งเตือนวิกฤต (Alert Thresholds)</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>จำนวนอาหารต่ำสุด (ชุด)</label>
                        <input type="number" defaultValue={thresholds.food} className={styles.filterInput} style={{ width: '100%' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>จำนวนน้ำดื่มต่ำสุด (แพ็ค)</label>
                        <input type="number" defaultValue={thresholds.water} className={styles.filterInput} style={{ width: '100%' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>จำนวนเวชภัณฑ์ต่ำสุด (ชุด)</label>
                        <input type="number" defaultValue={thresholds.medicine} className={styles.filterInput} style={{ width: '100%' }} />
                      </div>
                      <button
                        onClick={() => handleAction('บันทึกเกณฑ์การแจ้งเตือน')}
                        className={styles.approveBtn}
                        style={{ backgroundColor: '#4361ee', marginTop: '10px' }}
                      >
                        บันทึกการตั้งค่า
                      </button>
                    </div>
                  </div>
                )}

                {settingsSubTab === 'broadcast' && (
                  <div className={styles.chartCard} style={{ maxWidth: '700px' }}>
                    <h3 className={styles.chartTitle} style={{ marginBottom: '20px' }}>ประกาศข่าวสารด่วน (System Broadcast)</h3>
                    <p style={{ color: '#868e96', fontSize: '14px', marginBottom: '20px' }}>ข้อความจะปรากฏบนหน้า Dashboard ของเจ้าหน้าที่ทุกคนทันที</p>
                    <textarea
                      placeholder="พิมพ์ข้อความที่ต้องการประกาศที่นี่..."
                      style={{ width: '100%', height: '150px', padding: '16px', borderRadius: '8px', border: '1px solid #dee2e6', marginBottom: '20px', resize: 'none', fontSize: '15px' }}
                    ></textarea>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button
                        onClick={() => handleAction('ส่งประกาศด่วน (High Priority)')}
                        className={styles.approveBtn}
                        style={{ backgroundColor: '#fa5252' }}
                      >
                        ส่งประกาศด่วน (High Priority)
                      </button>
                      <button
                        onClick={() => handleAction('ส่งประกาศปกติ')}
                        className={styles.approveBtn}
                        style={{ backgroundColor: '#f1f3f5', color: '#495057' }}
                      >
                        ส่งประกาศปกติ
                      </button>
                    </div>
                  </div>
                )}

                {settingsSubTab === 'archive' && (
                  <div className={styles.chartCard}>
                    <h3 className={styles.chartTitle} style={{ marginBottom: '24px' }}>จัดการข้อมูลย้อนหลัง (Archive & Backup)</h3>
                    <div className={styles.inventoryGrid}>
                      <div className={styles.inventoryCard} style={{ textAlign: 'center', padding: '30px' }}>
                        <Save size={40} style={{ color: '#339af0', marginBottom: '16px' }} />
                        <div style={{ fontWeight: 'bold', fontSize: '18px' }}>Backup ฐานข้อมูล</div>
                        <p style={{ fontSize: '13px', color: '#868e96', margin: '12px 0' }}>สำรองข้อมูลทั้งหมดเก็บไว้บน Cloud</p>
                        <button
                          onClick={() => handleAction('สำรองฐานข้อมูลไปยัง Cloud')}
                          className={styles.approveBtn}
                          style={{ backgroundColor: '#339af0', width: '100%' }}
                        >
                          เริ่มการสำรองข้อมูล
                        </button>
                      </div>
                      <div className={styles.inventoryCard} style={{ textAlign: 'center', padding: '30px' }}>
                        <FileText size={40} style={{ color: '#40c057', marginBottom: '16px' }} />
                        <div style={{ fontWeight: 'bold', fontSize: '18px' }}>ส่งออกรายงานสรุป</div>
                        <p style={{ fontSize: '13px', color: '#868e96', margin: '12px 0' }}>Export ข้อมูลศูนย์และสต็อกเป็น Excel/PDF</p>
                        <button
                          onClick={() => handleAction('ส่งออกรายงานสรุป (Excel/PDF)')}
                          className={styles.approveBtn}
                          style={{ backgroundColor: '#40c057', width: '100%' }}
                        >
                          ดาวน์โหลดรายงาน
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'alerts' && (
              <div className={styles.chartCard} style={{ animation: 'fadeIn 0.4s ease-out' }}>
                <h3 className={styles.chartTitle} style={{ marginBottom: '24px' }}>ศูนย์แจ้งเตือนเหตุวิกฤต</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {notifications.map(note => (
                    <div key={note.id} className={styles.requestItem} style={{ borderLeft: `4px solid ${note.type === 'critical' ? '#fa5252' : note.type === 'request' ? '#fab005' : '#339af0'}` }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ backgroundColor: note.type === 'critical' ? '#fff5f5' : note.type === 'request' ? '#fff9db' : '#e7f5ff', padding: '10px', borderRadius: '8px' }}>
                          {note.type === 'critical' ? <AlertCircle size={24} color="#fa5252" /> : note.type === 'request' ? <Package size={24} color="#fab005" /> : <Bell size={24} color="#339af0" />}
                        </div>
                        <div>
                          <div style={{ fontWeight: '600' }}>{note.msg}</div>
                          <div style={{ fontSize: '12px', color: '#868e96' }}>{note.time}</div>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedAlertId(note.id);
                          setIsAlertModalOpen(true);
                        }}
                        className={styles.approveBtn}
                        style={{ backgroundColor: '#f1f3f5', color: '#495057' }}
                      >
                        ดูรายละเอียด
                      </button>
                    </div>
                  ))}
                </div>

                {/* Modal รายละเอียดการแจ้งเตือน */}
                {isAlertModalOpen && selectedAlertId && (
                  <div className={styles.modalOverlay}>
                    {(() => {
                      const activeAlert = notifications.find(n => n.id === selectedAlertId);
                      const shelter = shelters.find(s => s.id === (activeAlert as any)?.shelterId);

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
                                <div style={{ fontWeight: '600', fontSize: '18px' }}>{shelter.people} / {shelter.capacity}</div>
                                <div className={styles.progressBarOuter} style={{ height: '6px', marginTop: '8px' }}>
                                  <div className={styles.progressBarInner} style={{
                                    width: `${(shelter.people / shelter.capacity) * 100}%`,
                                    backgroundColor: (shelter.people / shelter.capacity) >= 0.9 ? '#fa5252' : '#fab005'
                                  }}></div>
                                </div>
                              </div>
                              <div>
                                <div style={{ fontSize: '12px', color: '#868e96', marginBottom: '4px' }}>เบอร์ผู้ประสานงาน</div>
                                <div style={{ fontWeight: '600', fontSize: '16px', color: '#4361ee' }}>📞 {shelter.phone}</div>
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
                                onClick={() => { setActiveTab('distribution'); setIsAlertModalOpen(false); }}
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
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
