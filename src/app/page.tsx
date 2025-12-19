"use client";

import React, { useState } from "react";
import styles from "./page.module.css";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);

  function togglePassword() {
    setShow((s) => !s);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!username || !password) {
      alert("กรุณากรอกชื่อผู้ใช้และรหัสผ่าน");
      return;
    }
    alert("กำลังเข้าสู่ระบบ...\nชื่อผู้ใช้: " + username);
  }

  return (
    <div className={styles.page}>
      <div className={styles.bgOverlay}></div>
      <main className={styles.container}>
        <div className={styles.cardWrap}>
          <header className={styles.brand}>
            <div className={styles.logoBox}>
              <span className="material-symbols-outlined">emergency_home</span>
            </div>
            <div className={styles.brandText}>
              <h1>ระบบจัดการภัยพิบัติ</h1>
              <p>ศูนย์บัญชาการติดตามและกระจายความช่วยเหลือ</p>
            </div>
          </header>

          <div className={styles.loginCard}>
            <form onSubmit={handleSubmit} className={styles.form}>
              <label className={styles.label}>ชื่อผู้ใช้</label>
              <div className={styles.inputGroup}>
                <div className={styles.inputPrefix}>
                  <span className="material-symbols-outlined">person</span>
                </div>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="กรอกชื่อผู้ใช้ของคุณ"
                  className={styles.input}
                  type="text"
                />
              </div>

              <label className={styles.label}>รหัสผ่าน</label>
              <div className={styles.inputGroup}>
                <div className={styles.inputPrefix}>
                  <span className="material-symbols-outlined">lock</span>
                </div>
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="กรอกรหัสผ่าน"
                  className={styles.input}
                  type={show ? "text" : "password"}
                />
                <button type="button" onClick={togglePassword} className={styles.eyeBtn} aria-label="Toggle password">
                  <span className="material-symbols-outlined">{show ? "visibility_off" : "visibility"}</span>
                </button>
              </div>

              <div className={styles.metaRow}>
                <label className={styles.checkboxLabel}>
                  <input type="checkbox" />
                  <span>จำการเข้าสู่ระบบ</span>
                </label>
                <a className={styles.forgot} href="#">ลืมรหัสผ่าน?</a>
              </div>

              <button className={styles.submit} type="submit">เข้าสู่ระบบ</button>
            </form>
          </div>

          <div className={styles.helpText}>
            <p>
              ยังไม่มีบัญชีผู้ใช้งาน? <a href="#">ติดต่อผู้ดูแลระบบ</a>
            </p>
          </div>

          <footer className={styles.footer}>
            <p>© 2024 National Disaster Relief Center. All rights reserved.</p>
          </footer>
        </div>
      </main>
    </div>
  );
}
