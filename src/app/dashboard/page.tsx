import React from "react";
import styles from "./dashboard.module.css";

export default function DashboardPage() {
  return (
    <div className={styles.appRoot}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarInner}>
          <div className={styles.profile}>
            <div className={styles.avatar} aria-hidden style={{backgroundImage: `url(https://lh3.googleusercontent.com/aida-public/AB6AXuBxiLLzTwtd-Xxx4Jj8apumxDf20hnvTL6i40PBnr6HjV7NteFA0SYNsJXHaGEhRxW7k2dRvPf4UA1I01pb44seRutWNeJH8ZFAx9dcVb95TCJZiJcWOBrflCs9qlgw2fe_QCAU-rlncemAMlHZ9dmTTeUmqRPqp7SLe9VEsPhukYQ_mejZ6caFZ95tq550YuRWjP6YjOT53Fro6BqrjRM85efA39OA6OycXr_9O__xvZjVW5XtY-QkMEIrzxariQNONyXX_3Belx4)`}}>
              <span className={styles.avatarOnline}></span>
            </div>
            <div className={styles.profileText}>
              <h1>Commander Rex</h1>
              <p>Ops Lead • Tier 1</p>
            </div>
          </div>

          <nav className={styles.nav}>
            <a className={styles.navItemActive} href="#">Dashboard</a>
            <a className={styles.navItem} href="#">Inventory</a>
            <a className={styles.navItem} href="#">Shelters</a>
            <a className={styles.navItem} href="#">Logistics</a>
            <a className={styles.navItem} href="#">Settings</a>
          </nav>
        </div>
        <div className={styles.sidebarFooter}>
          <button className={styles.signOut}>Sign Out</button>
        </div>
      </aside>

      <main className={styles.main}>
        <header className={styles.header}>
          <div className={styles.brand}>Disaster Response <span>Command Center</span></div>
          <div className={styles.headerActions}>
            <div className={styles.search}>Search shelters, zones...</div>
            <div className={styles.icons}>
              <button className={styles.iconBtn}>🔔</button>
              <button className={styles.iconBtn}>❓</button>
            </div>
          </div>
        </header>

        <div className={styles.content}>
          <section className={styles.alertCard}>
            <div className={styles.alertLeft}>
              <div className={styles.alertMeta}><strong>Critical</strong> · 12 mins ago</div>
              <h3>Shelter B (North Zone) at 95% Capacity</h3>
              <p>Immediate redirection of incoming refugees required. Water supply critically low in Zone 3.</p>
              <div className={styles.alertActions}>
                <button className={styles.btnPrimary}>Redirect Convoy</button>
                <button className={styles.btn}>View Details</button>
              </div>
            </div>
            <div className={styles.alertMap}></div>
          </section>

          <section className={styles.statsGrid}>
            <div className={styles.stat}>
              <p>Active Shelters</p>
              <h4>12</h4>
            </div>
            <div className={styles.stat}>
              <p>People Displaced</p>
              <h4>1,240</h4>
            </div>
            <div className={styles.stat}>
              <p>Supply Kits</p>
              <h4>850</h4>
            </div>
            <div className={styles.stat}>
              <p>Active Deliveries</p>
              <h4>8</h4>
            </div>
          </section>

          <section className={styles.mainSplit}>
            <div className={styles.mapCard}>
              <div className={styles.mapHeader}>Live Operations Map</div>
              <div className={styles.mapArea}>Map placeholder</div>
            </div>
            <aside className={styles.sideCards}>
              <div className={styles.stockCard}>
                <h3>Stock Levels</h3>
                <div className={styles.stockItem}><span>Water (Bottles)</span><strong>24%</strong></div>
                <div className={styles.bar}><div style={{width: '24%'}} className={styles.barFill}></div></div>
              </div>
              <div className={styles.fleetCard}>
                <h3>Logistics Fleet</h3>
                <div>Active (17) · Idle (3)</div>
              </div>
            </aside>
          </section>

          <section className={styles.tableCard}>
            <h3>Pending Requests &amp; Activity</h3>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr><th>Request ID</th><th>Shelter / Location</th><th>Type</th><th>Priority</th><th>Status</th><th>Action</th></tr>
                </thead>
                <tbody>
                  <tr><td>REQ-2024-001</td><td>Shelter B - North Zone</td><td>Water Supply (500L)</td><td>HIGH</td><td>Pending Approval</td><td>Approve</td></tr>
                  <tr><td>REQ-2024-002</td><td>Mobile Unit Alpha</td><td>Medical Kits (50x)</td><td>MEDIUM</td><td>Processing</td><td>Details</td></tr>
                  <tr><td>REQ-2024-003</td><td>Shelter C - East</td><td>Blankets (200x)</td><td>LOW</td><td>Dispatched</td><td>Track</td></tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
