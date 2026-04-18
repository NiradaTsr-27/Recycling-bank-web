"use client";

import styles from "@/styles/pages/home.module.css";
import Link from "next/link";
import Image from "next/image";

export default function HomeContent(): JSX.Element {
  return (
    <>


      {/* Impact Section */}
      <section className={styles.impact}>
        <div className={styles.impactGrid}>
          <div className={`${styles.impactCard} ${styles.animateFadeInUp} ${styles["delay-1"]}`}>
            <h3>28+</h3>
            <p>ล้านตันขยะต่อปี</p>
          </div>
          <div className={`${styles.impactCard} ${styles.animateFadeInUp} ${styles["delay-2"]}`}>
            <h3>51%</h3>
            <p>เป้าหมายระดับชาติ</p>
          </div>
          <div className={`${styles.impactCard} ${styles.animateFadeInUp} ${styles["delay-3"]}`}>
            <h3>100%</h3>
            <p>โปร่งใส ตรวจสอบได้</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className={styles.section}>
        <div className={`text-center mb-10 ${styles.animateFadeInUp}`}>
          <h2 className="text-3xl font-extrabold text-primary-dark mb-4">บริการของเรา</h2>
          <p className="text-secondary text-lg max-w-2xl mx-auto">
            ทางเรามีบริการต่างๆ มากมายที่จะช่วยอำนวยความสะดวกในการจัดการขยะและรีไซเคิลอย่างครบวงจร
          </p>
        </div>
        <div className="grid-3 mt-8">
          <div className={`${styles.card} glass text-center flex-col items-center ${styles.animateFadeInUp} ${styles["delay-1"]}`}>
            <Image
              src="/images/iconMembership.png"
              alt=""
              width={90}
              height={90}
              className={`${styles.icon} ${styles.iconFloat}`}
            />
            <h3 className="text-xl font-bold text-primary mb-2 mt-4">ระบบสมาชิก</h3>
            <p className="text-secondary text-sm">สมัครสมาชิก และติดตามประวัติการซื้อ–ขายของคุณได้ง่ายๆ อย่างเป็นระบบ</p>
          </div>

          <div className={`${styles.card} glass text-center flex-col items-center ${styles.animateFadeInUp} ${styles["delay-2"]}`}>
            <Image
              src="/images/iconmanagetrash.png"
              alt=""
              width={90}
              height={90}
              className={`${styles.icon} ${styles.iconFloat}`}
            />
            <h3 className="text-xl font-bold text-primary mb-2 mt-4">จัดการขยะ</h3>
            <p className="text-secondary text-sm">ดูและอัพเดทข้อมูลประเภทขยะพร้อมราคารับซื้อแบบเรียลไทม์</p>
          </div>

          <div className={`${styles.card} glass text-center flex-col items-center ${styles.animateFadeInUp} ${styles["delay-3"]}`}>
            <Image
              src="/images/iconreport.png"
              alt=""
              width={90}
              height={90}
              className={`${styles.icon} ${styles.iconFloat}`}
            />
            <h3 className="text-xl font-bold text-primary mb-2 mt-4">รายงานและสถิติ</h3>
            <p className="text-secondary text-sm">สรุปผลข้อมูลสถิติที่ชัดเจน เพื่อง่ายต่อการนำไปวิเคราะห์และพัฒนา</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={styles.cta}>
        <div className={`${styles.animateFadeInUp} ${styles["delay-1"]}`}>
          <h2 className="font-extrabold">เริ่มต้นเปลี่ยนขยะให้มีคุณค่า ตั้งแต่วันนี้</h2>
          <p className="text-white text-lg mb-8 opacity-90 mx-auto max-w-lg">
            มาร่วมเป็นส่วนหนึ่งในการสร้างโลกที่ยั่งยืน และสร้างรายได้ให้กับตัวคุณเอง
          </p>
          <Link href="/download" className={`${styles.btn} ${styles.primary} ${styles.btnPulse}`} style={{ background: "#fff", color: "var(--primary-dark)", padding: "18px 40px", fontSize: "20px", borderRadius: "50px", fontWeight: "bold", textDecoration: "none", display: "inline-block" }}>
            สมัครสมาชิกเลย
          </Link>
        </div>
      </section>
    </>
  );
}
