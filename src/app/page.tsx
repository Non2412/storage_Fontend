"use client";

import React from "react";
import styles from "./page.module.css";
import Login from "@/Login";

export default function LoginPage() {
  return (
    <div className={styles.page}>
      <div className={styles.bgOverlay} />
      <div style={{ width: "100%", display: "flex", justifyContent: "center", padding: 40, position: 'relative', zIndex: 10 }}>
        <Login />
      </div>
    </div>
  );
}
