"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../dashboard/dashboard.module.css";

const mockPatients = [
  { id: "P-001", name: "Somchai Wong", age: 34, status: "Stable", location: "Shelter A" },
  { id: "P-002", name: "Suda K.", age: 28, status: "Critical", location: "Shelter B" },
  { id: "P-003", name: "Anan P.", age: 47, status: "Recovering", location: "Mobile Unit 3" },
];

export default function PatientsPage() {
  const router = useRouter();
  const [patients] = useState(mockPatients);

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
            <div className={styles.profileText}><h1>Patients</h1><p>List</p></div>
          </div>
          <nav className={styles.nav}>
            <button className={styles.navItem} onClick={() => router.push('/inventory')}>Inventory</button>
            <button className={styles.navItemActive} onClick={() => router.push('/patients')}>Patients</button>
            <button className={styles.navItem} onClick={() => router.push('/incidents')}>Incidents</button>
          </nav>
        </div>
        <div className={styles.sidebarFooter}><button className={styles.signOut} onClick={() => { localStorage.removeItem('ndr_currentUser'); router.replace('/login'); }}>Sign Out</button></div>
      </aside>

      <main className={styles.main}>
        <header className={styles.header}><div className={styles.brand}>Patients</div></header>
        <div className={styles.content}>
          <section className={styles.tableCard}>
            <h3>Patients Register</h3>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead><tr><th>ID</th><th>Name</th><th>Age</th><th>Status</th><th>Location</th></tr></thead>
                <tbody>
                  {patients.map(p => (
                    <tr key={p.id}>
                      <td>{p.id}</td>
                      <td>{p.name}</td>
                      <td>{p.age}</td>
                      <td>{p.status}</td>
                      <td>{p.location}</td>
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
