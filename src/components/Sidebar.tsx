"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { logout } from '@/lib/api';
import { useCart } from '@/contexts/CartContext';
import styles from './Sidebar.module.css';

export default function Sidebar() {
    const router = useRouter();
    const pathname = usePathname();
    const [isMounted, setIsMounted] = useState(false);
    const { getTotalItems } = useCart();

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsMounted(true);
    }, []);

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
            path: '/needs',
            label: 'แจ้งความต้องการ',
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                </svg>
            )
        },
        {
            path: '/inventory',
            label: 'คลังสิ่งของ',
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
            )
        },
        {
            path: '/requests',
            label: 'ตรวจสอบคำร้องขอ',
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10 9 9 9 8 9" />
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

    const totalItems = getTotalItems();

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
                        className={isMounted && pathname === item.path ? styles.navItemActive : styles.navItem}
                        onClick={() => router.push(item.path)}
                    >
                        <span className={styles.navIcon}>{item.icon}</span>
                        {item.label}
                    </button>
                ))}

                {/* Cart Button */}
                {pathname === '/inventory' && (
                    <button
                        className={styles.cartButton}
                        onClick={() => {
                            // This will be handled by the inventory page
                            const event = new CustomEvent('openCart');
                            window.dispatchEvent(event);
                        }}
                    >
                        <span className={styles.navIcon}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="9" cy="21" r="1" />
                                <circle cx="20" cy="21" r="1" />
                                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                            </svg>
                        </span>
                        ตะกร้าสินค้า
                        {totalItems > 0 && (
                            <span className={styles.cartBadge}>{totalItems}</span>
                        )}
                    </button>
                )}
            </nav>

            {/* Logout Button */}
            <div className={styles.sidebarFooter}>
                <button
                    className={styles.logoutButton}
                    onClick={() => logout()}
                >
                    <span className={styles.navIcon}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                            <polyline points="16 17 21 12 16 7" />
                            <line x1="21" y1="12" x2="9" y2="12" />
                        </svg>
                    </span>
                    ออกจากระบบ
                </button>
            </div>
        </aside>
    );
}
