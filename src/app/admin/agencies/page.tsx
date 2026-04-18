export const dynamic = "force-dynamic";

import dynamicImport from "next/dynamic";

const AdminAgenciesClient = dynamicImport(
  () => import("./AdminAgenciesClient"),
  { ssr: false }
);

export default function AdminAgenciesPage() {
  return <AdminAgenciesClient />;
}