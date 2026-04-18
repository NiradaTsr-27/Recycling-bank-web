"use client";

import { useEffect, useState } from "react";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import styles from "@/styles/pages/admin/adminNews.module.css";
import AdminNavbar from "@/components/navbar/AdminNavbar";

type Announcement = {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  newsstatus: "PUBLISHED" | "HIDDEN";
};

export default function AdminPRPage() {
  //////////////////////////////////////////////////////
  // STATE
  //////////////////////////////////////////////////////

  const [data, setData] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  const [openModal, setOpenModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Announcement | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [actionLoading, setActionLoading] = useState(false);

  const [formData, setFormData] = useState<{
    title: string;
    content: string;
    newsstatus: "PUBLISHED" | "HIDDEN";
  }>({
    title: "",
    content: "",
    newsstatus: "PUBLISHED",
  });

  //////////////////////////////////////////////////////
  // FETCH
  //////////////////////////////////////////////////////

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/news");
      if (!res.ok) throw new Error();

      const result = await res.json();

      // normalize กันค่าหลุด
      const normalized = result.map((item: any) => ({
        ...item,
        newsstatus: item.newsstatus === "HIDDEN" ? "HIDDEN" : "PUBLISHED",
      }));

      setData(normalized);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  //////////////////////////////////////////////////////
  // FORM
  //////////////////////////////////////////////////////

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const resetForm = () => {
    setFormData({
      title: "",
      content: "",
      newsstatus: "PUBLISHED",
    });
    setEditId(null);
  };

  //////////////////////////////////////////////////////
  // SUBMIT
  //////////////////////////////////////////////////////

  const handleSubmit = async () => {
    try {
      setActionLoading(true);

      const method = editId ? "PATCH" : "POST";
      const url = editId ? `/api/admin/news/${editId}` : `/api/admin/news`;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          content: formData.content,
          newsstatus: formData.newsstatus,
          createdBy: 1,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message);
      }

      await fetchAnnouncements();
      setOpenModal(false);
      resetForm();
    } catch (err) {
      alert("เกิดข้อผิดพลาดในการบันทึก");
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  //////////////////////////////////////////////////////
  // EDIT
  //////////////////////////////////////////////////////

  const handleEdit = (item: Announcement) => {
    setEditId(item.id);
    setFormData({
      title: item.title,
      content: item.content,
      newsstatus: item.newsstatus,
    });
    setOpenModal(true);
  };

  //////////////////////////////////////////////////////
  // DELETE
  //////////////////////////////////////////////////////

  const handleDeleteClick = (item: Announcement) => {
    setItemToDelete(item);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      setDeleteLoading(true);

      const res = await fetch(`/api/admin/news/${itemToDelete.id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error();

      await fetchAnnouncements();
      setShowDeleteModal(false);
      setItemToDelete(null);
    } catch {
      alert("ลบไม่สำเร็จ");
    } finally {
      setDeleteLoading(false);
    }
  };

  //////////////////////////////////////////////////////
  // FORMAT DATE
  //////////////////////////////////////////////////////

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("th-TH");
  };

  //////////////////////////////////////////////////////
  // RENDER
  //////////////////////////////////////////////////////

  return (
    <>
      <AdminNavbar />

      <div className={styles.container}>
        <div className={styles.header}>
          <h1>จัดการประกาศ</h1>
          <button
            className={styles.addBtn}
            onClick={() => {
              resetForm();
              setOpenModal(true);
            }}
          >
            <FaPlus /> เพิ่มประกาศ
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
                    <th>หัวข้อ</th>
                    <th>วันที่เผยแพร่</th>
                    <th>รายละเอียด</th>
                    <th>สถานะ</th>
                    <th>อัปเดต</th>
                    <th>จัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((news) => (
                    <tr key={news.id}>
                      <td>{news.id}</td>
                      <td>{news.title}</td>
                      <td>{formatDate(news.createdAt)}</td>
                      <td>{news.content}</td>

                      <td>
                        <span
                          className={
                            news.newsstatus === "PUBLISHED"
                              ? styles.activeBadge
                              : styles.inactiveBadge
                          }
                        >
                          {news.newsstatus === "PUBLISHED" ? "เผยแพร่" : "ซ่อน"}
                        </span>
                      </td>
                      <td>{formatDate(news.updatedAt)}</td>

                      <td className={styles.actions}>
                        <button
                          className={`${styles.iconBtn} ${styles.edit}`}
                          onClick={() => handleEdit(news)}
                        >
                          <FaEdit />
                        </button>

                        <button
                          className={`${styles.iconBtn} ${styles.delete}`}
                          onClick={() => handleDeleteClick(news)}
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
                คุณต้องการลบประกาศ
                <br />
                <strong>{itemToDelete?.title}</strong>
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

        {/* ADD / EDIT MODAL */}
        {openModal && (
          <div
            className={styles.modalOverlay}
            onClick={() => setOpenModal(false)}
          >
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <h2>{editId ? "แก้ไขประชาสัมพันธ์" : "เพิ่มประชาสัมพันธ์"}</h2>

              <div className={styles.formGroup}>
                <label>
                  หัวข้อประชาสัมพันธ์{" "}
                  <span style={{ color: "red" }}>*</span>{" "}
                </label>
                <input
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>
                  รายละเอียด <span style={{ color: "red" }}>*</span>
                </label>
                <textarea
                  name="content"
                  rows={4}
                  value={formData.content}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>สถานะ</label>
                <div className={styles.statusButtons}>
                  <button
                    type="button"
                    className={
                      formData.newsstatus === "PUBLISHED"
                        ? styles.activeStatus
                        : styles.inactiveStatus
                    }
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        newsstatus: "PUBLISHED",
                      }))
                    }
                  >
                    เผยแพร่
                  </button>

                  <button
                    type="button"
                    className={
                      formData.newsstatus === "HIDDEN"
                        ? styles.activeStatus
                        : styles.inactiveStatus
                    }
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        newsstatus: "HIDDEN",
                      }))
                    }
                  >
                    ซ่อน
                  </button>
                </div>
              </div>

              <div className={styles.modalActions}>
                <button
                  className={styles.cancel}
                  onClick={() => setOpenModal(false)}
                >
                  ยกเลิก
                </button>

                <button
                  className={styles.submit}
                  onClick={handleSubmit}
                  disabled={actionLoading}
                >
                  {actionLoading ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
