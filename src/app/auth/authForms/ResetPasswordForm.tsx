"use client";

import { apiFetch } from "@/api/apiBase";
import CustomFormLabel from "@/app/components/Forms/ThemeElements/CustomFormLabel";
import CustomTextField from "@/app/components/Forms/ThemeElements/CustomTextField";
import PasswordPolicyChecker from "@/components/PasswordPolicy/PasswordPolicyChecker";
import { validatePassword } from "@/utils/passwordPolicy";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  Link as MuiLink,
  Popper,
  Stack,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { IconArrowLeft, IconInfoCircle, IconKey, IconLock } from "@tabler/icons-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { enqueueSnackbar } from "notistack";
import { useEffect, useMemo, useRef, useState } from "react";

interface ValidationState {
  checked: boolean;
  valid: boolean;
  expiresAt?: string | null;
  message?: string;
}

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const theme = useTheme();
  const token = searchParams.get("token")?.trim() || "";
  const email = searchParams.get("email")?.trim() || "";
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validation, setValidation] = useState<ValidationState>({ checked: false, valid: false });
  const [successMessage, setSuccessMessage] = useState("");
  const [policyAnchorEl, setPolicyAnchorEl] = useState<HTMLElement | null>(null);
  const passwordFieldRef = useRef<HTMLDivElement | null>(null);
  const passwordInputRef = useRef<HTMLInputElement | null>(null);

  const passwordValidationMessage = useMemo(
    () => (newPassword ? validatePassword(newPassword, email) : ""),
    [email, newPassword]
  );

  const passwordsMatch = useMemo(
    () => !confirmPassword || newPassword === confirmPassword,
    [newPassword, confirmPassword]
  );

  const isPolicyOpen = Boolean(policyAnchorEl);

  const handlePolicyOpen = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();
    setPolicyAnchorEl(passwordFieldRef.current ?? event.currentTarget);
    requestAnimationFrame(() => {
      passwordInputRef.current?.focus();
    });
  };

  const handlePolicyClose = () => {
    setPolicyAnchorEl(null);
  };

  useEffect(() => {
    if (newPassword && passwordFieldRef.current) {
      setPolicyAnchorEl(passwordFieldRef.current);
      return;
    }

    setPolicyAnchorEl(null);
  }, [newPassword]);

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setValidation({
          checked: true,
          valid: false,
          message: "Şifre sıfırlama bağlantısı eksik veya hatalı görünüyor.",
        });
        return;
      }

      try {
        const response = await apiFetch("/Auth/validate-reset-password-token", {
          method: "POST",
          headers: {
            accept: "*/*",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
          suppressErrorLog: true,
        });

        let parsed: any = null;
        let errorMessage = "Bağlantı doğrulanamadı.";

        if (!response.ok) {
          try {
            const text = await response.text();

            try {
              const errorParsed = JSON.parse(text);
              errorMessage = errorParsed?.message || errorParsed?.Message || text.substring(0, 100);
            } catch {
              errorMessage = text.substring(0, 100) || "Sunucu hatası.";
            }
          } catch {
            errorMessage = "Yanıt ayrıştırılamadı.";
          }

          setValidation({ checked: true, valid: false, message: errorMessage });
          return;
        }

        try {
          parsed = await response.json();
        } catch {
          errorMessage = "Yanıt ayrıştırılamadı.";
        }

        setValidation({
          checked: true,
          valid: !!parsed?.isValid,
          expiresAt: parsed?.expiresAt,
        });
      } catch (error: any) {
        setValidation({
          checked: true,
          valid: false,
          message: error?.message || "Bağlantı doğrulanırken bir hata oluştu.",
        });
      }
    };

    void validateToken();
  }, [token]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!validation.valid) {
      enqueueSnackbar("Şifre sıfırlama bağlantısı geçerli değil.", {
        variant: "warning",
        autoHideDuration: 4000,
      });
      return;
    }

    if (!newPassword || !confirmPassword) {
      enqueueSnackbar("Lütfen yeni şifrenizi ve tekrarını girin.", {
        variant: "warning",
        autoHideDuration: 4000,
      });
      return;
    }

    if (!passwordsMatch) {
      enqueueSnackbar("Şifreler birbiriyle uyuşmuyor.", {
        variant: "warning",
        autoHideDuration: 4000,
      });
      return;
    }

    if (passwordValidationMessage) {
      enqueueSnackbar(passwordValidationMessage, {
        variant: "warning",
        autoHideDuration: 5000,
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await apiFetch("/Auth/reset-password", {
        method: "POST",
        headers: {
          accept: "*/*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          newPassword,
          confirmPassword,
        }),
        suppressErrorLog: true,
      });

      let parsedMessage = "";

      try {
        const parsed = await response.json();
        parsedMessage = parsed.message || parsed.Message || "";
      } catch {
        parsedMessage = "";
      }

      if (!response.ok) {
        throw new Error(parsedMessage || "Şifre güncellenemedi.");
      }

      const message = parsedMessage || "Şifreniz başarıyla güncellendi.";
      setSuccessMessage(message);
      enqueueSnackbar(message, { variant: "success", autoHideDuration: 5000 });

      setTimeout(() => {
        router.replace("/");
      }, 1800);
    } catch (error: any) {
      enqueueSnackbar(error?.message || "Şifre güncellenemedi.", {
        variant: "error",
        autoHideDuration: 5000,
        style: {
          backgroundColor: theme.palette.error.main,
          maxWidth: "720px",
        },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!validation.checked) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" gap={2} py={4}>
        <CircularProgress />
        <Typography variant="body2" color="text.secondary">
          Şifre sıfırlama bağlantısı doğrulanıyor...
        </Typography>
      </Box>
    );
  }

  if (!validation.valid) {
    return (
      <Stack spacing={3}>
        <Alert severity="error" sx={{ borderRadius: 3 }}>
          {validation.message || "Şifre sıfırlama bağlantısı geçersiz veya süresi dolmuş."}
        </Alert>
        <MuiLink
          component={Link}
          href="/auth/forgot-password"
          underline="none"
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 1,
            fontWeight: 600,
            color: "primary.main",
          }}
        >
          <IconArrowLeft size={18} />
          Yeni bir bağlantı iste
        </MuiLink>
      </Stack>
    );
  }

  return (
    <>
      <form onSubmit={handleSubmit}>
        <Stack spacing={2.5}>
          {email ? (
            <Alert severity="info" sx={{ borderRadius: 3 }}>
              {email} hesabı için yeni şifre belirliyorsunuz.
            </Alert>
          ) : null}

          <Box ref={passwordFieldRef}>
            <CustomFormLabel htmlFor="reset-password">Yeni Şifre</CustomFormLabel>
            <CustomTextField
              id="reset-password"
              type="password"
              variant="outlined"
              fullWidth
              inputRef={passwordInputRef}
              placeholder="Yeni şifreniz"
              value={newPassword}
              onChange={(event: any) => setNewPassword(event.target.value)}
              error={!!newPassword && !!passwordValidationMessage}
              helperText={newPassword ? passwordValidationMessage || "Güçlü bir şifre girdiniz." : " "}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <IconLock size={20} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <Tooltip title="Şifre kriterlerini göster">
                      <IconButton
                        edge="end"
                        size="small"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={handlePolicyOpen}
                      >
                        <IconInfoCircle size={18} />
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          <Box>
            <CustomFormLabel htmlFor="reset-password-confirm">Yeni Şifre Tekrar</CustomFormLabel>
            <CustomTextField
              id="reset-password-confirm"
              type="password"
              variant="outlined"
              fullWidth
              placeholder="Yeni şifrenizi tekrar girin"
              value={confirmPassword}
              onChange={(event: any) => setConfirmPassword(event.target.value)}
              error={!!confirmPassword && !passwordsMatch}
              helperText={!passwordsMatch ? "Şifreler birbiriyle uyuşmuyor." : " "}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <IconKey size={20} />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          {successMessage ? (
            <Stack spacing={2}>
              <Alert severity="success" sx={{ borderRadius: 3 }}>
                <Box component="div" sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {successMessage}
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: "success.dark", mb: 1 }}>
                  Yeni şifrenizle giriş yapabilirsiniz.
                </Typography>
                <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>
                  Bu şifre sıfırlama bağlantısı artık kullanılamaz.
                </Typography>
              </Alert>
              <Typography
                variant="body2"
                sx={{ textAlign: "center", color: "text.secondary", fontStyle: "italic" }}
              >
                Giriş ekranına yönlendiriliyorsunuz...
              </Typography>
            </Stack>
          ) : null}

          <Button
            type="submit"
            color="primary"
            variant="contained"
            size="large"
            fullWidth
            disabled={isSubmitting || !!successMessage}
            sx={{
              background: "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
              boxShadow: "0 3px 5px 2px rgba(33, 203, 243, .3)",
              color: "white",
              height: 48,
              px: 4,
              fontSize: "1.05rem",
              textTransform: "none",
              borderRadius: "10px",
            }}
          >
            {isSubmitting ? "Şifre Güncelleniyor..." : "Yeni Şifreyi Kaydet"}
          </Button>
        </Stack>
      </form>

      <Popper
        open={isPolicyOpen}
        anchorEl={policyAnchorEl}
        placement="right-start"
        modifiers={[
          {
            name: "offset",
            options: {
              offset: [12, 0],
            },
          },
        ]}
        sx={{
          zIndex: theme.zIndex.modal + 1,
          pointerEvents: "none",
        }}
      >
        <Box
          sx={{
            p: 1,
            width: { xs: "calc(100vw - 48px)", sm: 420 },
            maxWidth: 420,
            borderRadius: 3,
            boxShadow: "0 20px 50px rgba(15, 23, 42, 0.18)",
            overflow: "hidden",
            bgcolor: "background.paper",
          }}
        >
          <PasswordPolicyChecker password={newPassword} email={email} showEmail={true} borderless />
        </Box>
      </Popper>

      <Box mt={3}>
        <MuiLink
          component={Link}
          href="/"
          underline="none"
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 1,
            fontWeight: 600,
            color: "primary.main",
          }}
        >
          <IconArrowLeft size={18} />
          Giriş ekranına dön
        </MuiLink>
      </Box>
    </>
  );
}
