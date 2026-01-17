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
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";

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

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isVerifyingCaptcha, setIsVerifyingCaptcha] = useState(false);
  const { executeRecaptcha } = useGoogleReCaptcha();

  const handleLogin = async () => {
    if (!executeRecaptcha) {
      enqueueSnackbar("Recaptcha yüklenemedi, lütfen sayfayı yenileyin.", {
        variant: "warning",
        autoHideDuration: 3000,
      });
      setIsLoggedIn(false);
      return;
    }

    setIsVerifyingCaptcha(true);
    let token = "";
    try {
      token = await executeRecaptcha("login");
    } catch (error: any) {
      console.error("Recaptcha hatası:", error);
      let errorMessage = "Güvenlik doğrulaması sırasında bir hata oluştu.";

      if (error?.message?.includes("message channel closed")) {
        errorMessage = "Tarayıcı eklentileriniz güvenlik doğrulamasını engelliyor olabilir. Lütfen reklam engelleyici veya benzeri eklentileri kapatıp tekrar deneyin.";
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
      const response = await fetch(`${url}/Auth/login`, {
        method: "POST",
        headers: {
          accept: "*/*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, captchaToken: token }),
      });
      if (response.ok) {
        const data = await response.json();
        console.log("FULL LOGIN RESPONSE:", JSON.stringify(data, null, 2));
        const userToken = data.token;
        const userId = data.userId || data.kullaniciId || data.Id || 0;
        console.log("EXTRACTED userId:", userId, "TYPE:", typeof userId);

        dispatch(setToken(userToken));
        dispatch(setId(userId));

        setIsLoggedIn(true);
        if (userId == 1 || userId == 2) {
          console.log("Authorization Successful, redirecting to Anasayfa");
          router.push("/Anasayfa");
        } else {
          console.warn("Authorization Failed, redirecting to ForbiddenPage. userId was:", userId);
          router.push("/ForbiddenPage");
        }
      } else {
        setIsLoggedIn(false);
        enqueueSnackbar("Giriş Başarısız", {
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

      <Stack mb={3}>
        <Box>
          <CustomFormLabel htmlFor="username">Email</CustomFormLabel>
          <CustomTextField
            id="username"
            variant="outlined"
            fullWidth
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
            onChange={(e: any) => setPassword(e.target.value)}
          />
        </Box>
      </Stack>
      <Box>
        {!isLoggedIn && (
          <LoadingButton
            color="primary"
            variant="contained"
            size="large"
            fullWidth
            onClick={handleLogin}
            loading={isVerifyingCaptcha}
          >
            {isVerifyingCaptcha ? "Doğrulanıyor..." : "Giriş"}
          </LoadingButton>
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
