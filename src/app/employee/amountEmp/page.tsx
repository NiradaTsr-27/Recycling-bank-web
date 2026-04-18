"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import EmployeeNavbar from "@/components/navbar/EmployeeNavbar";
import styles from "@/styles/pages/employees/employeeBalance.module.css";
import { FaPlus, FaMinus, FaFileAlt, FaSearch } from "react-icons/fa";

type Member = {
  id: number;
  name: string;
  balance: number;
  totalSale: number;
};

export default function MemberBalancePage() {
  const router = useRouter();

  const [members, setMembers] = useState<Member[]>([]);
  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [amount, setAmount] = useState("");

  const [modalMessage, setModalMessage] = useState("");
  const [showAlertModal, setShowAlertModal] = useState(false);

  ////////////////////////////////////////////////////////
  // โหลดสมาชิกจาก API
  ////////////////////////////////////////////////////////

  const fetchMembers = async () => {
    const res = await fetch("/api/employee/wallet?type=members", {
      cache: "no-store",
    });

    const data = await res.json();

    console.log("UPDATED MEMBERS:", data); // 🔥 debug ดูเงิน

    setMembers(data);
  };

  useEffect(() => {
    fetchMembers();

    //  auto refresh ทุก 2 วิ
    const interval = setInterval(() => {
      fetchMembers();
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  ////////////////////////////////////////////////////////
  // ฝากเงิน
  ////////////////////////////////////////////////////////

  const handleDeposit = async () => {
    if (!selectedMember || !amount) return;

    const value = Number(amount);

    await fetch("/api/employee/wallet", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "deposit",
        memberId: selectedMember.id,
        amount: value,
      }),
    });

    await fetchMembers();

    setModalMessage("ฝากเงินเรียบร้อย");
    setShowAlertModal(true);

    setShowDeposit(false);
    setAmount("");
  };

  ////////////////////////////////////////////////////////
  // ขอถอนเงิน
  ////////////////////////////////////////////////////////

  const handleWithdraw = async () => {
    if (!selectedMember || !amount) return;

    const value = Number(amount);

    if (value > selectedMember.balance) {
      setModalMessage("ยอดเงินไม่เพียงพอ");
      setShowAlertModal(true);
      return;
    }

    await fetch("/api/employee/wallet", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "withdrawRequest",
        memberId: selectedMember.id,
        amount: value,
      }),
    });

    setModalMessage("ส่งคำขอถอนเงินเรียบร้อย");
    setShowAlertModal(true);

    setShowWithdraw(false);
    setAmount("");
  };

  return (
    <>
      <EmployeeNavbar />
      <div className={styles.container}>
        <h1 className={styles.title}>ยอดสะสมสมาชิก</h1>

        <div className={styles.table}>
          <div className={styles.tableHeader}>
            <div>ชื่อสมาชิก</div>
            <div>ยอดคงเหลือ</div>
            <div></div>
          </div>
          <div style={{ maxHeight: "450px", overflowY: "auto" }}>
            {members.map((member) => (
              <div key={member.id} className={styles.row}>
                <div className={styles.name}>{member.name}</div>

                <div className={styles.balance}>
                  {Number(member.balance).toFixed(2)} บาท
                </div>

                <div className={styles.actions}>
                  <button
                    className={styles.depositBtn}
                    onClick={() => {
                      setSelectedMember(member);
                      setShowDeposit(true);
                    }}
                  >
                    <FaPlus /> ฝากเงิน
                  </button>

                  <button
                    className={styles.withdrawBtn}
                    onClick={() => {
                      setSelectedMember(member);
                      setShowWithdraw(true);
                    }}
                  >
                    <FaMinus /> ถอนเงิน
                  </button>

                  <button
                    className={styles.historyBtn}
                    onClick={() =>
                      router.push(`/employee/amountEmp/history/${member.id}`)
                    }
                  >
                    <FaFileAlt /> ประวัติ
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          className={styles.checkWithdrawBtn}
          onClick={() => router.push("/employee/amountEmp/withdraw-requests")}
        >
          <FaSearch /> ตรวจสอบคำขอถอนเงิน
        </button>
      </div>

      {/* Deposit Modal */}
      {showDeposit && selectedMember && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowDeposit(false)}
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2>ฝากเงิน</h2>
            <p>สมาชิก: {selectedMember.name}</p>

            <input
              type="number"
              placeholder="จำนวนเงิน"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={styles.input}
            />

            <div className={styles.modalButtons}>
              <button className={styles.confirmBtn} onClick={handleDeposit}>
                ยืนยัน
              </button>

              <button
                className={styles.backBtn}
                onClick={() => setShowDeposit(false)}
              >
                กลับ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Withdraw Modal */}
      {showWithdraw && selectedMember && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowWithdraw(false)}
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2>ขอถอนเงิน</h2>
            <p>สมาชิก: {selectedMember.name}</p>
            <p>ยอดคงเหลือ: {selectedMember.balance} บาท</p>

            <input
              type="number"
              placeholder="จำนวนเงิน"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={styles.input}
            />

            <div className={styles.modalButtons}>
              <button className={styles.confirmBtn} onClick={handleWithdraw}>
                ส่งคำขอ
              </button>

              <button
                className={styles.backBtn}
                onClick={() => setShowWithdraw(false)}
              >
                กลับ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Alert Modal */}
      {showAlertModal && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowAlertModal(false)}
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2>แจ้งเตือน</h2>

            <p style={{ margin: "15px 0" }}>{modalMessage}</p>

            <div className={styles.modalButtons}>
              <button
                className={styles.confirmBtn}
                onClick={() => setShowAlertModal(false)}
              >
                ตกลง
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
