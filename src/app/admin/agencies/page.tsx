import dynamic from "next/dynamic";

const AdminAgenciesClient = dynamic(() => import("./AdminAgenciesClient"), {
  ssr: false,
});

export default function AdminAgenciesPage() {
  return <AdminAgenciesClient />;
}
