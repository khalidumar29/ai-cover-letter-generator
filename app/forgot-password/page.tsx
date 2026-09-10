import Link from "next/link";

import AuthShell from "../shared/auth-shell";
import ForgotPasswordForm from "./forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title="Reset your password"
      description="Enter the email address on your account and we'll send you a link to choose a new password."
      footer={
        <>
          Remembered it?{" "}
          <Link
            href="/login"
            className="font-semibold text-[#5D4EEA] hover:text-[#6D5DFB] focus-ring rounded-md"
          >
            Back to log in
          </Link>
        </>
      }
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
