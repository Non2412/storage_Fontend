"use client";

import React from 'react';
import Sidebar from '@/components/Sidebar';
import styles from './AppLayout.module.css';

interface AppLayoutProps {
    children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
    return (
        <div className={styles.appContainer}>
            <Sidebar />
            <main className={styles.mainContent}>
                {children}
            </main>
        </div>
    );
}
