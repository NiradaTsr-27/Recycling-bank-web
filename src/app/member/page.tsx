"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaWallet, FaRecycle, FaMoneyBillWave, FaChartLine } from "react-icons/fa";
import MemberNavbar from "@/components/navbar/MemberNavbar";
import styles from "@/styles/pages/admin/adminEmployees.module.css"; // Reuse table styles for consistency

/* ================= Types ================= */

type Stats = {
  balance: number;
  totalEarned: number;
  totalWeight: number;
  totalSales: number;
};

type RecentSale = {
  id: number;
  wasteName: string;
  quantity: number;
  unit: string;
  totalPrice: number;
  createdAt: string;
};

type Announcement = {
  id: number;
  title: string;
  content: string;
  createdAt: string;
};

type WastePrice = {
  id: number;
  name: string;
  price: number;
  unit: string;
  category: string;
};

/* ================= Component ================= */

export default function MemberDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [stats, setStats] = useState<Stats>({
    balance: 0,
    totalEarned: 0,
    totalWeight: 0,
    totalSales: 0,
  });

  const [recentSales, setRecentSales] = useState<RecentSale[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [wastePrices, setWastePrices] = useState<WastePrice[]>([]);
  const [loading, setLoading] = useState(true);

  //////////////////////////////////////////////////////
  // AUTH
  //////////////////////////////////////////////////////

  useEffect(() => {
    if (status === "loading") return;

    if (!session) router.replace("/login");
    if (session?.user.role !== "MEMBER") router.replace("/");
  }, [session, status, router]);

  //////////////////////////////////////////////////////
  // FETCH DASHBOARD API
  //////////////////////////////////////////////////////

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await fetch("/api/member/dashboard");
        const data = await res.json();
        
        if (res.ok) {
          setStats(data.stats);
          setRecentSales(data.recentSales);
          setAnnouncements(data.announcements);
          setWastePrices(data.wastePrices);
        }
      } catch (err) {
        console.error("โหลด dashboard ไม่สำเร็จ", err);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user?.role === "MEMBER") {
      fetchDashboard();
    }
  }, [session]);

  if (status === "loading" || loading) {
    return (
      <div className="page-wrapper">
        <MemberNavbar />
        <div className="page-center text-secondary">กำลังโหลดข้อมูล...</div>
      </div>
    );
  }

  //////////////////////////////////////////////////////
  // UI
  //////////////////////////////////////////////////////

  return (
    <div className="page-wrapper">
      <MemberNavbar />

      <main className="container py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-main mb-2">สวัสดีคุณ {session?.user.name}</h1>
          <p className="text-secondary">ยินดีต้อนรับสู่แดชบอร์ดสมาชิก แหล่งรวมข้อมูลการแยกขยะของคุณ</p>
        </div>

        {/* Summary Cards */}
        <div className="grid-4 mb-8">
          <div className="card glass flex items-center gap-4" style={{ margin: "0", padding: "24px" }}>
            <FaWallet className="text-success text-3xl" />
            <div>
              <p className="text-secondary text-sm font-medium">ยอดเงินคงเหลือ (ถอนได้)</p>
              <h2 className="text-2xl font-bold text-main">{stats.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ฿</h2>
            </div>
          </div>

          <div className="card glass flex items-center gap-4" style={{ margin: "0", padding: "24px" }}>
            <FaMoneyBillWave className="text-primary text-3xl" />
            <div>
              <p className="text-secondary text-sm font-medium">รายได้ทั้งหมดจากการขาย</p>
              <h2 className="text-2xl font-bold text-main">{stats.totalEarned.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ฿</h2>
            </div>
          </div>

          <div className="card glass flex items-center gap-4" style={{ margin: "0", padding: "24px" }}>
            <FaRecycle className="text-warning text-3xl" />
            <div>
              <p className="text-secondary text-sm font-medium">ปริมาณขยะที่ขายแล้ว</p>
              <h2 className="text-2xl font-bold text-main">{stats.totalWeight.toLocaleString()} <span className="text-lg font-normal text-secondary">กก. / ชิ้น</span></h2>
            </div>
          </div>

          <div className="card glass flex items-center gap-4" style={{ margin: "0", padding: "24px" }}>
            <FaChartLine className="text-info text-3xl" />
            <div>
              <p className="text-secondary text-sm font-medium">จำนวนครั้งที่ทำรายการ</p>
              <h2 className="text-2xl font-bold text-main">{stats.totalSales.toLocaleString()} <span className="text-lg font-normal text-secondary">ครั้ง</span></h2>
            </div>
          </div>
        </div>

        {/* Top Split Layout: History + Prices & Announcements */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 flex flex-col gap-8">
            {/* Recent Transactions Table */}
            <div className="card glass" style={{ margin: "0", padding: "0", overflow: "hidden" }}>
              <div style={{ padding: "24px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 className="text-xl font-bold text-main">ประวัติการขายล่าสุด (10 รายการ)</h3>
              </div>
              <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>รหัสการขาย</th>
                      <th>ชื่อขยะ</th>
                      <th>ปริมาณ</th>
                      <th>จำนวนเงินที่ได้</th>
                      <th>วันที่ขาย</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentSales.length > 0 ? (
                      recentSales.map((sale) => (
                        <tr key={sale.id}>
                          <td>#{sale.id}</td>
                          <td className="font-medium text-main">{sale.wasteName}</td>
                          <td className="font-semibold text-info">{sale.quantity} {sale.unit}</td>
                          <td className="font-semibold text-success">+{sale.totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })} ฿</td>
                          <td>{new Date(sale.createdAt).toLocaleDateString("th-TH")}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={5}
                          className="text-center text-secondary"
                          style={{ padding: "40px" }}
                        >
                          คุณยังไม่มีประวัติการขายขยะ
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-8">
            {/* Announcements Section */}
            <div className="card glass" style={{ margin: "0", padding: "24px" }}>
              <h3 className="text-lg font-bold text-main mb-4 flex items-center gap-2">
                📢 ข่าวสารล่าสุด
              </h3>
              {announcements.length > 0 ? (
                <div className="flex flex-col gap-4">
                  {announcements.map((news) => (
                    <div key={news.id} style={{ paddingBottom: "12px", borderBottom: "1px solid var(--border)" }}>
                      <p className="text-xs text-secondary">{new Date(news.createdAt).toLocaleDateString("th-TH")}</p>
                      <h4 className="font-semibold text-primary-dark mt-1">{news.title}</h4>
                      <p className="text-sm text-secondary line-clamp-2 mt-1">{news.content}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-secondary">ไม่มีข่าวสารในขณะนี้</p>
              )}
            </div>

            {/* Waste Prices Section */}
            <div className="card glass" style={{ margin: "0", padding: "24px" }}>
              <h3 className="text-lg font-bold text-main mb-4 flex items-center gap-2">
                📈 ราคารับซื้อสูงสุดวันนี้
              </h3>
              {wastePrices.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {wastePrices.map((waste) => (
                    <div key={waste.id} className="flex justify-between items-center" style={{ padding: "8px 12px", background: "rgba(255,255,255,0.5)", borderRadius: "10px", border: "1px solid rgba(0,0,0,0.03)" }}>
                      <div>
                        <p className="font-semibold text-main text-sm">{waste.name}</p>
                        <span className="text-xs text-secondary bg-gray-100 px-2 py-0.5 rounded-full">{waste.category}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-success">{waste.price} ฿</p>
                        <p className="text-xs text-secondary">ต่อ {waste.unit}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-secondary">ไม่มีข้อมูลราคา</p>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
