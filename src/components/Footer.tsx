"use client";

import { FaFacebookF, FaInstagram, FaLine } from "react-icons/fa";
import styles from "@/styles/components/footer.module.css";
import { useRouter } from "next/navigation";
import { SlPeople } from "react-icons/sl";

export default function Footer() {
  const router = useRouter();

  const handleLogin = () => {
    router.push("/login");
  };

  return (
    <footer className={styles.footer}>
      <div className={styles.content}>
        <p>© 2026 Recycling Bank. All rights reserved.</p>

        <div className={styles.links}>
          <a href="/terms">Terms of Service</a>
          <a href="/privacy">Privacy Policy</a>
          <a href="/contact">Contact Us</a>
        </div>

        <div className={styles.social}>
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaFacebookF />
          </a>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaInstagram />
          </a>
          <a href="https://line.me" target="_blank" rel="noopener noreferrer">
            <FaLine />
          </a>
        </div>
      </div>

      {/* Hidden Login Button
      <button
        className={styles.hiddenLogin}
        onClick={handleLogin}
        aria-label="Staff Login"
      >
        Login
      </button> */}
    </footer>
  );
}
