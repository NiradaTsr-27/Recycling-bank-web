"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "@/styles/components/memberNavbar.module.css";
import { FiLogOut, FiUser } from "react-icons/fi";
import { signOut } from "next-auth/react";
import { CgProfile } from "react-icons/cg";
import { FaWallet } from "react-icons/fa";

export default function MemberNavbar() {
  const [open, setOpen] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const res = await fetch("/api/member/wallet");
        const data = await res.json();
        if (data.balance !== undefined) {
          setBalance(data.balance);
        }
      } catch (err) {
        console.error("Failed to fetch balance", err);
      }
    };
    fetchBalance();
  }, []);

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  return (
    <>
      <header className={styles.navbar}>
        {/* Logo */}
        <Link href="/member" className={styles.logo}>
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
                  href="/member/profile"
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
          <div className={`${styles.mobileOnly} ${styles.balanceBadge}`}>
            <FaWallet size={16} />
            {balance !== null ? `${balance.toLocaleString()} ฿` : "0 ฿"}
          </div>
          <Link href="/member">หน้าหลัก</Link>
          <Link href="/member/history">ประวัติการขาย</Link>
        </nav>

        {/* RIGHT MENU */}
        <div className={`${styles.menuRight} ${styles.desktopOnly}`}>
          {/* BALANCE BADGE */}
          <div className={styles.balanceBadge}>
            <FaWallet size={18} />
            {balance !== null ? `${balance.toLocaleString()} ฿` : "0 ฿"}
          </div>

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
                  href="/member/profile"
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

      {/* ===== Confirm Logout Modal ===== */}
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
