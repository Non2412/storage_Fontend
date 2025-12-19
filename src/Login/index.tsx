"use client";

import React, { useState } from "react";
import styles from "./Login.module.css";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);

  function togglePassword() {
    setShow((s) => !s);
  }

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (username && password) {
      alert("กำลังเข้าสู่ระบบ...\nชื่อผู้ใช้: " + username);
    } else {
      alert("กรุณากรอกชื่อผู้ใช้และรหัสผ่าน");
    }
  }

  return (
    <div className={styles.root}>
      <div className={styles.brandArea}>
        <div className={styles.logoBox}>
          <span className="material-symbols-outlined">emergency_home</span>
        </div>
        <div className={styles.brandText}>
          <h1>ระบบจัดการภัยพิบัติ</h1>
          <p>ศูนย์บัญชาการติดตามและกระจายความช่วยเหลือ</p>
        </div>
      </div>

      <div className={styles.card}>
        <form className={styles.form} onSubmit={handleLogin}>
          <div className={styles.field}>
            <label className={styles.label}>ชื่อผู้ใช้</label>
            <div className={styles.inputWrap}>
              <div className={styles.prefix}><span className="material-symbols-outlined">person</span></div>
              <input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="กรอกชื่อผู้ใช้ของคุณ"
                className={styles.input}
                type="text"
              />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>รหัสผ่าน</label>
            <div className={styles.inputWrap}>
              <div className={styles.prefix}><span className="material-symbols-outlined">lock</span></div>
              <input
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="กรอกรหัสผ่าน"
                className={styles.input}
                type={show ? "text" : "password"}
              />
              <button type="button" className={styles.suffix} onClick={togglePassword} aria-label="toggle">
                <span className="material-symbols-outlined">{show ? "visibility_off" : "visibility"}</span>
              </button>
            </div>
          </div>

          <div className={styles.rowMeta}>
            <label className={styles.remember}><input type="checkbox" /> <span>จำการเข้าสู่ระบบ</span></label>
            <a className={styles.forgot} href="#">ลืมรหัสผ่าน?</a>
          </div>

          <button className={styles.submit} type="submit">เข้าสู่ระบบ</button>
        </form>
      </div>

      <div className={styles.helper}>
        <p>ยังไม่มีบัญชีผู้ใช้งาน? <a href="#">ติดต่อผู้ดูแลระบบ</a></p>
      </div>

      <footer className={styles.footer}>
        <p>© 2024 National Disaster Relief Center. All rights reserved.</p>
      </footer>
    </div>
  );
}
