// Client-side auth API calls beyond what the existing auth.ts covers:
// register, verify email, forgot password, reset password.
// Kept in a separate file so the existing `authService` is untouched.
import { apiPost } from "@/lib/api/client";

export interface RegisterInput {
  email: string;
  password: string;
  firsName: string;
  lastName: string;
  organizationName?: string;   // optional: create-org-on-signup flow
  invitationToken?: string;    // optional: join-org flow
}

export const authExtras = {
  register: (input: RegisterInput) =>
    apiPost("/api/auth/register", input),

  verifyEmail: (token: string) =>
    apiPost("/api/auth/verify-email", { token }),

  resendVerification: (email: string) =>
    apiPost("/api/auth/resend-verification", { email }),

  forgotPassword: (email: string) =>
    apiPost("/api/auth/forgot-password", { email }),

  resetPassword: (token: string, password: string) =>
    apiPost("/api/auth/reset-password", { token, password }),

  changePassword: (currentPassword: string, newPassword: string) =>
    apiPost("/api/auth/change-password", { currentPassword, newPassword }),
};
