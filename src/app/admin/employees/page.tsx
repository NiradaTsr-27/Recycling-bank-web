"use client";

import { useEffect, useState } from "react";
import AdminNavbar from "@/components/navbar/AdminNavbar";
import styles from "@/styles/pages/admin/adminEmployees.module.css";
import Link from "next/link";
import { FaEdit, FaTrash, FaUserPlus } from "react-icons/fa";

interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  phone?: string;
  nationalId: string;

  houseNo?: string;
  village?: string;
  road?: string;
  alley?: string;

  subDistrict?: string;
  district?: string;
  province?: string;
  postalCode?: string;

  organizationId?: number;

  createdAt: string;
  updatedAt: string;

  account: {
    email: string;
    username: string;
  };

  organization?: {
    id: number;
    name: string;
  };
}

export default function AdminEmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null,
  );
  const [editLoading, setEditLoading] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(
    null,
  );
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [organizations, setOrganizations] = useState<
    { id: number; name: string }[]
  >([]);

  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    phone: "",
    nationalId: "",
    houseNo: "",
    village: "",
    road: "",
    alley: "",
    subDistrict: "",
    district: "",
    province: "",
    postalCode: "",
    organizationId: "",
    password: "",
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowEditModal(false);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  const [provinces, setProvinces] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [subDistricts, setSubDistricts] = useState<any[]>([]);

  const [filteredDistricts, setFilteredDistricts] = useState<any[]>([]);
  const [filteredSubDistricts, setFilteredSubDistricts] = useState<any[]>([]);

  // search
  const [provinceSearch, setProvinceSearch] = useState("");
  const [showProvinceDropdown, setShowProvinceDropdown] = useState(false);

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

    setEditForm({
      ...editForm,
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

    setEditForm({
      ...editForm,
      district: value,
      subDistrict: "",
      postalCode: "",
    });
  };

  const handleSubDistrictChange = (value: string) => {
    const tambon = subDistricts.find((s) => s.subdistrictNameTh === value);

    setEditForm({
      ...editForm,
      subDistrict: value,
      postalCode: tambon?.postalCode?.toString() || "",
    });
  };

  const fetchEmployees = async () => {
    try {
      const res = await fetch("/api/admin/employees");
      const data = await res.json();
      setEmployees(data);
    } catch (error) {
      console.error("โหลดพนักงานล้มเหลว", error);
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!employeeToDelete) return;

    try {
      setDeleteLoading(true);

      await fetch(`/api/admin/employees/${employeeToDelete.id}`, {
        method: "DELETE",
      });

      setShowDeleteModal(false);
      setEmployeeToDelete(null);
      fetchEmployees();
    } catch (err) {
      console.error("ลบไม่สำเร็จ", err);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleOpenEdit = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/employees/${id}`);
      const data = await res.json();

      setSelectedEmployee(data);

      setEditForm({
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        username: data.account?.username || "",
        email: data.account?.email || "",
        phone: data.phone || "",
        nationalId: data.nationalId || "",
        houseNo: data.houseNo || "",
        village: data.village || "",
        alley: data.alley || "",
        road: data.road || "",
        subDistrict: data.subDistrict || "",
        district: data.district || "",
        province: data.province || "",
        postalCode: data.postalCode || "",
        organizationId: data.organizationId?.toString() || "",
        password: "",
      });

      // โหลดหน่วยงานทั้งหมด
      const orgRes = await fetch("/api/admin/organizations");
      const orgData = await orgRes.json();

      console.log(orgData); // ดูก่อนว่า API ส่งอะไรมา

      if (Array.isArray(orgData)) {
        setOrganizations(orgData);
      } else if (Array.isArray(orgData.data)) {
        setOrganizations(orgData.data);
      } else if (Array.isArray(orgData.organizations)) {
        setOrganizations(orgData.organizations);
      } else {
        setOrganizations([]);
      }

      setShowEditModal(true);
    } catch (err) {
      console.error("โหลดข้อมูลล้มเหลว", err);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee) return;

    try {
      setEditLoading(true);

      const res = await fetch(`/api/admin/employees/${selectedEmployee.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...editForm,
          organizationId: editForm.organizationId
            ? Number(editForm.organizationId)
            : null,
        }),
      });

      const data = await res.json();

      // เช็ค error ก่อน
      if (!res.ok) {
        if (data.field) {
          setEditErrors((prev: any) => ({
            ...prev,
            [data.field]: data.message,
          }));
          return;
        }

        alert(data.error || "อัปเดตไม่สำเร็จ");
        return;
      }

      // สำเร็จจริงค่อยปิด modal
      setShowEditModal(false);
      await fetchEmployees();
    } catch (err) {
      console.error("อัปเดตล้มเหลว", err);
      alert("เกิดข้อผิดพลาด");
    } finally {
      setEditLoading(false);
    }
  };
  const [editErrors, setEditErrors] = useState<any>({});

  return (
    <>
      <AdminNavbar />

      <div className={styles.container}>
        <div className={styles.title}>
          <h1>จัดการพนักงาน</h1>
          <Link href="/admin/employees/newEmp">
            <button className={styles.addIconBtn}>
              <FaUserPlus />
            </button>
          </Link>
        </div>

        <div className={styles.card}>
          {loading ? (
            <p>กำลังโหลด...</p>
          ) : (
            <div style={{ maxHeight: "550px", overflowY: "auto" }}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>เลขบัตรประชาชน</th>
                    <th>ชื่อ - นามสกุล</th>
                    <th>Username</th>
                    <th>Email</th>
                    <th>ที่อยู่</th>
                    <th>เบอร์ติดต่อ</th>
                    <th>หน่วยงาน</th>
                    <th>วันที่เริ่มงาน</th>
                    <th>อัปเดต</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {employees
                    .slice()
                    .sort((a, b) => a.id - b.id)
                    .map((emp) => (
                      <tr key={emp.id}>
                        <td>{emp.id}</td>
                        <td>{emp.nationalId}</td>
                        <td>
                          {emp.firstName} {emp.lastName}
                        </td>
                        <td>{emp.account?.username}</td>
                        <td>{emp.account?.email}</td>
                        <td>
                          {[
                            emp.houseNo,
                            emp.village && `หมู่ ${emp.village}`,
                            emp.alley && `ซ.${emp.alley}`,
                            emp.road && `ถ.${emp.road}`,

                            emp.subDistrict && `ต.${emp.subDistrict}`,
                            emp.district && `อ.${emp.district}`,
                            emp.province && `จ.${emp.province}`,
                            emp.postalCode,
                          ]
                            .filter(Boolean)
                            .join(" ") || "-"}
                        </td>
                        <td>{emp.phone}</td>
                        <td>{emp.organization?.name ?? "-"}</td>
                        <td>{new Date(emp.createdAt).toLocaleDateString()}</td>
                        <td>{new Date(emp.updatedAt).toLocaleDateString()}</td>
                        <td className={styles.actions}>
                          <button
                            onClick={() => handleOpenEdit(emp.id)}
                            className={`${styles.iconBtn} ${styles.edit}`}
                          >
                            <FaEdit />
                          </button>

                          <button
                            onClick={() => {
                              setEmployeeToDelete(emp);
                              setShowDeleteModal(true);
                            }}
                            className={`${styles.iconBtn} ${styles.delete}`}
                          >
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ===== Modal ===== */}
      {showEditModal && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowEditModal(false)}
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2>แก้ไขข้อมูลพนักงาน</h2>

            <form onSubmit={handleUpdate} className={styles.modalForm}>
              <div className={styles.grid}>
                <div className={styles.field}>
                  <label>
                    เลขบัตรประชาชน <span style={{ color: "red" }}>*</span>
                  </label>
                  <input value={editForm.nationalId} />

                  {editErrors.nationalId && (
                    <small style={{ color: "red" }}>
                      {editErrors.nationalId}
                    </small>
                  )}
                </div>
                <br />
                <div className={styles.field}>
                  <label>
                    ชื่อ <span style={{ color: "red" }}>*</span>
                  </label>
                  <input
                    value={editForm.firstName}
                    onChange={(e) =>
                      setEditForm({ ...editForm, firstName: e.target.value })
                    }
                    required
                  />
                </div>
                <div className={styles.field}>
                  <label>
                    นามสกุล <span style={{ color: "red" }}>*</span>
                  </label>
                  <input
                    value={editForm.lastName}
                    onChange={(e) =>
                      setEditForm({ ...editForm, lastName: e.target.value })
                    }
                    required
                  />
                </div>
                <div className={styles.field}>
                  <label>
                    Username <span style={{ color: "red" }}>*</span>
                  </label>
                  <input
                    type="username"
                    value={editForm.username}
                    onChange={(e) =>
                      setEditForm({ ...editForm, username: e.target.value })
                    }
                    required
                  />
                </div>
                <div className={styles.field}>
                  <label>
                    Email <span style={{ color: "red" }}>*</span>
                  </label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) =>
                      setEditForm({ ...editForm, email: e.target.value })
                    }
                    required
                  />
                </div>
                <div className={styles.field}>
                  <label>
                    เบอร์โทรศัพท์ <span style={{ color: "red" }}>*</span>
                  </label>
                  <input
                    type="tel"
                    value={editForm.phone}
                    onChange={(e) => {
                      setEditForm({
                        ...editForm,
                        phone: e.target.value.replace(/\D/g, ""),
                      });
                      setEditErrors({ ...editErrors, phone: "" });
                    }}
                    required
                    pattern="[0-9]{10}"
                    maxLength={10}
                    inputMode="numeric"
                  />

                  {editErrors.phone && (
                    <small style={{ color: "red" }}>{editErrors.phone}</small>
                  )}
                </div>{" "}
                <br />
                <div className={styles.field}>
                  <label>บ้านเลขที่</label>
                  <input
                    value={editForm.houseNo}
                    onChange={(e) =>
                      setEditForm({ ...editForm, houseNo: e.target.value })
                    }
                  />
                </div>
                <div className={styles.field}>
                  <label>หมู่</label>
                  <input
                    value={editForm.village}
                    onChange={(e) =>
                      setEditForm({ ...editForm, village: e.target.value })
                    }
                  />
                </div>
                <div className={styles.field}>
                  <label>ซอย</label>
                  <input
                    value={editForm.alley}
                    onChange={(e) =>
                      setEditForm({ ...editForm, alley: e.target.value })
                    }
                  />
                </div>
                <div className={styles.field}>
                  <label>ถนน</label>
                  <input
                    value={editForm.road}
                    onChange={(e) =>
                      setEditForm({ ...editForm, road: e.target.value })
                    }
                  />
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
                        top: "100%",
                        left: 0,
                        width: "100%",
                        maxHeight: "200px",
                        overflowY: "auto",
                        background: "#fff",
                        border: "1px solid #ccc",
                        zIndex: 9999,
                      }}
                    >
                      {provinces
                        .filter((p) =>
                          p.provinceNameTh.includes(provinceSearch),
                        )
                        .map((p) => (
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
                    value={editForm.district}
                    onChange={(e) => handleDistrictChange(e.target.value)}
                    disabled={!editForm.province}
                  >
                    <option value="">เลือกอำเภอ</option>
                    {filteredDistricts.map((d) => (
                      <option key={d.districtCode} value={d.districtNameTh}>
                        {d.districtNameTh}
                      </option>
                    ))}
                  </select>
                </div>
                <div className={styles.field}>
                  <label>ตำบล</label>
                  <select
                    value={editForm.subDistrict}
                    onChange={(e) => handleSubDistrictChange(e.target.value)}
                    disabled={!editForm.district}
                  >
                    <option value="">เลือกตำบล</option>
                    {filteredSubDistricts.map((s) => (
                      <option
                        key={s.subdistrictCode}
                        value={s.subdistrictNameTh}
                      >
                        {s.subdistrictNameTh}
                      </option>
                    ))}
                  </select>
                </div>
                <div className={styles.field}>
                  <label>รหัสไปรษณีย์</label>
                  <input value={editForm.postalCode} readOnly />
                </div>
                <div className={styles.field}>
                  <label>
                    หน่วยงาน <span style={{ color: "red" }}>*</span>
                  </label>
                  <select
                    value={editForm.organizationId}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        organizationId: e.target.value,
                      })
                    }
                  >
                    <option value="">-- ไม่มีหน่วยงาน --</option>
                    {organizations.map((org) => (
                      <option key={org.id} value={org.id}>
                        {org.name}
                      </option>
                    ))}
                  </select>
                </div>
                {/* <div className={styles.field}>
                  <label>Password (เว้นว่างถ้าไม่เปลี่ยน)</label>
                  <input
                    type="password"
                    value={editForm.password}
                    onChange={(e) =>
                      setEditForm({ ...editForm, password: e.target.value })
                    }
                  />
                </div> */}
              </div>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className={styles.cancel}
                >
                  ยกเลิก
                </button>

                <button
                  type="submit"
                  className={styles.submit}
                  disabled={editLoading}
                >
                  {editLoading ? "กำลังบันทึก..." : "บันทึก"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== Delete Modal ===== */}
      {showDeleteModal && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowDeleteModal(false)}
        >
          <div
            className={styles.deleteModal}
            onClick={(e) => e.stopPropagation()}
          >
            <h3>ยืนยันการลบ</h3>

            <p>
              คุณต้องการลบพนักงาน
              <br />
              <strong>
                {employeeToDelete?.firstName} {employeeToDelete?.lastName}
              </strong>
              <br />
              ใช่หรือไม่?
            </p>

            <div className={styles.deleteActions}>
              <button
                onClick={() => setShowDeleteModal(false)}
                className={styles.cancel}
              >
                ยกเลิก
              </button>

              <button
                onClick={confirmDelete}
                className={styles.deleteConfirm}
                disabled={deleteLoading}
              >
                {deleteLoading ? "กำลังลบ..." : "ลบข้อมูล"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
