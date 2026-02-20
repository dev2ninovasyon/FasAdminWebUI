import { Box, Typography, Button, Stack, useTheme, InputAdornment } from "@mui/material";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { LoadingButton } from "@mui/lab";
import { IconTrash, IconMail, IconLock } from "@tabler/icons-react";
import { useDispatch, useSelector } from "@/store/hooks";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import {
  setSonSecilenBddkmi,
  setTurTamamlandi,
  setUserData,
  setBddkmi
} from "@/store/user/UserSlice";
import { apiFetch } from "@/api/apiBase";

import { enqueueSnackbar } from "notistack";
import { AppState } from "@/store/store";
import { getDenetciOdemeBilgileri } from "@/api/DenetciIslemleri/DenetciIslemleri";
import CustomFormLabel from "@/app/components/Forms/ThemeElements/CustomFormLabel";
import CustomTextField from "@/app/components/Forms/ThemeElements/CustomTextField";

interface loginType {
  title?: string;
  subtitle?: React.ReactNode;
  subtext?: React.ReactNode;
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
    console.log("HandleLogin baÅŸlatÄ±ldÄ±...");
    console.time("GiriÅŸ Ä°ÅŸlemi Toplam SÃ¼re");
    if (!executeRecaptcha) {
      console.error("executeRecaptcha nesnesi bulunamadÄ±!");
      enqueueSnackbar("Recaptcha yÃ¼klenemedi, lÃ¼tfen sayfayÄ± yenileyin.", {
        variant: "warning",
        autoHideDuration: 3000,
      });
      setIsLoggedIn(false);
      return;
    }

    setIsVerifyingCaptcha(true);
    let token = "";
    try {
      console.log("ReCAPTCHA doÄŸrulamasÄ± baÅŸlÄ±yor...");
      console.time("ReCAPTCHA DoÄŸrulamasÄ±");
      token = await executeRecaptcha("login");
      console.timeEnd("ReCAPTCHA DoÄŸrulamasÄ±");
      console.log("ReCAPTCHA token'Ä± alÄ±ndÄ±:", token ? "BaÅŸarÄ±lÄ±" : "BoÅŸ");
    } catch (error: any) {
      console.error("Recaptcha hatasÄ±:", error);
      let errorMessage = "GÃ¼venlik doÄŸrulamasÄ± sÄ±rasÄ±nda bir hata oluÅŸtu.";

      if (error?.message?.includes("message channel closed")) {
        errorMessage = "TarayÄ±cÄ± eklentileriniz gÃ¼venlik doÄŸrulamasÄ±nÄ± engelliyor olabilir. LÃ¼tfen reklam engelleyici veya benzeri eklentileri kapatÄ±p tekrar deneyin.";
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
      console.warn("ReCAPTCHA token alÄ±namadÄ±!");
      enqueueSnackbar("Recaptcha doÄŸrulamasÄ± baÅŸarÄ±sÄ±z.", {
        variant: "warning",
        autoHideDuration: 3000,
      });
      setIsLoggedIn(false);
      return;
    }

    try {
      console.log("API isteÄŸi gÃ¶nderiliyor...");
      console.time("Login API Ä°steÄŸi");
      // FasAdminWebUI uses AdminLogin
      const response = await apiFetch(`/Auth/AdminLogin`, {
        method: "POST",
        headers: {
          accept: "*/*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, captchaToken: token }),
      });
      console.timeEnd("Login API Ä°steÄŸi");

      if (response.ok) {
        console.time("Veri Ä°ÅŸleme ve YÃ¶nlendirme");
        const data = await response.json();
        const userToken = data.token;
        const userRefreshToken = data.refreshToken;
        const userId = data.userId || data.kullaniciId || data.Id || 0;

        const userDenetciId = data.denetciId || data.denetciId || 0;
        const userDenetciFirmaAdi = data.denetciFirmaAdi || "";
        const yetki = data.yetki;
        const rol = data.rol;
        const kullaniciAdi = data.kullaniciAdi;
        const unvan = data.unvan;
        const kurulumTamamlandi = data.kurulumTamamlandi;
        const kurulumAdimi = data.kurulumAdimi;
        const setupWizardProgress = data.setupWizardProgress;
        const sonSecilenDenetlenenId = data.sonSecilenDenetlenenId;
        const sonSecilenYil = data.sonSecilenYil;
        const sonSecilenDenetlenenFirmaAdi = data.sonSecilenDenetlenenFirmaAdi;
        const sonSecilenDenetimTuru = data.sonSecilenDenetimTuru;
        const sonSecilenBobimi = data.sonSecilenBobimi;
        const sonSecilenTfrsmi = data.sonSecilenTfrsmi;
        const sonSecilenEnflasyonmu = data.sonSecilenEnflasyonmu;
        const sonSecilenKonsolidemi = data.sonSecilenKonsolidemi;
        const sonSecilenBddkmi = data.sonSecilenBddkmi;
        const bddkmi = data.bddkmi;
        const turTamamlandi = data.turTamamlandi;

        const userData = {
          token: userToken,
          refreshToken: userRefreshToken,
          id: userId,
          denetciId: userDenetciId,
          denetciFirmaAdi: userDenetciFirmaAdi,
          yetki: yetki,
          rol: rol,
          kullaniciAdi: kullaniciAdi,
          mail: email,
          unvan: unvan,
          kurulumTamamlandi: kurulumTamamlandi,
          kurulumAdimi: kurulumAdimi,
          setupWizardProgress: setupWizardProgress,
          sonSecilenDenetlenenId: sonSecilenDenetlenenId,
          sonSecilenYil: sonSecilenYil,
          sonSecilenDenetlenenFirmaAdi: sonSecilenDenetlenenFirmaAdi,
          sonSecilenDenetimTuru: sonSecilenDenetimTuru,
          sonSecilenBobimi: sonSecilenBobimi,
          sonSecilenTfrsmi: sonSecilenTfrsmi,
          sonSecilenEnflasyonmu: sonSecilenEnflasyonmu,
          sonSecilenKonsolidemi: sonSecilenKonsolidemi,
          sonSecilenBddkmi: sonSecilenBddkmi,
          turTamamlandi: turTamamlandi,
          bddkmi: bddkmi
        };

        if (sonSecilenDenetlenenId && sonSecilenYil && sonSecilenDenetlenenFirmaAdi) {
          Object.assign(userData, {
            denetlenenId: sonSecilenDenetlenenId,
            denetlenenFirmaAdi: sonSecilenDenetlenenFirmaAdi,
            yil: sonSecilenYil,
            denetimTuru: sonSecilenDenetimTuru,
            bobimi: sonSecilenBobimi,
            tfrsmi: sonSecilenTfrsmi,
            enflasyonmu: sonSecilenEnflasyonmu,
            konsolidemi: sonSecilenKonsolidemi,
            bddkmi: sonSecilenBddkmi
          });

          localStorage.setItem("fas_denetlenenId", sonSecilenDenetlenenId.toString());
          localStorage.setItem("fas_yil", sonSecilenYil.toString());
        }

        dispatch(setUserData(userData));

        if (bddkmi === undefined) {
          console.time("Ek Bilgi API Ä°steÄŸi (bddkmi)");
          const data2 = await getDenetciOdemeBilgileri(
            userToken,
            userDenetciId
          );
          if (data2 && data2.bddkmi !== undefined) {
            dispatch(setBddkmi(data2.bddkmi));
          }
          console.timeEnd("Ek Bilgi API Ä°steÄŸi (bddkmi)");
        }

        if (!sonSecilenDenetlenenId || !sonSecilenDenetlenenFirmaAdi) {
          localStorage.removeItem("fas_denetlenenId");
          localStorage.removeItem("fas_yil");
        }

        console.timeEnd("Veri Ä°ÅŸleme ve YÃ¶nlendirme");
        console.timeEnd("GiriÅŸ Ä°ÅŸlemi Toplam SÃ¼re");
        router.push("/Anasayfa");
      } else {
        console.timeEnd("GiriÅŸ Ä°ÅŸlemi Toplam SÃ¼re");
        setIsLoggedIn(false);

        let errorMsg = "GiriÅŸ BaÅŸarÄ±sÄ±z";
        try {
          const errorData = await response.json();
          if (errorData.message) {
            errorMsg = errorData.message;
          }
        } catch (e) {
          // JSON deÄŸilse statusText kullan
          if (response.statusText) {
            errorMsg = `${response.status} - ${response.statusText}`;
          }
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
      console.timeEnd("GiriÅŸ Ä°ÅŸlemi Toplam SÃ¼re");
      console.error("Bir hata oluÅŸtu:", error);
      setIsLoggedIn(false);
      enqueueSnackbar("Sunucuyla baÄŸlantÄ± kurulamadÄ±.", {
        variant: "error",
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggedIn(true);
    handleLogin();
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
              onChange={(e: any) => setEmail(e.target.value)}
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
            <CustomFormLabel htmlFor="password">Åifre</CustomFormLabel>
            <CustomTextField
              id="password"
              type="password"
              variant="outlined"
              fullWidth
              placeholder="Åifreniz"
              onChange={(e: any) => setPassword(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <IconLock size={20} />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          <Box display="flex" justifyContent="center">
            {/* ReCAPTCHA v3 is invisible */}
          </Box>

        </Stack>
        <Box>
          <LoadingButton
            type="submit"
            color="primary"
            variant="contained"
            size="large"
            fullWidth
            loading={isVerifyingCaptcha || isLoggedIn}
            sx={{
              background: "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
              boxShadow: "0 3px 5px 2px rgba(33, 203, 243, .3)",
              color: "white",
              height: 48,
              padding: "0 30px",
              fontSize: "1.1rem",
              textTransform: "none",
              borderRadius: "10px"
            }}
          >
            {isVerifyingCaptcha ? "GÃ¼venlik DoÄŸrulamasÄ±..." : isLoggedIn ? "GiriÅŸ YapÄ±lÄ±yor..." : "GiriÅŸ Yap"}
          </LoadingButton>
        </Box>
      </form>
      {subtitle}
    </>
  );
};

export default AuthLogin;
