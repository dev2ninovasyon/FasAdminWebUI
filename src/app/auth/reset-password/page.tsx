import type { Metadata } from "next";
import AuthPageShell from "../AuthPageShell";
import ResetPasswordForm from "../authForms/ResetPasswordForm";

export const metadata: Metadata = {
  title: "Yeni Şifre Belirle",
  description: "Şimdi hesabınız için yeni bir şifre oluşturabilirsiniz.",
};

export default function ResetPasswordPage() {
  return (
    <AuthPageShell
      title="Yeni Şifre Belirle"
      description="Şimdi hesabınız için yeni bir şifre oluşturabilirsiniz."
    >
      <ResetPasswordForm />
    </AuthPageShell>
  );
}
