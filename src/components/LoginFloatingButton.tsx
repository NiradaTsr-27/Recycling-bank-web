"use client";

import Link from "next/link";
import styles from "@/styles/components/loginButton.module.css";
import { RxPeople } from "react-icons/rx";

export default function LoginFloatingButton() {
  return (
    <div className={styles.floatingLoginBtn}>
      <Link href="/login" className={styles.loginBtn}>
        <RxPeople size={26} />
      </Link>
    </div>
  );
}
