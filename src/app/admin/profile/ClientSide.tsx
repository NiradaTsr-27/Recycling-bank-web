"use client";

import { useState, useEffect } from "react";
import AdminNavbar from "@/components/navbar/AdminNavbar";
import styles from "@/styles/pages/admin/adminSettings.module.css";

export default function AdminSettingsPage() {
  const [showModal, setShowModal] = useState(false);
  const [admin, setAdmin] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
  });

  const [password, setPassword] = useState({
    oldPassword: "",
    newPassword: "",
  });

  // โหลดข้อมูล admin
  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const res = await fetch("/api/admin/me");

        if (!res.ok) throw new Error("โหลดข้อมูลไม่สำเร็จ");

        const data = await res.json();

        setAdmin(data);
        setProfile({
          firstName: data.firstName,
          lastName: data.lastName,
        });
      } catch (error) {
        console.error(error);
        alert("ไม่สามารถโหลดข้อมูลผู้ดูแลได้");
      }
    };

    fetchAdmin();
  }, []);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value,
    });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword({
      ...password,
      [e.target.name]: e.target.value,
    });
  };

  const handleProfileSave = async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/admin/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profile),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message);
        return;
      }

      alert("บันทึกข้อมูลสำเร็จ");
    } catch (error) {
      alert("เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/admin/change-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(password),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message);
        return;
      }

      alert("เปลี่ยนรหัสผ่านสำเร็จ");

      setPassword({
        oldPassword: "",
        newPassword: "",
      });

      setShowModal(false);
    } catch (error) {
      alert("เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  };

  if (!admin) return null;

  return (
    <>
      <AdminNavbar />

      <div className={styles.container}>
        <h1 className={styles.title}>ตั้งค่าบัญชีผู้ดูแล</h1>

        <div className={styles.card}>
          <div className={styles.formGroup}>
            <label>ชื่อ</label>
            <input
              type="text"
              name="firstName"
              value={profile.firstName}
              onChange={handleProfileChange}
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label>นามสกุล</label>
            <input
              type="text"
              name="lastName"
              value={profile.lastName}
              onChange={handleProfileChange}
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label>ชื่อผู้ใช้งาน</label>
            <input
              type="text"
              value={admin.username}
              disabled
              className={styles.disabledInput}
            />
          </div>

          <div className={styles.formGroup}>
            <label>อีเมล</label>
            <input
              type="email"
              value={admin.email}
              disabled
              className={styles.disabledInput}
            />
          </div>

          <div className={styles.formGroup}>
            <label>รหัสผ่าน</label>

            <div className={styles.passwordRow}>
              <input
                type="password"
                value="********"
                disabled
                className={styles.disabledInput}
              />

              <button
                className={styles.changeBtn}
                onClick={() => setShowModal(true)}
              >
                เปลี่ยนรหัสผ่าน
              </button>
            </div>
          </div>

          <button
            className={styles.saveBtn}
            onClick={handleProfileSave}
            disabled={loading}
          >
            {loading ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
          </button>
        </div>
      </div>

      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalBox}>
            <h3>เปลี่ยนรหัสผ่าน</h3>

            <div className={styles.formGroup}>
              <label>รหัสผ่านเดิม</label>
              <input
                type="password"
                name="oldPassword"
                value={password.oldPassword}
                onChange={handlePasswordChange}
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label>รหัสผ่านใหม่</label>
              <input
                type="password"
                name="newPassword"
                value={password.newPassword}
                onChange={handlePasswordChange}
                className={styles.input}
              />
            </div>

            <div className={styles.modalActions}>
              <button
                className={styles.cancelBtn}
                onClick={() => setShowModal(false)}
              >
                ยกเลิก
              </button>

              <button
                className={styles.confirmBtn}
                onClick={handleChangePassword}
                disabled={loading}
              >
                {loading ? "กำลังเปลี่ยน..." : "เปลี่ยนรหัสผ่าน"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
