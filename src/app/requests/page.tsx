"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import styles from './requests.module.css';
import { getCurrentUser, isAuthenticated, getRequests, cancelRequest, type Request as ApiRequest } from '@/lib/api';

// Frontend Display Interface
interface RequestDisplay {
    id: string;
    itemName: string;
    quantity: number; // Just for display, might be sum or representative
    unit: string;
    urgency: 'ทั่วไป' | 'ปกติ' | 'ด่วน';
    status: 'pending' | 'approved' | 'rejected' | 'delivered';
    shelterName: string;
    requestDate: string;
    note?: string;
    rawRequest?: ApiRequest | any; // Keep original for cancel
}

// Mock data as fallback
const mockRequests: RequestDisplay[] = [
    {
        id: 'REQ-001',
        itemName: 'น้ำดื่ม',
        quantity: 200,
        unit: 'ขวด',
        urgency: 'ด่วน',
        status: 'approved',
        shelterName: 'ศูนย์พักพิงบางกอก',
        requestDate: '2024-12-31T10:30:00',
        note: 'ต้องการภายในวันนี้'
    },
];

const STATUS_LABELS: Record<string, string> = {
    pending: 'รอดำเนินการ',
    approved: 'อนุมัติแล้ว',
    rejected: 'ปฏิเสธ',
    delivered: 'ส่งมอบแล้ว',
    transferred: 'โอนย้ายแล้ว'
};

const STATUS_COLORS: Record<string, string> = {
    pending: '#f59e0b',
    approved: '#22c55e',
    rejected: '#ef4444',
    delivered: '#06b6d4',
    transferred: '#8b5cf6'
};

const URGENCY_COLORS: Record<string, string> = {
    'ทั่วไป': '#06b6d4',
    'ปกติ': '#f59e0b',
    'ด่วน': '#ef4444'
};

export default function RequestsPage() {
    const router = useRouter();
    const [isMounted, setIsMounted] = useState(false);
    const [requests, setRequests] = useState<RequestDisplay[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'delivered'>('all');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (!isMounted) return;

        if (!isAuthenticated()) {
            router.replace('/login');
            return;
        }

        loadRequests();
    }, [router, isMounted]);

    const loadRequests = async () => {
        setLoading(true);
        try {
            const result = await getRequests();
            if (result.success && result.data) {
                // Transform API requests to Display format
                const mappedRequests: RequestDisplay[] = result.data.map((req: any) => {
                    // Handle Items (could be multiple)
                    const items = req.items || [];
                    let itemName = "ไม่ระบุรายการ";
                    let quantity = 0;
                    let unit = "";

                    if (items.length > 0) {
                        const firstItem = items[0];
                        // Check nesting structure (demo vs api might differ slightly)
                        const name = firstItem.itemId?.name || firstItem.itemId?.itemName || "Item";
                        const qty = firstItem.quantityRequested || 0;
                        const u = firstItem.itemId?.unit || "หน่วย";

                        if (items.length > 1) {
                            itemName = `${name} และอีก ${items.length - 1} รายการ`;
                        } else {
                            itemName = name;
                        }
                        quantity = qty;
                        unit = u;
                    }

                    // Handle Shelter Name
                    let shelterName = "ไม่ระบุศูนย์";
                    if (typeof req.shelterId === 'string') shelterName = req.shelterId;
                    else if (req.shelterId?.name) shelterName = req.shelterId.name;

                    // Urgency (Mock logic based on keywords or random if not present)
                    // API doesn't have urgency field yet, let's infer or default
                    let urgency: 'ทั่วไป' | 'ปกติ' | 'ด่วน' = 'ปกติ';
                    if (req.reason && (req.reason.includes('ด่วน') || req.reason.includes('urgent'))) urgency = 'ด่วน';

                    return {
                        id: req._id,
                        itemName,
                        quantity,
                        unit,
                        urgency,
                        status: req.status || 'pending',
                        shelterName,
                        requestDate: req.createdAt,
                        note: req.reason,
                        rawRequest: req
                    };
                });

                setRequests(mappedRequests);
            } else {
                setRequests(mockRequests);
            }
        } catch (err) {
            console.error('Error loading requests:', err);
            setRequests(mockRequests);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (requestId: string) => {
        if (!confirm('ยืนยันที่จะยกเลิกคำร้องขอนี้?')) return;

        try {
            const result = await cancelRequest(requestId);
            if (result.success) {
                alert('ยกเลิกคำร้องเรียบร้อย');
                loadRequests(); // Reload
            } else {
                // แสดง error message ที่ชัดเจน
                const errorMsg = result.message || 'ไม่สามารถยกเลิกคำร้องที่ไม่ใช่สถานะรอดำเนินการได้';
                alert('ไม่สามารถยกเลิกได้: ' + errorMsg);
            }
        } catch (error) {
            console.error('Cancel error:', error);
            alert('เกิดข้อผิดพลาดในการยกเลิก');
        }
    };

    if (!isMounted) return null;

    if (loading) {
        return (
            <AppLayout>
                <div className={styles.pageContainer}>
                    <div className={styles.header}>
                        <div>
                            <h1 className={styles.pageTitle}>ตรวจสอบคำร้องขอ</h1>
                            <p className={styles.pageSubtitle}>กำลังโหลดข้อมูล...</p>
                        </div>
                    </div>
                    <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
                        <p>กำลังโหลดข้อมูลคำร้องขอ...</p>
                    </div>
                </div>
            </AppLayout>
        );
    }

    const filteredRequests = requests.filter(req => {
        const matchesStatus = statusFilter === 'all' || req.status === statusFilter;
        // Safe check for properties
        const matchesSearch = (req.itemName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (req.shelterName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (req.id || '').toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    const stats = {
        total: requests.length,
        pending: requests.filter(r => r.status === 'pending').length,
        approved: requests.filter(r => r.status === 'approved').length,
        delivered: requests.filter(r => r.status === 'delivered').length
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return "-";
        try {
            const date = new Date(dateString);
            return new Intl.DateTimeFormat('th-TH', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }).format(date);
        } catch (e) {
            return dateString;
        }
    };

    return (
        <AppLayout>
            <div className={styles.pageContainer}>
                {/* Header */}
                <div className={styles.header}>
                    <div>
                        <h1 className={styles.pageTitle}>ตรวจสอบคำร้องขอ</h1>
                        <p className={styles.pageSubtitle}>ติดตามสถานะคำร้องขอสิ่งของของคุณ</p>
                    </div>
                </div>

                {/* Stats */}
                <div className={styles.statsRow}>
                    <div className={styles.statCard}>
                        <div className={styles.statLabel}>ทั้งหมด</div>
                        <div className={styles.statValue}>{stats.total}</div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statLabel}>รอดำเนินการ</div>
                        <div className={styles.statValue} style={{ color: '#f59e0b' }}>{stats.pending}</div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statLabel}>อนุมัติแล้ว</div>
                        <div className={styles.statValue} style={{ color: '#22c55e' }}>{stats.approved}</div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statLabel}>ส่งมอบแล้ว</div>
                        <div className={styles.statValue} style={{ color: '#06b6d4' }}>{stats.delivered}</div>
                    </div>
                </div>

                {/* Filters */}
                <div className={styles.filterBar}>
                    <div className={styles.typeFilters}>
                        <button
                            className={statusFilter === 'all' ? styles.typeButtonActive : styles.typeButton}
                            onClick={() => setStatusFilter('all')}
                        >
                            ทั้งหมด
                        </button>
                        <button
                            className={statusFilter === 'pending' ? styles.typeButtonActive : styles.typeButton}
                            onClick={() => setStatusFilter('pending')}
                        >
                            รอดำเนินการ
                        </button>
                        <button
                            className={statusFilter === 'approved' ? styles.typeButtonActive : styles.typeButton}
                            onClick={() => setStatusFilter('approved')}
                        >
                            อนุมัติแล้ว
                        </button>
                        <button
                            className={statusFilter === 'delivered' ? styles.typeButtonActive : styles.typeButton}
                            onClick={() => setStatusFilter('delivered')}
                        >
                            ส่งมอบแล้ว
                        </button>
                    </div>

                    <div className={styles.searchBox}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="11" cy="11" r="8" />
                            <path d="m21 21-4.35-4.35" />
                        </svg>
                        <input
                            type="text"
                            placeholder="ค้นหาคำร้อง..."
                            className={styles.searchInput}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* Requests List */}
                <div className={styles.requestsList}>
                    {filteredRequests.map(request => (
                        <div key={request.id} className={styles.requestCard}>
                            <div className={styles.requestHeader}>
                                <div className={styles.requestId}>
                                    {request.id.startsWith('local_') ? 'DEMO-REQ' : request.id.substring(0, 8).toUpperCase()}
                                </div>
                                <div className={styles.requestDate}>{formatDate(request.requestDate)}</div>
                            </div>

                            <div className={styles.requestBody}>
                                <div className={styles.requestMain}>
                                    <h3 className={styles.itemName}>{request.itemName}</h3>
                                    <div className={styles.requestDetails}>
                                        <div className={styles.detailItem}>
                                            <span className={styles.detailLabel}>จำนวนรวม:</span>
                                            <span className={styles.detailValue}>{request.quantity} ชิ้น/รายการ</span>
                                        </div>
                                        <div className={styles.detailItem}>
                                            <span className={styles.detailLabel}>ศูนย์พักพิง:</span>
                                            <span className={styles.detailValue}>{request.shelterName}</span>
                                        </div>
                                    </div>
                                    {request.note && (
                                        <div className={styles.requestNote}>
                                            <strong>หมายเหตุ:</strong> {request.note}
                                        </div>
                                    )}
                                </div>

                                <div className={styles.requestBadges} style={{ flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <div
                                            className={styles.statusBadge}
                                            style={{
                                                background: `${STATUS_COLORS[request.status] || '#999'}15`,
                                                color: STATUS_COLORS[request.status] || '#999',
                                                border: `1px solid ${STATUS_COLORS[request.status] || '#999'}30`
                                            }}
                                        >
                                            {STATUS_LABELS[request.status] || request.status}
                                        </div>
                                    </div>

                                    {request.status === 'pending' && (
                                        <button
                                            onClick={() => handleCancel(request.id)}
                                            style={{
                                                padding: '6px 12px',
                                                fontSize: '13px',
                                                color: '#ef4444',
                                                background: '#fff',
                                                border: '1px solid #ef4444',
                                                borderRadius: '6px',
                                                cursor: 'pointer',
                                                marginTop: '8px'
                                            }}
                                        >
                                            ยกเลิกคำร้อง
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredRequests.length === 0 && (
                    <div className={styles.emptyState}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
                        <p>ไม่พบคำร้องขอที่ค้นหา</p>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
