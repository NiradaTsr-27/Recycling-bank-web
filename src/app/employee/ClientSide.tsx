"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaUsers, FaRecycle, FaMoneyBillWave, FaClock } from "react-icons/fa";
import EmployeeNavbar from "@/components/navbar/EmployeeNavbar";

/* ================= Types ================= */

type Stats = {
  totalMembers: number;
  todayTransactions: number;
  todayRevenue: number;
  pendingBuy: number;
};

type Category = {
  id: number;
  name: string;
};

type WasteItem = {
  id: number;
  name: string;
  price: number;
  categoryId: number | null;
  createdAt: string;
  source: "MEMBER" | "PUBLIC";
};

/* ================= Component ================= */

export default function EmployeeWastePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [stats, setStats] = useState<Stats>({
    totalMembers: 0,
    todayTransactions: 0,
    todayRevenue: 0,
    pendingBuy: 0,
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [wasteList, setWasteList] = useState<WasteItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | "all">(
    "all",
  );

  //////////////////////////////////////////////////////
  // AUTH
  //////////////////////////////////////////////////////

  useEffect(() => {
    if (status === "loading") return;

    if (!session) router.replace("/login");
    if (session?.user.role !== "EMPLOYEE") router.replace("/");
  }, [session, status, router]);

  //////////////////////////////////////////////////////
  // FETCH DASHBOARD API
  //////////////////////////////////////////////////////

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await fetch("/api/employee/dashboard");
        const data = await res.json();

        setStats(data.stats);
        setCategories(data.categories);
        setWasteList(data.wasteList);
      } catch (err) {
        console.error("โหลด dashboard ไม่สำเร็จ", err);
      }
    };

    fetchDashboard();
  }, []);

  if (status === "loading") return <div className="page-wrapper"><EmployeeNavbar/><div className="page-center text-secondary">Loading...</div></div>;

  //////////////////////////////////////////////////////
  // FILTER TODAY + CATEGORY
  //////////////////////////////////////////////////////

  const today = new Date();
  const isToday = (dateStr: string) => {
    const d = new Date(dateStr);
    return (
      d.getFullYear() === today.getFullYear() &&
      d.getMonth() === today.getMonth() &&
      d.getDate() === today.getDate()
    );
  };

  const filteredTodayWaste = wasteList.filter((item) =>
    isToday(item.createdAt),
  );

  const filteredWaste =
    selectedCategory === "all"
      ? filteredTodayWaste
      : filteredTodayWaste.filter(
          (item) => item.categoryId === selectedCategory,
        );

  const getCategoryName = (id: number | null) =>
    categories.find((c) => c.id === id)?.name || "-";

  //////////////////////////////////////////////////////
  // UI
  //////////////////////////////////////////////////////

  return (
    <div className="page-wrapper">
      <EmployeeNavbar />

      <main className="container py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-main mb-2">สวัสดี {session?.user.name}</h1>
          <p className="text-secondary">ภาพรวมการทำงานวันนี้</p>
        </div>

        {/* Summary Cards */}
        <div className="grid-4 mb-8">
          <div className="card glass flex items-center gap-4" style={{ margin: "0", padding: "24px" }}>
            <FaUsers className="text-primary text-3xl" />
            <div>
              <p className="text-secondary text-sm font-medium">สมาชิกทั้งหมด</p>
              <h2 className="text-2xl font-bold text-main">{stats.totalMembers.toLocaleString()}</h2>
            </div>
          </div>

          <div className="card glass flex items-center gap-4" style={{ margin: "0", padding: "24px" }}>
            <FaRecycle className="text-success text-3xl" />
            <div>
              <p className="text-secondary text-sm font-medium">จำนวนบิลวันนี้</p>
              <h2 className="text-2xl font-bold text-main">{stats.todayTransactions}</h2>
            </div>
          </div>

          <div className="card glass flex items-center gap-4" style={{ margin: "0", padding: "24px" }}>
            <FaMoneyBillWave className="text-warning text-3xl" />
            <div>
              <p className="text-secondary text-sm font-medium">ยอดจ่ายวันนี้</p>
              <h2 className="text-2xl font-bold text-main">{stats.todayRevenue.toLocaleString()} ฿</h2>
            </div>
          </div>

          <div className="card glass flex items-center gap-4" style={{ margin: "0", padding: "24px" }}>
            <FaClock className="text-info text-3xl" />
            <div>
              <p className="text-secondary text-sm font-medium">รออนุมัติ</p>
              <h2 className="text-2xl font-bold text-main">{stats.pendingBuy}</h2>
            </div>
          </div>
        </div>

        {/* Filter */}
        <div className="flex gap-2 mb-6" style={{ overflowX: "auto", paddingBottom: "8px" }}>
          <button
            className={`btn ${selectedCategory === "all" ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setSelectedCategory("all")}
          >
            ทุกประเภท
          </button>

          {categories.map((cat) => (
            <button
              key={cat.id}
              className={`btn ${selectedCategory === cat.id ? "btn-primary" : "btn-secondary"}`}
              onClick={() => setSelectedCategory(cat.id)}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Table View */}
        <div className="card glass" style={{ margin: "0", padding: "0", overflow: "hidden" }}>
          <div style={{ padding: "24px", borderBottom: "1px solid var(--border)" }}>
            <h3 className="text-xl font-bold text-main">รายการขยะวันนี้</h3>
          </div>
          <div style={{ maxHeight: "400px", overflowY: "auto" }}>
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>ชื่อขยะ</th>
                  <th>ประเภท</th>
                  <th>ราคา (บาท)</th>
                  <th>สถานะผู้ขาย</th>
                </tr>
              </thead>
              <tbody>
                {filteredWaste.length > 0 ? (
                  filteredWaste.map((item) => (
                    <tr key={item.id}>
                      <td>#{item.id}</td>
                      <td className="font-medium text-main">{item.name}</td>
                      <td>
                        <span className="badge" style={{ background: "var(--info-bg)", color: "var(--info)", padding: "4px 8px", borderRadius: "12px", fontSize: "12px", fontWeight: "600" }}>
                          {getCategoryName(item.categoryId)}
                        </span>
                      </td>
                      <td className="font-semibold text-success">{item.price} ฿</td>
                      <td>
                        <span
                          style={{
                            padding: "4px 10px",
                            borderRadius: "12px",
                            fontSize: "12px",
                            fontWeight: "600",
                            color: item.source === "MEMBER" ? "#065f46" : "#1e40af",
                            background: item.source === "MEMBER" ? "#d1fae5" : "#dbeafe",
                          }}
                        >
                          {item.source === "MEMBER" ? "สมาชิก Bank" : "บุคคลทั่วไป"}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="text-center text-secondary"
                      style={{ padding: "40px" }}
                    >
                      ยังไม่มีรายการรับซื้อในวันนี้
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
