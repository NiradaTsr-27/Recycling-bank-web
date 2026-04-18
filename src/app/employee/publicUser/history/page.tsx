"use client";

import { useEffect, useState } from "react";
import styles from "@/styles/pages/employees/publicUserHis.module.css";

interface Sale {
  id: number;
  quantity: number;
  totalPrice: number;
  createdAt: string;
  publicUser: {
    firstName: string;
    lastName: string;
    nationalId: string;
  };
  wasteType: {
    name: string;
    price: number;
    unit: string;
  };
}

export default function PublicUserHistoryPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/publicUser/public-sale/history")
      .then((res) => res.json())
      .then((data) => {
        setSales(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <p className={styles.loading}>กำลังโหลด...</p>;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>ประวัติการรับซื้อ (บุคคลทั่วไป)</h1>

      <div className="card glass">
        <table className={styles.table}>
          <thead className={styles.thead}>
            <tr>
              <th className={styles.th}>วันที่</th>
              <th className={styles.th}>เลขบัตร</th>
              <th className={styles.th}>ชื่อ</th>
              <th className={styles.th}>รายการ</th>
              <th className={styles.th}>ราคา/หน่วย</th>
              <th className={styles.th}>จำนวน</th>
              <th className={styles.th}>รวม (บาท)</th>
            </tr>
          </thead>

          <tbody>
            {sales.map((s) => (
              <tr key={s.id} className={styles.row}>
                <td className={styles.td}>
                  {new Date(s.createdAt).toLocaleString()}
                </td>
                <td className={styles.td}>{s.publicUser.nationalId}</td>
                <td className={styles.td}>
                  {s.publicUser.firstName} {s.publicUser.lastName}
                </td>
                <td className={styles.td}>{s.wasteType.name}</td>
                <td className={styles.td}>
                  {s.wasteType.price} / {s.wasteType.unit}
                </td>
                <td className={styles.td}>{s.quantity}</td>
                <td className={`${styles.td} ${styles.total}`}>
                  {s.totalPrice.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
