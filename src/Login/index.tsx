"use client";

import React, { useState } from "react";
import styles from "./Login.module.css";

export default function Login() {
  const [mode, setMode] = useState<"login" | "register">("login");
  // login fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // register fields
  const [fullName, setFullName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [phone, setPhone] = useState("");

  function togglePassword() {
    setShow((s) => !s);
  }

  async function hashPassword(pwd: string) {
    const enc = new TextEncoder();
    const data = enc.encode(pwd);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  function getUsers() {
    try {
      const raw = localStorage.getItem("ndr_users");
      return raw ? JSON.parse(raw) : [];
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      return [];
    }
  }

  function saveUsers(users: unknown[]) {
    localStorage.setItem("ndr_users", JSON.stringify(users));
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    if (!fullName || !regEmail || !regPassword || !phone) {
      setMessage("กรุณากรอกข้อมูลให้ครบทุกช่อง");
      return;
    }
    const emailLower = regEmail.trim().toLowerCase();
    const users = getUsers();
    if (users.find((user: unknown) => (user as { email: string }).email === emailLower)) {
      setMessage("อีเมลนี้ถูกใช้งานแล้ว");
      return;
    }
    const pwdHash = await hashPassword(regPassword);
    users.push({ fullName: fullName.trim(), email: emailLower, phone: phone.trim(), passwordHash: pwdHash });
    saveUsers(users);
    setMessage("สมัครสมาชิกสำเร็จ กรุณาเข้าสู่ระบบ");
    // reset register fields and switch to login
    setFullName("");
    setRegEmail("");
    setRegPassword("");
    setPhone("");
    setMode("login");
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    if (!email || !password) {
      setMessage("กรุณากรอกอีเมลและรหัสผ่าน");
      return;
    }
    const users = getUsers();
    const emailLower = email.trim().toLowerCase();
    const pwdHash = await hashPassword(password);
    const user = users.find((u: unknown) => (u as { email: string }).email === emailLower && (u as { passwordHash: string }).passwordHash === pwdHash);
    if (!user) {
      setMessage("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
      return;
    }
    // login success
    localStorage.setItem("ndr_currentUser", JSON.stringify({ email: user.email, fullName: user.fullName }));
    // redirect to dashboard
    window.location.href = "/dashboard";
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
                <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className={styles.input} type="email" />
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>รหัสผ่าน</label>
              <div className={styles.inputWrap}>
                <div className={styles.prefix}><span className="material-symbols-outlined">Password</span></div>
                <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="รหัสผ่าน" className={styles.input} type={show ? "text" : "password"} />
                <button type="button" className={styles.suffix} onClick={togglePassword} aria-label="toggle">
                  <span className="material-symbols-outlined">{show ? "ปิดรหัสผ่าน" : "ตรวจสอบ"}</span>
                </button>
              </div>
            </div>

            <div className={styles.rowMeta}>
              <label className={styles.remember}><input type="checkbox" /> <span>จำการเข้าสู่ระบบ</span></label>
              <a className={styles.forgot} href="#">ลืมรหัสผ่าน?</a>
            </div>

            <button className={styles.submit} type="submit">เข้าสู่ระบบ</button>
          </form>
        ) : (
          <form className={styles.form} onSubmit={handleRegister}>
            <div className={styles.field}>
              <label className={styles.label}>ชื่อ - นามสกุล</label>
              <div className={styles.inputWrap}>
                <div className={styles.prefix}><span className="material-symbols-outlined">Name</span></div>
                <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="ชื่อ นามสกุล" className={styles.input} type="text" />
              </div>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>อีเมล</label>
              <div className={styles.inputWrap}>
                <div className={styles.prefix}><span className="material-symbols-outlined">email</span></div>
                <input value={regEmail} onChange={(e) => setRegEmail(e.target.value)} placeholder="you@example.com" className={styles.input} type="email" />
              </div>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>รหัสผ่าน</label>
              <div className={styles.inputWrap}>
                <div className={styles.prefix}><span className="material-symbols-outlined">Password</span></div>
                <input value={regPassword} onChange={(e) => setRegPassword(e.target.value)} placeholder="รหัสผ่าน" className={styles.input} type="password" />
              </div>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>เบอร์โทร</label>
              <div className={styles.inputWrap}>
                <div className={styles.prefix}><span className="material-symbols-outlined">Number</span></div>
                <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0812345678" className={styles.input} type="tel" />
              </div>
            </div>

            <button className={styles.submit} type="submit">สมัครสมาชิก</button>
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

