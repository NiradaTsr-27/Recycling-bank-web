"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import NavbarPublic from "@/components/navbar/NavbarPublic";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    nationalId: "",
    firstName: "",
    lastName: "",
    phone: "",
  });

  const [errors, setErrors] = useState<any>({});
  const [mainError, setMainError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setMainError("");

    // Basic Validation
    if (form.password !== form.confirmPassword) {
      setErrors({ confirmPassword: "รหัสผ่านไม่ตรงกัน" });
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.field) {
          setErrors({ [data.field]: data.message });
        } else {
          setMainError(data.error || "เกิดข้อผิดพลาดในการสมัครสมาชิก");
        }
      } else {
        // Success
        alert("สมัครสมาชิกสำเร็จ! กรุณาเข้าสู่ระบบ");
        router.push("/login");
      }
    } catch (error) {
      setMainError("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <NavbarPublic />

      <div className="page-wrapper flex justify-center items-center" style={{ minHeight: "90vh", padding: "40px 24px" }}>
        <div className="card glass grid-2" style={{ padding: 0, maxWidth: "1100px", width: "100%" }}>
          
          {/* LEFT : IMAGE */}
          <div className="flex-col items-center justify-center desktop-only" style={{ background: "var(--bg-glass)", padding: "48px" }}>
            <Image
              src="/images/recy1.png"
              alt="Join Us"
              width={400}
              height={400}
              priority
              style={{ filter: "drop-shadow(0 20px 30px rgba(16, 185, 129, 0.2))", borderRadius: "16px", objectFit: "cover" }}
            />
            <h2 className="text-2xl font-bold text-primary mt-8">ร่วมเป็นส่วนหนึ่งกับเรา</h2>
            <p className="text-secondary text-center mt-2">
              แปลงขยะให้เป็นรายได้ ช่วยเหลือชุมชนและรักษาสิ่งแวดล้อมอย่างยั่งยืน
            </p>
          </div>

          {/* RIGHT : FORM */}
          <form onSubmit={handleSubmit} className="flex-col justify-center" style={{ padding: "40px 48px" }}>
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold text-primary mb-2">สมัครสมาชิก</h1>
              <p className="text-secondary text-sm">กรอกข้อมูลด้านล่างเพื่อสร้างบัญชีผู้ใช้ใหม่</p>
            </div>

            {mainError && <p className="text-error text-sm text-center mb-4 p-2" style={{background: "var(--error-bg)", borderRadius: "8px"}}>{mainError}</p>}

            <div className="grid-2" style={{ gap: "16px" }}>
              <div className="form-group mb-0">
                <label>ชื่อ <span className="text-error">*</span></label>
                <input
                  placeholder="ชื่อจริง..."
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  required
                />
              </div>
              <div className="form-group mb-0">
                <label>นามสกุล <span className="text-error">*</span></label>
                <input
                  placeholder="นามสกุล..."
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-group mt-4">
              <label>เลขบัตรประจำตัวประชาชน (13 หลัก) <span className="text-error">*</span></label>
              <input
                placeholder="เลขบัตรประชาชน..."
                value={form.nationalId}
                onChange={(e) => {
                  setForm({ ...form, nationalId: e.target.value.replace(/\D/g, "") });
                  if (errors.nationalId) setErrors({ ...errors, nationalId: "" });
                }}
                maxLength={13}
                required
              />
              {errors.nationalId && <small className="text-error mt-1 block">{errors.nationalId}</small>}
            </div>

            <div className="grid-2" style={{ gap: "16px", marginTop: "16px" }}>
              <div className="form-group mb-0">
                <label>เบอร์โทรศัพท์</label>
                <input
                  placeholder="เบอร์โทรติดต่อ..."
                  value={form.phone}
                  onChange={(e) => {
                    setForm({ ...form, phone: e.target.value.replace(/\D/g, "") });
                    if (errors.phone) setErrors({ ...errors, phone: "" });
                  }}
                  maxLength={10}
                />
                {errors.phone && <small className="text-error mt-1 block">{errors.phone}</small>}
              </div>

              <div className="form-group mb-0">
                <label>อีเมล <span className="text-error">*</span></label>
                <input
                  type="email"
                  placeholder="Email..."
                  value={form.email}
                  onChange={(e) => {
                    setForm({ ...form, email: e.target.value });
                    if (errors.email) setErrors({ ...errors, email: "" });
                  }}
                  required
                />
                {errors.email && <small className="text-error mt-1 block">{errors.email}</small>}
              </div>
            </div>

            <hr style={{ border: "none", borderTop: "1px dashed var(--border)", margin: "24px 0" }} />

            <div className="form-group">
              <label>ชื่อผู้ใช้งาน (Username) <span className="text-error">*</span></label>
              <input
                placeholder="สำหรับใช้เข้าสู่ระบบ..."
                value={form.username}
                onChange={(e) => {
                  setForm({ ...form, username: e.target.value });
                  if (errors.username) setErrors({ ...errors, username: "" });
                }}
                required
              />
              {errors.username && <small className="text-error mt-1 block">{errors.username}</small>}
            </div>

            <div className="grid-2" style={{ gap: "16px", marginTop: "16px" }}>
              <div className="form-group mb-4">
                <label>รหัสผ่าน <span className="text-error">*</span></label>
                <input
                  type="password"
                  placeholder="ตั้งรหัสผ่าน..."
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                />
              </div>

              <div className="form-group mb-4">
                <label>ยืนยันรหัสผ่าน <span className="text-error">*</span></label>
                <input
                  type="password"
                  placeholder="กรอกรหัสผ่านอีกครั้ง..."
                  value={form.confirmPassword}
                  onChange={(e) => {
                    setForm({ ...form, confirmPassword: e.target.value });
                    if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: "" });
                  }}
                  required
                />
                {errors.confirmPassword && <small className="text-error mt-1 block">{errors.confirmPassword}</small>}
              </div>
            </div>

            <button className="btn btn-primary w-full mt-2" disabled={loading} style={{ fontSize: "16px", padding: "14px" }}>
              {loading ? "กำลังบันทึกข้อมูล..." : "ลงทะเบียนสมัครสมาชิก"}
            </button>

            <div className="text-center mt-6">
              <p className="text-sm text-secondary">
                มีบัญชีอยู่แล้วใช่หรือไม่?{" "}
                <Link href="/login" className="text-primary font-semibold" style={{ textDecoration: "underline" }}>
                  เข้าสู่ระบบที่นี่
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
