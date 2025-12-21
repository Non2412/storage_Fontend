"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './requests.module.css';
import AppLayout from '@/components/AppLayout';

export default function RequestsPage() {
    const router = useRouter();
    const [isMounted, setIsMounted] = useState(false);

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

    return (
        <AppLayout>
            <div className={styles.pageContainer}>
                {/* Header */}
                <div className={styles.header}>
                    <div>
                        <h1 className={styles.pageTitle}>คำร้องขอสิ่งของ</h1>
                        <p className={styles.pageSubtitle}>แสดงรายการคำร้องขอสิ่งของที่ส่งมาจากศูนย์พักพิงในพื้นที่</p>
                    </div>
                    <button className={styles.createButton}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        เพิ่มคำร้อง
                    </button>
                </div>

                {/* Info Banner */}
                <div className={styles.infoBanner}>
                    <svg className={styles.infoIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 16v-4M12 8h.01" />
                    </svg>
                    <span>คุณมี <strong>คำร้องที่รอดำเนินการ (Read-Only)</strong> ในขณะนี้ ให้คลิกที่ปุ่มดำเนินการเพื่อให้ข้อมูลเพิ่มเติม ✓</span>
                </div>

                {/* Stats Cards */}
                <div className={styles.statsRow}>
                    <div className={styles.statCard}>
                        <div className={styles.statLabel}>ทั้งหมด</div>
                        <div className={styles.statValue}>0</div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statLabel}>รอดำเนินการ</div>
                        <div className={styles.statValue}>0</div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statLabel}>อนุมัติ</div>
                        <div className={styles.statValue}>0</div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statLabel}>ปฏิเสธ</div>
                        <div className={styles.statValue}>0</div>
                    </div>
                </div>

                {/* Filters and Tabs */}
                <div className={styles.controlsSection}>
                    <div className={styles.filterRow}>
                        <div className={styles.filterLabel}>ตัวกรอง</div>
                        <div className={styles.filters}>
                            <button className={`${styles.filterButton} ${styles.filterButtonActive}`}>
                                ทั้งหมด
                            </button>
                            <button className={styles.filterButton}>
                                รอดำเนินการ
                            </button>
                            <button className={styles.filterButton}>
                                อนุมัติ
                            </button>
                            <button className={styles.filterButton}>
                                ปฏิเสธ
                            </button>
                        </div>
                    </div>

                    <div className={styles.searchAndFilters}>
                        <div className={styles.searchBox}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="11" cy="11" r="8" />
                                <path d="m21 21-4.35-4.35" />
                            </svg>
                            <input type="text" placeholder="ค้นหาคำร้องขอ..." className={styles.searchInput} />
                        </div>

                        <select className={styles.selectFilter}>
                            <option>-- ศูนย์พักพิง --</option>
                        </select>

                        <select className={styles.selectFilter}>
                            <option>-- ประเภทคำร้องขอ --</option>
                        </select>
                    </div>

                    <div className={styles.dateFilters}>
                        <div className={styles.dateLabel}>ช่วงวันที่</div>
                        <input type="date" className={styles.dateInput} placeholder="วว/ดด/ปปปป" />
                        <input type="date" className={styles.dateInput} placeholder="วว/ดด/ปปปป" />
                    </div>
                </div>

                {/* Empty State */}
                <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>
                        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M9 11H3v8h6m4 0h8v-8h-6m-2 8V3m0 18v-8" />
                        </svg>
                    </div>
                    <p className={styles.emptyText}>ไม่มีข้อมูลคำร้องขอสิ่งของ</p>
                </div>
            </div>
        </AppLayout>
    );
}
