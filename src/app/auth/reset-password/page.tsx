import AuthPageShell from "../AuthPageShell";
import ResetPasswordForm from "../authForms/ResetPasswordForm";

export default function ResetPasswordPage() {
  return (
    <AuthPageShell
      title="Yeni şifre belirle"
      description="Şifre sıfırlama bağlantınızla hesabınız için yeni bir şifre oluşturun."
    >
      <ResetPasswordForm />
    </AuthPageShell>
  );
}
