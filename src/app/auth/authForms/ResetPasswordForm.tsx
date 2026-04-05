"use client";

import { apiFetch } from "@/api/apiBase";
import { passwordRules, validatePassword } from "@/utils/passwordPolicy";
import CustomFormLabel from "@/app/components/Forms/ThemeElements/CustomFormLabel";
import CustomTextField from "@/app/components/Forms/ThemeElements/CustomTextField";
import PasswordPolicyChecker from "@/components/PasswordPolicy/PasswordPolicyChecker";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  InputAdornment,
  Link as MuiLink,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import { IconArrowLeft, IconKey, IconLock } from "@tabler/icons-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { enqueueSnackbar } from "notistack";
import { useEffect, useMemo, useState } from "react";

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
  const passwordValidationMessage = useMemo(
    () => (newPassword ? validatePassword(newPassword, email) : ""),
    [email, newPassword]
  );
  const passwordsMatch = useMemo(
    () => !confirmPassword || newPassword === confirmPassword,
    [newPassword, confirmPassword]
  );

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setValidation({
          checked: true,
          valid: false,
          message: "Sifre sifirlama baglantisi eksik veya hatali gorunuyor.",
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
        let errorMessage = "Baglanti dogrulanamadi.";

        // Response OK değilse, text veya JSON read
        if (!response.ok) {
          try {
            const text = await response.text();
            
            // Text'i JSON'a çevirmeyi dene
            try {
              const errorParsed = JSON.parse(text);
              errorMessage = errorParsed?.message || errorParsed?.Message || text.substring(0, 100);
            } catch {
              // JSON değilse, text'in ilk 100 karakterini mesaj yap
              errorMessage = text.substring(0, 100) || "Sunucu hatasi.";
            }
          } catch {
            errorMessage = "Yanit ayristirilamadi.";
          }
          
          setValidation({ checked: true, valid: false, message: errorMessage });
          return;
        }

        // Response OK ise, JSON oku
        try {
          parsed = await response.json();
        } catch {
          errorMessage = "Yanit ayristirilamadi.";
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
          message: error?.message || "Baglanti dogrulanirken bir hata olustu.",
        });
      }
    };

    void validateToken();
  }, [token]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!validation.valid) {
      enqueueSnackbar("Sifre sifirlama baglantisi gecerli degil.", { variant: "warning", autoHideDuration: 4000 });
      return;
    }

    if (!newPassword || !confirmPassword) {
      enqueueSnackbar("Lutfen yeni sifrenizi ve tekrarini girin.", { variant: "warning", autoHideDuration: 4000 });
      return;
    }

    if (!passwordsMatch) {
      enqueueSnackbar("Sifreler birbiriyle uyusmuyor.", { variant: "warning", autoHideDuration: 4000 });
      return;
    }

    if (passwordValidationMessage) {
      enqueueSnackbar(passwordValidationMessage, { variant: "warning", autoHideDuration: 5000 });
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
        throw new Error(parsedMessage || "Sifre guncellenemedi.");
      }

      const message = parsedMessage || "Sifreniz basariyla guncellendi.";
      setSuccessMessage(message);
      enqueueSnackbar(message, { variant: "success", autoHideDuration: 5000 });

      setTimeout(() => {
        router.replace("/");
      }, 1800);
    } catch (error: any) {
      enqueueSnackbar(error?.message || "Sifre guncellenemedi.", {
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
          Sifre sifirlama baglantisi dogrulaniyor...
        </Typography>
      </Box>
    );
  }

  if (!validation.valid) {
    return (
      <Stack spacing={3}>
        <Alert severity="error" sx={{ borderRadius: 3 }}>
          {validation.message || "Sifre sifirlama baglantisi gecersiz veya suresi dolmus."}
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
          Yeni bir baglanti iste
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
              {email} hesabi icin yeni sifre belirliyorsunuz.
            </Alert>
          ) : null}

          {validation.expiresAt ? (
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Bu baglanti {new Date(validation.expiresAt).toLocaleString("tr-TR")} tarihine kadar gecerlidir.
            </Typography>
          ) : null}

          <Alert severity={passwordValidationMessage ? "warning" : "info"} sx={{ borderRadius: 3 }}>
            <Typography variant="body2" sx={{ fontWeight: 700, mb: 1 }}>
              Sifre kurallari
            </Typography>
            <Box component="ul" sx={{ pl: 2.5, my: 0 }}>
              {passwordRules.map((rule) => (
                <Typography key={rule} component="li" variant="body2" sx={{ color: "text.secondary", mb: 0.5 }}>
                  {rule}
                </Typography>
              ))}
            </Box>
            {passwordValidationMessage ? (
              <Typography variant="body2" sx={{ mt: 1, fontWeight: 600 }}>
                {passwordValidationMessage}
              </Typography>
            ) : null}
          </Alert>

          <Box>
            <CustomFormLabel htmlFor="reset-password">Yeni Sifre</CustomFormLabel>
            <CustomTextField
              id="reset-password"
              type="password"
              variant="outlined"
              fullWidth
              placeholder="Yeni sifreniz"
              value={newPassword}
              onChange={(event: any) => setNewPassword(event.target.value)}
              error={!!newPassword && !!passwordValidationMessage}
              helperText={newPassword ? passwordValidationMessage || "Guclu bir sifre girdiniz." : " "}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <IconLock size={20} />
                  </InputAdornment>
                ),
              }}
            />
            
            {/* Şifre Politikası Göstergesi */}
            <PasswordPolicyChecker password={newPassword} email={email} showEmail={true} />
          </Box>

          <Box>
            <CustomFormLabel htmlFor="reset-password-confirm">Yeni Sifre Tekrar</CustomFormLabel>
            <CustomTextField
              id="reset-password-confirm"
              type="password"
              variant="outlined"
              fullWidth
              placeholder="Yeni sifrenizi tekrar girin"
              value={confirmPassword}
              onChange={(event: any) => setConfirmPassword(event.target.value)}
              error={!!confirmPassword && !passwordsMatch}
              helperText={!passwordsMatch ? "Sifreler birbiriyle uyusmuyor." : " "}
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
                <Box component="div" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    ✅ {successMessage}
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: "success.dark", mb: 1 }}>
                  Yeni sifrenizle giris yapabilirsiniz.
                </Typography>
                <Typography variant="caption" sx={{ color: "text.secondary", display: 'block' }}>
                  Ⓘ Bu sifre sifirlama baglantisi artik kullanilamaz. Baska bir sifirlama isteginde bulunmak isterseniz oturum actiktan sonra "Sifremi Unuttum" seçenegini kullanabilirsiniz.
                </Typography>
              </Alert>
              <Typography variant="body2" sx={{ textAlign: "center", color: "text.secondary", fontStyle: "italic" }}>
                Giris ekranina yonlendiriliyorsunuz...
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
              padding: "0 30px",
              fontSize: "1.05rem",
              textTransform: "none",
              borderRadius: "10px",
            }}
          >
            {isSubmitting ? "Sifre Guncelleniyor..." : "Yeni Sifreyi Kaydet"}
          </Button>
        </Stack>
      </form>

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
          Giris ekranina don
        </MuiLink>
      </Box>
    </>
  );
}
