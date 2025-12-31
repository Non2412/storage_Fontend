"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import styles from './requests.module.css';
import { getCurrentUser, isAuthenticated } from '@/lib/api';

// Mock data - ในอนาคตจะดึงจาก API
interface Request {
    id: string;
    itemName: string;
    quantity: number;
    unit: string;
    urgency: 'ทั่วไป' | 'ปกติ' | 'ด่วน';
    status: 'pending' | 'approved' | 'rejected' | 'delivered';
    shelterName: string;
    requestDate: string;
    note?: string;
}

const mockRequests: Request[] = [
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
    {
        id: 'REQ-002',
        itemName: 'ข้าวสาร',
        quantity: 50,
        unit: 'กก.',
        urgency: 'ปกติ',
        status: 'pending',
        shelterName: 'ศูนย์พักพิงแจ้งวัฒนะ',
        requestDate: '2024-12-31T14:15:00'
    },
    {
        id: 'REQ-003',
        itemName: 'ผ้าห่ม',
        quantity: 30,
        unit: 'ผืน',
        urgency: 'ทั่วไป',
        status: 'delivered',
        shelterName: 'ศูนย์พักพิงสีลม',
        requestDate: '2024-12-30T09:00:00',
        note: 'สำหรับผู้สูงอายุ'
    },
    {
        id: 'REQ-004',
        itemName: 'ยาพาราเซตามอล',
        quantity: 100,
        unit: 'เม็ด',
        urgency: 'ด่วน',
        status: 'rejected',
        shelterName: 'ศูนย์พักพิงอุบล',
        requestDate: '2024-12-30T16:45:00',
        note: 'สต็อกไม่เพียงพอ'
    }
];

const STATUS_LABELS = {
    pending: 'รอดำเนินการ',
    approved: 'อนุมัติแล้ว',
    rejected: 'ปฏิเสธ',
    delivered: 'ส่งมอบแล้ว'
};

const STATUS_COLORS = {
    pending: '#f59e0b',
    approved: '#22c55e',
    rejected: '#ef4444',
    delivered: '#06b6d4'
};

const URGENCY_COLORS = {
    'ทั่วไป': '#06b6d4',
    'ปกติ': '#f59e0b',
    'ด่วน': '#ef4444'
};

export default function RequestsPage() {
    const router = useRouter();
    const [isMounted, setIsMounted] = useState(false);
    const [requests, setRequests] = useState<Request[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'delivered'>('all');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (!isMounted) return;

        // Check authentication
        if (!isAuthenticated()) {
            router.replace('/login');
            return;
        }

        // Load requests data
        loadRequests();
    }, [router, isMounted]);

    const loadRequests = async () => {
        setLoading(true);
        try {
            // Read from localStorage
            const userRequests = JSON.parse(localStorage.getItem('user_requests') || '[]');

            // Combine with mock data (mock data for demonstration)
            const allRequests = [...userRequests, ...mockRequests];

            setRequests(allRequests);
        } catch (err) {
            console.error('Error loading requests:', err);
            // Fallback to mock data if localStorage fails
            setRequests(mockRequests);
        } finally {
            setLoading(false);
        }
    };

    if (!isMounted) {
        return null;
    }

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
        const matchesSearch = req.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            req.shelterName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            req.id.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    const stats = {
        total: requests.length,
        pending: requests.filter(r => r.status === 'pending').length,
        approved: requests.filter(r => r.status === 'approved').length,
        delivered: requests.filter(r => r.status === 'delivered').length
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('th-TH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
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
                        <button
                            className={statusFilter === 'rejected' ? styles.typeButtonActive : styles.typeButton}
                            onClick={() => setStatusFilter('rejected')}
                        >
                            ปฏิเสธ
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
                                <div className={styles.requestId}>{request.id}</div>
                                <div className={styles.requestDate}>{formatDate(request.requestDate)}</div>
                            </div>

                            <div className={styles.requestBody}>
                                <div className={styles.requestMain}>
                                    <h3 className={styles.itemName}>{request.itemName}</h3>
                                    <div className={styles.requestDetails}>
                                        <div className={styles.detailItem}>
                                            <span className={styles.detailLabel}>จำนวน:</span>
                                            <span className={styles.detailValue}>{request.quantity} {request.unit}</span>
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

                                <div className={styles.requestBadges}>
                                    <div
                                        className={styles.statusBadge}
                                        style={{
                                            background: `${STATUS_COLORS[request.status]}15`,
                                            color: STATUS_COLORS[request.status],
                                            border: `1px solid ${STATUS_COLORS[request.status]}30`
                                        }}
                                    >
                                        {STATUS_LABELS[request.status]}
                                    </div>
                                    <div
                                        className={styles.urgencyBadge}
                                        style={{
                                            background: `${URGENCY_COLORS[request.urgency]}15`,
                                            color: URGENCY_COLORS[request.urgency],
                                            border: `1px solid ${URGENCY_COLORS[request.urgency]}30`
                                        }}
                                    >
                                        {request.urgency}
                                    </div>
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
