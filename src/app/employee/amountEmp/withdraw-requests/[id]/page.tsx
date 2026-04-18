"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import EmployeeNavbar from "@/components/navbar/EmployeeNavbar";
import styles from "@/styles/pages/employees/employeeBalanceWithdrawRequestDetail.module.css";
import { FaArrowLeft } from "react-icons/fa";

type Status = "PENDING" | "APPROVED" | "REJECTED";

type WithdrawDetail = {
  id: number;
  name: string;
  amount: number;
  date: string;
  status: Status;
};

export default function WithdrawDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);

  const [data, setData] = useState<WithdrawDetail | null>(null);
  const [status, setStatus] = useState<Status>("PENDING");

  ////////////////////////////////////////////////////////
  // โหลดข้อมูลคำขอถอน
  ////////////////////////////////////////////////////////

  const fetchDetail = async () => {
    const res = await fetch(
      `/api/employee/wallet?type=withdrawDetail&requestId=${id}`,
    );

    const result = await res.json();

    setData(result);
    setStatus(result.status);
  };

  useEffect(() => {
    if (id) fetchDetail();
  }, [id]);

  ////////////////////////////////////////////////////////
  // Approve
  ////////////////////////////////////////////////////////

  const handleApprove = async () => {
    await fetch("/api/employee/wallet", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        requestId: id,
        status: "APPROVED",
      }),
    });

    setStatus("APPROVED");
  };

  ////////////////////////////////////////////////////////
  // Reject
  ////////////////////////////////////////////////////////

  const handleReject = async () => {
    await fetch("/api/employee/wallet", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        requestId: id,
        status: "REJECTED",
      }),
    });

    setStatus("REJECTED");
  };

  ////////////////////////////////////////////////////////

  if (!data) {
    return <div>กำลังโหลด...</div>;
  }

  return (
    <>
      <EmployeeNavbar />

      <div className={styles.container}>
        <div className={styles.card}>
          <h1>รายละเอียดคำขอถอนเงิน</h1>

          <div className={styles.row}>
            <span>สมาชิก</span>
            <span>{data.name}</span>
          </div>

          <div className={styles.row}>
            <span>จำนวนเงิน</span>
            <span>{data.amount.toLocaleString()} บาท</span>
          </div>

          <div className={styles.row}>
            <span>วันที่ขอ</span>
            <span>{new Date(data.date).toLocaleDateString("th-TH")}</span>
          </div>

          <div className={styles.row}>
            <span>สถานะ</span>

            <span
              className={`${styles.status}
              ${
                status === "APPROVED"
                  ? styles.approved
                  : status === "REJECTED"
                    ? styles.rejected
                    : styles.pending
              }`}
            >
              {status}
            </span>
          </div>

          {/* ===== ปุ่มอนุมัติ / ปฏิเสธ ===== */}

          {status === "PENDING" && (
            <div className={styles.actionButtons}>
              <button className={styles.approveBtn} onClick={handleApprove}>
                Approve
              </button>

              <button className={styles.rejectBtn} onClick={handleReject}>
                Reject
              </button>
            </div>
          )}

          <hr className={styles.divider} />

          <button className={styles.backBtn} onClick={() => router.back()}>
            กลับ
          </button>
        </div>
      </div>
    </>
  );
}
