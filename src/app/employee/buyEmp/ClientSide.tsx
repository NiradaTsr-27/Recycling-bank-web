"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "@/styles/pages/employees/employeeBuy.module.css";
import EmployeeNavbar from "@/components/navbar/EmployeeNavbar";
import { useSession } from "next-auth/react";

export default function EmployeeBuyPage() {
  const router = useRouter();
  const { data: session } = useSession();

  const [members, setMembers] = useState<any[]>([]);
  const [wastes, setWastes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    memberId: "",
    employeeId: "",
    wasteTypeId: "",
    date: new Date().toISOString().split("T")[0],
    weight: "",
    total: 0,
    status: "PENDING",
  });

  // โหลด dropdown
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/employee/buy");
        const data = await res.json();
        setMembers(data.members || []);
        setWastes(data.wastes || []);

        if (session?.user?.employeeId) {
          setForm((prev) => ({
            ...prev,
            employeeId: session.user.employeeId?.toString() || "",
            date: new Date().toISOString().split("T")[0],
          }));
        }
      } catch (err) {
        console.error("โหลดข้อมูลไม่สำเร็จ", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [session]);

  // handle change
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // คำนวณราคา
  useEffect(() => {
    const waste = wastes.find((w: any) => w.id === Number(form.wasteTypeId));
    if (waste && form.weight) {
      const total = Number(form.weight) * waste.price;
      // ปัดทศนิยมแค่ 2 ตำแหน่ง
      setForm((prev) => ({ ...prev, total: Number(total.toFixed(2)) }));
    } else {
      setForm((prev) => ({ ...prev, total: 0 }));
    }
  }, [form.weight, form.wasteTypeId, wastes]);

  // submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !form.memberId ||
      !form.employeeId ||
      !form.wasteTypeId ||
      !form.weight
    ) {
      alert("กรุณากรอกข้อมูลให้ครบ");
      return;
    }

    try {
      const res = await fetch("/api/employee/buy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberId: Number(form.memberId),
          employeeId: Number(form.employeeId),
          wasteTypeId: Number(form.wasteTypeId),
          quantity: Number(form.weight),
          date: form.date,
          status: form.status,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // เปิด modal แทน alert
      setShowModal(true);

      // รีเซ็ตฟอร์ม
      setForm({
        memberId: "",
        employeeId: session?.user?.employeeId?.toString() || "",
        wasteTypeId: "",
        date: new Date().toISOString().split("T")[0],
        weight: "",
        total: 0,
        status: "PENDING",
      });
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาด");
    }
  };

  if (loading) return <p style={{ padding: 20 }}>กำลังโหลดข้อมูล...</p>;

  return (
    <>
      <EmployeeNavbar />

      <div className={styles.container}>
        <form className={styles.card} onSubmit={handleSubmit}>
          <h1 className={styles.title}>การรับซื้อขยะรีไซเคิล</h1>

          {/* สมาชิก */}
          <div className={styles.group}>
            <label>
              สมาชิก <span style={{ color: "red" }}>*</span>
            </label>
            <select
              name="memberId"
              value={form.memberId}
              onChange={handleChange}
            >
              <option value="">เลือกสมาชิก</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.firstName} {m.lastName}
                </option>
              ))}
            </select>
          </div>

          {/* พนักงาน */}
          <div className={styles.group}>
            <label>พนักงานขาย</label>
            <input type="text" value={session?.user?.name || ""} disabled />
            <input type="hidden" name="employeeId" value={form.employeeId} />
          </div>

          {/* รายการขยะ */}
          <div className={styles.group}>
            <label>รายการขยะ</label>
            <select
              name="wasteTypeId"
              value={form.wasteTypeId}
              onChange={handleChange}
            >
              <option value="">เลือกรายการขยะ</option>
              {wastes.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} ({w.price} บาท/{w.unit})
                </option>
              ))}
            </select>
          </div>

          {/* วันที่ */}
          <div className={styles.group}>
            <label>วันที่ขาย</label>
            <input
              type="date"
              value={new Date().toISOString().split("T")[0]}
              disabled
            />
            <input type="hidden" name="date" value={form.date} />
          </div>

          {/* น้ำหนัก */}
          <div className={styles.group}>
            <label>
              น้ำหนัก (กก.) <span style={{ color: "red" }}>*</span>
            </label>
            <input
              type="number"
              name="weight"
              value={form.weight}
              onChange={handleChange}
            />
          </div>

          {/* สถานะ */}
          <div className={styles.group}>
            <label>
              สถานะ <span style={{ color: "red" }}>*</span>
            </label>
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                type="button"
                onClick={() =>
                  setForm((prev) => ({ ...prev, status: "PENDING" }))
                }
                style={{
                  padding: "8px 16px",
                  backgroundColor:
                    form.status === "PENDING" ? "#4caf50" : "#e0e0e0",
                  color: form.status === "PENDING" ? "#fff" : "#000",
                  border: "none",
                  borderRadius: "15px",
                  cursor: "pointer",
                }}
              >
                Pending
              </button>
              <button
                type="button"
                onClick={() =>
                  setForm((prev) => ({ ...prev, status: "APPROVED" }))
                }
                style={{
                  padding: "8px 16px",
                  backgroundColor:
                    form.status === "APPROVED" ? "#4caf50" : "#e0e0e0",
                  color: form.status === "APPROVED" ? "#fff" : "#000",
                  border: "none",
                  borderRadius: "15px",
                  cursor: "pointer",
                }}
              >
                Approved
              </button>
            </div>
          </div>

          {/* ราคารวม */}
          <div className={styles.group}>
            <label>ราคารวม</label>
            <input type="number" value={form.total.toFixed(2)} disabled />
          </div>

          <button type="submit" className={styles.submitBtn}>
            บันทึกการรับซื้อ
          </button>
        </form>
      </div>

      {/* Modal */}
      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h2>บันทึกการรับซื้อเรียบร้อยแล้ว</h2>
            <p>ข้อมูลของสมาชิกถูกบันทึกเรียบร้อย</p>
            <div
              style={{
                display: "flex",
                gap: "10px",
                justifyContent: "center",
                marginTop: "20px",
              }}
            >
              <button
                onClick={() => setShowModal(false)}
                className={styles.modalBtn}
              >
                ตกลง
              </button>
              <button
                onClick={() => router.push("/employee/statusEmp")}
                className={styles.modalBtn1}
              >
                ไปหน้ายืนยันการรับซื้อ
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
