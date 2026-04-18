"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import styles from "@/styles/pages/employees/employeeBalanceHistory.module.css";
import { FaArrowLeft } from "react-icons/fa";
import EmployeeNavbar from "@/components/navbar/EmployeeNavbar";

type Transaction = {
  type: "deposit" | "withdraw";
  amount: number;
  date: string;
};

export default function HistoryPage() {
  const router = useRouter();
  const params = useParams();
  const memberId = Number(params.id);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  ////////////////////////////////////////////////////////
  // โหลดประวัติธุรกรรมจาก API
  ////////////////////////////////////////////////////////

  const fetchHistory = async () => {
    const res = await fetch(
      `/api/employee/wallet?type=history&memberId=${memberId}`,
    );

    const data = await res.json();

    setTransactions(data);
    setLoading(false);
  };

  useEffect(() => {
    if (memberId) fetchHistory();
  }, [memberId]);

  ////////////////////////////////////////////////////////

  return (
    <>
      <EmployeeNavbar />

      <div className={styles.container}>
        <div className={styles.card}>
          <h1>ประวัติธุรกรรม</h1>

          {loading ? (
            <p className={styles.empty}>กำลังโหลด...</p>
          ) : transactions.length === 0 ? (
            <p className={styles.empty}>ยังไม่มีประวัติธุรกรรม</p>
          ) : (
            <div className={styles.list}>
              {transactions.map((t, index) => (
                <div key={index} className={styles.item}>
                  <span>{t.type === "deposit" ? "ฝากเงิน" : "ถอนเงิน"}</span>

                  <span>{Number(t.amount).toFixed(2)} บาท</span>

                  <span>{new Date(t.date).toLocaleDateString("th-TH")}</span>
                </div>
              ))}
            </div>
          )}

          <button className={styles.backBtn} onClick={() => router.back()}>
            กลับ
          </button>
        </div>
      </div>
    </>
  );
}
