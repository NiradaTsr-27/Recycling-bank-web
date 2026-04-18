"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import EmployeeNavbar from "@/components/navbar/EmployeeNavbar";
import styles from "@/styles/pages/employees/employeeBalanceWithdrawRequests.module.css";
import { FaArrowLeft } from "react-icons/fa";

type WithdrawRequest = {
  id: number;
  name: string;
  amount: number;
  date: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
};

export default function WithdrawRequestsPage() {
  const router = useRouter();

  const [requests, setRequests] = useState<WithdrawRequest[]>([]);

  ////////////////////////////////////////////////////////
  // โหลดข้อมูลคำขอถอนเงิน
  ////////////////////////////////////////////////////////

  const fetchRequests = async () => {
    const res = await fetch("/api/employee/wallet?type=withdrawRequests");
    const data = await res.json();
    setRequests(data);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  ////////////////////////////////////////////////////////
  // แปลงสถานะ
  ////////////////////////////////////////////////////////

  const renderStatus = (status: string) => {
    if (status === "APPROVED") {
      return <span className={styles.approved}>อนุมัติแล้ว</span>;
    }

    if (status === "REJECTED") {
      return <span className={styles.rejected}>ปฏิเสธ</span>;
    }

    return <span className={styles.pending}>รอดำเนินการ</span>;
  };

  return (
    <>
      <EmployeeNavbar />

      <div className={styles.container}>
        <div className={styles.card}>
          <h1>รายการคำขอถอนเงิน</h1>

          <div className={styles.tableHeader}>
            <div>สมาชิก</div>
            <div>จำนวนเงิน</div>
            <div>วันที่ขอ</div>
            <div>สถานะ</div>
            <div></div>
          </div>

          {requests.map((req) => (
            <div key={req.id} className={styles.row}>
              <div>{req.name}</div>

              <div>{req.amount.toLocaleString()} บาท</div>

              <div>{new Date(req.date).toLocaleDateString("th-TH")}</div>

              <div>{renderStatus(req.status)}</div>

              <div>
                <button
                  className={styles.detailBtn}
                  onClick={() =>
                    router.push(
                      `/employee/amountEmp/withdraw-requests/${req.id}`,
                    )
                  }
                >
                  ดูรายละเอียด
                </button>
              </div>
            </div>
          ))}

          <button className={styles.backBtn} onClick={() => router.back()}>
            กลับ
          </button>
        </div>
      </div>
    </>
  );
}
