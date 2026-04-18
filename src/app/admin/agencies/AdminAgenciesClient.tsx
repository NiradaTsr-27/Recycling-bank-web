"use client";

import { useEffect, useState } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import styles from "@/styles/pages/admin/adminAgencies.module.css";
import AdminNavbar from "@/components/navbar/AdminNavbar";

type Agency = {
  id: number;

  houseNo?: string;
  village?: string;
  road?: string;
  alley?: string;

  postalCode: string | null;
  subDistrict: string | null;
  district: string | null;
  province: string | null;
  phone: string | null;
  name: string;
  mapUrl?: string | null;
  createdAt: string;
  updatedAt: string;
};

export default function AdminAgenciesPage() {
  //////////////////////////////////////////////////////
  // STATE
  //////////////////////////////////////////////////////

  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [loading, setLoading] = useState(true);

  const [openModal, setOpenModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  //  Delete Modal State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [agencyToDelete, setAgencyToDelete] = useState<Agency | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [errors, setErrors] = useState<any>({});

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    postalCode: "",
    houseNo: "",
    village: "",
    road: "",
    alley: "",
    subDistrict: "",
    district: "",
    province: "",
    mapUrl: "",
  });

  //////////////////////////////////////////////////////
  // FETCH
  //////////////////////////////////////////////////////

  const fetchAgencies = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/organizations");
      const data = await res.json();
      setAgencies(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgencies();
  }, []);

  const [provinces, setProvinces] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [subDistricts, setSubDistricts] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const [p, d, s] = await Promise.all([
        fetch("/JSON/provinces.json").then((res) => res.json()),
        fetch("/JSON/districts.json").then((res) => res.json()),
        fetch("/JSON/subdistricts.json").then((res) => res.json()),
      ]);

      setProvinces(p);
      setDistricts(d);
      setSubDistricts(s);
    };

    loadData();
  }, []);
  const [showProvinceDropdown, setShowProvinceDropdown] = useState(false);
  const [showDistrictDropdown, setShowDistrictDropdown] = useState(false);
  const [showSubDistrictDropdown, setShowSubDistrictDropdown] = useState(false);
  const filteredDistricts = districts.filter(
    (d) =>
      d.provinceCode ===
      provinces.find((p) => p.provinceNameTh === formData.province)
        ?.provinceCode,
  );

  const filteredSubDistricts = subDistricts.filter(
    (s) =>
      s.districtCode ===
      districts.find((d) => d.districtNameTh === formData.district)
        ?.districtCode,
  );
  //////////////////////////////////////////////////////
  // FORM
  //////////////////////////////////////////////////////
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // ✅ เพิ่มตรงนี้
    if (name === "phone") {
      setFormData({
        ...formData,
        phone: value.replace(/\D/g, ""), // เอาเฉพาะตัวเลข
      });
      return;
    }

    if (name === "province") {
      setFormData({
        ...formData,
        province: value,
        district: "",
        subDistrict: "",
        postalCode: "",
      });
      return;
    }

    if (name === "district") {
      setFormData({
        ...formData,
        district: value,
        subDistrict: "",
        postalCode: "",
      });
      return;
    }

    if (name === "subDistrict") {
      const found = subDistricts.find((s) => s.subdistrictNameTh === value);

      setFormData({
        ...formData,
        subDistrict: value,
        postalCode: found?.postalCode?.toString() || "",
      });
      return;
    }

    setFormData({ ...formData, [name]: value });
  };

  const resetForm = () => {
    setFormData({
      name: "",
      phone: "",
      houseNo: "",
      village: "",
      road: "",
      alley: "",
      postalCode: "",
      subDistrict: "",
      district: "",
      province: "",
      mapUrl: "",
    });
    setEditId(null);
  };

  //////////////////////////////////////////////////////
  // SUBMIT
  //////////////////////////////////////////////////////
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return; // ❌ หยุดถ้าไม่ผ่าน

    const method = editId ? "PATCH" : "POST";
    const url = editId
      ? `/api/admin/organizations/${editId}`
      : `/api/admin/organizations`;

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const data = await res.json();

    if (res.ok) {
      await fetchAgencies();
      setOpenModal(false);
      resetForm();
      setErrors({});
    } else {
      alert(data.message || "เกิดข้อผิดพลาด");
    }
  };

  //////////////////////////////////////////////////////
  // EDIT
  //////////////////////////////////////////////////////

  const handleEdit = (agency: Agency) => {
    setEditId(agency.id);
    setFormData({
      name: agency.name || "",
      phone: agency.phone || "",
      postalCode: agency.postalCode || "",
      houseNo: agency.houseNo || "",
      village: agency.village || "",
      alley: agency.alley || "",
      road: agency.road || "",
      subDistrict: agency.subDistrict || "",
      district: agency.district || "",
      province: agency.province || "",
      mapUrl: agency.mapUrl || "",
    });
    setOpenModal(true);
  };

  //////////////////////////////////////////////////////
  // DELETE
  //////////////////////////////////////////////////////

  //  เปิด modal
  const handleDeleteClick = (agency: Agency) => {
    setAgencyToDelete(agency);
    setShowDeleteModal(true);
  };

  //  ยืนยันลบ
  const confirmDelete = async () => {
    if (!agencyToDelete) return;

    try {
      setDeleteLoading(true);

      const res = await fetch(`/api/admin/organizations/${agencyToDelete.id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (res.ok) {
        await fetchAgencies();
        setShowDeleteModal(false);
        setAgencyToDelete(null);
      } else {
        alert(data.message || "ลบไม่สำเร็จ");
      }
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาด");
    } finally {
      setDeleteLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: any = {};

    if (!formData.name.trim()) newErrors.name = "กรุณากรอกชื่อหน่วยงาน";
    if (!formData.phone.trim()) newErrors.phone = "กรุณากรอกเบอร์โทร";
    if (!formData.province.trim()) newErrors.province = "กรุณากรอกจังหวัด";

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  return (
    <>
      <AdminNavbar />

      <div className={styles.container}>
        <div className={styles.header}>
          <h1>ข้อมูลหน่วยงาน</h1>
          <button
            className={styles.addBtn}
            onClick={() => {
              resetForm();
              setOpenModal(true);
            }}
          >
            เพิ่มข้อมูลหน่วยงาน
          </button>
        </div>

        <div className={styles.card}>
          {loading ? (
            <p>กำลังโหลดข้อมูล...</p>
          ) : (
            <div style={{ maxHeight: "500px", overflowY: "auto" }}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>ชื่อหน่วยงาน</th>
                    <th>ที่อยู่</th>
                    <th>ที่ตั้ง</th>
                    <th>ติดต่อ</th>
                    <th>วันที่เพิ่ม</th>
                    <th>อัปเดต</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {agencies.map((agency) => (
                    <tr key={agency.id}>
                      <td>{agency.id}</td>
                      <td>{agency.name}</td>

                      <td>
                        {[
                          agency.houseNo,
                          agency.village && `หมู่ ${agency.village}`,
                          agency.alley && `ซ.${agency.alley}`,
                          agency.road && `ถ.${agency.road}`,
                          agency.subDistrict && `ต.${agency.subDistrict}`,
                          agency.district && `อ.${agency.district}`,
                          agency.province && `จ.${agency.province}`,

                          agency.postalCode,
                        ]
                          .filter(Boolean)
                          .join(" ") || "-"}
                      </td>

                      <td>
                        {agency.mapUrl && (
                          <a href={agency.mapUrl} target="_blank">
                            ดูแผนที่
                          </a>
                        )}
                      </td>

                      <td>{agency.phone}</td>
                      <td>{new Date(agency.createdAt).toLocaleDateString()}</td>
                      <td>{new Date(agency.updatedAt).toLocaleDateString()}</td>

                      <td className={styles.actions}>
                        <button
                          className={`${styles.iconBtn} ${styles.edit}`}
                          onClick={() => handleEdit(agency)}
                        >
                          <FaEdit />
                        </button>

                        <button
                          className={`${styles.iconBtn} ${styles.delete}`}
                          onClick={() => handleDeleteClick(agency)}
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

      {/* ===================== DELETE MODAL ===================== */}
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
              คุณต้องการลบหน่วยงาน
              <br />
              <strong>{agencyToDelete?.name}</strong>
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

      {/* ===================== ADD / EDIT MODAL ===================== */}
      {openModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h2>{editId ? "แก้ไขข้อมูลหน่วยงาน" : "เพิ่มข้อมูลหน่วยงาน"}</h2>

            <form onSubmit={handleSubmit}>
              <div className={styles.formGrid}>
                {[
                  { label: "ชื่อหน่วยงาน", name: "name", required: true },
                  { label: "ช่องทางการติดต่อ", name: "phone", required: true },
                  { label: "บ้านเลขที่", name: "houseNo" },
                  { label: "หมู่", name: "village" },
                  { label: "ซอย", name: "alley" },
                  { label: "ถนน", name: "road" },

                  { label: "ลิงก์แผนที่", name: "mapUrl" },
                ].map((field) => (
                  <div key={field.name}>
                    {/* LABEL */}
                    <label>
                      {field.label}
                      {field.required && (
                        <span className={styles.required}> *</span>
                      )}
                    </label>

                    {/* INPUT */}
                    <input
                      name={field.name}
                      value={(formData as any)[field.name]}
                      onChange={handleChange}
                      className={errors[field.name] ? styles.inputError : ""}
                      {...(field.name === "phone" && {
                        pattern: "[0-9]{10}",
                        maxLength: 10,
                        inputMode: "numeric",
                      })}
                    />

                    {/* ERROR TEXT */}
                    {errors[field.name] && (
                      <p className={styles.errorText}>{errors[field.name]}</p>
                    )}
                  </div>
                ))}
                <div className={styles.inputWrapper}>
                  <label>
                    จังหวัด <span className={styles.required}> *</span>{" "}
                  </label>
                  <input
                    name="province"
                    value={formData.province}
                    onChange={(e) => {
                      handleChange(e);
                      setShowProvinceDropdown(true);
                    }}
                    onFocus={() => setShowProvinceDropdown(true)}
                  />

                  {showProvinceDropdown && (
                    <div className={styles.dropdown}>
                      {provinces
                        .filter((p) =>
                          p.provinceNameTh.includes(formData.province),
                        )
                        .slice(0, 50)
                        .map((p) => (
                          <div
                            key={p.id}
                            onClick={() => {
                              setFormData({
                                ...formData,
                                province: p.provinceNameTh,
                                district: "",
                                subDistrict: "",
                                postalCode: "",
                              });
                              setShowProvinceDropdown(false); // 🔥 ปิดตรงนี้
                            }}
                          >
                            {p.provinceNameTh}
                          </div>
                        ))}
                    </div>
                  )}
                </div>

                <div className={styles.inputWrapper}>
                  <label>
                    อำเภอ <span className={styles.required}> *</span>
                  </label>
                  <input
                    name="district"
                    value={formData.district}
                    onFocus={() => setShowDistrictDropdown(true)}
                  />

                  {showDistrictDropdown && formData.province && (
                    <div className={styles.dropdown}>
                      {filteredDistricts.map((d) => (
                        <div
                          key={d.id}
                          onClick={() => {
                            setFormData({
                              ...formData,
                              district: d.districtNameTh,
                              subDistrict: "",
                              postalCode: "",
                            });
                            setShowDistrictDropdown(false); // 🔥
                          }}
                        >
                          {d.districtNameTh}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className={styles.inputWrapper}>
                  <label>
                    ตำบล <span className={styles.required}> *</span>
                  </label>
                  <input
                    name="subDistrict"
                    value={formData.subDistrict}
                    onFocus={() => setShowSubDistrictDropdown(true)}
                  />

                  {showSubDistrictDropdown && formData.district && (
                    <div className={styles.dropdown}>
                      {filteredSubDistricts.map((s) => (
                        <div
                          key={s.id}
                          onClick={() => {
                            setFormData({
                              ...formData,
                              subDistrict: s.subdistrictNameTh,
                              postalCode: s.postalCode.toString(),
                            });
                            setShowSubDistrictDropdown(false); // 🔥
                          }}
                        >
                          {s.subdistrictNameTh}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <label>
                    รหัสไปรษณีย์ <span className={styles.required}> *</span>
                  </label>
                  <input value={formData.postalCode} readOnly />
                </div>
              </div>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.cancel}
                  onClick={() => setOpenModal(false)}
                >
                  ยกเลิก
                </button>

                <button type="submit" className={styles.save}>
                  {loading ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
