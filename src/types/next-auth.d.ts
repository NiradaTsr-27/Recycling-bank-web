import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      username: string;
      email: string;
      role: string;
      employeeId?: number;
    };
  }

  interface User {
    role: string;
    employeeId?: number;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    username: string;
    employeeId?: number;
  }
}
