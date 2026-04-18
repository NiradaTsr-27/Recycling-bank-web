"use client";

import { useState } from "react";
import styles from "@/styles/pages/forgotPassword.module.css";
import NavbarPublic from "@/components/navbar/NavbarPublic";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      setMessage(data.message);
    } catch (error) {
      setMessage("เกิดข้อผิดพลาด กรุณาลองใหม่");
    }

    setLoading(false);
  };

  return (
    <>
      <NavbarPublic />
      <div className={styles.container}>
        <div className={styles.card}>
          <h1 className={styles.title}>ลืมรหัสผ่าน</h1>

          <form onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="กรอกอีเมลของคุณ"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={styles.input}
            />

            <button type="submit" disabled={loading} className={styles.button}>
              {loading ? "กำลังส่ง..." : "ส่งลิงก์รีเซ็ตรหัสผ่าน"}
            </button>
          </form>

          {message && (
            <p
              className={styles.message}
              style={{ color: message.includes("ผิด") ? "red" : "green" }}
            >
              {message}
            </p>
          )}
        </div>
      </div>
    </>
  );
}
