"use client";

import { useEffect, useState } from "react";
import styles from "@/styles/pages/admin/adminReport.module.css";
import { FiPrinter } from "react-icons/fi";
import EmployeeNavbar from "@/components/navbar/EmployeeNavbar";

type WasteSummary = {
  wasteType: string;
  totalWeight: number;
  price: number;
  totalAmount: number;
};

type ReportData = {
  summary: {
    totalWeight: number;
    totalAmount: number;
    totalTransactions: number;
    uniqueMembers: number;
  };
  wasteSummary: WasteSummary[];
};

const formatThaiDateTime = () => {
  const now = new Date();

  const date = now.toLocaleDateString("th-TH", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const time = now.toLocaleTimeString("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return `${date} เวลา ${time} น.`;
};

export default function EmpReportPage() {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  // ✅ ตั้งค่า default = วันนี้
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setSelectedDate(today);
  }, []);

  const fetchReport = async () => {
    if (!selectedDate) return; // 🔥 กันยิง API ตอนค่าว่าง

    try {
      setLoading(true);
      setError("");

      const res = await fetch(`/api/employee/report?date=${selectedDate}`);

      if (!res.ok) {
        throw new Error();
      }

      const json = await res.json();
      setData(json);
    } catch (err) {
      setError("ไม่สามารถโหลดข้อมูลรายงานได้");
    } finally {
      setLoading(false);
    }
  };

  // โหลดข้อมูลเมื่อเลือกวันที่
  useEffect(() => {
    fetchReport();
  }, [selectedDate]);

  const handlePrint = () => window.print();

  return (
    <>
      <EmployeeNavbar />

      <div className={styles.pageWrapper}>
        <div className={styles.containerCard}>
          <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
              <div>
                <h1 className={styles.title}>รายงานสรุปยอดขยะรีไซเคิล</h1>

                <p className={styles.subTitle}>
                  วันที่ออกรายงาน: {formatThaiDateTime()}
                </p>

                {/*  แสดงวันที่ที่เลือก */}
                <p>ข้อมูลของวันที่: {selectedDate || "-"}</p>
              </div>

              <div className={styles.actions}>
                <input
                  type="date"
                  className={styles.select}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />

                <button className={styles.printBtn} onClick={handlePrint}>
                  <FiPrinter />
                  พิมพ์รายงาน
                </button>
              </div>
            </div>

            {/* Loading */}
            {loading && <p>กำลังโหลดข้อมูล...</p>}

            {/* Error */}
            {error && <p>{error}</p>}

            {/* Summary */}
            {data?.summary && (
              <>
                <div className={styles.summaryGrid}>
                  <div className={styles.summaryCard}>
                    <p className={styles.summaryLabel}>น้ำหนักรวม</p>
                    <p className={styles.summaryValue}>
                      {(data.summary.totalWeight ?? 0).toFixed(2)} kg
                    </p>
                  </div>

                  <div className={styles.summaryCard}>
                    <p className={styles.summaryLabel}>มูลค่ารวม</p>
                    <p className={styles.summaryValue}>
                      {(data.summary.totalAmount ?? 0).toLocaleString()} บาท
                    </p>
                  </div>

                  <div className={styles.summaryCard}>
                    <p className={styles.summaryLabel}>รายการรับซื้อ</p>
                    <p className={styles.summaryValue}>
                      {data.summary.totalTransactions ?? 0}
                    </p>
                  </div>

                  <div className={styles.summaryCard}>
                    <p className={styles.summaryLabel}>สมาชิกที่ใช้บริการ</p>
                    <p className={styles.summaryValue}>
                      {data.summary.uniqueMembers ?? 0}
                    </p>
                  </div>
                </div>

                {/* Table */}

                <div className={styles.tableWrapper}>
                  <div className={styles.tableHeader}>
                    <div>ประเภทขยะ</div>
                    <div>น้ำหนัก (kg)</div>
                    <div>ราคา/กก.</div>
                    <div>รวมเงิน</div>
                  </div>

                  {data.wasteSummary?.length === 0 && (
                    <div className={styles.tableRow}>
                      <div>ไม่มีข้อมูล</div>
                      <div>-</div>
                      <div>-</div>
                      <div>-</div>
                    </div>
                  )}
                  <div style={{ maxHeight: "350px", overflowY: "auto" }}>
                    {data.wasteSummary?.map((item, index) => (
                      <div key={index} className={styles.tableRow}>
                        <div>{item.wasteType}</div>
                        <div>{(item.totalWeight ?? 0).toFixed(2)}</div>
                        <div>{item.price ?? 0}</div>
                        <div>{(item.totalAmount ?? 0).toLocaleString()}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
