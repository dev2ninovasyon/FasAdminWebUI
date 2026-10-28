"use client";

import AuthPageShell from "../AuthPageShell";
import ForgotPasswordForm from "../authForms/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <AuthPageShell
      title="Şifremi Unuttum"
      description="Kayıtlı e-posta adresinizi girin, size tek kullanımlık bir şifre sıfırlama bağlantısı gönderelim."
    >
      <ForgotPasswordForm />
    </AuthPageShell>
  );
}
