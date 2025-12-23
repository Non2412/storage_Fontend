"use client";

import React, { useEffect, useState } from 'react';
import styles from './dashboard.module.css';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import { getDashboardOverview, getShelterStatus, logout, isAuthenticated, getCurrentUser, type DashboardOverview, type ShelterStatus } from '@/lib/api';

export default function DashboardPage() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [dashboardData, setDashboardData] = useState<DashboardOverview | null>(null);
  const [totalPeople, setTotalPeople] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState('พนักงาน');

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    if (!isAuthenticated()) {
      router.replace('/');
      return;
    }

    // Get user name
    const user = getCurrentUser();
    if (user) {
      setUserName(user.name || user.email || 'พนักงาน');
    }

    // Fetch dashboard data
    async function fetchData() {
      setIsLoading(true);
      try {
        const [ovResult, shResult] = await Promise.all([
          getDashboardOverview(),
          getShelterStatus()
        ]);

        if (ovResult.success && ovResult.data) {
          setDashboardData(ovResult.data);
        }

        if (shResult.success && shResult.data) {
          const total = shResult.data.reduce((sum: number, s: ShelterStatus) => sum + (s.currentPeople || 0), 0);
          setTotalPeople(total);
        }
      } catch (err) {
        console.error('Error fetching dashboard:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [router, isMounted]);

  function signOut() {
    logout();
  }

  if (!isMounted) {
    return null;
  }

  // Get stats from API data or use defaults
  const shelterTotal = dashboardData?.shelters?.total ?? 0;
  const shelterActive = dashboardData?.shelters?.normal ?? 0;
  const requestsTotal = dashboardData?.requests?.total ?? 0;
  const requestsPending = dashboardData?.requests?.pending ?? 0;
  const requestsApproved = dashboardData?.requests?.approved ?? 0;

  return (
    <AppLayout>
      <div className={styles.pageWrapper}>
        {/* Header */}
        <header className={styles.header}>
          <div>
            <h1 className={styles.pageTitle}>ศรีสะเกษพร้อม</h1>
            <p className={styles.pageSubtitle}>ระบบบริหารจัดการสภาวะวิกฤตและภัยพิบัติของจังหวัดศรีสะเกษ</p>
          </div>
          <button className={styles.headerButton} onClick={signOut}>{userName}</button>
        </header>

        {/* Content */}
        <div className={styles.content}>
          {/* Top Stats Row */}
          <div className={styles.statsRow}>
            <div className={styles.statCardTop}>
              <div className={styles.statIconWrapper} style={{ background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)' }}>
                <svg className={styles.statIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16" />
                  <rect x="3" y="21" width="18" height="2" />
                </svg>
              </div>
              <div className={styles.statLabel}>ศูนย์อพยพพักพิง</div>
            </div>

            <div className={styles.statCardTop}>
              <div className={styles.statIconWrapper} style={{ background: 'linear-gradient(135deg, #06b6d4, #0891b2)' }}>
                <svg className={styles.statIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              </div>
              <div className={styles.statLabel}>ศูนย์พักพิง</div>
            </div>

            <div className={styles.statCardTop}>
              <div className={styles.statIconWrapper} style={{ background: 'linear-gradient(135deg, #ec4899, #db2777)' }}>
                <svg className={styles.statIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                  <line x1="7" y1="7" x2="7.01" y2="7" />
                </svg>
              </div>
              <div className={styles.statLabel}>สิ่งของบริจาค</div>
            </div>

            <div className={styles.statCardTop}>
              <div className={styles.statIconWrapper} style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
                <svg className={styles.statIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <div className={styles.statLabel}>คำร้องขอความช่วยเหลือ</div>
            </div>
          </div>

          {/* Bottom Detail Cards */}
          <div className={styles.detailCardsRow}>
            <div className={styles.detailCard}>
              <div className={styles.detailCardHeader}>
                <div className={styles.detailIconWrapper} style={{ background: 'rgba(139, 92, 246, 0.1)' }}>
                  <svg className={styles.detailIcon} viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2">
                    <path d="M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16" />
                    <rect x="3" y="21" width="18" height="2" />
                  </svg>
                </div>
                <div className={styles.detailBadge} style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' }}>
                  {isLoading ? '...' : `${shelterTotal}`}
                </div>
              </div>
              <div className={styles.detailLabel}>ศูนย์อพยพพักพิงทั้งหมด</div>
              <div className={styles.detailValue}>{isLoading ? '...' : shelterTotal}</div>
              <div className={styles.detailSubtext}>เปิดใช้งาน {isLoading ? '...' : shelterActive} ศูนย์</div>
            </div>

            <div className={styles.detailCard}>
              <div className={styles.detailCardHeader}>
                <div className={styles.detailIconWrapper} style={{ background: 'rgba(6, 182, 212, 0.1)' }}>
                  <svg className={styles.detailIcon} viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="2">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                </div>
                <div className={styles.detailBadge} style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' }}>
                  {isLoading ? '...' : `${dashboardData?.shelters?.avgOccupancy ?? 0}%`}
                </div>
              </div>
              <div className={styles.detailLabel}>ครอบครัวที่เข้าพักทั้งหมด</div>
              <div className={styles.detailValue}>{isLoading ? '...' : totalPeople}</div>
              <div className={styles.detailSubtext}>จาก {isLoading ? '...' : shelterTotal} ศูนย์</div>
            </div>

            <div className={styles.detailCard}>
              <div className={styles.detailCardHeader}>
                <div className={styles.detailIconWrapper} style={{ background: 'rgba(236, 72, 153, 0.1)' }}>
                  <svg className={styles.detailIcon} viewBox="0 0 24 24" fill="none" stroke="#ec4899" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 16v-4M12 8h.01" />
                  </svg>
                </div>
                <div className={styles.detailBadge} style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
                  {isLoading ? '...' : requestsPending}
                </div>
              </div>
              <div className={styles.detailLabel}>คำร้องขอความช่วยเหลือ</div>
              <div className={styles.detailValue}>{isLoading ? '...' : requestsTotal}</div>
              <div className={styles.detailSubtext}>รอดำเนินการ {isLoading ? '...' : requestsPending} รายการ</div>
            </div>

            <div className={styles.detailCard}>
              <div className={styles.detailCardHeader}>
                <div className={styles.detailIconWrapper} style={{ background: 'rgba(100, 116, 139, 0.1)' }}>
                  <svg className={styles.detailIcon} viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
                    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                    <line x1="7" y1="7" x2="7.01" y2="7" />
                  </svg>
                </div>
                <div className={styles.detailTrendIcon}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                  </svg>
                </div>
              </div>
              <div className={styles.detailLabel}>คำร้องที่อนุมัติแล้ว</div>
              <div className={styles.detailValue}>{isLoading ? '...' : requestsApproved}</div>
              <div className={styles.detailSubtext}>โอนแล้ว {isLoading ? '...' : dashboardData?.requests?.transferred ?? 0} รายการ</div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
