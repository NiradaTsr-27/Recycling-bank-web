"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import styles from "@/styles/pages/employees/employeeSettings.module.css";
import MemberNavbar from "@/components/navbar/MemberNavbar";

export default function MemberProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [showModal, setShowModal] = useState(false);
  const [member, setMember] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    houseNo: "",
    village: "",
    alley: "",
    road: "",
    subDistrict: "",
    district: "",
    province: "",
    postalCode: "",
  });

  const [password, setPassword] = useState({
    oldPassword: "",
    newPassword: "",
  });

  // Load member info
  useEffect(() => {
    if (status === "loading") return;
    if (!session) router.replace("/login");
    if (session?.user.role !== "MEMBER") router.replace("/");
  }, [session, status, router]);

  useEffect(() => {
    const fetchMember = async () => {
      try {
        const res = await fetch("/api/member/me");
        if (!res.ok) throw new Error("โหลดข้อมูลไม่สำเร็จ");
        const data = await res.json();

        setMember(data);
        setProfile({
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          phone: data.phone || "",
          houseNo: data.houseNo || "",
          village: data.village || "",
          alley: data.alley || "",
          road: data.road || "",
          subDistrict: data.subDistrict || "",
          district: data.district || "",
          province: data.province || "",
          postalCode: data.postalCode || "",
        });
      } catch (error) {
        console.error(error);
      }
    };

    if (session?.user?.role === "MEMBER") {
      fetchMember();
    }
  }, [session]);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value,
    });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword({
      ...password,
      [e.target.name]: e.target.value,
    });
  };

  const handleProfileSave = async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/member/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profile),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message);
        return;
      }

      alert("บันทึกข้อมูลสำเร็จ");
    } catch (error) {
      alert("เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/member/change-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(password),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message);
        return;
      }

      alert("เปลี่ยนรหัสผ่านสำเร็จ");

      setPassword({
        oldPassword: "",
        newPassword: "",
      });

      setShowModal(false);
    } catch (error) {
      alert("เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  };

  if (!member) return <><MemberNavbar /><div className="page-center">กำลังโหลด...</div></>;

  return (
    <div className="page-wrapper">
      <MemberNavbar />

      <main className="container py-8 flex flex-col items-center">
        <div style={{ width: "100%", maxWidth: "800px" }}>
          <h1 className="text-3xl font-bold text-main mb-6">ตั้งค่าโปรไฟล์สมาชิก</h1>

          <div className="card glass" style={{ padding: "32px", display: "flex", flexDirection: "column", gap: "20px" }}>
            
            <h3 className="text-xl font-semibold text-primary pb-2" style={{ borderBottom: "1px solid var(--border)", marginBottom: "10px" }}>ข้อมูลบัญชี</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={styles.formGroup}>
                <label>ชื่อผู้ใช้งาน (Username)</label>
                <input type="text" value={member.username} disabled className={styles.disabledInput} />
              </div>
              <div className={styles.formGroup}>
                <label>อีเมล</label>
                <input type="email" value={member.email} disabled className={styles.disabledInput} />
              </div>
              <div className={styles.formGroup}>
                <label>รหัสผ่าน</label>
                <div className={styles.passwordRow}>
                  <input type="password" value="********" disabled className={styles.disabledInput} />
                  <button className={styles.changeBtn} onClick={() => setShowModal(true)}>เปลี่ยนรหัสผ่าน</button>
                </div>
              </div>
            </div>

            <h3 className="text-xl font-semibold text-primary pb-2 mt-4" style={{ borderBottom: "1px solid var(--border)", marginBottom: "10px" }}>ข้อมูลส่วนตัว</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={styles.formGroup}>
                <label>ชื่อ</label>
                <input type="text" name="firstName" value={profile.firstName} onChange={handleProfileChange} className={styles.input} />
              </div>
              <div className={styles.formGroup}>
                <label>นามสกุล</label>
                <input type="text" name="lastName" value={profile.lastName} onChange={handleProfileChange} className={styles.input} />
              </div>
              <div className={styles.formGroup}>
                <label>เบอร์โทรศัพท์</label>
                <input type="text" name="phone" value={profile.phone} onChange={handleProfileChange} className={styles.input} />
              </div>
              <div className={styles.formGroup}>
                <label>รหัสบัตรประชาชน</label>
                <input type="text" value={member.nationalId} disabled className={styles.disabledInput} />
              </div>
            </div>

            <h3 className="text-xl font-semibold text-primary pb-2 mt-4" style={{ borderBottom: "1px solid var(--border)", marginBottom: "10px" }}>ที่อยู่</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={styles.formGroup}>
                <label>บ้านเลขที่</label>
                <input type="text" name="houseNo" value={profile.houseNo} onChange={handleProfileChange} className={styles.input} />
              </div>
              <div className={styles.formGroup}>
                <label>หมู่</label>
                <input type="text" name="village" value={profile.village} onChange={handleProfileChange} className={styles.input} />
              </div>
              <div className={styles.formGroup}>
                <label>ซอย</label>
                <input type="text" name="alley" value={profile.alley} onChange={handleProfileChange} className={styles.input} />
              </div>
              <div className={styles.formGroup}>
                <label>ถนน</label>
                <input type="text" name="road" value={profile.road} onChange={handleProfileChange} className={styles.input} />
              </div>
              <div className={styles.formGroup}>
                <label>ตำบล</label>
                <input type="text" name="subDistrict" value={profile.subDistrict} onChange={handleProfileChange} className={styles.input} />
              </div>
              <div className={styles.formGroup}>
                <label>อำเภอ</label>
                <input type="text" name="district" value={profile.district} onChange={handleProfileChange} className={styles.input} />
              </div>
              <div className={styles.formGroup}>
                <label>จังหวัด</label>
                <input type="text" name="province" value={profile.province} onChange={handleProfileChange} className={styles.input} />
              </div>
              <div className={styles.formGroup}>
                <label>รหัสไปรษณีย์</label>
                <input type="text" name="postalCode" value={profile.postalCode} onChange={handleProfileChange} className={styles.input} />
              </div>
            </div>

            <div className="flex justify-end mt-4">
              <button
                className="btn btn-primary"
                style={{ padding: "12px 36px", fontSize: "16px", borderRadius: "12px" }}
                onClick={handleProfileSave}
                disabled={loading}
              >
                {loading ? "กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลง"}
              </button>
            </div>
          </div>
        </div>
      </main>

      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalBox}>
            <h3>เปลี่ยนรหัสผ่าน</h3>

            <div className={styles.formGroup}>
              <label>รหัสผ่านเดิม</label>
              <input
                type="password"
                name="oldPassword"
                value={password.oldPassword}
                onChange={handlePasswordChange}
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label>รหัสผ่านใหม่</label>
              <input
                type="password"
                name="newPassword"
                value={password.newPassword}
                onChange={handlePasswordChange}
                className={styles.input}
              />
            </div>

            <div className={styles.modalActions}>
              <button
                className={styles.cancelBtn}
                onClick={() => setShowModal(false)}
              >
                ยกเลิก
              </button>

              <button
                className={styles.confirmBtn}
                onClick={handleChangePassword}
                disabled={loading}
              >
                {loading ? "กำลังเปลี่ยน..." : "เปลี่ยนรหัสผ่าน"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
