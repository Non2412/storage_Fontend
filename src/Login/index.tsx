"use client";

import React, { useState } from "react";
import styles from "./Login.module.css";
import { login as apiLogin, register as apiRegister } from "@/lib/api";

export default function Login() {
  const [mode, setMode] = useState<"login" | "register">("login");
  // login fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // register fields
  const [fullName, setFullName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [phone, setPhone] = useState("");

  function togglePassword() {
    setShow((s) => !s);
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    if (!fullName || !regEmail || !regPassword || !phone) {
      setMessage("กรุณากรอกข้อมูลให้ครบทุกช่อง");
      return;
    }

    setIsLoading(true);
    try {
      const result = await apiRegister({
        name: fullName.trim(),
        email: regEmail.trim().toLowerCase(),
        username: regEmail.split('@')[0],
        password: regPassword,
        phone: phone.trim(),
        role: 'shelter_staff',
      });

      if (result.success) {
        setMessage("สมัครสมาชิกสำเร็จ กรุณาเข้าสู่ระบบ");
        // reset register fields and switch to login
        setFullName("");
        setRegEmail("");
        setRegPassword("");
        setPhone("");
        setMode("login");
      } else {
        setMessage(result.message || "เกิดข้อผิดพลาดในการสมัครสมาชิก");
      }
    } catch {
      setMessage("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    if (!email || !password) {
      setMessage("กรุณากรอกอีเมลและรหัสผ่าน");
      return;
    }

    setIsLoading(true);
    try {
      const result = await apiLogin(email.trim().toLowerCase(), password);
      
      if (result.success && result.data) {
        // redirect to dashboard
        window.location.href = "/dashboard";
      } else {
        setMessage(result.message || "อีเมลหรือรหัสผ่านไม่ถูกต้อง");
      }
    } catch {
      setMessage("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className={styles.root}>
      <div className={styles.brandArea}>
        <div className={styles.logoBox}>
          <span className="material-symbols-outlined">EMH</span>
        </div>
        <div className={styles.brandText}>
          <h1>ระบบจัดการแหล่งพักพิง</h1>
          <p>ศูนย์บัญชาการติดตามและกระจายความช่วยเหลือ</p>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.tabs}>
          <button className={mode === "login" ? styles.tabActive : styles.tab} onClick={() => setMode("login")}>เข้าสู่ระบบ</button>
          <button className={mode === "register" ? styles.tabActive : styles.tab} onClick={() => setMode("register")}>สมัครสมาชิก</button>
        </div>

        {message && <div className={styles.msg}>{message}</div>}

        {mode === "login" ? (
          <form className={styles.form} onSubmit={handleLogin}>
            <div className={styles.field}>
              <label className={styles.label}>อีเมล</label>
              <div className={styles.inputWrap}>
                <div className={styles.prefix}><span className="material-symbols-outlined">Email</span></div>
                <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className={styles.input} type="email" disabled={isLoading} />
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>รหัสผ่าน</label>
              <div className={styles.inputWrap}>
                <div className={styles.prefix}><span className="material-symbols-outlined">Password</span></div>
                <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="รหัสผ่าน" className={styles.input} type={show ? "text" : "password"} disabled={isLoading} />
                <button type="button" className={styles.suffix} onClick={togglePassword} aria-label="toggle">
                  <span className="material-symbols-outlined">{show ? "ปิดรหัสผ่าน" : "ตรวจสอบ"}</span>
                </button>
              </div>
            </div>

            <div className={styles.rowMeta}>
              <label className={styles.remember}><input type="checkbox" /> <span>จำการเข้าสู่ระบบ</span></label>
              <a className={styles.forgot} href="#">ลืมรหัสผ่าน?</a>
            </div>

            <button className={styles.submit} type="submit" disabled={isLoading}>
              {isLoading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
            </button>
          </form>
        ) : (
          <form className={styles.form} onSubmit={handleRegister}>
            <div className={styles.field}>
              <label className={styles.label}>ชื่อ - นามสกุล</label>
              <div className={styles.inputWrap}>
                <div className={styles.prefix}><span className="material-symbols-outlined">Name</span></div>
                <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="ชื่อ นามสกุล" className={styles.input} type="text" disabled={isLoading} />
              </div>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>อีเมล</label>
              <div className={styles.inputWrap}>
                <div className={styles.prefix}><span className="material-symbols-outlined">email</span></div>
                <input value={regEmail} onChange={(e) => setRegEmail(e.target.value)} placeholder="you@example.com" className={styles.input} type="email" disabled={isLoading} />
              </div>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>รหัสผ่าน</label>
              <div className={styles.inputWrap}>
                <div className={styles.prefix}><span className="material-symbols-outlined">Password</span></div>
                <input value={regPassword} onChange={(e) => setRegPassword(e.target.value)} placeholder="รหัสผ่าน" className={styles.input} type="password" disabled={isLoading} />
              </div>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>เบอร์โทร</label>
              <div className={styles.inputWrap}>
                <div className={styles.prefix}><span className="material-symbols-outlined">Number</span></div>
                <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0812345678" className={styles.input} type="tel" disabled={isLoading} />
              </div>
            </div>

            <button className={styles.submit} type="submit" disabled={isLoading}>
              {isLoading ? "กำลังสมัครสมาชิก..." : "สมัครสมาชิก"}
            </button>
          </form>
        )}
      </div>

      <div className={styles.helper}>
        <p>ยังไม่มีบัญชีผู้ใช้งาน? ติดต่อผู้ดูแลระบบ</p>
      </div>

      <footer className={styles.footer}>
        <p>© 2024 National Disaster Relief Center. All rights reserved.</p>
      </footer>
    </div>
  );
}

