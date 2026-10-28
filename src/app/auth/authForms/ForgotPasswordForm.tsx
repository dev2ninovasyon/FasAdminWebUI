"use client";

import { url } from "@/api/apiBase";
import CustomFormLabel from "@/app/components/Forms/ThemeElements/CustomFormLabel";
import CustomTextField from "@/app/components/Forms/ThemeElements/CustomTextField";
import { Alert, Box, Button, Stack } from "@mui/material";
import { IconArrowLeft, IconMail, IconSend } from "@tabler/icons-react";
import Link from "next/link";
import { FormEvent, useState } from "react";

const genericMessage =
  "Eğer e-posta adresi sistemde kayıtlıysa, şifre sıfırlama bağlantısı gönderilecektir.";

async function readMessage(response: Response): Promise<string> {
  try {
    const body = await response.clone().json();
    return body?.message || body?.Message || genericMessage;
  } catch {
    return genericMessage;
  }
}

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");
    setError("");

    const normalizedEmail = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError("Lütfen geçerli bir e-posta adresi girin.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`${url}/Auth/forgot-password`, {
        method: "POST",
        headers: { accept: "*/*", "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail }),
      });
      const responseMessage = await readMessage(response);
      if (!response.ok) {
        throw new Error(responseMessage);
      }
      setMessage(responseMessage || genericMessage);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "İstek gönderilemedi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <Stack spacing={2}>
          <Box>
            <CustomFormLabel htmlFor="forgot-password-email">E-posta</CustomFormLabel>
            <CustomTextField
              id="forgot-password-email"
              type="email"
              fullWidth
              autoComplete="email"
              value={email}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => setEmail(event.target.value)}
              InputProps={{ startAdornment: <IconMail size={20} /> }}
            />
          </Box>
          {message ? <Alert severity="success">{message}</Alert> : null}
          {error ? <Alert severity="error">{error}</Alert> : null}
          <Button
            type="submit"
            variant="contained"
            size="large"
            fullWidth
            disabled={isSubmitting}
            startIcon={<IconSend size={18} />}
          >
            {isSubmitting ? "Gönderiliyor..." : "Şifre sıfırlama bağlantısı gönder"}
          </Button>
        </Stack>
      </form>
      <Button component={Link} href="/" variant="text" startIcon={<IconArrowLeft size={18} />} sx={{ mt: 2 }}>
        Giriş ekranına dön
      </Button>
    </>
  );
}
