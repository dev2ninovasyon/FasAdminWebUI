"use client";

import AuthPageShell from "../AuthPageShell";
import ResetPasswordForm from "../authForms/ResetPasswordForm";

export default function ResetPasswordPage() {
  return (
    <AuthPageShell
      title="Yeni Sifre Belirle"
      description="Simdi hesabiniz icin yeni bir sifre olusturabilirsiniz."
    >
      <ResetPasswordForm />
    </AuthPageShell>
  );
}
