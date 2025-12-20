'use client';

import React, { useState } from 'react';
import { Grid3x3, Package, BarChart3, Car, Settings, LogOut, Plus, Edit2, Trash2, Eye, EyeOff, Copy, RotateCcw, AlertCircle, Users, MapPin, TrendingUp, Bell } from 'lucide-react';

export default function AdminPanel() {
  const [activeMenu, setActiveMenu] = useState('overview');
  const [showPassword, setShowPassword] = useState(false);
  const [supplies, setSupplies] = useState([
    { id: 1, name: 'อาหารแห้ง', quantity: 150, unit: 'รายการ', status: 'ใช้งาน' },
    { id: 2, name: 'นาสามัญ', quantity: 45, unit: 'รายการ', status: 'ใช้งาน' },
    { id: 3, name: 'เบื้องน้ำ', quantity: 200, unit: 'รายการ', status: 'ช่วย' },
  ]);

  const menuItems = [
    { icon: Grid3x3, label: 'ภาพรวม', id: 'overview' },
    { icon: Package, label: 'กล่องสินค้า', id: 'supplies' },
    { icon: BarChart3, label: 'สูนศูนย์พิจิต', id: 'centers' },
    { icon: Car, label: 'การกระจาย', id: 'transfer' },
    { icon: Settings, label: 'การตั้งค่า', id: 'settings' },
  ];

  const stats = [
    { icon: MapPin, label: 'ศูนย์พักพิง', value: '500+' },
    { icon: Users, label: 'ผู้ประสบภัย', value: '8,540' },
    { icon: Package, label: 'สินค้า', value: '125,400' },
    { icon: AlertCircle, label: 'สถานะเตือน', value: '23' },
  ];

  const supplyItems = [
    { name: 'อาหารแห้ง', quantity: 150, unit: 'รายการ', status: 'ใช้งาน' },
    { name: 'นาสามัญ', quantity: 45, unit: 'รายการ', status: 'ใช้งาน' },
    { name: 'เบื้องน้ำ', quantity: 200, unit: 'รายการ', status: 'ใช้งาน' },
  ];

  const shelterItems = [
    { name: 'โรงเรียน (School)', capacity: 500, current: 480 },
    { name: 'วัด (Temple)', capacity: 300, current: 285 },
  ];

  const deleteSupply = (id: number) => {
    setSupplies(supplies.filter(s => s.id !== id));
  };

  const getMenuLabel = () => {
    switch (activeMenu) {
      case 'overview':
        return 'ภาพรวม';
      case 'supplies':
        return 'กล่องสินค้า';
      case 'centers':
        return 'สูนศูนย์พิจิต';
      case 'transfer':
        return 'การกระจาย';
      case 'settings':
        return 'การตั้งค่า';
      default:
        return 'ภาพรวม';
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-950 text-gray-100">
      {/* Sidebar */}
      <div className="w-72 bg-gradient-to-b from-gray-900 to-gray-950 border-r border-gray-800 flex flex-col py-6 px-4 sticky top-0 h-screen">
        {/* Logo */}
        <div className="mb-8">
          <h2 className="text-white font-bold text-lg">Admin Panel</h2>
          <p className="text-gray-500 text-xs">ผู้ดูแลระบบ</p>
        </div>

        {/* Menu */}
        <nav className="flex-1 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveMenu(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition text-left ${
                  activeMenu === item.id
                    ? 'bg-blue-600/20 text-blue-400 border-l-2 border-blue-500'
                    : 'text-gray-400 hover:text-gray-300 hover:bg-gray-800/30'
                }`}
              >
                <Icon size={18} />
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <button className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-lg transition text-left">
          <LogOut size={18} />
          <span className="text-sm font-medium">ออกจากระบบ</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gray-900 border-b border-gray-800 px-8 py-4 flex justify-between items-center sticky top-0 z-40">
          <div>
            <h1 className="text-2xl font-bold text-white">{getMenuLabel()}</h1>
            <p className="text-gray-500 text-sm mt-1">จัดการอุปสงค์สูนขาน การเข้อเยื่อน และการเหมิงอะรับนอบ</p>
          </div>
          <button className="p-2 hover:bg-gray-800 rounded-lg transition relative">
            <Bell size={20} className="text-gray-400" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {activeMenu === 'overview' && (
            <div className="p-8">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-12">
                {stats.map((stat, idx) => {
                  const Icon = stat.icon;
                  return (
                    <div key={idx} className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition">
                      <Icon size={24} className="text-gray-500 mb-3" />
                      <p className="text-gray-400 text-sm">{stat.label}</p>
                      <p className="text-2xl font-bold text-white mt-2">{stat.value}</p>
                    </div>
                  );
                })}
              </div>

              {/* Two Column Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column - Supplies */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white">หมวดหลัญของอบรำ</h3>
                    <button className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1">
                      <Plus size={16} /> เพิ่ม
                    </button>
                  </div>

                  {supplyItems.map((item, idx) => (
                    <div key={idx} className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-white font-medium text-base">{item.name}</h4>
                          <p className="text-gray-400 text-sm mt-2">{item.quantity} {item.unit}</p>
                          <span className="inline-flex mt-3 px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded">ใช้งาน</span>
                        </div>
                        <div className="flex gap-2">
                          <button className="p-2 hover:bg-gray-800 rounded transition">
                            <Edit2 size={16} className="text-blue-400" />
                          </button>
                          <button className="p-2 hover:bg-gray-800 rounded transition">
                            <Trash2 size={16} className="text-red-400" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Right Column - Shelters */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white">ประเภทของอุนศรัทพืช</h3>
                    <button className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1">
                      <Plus size={16} /> เพิ่ม
                    </button>
                  </div>

                  {shelterItems.map((item, idx) => (
                    <div key={idx} className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition">
                      <h4 className="text-white font-medium text-base">{item.name}</h4>
                      <p className="text-gray-400 text-sm mt-2">ความจุ {item.capacity} คน</p>
                      <div className="flex items-center gap-3 mt-4">
                        <div className="flex-1">
                          <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-green-500"
                              style={{ width: `${(item.current / item.capacity) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                        <span className="text-green-400 text-sm font-medium whitespace-nowrap">
                          {Math.round((item.current / item.capacity) * 100)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeMenu === 'supplies' && (
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white">หมวดหลัญของอบรำ</h2>
                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-sm font-medium transition flex items-center gap-2">
                  <Plus size={16} /> เพิ่มหมวดหลัญ
                </button>
              </div>

              <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-800 bg-gray-800/50">
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">ชื่อหมวดหลัญ</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">จำนวนวาศตรส</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">สถานะ</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-gray-400">การดำเนินการ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {supplies.map((s) => (
                      <tr key={s.id} className="border-b border-gray-800 hover:bg-gray-800/50 transition">
                        <td className="px-6 py-4 text-white font-medium">{s.name}</td>
                        <td className="px-6 py-4 text-gray-400">{s.quantity} {s.unit}</td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs rounded-full font-medium">
                            {s.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right flex gap-2 justify-end">
                          <button className="p-2 hover:bg-gray-700 rounded transition">
                            <Edit2 size={16} className="text-blue-400" />
                          </button>
                          <button className="p-2 hover:bg-gray-700 rounded transition" onClick={() => deleteSupply(s.id)}>
                            <Trash2 size={16} className="text-red-400" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeMenu === 'settings' && (
            <div className="p-8">
              <div className="space-y-6">
                <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                  <div className="flex items-start gap-4">
                    <AlertCircle size={24} className="text-purple-400 mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white">เชื่อมโยงการเชื่อเดื่อน</h3>
                      <p className="text-gray-500 text-sm mt-1">แจ้งเตือนเมื่อศูนย์พักพิงเต็ม</p>
                    </div>
                    <button className="relative w-12 h-6 bg-blue-600 rounded-full transition flex-shrink-0 hover:bg-blue-700">
                      <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5"></div>
                    </button>
                  </div>
                </div>

                <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <TrendingUp size={24} className="text-green-400" />
                    <h3 className="text-lg font-semibold text-white">API & การเชื่อมต่อ</h3>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                      <p className="text-yellow-400 text-sm font-medium">⚠️ ข้อมูลความลับ</p>
                      <p className="text-yellow-600 text-xs mt-2">ศูนย์การจัดการกับศูนย์อาจารย์ได้เลือกชนิดศูนย์</p>
                    </div>

                    <div>
                      <label className="text-sm text-gray-400 mb-2 block">Current API Key</label>
                      <div className="flex gap-2">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value="sk_live_51M...84k;"
                          readOnly
                          className="flex-1 bg-gray-800 border border-gray-700 rounded px-4 py-2 text-white text-sm font-mono focus:outline-none focus:border-blue-500"
                        />
                        <button onClick={() => setShowPassword(!showPassword)} className="p-2 hover:bg-gray-700 rounded transition">
                          {showPassword ? <EyeOff size={18} className="text-gray-400" /> : <Eye size={18} className="text-gray-400" />}
                        </button>
                        <button className="p-2 hover:bg-gray-700 rounded transition">
                          <Copy size={18} className="text-gray-400" />
                        </button>
                      </div>
                    </div>

                    <button className="w-full px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-300 text-sm font-medium transition flex items-center justify-center gap-2">
                      <RotateCcw size={16} /> สร้างศูนย์ใหม่ (Regenerate)
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {(activeMenu === 'centers' || activeMenu === 'transfer') && (
            <div className="p-8">
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-12 text-center">
                <p className="text-gray-400">หน้านี้อยู่ระหว่างการพัฒนา...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}