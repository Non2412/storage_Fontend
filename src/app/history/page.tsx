"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import styles from './history.module.css';

interface ActivityLog {
    id: string;
    type: 'request' | 'distribution' | 'receipt';
    itemName: string;
    quantity: number;
    unit: string;
    user: string;
    timestamp: Date;
    details?: string;
    status?: string;
}

const MOCK_HISTORY: ActivityLog[] = [
    {
        id: '1',
        type: 'request',
        itemName: 'ข้าวสาร',
        quantity: 50,
        unit: 'กก.',
        user: 'นายสมชาย ใจดี',
        timestamp: new Date('2025-12-20T10:30:00'),
        details: 'สำหรับศูนย์พักพิงบ้านหนองบัว',
        status: 'อนุมัติ'
    },
    {
        id: '2',
        type: 'distribution',
        itemName: 'น้ำดื่ม',
        quantity: 10,
        unit: 'ลัง',
        user: 'นางสาวสมหญิง รักดี',
        timestamp: new Date('2025-12-20T09:15:00'),
        details: 'จ่ายให้ศูนย์พักพิงวัดใหญ่'
    },
    {
        id: '3',
        type: 'receipt',
        itemName: 'ผ้าห่ม',
        quantity: 20,
        unit: 'ผืน',
        user: 'นายประสิทธิ์ ช่วยเหลือ',
        timestamp: new Date('2025-12-19T16:45:00'),
        details: 'รับบริจาคจากมูลนิธิกุศล'
    },
    {
        id: '4',
        type: 'request',
        itemName: 'ยาพาราเซตามอล',
        quantity: 100,
        unit: 'เม็ด',
        user: 'พยาบาลสุดา ใจเย็น',
        timestamp: new Date('2025-12-19T14:20:00'),
        details: 'สำหรับห้องพยาบาล',
        status: 'รอดำเนินการ'
    },
    {
        id: '5',
        type: 'distribution',
        itemName: 'สบู่',
        quantity: 50,
        unit: 'ก้อน',
        user: 'นางสาวมานี ทำดี',
        timestamp: new Date('2025-12-19T11:00:00'),
        details: 'จ่ายให้ครอบครัวผู้ประสบภัย 15 ครอบครัว'
    },
    {
        id: '6',
        type: 'receipt',
        itemName: 'อาหารกระป๋อง',
        quantity: 100,
        unit: 'กระป๋อง',
        user: 'นายสมศักดิ์ มีน้ำใจ',
        timestamp: new Date('2025-12-18T15:30:00'),
        details: 'รับบริจาคจากบริษัทเอกชน'
    }
];

const TYPE_LABELS = {
    request: 'คำขอ',
    distribution: 'การจ่าย',
    receipt: 'การรับ'
};

const TYPE_COLORS = {
    request: '#3b82f6',
    distribution: '#f59e0b',
    receipt: '#22c55e'
};

export default function HistoryPage() {
    const router = useRouter();
    const [isMounted, setIsMounted] = useState(false);
    const [typeFilter, setTypeFilter] = useState<'all' | 'request' | 'distribution' | 'receipt'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [historyItems, setHistoryItems] = useState<ActivityLog[]>([]);
    const [currentUser, setCurrentUser] = useState<string>('');

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (!isMounted) return;

        try {
            const rawUser = localStorage.getItem('ndr_currentUser');
            if (rawUser) {
                const user = JSON.parse(rawUser);
                const userName = user.fullName || user.email || '';
                setCurrentUser(userName);

                // Load requests from localStorage
                const storedRequests = JSON.parse(localStorage.getItem('ems_user_requests') || '[]');

                // Filter requests for current user
                // Note: We match loosely on name to cover both "requesterName" from needs form and "user.fullName" from login
                // Ideally we should use user ID, but for this mock setup name matching is acceptable
                const userRequests = storedRequests.filter((req: ActivityLog) =>
                    req.user === userName || req.user.includes(userName) || userName.includes(req.user)
                );

                // Convert timestamps back to Date objects
                const formattedRequests = userRequests.map((req: any) => ({
                    ...req,
                    timestamp: new Date(req.timestamp)
                }));

                setHistoryItems(formattedRequests);
            } else {
                router.replace('/login');
            }
        } catch (error) {
            console.error('Error loading history:', error);
            router.replace('/login');
        }
    }, [router, isMounted]);

    if (!isMounted) {
        return null;
    }

    const filteredHistory = historyItems.filter(log => {
        const matchesType = typeFilter === 'all' || log.type === typeFilter;
        const matchesSearch = log.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            log.user.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesType && matchesSearch;
    });

    const formatDate = (date: Date) => {
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
                        <h1 className={styles.pageTitle}>ประวัติกิจกรรม</h1>
                        <p className={styles.pageSubtitle}>ติดตามประวัติการเคลื่อนไหวของสิ่งของในคลัง</p>
                    </div>
                </div>

                {/* Filter Bar */}
                <div className={styles.filterBar}>
                    <div className={styles.typeFilters}>
                        <button
                            className={typeFilter === 'all' ? styles.typeButtonActive : styles.typeButton}
                            onClick={() => setTypeFilter('all')}
                        >
                            ทั้งหมด
                        </button>
                        <button
                            className={typeFilter === 'request' ? styles.typeButtonActive : styles.typeButton}
                            onClick={() => setTypeFilter('request')}
                        >
                            คำขอ
                        </button>
                        <button
                            className={typeFilter === 'distribution' ? styles.typeButtonActive : styles.typeButton}
                            onClick={() => setTypeFilter('distribution')}
                        >
                            การจ่าย
                        </button>
                        <button
                            className={typeFilter === 'receipt' ? styles.typeButtonActive : styles.typeButton}
                            onClick={() => setTypeFilter('receipt')}
                        >
                            การรับ
                        </button>
                    </div>

                    <div className={styles.searchBox}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="11" cy="11" r="8" />
                            <path d="m21 21-4.35-4.35" />
                        </svg>
                        <input
                            type="text"
                            placeholder="ค้นหาสิ่งของหรือผู้ใช้..."
                            className={styles.searchInput}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* Timeline */}
                <div className={styles.timeline}>
                    {filteredHistory.map((log, index) => (
                        <div key={log.id} className={styles.timelineItem}>
                            <div className={styles.timelineDot} style={{ background: TYPE_COLORS[log.type] }} />
                            {index < filteredHistory.length - 1 && <div className={styles.timelineLine} />}

                            <div className={styles.activityCard}>
                                <div className={styles.activityHeader}>
                                    <div className={styles.activityType} style={{ color: TYPE_COLORS[log.type] }}>
                                        {TYPE_LABELS[log.type]}
                                    </div>
                                    <div className={styles.activityTime}>{formatDate(log.timestamp)}</div>
                                </div>

                                <div className={styles.activityContent}>
                                    <h3 className={styles.activityTitle}>
                                        {log.itemName} <span className={styles.quantity}>({log.quantity} {log.unit})</span>
                                    </h3>
                                    <p className={styles.activityUser}>โดย: {log.user}</p>
                                    {log.details && <p className={styles.activityDetails}>{log.details}</p>}
                                    {log.status && (
                                        <div className={styles.activityStatus}>
                                            สถานะ: <span className={log.status === 'อนุมัติ' ? styles.statusApproved : styles.statusPending}>
                                                {log.status}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredHistory.length === 0 && (
                    <div className={styles.emptyState}>
                        <p>ไม่พบประวัติกิจกรรม</p>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
