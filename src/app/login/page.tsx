// src/app/login/page.tsx - แก้ไขส่วนนี้
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./Login.module.css";

const ADMIN_CREDENTIALS = {
  username: "admin",
  password: "admin123"
};

export default function Login() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);

  function togglePassword() {
    setShow((s) => !s);
  }

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    
    if (!username || !password) {
      alert("กรุณากรอกชื่อผู้ใช้และรหัสผ่าน");
      return;
    }

    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
      // ✅ ไปหน้า admin
      router.push("/admin");
    } else {
      alert("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
    }
  }

  return (
    <div className={styles.root}>
      <div className={styles.container}>
        {/* Logo & Brand */}
        <div className={styles.brandArea}>
          <div className={styles.logoBox}>
            <span>🏠</span>
          </div>
          <h1 className={styles.logoText}>emergency_home</h1>
        </div>

        {/* Title */}
        <div className={styles.titleArea}>
          <h2 className={styles.mainTitle}>ระบบจัดการภัยพิบัติ</h2>
          <p className={styles.subtitle}>ศูนย์บัญชาการติดตามและกระจายความช่วยเหลือ</p>
        </div>

        {/* Card */}
        <div className={styles.card}>
          <form onSubmit={handleLogin}>
            <div className={styles.field}>
              <label className={styles.label}>ชื่อผู้ใช้</label>
              <input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="กรอกชื่อผู้ใช้ของคุณ"
                className={styles.input}
                type="text"
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>รหัสผ่าน</label>
              <div className={styles.inputWrap}>
                <input
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="กรอกรหัสผ่าน"
                  className={styles.input}
                  type={show ? "text" : "password"}
                />
                <button
                  type="button"
                  className={styles.suffix}
                  onClick={togglePassword}
                  aria-label="toggle password visibility"
                >
                  {show ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            <div className={styles.rowMeta}>
              <label className={styles.remember}>
                <input type="checkbox" />
                <span>จำการเข้าสู่ระบบ</span>
              </label>
              <a className={styles.forgot} href="#">
                ลืมรหัสผ่าน?
              </a>
            </div>

            <button
              className={styles.submit}
              type="submit"
            >
              เข้าสู่ระบบ
            </button>
          </form>
        </div>

        <div className={styles.helper}>
          <p>ยังไม่มีบัญชีผู้ใช้งาน? <a href="#">ติดต่อผู้ดูแลระบบ</a></p>
        </div>

        {/* Test Credentials */}
        <div className={styles.testCreds}>
          <p className={styles.testLabel}>🔑 ข้อมูลการทดสอบ Admin</p>
          <p className={styles.testText}>ชื่อผู้ใช้: <span className={styles.testCode}>admin</span></p>
          <p className={styles.testText}>รหัสผ่าน: <span className={styles.testCode}>admin123</span></p>
        </div>
      </div>

      <footer className={styles.footer}>
        <p>© 2024 National Disaster Relief Center. All rights reserved.</p>
      </footer>
    </div>
  );
}