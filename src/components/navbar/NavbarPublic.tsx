"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "@/styles/components/navbarPublic.module.css";

export default function NavbarPublic() {
  const [open, setOpen] = useState(false);

  return (
    <header className={styles.navbar}>
      {/* Logo */}
      <Link href="/" className={styles.logo}>
        <Image
          src="/hero/logo-1.png"
          alt="Recycling Bank"
          width={55}
          height={55}
          priority
        />
        <span className={styles.logoText}>Recycling Bank</span>
      </Link>

      {/* Center Menu */}
      <nav className={`${styles.menuCenter} ${open ? styles.open : ""}`}>
        <Link href="/" onClick={() => setOpen(false)}>
          <b>หน้าหลัก</b>
        </Link>
        <Link href="/guide" onClick={() => setOpen(false)}>
          <b>เคล็ดลับรีไซเคิล</b>
        </Link>

        {/* Download (mobile only) */}
        <a
          className={`${styles.downloadBtn} ${styles.mobileOnly}`}
          href="/register"
          onClick={() => setOpen(false)}
        >
          <b>Register</b>
        </a>
      </nav>

      {/* Right Menu (desktop only) */}
      <div className={styles.menuRight}>
        <a
          className={`${styles.downloadBtn} ${styles.desktopOnly}`}
          href="/register"
        >
          <b>Register</b>
        </a>

        <button
          className={styles.hamburger}
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          ☰
        </button>
      </div>
    </header>
  );
}
