"use client";

import { useEffect, useState } from "react";
import styles from "@/styles/pages/employees/employeeBuyDetail.module.css";
import { useRouter, useParams } from "next/navigation";
import EmployeeNavbar from "@/components/navbar/EmployeeNavbar";
import { useSession } from "next-auth/react";

export default function EmployeeBuyDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);

  const { data: session } = useSession();

  const [saleData, setSaleData] = useState<any>(null);
  const [status, setStatus] = useState<"PENDING" | "APPROVED" | "REJECTED">(
    "PENDING",
  );

  ////////////////////////////////////////////////////
  // โหลดข้อมูลจาก API
  ////////////////////////////////////////////////////
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/employee/status/${id}`);
        const data = await res.json();

        if (data && data.status) {
          setSaleData(data);
          setStatus(data.status as "PENDING" | "APPROVED" | "REJECTED");
        } else {
          setStatus("PENDING"); // default fallback
        }
      } catch (err) {
        console.error("Failed to fetch sale data:", err);
        setStatus("PENDING"); // fallback
      }
    };
    fetchData();
  }, [id]);

  ////////////////////////////////////////////////////
  // update status
  ////////////////////////////////////////////////////
  const updateStatus = async (newStatus: "APPROVED" | "REJECTED") => {
    const employeeId = session?.user?.employeeId;

    if (!employeeId) {
      alert("ไม่พบข้อมูลพนักงาน กรุณา login ใหม่");
      return;
    }

    await fetch(`/api/employee/status/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: newStatus,
        employeeId: Number(employeeId),
      }),
    });

    // 🔥 FIX สำคัญ
    router.push("/employee/statusEmp");
    router.refresh();
  };

  if (!saleData) return <div>Loading...</div>;

  return (
    <>
      <EmployeeNavbar />
      <div className={styles.container}>
        <div className={styles.card}>
          <h1 className={styles.title}>รายละเอียดการขาย</h1>

          <div className={styles.info}>
            <p>
              <strong>สมาชิก:</strong> {saleData.member}
            </p>
            <p>
              <strong>วันที่ขาย:</strong>{" "}
              {new Date(saleData.date).toLocaleDateString("th-TH")}
            </p>
            <p>
              <strong>ราคารวม:</strong> {saleData.total} บาท
            </p>
            <p>
              <strong>สถานะปัจจุบัน:</strong>{" "}
              <span className={styles[status?.toLowerCase() ?? "pending"]}>
                {status ?? "-"}
              </span>
            </p>
          </div>

          <hr className={styles.divider} />

          {saleData.items.map((item: any, index: number) => (
            <div key={index} className={styles.itemCard}>
              <h3>{item.name}</h3>
              <p>น้ำหนัก: {item.weight} กก.</p>
              <p>ราคา: {item.price} บาท</p>
              <div className={styles.images}>
                <div className={styles.imagePlaceholder}></div>
                <div className={styles.imagePlaceholder}></div>
              </div>
            </div>
          ))}

          <hr className={styles.divider} />

          {/* ปุ่มสำหรับ PENDING */}
          {status === "PENDING" && (
            <div className={styles.actions}>
              <button
                className={styles.confirm}
                onClick={() => updateStatus("APPROVED")}
              >
                ยืนยันการรับซื้อ
              </button>
              <button
                className={styles.reject}
                onClick={() => updateStatus("REJECTED")}
              >
                ปฏิเสธ
              </button>
            </div>
          )}

          {/* ปุ่มย้อนกลับหน้ารายการ สำหรับสถานะใด ๆ */}
          {status !== "PENDING" && (
            <div className={styles.actions}>
              <button
                className={styles.back}
                onClick={() => router.push("/employee/statusEmp")}
              >
                กลับ
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
