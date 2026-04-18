import Image from "next/image";
import styles from "@/styles/pages/download.module.css";
import NavbarPublic from "@/components/navbar/NavbarPublic";

export default function DownloadPage() {
  return (
    <>
      <NavbarPublic />

      <main>
        {/* HERO */}
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <h1>Download Now</h1>

            {/* ✅ Mobile only : Download Button */}
            <div className={styles.storeButtons}>
              <a
                href="https://play.google.com"
                target="_blank"
                className={styles.downloadBtn}
              >
                Download App
              </a>
            </div>

            {/*  Desktop only */}
            <div className={styles.desktopOnly}>
              <p>กรุณาเปิดหน้านี้บนโทรศัพท์มือถือเพื่อดาวน์โหลดแอป</p>
              <span>Open this page on your mobile browser</span>
            </div>

            <div className={styles.phonePreview}>
              <Image src="/mockup/phone2.png" alt="" width={460} height={450} />
              <Image src="/mockup/phone2.png" alt="" width={460} height={480} />
              <Image src="/mockup/phone2.png" alt="" width={460} height={450} />
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section className={styles.features}>
          <h2>Explore the features of RecyclingBank</h2>

          <div className={styles.featureGrid}>
            <div className={styles.card}>
              <Image
                src="/features/parent.jpg"
                alt=""
                width={320}
                height={220}
              />
              <h3>Care Your Family</h3>
              <p>Track and support your family health together.</p>
            </div>

            <div className={styles.card}>
              <Image
                src="/features/support.jpg"
                alt=""
                width={320}
                height={220}
              />
              <h3>Community Support</h3>
              <p>Connect people through recycling activities.</p>
            </div>

            <div className={styles.card}>
              <Image
                src="/features/health.jpg"
                alt=""
                width={320}
                height={220}
              />
              <h3>Sustainable Living</h3>
              <p>Build long-term habits for a greener future.</p>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
