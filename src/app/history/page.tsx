"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import styles from './history.module.css';
import { getRequests, getCurrentUser, type Request } from '@/lib/api';

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

// Map API Request to ActivityLog
function mapRequestToActivity(request: Request): ActivityLog[] {
    return request.items.map(item => ({
        id: `${request._id}-${item.itemId._id}`,
        type: 'request' as const,
        itemName: item.itemId.name,
        quantity: item.quantityRequested,
        unit: item.itemId.unit,
        user: request.requestedBy.name,
        timestamp: new Date(request.createdAt),
        details: `ศูนย์พักพิง: ${request.shelterId.name}`,
        status: request.status === 'pending' ? 'รอดำเนินการ' :
            request.status === 'approved' ? 'อนุมัติ' :
                request.status === 'transferred' ? 'โอนแล้ว' : 'ปฏิเสธ'
    }));
}

export default function HistoryPage() {
    const router = useRouter();
    const [isMounted, setIsMounted] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [typeFilter, setTypeFilter] = useState<'all' | 'request' | 'distribution' | 'receipt'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [historyItems, setHistoryItems] = useState<ActivityLog[]>([]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (!isMounted) return;

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

        // Load history from API
        loadHistory();
    }, [router, isMounted]);

    const loadHistory = async () => {
        setLoading(true);
        setError(null);

        try {
            const user = getCurrentUser();
            if (!user) return;

            // Get all requests (we could filter by user on backend if supported)
            const result = await getRequests();

            if (result.success && result.data) {
                // Map requests to activity logs
                const activities: ActivityLog[] = [];
                result.data.forEach(request => {
                    // Only show requests from current user
                    if (request.requestedBy._id === user.id || request.requestedBy.email === user.email) {
                        activities.push(...mapRequestToActivity(request));
                    }
                });

                // Sort by timestamp descending
                activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

                setHistoryItems(activities);
            } else {
                setError(result.message || 'ไม่สามารถโหลดข้อมูลได้');
            }
        } catch (err) {
            console.error('Error loading history:', err);
            setError('เกิดข้อผิดพลาดในการเชื่อมต่อ');
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
                        <h1 className={styles.pageTitle}>ประวัติการทำรายการ</h1>
                        <p className={styles.pageSubtitle}>กำลังโหลดข้อมูล...</p>
                    </div>
                    <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
                        <p>กำลังโหลดประวัติการทำรายการ...</p>
                    </div>
                </div>
            </AppLayout>
        );
    }

    if (error) {
        return (
            <AppLayout>
                <div className={styles.pageContainer}>
                    <div className={styles.header}>
                        <h1 className={styles.pageTitle}>ประวัติการทำรายการ</h1>
                        <p className={styles.pageSubtitle}>เกิดข้อผิดพลาด</p>
                    </div>
                    <div style={{ padding: '40px', textAlign: 'center' }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px', color: '#ef4444' }}>⚠️</div>
                        <p style={{ color: '#ef4444', marginBottom: '16px' }}>{error}</p>
                        <button
                            onClick={loadHistory}
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

    const filteredHistory = historyItems.filter(log => {
        const matchesType = typeFilter === 'all' || log.type === typeFilter;
        const matchesSearch = log.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            log.user.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesType && matchesSearch;
    });

    return (
        <AppLayout>
            <div className={styles.pageContainer}>
                <div className={styles.header}>
                    <h1 className={styles.pageTitle}>ประวัติการทำรายการ</h1>
                    <p className={styles.pageSubtitle}>ติดตามประวัติการขอและรับสิ่งของ</p>
                </div>

                {/* Filters */}
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
                            placeholder="ค้นหา..."
                            className={styles.searchInput}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* Timeline */}
                {filteredHistory.length > 0 ? (
                    <div className={styles.timeline}>
                        {filteredHistory.map((log, index) => (
                            <div key={log.id} className={styles.timelineItem}>
                                <div
                                    className={styles.timelineDot}
                                    style={{ background: TYPE_COLORS[log.type] }}
                                />
                                {index < filteredHistory.length - 1 && <div className={styles.timelineLine} />}

                                <div className={styles.activityCard} style={{ color: TYPE_COLORS[log.type] }}>
                                    <div className={styles.activityHeader}>
                                        <span className={styles.activityType} style={{ color: TYPE_COLORS[log.type] }}>
                                            {TYPE_LABELS[log.type]}
                                        </span>
                                        <span className={styles.activityTime}>
                                            {log.timestamp.toLocaleDateString('th-TH', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </span>
                                    </div>

                                    <div className={styles.activityContent}>
                                        <h3 className={styles.activityTitle}>{log.itemName}</h3>
                                        <p className={styles.quantity}>
                                            จำนวน: {log.quantity} {log.unit}
                                        </p>
                                        <p className={styles.activityUser}>{log.user}</p>
                                        {log.details && (
                                            <p className={styles.activityDetails}>{log.details}</p>
                                        )}
                                        {log.status && (
                                            <div className={styles.activityStatus}>
                                                สถานะ: <span className={log.status.includes('อนุมัติ') ? styles.statusApproved : styles.statusPending}>
                                                    {log.status}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className={styles.emptyState}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
                        <p>ไม่พบประวัติการทำรายการ</p>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
