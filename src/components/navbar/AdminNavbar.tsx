"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { signOut } from "next-auth/react";
import styles from "@/styles/components/adminNavbar.module.css";
import { FiUser, FiSettings, FiLogOut } from "react-icons/fi";
import { CgProfile } from "react-icons/cg";

export default function AdminNavbar() {
  const [open, setOpen] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  return (
    <>
      <header className={styles.navbar}>
        {/* Logo */}
        <Link href="/admin" className={styles.logo}>
          <Image
            src="/hero/logo-1.png"
            alt="Recycling Bank"
            width={55}
            height={55}
            priority
          />
          <span className={styles.logoText}>Recycling Bank</span>
        </Link>

        {/* MOBILE RIGHT CONTROLS */}
        <div className={styles.mobileControls}>
          {/* Profile icon */}
          <div className={styles.profileWrapper}>
            <button
              className={styles.profileBtn}
              onClick={() => setProfileOpen(!profileOpen)}
            >
              <CgProfile size={24} />
            </button>

            {profileOpen && (
              <div className={styles.dropdown}>
                <Link
                  href="/admin/profile"
                  className={styles.dropdownItem}
                  onClick={() => setProfileOpen(false)}
                >
                  <FiUser size={16} />
                  ดูโปรไฟล์
                </Link>

                <button
                  className={styles.dropdownItem}
                  onClick={() => {
                    setProfileOpen(false);
                    setShowConfirm(true);
                  }}
                >
                  <FiLogOut size={16} />
                  ออกจากระบบ
                </button>
              </div>
            )}
          </div>

          {/* Hamburger */}
          <button
            className={styles.hamburger}
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            ☰
          </button>
        </div>

        {/* CENTER MENU */}
        <nav className={`${styles.menuCenter} ${open ? styles.open : ""}`}>
          <Link href="/admin">หน้าหลัก</Link>
          <Link href="/admin/employees">พนักงาน</Link>
          <Link href="/admin/members">สมาชิก</Link>
          <Link href="/admin/recycle">ขยะรีไซเคิล</Link>
          <Link href="/admin/agencies">หน่วยงาน</Link>
          <Link href="/admin/news">ประชาสัมพันธ์</Link>
          <Link href="/admin/reports">รายงานสรุป</Link>
        </nav>

        {/* RIGHT MENU */}
        <div className={`${styles.menuRight} ${styles.desktopOnly}`}>
          <div className={styles.profileWrapper}>
            <button
              className={styles.profileBtn}
              onClick={() => setProfileOpen(!profileOpen)}
            >
              <CgProfile size={26} />
            </button>

            {profileOpen && (
              <div className={styles.dropdown}>
                <Link
                  href="/admin/profile"
                  className={styles.dropdownItem}
                  onClick={() => setProfileOpen(false)}
                >
                  <FiUser size={16} />
                  ดูโปรไฟล์
                </Link>

                <button
                  className={styles.dropdownItem}
                  onClick={() => {
                    setProfileOpen(false);
                    setShowConfirm(true);
                  }}
                >
                  <FiLogOut size={16} />
                  ออกจากระบบ
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Confirm Logout Modal */}
      {showConfirm && (
        <div className={styles.modalOverlay}>
          <div className={styles.confirmBox}>
            <h3>ยืนยันการออกจากระบบ</h3>
            <p>คุณต้องการออกจากระบบใช่หรือไม่?</p>

            <div className={styles.confirmActions}>
              <button
                className={styles.cancelBtn}
                onClick={() => setShowConfirm(false)}
              >
                ยกเลิก
              </button>

              <button className={styles.confirmBtn} onClick={handleLogout}>
                ออกจากระบบ
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
