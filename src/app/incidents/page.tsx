"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../dashboard/dashboard.module.css";

const mockIncidents = [
  { id: "INC-1001", type: "Flood", priority: "High", reportedAt: "2025-12-15 09:32", location: "Zone 3" },
  { id: "INC-1002", type: "Fire", priority: "Medium", reportedAt: "2025-12-16 14:10", location: "Shelter B" },
];

export default function IncidentsPage() {
  const router = useRouter();
  const [items] = useState(mockIncidents);

  useEffect(() => {
    const raw = localStorage.getItem("ndr_currentUser");
    if (!raw) router.replace("/login");
  }, [router]);

  return (
    <div className={styles.appRoot}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarInner}>
          <div className={styles.profile}>
            <div className={styles.avatar} aria-hidden />
            <div className={styles.profileText}><h1>Incidents</h1><p>Active</p></div>
          </div>
          <nav className={styles.nav}>
            <button className={styles.navItem} onClick={() => router.push('/inventory')}>Inventory</button>
            <button className={styles.navItem} onClick={() => router.push('/patients')}>Patients</button>
            <button className={styles.navItemActive} onClick={() => router.push('/incidents')}>Incidents</button>
          </nav>
        </div>
        <div className={styles.sidebarFooter}><button className={styles.signOut} onClick={() => { localStorage.removeItem('ndr_currentUser'); router.replace('/login'); }}>Sign Out</button></div>
      </aside>

      <main className={styles.main}>
        <header className={styles.header}><div className={styles.brand}>Incidents</div></header>
        <div className={styles.content}>
          <section className={styles.tableCard}>
            <h3>Recent Incidents</h3>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead><tr><th>ID</th><th>Type</th><th>Priority</th><th>Reported</th><th>Location</th></tr></thead>
                <tbody>
                  {items.map(i => (
                    <tr key={i.id}>
                      <td>{i.id}</td>
                      <td>{i.type}</td>
                      <td>{i.priority}</td>
                      <td>{i.reportedAt}</td>
                      <td>{i.location}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
