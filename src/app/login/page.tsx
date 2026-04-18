"use client";

import { signIn, getSession } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

import NavbarPublic from "@/components/navbar/NavbarPublic";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      username,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
      setLoading(false);
      return;
    }

    const session = await getSession();
    const role = session?.user?.role;

    if (role === "ADMIN") {
      router.replace("/admin");
    } else if (role === "EMPLOYEE") {
      router.replace("/employee");
    } else if (role === "MEMBER") {
      router.replace("/member");
    } else {
      router.replace("/");
    }

    setLoading(false);
  };

  return (
    <>
      <NavbarPublic />

      <div className="page-center">
        <div className="card glass grid-2" style={{ padding: 0, maxWidth: "1000px" }}>
          {/* LEFT : FORM */}
          <form onSubmit={handleLogin} className="flex-col justify-center" style={{ padding: "48px" }}>
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-primary mb-2">Welcome Back</h1>
              <p className="text-secondary text-sm">กรุณาเข้าสู่ระบบเพื่อดำเนินการต่อ</p>
            </div>

            {error && <p className="text-error text-sm text-center mb-4">{error}</p>}

            <div className="form-group">
              <label>Username</label>
              <input
                placeholder="กรอกชื่อผู้ใช้งาน..."
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="form-group mb-2">
              <label>Password</label>
              <input
                type="password"
                placeholder="กรอกรหัสผ่าน..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="text-right mb-6">
              <button
                type="button"
                onClick={() => router.push("/forgot-password")}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--primary)",
                  cursor: "pointer",
                  padding: 0,
                  fontSize: "14px",
                  fontWeight: 500
                }}
              >
                ลืมรหัสผ่าน?
              </button>
            </div>

            <button className="btn btn-primary w-full" disabled={loading} style={{ fontSize: "16px", padding: "14px" }}>
              {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
            </button>

            <div className="text-center mt-6">
              <p className="text-sm text-secondary">
                ยังไม่มีบัญชีใช่หรือไม่?{" "}
                <Link href="/register" className="text-primary font-semibold" style={{ textDecoration: "underline" }}>
                  สมัครสมาชิก
                </Link>
              </p>
            </div>
          </form>

          {/* RIGHT : IMAGE */}
          <div className="flex items-center justify-center" style={{ background: "var(--bg-glass)", padding: "48px" }}>
            <Image
              src="/hero/logo-1.png"
              alt="Recycle"
              width={360}
              height={360}
              priority
              style={{ filter: "drop-shadow(0 20px 30px rgba(16, 185, 129, 0.2))" }}
            />
          </div>
        </div>
      </div>
    </>
  );
}
