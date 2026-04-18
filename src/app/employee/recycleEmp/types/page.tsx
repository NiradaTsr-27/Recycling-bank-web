"use client";

import { useEffect, useState } from "react";
import AdminNavbar from "@/components/navbar/AdminNavbar";
import styles from "@/styles/pages/admin/adminRecycleTypes.module.css";
import { FaEdit, FaTrash } from "react-icons/fa";
import EmployeeNavbar from "@/components/navbar/EmployeeNavbar";

//////////////////////////////////////////////////////
// TYPES
//////////////////////////////////////////////////////

type RecycleType = {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
};

export default function RecycleTypesPage() {
  //////////////////////////////////////////////////////
  // STATE
  //////////////////////////////////////////////////////

  const [types, setTypes] = useState<RecycleType[]>([]);
  const [loading, setLoading] = useState(true);

  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);

  const [typeName, setTypeName] = useState("");
  const [selectedType, setSelectedType] = useState<RecycleType | null>(null);

  const [createLoading, setCreateLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [typeToDelete, setTypeToDelete] = useState<RecycleType | null>(null);

  //////////////////////////////////////////////////////
  // FETCH
  //////////////////////////////////////////////////////

  const fetchTypes = async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/employee/recycle-categories");

      if (!res.ok) throw new Error("โหลดข้อมูลไม่สำเร็จ");

      const data = await res.json();
      setTypes(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTypes();
  }, []);

  //////////////////////////////////////////////////////
  // CREATE
  //////////////////////////////////////////////////////

  const handleCreate = async () => {
    if (!typeName.trim()) {
      alert("กรุณากรอกชื่อประเภทขยะ");
      return;
    }

    try {
      setCreateLoading(true);

      const res = await fetch("/api/employee/recycle-categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: typeName }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message);
      }

      const created = await res.json();

      // Optimistic update
      setTypes((prev) => [...prev, created]);

      setTypeName("");
      setOpenAdd(false);
    } catch (error: any) {
      console.error(error);
      alert(error.message || "เพิ่มข้อมูลล้มเหลว");
    } finally {
      setCreateLoading(false);
    }
  };

  //////////////////////////////////////////////////////
  // UPDATE
  //////////////////////////////////////////////////////

  const handleOpenEdit = (type: RecycleType) => {
    setSelectedType(type);
    setTypeName(type.name);
    setOpenEdit(true);
  };

  const handleUpdate = async () => {
    if (!selectedType) return;

    try {
      setUpdateLoading(true);

      const res = await fetch(
        `/api/employee/recycle-categories/${selectedType.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: typeName }),
        },
      );

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message);
      }

      const updated = await res.json();

      // ✅ Optimistic update
      setTypes((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));

      setOpenEdit(false);
      setSelectedType(null);
      setTypeName("");
    } catch (error: any) {
      console.error(error);
      alert(error.message || "อัปเดตล้มเหลว");
    } finally {
      setUpdateLoading(false);
    }
  };

  //////////////////////////////////////////////////////
  // DELETE
  //////////////////////////////////////////////////////

  const handleDeleteClick = (type: RecycleType) => {
    setTypeToDelete(type);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!typeToDelete) return;

    try {
      setDeleteLoading(true);

      const res = await fetch(
        `/api/employee/recycle-categories/${typeToDelete.id}`,
        { method: "DELETE" },
      );

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message);
      }

      // ✅ Optimistic remove
      setTypes((prev) => prev.filter((t) => t.id !== typeToDelete.id));

      setShowDeleteModal(false);
      setTypeToDelete(null);
    } catch (error: any) {
      console.error(error);
      alert(error.message || "ไม่สามารถลบได้ อาจมีข้อมูลที่เชื่อมอยู่");
    } finally {
      setDeleteLoading(false);
    }
  };

  //////////////////////////////////////////////////////
  // RENDER
  //////////////////////////////////////////////////////

  return (
    <>
      <EmployeeNavbar />

      <div className={styles.container}>
        <div className={styles.header}>
          <h1>ประเภทขยะรีไซเคิล</h1>
          <button className={styles.addBtn} onClick={() => setOpenAdd(true)}>
            เพิ่มประเภทขยะ
          </button>
        </div>

        <div className={styles.card}>
          {loading ? (
            <p>กำลังโหลดข้อมูล...</p>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>ชื่อประเภท</th>
                  <th>วันที่เพิ่ม</th>
                  <th>อัปเดต</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {types
                  .slice()
                  .sort((a, b) => a.id - b.id)
                  .map((type) => (
                    <tr key={type.id}>
                      <td>{type.id}</td>
                      <td>{type.name}</td>
                      <td>{new Date(type.createdAt).toLocaleDateString()}</td>
                      <td>{new Date(type.updatedAt).toLocaleDateString()}</td>
                      <td className={styles.actions}>
                        <button
                          className={`${styles.iconBtn} ${styles.edit}`}
                          onClick={() => handleOpenEdit(type)}
                        >
                          <FaEdit />
                        </button>

                        <button
                          className={`${styles.iconBtn} ${styles.delete}`}
                          onClick={() => handleDeleteClick(type)}
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* DELETE MODAL */}
      {showDeleteModal && typeToDelete && (
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
              คุณต้องการลบประเภทขยะ
              <br />
              <strong>{typeToDelete.name}</strong>
              <br />
              ใช่หรือไม่?
            </p>

            <div className={styles.deleteActions}>
              <button
                className={styles.cancelBtn}
                onClick={() => setShowDeleteModal(false)}
                disabled={deleteLoading}
              >
                ยกเลิก
              </button>

              <button
                className={styles.deleteConfirm}
                onClick={confirmDelete}
                disabled={deleteLoading}
              >
                {deleteLoading ? "กำลังลบ..." : "ลบข้อมูล"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {openEdit && selectedType && (
        <div
          className={styles.modalOverlay}
          onClick={() => {
            setOpenEdit(false);
            setSelectedType(null);
          }}
        >
          <div
            className={styles.deleteModal}
            onClick={(e) => e.stopPropagation()}
          >
            <h3>แก้ไขประเภทขยะ</h3>

            <div style={{ marginTop: "1rem" }}>
              <input
                type="text"
                value={typeName}
                onChange={(e) => setTypeName(e.target.value)}
                placeholder="กรอกชื่อประเภทขยะ"
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "8px",
                  border: "1px solid #ccc",
                }}
              />
            </div>

            <div
              className={styles.deleteActions}
              style={{ marginTop: "1.5rem" }}
            >
              <button
                className={styles.cancelBtn}
                onClick={() => {
                  setOpenEdit(false);
                  setSelectedType(null);
                }}
                disabled={updateLoading}
              >
                ยกเลิก
              </button>

              <button
                className={styles.submit}
                onClick={handleUpdate}
                disabled={updateLoading}
              >
                {updateLoading ? "กำลังบันทึก..." : "บันทึกการแก้ไข"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD MODAL */}
      {openAdd && (
        <div
          className={styles.modalOverlay}
          onClick={() => {
            setOpenAdd(false);
            setTypeName("");
          }}
        >
          <div
            className={styles.deleteModal}
            onClick={(e) => e.stopPropagation()}
          >
            <h4 className={styles.textadd}>เพิ่มประเภทขยะ</h4>

            <div style={{ marginTop: "1rem" }}>
              <input
                type="text"
                value={typeName}
                onChange={(e) => setTypeName(e.target.value)}
                placeholder="กรอกชื่อประเภทขยะ"
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "8px",
                  border: "1px solid #ccc",
                }}
              />
            </div>

            <div
              className={styles.deleteActions}
              style={{ marginTop: "1.5rem" }}
            >
              <button
                className={styles.cancelBtn}
                onClick={() => {
                  setOpenAdd(false);
                  setTypeName("");
                }}
                disabled={createLoading}
              >
                ยกเลิก
              </button>

              <button
                className={styles.submit}
                onClick={handleCreate}
                disabled={createLoading}
              >
                {createLoading ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
