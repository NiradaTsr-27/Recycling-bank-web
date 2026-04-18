"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "@/styles/pages/employees/publicUser.module.css";
import EmployeeNavbar from "@/components/navbar/EmployeeNavbar";

interface Waste {
  id: number;
  name: string;
  price: number;
}

export default function PublicSalePage() {
  const router = useRouter();
  const [totalPrice, setTotalPrice] = useState(0);
  const [wasteList, setWasteList] = useState<Waste[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [form, setForm] = useState({
    nationalId: "",
    firstName: "",
    lastName: "",
    wasteTypeId: "",
    quantity: "",
  });

  useEffect(() => {
    fetch("/api/publicUser/waste")
      .then((res) => res.json())
      .then(setWasteList);
  }, []);

  useEffect(() => {
    const selectedWaste = wasteList.find(
      (w) => w.id === Number(form.wasteTypeId),
    );

    if (selectedWaste && form.quantity) {
      setTotalPrice(selectedWaste.price * Number(form.quantity));
    } else {
      setTotalPrice(0);
    }
  }, [form.wasteTypeId, form.quantity, wasteList]);

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    const res = await fetch("/api/publicUser/public-sale", {
      method: "POST",
      body: JSON.stringify({
        ...form,
        quantity: Number(form.quantity),
        wasteTypeId: Number(form.wasteTypeId),
      }),
    });

    const data = await res.json();

    if (res.ok) {
      setModalMessage("บันทึกสำเร็จ");
      setShowModal(true);

      setForm({
        nationalId: "",
        firstName: "",
        lastName: "",
        wasteTypeId: "",
        quantity: "",
      });
    } else {
      setModalMessage(data.error || "เกิดข้อผิดพลาด");
      setShowModal(true);
    }
  };
  return (
    <>
      <EmployeeNavbar />
      <div className={styles.container}>
        <h1 className={styles.title}>รับซื้อขยะ (บุคคลทั่วไป)</h1>

        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            className={styles.input}
            name="nationalId"
            placeholder="เลขบัตรประชาชน"
            value={form.nationalId}
            onChange={handleChange}
            required
          />

          <input
            className={styles.input}
            name="firstName"
            placeholder="ชื่อ"
            value={form.firstName}
            onChange={handleChange}
            required
          />

          <input
            className={styles.input}
            name="lastName"
            placeholder="นามสกุล"
            value={form.lastName}
            onChange={handleChange}
            required
          />

          <select
            className={styles.select}
            name="wasteTypeId"
            value={form.wasteTypeId}
            onChange={handleChange}
            required
          >
            <option value="">-- เลือกขยะ --</option>
            {wasteList.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name} ({w.price} บาท)
              </option>
            ))}
          </select>

          <input
            className={styles.input}
            name="quantity"
            type="number"
            placeholder="จำนวน"
            value={form.quantity}
            onChange={handleChange}
            required
          />
          <div className={styles.totalBox}>
            ราคารวม:{" "}
            <span className={styles.totalPrice}>
              {totalPrice.toLocaleString()} บาท
            </span>
          </div>

          <div className={styles.buttonGroup}>
            <button type="submit" className={styles.submitBtn}>
              บันทึก
            </button>

            <button
              type="button"
              className={styles.historyBtn}
              onClick={() => router.push("/employee/publicUser/history")}
            >
              ดูประวัติ
            </button>
          </div>
          {showModal && (
            <div
              className={styles.modalOverlay}
              onClick={() => setShowModal(false)}
            >
              <div
                className={styles.modalBox}
                onClick={(e) => e.stopPropagation()}
              >
                <h2 className={styles.modalTitle}>แจ้งเตือน</h2>

                <p className={styles.modalText}>{modalMessage}</p>

                <button
                  className={styles.modalButton}
                  onClick={() => setShowModal(false)}
                >
                  ตกลง
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </>
  );
}
