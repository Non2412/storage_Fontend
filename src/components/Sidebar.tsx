"use client";

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import styles from './Sidebar.module.css';

export default function Sidebar() {
    const router = useRouter();
    const pathname = usePathname();

    const menuItems = [
        {
            path: '/dashboard',
            label: 'หน้าหลัก',
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                </svg>
            )
        },
        {
            path: '/incidents',
            label: 'สถานการณ์ฉุกเฉิน',
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="7" height="7" />
                    <rect x="14" y="3" width="7" height="7" />
                    <rect x="14" y="14" width="7" height="7" />
                    <rect x="3" y="14" width="7" height="7" />
                </svg>
            )
        },
        {
            path: '/patients',
            label: 'ผู้ประสบภัย',
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                </svg>
            )
        },
        {
            path: '/team',
            label: 'ทีมงาน',
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
            )
        },
        {
            path: '/shelters',
            label: 'ศูนย์พักพิง',
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
            )
        },
        {
            path: '/requests',
            label: 'คำร้องขอสิ่งของ',
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                    <line x1="7" y1="7" x2="7.01" y2="7" />
                </svg>
            )
        },
        {
            path: '/history',
            label: 'ประวัติ',
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 16v-4M12 8h.01" />
                </svg>
            )
        }
    ];

    return (
        <aside className={styles.sidebar}>
            <div className={styles.sidebarHeader}>
                <div className={styles.logo}>
                    <div className={styles.logoIcon}>S</div>
                    <div className={styles.logoText}>
                        <div className={styles.logoTitle}>Sisaket EMS</div>
                        <div className={styles.logoSubtitle}>OFFICE MANAGEMENT</div>
                    </div>
                </div>
            </div>

            <nav className={styles.nav}>
                {menuItems.map((item) => (
                    <button
                        key={item.path}
                        className={pathname === item.path ? styles.navItemActive : styles.navItem}
                        onClick={() => router.push(item.path)}
                    >
                        <span className={styles.navIcon}>{item.icon}</span>
                        {item.label}
                    </button>
                ))}
            </nav>
        </aside>
    );
}
