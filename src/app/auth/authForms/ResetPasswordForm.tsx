"use client";

import { url } from "@/api/apiBase";
import CustomFormLabel from "@/app/components/Forms/ThemeElements/CustomFormLabel";
import CustomTextField from "@/app/components/Forms/ThemeElements/CustomTextField";
import { validatePassword } from "@/utils/passwordPolicy";
import { Alert, Box, Button, CircularProgress, Stack } from "@mui/material";
import { IconArrowLeft, IconKey, IconLock } from "@tabler/icons-react";
import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";

interface TokenState {
  checked: boolean;
  valid: boolean;
  message?: string;
}

async function readMessage(response: Response): Promise<string> {
  try {
    const body = await response.clone().json();
    return body?.message || body?.Message || "İşlem tamamlanamadı.";
  } catch {
    return "İşlem tamamlanamadı.";
  }
}

export default function ResetPasswordForm() {
  const [token, setToken] = useState("");
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [tokenState, setTokenState] = useState<TokenState>({ checked: false, valid: false });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setToken(params.get("token")?.trim() || "");
    setEmail(params.get("email")?.trim() || "");
  }, []);

  useEffect(() => {
    if (!token) {
      setTokenState({ checked: true, valid: false, message: "Şifre sıfırlama bağlantısı eksik veya hatalı." });
      return;
    }

    let cancelled = false;
    const validateToken = async () => {
      try {
        const response = await fetch(`${url}/Auth/validate-reset-password-token`, {
          method: "POST",
          headers: { accept: "*/*", "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        if (!response.ok) {
          throw new Error(await readMessage(response));
        }
        const body = await response.json();
        if (!cancelled) {
          setTokenState({ checked: true, valid: Boolean(body?.data?.isValid ?? body?.isValid) });
        }
      } catch (error) {
        if (!cancelled) {
          setTokenState({
            checked: true,
            valid: false,
            message: error instanceof Error ? error.message : "Bağlantı doğrulanamadı.",
          });
        }
      }
    };
    void validateToken();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const passwordError = useMemo(
    () => (newPassword ? validatePassword(newPassword, email) : ""),
    [email, newPassword]
  );
  const passwordsMatch = !confirmPassword || newPassword === confirmPassword;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!tokenState.valid) return;
    if (passwordError || !passwordsMatch) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`${url}/Auth/reset-password`, {
        method: "POST",
        headers: { accept: "*/*", "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword, confirmPassword }),
      });
      const message = await readMessage(response);
      if (!response.ok) throw new Error(message);
      setSuccessMessage(message || "Şifreniz başarıyla güncellendi.");
    } catch (error) {
      setTokenState((current) => ({ ...current, message: error instanceof Error ? error.message : "Şifre güncellenemedi." }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {!tokenState.checked ? <CircularProgress size={24} sx={{ mb: 2 }} /> : null}
      {tokenState.checked && !tokenState.valid ? (
        <Alert severity="error" sx={{ mb: 2 }}>{tokenState.message || "Bağlantı geçersiz veya süresi dolmuş."}</Alert>
      ) : null}
      {tokenState.valid && !successMessage ? (
        <form onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <Box>
              <CustomFormLabel htmlFor="reset-password">Yeni şifre</CustomFormLabel>
              <CustomTextField
                id="reset-password"
                type="password"
                fullWidth
                autoComplete="new-password"
                value={newPassword}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => setNewPassword(event.target.value)}
                error={Boolean(passwordError)}
                helperText={passwordError || "10-20 karakter; büyük/küçük harf, rakam ve özel karakter içermelidir."}
                InputProps={{ startAdornment: <IconLock size={20} /> }}
              />
            </Box>
            <Box>
              <CustomFormLabel htmlFor="reset-password-confirm">Yeni şifre tekrar</CustomFormLabel>
              <CustomTextField
                id="reset-password-confirm"
                type="password"
                fullWidth
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(event.target.value)}
                error={!passwordsMatch}
                helperText={!passwordsMatch ? "Şifreler birbiriyle uyuşmuyor." : " "}
                InputProps={{ startAdornment: <IconKey size={20} /> }}
              />
            </Box>
            <Button type="submit" variant="contained" size="large" disabled={isSubmitting || Boolean(passwordError) || !passwordsMatch}>
              {isSubmitting ? "Güncelleniyor..." : "Yeni şifreyi kaydet"}
            </Button>
          </Stack>
        </form>
      ) : null}
      {successMessage ? <Alert severity="success">{successMessage} Giriş ekranından devam edebilirsiniz.</Alert> : null}
      <Button component={Link} href="/" variant="text" startIcon={<IconArrowLeft size={18} />} sx={{ mt: 2 }}>
        Giriş ekranına dön
      </Button>
    </>
  );
}
