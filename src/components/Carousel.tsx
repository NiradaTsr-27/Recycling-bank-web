"use client";

import { useState, useEffect } from "react";
import styles from "@/styles/components/carousel.module.css";
import Link from "next/link";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const slides = [
  {
    image: "/hero/slide1.jpg",
    title: "เปลี่ยนขยะให้มีค่า สร้างรายได้ให้ชุมชน",
    subtitle: "ระบบจัดการธนาคารขยะรีไซเคิล เพื่อส่งเสริมการคัดแยกขยะ เพิ่มประสิทธิภาพการจัดการข้อมูล และสนับสนุนการพัฒนาอย่างยั่งยืน",
  },
  {
    image: "/hero/slide2.jpg",
    title: "โปร่งใส ตรวจสอบได้ทุกขั้นตอน",
    subtitle: "มาพร้อมกับระบบหลังบ้านที่แข็งแกร่ง ให้คุณมั่นใจทุกการทำธุรกรรมว่าถูกต้องและแม่นยำ 100%",
  },
  {
    image: "/hero/slide3.jpg",
    title: "ร่วมเป็นส่วนหนึ่งของโลกที่ยั่งยืน",
    subtitle: "ทุกๆ การรีไซเคิลของคุณ คือการต่อลมหายใจให้กับสิ่งแวดล้อม เริ่มต้นง่ายๆ ได้ตั้งแต่วันนี้",
  }
];

export default function Carousel() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, 6000); // 6 seconds per slide for better reading time
    return () => clearInterval(interval);
  }, []);

  return (
    <section className={styles.carouselContainer}>
      {slides.map((slide, i) => (
        <div
          key={i}
          className={`${styles.slide} ${i === index ? styles.activeSlide : ""}`}
          style={{ backgroundImage: `url(${slide.image})` }}
        >
          <div className={styles.overlay}></div>
          <div className={`${styles.content} ${i === index ? styles.activeContent : ""}`}>
            <h1>{slide.title}</h1>
            <p>{slide.subtitle}</p>
            <div className={styles.actions}>
              <Link href="/register" className={styles.btnPrimary}>
                เริ่มต้นใช้งาน
              </Link>
              <Link href="#features" className={styles.btnSecondary}>
                ดูข้อมูลเพิ่มเติม
              </Link>
            </div>
          </div>
        </div>
      ))}

      <button
        className={`${styles.carouselBtn} ${styles.left}`}
        onClick={() => setIndex((index - 1 + slides.length) % slides.length)}
      >
        <FaChevronLeft />
      </button>

      <button
        className={`${styles.carouselBtn} ${styles.right}`}
        onClick={() => setIndex((index + 1) % slides.length)}
      >
        <FaChevronRight />
      </button>

      <div className={styles.dots}>
        {slides.map((_, i) => (
          <button
            key={i}
            className={`${styles.dot} ${i === index ? styles.activeDot : ""}`}
            onClick={() => setIndex(i)}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
