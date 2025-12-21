// src/app/admin/page.tsx
"use client";

import React, { useState } from "react";
import styles from "./admin.module.css";


export default function AdminPanel() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentPage, setCurrentPage] = useState("dashboard");

  const menuItems = [
    { id: "dashboard", label: "📊 Dashboard", icon: "📊" },
    { id: "centers", label: "👥 จัดการศูนย์พักพิง", icon: "👥" },
    { id: "inventory", label: "📦 จัดการสินค้า", icon: "📦" },
    { id: "requests", label: "📋 จัดการคำร้อง", icon: "📋" },
    { id: "reports", label: "📈 รายงาน", icon: "📈" },
    { id: "settings", label: "⚙️ ตั้งค่า", icon: "⚙️" },
  ];

  const stats = [
    { label: "ศูนย์พักพิงทั้งหมด", value: "520", color: "#3b82f6" },
    { label: "เต็ม/กำลังเต็ม", value: "47", color: "#ef4444" },
    { label: "คำร้องรอดำเนิน", value: "12", color: "#f59e0b" },
    { label: "สินค้าในกองกลาง", value: "15,340", color: "#10b981" },
  ];

  const centers = [
    { name: "ศูนย์พักพิง ดินแดง", province: "กรุงเทพ", status: "เต็ม", capacity: 100 },
    { name: "ศูนย์พักพิง เพชรบุรี", province: "เพชรบุรี", status: "เต็ม", capacity: 100 },
    { name: "ศูนย์พักพิง ปทุมธานี", province: "ปทุมธานี", status: "กำลังเต็ม", capacity: 85 },
    { name: "ศูนย์พักพิง นครนายก", province: "นครนายก", status: "ปกติ", capacity: 45 },
  ];

  const inventory = [
    { sku: "FOOD-001", name: "ข้าวสารถุง 5kg", category: "อาหาร", qty: 5000, status: "ปกติ" },
    { sku: "WATER-002", name: "น้ำดื่มโพลิ 2L", category: "น้ำ", qty: 120, status: "ต่ำ" },
    { sku: "CLOTH-003", name: "เสื้อผ้าเด็ก", category: "ผ้า", qty: 2500, status: "ปกติ" },
    { sku: "MED-004", name: "ยาแก้ปวด 100 มล", category: "ยา", qty: 340, status: "ปกติ" },
  ];

  const requests = [
    { no: "REQ-2024-0521", center: "ศูนย์พักพิง ดินแดง", items: "3 รายการ", date: "21/05/2024", status: "รอดำเนิน" },
    { no: "REQ-2024-0520", center: "ศูนย์พักพิง เพชรบุรี", items: "2 รายการ", date: "20/05/2024", status: "รอดำเนิน" },
    { no: "REQ-2024-0519", center: "ศูนย์พักพิง ปทุมธานี", items: "5 รายการ", date: "19/05/2024", status: "อนุมัติแล้ว" },
  ];

  // DASHBOARD PAGE
  const DashboardPage = () => (
    <div>
      <div className={styles.statsGrid}>
        {stats.map((stat, idx) => (
          <div key={idx} className={styles.statCard}>
            <p className={styles.statLabel}>{stat.label}</p>
            <p className={styles.statValue}>{stat.value}</p>
            <div className={styles.statIcon} style={{ backgroundColor: stat.color }}></div>
          </div>
        ))}
      </div>

      <div className={styles.alertsContainer}>
        <div className={styles.section}>
          <h3>⚠️ ศูนย์ที่เต็ม</h3>
          <div className={styles.alertList}>
            {["ศูนย์พักพิง ดินแดง", "ศูนย์พักพิง เพชรบุรี", "ศูนย์พักพิง นครราชสีมา"].map((center, idx) => (
              <div key={idx} className={styles.alertItem}>
                <span>{center}</span>
                <span className={styles.badgeDanger}>เต็ม 100%</span>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.section}>
          <h3>📋 คำร้องใหม่</h3>
          <div className={styles.alertList}>
            {["REQ-2024-0521", "REQ-2024-0520", "REQ-2024-0519"].map((req, idx) => (
              <div key={idx} className={styles.alertItem}>
                <span>{req}</span>
                <button className={styles.btnSmall}>ตรวจสอบ</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // RELIEF CENTERS PAGE
  const CentersPage = () => (
    <div className={styles.section}>
      <h3>จัดการศูนย์พักพิง</h3>
      <div className={styles.controls}>
        <input type="text" placeholder="ค้นหาศูนย์พักพิง..." className={styles.input} />
        <select className={styles.input}>
          <option>สถานะ: ทั้งหมด</option>
          <option>ปกติ</option>
          <option>กำลังเต็ม</option>
          <option>เต็ม</option>
        </select>
        <button className={styles.btnPrimary}>+ เพิ่มศูนย์</button>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ชื่อศูนย์</th>
              <th>จังหวัด</th>
              <th>สถานะ</th>
              <th>ความจุ</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {centers.map((center, idx) => (
              <tr key={idx}>
                <td>{center.name}</td>
                <td>{center.province}</td>
                <td>
                  <span className={`${styles.badge} ${
                    center.status === "เต็ม" ? styles.badgeDanger :
                    center.status === "กำลังเต็ม" ? styles.badgeWarning :
                    styles.badgeSuccess
                  }`}>
                    {center.status}
                  </span>
                </td>
                <td>
                  <div className={styles.progressContainer}>
                    <div className={styles.progress} style={{ width: center.capacity + "%" }}></div>
                  </div>
                  {center.capacity}%
                </td>
                <td><button className={styles.btnText}>ดูรายละเอียด</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // INVENTORY PAGE
  const InventoryPage = () => (
    <div className={styles.section}>
      <h3>จัดการสินค้า</h3>
      <div className={styles.controls}>
        <input type="text" placeholder="ค้นหาสินค้า..." className={styles.input} />
        <select className={styles.input}>
          <option>หมวดหมู่: ทั้งหมด</option>
          <option>อาหาร</option>
          <option>น้ำ</option>
          <option>ผ้า</option>
          <option>ยา</option>
        </select>
        <button className={styles.btnSuccess}>📦 โอนสินค้า</button>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>รหัส</th>
              <th>ชื่อสินค้า</th>
              <th>หมวด</th>
              <th>จำนวน</th>
              <th>สถานะ</th>
            </tr>
          </thead>
          <tbody>
            {inventory.map((item, idx) => (
              <tr key={idx}>
                <td style={{ fontFamily: "monospace" }}>{item.sku}</td>
                <td>{item.name}</td>
                <td>{item.category}</td>
                <td><strong>{item.qty.toLocaleString()}</strong></td>
                <td>
                  <span className={`${styles.badge} ${
                    item.status === "ต่ำ" ? styles.badgeDanger : styles.badgeSuccess
                  }`}>
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // REQUESTS PAGE
  const RequestsPage = () => (
    <div className={styles.section}>
      <h3>จัดการคำร้อง</h3>
      <div className={styles.controls}>
        <input type="text" placeholder="ค้นหาเลขที่คำร้อง..." className={styles.input} />
        <select className={styles.input}>
          <option>สถานะ: ทั้งหมด</option>
          <option>รอดำเนิน</option>
          <option>อนุมัติแล้ว</option>
          <option>ปฏิเสธ</option>
        </select>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>เลขที่</th>
              <th>ศูนย์ขอ</th>
              <th>สินค้า</th>
              <th>วันที่</th>
              <th>สถานะ</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((req, idx) => (
              <tr key={idx}>
                <td style={{ fontFamily: "monospace" }}>{req.no}</td>
                <td>{req.center}</td>
                <td>{req.items}</td>
                <td>{req.date}</td>
                <td>
                  <span className={`${styles.badge} ${
                    req.status === "รอดำเนิน" ? styles.badgeWarning :
                    req.status === "อนุมัติแล้ว" ? styles.badgeSuccess :
                    styles.badgeDanger
                  }`}>
                    {req.status}
                  </span>
                </td>
                <td><button className={styles.btnText}>ดูรายละเอียด</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // REPORTS PAGE
  const ReportsPage = () => (
    <div className={styles.statsGrid}>
      <div className={styles.section} style={{ gridColumn: "1 / -1", maxWidth: "100%" }}>
        <h3>📊 รายงาน</h3>
        <div className={styles.reportGrid}>
          <button className={styles.reportBtn}>📋 สินค้าคงเหลือทั้งหมด</button>
          <button className={styles.reportBtn}>⚠️ สินค้าต่ำกว่า Threshold</button>
          <button className={styles.reportBtn}>📈 สินค้าแยกตามหมวด</button>
          <button className={styles.reportBtn}>📅 โอนสินค้าตามวันที่</button>
          <button className={styles.reportBtn}>🏪 โอนสินค้าตามศูนย์</button>
          <button className={styles.reportBtn}>📊 สรุปทั้งหมด</button>
        </div>
      </div>
    </div>
  );

  // SETTINGS PAGE
  const SettingsPage = () => (
    <div className={styles.statsGrid} style={{ maxWidth: "600px" }}>
      <div className={styles.section} style={{ gridColumn: "1 / -1" }}>
        <h3>⚙️ จัดการหมวดหมู่</h3>
        <div style={{ marginBottom: "16px" }}>
          {["🍚 อาหาร", "💧 น้ำ", "👕 ผ้า", "💊 ยา"].map((cat, idx) => (
            <div key={idx} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #334155" }}>
              <span>{cat}</span>
              <div style={{ display: "flex", gap: "8px" }}>
                <button className={styles.btnText}>แก้ไข</button>
                <button className={styles.btnText} style={{ color: "#ef4444" }}>ลบ</button>
              </div>
            </div>
          ))}
        </div>
        <button className={styles.btnPrimary} style={{ width: "100%" }}>+ เพิ่มหมวดหมู่</button>
      </div>

      <div className={styles.section} style={{ gridColumn: "1 / -1" }}>
        <h3>🔔 ตั้งค่า Threshold</h3>
        <div>
          <label style={{ display: "block", fontSize: "13px", color: "#94a3b8", marginBottom: "8px" }}>
            เตือนเมื่อสินค้า &lt; (ชิ้น)
          </label>
          <input type="number" defaultValue="500" style={{ width: "100%", padding: "8px 12px", marginBottom: "12px" }} className={styles.input} />
          <button className={styles.btnSuccess} style={{ width: "100%" }}>💾 บันทึก</button>
        </div>
      </div>
    </div>
  );

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <DashboardPage />;
      case "centers":
        return <CentersPage />;
      case "inventory":
        return <InventoryPage />;
      case "requests":
        return <RequestsPage />;
      case "reports":
        return <ReportsPage />;
      case "settings":
        return <SettingsPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className={styles.container}>
      {/* TOP NAVBAR */}
      <div className={styles.navbar}>
        <div className={styles.navbarLeft}>
          <span className={styles.navLogo}>🚨 ระบบจัดการสินค้าภัยพิบัติ</span>
        </div>
        <div className={styles.navbarRight}>
          <span className={styles.userLabel}>Admin</span>
          <div className={styles.avatarSmall}>A</div>
          <button className={styles.logoutBtnNav} onClick={() => window.location.href = "/login"}>
            ออกจากระบบ
          </button>
        </div>
      </div>

      {/* HORIZONTAL MENU */}
      <div className={styles.menuBar}>
        <nav className={styles.menuNav}>
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`${styles.menuItem} ${currentPage === item.id ? styles.active : ""}`}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      {/* MAIN */}
      <div className={styles.main}>
        {/* HEADER */}
        <div className={styles.header}>
          <h2>ระบบจัดการสินค้าภัยพิบัติ</h2>
          <div className={styles.headerRight}>
            <span>Admin</span>
            <div className={styles.avatar}>A</div>
          </div>
        </div>

        {/* CONTENT */}
        <div className={styles.content}>{renderPage()}</div>
      </div>
    </div>
  );
}