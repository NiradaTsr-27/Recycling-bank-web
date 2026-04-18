"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import MemberNavbar from "@/components/navbar/MemberNavbar";
import styles from "@/styles/pages/admin/adminEmployees.module.css"; 

type HistorySale = {
  id: number;
  wasteName: string;
  quantity: number;
  unit: string;
  totalPrice: number;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
};

export default function MemberHistoryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [history, setHistory] = useState<HistorySale[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination if needed
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    if (status === "loading") return;
    if (!session) router.replace("/login");
    if (session?.user.role !== "MEMBER") router.replace("/");
  }, [session, status, router]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch("/api/member/history");
        const data = await res.json();
        if (res.ok) {
          setHistory(data);
        }
      } catch (err) {
        console.error("โหลดข้อมูลไม่สำเร็จ", err);
      } finally {
        setLoading(false);
      }
    };
    if (session?.user?.role === "MEMBER") {
      fetchHistory();
    }
  }, [session]);

  if (status === "loading" || loading) {
    return (
      <div className="page-wrapper">
        <MemberNavbar />
        <div className="page-center text-secondary">กำลังโหลดข้อมูล...</div>
      </div>
    );
  }

  const getStatusBadge = (txStatus: string) => {
    switch (txStatus) {
      case "APPROVED":
        return <span className="badge" style={{ background: "#d1fae5", color: "#065f46", padding: "4px 8px", borderRadius: "12px", fontSize: "12px", fontWeight: "600" }}>สำเร็จ</span>;
      case "PENDING":
        return <span className="badge" style={{ background: "#fef3c7", color: "#b45309", padding: "4px 8px", borderRadius: "12px", fontSize: "12px", fontWeight: "600" }}>รอดำเนินการ</span>;
      case "REJECTED":
        return <span className="badge" style={{ background: "#fee2e2", color: "#991b1b", padding: "4px 8px", borderRadius: "12px", fontSize: "12px", fontWeight: "600" }}>ถูกปฏิเสธ</span>;
      default:
        return txStatus;
    }
  };

  const totalPages = Math.ceil(history.length / itemsPerPage);
  const displayedHistory = history.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="page-wrapper">
      <MemberNavbar />

      <main className="container py-8">
        <div className="mb-6 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-main mb-2">ประวัติการนำขยะมาขาย</h1>
            <p className="text-secondary">ตรวจสอบรายการขยะทั้งหมดที่คุณนำมารีไซเคิลไว้ที่นี่</p>
          </div>
        </div>

        <div className="card glass" style={{ margin: "0", padding: "0", overflow: "hidden" }}>
          <div style={{ padding: "24px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 className="text-xl font-bold text-main">รายการทั้งหมด ({history.length} รายการ)</h3>
          </div>
          
          <div style={{ overflowX: "auto", minHeight: "300px" }}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>รหัสการขาย</th>
                  <th>วันที่ขาย</th>
                  <th>ชื่อขยะ</th>
                  <th>ปริมาณ</th>
                  <th>ราคาที่ได้ (บาท)</th>
                  <th>สถานะ</th>
                </tr>
              </thead>
              <tbody>
                {displayedHistory.length > 0 ? (
                  displayedHistory.map((sale) => (
                    <tr key={sale.id}>
                      <td>#{sale.id}</td>
                      <td>{new Date(sale.createdAt).toLocaleDateString("th-TH")}</td>
                      <td className="font-medium text-main">{sale.wasteName}</td>
                      <td className="font-semibold text-info">{sale.quantity} {sale.unit}</td>
                      <td className="font-semibold text-success">+{sale.totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })} ฿</td>
                      <td>{getStatusBadge(sale.status)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="text-center text-secondary"
                      style={{ padding: "60px" }}
                    >
                      ไม่มีข้อมูลประวัติการขาย
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {totalPages > 1 && (
            <div style={{ padding: "20px", display: "flex", justifyContent: "center", gap: "10px", borderTop: "1px solid var(--border)" }}>
              <button 
                className="btn btn-secondary"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
                style={{ padding: "8px 16px" }}
              >
                ก่อนหน้า
              </button>
              <span className="flex items-center text-secondary font-medium">
                หน้า {currentPage} จาก {totalPages}
              </span>
              <button 
                className="btn btn-secondary"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => p + 1)}
                style={{ padding: "8px 16px" }}
              >
                ถัดไป
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
