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

          {/* Combined Content Section - Single Card */}
          <div className={styles.detailCard} style={{ padding: '40px', marginTop: '24px' }}>
            <div style={{ marginBottom: '32px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '8px' }}>
                ภาพรวมระบบ
              </h2>
              <p style={{ fontSize: '15px', color: 'var(--text-secondary)' }}>
                กิจกรรม แจ้งเตือน และการดำเนินการด่วน
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px' }}>
              {/* Recent Activities */}
              <div>
                <div style={{ marginBottom: '20px', paddingBottom: '16px', borderBottom: '2px solid var(--border)' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px' }}>
                    📋 กิจกรรมล่าสุด
                  </h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                    อัปเดตล่าสุดของระบบ
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[
                    { icon: '📦', title: 'คำร้องขอสิ่งของใหม่', desc: 'ศูนย์พักพิงบางกอก ขอน้ำดื่ม 200 แพ็ค', time: '5 นาทีที่แล้ว', color: '#6366f1' },
                    { icon: '✅', title: 'อนุมัติคำร้อง', desc: 'คำร้อง #REQ-001 ได้รับการอนุมัติแล้ว', time: '15 นาทีที่แล้ว', color: '#10b981' },
                    { icon: '🚚', title: 'จัดส่งสำเร็จ', desc: 'ส่งมอบสิ่งของไปยังศูนย์อุบลฯ', time: '1 ชั่วโมงที่แล้ว', color: '#06b6d4' },
                    { icon: '⚠️', title: 'แจ้งเตือนสต็อกต่ำ', desc: 'เครื่องนุ่งห่มเหลือน้อยกว่า 20%', time: '2 ชั่วโมงที่แล้ว', color: '#f59e0b' },
                  ].map((activity, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '12px',
                        padding: '12px',
                        borderRadius: '10px',
                        background: 'rgba(99, 102, 241, 0.03)',
                        border: '1px solid var(--border)',
                        transition: 'all 0.2s ease',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(99, 102, 241, 0.08)';
                        e.currentTarget.style.transform = 'translateX(4px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(99, 102, 241, 0.03)';
                        e.currentTarget.style.transform = 'translateX(0)';
                      }}
                    >
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '8px',
                        background: `${activity.color}15`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '18px',
                        flexShrink: 0
                      }}>
                        {activity.icon}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: '600', fontSize: '14px', color: 'var(--text-primary)', marginBottom: '2px' }}>
                          {activity.title}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {activity.desc}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                          {activity.time}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Alerts */}
              <div>
                <div style={{ marginBottom: '20px', paddingBottom: '16px', borderBottom: '2px solid var(--border)' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px' }}>
                    🔔 แจ้งเตือนสำคัญ
                  </h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                    ต้องดำเนินการ
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[
                    { type: 'critical', count: 2, label: 'วิกฤต', desc: 'ศูนย์พักพิงเต็ม', color: '#ef4444' },
                    { type: 'warning', count: 5, label: 'ควรระวัง', desc: 'สต็อกใกล้หมด', color: '#f59e0b' },
                    { type: 'info', count: 8, label: 'ทั่วไป', desc: 'รอดำเนินการ', color: '#06b6d4' },
                  ].map((alert, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                        padding: '14px',
                        borderRadius: '10px',
                        background: `${alert.color}10`,
                        border: `1px solid ${alert.color}30`,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = `${alert.color}20`;
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = `${alert.color}10`;
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: alert.color,
                            boxShadow: `0 0 8px ${alert.color}`
                          }} />
                          <span style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)' }}>
                            {alert.label}
                          </span>
                        </div>
                        <div style={{
                          fontSize: '16px',
                          fontWeight: '700',
                          color: alert.color,
                          background: 'white',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          minWidth: '32px',
                          textAlign: 'center'
                        }}>
                          {alert.count}
                        </div>
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', paddingLeft: '18px' }}>
                        {alert.desc}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div>
                <div style={{ marginBottom: '20px', paddingBottom: '16px', borderBottom: '2px solid var(--border)' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px' }}>
                    ⚡ การดำเนินการด่วน
                  </h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                    ทางลัดสำหรับงานสำคัญ
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[
                    { icon: '📝', label: 'แจ้งความต้องการ', desc: 'ส่งคำร้องขอสิ่งของ', color: '#6366f1', link: '/needs' },
                    { icon: '📦', label: 'ดูคลังสินค้า', desc: 'ตรวจสอบสต็อก', color: '#8b5cf6', link: '/inventory' },
                    { icon: '📋', label: 'ตรวจสอบคำร้อง', desc: 'ดูสถานะคำร้อง', color: '#ec4899', link: '/requests' },
                  ].map((action, idx) => (
                    <button
                      key={idx}
                      onClick={() => router.push(action.link)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '14px',
                        borderRadius: '10px',
                        background: `${action.color}10`,
                        border: `1px solid ${action.color}30`,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: 'var(--text-primary)',
                        width: '100%',
                        textAlign: 'left'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = `${action.color}20`;
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = `0 4px 12px ${action.color}30`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = `${action.color}10`;
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '8px',
                        background: `${action.color}20`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '18px',
                        flexShrink: 0
                      }}>
                        {action.icon}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: '600', fontSize: '14px', marginBottom: '2px' }}>
                          {action.label}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                          {action.desc}
                        </div>
                      </div>
                      <svg
                        style={{ width: '18px', height: '18px', color: action.color, flexShrink: 0 }}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
