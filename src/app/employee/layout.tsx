import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
export const dynamic = "force-dynamic";
import { redirect } from "next/navigation";

export default async function EmployeeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  if (session.user.role !== "EMPLOYEE") {
    redirect("/");
  }

  return <>{children}</>;
}
