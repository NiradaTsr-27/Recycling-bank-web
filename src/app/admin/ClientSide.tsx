"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AdminNavbar from "@/components/navbar/AdminNavbar";

// Chart.js
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

type Activity = {
  type: "member" | "sale";
  text: string;
};

type TopMember = { name: string; purchases: number };
type TopSale = { item: string; amount: number };

type DashboardData = {
  totalMembers: number;
  totalEmployees: number;
  totalWasteTypes: number;
  todayRevenue: number;
  activities: Activity[];
  monthlyRevenue: number[]; // 12 เดือน
  notifications: string[];
  topMembers?: TopMember[];
  topSales?: TopSale[];
};

export default function AdminDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null,
  );
  const [loadingDashboard, setLoadingDashboard] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "loading") return;
    if (!session) router.replace("/login");
    else if (session.user.role !== "ADMIN") router.replace("/");
  }, [session, status, router]);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoadingDashboard(true);
        const res = await fetch("/api/admin/dashboard", { cache: "no-store" });
        const data = await res.json();
        if (!res.ok)
          throw new Error(
            data.message || data.error || "Failed to fetch dashboard",
          );

        // default values
        data.monthlyRevenue =
          data.monthlyRevenue?.length === 12
            ? data.monthlyRevenue
            : Array(12).fill(0);
        data.notifications = data.notifications || [];
        data.topMembers = data.topMembers || [];
        data.topSales = data.topSales || [];

        setDashboardData(data);
      } catch (err: any) {
        console.error("Dashboard fetch error:", err);
        setError(err.message);
      } finally {
        setLoadingDashboard(false);
      }
    };
    if (session?.user?.role === "ADMIN") fetchDashboard();
  }, [session]);

  if (status === "loading" || loadingDashboard) {
    return (
      <div className="page-wrapper">
        <AdminNavbar />
        <main className="container text-center mt-8">
          <h1 className="text-2xl font-bold mb-4">Dashboard ผู้ดูแลระบบ</h1>
          <p className="text-secondary">กำลังโหลดข้อมูล...</p>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-wrapper">
        <AdminNavbar />
        <main className="container text-center mt-8">
          <h1 className="text-2xl font-bold mb-4">Dashboard ผู้ดูแลระบบ</h1>
          <p className="text-error font-medium">เกิดข้อผิดพลาด: {error}</p>
        </main>
      </div>
    );
  }

  const data = dashboardData!;

  const chartData = {
    labels: [
      "ม.ค.",
      "ก.พ.",
      "มี.ค.",
      "เม.ย.",
      "พ.ค.",
      "มิ.ย.",
      "ก.ค.",
      "ส.ค.",
      "ก.ย.",
      "ต.ค.",
      "พ.ย.",
      "ธ.ค.",
    ],
    datasets: [
      {
        label: "รายได้รวมต่อเดือน (บาท)",
        data: data.monthlyRevenue,
        fill: true,
        backgroundColor: "rgba(16, 185, 129, 0.2)", // Emerald matching theme
        borderColor: "rgba(16, 185, 129, 1)",
        borderWidth: 3,
        pointRadius: 6,
        pointHoverRadius: 8,
        tension: 0.4,
      },
    ],
  };

  const chartOptions: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: {
        position: "top",
        labels: { font: { size: 14, family: "inherit" }, color: "var(--text-main)" },
      },
      title: {
        display: false,
      },
      tooltip: {
        backgroundColor: "rgba(15, 23, 42, 0.9)", // Slate 900
        titleColor: "#fff",
        bodyColor: "#fff",
        titleFont: { family: "inherit", size: 14 },
        bodyFont: { family: "inherit", size: 13 },
        cornerRadius: 8,
        padding: 12,
      },
    },
    animation: { duration: 1000, easing: "easeOutQuart" },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: "var(--text-secondary)",
          font: { size: 13, family: "inherit" },
          callback: (v: any) => v.toLocaleString() + " ฿",
        },
        grid: { color: "var(--border)" },
      },
      x: {
        ticks: { color: "var(--text-secondary)", font: { size: 13, family: "inherit" } },
        grid: { display: false },
      },
    },
  };

  return (
    <div className="page-wrapper">
      <AdminNavbar />
      <main className="container py-8">
        {/* Summary Cards */}
        <section className="grid-4 mb-8">
          <div className="card glass text-center" style={{ margin: "0", padding: "24px" }}>
            <p className="text-secondary font-medium mb-2">สมาชิกทั้งหมด</p>
            <span className="text-3xl font-bold text-success">{data.totalMembers}</span>
          </div>
          <div className="card glass text-center" style={{ margin: "0", padding: "24px" }}>
            <p className="text-secondary font-medium mb-2">พนักงาน</p>
            <span className="text-3xl font-bold text-primary">{data.totalEmployees}</span>
          </div>
          <div className="card glass text-center" style={{ margin: "0", padding: "24px" }}>
            <p className="text-secondary font-medium mb-2">รายการขยะ</p>
            <span className="text-3xl font-bold text-info">{data.totalWasteTypes}</span>
          </div>
          <div className="card glass text-center" style={{ margin: "0", padding: "24px" }}>
            <p className="text-secondary font-medium mb-2">ยอดรับซื้อวันนี้</p>
            <span className="text-3xl font-bold text-warning">
              {data.todayRevenue.toLocaleString()} ฿
            </span>
          </div>
        </section>

        {/* Activities + Top Members/Sales */}
        <section className="grid-sidebar mb-8">
          {/* Recent Activities */}
          <div className="card glass" style={{ margin: "0" }}>
            <h2 className="text-xl font-bold text-main mb-4">กิจกรรมล่าสุด</h2>
            <ul className="flex-col gap-4 text-secondary text-sm">
              {data.activities.length ? (
                data.activities.map((act, i) => (
                  <li key={i} className="flex gap-2 items-center" style={{ padding: "8px 12px", background: "var(--bg-main)", borderRadius: "8px" }}>
                    <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: act.type === 'sale' ? "var(--info)" : "var(--primary)" }}></div>
                    {act.text}
                  </li>
                ))
              ) : (
                <li className="text-center p-4">ไม่มีกิจกรรมล่าสุด</li>
              )}
            </ul>
          </div>

          {/* Top Members / Sales */}
          <div className="card glass" style={{ margin: "0" }}>
            <h2 className="text-xl font-bold text-main mb-4">Top Members / Sales</h2>

            <h3 className="text-main font-semibold mb-2">สมาชิกยอดเยี่ยม</h3>
            <ul className="flex-col gap-2 text-secondary text-sm mb-4">
              {data.topMembers && data.topMembers.length > 0 ? (
                data.topMembers.slice(0, 5).map((m, i) => (
                  <li key={i} className="flex justify-between items-center" style={{ padding: "6px 0", borderBottom: "1px dashed var(--border)" }}>
                    <span className="font-medium text-main">{m.name}</span>
                    <span className="text-success">{m.purchases.toLocaleString()} ฿</span>
                  </li>
                ))
              ) : (
                <li>ยังไม่มีข้อมูลสมาชิก</li>
              )}
            </ul>
            
            <h3 className="text-main font-semibold mb-2 pt-2">รายการขยะยอดนิยม</h3>
            <ul className="flex-col gap-2 text-secondary text-sm">
              {data.topSales && data.topSales.length > 0 ? (
                data.topSales.slice(0, 5).map((s, i) => (
                  <li key={i} className="flex justify-between items-center" style={{ padding: "6px 0", borderBottom: "1px dashed var(--border)" }}>
                    <span className="font-medium text-main">{s.item}</span>
                    <span className="text-info">{s.amount.toLocaleString()} ฿</span>
                  </li>
                ))
              ) : (
                <li>ยังไม่มีรายการขาย</li>
              )}
            </ul>
          </div>
        </section>

        {/* Chart */}
        <section className="card glass" style={{ margin: "0", height: "400px" }}>
           <h2 className="text-xl font-bold text-main mb-6">สถิติรายได้รายเดือน</h2>
           <div style={{ height: "calc(100% - 40px)", position: "relative" }}>
             <Line data={chartData} options={chartOptions} />
           </div>
        </section>
      </main>
    </div>
  );
}
