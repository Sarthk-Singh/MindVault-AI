import type { UserRole } from "@prisma/client";

declare global {
  namespace Express {
    interface User {
      id: string;
      email: string;
      role: UserRole;
      accessToken?: string;
      refreshToken?: string;
    }
  }
}

export {};
