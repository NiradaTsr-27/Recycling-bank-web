import NavbarPublic from "@/components/navbar/NavbarPublic";

export default function UnauthorizedPage() {
  return (
    <>
      <NavbarPublic />
      <div style={{ textAlign: "center", marginTop: "100px" }}>
        <h1>403 - ไม่มีสิทธิ์เข้าถึงหน้านี้</h1>
      </div>
    </>
  );
}
