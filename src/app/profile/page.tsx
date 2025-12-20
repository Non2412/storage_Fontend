"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../dashboard/dashboard.module.css";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<{ fullName?: string; email?: string; phone?: string } | null>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ fullName: "", email: "", phone: "" });

  useEffect(() => {
    try {
      const raw = localStorage.getItem("ndr_currentUser");
      if (!raw) {
        router.replace("/login");
        return;
      }
      const parsed = JSON.parse(raw);
      setUser(parsed);
      setForm({ fullName: parsed.fullName || "", email: parsed.email || "", phone: parsed.phone || "" });
    } catch (e) {
      router.replace("/login");
    }
  }, [router]);

  function signOut() {
    localStorage.removeItem("ndr_currentUser");
    router.replace("/login");
  }

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((s) => ({ ...s, [e.target.name]: e.target.value }));
  }

  function saveProfile() {
    // update users store and currentUser
    try {
      const usersRaw = localStorage.getItem("ndr_users");
      const users = usersRaw ? JSON.parse(usersRaw) : [];
      const originalEmail = user?.email;
      let found = false;
      const updated = users.map((u: any) => {
        if (u.email === originalEmail) {
          found = true;
          return { ...u, email: form.email, fullName: form.fullName, phone: form.phone };
        }
        return u;
      });
      if (!found) {
        updated.push({ email: form.email, fullName: form.fullName, phone: form.phone, passwordHash: "" });
      }
      localStorage.setItem("ndr_users", JSON.stringify(updated));
      const current = { email: form.email, fullName: form.fullName, phone: form.phone };
      localStorage.setItem("ndr_currentUser", JSON.stringify(current));
      setUser(current);
      setEditing(false);
    } catch (e) {
      console.error(e);
      alert("ไม่สามารถบันทึกข้อมูลได้");
    }
  }

  if (!user) return null;

  return (
    <div className={styles.appRoot}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarInner}>
          <div className={styles.profile}>
            <div className={styles.avatar} aria-hidden style={{ backgroundImage: `url(https://images.unsplash.com/photo-1607746882042-944635dfe10e?q=80&w=400&auto=format&fit=crop&ixlib=rb-4.0.3&s=placeholder)` }}>
              <span className={styles.avatarOnline}></span>
            </div>
            <div className={styles.profileText}>
              <h1>{user.fullName || user.email}</h1>
              <p>Account</p>
            </div>
          </div>

          <nav className={styles.nav}>
            <button className={styles.navItem} onClick={() => router.push('/inventory')}>Inventory</button>
            <button className={styles.navItem} onClick={() => router.push('/requests')}>Requests</button>
            <button className={styles.navItem} onClick={() => router.push('/shelters')}>Shelters</button>
          </nav>
        </div>
        <div className={styles.sidebarFooter}>
          <button className={styles.signOut} onClick={signOut}>Sign Out</button>
        </div>
      </aside>

      <main className={styles.main}>
        <header className={styles.header}>
          <div className={styles.brand}>Profile</div>
        </header>

        <div className={styles.content}>
          <section className={styles.tableCard} style={{ maxWidth: 720, margin: '0 auto' }}>
            <h3>Account</h3>
            {!editing ? (
              <div style={{ padding: 12 }}>
                <p><strong>Name:</strong> {user.fullName || '-'}</p>
                <p><strong>Email:</strong> {user.email || '-'}</p>
                <p><strong>Phone:</strong> {user.phone || '-'}</p>
                <div style={{ marginTop: 12 }}>
                  <button className={styles.btn} onClick={() => setEditing(true)}>Edit Profile</button>
                  <button className={styles.btn} style={{ marginLeft: 8 }} onClick={() => router.push('/dashboard')}>Back</button>
                </div>
              </div>
            ) : (
              <div style={{ padding: 12, display: 'grid', gap: 8 }}>
                <label>
                  Name
                  <input name="fullName" value={form.fullName} onChange={onChange} style={{ width: '100%', padding: 8, marginTop: 6 }} />
                </label>
                <label>
                  Email
                  <input name="email" value={form.email} onChange={onChange} style={{ width: '100%', padding: 8, marginTop: 6 }} />
                </label>
                <label>
                  Phone
                  <input name="phone" value={form.phone} onChange={onChange} style={{ width: '100%', padding: 8, marginTop: 6 }} />
                </label>
                <div style={{ marginTop: 8 }}>
                  <button className={styles.btnPrimary} onClick={saveProfile}>Save</button>
                  <button className={styles.btn} style={{ marginLeft: 8 }} onClick={() => setEditing(false)}>Cancel</button>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
