import CustomFormLabel from "@/app/components/Forms/ThemeElements/CustomFormLabel";
import CustomTextField from "@/app/components/Forms/ThemeElements/CustomTextField";
import { Box, Typography, Button, Stack, useTheme } from "@mui/material";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { LoadingButton } from "@mui/lab";
import { IconTrash } from "@tabler/icons-react";
import { useDispatch, useSelector } from "@/store/hooks";
import { setId, setToken } from "@/store/user/UserSlice";
import { url } from "@/api/apiBase";
import { enqueueSnackbar } from "notistack";
import { AppState } from "@/store/store";

interface loginType {
  title?: string;
  subtitle?: JSX.Element | JSX.Element[];
  subtext?: JSX.Element | JSX.Element[];
}

const AuthLogin: React.FC<loginType> = ({ title, subtitle, subtext }) => {
  const router = useRouter();
  const dispatch = useDispatch();

  const customizer = useSelector((state: AppState) => state.customizer);
  const theme = useTheme();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [step, setStep] = useState<"credentials" | "otp">("credentials");
  const [otpCode, setOtpCode] = useState("");

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = async () => {
    try {
      const captchaToken = "BYPASS_RECAPTCHA_TEST";
      const payload: any = { email, password, captchaToken };
      if (step === "otp") {
        payload.otpCode = otpCode.trim();
      }

      // Once AdminLogin dene, endpoint bulunamazsa standart login dene
      let response = await fetch(`${url}/Auth/AdminLogin`, {
        method: "POST",
        headers: {
          accept: "*/*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.status === 404) {
        response = await fetch(`${url}/Auth/login`, {
          method: "POST",
          headers: {
            accept: "*/*",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
      }

      if (response.ok) {
        const data = await response.json();

        // 2FA: Backend OTP istiyorsa OTP adimina gec
        if (data.requiresOtp) {
          setStep("otp");
          enqueueSnackbar(data.message || "Doğrulama kodu e-posta adresinize gönderildi.", {
            variant: "info",
            autoHideDuration: 5000,
          });
          return;
        }

        const userToken = data.token || data.Token;
        const userId = data.kullaniciId || data.KullaniciId || 1;

        dispatch(setToken(userToken));
        dispatch(setId(userId));

        setIsLoggedIn(true);
        router.push("/Anasayfa");
      } else {
        setIsLoggedIn(false);
        let errorMsg = "Giriş Başarısız";
        try {
          const errData = await response.json();
          errorMsg = errData.message || errData.Message || errData.errorMessage || errorMsg;
        } catch {
          // ignore
        }

        enqueueSnackbar(errorMsg, {
          variant: "error",
          autoHideDuration: 5000,
          style: {
            backgroundColor:
              customizer.activeMode === "dark"
                ? theme.palette.error.light
                : theme.palette.error.main,
            maxWidth: "720px",
          },
        });
      }
    } catch (error) {
      console.error("Bir hata oluştu:", error);
      enqueueSnackbar("Sunucuya bağlanılamadı. Lütfen API servisinin çalıştığından emin olun.", {
        variant: "error",
        autoHideDuration: 5000,
      });
    }
  };

  return (
    <>
      {title ? (
        <Typography fontWeight="700" variant="h3" mb={1}>
          {title}
        </Typography>
      ) : null}

      {subtext}

      {step === "credentials" ? (
        <Stack mb={3}>
          <Box>
            <CustomFormLabel htmlFor="username">Email</CustomFormLabel>
            <CustomTextField
              id="username"
              variant="outlined"
              fullWidth
              value={email}
              onChange={(e: any) => setEmail(e.target.value)}
            />
          </Box>
          <Box>
            <CustomFormLabel htmlFor="password">Şifre</CustomFormLabel>
            <CustomTextField
              id="password"
              type="password"
              variant="outlined"
              fullWidth
              value={password}
              onChange={(e: any) => setPassword(e.target.value)}
            />
          </Box>
        </Stack>
      ) : (
        <Stack mb={3}>
          <Typography variant="body2" color="textSecondary" mb={2}>
            <strong>{email}</strong> adresine gönderilen 8 haneli güvenlik kodunu giriniz.
          </Typography>
          <Box>
            <CustomFormLabel htmlFor="otp">Doğrulama Kodu (OTP)</CustomFormLabel>
            <CustomTextField
              id="otp"
              variant="outlined"
              fullWidth
              placeholder="8 haneli kod"
              value={otpCode}
              onChange={(e: any) => setOtpCode(e.target.value)}
              autoFocus
            />
          </Box>
        </Stack>
      )}

      <Box>
        {!isLoggedIn && (
          <Button
            color="primary"
            variant="contained"
            size="large"
            fullWidth
            onClick={handleLogin}
          >
            {step === "otp" ? "Kodu Onayla ve Giriş Yap" : "Giriş"}
          </Button>
        )}
        {step === "otp" && !isLoggedIn && (
          <Button
            color="inherit"
            variant="text"
            size="medium"
            fullWidth
            sx={{ mt: 1 }}
            onClick={() => setStep("credentials")}
          >
            Geri Dön (Şifre Değiştir)
          </Button>
        )}
        {isLoggedIn && (
          <LoadingButton
            loading
            color="secondary"
            variant="contained"
            size="large"
            fullWidth
            endIcon={<IconTrash width={18} />}
          ></LoadingButton>
        )}
      </Box>
      {subtitle}
    </>
  );
};

export default AuthLogin;
