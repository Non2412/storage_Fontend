"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import styles from './inventory.module.css';
import { getItems, submitRequest, getCurrentUser, getShelters, getWarehouses, getStockStatus, type Item, type Shelter, type StockItem } from '@/lib/api';
import { ItemCategory, CATEGORY_LABELS, getItemStatus, STATUS_LABELS, type InventoryItem } from '@/types/inventory';

// Map backend Item to frontend InventoryItem
function mapItemToInventory(item: Item, stockQuantity: number = 0): InventoryItem {
  const categoryName = typeof item.categoryId === 'object' ? item.categoryId.name : '';
  const categoryMap: Record<string, ItemCategory> = {
    'อาหาร': 'food',
    'อาหารและเครื่องดื่ม': 'food',
    'เสื้อผ้า': 'clothing',
    'เสื้อผ้าและผ้าห่ม': 'clothing',
    'ยา': 'medical',
    'ยาและเวชภัณฑ์': 'medical',
    'สุขอนามัย': 'hygiene',
    'อุปกรณ์สุขอนามัย': 'hygiene',
    'ทั่วไป': 'general',
    'อุปกรณ์ทั่วไป': 'general',
  };

  return {
    id: item._id,
    name: item.name,
    category: categoryMap[categoryName] || 'general',
    quantity: stockQuantity,
    maxQuantity: stockQuantity * 2 || 100, // Estimate max as double current, or default 100
    unit: item.unit,
    description: item.description
  };
}

export default function InventoryPage() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<ItemCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'low' | 'out'>('all');
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [requestQuantity, setRequestQuantity] = useState(1);
  const [requestReason, setRequestReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [selectedShelterId, setSelectedShelterId] = useState<string>('');

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    // Check authentication
    try {
      const user = getCurrentUser();
      if (!user) {
        router.replace('/login');
        return;
      }
    } catch {
      router.replace('/login');
      return;
    }

    // Load inventory data from API
    loadInventoryData();
    loadShelters();
  }, [router, isMounted]);

  const loadShelters = async () => {
    try {
      const result = await getShelters();
      if (result.success && result.data) {
        setShelters(result.data);
        // Auto-select first shelter if available
        if (result.data.length > 0) {
          setSelectedShelterId(result.data[0]._id);
        }
      }
    } catch (err) {
      console.error('Error loading shelters:', err);
    }
  };

  const loadInventoryData = async () => {
    setLoading(true);
    setError(null);

    try {
      // First, get all warehouses
      const warehousesResult = await getWarehouses();
      
      if (!warehousesResult.success || !warehousesResult.data || warehousesResult.data.length === 0) {
        setError('ไม่พบข้อมูลคลังสินค้า');
        return;
      }

      // Collect stock from all warehouses
      const allStockItems: Map<string, { item: StockItem; totalQuantity: number; maxQuantity: number }> = new Map();

      for (const warehouse of warehousesResult.data) {
        const stockResult = await getStockStatus(warehouse._id);
        
        if (stockResult.success && stockResult.data && stockResult.data.items) {
          for (const stockItem of stockResult.data.items) {
            const existing = allStockItems.get(stockItem.itemId);
            if (existing) {
              existing.totalQuantity += stockItem.quantity;
              existing.maxQuantity += stockItem.minAlert * 3; // Estimate max as 3x minAlert
            } else {
              allStockItems.set(stockItem.itemId, {
                item: stockItem,
                totalQuantity: stockItem.quantity,
                maxQuantity: stockItem.minAlert * 3
              });
            }
          }
        }
      }

      // Convert to InventoryItem format
      const inventoryItems: InventoryItem[] = Array.from(allStockItems.values()).map(({ item, totalQuantity, maxQuantity }) => {
        // Determine category from item name (simple mapping)
        let category: ItemCategory = 'general';
        const name = item.itemName.toLowerCase();
        if (name.includes('ข้าว') || name.includes('น้ำ') || name.includes('นม') || name.includes('อาหาร') || name.includes('rice') || name.includes('water') || name.includes('food') || name.includes('milk') || name.includes('bread') || name.includes('egg')) {
          category = 'food';
        } else if (name.includes('เสื้อ') || name.includes('ผ้า') || name.includes('blanket') || name.includes('shirt') || name.includes('pants') || name.includes('clothing')) {
          category = 'clothing';
        } else if (name.includes('ยา') || name.includes('พลาส') || name.includes('แอลกอฮอล') || name.includes('medicine') || name.includes('first aid') || name.includes('paracetamol') || name.includes('diarrheal')) {
          category = 'medical';
        } else if (name.includes('สบู่') || name.includes('แปรง') || name.includes('soap') || name.includes('toothbrush') || name.includes('towel')) {
          category = 'hygiene';
        }

        return {
          id: item.itemId,
          name: item.itemName,
          category,
          quantity: totalQuantity,
          maxQuantity: maxQuantity,
          unit: item.unit,
          description: `สถานะ: ${item.status === 'normal' ? 'ปกติ' : 'ใกล้หมด'}`
        };
      });

      if (inventoryItems.length === 0) {
        // Fallback to items API if no stock data
        const itemsResult = await getItems();
        if (itemsResult.success && itemsResult.data) {
          const fallbackItems = itemsResult.data.map(item =>
            mapItemToInventory(item, 0)
          );
          setItems(fallbackItems);
        } else {
          setError('ไม่พบข้อมูลสินค้า');
        }
      } else {
        setItems(inventoryItems);
      }
    } catch (err) {
      console.error('Error loading inventory:', err);
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestItem = (item: InventoryItem) => {
    setSelectedItem(item);
    setRequestQuantity(1);
    setRequestReason('');
    setShowRequestModal(true);
  };

  const handleSubmitRequest = async () => {
    if (!selectedItem) return;

    setSubmitting(true);
    try {
      const user = getCurrentUser();
      if (!user) {
        alert('กรุณาเข้าสู่ระบบ');
        return;
      }

      // Validate shelter selection
      if (!selectedShelterId) {
        alert('กรุณาเลือกศูนย์พักพิง');
        return;
      }

      // Submit request via API
      const result = await submitRequest(
        selectedShelterId,
        [{
          itemId: selectedItem.id,
          quantityRequested: requestQuantity
        }]
      );

      if (result.success) {
        alert(`ส่งคำขอ ${selectedItem.name} จำนวน ${requestQuantity} ${selectedItem.unit} เรียบร้อย`);
        setShowRequestModal(false);
        setSelectedItem(null);
        setRequestReason('');
      } else {
        alert(result.message || 'ไม่สามารถส่งคำขอได้');
      }
    } catch (err) {
      console.error('Error submitting request:', err);
      alert('เกิดข้อผิดพลาดในการส่งคำขอ');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isMounted) {
    return null;
  }

  // Show loading state
  if (loading) {
    return (
      <AppLayout>
        <div className={styles.pageContainer}>
          <div className={styles.header}>
            <div>
              <h1 className={styles.pageTitle}>คลังสิ่งของ</h1>
              <p className={styles.pageSubtitle}>กำลังโหลดข้อมูล...</p>
            </div>
          </div>
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
            <p>กำลังโหลดข้อมูลคลังสิ่งของ...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Show error state
  if (error) {
    return (
      <AppLayout>
        <div className={styles.pageContainer}>
          <div className={styles.header}>
            <div>
              <h1 className={styles.pageTitle}>คลังสิ่งของ</h1>
              <p className={styles.pageSubtitle}>เกิดข้อผิดพลาด</p>
            </div>
          </div>
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px', color: '#ef4444' }}>⚠️</div>
            <p style={{ color: '#ef4444', marginBottom: '16px' }}>{error}</p>
            <button
              onClick={loadInventoryData}
              style={{
                padding: '12px 24px',
                background: 'var(--primary)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              ลองอีกครั้ง
            </button>
          </div>
        </div>
      </AppLayout>
    );
  }

  const filteredItems = items.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const itemStatus = getItemStatus(item.quantity, item.maxQuantity);
    const matchesStatus = statusFilter === 'all' || itemStatus === statusFilter;

    return matchesCategory && matchesSearch && matchesStatus;
  });

  const stats = {
    total: items.length,
    available: items.filter(i => getItemStatus(i.quantity, i.maxQuantity) === 'available').length,
    low: items.filter(i => getItemStatus(i.quantity, i.maxQuantity) === 'low').length,
    out: items.filter(i => getItemStatus(i.quantity, i.maxQuantity) === 'out').length
  };

  return (
    <AppLayout>
      <div className={styles.pageContainer}>
        {/* Header */}
        <div className={styles.header}>
          <div>
            <h1 className={styles.pageTitle}>คลังสิ่งของ</h1>
            <p className={styles.pageSubtitle}>จัดการและติดตามสิ่งของในคลัง</p>
          </div>
        </div>

        {/* Stats */}
        <div className={styles.statsRow}>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>ทั้งหมด</div>
            <div className={styles.statValue}>{stats.total}</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>มี</div>
            <div className={styles.statValue} style={{ color: '#22c55e' }}>{stats.available}</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>ใกล้หมด</div>
            <div className={styles.statValue} style={{ color: '#f59e0b' }}>{stats.low}</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>หมด</div>
            <div className={styles.statValue} style={{ color: '#ef4444' }}>{stats.out}</div>
          </div>
        </div>

        {/* Category Tabs */}
        <div className={styles.categoryTabs}>
          <button
            className={selectedCategory === 'all' ? styles.categoryTabActive : styles.categoryTab}
            onClick={() => setSelectedCategory('all')}
          >
            ทั้งหมด
          </button>
          {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
            <button
              key={key}
              className={selectedCategory === key ? styles.categoryTabActive : styles.categoryTab}
              onClick={() => setSelectedCategory(key as ItemCategory)}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className={styles.filterBar}>
          <div className={styles.searchBox}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="ค้นหาสิ่งของ..."
              className={styles.searchInput}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <select
            className={styles.selectFilter}
            value={statusFilter}
            onChange={(e) => {
              const value = e.target.value;
              if (value === 'all' || value === 'available' || value === 'low' || value === 'out') {
                setStatusFilter(value);
              }
            }}
          >
            <option value="all">สถานะทั้งหมด</option>
            <option value="available">มี</option>
            <option value="low">ใกล้หมด</option>
            <option value="out">หมด</option>
          </select>
        </div>

        {/* Items Grid */}
        <div className={styles.itemsGrid}>
          {filteredItems.map(item => {
            const status = getItemStatus(item.quantity, item.maxQuantity);
            const percentage = (item.quantity / item.maxQuantity) * 100;

            const statusClass = status === 'available' ? styles.statusAvailable :
              status === 'low' ? styles.statusLow :
                styles.statusOut;

            return (
              <div key={item.id} className={styles.itemCard}>
                <div className={styles.itemHeader}>
                  <div className={styles.itemIcon}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                      <line x1="7" y1="7" x2="7.01" y2="7" />
                    </svg>
                  </div>
                  <div className={`${styles.statusBadge} ${statusClass}`}>
                    {STATUS_LABELS[status]}
                  </div>
                </div>

                <h3 className={styles.itemName}>{item.name}</h3>
                <p className={styles.itemCategory}>{CATEGORY_LABELS[item.category]}</p>

                <div className={styles.quantityInfo}>
                  <div className={styles.quantityText}>
                    <span className={styles.currentQty}>{item.quantity}</span>
                    <span className={styles.maxQty}>/ {item.maxQuantity}</span>
                    <span className={styles.unit}>{item.unit}</span>
                  </div>
                  <div className={styles.percentageText}>{Math.round(percentage)}%</div>
                </div>

                <div className={styles.progressBar}>
                  <div
                    className={styles.progressFill}
                    style={{
                      width: `${percentage}%`,
                      background: status === 'available' ? '#22c55e' : status === 'low' ? '#f59e0b' : '#ef4444'
                    }}
                  />
                </div>

                {item.description && (
                  <p className={styles.itemDescription}>{item.description}</p>
                )}

                <button
                  className={styles.requestButton}
                  onClick={() => handleRequestItem(item)}
                  disabled={status === 'out'}
                >
                  {status === 'out' ? 'หมดแล้ว' : 'ขอสิ่งของ'}
                </button>
              </div>
            );
          })}
        </div>

        {filteredItems.length === 0 && (
          <div className={styles.emptyState}>
            <p>ไม่พบสิ่งของที่ค้นหา</p>
          </div>
        )}

        {/* Request Modal */}
        {showRequestModal && selectedItem && (
          <div className={styles.modalOverlay} onClick={() => !submitting && setShowRequestModal(false)}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h2>ขอสิ่งของ</h2>
                <button
                  className={styles.closeButton}
                  onClick={() => setShowRequestModal(false)}
                  disabled={submitting}
                >
                  ×
                </button>
              </div>

              <div className={styles.modalBody}>
                <div className={styles.formGroup}>
                  <label>ศูนย์พักพิง</label>
                  <select
                    value={selectedShelterId}
                    onChange={(e) => setSelectedShelterId(e.target.value)}
                    className={styles.input}
                    disabled={submitting}
                  >
                    <option value="">-- เลือกศูนย์พักพิง --</option>
                    {shelters.map((shelter) => (
                      <option key={shelter._id} value={shelter._id}>
                        {shelter.name} ({shelter.province})
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label>สิ่งของ</label>
                  <input type="text" value={selectedItem.name} disabled className={styles.input} />
                </div>

                <div className={styles.formGroup}>
                  <label>จำนวน ({selectedItem.unit})</label>
                  <input
                    type="number"
                    min="1"
                    max={selectedItem.quantity}
                    value={requestQuantity}
                    onChange={(e) => setRequestQuantity(parseInt(e.target.value) || 1)}
                    className={styles.input}
                    disabled={submitting}
                  />
                  <small>มีในคลัง: {selectedItem.quantity} {selectedItem.unit}</small>
                </div>

                <div className={styles.formGroup}>
                  <label>เหตุผล/หมายเหตุ</label>
                  <textarea
                    value={requestReason}
                    onChange={(e) => setRequestReason(e.target.value)}
                    className={styles.textarea}
                    rows={3}
                    placeholder="ระบุเหตุผลในการขอสิ่งของ..."
                    disabled={submitting}
                  />
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button
                  className={styles.cancelButton}
                  onClick={() => setShowRequestModal(false)}
                  disabled={submitting}
                >
                  ยกเลิก
                </button>
                <button
                  className={styles.submitButton}
                  onClick={handleSubmitRequest}
                  disabled={submitting}
                >
                  {submitting ? 'กำลังส่ง...' : 'ส่งคำขอ'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
