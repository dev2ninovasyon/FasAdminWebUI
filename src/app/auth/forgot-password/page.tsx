"use client";

import AuthPageShell from "../AuthPageShell";
import ForgotPasswordForm from "../authForms/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <AuthPageShell
      title="Sifremi Unuttum"
      description="Kayitli e-posta adresinizi girin, size tek kullanimlik bir sifre sifirlama baglantisi gonderelim."
    >
      <ForgotPasswordForm />
    </AuthPageShell>
  );
}
