"use client";
import { Grid, Box, Card, Typography, useTheme, GlobalStyles } from "@mui/material";
import { useState, useEffect } from "react";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";

// components
import AuthLogin from "./auth/authForms/AuthLogin";
import PageContainer from "./components/Container/PageContainer";
import Logo from "./components/Layout/Shared/Logo/Logo";
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";


const slides = [
  {
    image: "/login-assets/login-bg-2.png",
    title: "KapsamlÄ± Denetim YÃ¶netimi",
    description: "TÃ¼m finansal denetim sÃ¼reÃ§lerinizi tek bir platformda yÃ¶netin. Kalite standartlarÄ±na uygun, izlenebilir denetim raporlarÄ± oluÅŸturun."
  },
  {
    image: "/login-assets/login-bg-3.png",
    title: "GeliÅŸmiÅŸ Veri Analizi",
    description: "GÃ¼Ã§lÃ¼ analitik araÃ§lar ile finansal verilerinizi derinlemesine inceleyin. AkÄ±llÄ± raporlama sistemi ile anlamlÄ± iÃ§gÃ¶rÃ¼ler elde edin."
  },
  {
    image: "/login-assets/login-bg-4.png",
    title: "Ekip Ä°ÅŸbirliÄŸi ve GÃ¶rev YÃ¶netimi",
    description: "Denetim ekibinizle gerÃ§ek zamanlÄ± iÅŸbirliÄŸi yapÄ±n. GÃ¶rev atama, ilerleme takibi ve dokÃ¼mantasyon yÃ¶netimi tek bir arayÃ¼zde."
  },
  {
    image: "/login-assets/login-bg-5.png",
    title: "Kalite YÃ¶netim Sistemi (KYS)",
    description: "ISO standartlarÄ±na uygun kalite yÃ¶netim sÃ¼reÃ§lerinizi dijitalleÅŸtirin. Belge yÃ¶netimi, risk analizi ve sÃ¼rekli iyileÅŸtirme."
  },
  {
    image: "/login-assets/login-bg-no-person-1.png",
    title: "SÃ¼rdÃ¼rÃ¼lebilirlik RaporlamasÄ±",
    description: "Ã‡evresel, sosyal ve kurumsal yÃ¶netim (ESG) metriklerinizi izleyin. SÃ¼rdÃ¼rÃ¼lebilirlik hedeflerinizi raporlayÄ±n ve deÄŸerlendirin."
  }
];

export default function Page() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const router = useRouter();
  const user = useSelector((state: AppState) => state.userReducer);

  // Random start slide
  const [currentSlide, setCurrentSlide] = useState(() => Math.floor(Math.random() * slides.length));

  // EÄŸer kullanÄ±cÄ± zaten giriÅŸ yapmÄ±ÅŸsa (token varsa), ana sayfaya yÃ¶nlendir
  useEffect(() => {
    if (user?.token) {
      router.push("/Anasayfa");
    }
  }, [user?.token, router]);

  useEffect(() => {
    router.prefetch("/Anasayfa");
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [router]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const panelBgColor = isDark ? "rgba(17, 24, 39, 0.95)" : "#ffffff";
  const cardBgColor = isDark ? "rgba(0, 0, 0, 0.70)" : "rgba(255, 255, 255, 0.90)";

  return (
    <GoogleReCaptchaProvider
      reCaptchaKey="6Ld2CyEsAAAAALNU5rSOM_Q2RAWkQ2RADbsS5NQW"
      scriptProps={{
        async: true,
        defer: true,
        appendTo: "head",
        nonce: undefined,
      }}
    >
      <GlobalStyles styles={{
        ".grecaptcha-badge": {
          left: "24px !important",
          right: "auto !important",
        },
      }} />
      <PageContainer title="GiriÅŸ" description="GiriÅŸ Yap">
        <Box
          sx={{
            display: "flex",
            height: "100vh",
            overflow: "hidden",
            flexDirection: { xs: "column-reverse", lg: "row" }
          }}
        >
          {/* Left Side - Login Form (30%) */}
          <Box
            sx={{
              flex: { xs: 2, lg: 3 },
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              p: { xs: 3, sm: 4, lg: 6 },
              backgroundColor: panelBgColor,
              position: "relative",
              zIndex: 10,
              minHeight: { xs: "auto", lg: "100vh" }
            }}
          >
            <Box
              sx={{
                width: "100%",
                maxWidth: "420px",
              }}
            >
              {/* Logo & Brand */}
              <Box display="flex" alignItems="center" justifyContent="flex-start" mb={5}>
                <Logo />
              </Box>

              {/* Welcome Header */}
              <Box mb={4}>
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 700,
                    color: isDark ? "#fff" : "#0f172a",
                    mb: 1
                  }}
                >
                  HoÅŸ Geldiniz
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: isDark ? "rgba(255,255,255,0.7)" : "#64748b",
                    fontSize: "16px"
                  }}
                >
                  Devam etmek iÃ§in lÃ¼tfen giriÅŸ yapÄ±n. Admin
                </Typography>
              </Box>

              {/* Login Form */}
              <AuthLogin />
            </Box>
          </Box>

          {/* Right Side - Image Slider (70%) */}
          <Box
            sx={{
              flex: { xs: 1, lg: 7 },
              position: "relative",
              overflow: "hidden",
              minHeight: { xs: "300px", lg: "100vh" },
              backgroundColor: "#0f172a"
            }}
          >
            {/* Slides */}
            {slides.map((slide, index) => (
              <Box
                key={index}
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  opacity: currentSlide === index ? 1 : 0,
                  transition: "opacity 1s ease-in-out",
                  "&::after": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    background: "linear-gradient(to right, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.2))",
                    zIndex: 1
                  }
                }}
              >
                <Image
                  src={slide.image}
                  alt={slide.title}
                  fill
                  priority={index === 0}
                  quality={95}
                  sizes="70vw"
                  style={{
                    objectFit: "cover",
                    objectPosition: "center"
                  }}
                />

                {/* Slide Content */}
                <Box
                  sx={{
                    position: "absolute",
                    bottom: { xs: 30, sm: 40, lg: 60 },
                    left: { xs: 20, sm: 40, lg: 60 },
                    right: { xs: 20, sm: 40 },
                    color: "white",
                    zIndex: 2,
                    maxWidth: "600px",
                    opacity: currentSlide === index ? 1 : 0,
                    transform: currentSlide === index ? "translateY(0)" : "translateY(20px)",
                    transition: "all 0.8s ease 0.3s"
                  }}
                >
                  <Typography
                    variant="h2"
                    sx={{
                      fontSize: { xs: "28px", sm: "36px", lg: "48px" },
                      fontWeight: 800,
                      mb: 2,
                      lineHeight: 1.1,
                      textShadow: "0 2px 10px rgba(0, 0, 0, 0.3)"
                    }}
                  >
                    {slide.title}
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      fontSize: { xs: "14px", sm: "16px", lg: "18px" },
                      lineHeight: 1.6,
                      textShadow: "0 1px 5px rgba(0, 0, 0, 0.3)",
                      opacity: 0.9
                    }}
                  >
                    {slide.description}
                  </Typography>
                </Box>
              </Box>
            ))}

            {/* Indicators */}
            <Box
              sx={{
                position: "absolute",
                bottom: { xs: 20, lg: 40 },
                right: { xs: 20, lg: 40 },
                display: "flex",
                gap: 1.25,
                zIndex: 20
              }}
            >
              {slides.map((_, index) => (
                <Box
                  key={index}
                  onClick={() => goToSlide(index)}
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    backgroundColor: currentSlide === index
                      ? "white"
                      : "rgba(255, 255, 255, 0.3)",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    transform: currentSlide === index ? "scale(1.2)" : "scale(1)",
                    "&:hover": {
                      backgroundColor: currentSlide === index
                        ? "white"
                        : "rgba(255, 255, 255, 0.5)"
                    }
                  }}
                />
              ))}
            </Box>
          </Box>
        </Box>
      </PageContainer>
    </GoogleReCaptchaProvider>
  );
}

Page.layout = "Blank";
