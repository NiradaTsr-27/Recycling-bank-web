"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AdminNavbar from "@/components/navbar/AdminNavbar";
import styles from "@/styles/pages/admin/adminEmployeeNew.module.css";

export default function AdminEmployeeNewPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});

  const [organizations, setOrganizations] = useState<
    { id: number; name: string }[]
  >([]);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    username: "",
    nationalId: "",
    email: "",
    password: "",

    houseNo: "",
    village: "",
    road: "",
    alley: "",

    subDistrict: "",
    district: "",
    province: "",
    postalCode: "",
    organizationId: "",
  });
  useEffect(() => {
    const fetchOrganizations = async () => {
      const res = await fetch("/api/admin/organizations");
      const data = await res.json();

      if (Array.isArray(data)) {
        setOrganizations(data);
      } else if (Array.isArray(data.data)) {
        setOrganizations(data.data);
      }
    };

    fetchOrganizations();
  }, []);

  const [provinces, setProvinces] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [subDistricts, setSubDistricts] = useState<any[]>([]);

  const [filteredDistricts, setFilteredDistricts] = useState<any[]>([]);
  const [filteredSubDistricts, setFilteredSubDistricts] = useState<any[]>([]);

  const [provinceSearch, setProvinceSearch] = useState("");
  const [showProvinceDropdown, setShowProvinceDropdown] = useState(false);

  const filteredProvinces = provinces.filter((p) =>
    p.provinceNameTh.includes(provinceSearch),
  );

  useEffect(() => {
    Promise.all([
      fetch("/JSON/provinces.json").then((res) => res.json()),
      fetch("/JSON/districts.json").then((res) => res.json()),
      fetch("/JSON/subdistricts.json").then((res) => res.json()),
    ]).then(([p, d, s]) => {
      setProvinces(p);
      setDistricts(d);
      setSubDistricts(s);
    });
  }, []);

  const handleProvinceChange = (value: string) => {
    const province = provinces.find((p) => p.provinceNameTh === value);

    const filtered = districts.filter(
      (d) => d.provinceCode === province?.provinceCode,
    );

    setFilteredDistricts(filtered);
    setFilteredSubDistricts([]);

    setForm({
      ...form,
      province: value,
      district: "",
      subDistrict: "",
      postalCode: "",
    });
  };

  const handleDistrictChange = (value: string) => {
    const district = districts.find((d) => d.districtNameTh === value);

    const filtered = subDistricts.filter(
      (s) => s.districtCode === district?.districtCode,
    );

    setFilteredSubDistricts(filtered);

    setForm({
      ...form,
      district: value,
      subDistrict: "",
      postalCode: "",
    });
  };

  const handleSubDistrictChange = (value: string) => {
    const tambon = subDistricts.find((s) => s.subdistrictNameTh === value);

    setForm({
      ...form,
      subDistrict: value,
      postalCode: tambon?.postalCode?.toString() || "",
    });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    //  reset cascade
    if (name === "province") {
      setForm({
        ...form,
        province: value,
        district: "",
        subDistrict: "",
        postalCode: "",
      });
      return;
    }

    if (name === "district") {
      setForm({
        ...form,
        district: value,
        subDistrict: "",
        postalCode: "",
      });
      return;
    }

    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch("/api/admin/employees", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        nationalId: form.nationalId,
        firstName: form.firstName,
        lastName: form.lastName,
        username: form.username,
        email: form.email,
        password: form.password,
        phone: form.phone,
        houseNo: form.houseNo,
        village: form.village,
        road: form.road,
        alley: form.alley,
        subDistrict: form.subDistrict,
        district: form.district,
        province: form.province,
        postalCode: form.postalCode,
        organizationId: form.organizationId
          ? Number(form.organizationId)
          : null,
      }),
    });

    const data = await res.json();

    if (res.ok) {
      router.push("/admin/employees");
    } else {
      if (data.field) {
        setErrors((prev: any) => ({
          ...prev,
          [data.field]: data.message,
        }));
        return;
      }

      alert(data.error || "เกิดข้อผิดพลาด");
    }
  };

  return (
    <>
      <AdminNavbar />

      <div className={styles.container}>
        <h1 className={styles.title}>เพิ่มพนักงาน</h1>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.grid}>
            <div className={styles.field}>
              <label>
                เลขบัตรประชาชน <span style={{ color: "red" }}>*</span>
              </label>
              <input
                name="nationalId"
                value={form.nationalId}
                onChange={(e) => {
                  setForm({
                    ...form,
                    nationalId: e.target.value.replace(/\D/g, ""),
                  });
                  setErrors({ ...errors, nationalId: "" });
                }}
                required
                pattern="[0-9]{13}"
                maxLength={13}
                inputMode="numeric"
              />

              {errors.nationalId && (
                <small style={{ color: "red" }}>{errors.nationalId}</small>
              )}
            </div>
            <br />
            <div className={styles.field}>
              <label>
                ชื่อ <span style={{ color: "red" }}>*</span>
              </label>
              <input
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                required
              />
            </div>
            <div className={styles.field}>
              <label>
                นามสกุล <span style={{ color: "red" }}>*</span>
              </label>
              <input
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                required
              />
            </div>
            <div className={styles.field}>
              <label>
                Username <span style={{ color: "red" }}>*</span>
              </label>
              <input
                name="username"
                value={form.username}
                onChange={handleChange}
                required
              />
            </div>
            <div className={styles.field}>
              <label>
                Email <span style={{ color: "red" }}>*</span>
              </label>
              <div style={{ display: "flex", alignItems: "center" }}>
                <input
                  name="email"
                  value={form.email}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      email: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className={styles.field}>
              <label>
                Password <span style={{ color: "red" }}>*</span>
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className={styles.field}>
              <label>
                เบอร์โทรศัพท์ <span style={{ color: "red" }}>*</span>
              </label>
              <input
                name="phone"
                type="tel"
                value={form.phone}
                onChange={(e) => {
                  setForm({
                    ...form,
                    phone: e.target.value.replace(/\D/g, ""),
                  });
                  setErrors({ ...errors, phone: "" });
                }}
                required
                pattern="[0-9]{10}"
                maxLength={10}
                inputMode="numeric"
              />

              {errors.phone && (
                <small style={{ color: "red" }}>{errors.phone}</small>
              )}
            </div>
            <div className={styles.field}>
              <label>บ้านเลขที่</label>
              <input
                name="houseNo"
                value={form.houseNo}
                onChange={handleChange}
              />
            </div>

            <div className={styles.field}>
              <label>หมู่</label>
              <input
                name="village"
                value={form.village}
                onChange={handleChange}
              />
            </div>

            <div className={styles.field}>
              <label>ซอย</label>
              <input name="alley" value={form.alley} onChange={handleChange} />
            </div>
            <div className={styles.field}>
              <label>ถนน</label>
              <input name="road" value={form.road} onChange={handleChange} />
            </div>

            <div className={styles.field} style={{ position: "relative" }}>
              <label>จังหวัด</label>

              <input
                value={provinceSearch}
                placeholder="พิมพ์ค้นหาจังหวัด"
                onChange={(e) => {
                  setProvinceSearch(e.target.value);
                  setShowProvinceDropdown(true);
                }}
                onFocus={() => setShowProvinceDropdown(true)}
              />

              {showProvinceDropdown && (
                <div
                  style={{
                    position: "absolute",
                    width: "100%",
                    maxHeight: "200px",
                    overflowY: "auto",
                    background: "#fff",
                    border: "1px solid #ccc",
                    zIndex: 10,
                    top: "100%",
                  }}
                >
                  {filteredProvinces.map((p) => (
                    <div
                      key={p.provinceCode}
                      style={{ padding: "8px", cursor: "pointer" }}
                      onClick={() => {
                        handleProvinceChange(p.provinceNameTh);
                        setProvinceSearch(p.provinceNameTh);
                        setShowProvinceDropdown(false);
                      }}
                    >
                      {p.provinceNameTh}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className={styles.field}>
              <label>อำเภอ</label>
              <select
                value={form.district}
                onChange={(e) => handleDistrictChange(e.target.value)}
                disabled={!form.province}
              >
                <option value="">เลือกอำเภอ</option>
                {filteredDistricts.map((d) => (
                  <option key={d.id} value={d.districtNameTh}>
                    {d.districtNameTh}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.field}>
              <label>ตำบล</label>
              <select
                value={form.subDistrict}
                onChange={(e) => handleSubDistrictChange(e.target.value)}
                disabled={!form.district}
              >
                <option value="">เลือกตำบล</option>
                {filteredSubDistricts.map((s) => (
                  <option key={s.id} value={s.subdistrictNameTh}>
                    {s.subdistrictNameTh}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.field}>
              <label>รหัสไปรษณีย์</label>
              <input value={form.postalCode} readOnly />
            </div>
            <div className={styles.field}>
              <label>
                หน่วยงาน <span style={{ color: "red" }}>*</span>
              </label>
              <select
                name="organizationId"
                value={form.organizationId}
                onChange={handleChange}
                required
              >
                <option value="">เลือกหน่วยงาน</option>
                {organizations.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.cancel}
              onClick={() => router.push("/admin/employees")}
            >
              ยกเลิก
            </button>

            <button type="submit" className={styles.submit} disabled={loading}>
              {loading ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
