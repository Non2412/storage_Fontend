"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import styles from './inventory.module.css';
import { MOCK_INVENTORY } from '@/data/mockInventory';
import { ItemCategory, CATEGORY_LABELS, getItemStatus, STATUS_LABELS, type InventoryItem } from '@/types/inventory';

export default function InventoryPage() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ItemCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'low' | 'out'>('all');
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [requestQuantity, setRequestQuantity] = useState(1);
  const [requestReason, setRequestReason] = useState('');

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    try {
      const raw = localStorage.getItem('ndr_currentUser');
      if (!raw) {
        router.replace('/login');
        return;
      }
    } catch {
      router.replace('/login');
    }
  }, [router, isMounted]);

  if (!isMounted) {
    return null;
  }

  const filteredItems = MOCK_INVENTORY.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const itemStatus = getItemStatus(item.quantity, item.maxQuantity);
    const matchesStatus = statusFilter === 'all' || itemStatus === statusFilter;

    return matchesCategory && matchesSearch && matchesStatus;
  });

  const stats = {
    total: MOCK_INVENTORY.length,
    available: MOCK_INVENTORY.filter(i => getItemStatus(i.quantity, i.maxQuantity) === 'available').length,
    low: MOCK_INVENTORY.filter(i => getItemStatus(i.quantity, i.maxQuantity) === 'low').length,
    out: MOCK_INVENTORY.filter(i => getItemStatus(i.quantity, i.maxQuantity) === 'out').length
  };

  const handleRequestItem = (item: InventoryItem) => {
    setSelectedItem(item);
    setRequestQuantity(1);
    setRequestReason('');
    setShowRequestModal(true);
  };

  const handleSubmitRequest = () => {
    // TODO: Save request to localStorage or API
    alert(`ส่งคำขอ ${selectedItem?.name} จำนวน ${requestQuantity} ${selectedItem?.unit} เรียบร้อย`);
    setShowRequestModal(false);
    setSelectedItem(null);
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

            // Get status badge class
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
          <div className={styles.modalOverlay} onClick={() => setShowRequestModal(false)}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h2>ขอสิ่งของ</h2>
                <button className={styles.closeButton} onClick={() => setShowRequestModal(false)}>×</button>
              </div>

              <div className={styles.modalBody}>
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
                  />
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button className={styles.cancelButton} onClick={() => setShowRequestModal(false)}>
                  ยกเลิก
                </button>
                <button className={styles.submitButton} onClick={handleSubmitRequest}>
                  ส่งคำขอ
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
