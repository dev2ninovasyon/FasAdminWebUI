import AuthPageShell from "../AuthPageShell";
import ForgotPasswordForm from "../authForms/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <AuthPageShell
      title="Şifremi unuttum"
      description="Kayıtlı e-posta adresinize güvenli bir şifre sıfırlama bağlantısı gönderelim."
    >
      <ForgotPasswordForm />
    </AuthPageShell>
  );
}
