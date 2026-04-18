import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function requireEmployee() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "EMPLOYEE") {
    throw new Error("Unauthorized");
  }

  return session;
}
