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
      <div className={styles.bgOverlay} />
      {/* render Login component from src/Login */}
      {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
      {/* @ts-ignore */}
      <div style={{ width: "100%", display: "flex", justifyContent: "center", padding: 40, position: 'relative', zIndex: 10 }}>
        {/* lazy import path: ../Login */}
        {/* Use a client-side import of the Login component */}
        {React.createElement(require("../Login").default)}
      </div>
    </div>
  );
}
