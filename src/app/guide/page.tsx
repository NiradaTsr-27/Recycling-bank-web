import Image from "next/image";
import styles from "@/styles/pages/guide.module.css";
import NavbarPublic from "@/components/navbar/NavbarPublic";
import Footer from "@/components/Footer";

type PlasticType = {
  id: number;
  name: string;
  image: string;
  full: string;
  description: string;
};

const plastics: PlasticType[] = [
  {
    id: 1,
    name: "PET",
    image: "/guide/pet.png",
    full: "Polyethylene Terephthalate",
    description:
      "พลาสติกใสที่พบได้บ่อยในขวดน้ำดื่มและขวดน้ำอัดลม สามารถนำไปรีไซเคิลได้ แต่ไม่ควรนำมาใช้ซ้ำ",
  },
  {
    id: 2,
    name: "HDPE",
    image: "/guide/hdpe.png",
    full: "High Density Polyethylene",
    description:
      "พบในขวดนม ขวดแชมพู และขวดน้ำยาทำความสะอาด แข็งแรง ทนทาน และรีไซเคิลได้ง่าย",
  },
  {
    id: 3,
    name: "PVC",
    image: "/guide/pvc.png",
    full: "Polyvinyl Chloride",
    description:
      "ใช้กับท่อพลาสติก สายไฟ และวัสดุก่อสร้าง ไม่เหมาะสำหรับบรรจุอาหาร และรีไซเคิลได้ยาก",
  },
  {
    id: 4,
    name: "LDPE",
    image: "/guide/ldpe.png",
    full: "Low Density Polyethylene",
    description:
      "พบในถุงพลาสติกและฟิล์มห่ออาหาร มีความยืดหยุ่นสูง แต่ต้องใช้กระบวนการเฉพาะในการรีไซเคิล",
  },
  {
    id: 5,
    name: "PP",
    image: "/guide/pp.png",
    full: "Polypropylene",
    description:
      "ใช้กับกล่องอาหารและภาชนะไมโครเวฟ ทนความร้อนสูง และปลอดภัยต่ออาหาร",
  },
  {
    id: 6,
    name: "PS",
    image: "/guide/ps.png",
    full: "Polystyrene",
    description: "พบในกล่องโฟมและแก้วโฟม ย่อยสลายยาก และไม่เหมาะกับอาหารร้อน",
  },
  {
    id: 7,
    name: "OTHER",
    image: "/guide/other.png",
    full: "Other Plastics",
    description:
      "พลาสติกผสมหรือพลาสติกชนิดพิเศษ ส่วนใหญ่รีไซเคิลได้ยาก หรือไม่สามารถรีไซเคิลได้",
  },
];

export default function DownloadPage(): JSX.Element {
  return (
    <div className="page-wrapper">
      <NavbarPublic />

      <main className={styles.main}>
        <div className={styles.recycleKnowledge}>
          <div className={styles.hero}>
            <h1>สัญลักษณ์วัสดุรีไซเคิล</h1>
            <p>
              ทำความเข้าใจสัญลักษณ์บนบรรจุภัณฑ์ต่างๆ
              เพื่อให้คุณสามารถช่วยแยกขยะเพื่อการรีไซเคิลและดูแลโลกใบนี้ได้อย่างถูกต้อง
            </p>
          </div>

          <div className={styles.symbolList}>
            {plastics.map((plastic) => (
              <div key={plastic.id} className={styles.symbolCard}>
                <div className={styles.symbolTop}>
                  <span className={styles.badge}>{plastic.id}</span>

                  <div className={styles.imageWrapper}>
                    <Image
                      src={plastic.image}
                      alt={plastic.name}
                      fill
                      className={styles.image}
                    />
                  </div>
                </div>

                <h2>
                  {plastic.name} ({plastic.full})
                </h2>
                <p>{plastic.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.recycleGuide}>
          <h2 className={styles.guideTitle}>
            6 ขั้นตอนง่ายๆ ในการจัดการขยะรีไซเคิล
          </h2>
          <p className={styles.guideDesc}>
            หลังจากคัดแยกขยะแล้ว การจัดการที่ถูกต้องจะช่วยเพิ่มมูลค่า ลดกลิ่น
            ป้องกันเชื้อโรค และช่วยให้กระบวนการรีไซเคิลมีประสิทธิภาพมากที่สุด
          </p>

          <div className={styles.guideSteps}>
            <div className={styles.guideCard}>
              <span className={styles.step}>1</span>
              <h3>ล้างทำความสะอาด</h3>
              <p>
                ล้างคราบอาหารหรือของเหลวออกให้หมดก่อนทิ้ง เพื่อลดกลิ่นเหม็นและป้องกันแมลงรบกวน
              </p>
            </div>

            <div className={styles.guideCard}>
              <span className={styles.step}>2</span>
              <h3>ผึ่งให้แห้งสนิท</h3>
              <p>ควรผึ่งหรือเช็ดให้แห้งก่อนเก็บ ช่วยลดการเติบโตของขยะเปียกและป้องกันเชื้อรา</p>
            </div>

            <div className={styles.guideCard}>
              <span className={styles.step}>3</span>
              <h3>แยกตามประเภท</h3>
              <p>แยกขยะตามสัญลักษณ์รีไซเคิลอย่างชัดเจน เช่น ขวดพลาสติกใส, กระดาษ, กระป๋องอลูมิเนียม</p>
            </div>

            <div className={styles.guideCard}>
              <span className={styles.step}>4</span>
              <h3>บีบอัดลดพื้นที่</h3>
              <p>บีบขวดพลาสติกหรือพับกล่องกระดาษ เพื่อเพิ่มพื้นที่จัดเก็บให้ได้มากที่สุด</p>
            </div>

            <div className={styles.guideCard}>
              <span className={styles.step}>5</span>
              <h3>จัดเก็บในที่เหมาะสม</h3>
              <p>ควรเก็บในที่แห้ง มีอากาศถ่ายเท หลีกเลี่ยงแสงแดดและความชื้นที่ทำให้เสื่อมสภาพ</p>
            </div>

            <div className={styles.guideCard}>
              <span className={styles.step}>6</span>
              <h3>นำไปขายหรือส่งต่อ</h3>
              <p>
                เมื่อสะสมได้ปริมาณที่เหมาะสม สามารถนำมาขายผ่านธนาคารขยะให้เรา เพื่อส่งต่อเข้าสู่กระบวนการที่ถูกต้อง
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
