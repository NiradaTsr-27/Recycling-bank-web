"use client";

import { useEffect, useState } from "react";
import styles from "@/styles/pages/admin/adminMembers.module.css";
import { FaEdit, FaToggleOn, FaTrash, FaUserPlus } from "react-icons/fa";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import AdminNavbar from "@/components/navbar/AdminNavbar";

interface Member {
  id: number;
  nationalId: string;
  firstName: string;
  lastName: string;
  phone?: string;

  houseNo?: string;
  village?: string;
  road?: string;
  alley?: string;
  subDistrict?: string;
  district?: string;
  province?: string;
  postalCode?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  account: {
    username: string;
    email: string;
  };
}

export default function AdminMembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  // ===== Modal State =====
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);

  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [editErrors, setEditErrors] = useState<any>({});

  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    houseNo: "",
    village: "",
    road: "",
    alley: "",
    subDistrict: "",
    district: "",
    province: "",
    postalCode: "",
  });
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.replace("/login");
      return;
    }

    if (session.user.role !== "ADMIN") {
      router.replace("/");
    }
  }, [session, status, router]);
  //////////////////////////////////////////////////////
  // FETCH MEMBERS
  //////////////////////////////////////////////////////
  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const res = await fetch("/api/admin/members");
      const data = await res.json();
      setMembers(data);
    } catch (error) {
      console.error("โหลดสมาชิกไม่สำเร็จ", error);
    } finally {
      setLoading(false);
    }
  };

  const [provinces, setProvinces] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [subDistricts, setSubDistricts] = useState<any[]>([]);

  const [filteredDistricts, setFilteredDistricts] = useState<any[]>([]);
  const [filteredSubDistricts, setFilteredSubDistricts] = useState<any[]>([]);

  // search จังหวัด
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
  //////////////////////////////////////////////////////
  // OPEN EDIT
  //////////////////////////////////////////////////////
  const handleOpenEdit = (member: Member) => {
    setSelectedMember(member);

    setEditForm({
      firstName: member.firstName || "",
      lastName: member.lastName || "",
      phone: member.phone || "",
      email: member.account.email || "",
      houseNo: member.houseNo || "",
      village: member.village || "",
      alley: member.alley || "",
      road: member.road || "",
      subDistrict: member.subDistrict || "",
      district: member.district || "",
      province: member.province || "",
      postalCode: member.postalCode || "",
    });
    setProvinceSearch(member.province || "");

    // preload อำเภอ
    const province = provinces.find(
      (p) => p.provinceNameTh === member.province,
    );

    if (province) {
      const d = districts.filter(
        (x) => x.provinceCode === province.provinceCode,
      );
      setFilteredDistricts(d);

      const district = d.find((x) => x.districtNameTh === member.district);

      if (district) {
        const s = subDistricts.filter(
          (x) => x.districtCode === district.districtCode,
        );
        setFilteredSubDistricts(s);
      }
    }

    setShowEditModal(true);
  };

  //////////////////////////////////////////////////////
  // UPDATE MEMBER
  //////////////////////////////////////////////////////
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember) return;

    try {
      setActionLoading(true);

      const res = await fetch(`/api/admin/members/${selectedMember.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.field) {
          setEditErrors((prev: any) => ({
            ...prev,
            [data.field]: data.message,
          }));
          return;
        }

        alert(data.error || "แก้ไขไม่สำเร็จ");
        return;
      }

      setShowEditModal(false);
      setSelectedMember(null);
      fetchMembers();
    } catch (err) {
      console.error("แก้ไขไม่สำเร็จ", err);
    } finally {
      setActionLoading(false);
    }
  };

  //////////////////////////////////////////////////////
  // DELETE MEMBER
  //////////////////////////////////////////////////////
  const confirmDelete = async () => {
    if (!selectedMember) return;

    try {
      setActionLoading(true);

      await fetch(`/api/admin/members/${selectedMember.id}`, {
        method: "DELETE",
      });

      setShowDeleteModal(false);
      fetchMembers();
    } catch (err) {
      console.error("ลบไม่สำเร็จ", err);
    } finally {
      setActionLoading(false);
    }
  };

  //////////////////////////////////////////////////////
  // TOGGLE STATUS
  //////////////////////////////////////////////////////
  const handleToggleStatus = async () => {
    if (!selectedMember) return;

    const newStatus = !selectedMember.isActive;

    try {
      setActionLoading(true);

      const res = await fetch(
        `/api/admin/members/${selectedMember.id}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isActive: newStatus }),
        },
      );

      //สำคัญมาก
      if (!res.ok) {
        const errorData = await res.json();
        console.error("API Error:", errorData);
        throw new Error("Update failed");
      }

      // update state เฉพาะตอน API สำเร็จจริง
      setMembers((prev) =>
        prev.map((m) =>
          m.id === selectedMember.id ? { ...m, isActive: newStatus } : m,
        ),
      );

      setShowStatusModal(false);
      setSelectedMember(null);
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาดในการเปลี่ยนสถานะ");
    } finally {
      setActionLoading(false);
    }
  };
  //////////////////////////////////////////////////////
  // RENDER
  //////////////////////////////////////////////////////
  return (
    <>
      <AdminNavbar />

      <div className={styles.container}>
        <div className={styles.title}>
          <h1>จัดการสมาชิก</h1>

          <Link href="/admin/members/addMem">
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
                    <th>เบอร์โทร</th>
                    <th>สถานะ</th>
                    <th>วันที่เริ่มใช้งาน</th>
                    <th>อัปเดต</th>
                    <th></th>
                  </tr>
                </thead>

                <tbody>
                  {members
                    .slice()
                    .sort((a, b) => a.id - b.id)
                    .map((member) => (
                      <tr key={member.id}>
                        <td>{member.id}</td>
                        <td>{member.nationalId}</td>
                        <td>
                          {member.firstName} {member.lastName}
                        </td>
                        <td>{member.account.username}</td>
                        <td>{member.account.email}</td>
                        <td>
                          {[
                            member.houseNo,
                            member.village && `หมู่ ${member.village}`,
                            member.alley && `ซ.${member.alley}`,
                            member.road && `ถ.${member.road}`,
                            member.subDistrict && `ต.${member.subDistrict}`,
                            member.district && `อ.${member.district}`,
                            member.province && `จ.${member.province}`,
                            member.postalCode,
                          ]
                            .filter(Boolean)
                            .join(" ") || "-"}
                        </td>
                        <td>{member.phone}</td>

                        <td>
                          <span
                            className={
                              member.isActive
                                ? styles.activeBadge
                                : styles.inactiveBadge
                            }
                          >
                            {member.isActive ? "Active" : "Disable"}
                          </span>
                        </td>
                        <td>
                          {new Date(member.createdAt).toLocaleDateString()}
                        </td>
                        <td>
                          {new Date(member.updatedAt).toLocaleDateString()}
                        </td>

                        <td className={styles.actions}>
                          <button
                            onClick={() => handleOpenEdit(member)}
                            className={`${styles.iconBtn} ${styles.edit}`}
                          >
                            <FaEdit />
                          </button>

                          <button
                            onClick={() => {
                              setSelectedMember(member);
                              setShowDeleteModal(true);
                            }}
                            className={`${styles.iconBtn} ${styles.delete}`}
                          >
                            <FaTrash />
                          </button>

                          <button
                            onClick={() => {
                              setSelectedMember(member);
                              setShowStatusModal(true);
                            }}
                            className={styles.statusIcon}
                          >
                            <FaToggleOn />
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

      {/* ================= EDIT MODAL ================= */}
      {showEditModal && selectedMember && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowEditModal(false)}
        >
          <div
            className={styles.modalCardLarge}
            onClick={(e) => e.stopPropagation()}
          >
            <h2>แก้ไขข้อมูลสมาชิก</h2>

            <form onSubmit={handleUpdate} className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label>
                  เลขบัตรประชาชน <span style={{ color: "red" }}>*</span>
                </label>
                <input value={selectedMember.nationalId} required />
                {editErrors.nationalId && (
                  <small style={{ color: "red" }}>
                    {editErrors.nationalId}
                  </small>
                )}
              </div>
              <br />
              <div className={styles.formGroup}>
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
              <div className={styles.formGroup}>
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
              <div className={styles.formGroup}>
                <label>
                  Email <span style={{ color: "red" }}>*</span>
                </label>
                <input
                  value={editForm.email}
                  onChange={(e) =>
                    setEditForm({ ...editForm, email: e.target.value })
                  }
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>
                  เบอร์โทร <span style={{ color: "red" }}>*</span>
                </label>
                <input
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
                  title="กรุณากรอกเบอร์โทรศัพท์ 10 หลัก"
                  className={editErrors.phone ? styles.inputError : ""}
                />

                {editErrors.phone && (
                  <small style={{ color: "red" }}>{editErrors.phone}</small>
                )}
              </div>

              <div className={styles.formGroup}>
                <label>บ้านเลขที่</label>
                <input
                  name="houseNo"
                  value={editForm.houseNo}
                  onChange={(e) =>
                    setEditForm({ ...editForm, houseNo: e.target.value })
                  }
                />
              </div>

              <div className={styles.formGroup}>
                <label>หมู่</label>
                <input
                  name="village"
                  value={editForm.village}
                  onChange={(e) =>
                    setEditForm({ ...editForm, village: e.target.value })
                  }
                />
              </div>

              <div className={styles.formGroup}>
                <label>ซอย</label>
                <input
                  name="alley"
                  value={editForm.alley}
                  onChange={(e) =>
                    setEditForm({ ...editForm, alley: e.target.value })
                  }
                />
              </div>

              <div className={styles.formGroup}>
                <label>ถนน</label>
                <input
                  name="road"
                  value={editForm.road}
                  onChange={(e) =>
                    setEditForm({ ...editForm, road: e.target.value })
                  }
                />
              </div>
              <div
                className={styles.formGroup}
                style={{ position: "relative" }}
              >
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
                      .filter((p) => p.provinceNameTh.includes(provinceSearch))
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
              <div className={styles.formGroup}>
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
              <div className={styles.formGroup}>
                <label>ตำบล</label>
                <select
                  value={editForm.subDistrict}
                  onChange={(e) => handleSubDistrictChange(e.target.value)}
                  disabled={!editForm.district}
                >
                  <option value="">เลือกตำบล</option>
                  {filteredSubDistricts.map((s) => (
                    <option key={s.subdistrictCode} value={s.subdistrictNameTh}>
                      {s.subdistrictNameTh}
                    </option>
                  ))}
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>รหัสไปรษณีย์</label>
                <input value={editForm.postalCode} readOnly />
              </div>
              {/* ===== ACTION BUTTONS ===== */}
              <div className={styles.modalActionsRight}>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  disabled={actionLoading}
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedMember(null);
                  }}
                >
                  ยกเลิก
                </button>

                <button
                  type="submit"
                  className={styles.saveBtnGreen}
                  disabled={actionLoading}
                >
                  {actionLoading ? "กำลังบันทึก..." : "บันทึก"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= DELETE MODAL ================= */}
      {showDeleteModal && selectedMember && (
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
              คุณต้องการลบสมาชิก <br />
              <strong>
                {selectedMember.firstName} {selectedMember.lastName}
              </strong>{" "}
              ใช่หรือไม่?
            </p>

            <div className={styles.deleteActions}>
              <button
                onClick={() => setShowDeleteModal(false)}
                className={styles.cancelBtn}
              >
                ยกเลิก
              </button>

              <button
                onClick={confirmDelete}
                className={styles.deleteConfirm}
                disabled={actionLoading}
              >
                {actionLoading ? "กำลังลบ..." : "ลบข้อมูล"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= STATUS MODAL ================= */}
      {showStatusModal && selectedMember && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowStatusModal(false)}
        >
          <div
            className={styles.modalCard}
            onClick={(e) => e.stopPropagation()}
          >
            <h2>เปลี่ยนสถานะสมาชิก</h2>

            <p>
              ต้องการเปลี่ยนสถานะของ{" "}
              <strong>
                {selectedMember.firstName} {selectedMember.lastName}
              </strong>{" "}
              หรือไม่?
            </p>

            <div className={styles.modalActions}>
              <button
                className={
                  selectedMember.isActive
                    ? styles.deactivateBtn
                    : styles.activateBtn
                }
                onClick={handleToggleStatus}
                disabled={actionLoading}
              >
                {actionLoading
                  ? "กำลังดำเนินการ..."
                  : selectedMember.isActive
                    ? "ปิดการใช้งาน"
                    : "เปิดการใช้งาน"}
              </button>

              <button
                onClick={() => setShowStatusModal(false)}
                className={styles.cancelBtn}
              >
                ยกเลิก
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
