"use client";

import { useEffect, useState } from "react";
import EmployeeNavbar from "@/components/navbar/EmployeeNavbar";
import styles from "@/styles/pages/employees/employeeStatusEmp.module.css";
import Link from "next/link";

export default function StatusEmpPage() {
  const [data, setData] = useState<any[]>([]);

  ////////////////////////////////////////////////////
  // ดึงข้อมูลจาก API
  ////////////////////////////////////////////////////

  useEffect(() => {
    const fetchSales = async () => {
      try {
        const res = await fetch("/api/employee/status", {
          cache: "no-store", // 🔥 กัน cache
        });
        const result = await res.json();
        setData(result);
      } catch (error) {
        console.error("Fetch error:", error);
      }
    };

    fetchSales();

    // เพิ่ม auto refresh
    const interval = setInterval(fetchSales, 2000);

    return () => clearInterval(interval);
  }, []);

  ////////////////////////////////////////////////////
  // สีสถานะ
  ////////////////////////////////////////////////////

  const getStatusClass = (status: string) => {
    if (status === "APPROVED") return styles.confirmed;
    if (status === "REJECTED") return styles.rejected;
    return styles.pending;
  };

  return (
    <>
      <EmployeeNavbar />

      <div className={styles.container}>
        <h1 className={styles.title}>รายการ (รอยืนยันการรับซื้อ)</h1>

        <div className={styles.card}>
          <div style={{ maxHeight: "550px", overflowY: "auto" }}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>ชื่อสมาชิก</th>

                  <th>รายการขยะ</th>
                  <th>ราคารวม</th>
                  <th>วันที่ขาย</th>
                  <th>สถานะ</th>
                  <th>พนักงาน</th>
                  <th>จัดการ</th>
                </tr>
              </thead>

              <tbody>
                {data.map((row) => (
                  <tr key={row.id}>
                    <td>{row.member}</td>

                    <td>{row.items.join(", ")}</td>

                    <td>{Number(row.total).toFixed(2)} บาท</td>
                    <td>{new Date(row.date).toLocaleDateString("th-TH")}</td>
                    <td>
                      <span className={getStatusClass(row.status)}>
                        {row.status}
                      </span>
                    </td>

                    <td>{row.employee || "-"}</td>

                    <td>
                      <Link href={`/employee/statusEmp/${row.id}`}>
                        <button className={styles.detailBtn}>
                          ดูรายละเอียด
                        </button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
