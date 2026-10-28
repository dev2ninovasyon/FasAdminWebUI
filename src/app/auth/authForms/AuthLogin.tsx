import { Box, Typography, Stack, useTheme, InputAdornment, Link as MuiLink } from "@mui/material";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LoadingButton } from "@mui/lab";
import { IconMail, IconLock, IconShieldLock } from "@tabler/icons-react";
import { useDispatch, useSelector } from "@/store/hooks";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import { setUserData, setBddkmi } from "@/store/user/UserSlice";
import { apiFetch } from "@/api/apiBase";
import { enqueueSnackbar } from "notistack";
import { AppState } from "@/store/store";
import { getDenetciOdemeBilgileri } from "@/api/DenetciIslemleri/DenetciIslemleri";
import CustomFormLabel from "@/app/components/Forms/ThemeElements/CustomFormLabel";
import CustomTextField from "@/app/components/Forms/ThemeElements/CustomTextField";

interface LoginType {
  title?: string;
  subtitle?: React.ReactNode;
  subtext?: React.ReactNode;
}

const AuthLogin: React.FC<LoginType> = ({ title, subtitle, subtext }) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const customizer = useSelector((state: AppState) => state.customizer);
  const theme = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [requiresOtp, setRequiresOtp] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isVerifyingCaptcha, setIsVerifyingCaptcha] = useState(false);
  const { executeRecaptcha } = useGoogleReCaptcha();
  const isLocalHost =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

  const handleLogin = async () => {
    if (!isLocalHost && !executeRecaptcha) {
      enqueueSnackbar("Recaptcha yuklenemedi, lutfen sayfayi yenileyin.", {
        variant: "warning",
        autoHideDuration: 3000,
      });
      setIsLoggedIn(false);
      return;
    }

    setIsVerifyingCaptcha(true);
    let token = "";

    try {
      if (isLocalHost) {
        token = "BYPASS_RECAPTCHA_TEST";
      } else {
        const runRecaptcha = executeRecaptcha;
        if (!runRecaptcha) {
          throw new Error("Recaptcha fonksiyonu hazir degil.");
        }

        token = await runRecaptcha("login");
      }
    } catch (error: any) {
      let errorMessage = "Güvenlik doğrulaması sırasında bir hata oluştu.";

      if (error?.message?.includes("message channel closed")) {
        errorMessage =
          "Tarayıcı eklentileriniz güvenlik doğrulamasını engelliyor olabilir. Lütfen reklam engelleyici veya benzeri eklentileri kapatıp tekrar deneyin.";
      }

      enqueueSnackbar(errorMessage, {
        variant: "error",
        autoHideDuration: 5000,
      });
      setIsVerifyingCaptcha(false);
      setIsLoggedIn(false);
      return;
    }

    setIsVerifyingCaptcha(false);

    if (!token) {
      enqueueSnackbar("Recaptcha doğrulaması başarısız.", {
        variant: "warning",
        autoHideDuration: 3000,
      });
      setIsLoggedIn(false);
      return;
    }

    try {
      const response = await apiFetch("/Auth/AdminLogin", {
        method: "POST",
        headers: {
          accept: "*/*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          otpCode: requiresOtp ? otpCode : undefined,
          CaptchaToken: token,
        }),
      });

      if (response.ok) {
        const data = await response.json();

        if (data.requiresOtp) {
          setRequiresOtp(true);
          setOtpCode("");
          setIsLoggedIn(false);
          enqueueSnackbar(
            data.message || "E-posta adresinize gönderilen güvenlik kodunu girin.",
            { variant: "info", autoHideDuration: 5000 },
          );
          return;
        }

        const userToken = data.token;
        if (!userToken) {
          throw new Error("Sunucu geçerli bir oturum anahtarı döndürmedi.");
        }

        const userRefreshToken = data.refreshToken;
        const userId = data.userId || data.kullaniciId || data.Id || 0;
        const userDenetciId = data.denetciId || 0;
        const userDenetciFirmaAdi = data.denetciFirmaAdi || "";
        const userData = {
          token: userToken,
          refreshToken: userRefreshToken,
          id: userId,
          denetciId: userDenetciId,
          denetciFirmaAdi: userDenetciFirmaAdi,
          yetki: data.yetki,
          rol: data.rol,
          claims: data.claims,
          kullaniciAdi: data.kullaniciAdi,
          mail: email,
          unvan: data.unvan,
          kurulumTamamlandi: data.kurulumTamamlandi,
          kurulumAdimi: data.kurulumAdimi,
          setupWizardProgress: data.setupWizardProgress,
          sonSecilenDenetlenenId: data.sonSecilenDenetlenenId,
          sonSecilenYil: data.sonSecilenYil,
          sonSecilenDenetlenenFirmaAdi: data.sonSecilenDenetlenenFirmaAdi,
          sonSecilenDenetimTuru: data.sonSecilenDenetimTuru,
          sonSecilenBobimi: data.sonSecilenBobimi,
          sonSecilenTfrsmi: data.sonSecilenTfrsmi,
          sonSecilenEnflasyonmu: data.sonSecilenEnflasyonmu,
          sonSecilenKonsolidemi: data.sonSecilenKonsolidemi,
          sonSecilenBddkmi: data.sonSecilenBddkmi,
          turTamamlandi: data.turTamamlandi,
          bddkmi: data.bddkmi,
        };

        if (data.sonSecilenDenetlenenId && data.sonSecilenYil && data.sonSecilenDenetlenenFirmaAdi) {
          Object.assign(userData, {
            denetlenenId: data.sonSecilenDenetlenenId,
            denetlenenFirmaAdi: data.sonSecilenDenetlenenFirmaAdi,
            yil: data.sonSecilenYil,
            denetimTuru: data.sonSecilenDenetimTuru,
            bobimi: data.sonSecilenBobimi,
            tfrsmi: data.sonSecilenTfrsmi,
            enflasyonmu: data.sonSecilenEnflasyonmu,
            konsolidemi: data.sonSecilenKonsolidemi,
            bddkmi: data.sonSecilenBddkmi,
          });

          localStorage.setItem("fas_denetlenenId", data.sonSecilenDenetlenenId.toString());
          localStorage.setItem("fas_yil", data.sonSecilenYil.toString());
        } else {
          localStorage.removeItem("fas_denetlenenId");
          localStorage.removeItem("fas_yil");
        }

        dispatch(setUserData(userData));

        if (data.bddkmi === undefined) {
          const data2 = await getDenetciOdemeBilgileri(userToken, userDenetciId);
          if (data2 && data2.bddkmi !== undefined) {
            dispatch(setBddkmi(data2.bddkmi));
          }
        }

        router.push("/Anasayfa");
        return;
      }

      setIsLoggedIn(false);

      let errorMessage = "Giriş başarısız";
      try {
        const errorText = await response.text();
        if (errorText) {
          if (errorText.trim().startsWith("{")) {
            const parsed = JSON.parse(errorText);
            errorMessage = parsed.Message || parsed.message || errorText;
          } else {
            errorMessage = errorText;
          }
        }
      } catch {
        if (response.statusText) {
          errorMessage = `${response.status} - ${response.statusText}`;
        }
      }

      enqueueSnackbar(errorMessage, {
        variant: "error",
        autoHideDuration: 5000,
        style: {
          backgroundColor:
            customizer.activeMode === "dark" ? theme.palette.error.light : theme.palette.error.main,
          maxWidth: "720px",
        },
      });
    } catch (error: any) {
      setIsLoggedIn(false);
      const message =
        error?.message === "Failed to fetch"
          ? "Bağlantı hatası: sisteme şu an ulaşılamıyor. Lütfen daha sonra tekrar deneyin."
          : `Giriş sırasında bir hata oluştu: ${error?.message || "Bilinmeyen hata"}`;

      enqueueSnackbar(message, {
        variant: "error",
        autoHideDuration: 5000,
        style: {
          backgroundColor:
            customizer.activeMode === "dark" ? theme.palette.error.light : theme.palette.error.main,
          maxWidth: "720px",
        },
      });
    } finally {
      setIsVerifyingCaptcha(false);
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (isLoggedIn || isVerifyingCaptcha) {
      return;
    }

    if (requiresOtp && !/^\d{8}$/.test(otpCode)) {
      enqueueSnackbar("8 haneli güvenlik kodunu girin.", {
        variant: "warning",
        autoHideDuration: 3000,
      });
      return;
    }

    setIsLoggedIn(true);
    void handleLogin();
  };

  return (
    <>
      {title ? (
        <Typography fontWeight="700" variant="h3" mb={1} color="primary.main">
          {title}
        </Typography>
      ) : null}

      {subtext}

      <form onSubmit={handleSubmit}>
        <Stack mb={3} spacing={2}>
          <Box>
            <CustomFormLabel htmlFor="username">Email</CustomFormLabel>
            <CustomTextField
              id="username"
              variant="outlined"
              fullWidth
              placeholder="Email adresiniz"
              disabled={requiresOtp}
              onChange={(event: any) => setEmail(event.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <IconMail size={20} />
                  </InputAdornment>
                ),
              }}
            />
          </Box>
          <Box>
            <CustomFormLabel htmlFor="password">Şifre</CustomFormLabel>
            <CustomTextField
              id="password"
              type="password"
              variant="outlined"
              fullWidth
              placeholder="Şifreniz"
              disabled={requiresOtp}
              onChange={(event: any) => setPassword(event.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <IconLock size={20} />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          {requiresOtp ? (
            <Box>
              <CustomFormLabel htmlFor="otpCode">Güvenlik kodu</CustomFormLabel>
              <CustomTextField
                id="otpCode"
                type="text"
                variant="outlined"
                fullWidth
                autoFocus
                value={otpCode}
                placeholder="8 haneli kod"
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                  setOtpCode(event.target.value.replace(/\D/g, "").slice(0, 8))
                }
                inputProps={{ maxLength: 8, inputMode: "numeric", pattern: "[0-9]*" }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <IconShieldLock size={20} />
                    </InputAdornment>
                  ),
                }}
              />
              <Typography variant="caption" color="text.secondary" mt={0.75} display="block">
                E-posta adresinize gönderilen 8 haneli kodu girin.
              </Typography>
            </Box>
          ) : null}

          <Box display="flex" justifyContent="center" />
        </Stack>

        <Box display="flex" justifyContent="flex-end" mb={3}>
          {requiresOtp ? (
            <MuiLink
              component="button"
              type="button"
              underline="hover"
              onClick={() => {
                setRequiresOtp(false);
                setOtpCode("");
              }}
              sx={{ fontWeight: 600, color: "primary.main" }}
            >
              Giriş bilgilerini değiştir
            </MuiLink>
          ) : (
            <MuiLink
              component={Link}
              href={`/auth/forgot-password${email ? `?email=${encodeURIComponent(email)}` : ""}`}
              underline="hover"
              sx={{
                fontWeight: 600,
                color: "primary.main",
              }}
            >
              Şifremi unuttum
            </MuiLink>
          )}
        </Box>

        <Box>
          <LoadingButton
            type="submit"
            color="primary"
            variant="contained"
            size="large"
            fullWidth
            loading={isVerifyingCaptcha || isLoggedIn}
            sx={{
              height: 48,
              padding: "0 30px",
              fontSize: "1.1rem",
              textTransform: "none",
              borderRadius: "10px",
            }}
          >
            {isVerifyingCaptcha
              ? "Güvenlik doğrulanıyor..."
              : isLoggedIn
                ? "Giriş yapılıyor..."
                : requiresOtp
                  ? "Kodu doğrula"
                  : "Giriş yap"}
          </LoadingButton>
        </Box>
      </form>
      {subtitle}
    </>
  );
};

export default AuthLogin;
