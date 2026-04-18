"use client";

import { useEffect, useState } from "react";
import AdminNavbar from "@/components/navbar/AdminNavbar";
import styles from "@/styles/pages/admin/adminRecycle.module.css";
import { FaEdit, FaTrash } from "react-icons/fa";
import Link from "next/link";
import EmployeeNavbar from "@/components/navbar/EmployeeNavbar";

//////////////////////////////////////////////////////
// TYPES
//////////////////////////////////////////////////////

type Category = {
  id: number;
  name: string;
};

type Waste = {
  id: number;
  name: string;
  price: number;
  unit: string;
  categoryId: number;
  category: Category;
  createdAt: string;
  updatedAt: string;
};

export default function AdminRecyclePage() {
  const [wastes, setWastes] = useState<Waste[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedCategory, setSelectedCategory] = useState<number | "">("");

  //////////////////////////////////////////////////////
  // FETCH DATA
  //////////////////////////////////////////////////////
  const fetchData = async () => {
    try {
      setLoading(true);

      const wasteRes = await fetch("/api/admin/waste-types");
      const wasteData = await wasteRes.json();

      const catRes = await fetch("/api/admin/recycle-categories");
      const catData = await catRes.json();

      setWastes(wasteData);
      setCategories(catData);
    } catch (error) {
      console.error("โหลดข้อมูลล้มเหลว", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  //////////////////////////////////////////////////////
  // FILTER
  //////////////////////////////////////////////////////
  const filteredWastes = wastes.filter((w) =>
    selectedCategory ? w.categoryId === selectedCategory : true,
  );

  //////////////////////////////////////////////////////
  // EDIT
  //////////////////////////////////////////////////////
  const [openEdit, setOpenEdit] = useState(false);
  const [selectedWaste, setSelectedWaste] = useState<Waste | null>(null);
  const [editLoading, setEditLoading] = useState(false);

  const [editForm, setEditForm] = useState({
    name: "",
    price: "",
    unit: "กิโลกรัม",
    categoryId: "",
  });

  const handleEdit = (waste: Waste) => {
    setSelectedWaste(waste);

    setEditForm({
      name: waste.name,
      price: waste.price.toString(),
      unit: waste.unit,
      categoryId: waste.categoryId.toString(),
    });

    setOpenEdit(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWaste) return;

    try {
      setEditLoading(true);

      await fetch(`/api/admin/waste-types/${selectedWaste.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editForm.name,
          price: Number(editForm.price),
          unit: editForm.unit,
          categoryId: Number(editForm.categoryId),
        }),
      });

      setOpenEdit(false);
      fetchData();
    } catch (error) {
      console.error("อัปเดตล้มเหลว", error);
    } finally {
      setEditLoading(false);
    }
  };

  //////////////////////////////////////////////////////
  // DELETE
  //////////////////////////////////////////////////////
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [wasteToDelete, setWasteToDelete] = useState<Waste | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const confirmDelete = async () => {
    if (!wasteToDelete) return;

    try {
      setDeleteLoading(true);

      await fetch(`/api/employee/waste-types/${wasteToDelete.id}`, {
        method: "DELETE",
      });

      setShowDeleteModal(false);
      setWasteToDelete(null);
      fetchData();
    } catch (error) {
      console.error("ลบล้มเหลว", error);
    } finally {
      setDeleteLoading(false);
    }
  };

  //////////////////////////////////////////////////////
  // ADD
  //////////////////////////////////////////////////////
  const [openAdd, setOpenAdd] = useState(false);
  const [addLoading, setAddLoading] = useState(false);

  const [addForm, setAddForm] = useState({
    name: "",
    price: "",
    unit: "กิโลกรัม",
    categoryId: "",
  });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();

    // ✅ กันค่าว่างก่อนยิง API
    if (!addForm.categoryId) {
      alert("กรุณาเลือกประเภทขยะ");
      return;
    }

    try {
      setAddLoading(true);

      await fetch("/api/admin/waste-types", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: addForm.name,
          price: Number(addForm.price),
          unit: addForm.unit,
          categoryId: Number(addForm.categoryId), // ตอนนี้ปลอดภัยแล้ว
        }),
      });

      setOpenAdd(false);
      setAddForm({
        name: "",
        price: "",
        unit: "กิโลกรัม", // 🔥 แก้กลับให้ตรง
        categoryId: "",
      });

      fetchData();
    } catch (error) {
      console.error("เพิ่มข้อมูลล้มเหลว", error);
    } finally {
      setAddLoading(false);
    }
  };
  //////////////////////////////////////////////////////
  // RENDER
  //////////////////////////////////////////////////////
  return (
    <>
      <AdminNavbar />

      <div className={styles.container}>
        <div className={styles.header}>
          <h1>จัดการข้อมูลขยะรีไซเคิล</h1>

          <div className={styles.headerActions}>
            <Link
              href="/employee/recycleEmp/types"
              className={styles.manageTypeBtn}
            >
              จัดการประเภทขยะ
            </Link>

            <button className={styles.addBtn} onClick={() => setOpenAdd(true)}>
              เพิ่มรายการขยะ
            </button>
          </div>
        </div>

        <div className={styles.card}>
          {loading ? (
            <p>กำลังโหลดข้อมูล...</p>
          ) : (
            <>
              <div className={styles.filter}>
                <select
                  value={selectedCategory}
                  onChange={(e) =>
                    setSelectedCategory(
                      e.target.value ? Number(e.target.value) : "",
                    )
                  }
                >
                  <option value="">-- ทั้งหมด --</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ maxHeight: "500px", overflowY: "auto" }}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>ชื่อขยะ</th>
                      <th>ประเภท</th>
                      <th>ราคา (บาท/กก.)</th>
                      <th>วันที่เพิ่ม</th>
                      <th>อัปเดต</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredWastes.map((waste, index) => (
                      <tr key={waste.id}>
                        <td>{waste.id}</td>
                        <td>{waste.name}</td>
                        <td>{waste.category?.name}</td>
                        <td>{waste.price}</td>
                        <td>
                          {new Date(waste.createdAt).toLocaleDateString()}
                        </td>
                        <td>
                          {new Date(waste.updatedAt).toLocaleDateString()}
                        </td>
                        <td className={styles.actions}>
                          <button
                            className={`${styles.iconBtn} ${styles.edit}`}
                            onClick={() => handleEdit(waste)}
                          >
                            <FaEdit />
                          </button>

                          <button
                            className={`${styles.iconBtn} ${styles.delete}`}
                            onClick={() => {
                              setWasteToDelete(waste);
                              setShowDeleteModal(true);
                            }}
                          >
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>

      {/* EDIT MODAL */}
      {openEdit && (
        <div className={styles.modalOverlay} onClick={() => setOpenEdit(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2>แก้ไขข้อมูลขยะ</h2>

            <form onSubmit={handleSave} className={styles.modalForm}>
              <div className={styles.grid}>
                <div className={styles.field}>
                  <label>
                    ชื่อขยะ <span style={{ color: "red" }}>*</span>
                  </label>
                  <input
                    value={editForm.name}
                    onChange={(e) =>
                      setEditForm({ ...editForm, name: e.target.value })
                    }
                    required
                  />
                </div>

                <div className={styles.field}>
                  <label>
                    ราคา <span style={{ color: "red" }}>*</span>
                  </label>
                  <input
                    type="number"
                    value={editForm.price}
                    onChange={(e) =>
                      setEditForm({ ...editForm, price: e.target.value })
                    }
                    required
                  />
                </div>

                <div className={styles.field}>
                  <label>หน่วย</label>
                  <input value="กิโลกรัม" disabled />
                </div>

                <div className={styles.field}>
                  <label>
                    ประเภท <span style={{ color: "red" }}>*</span>
                  </label>

                  <div className={styles.filter}>
                    {categories.map((cat) => (
                      <button
                        type="button"
                        key={cat.id}
                        className={`${styles.toggleBtn} ${
                          editForm.categoryId === cat.id.toString()
                            ? styles.active
                            : ""
                        }`}
                        onClick={() =>
                          setEditForm({
                            ...editForm,
                            categoryId: cat.id.toString(),
                          })
                        }
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  onClick={() => setOpenEdit(false)}
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

      {/* DELETE MODAL */}
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
              คุณต้องการลบรายการ
              <br />
              <strong>{wasteToDelete?.name}</strong>
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

      {/* ADD MODAL */}
      {openAdd && (
        <div className={styles.modalOverlay} onClick={() => setOpenAdd(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2>เพิ่มรายการขยะ</h2>

            <form onSubmit={handleAdd} className={styles.modalForm}>
              <div className={styles.grid}>
                <div className={styles.field}>
                  <label>
                    ชื่อขยะ <span style={{ color: "red" }}>*</span>
                  </label>
                  <input
                    value={addForm.name}
                    onChange={(e) =>
                      setAddForm({ ...addForm, name: e.target.value })
                    }
                    required
                  />
                </div>

                <div className={styles.field}>
                  <label>
                    ราคา <span style={{ color: "red" }}>*</span>
                  </label>
                  <input
                    type="number"
                    value={addForm.price}
                    onChange={(e) =>
                      setAddForm({ ...addForm, price: e.target.value })
                    }
                    required
                  />
                </div>

                <div className={styles.field}>
                  <label>หน่วย</label>
                  <input value="กิโลกรัม" disabled />
                </div>

                <div className={styles.field}>
                  <label>
                    ประเภท <span style={{ color: "red" }}>*</span>
                  </label>

                  <div className={styles.filter}>
                    {categories.map((cat) => (
                      <button
                        type="button"
                        key={cat.id}
                        className={`${styles.toggleBtn} ${
                          addForm.categoryId === cat.id.toString()
                            ? styles.active
                            : ""
                        }`}
                        onClick={() =>
                          setAddForm({
                            ...addForm,
                            categoryId: cat.id.toString(),
                          })
                        }
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  onClick={() => setOpenAdd(false)}
                  className={styles.cancel}
                >
                  ยกเลิก
                </button>

                <button
                  type="submit"
                  className={styles.submit}
                  disabled={addLoading}
                >
                  {addLoading ? "กำลังบันทึก..." : "บันทึก"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
