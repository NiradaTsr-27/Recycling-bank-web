"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, Suspense } from "react";
import styles from "@/styles/pages/forgotPassword.module.css";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!token) {
      setError("ลิงก์ไม่ถูกต้อง");
      return;
    }

    if (password.length < 6) {
      setError("รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร");
      return;
    }

    if (password !== confirmPassword) {
      setError("รหัสผ่านไม่ตรงกัน");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "เกิดข้อผิดพลาด");
        setLoading(false);
        return;
      }

      setMessage("รีเซ็ตรหัสผ่านสำเร็จ กำลังพาไปหน้าเข้าสู่ระบบ...");

      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err) {
      setError("เกิดข้อผิดพลาด กรุณาลองใหม่");
    }

    setLoading(false);
  };

  return (
    <>
      <h1 className={styles.title}>ตั้งรหัสผ่านใหม่</h1>

      <form onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="รหัสผ่านใหม่"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={styles.input}
          required
        />

        <input
          type="password"
          placeholder="ยืนยันรหัสผ่าน"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className={styles.input}
          required
        />

        <button type="submit" disabled={loading} className={styles.button}>
          {loading ? "กำลังบันทึก..." : "บันทึกรหัสผ่านใหม่"}
        </button>
      </form>

      {error && (
        <p className={styles.message} style={{ color: "red" }}>
          {error}
        </p>
      )}

      {message && (
        <p className={styles.message} style={{ color: "green" }}>
          {message}
        </p>
      )}
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <Suspense fallback={<p>Loading...</p>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
