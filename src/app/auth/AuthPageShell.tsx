"use client";

import { Box, GlobalStyles, Typography, useTheme } from "@mui/material";
import Image from "next/image";
import { ReactNode, useEffect, useState } from "react";
import PageContainer from "../components/Container/PageContainer";
import Logo from "../components/Layout/Shared/Logo/Logo";
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";

const slides = [
  {
    image: "/login-assets/login-bg-2.png",
    title: "Kapsamli Denetim Yonetimi",
    description:
      "Tum finansal denetim sureclerinizi tek bir platformda yonetin. Kalite standartlarina uygun, izlenebilir denetim raporlari olusturun.",
  },
  {
    image: "/login-assets/login-bg-3.png",
    title: "Gelismis Veri Analizi",
    description:
      "Guclu analitik araclar ile finansal verilerinizi derinlemesine inceleyin. Akilli raporlama sistemi ile anlamli icgoruler elde edin.",
  },
  {
    image: "/login-assets/login-bg-4.png",
    title: "Ekip Isbirligi ve Gorev Yonetimi",
    description:
      "Denetim ekibinizle gercek zamanli isbirligi yapin. Gorev atama, ilerleme takibi ve dokumantasyon yonetimi tek bir arayuzde.",
  },
  {
    image: "/login-assets/login-bg-5.png",
    title: "Kalite Yonetim Sistemi (KYS)",
    description:
      "ISO standartlarina uygun kalite yonetim sureclerinizi dijitallestirin. Belge yonetimi, risk analizi ve surekli iyilestirme.",
  },
  {
    image: "/login-assets/login-bg-no-person-1.png",
    title: "Surdurulebilirlik Raporlamasi",
    description:
      "Cevresel, sosyal ve kurumsal yonetim (ESG) metriklerinizi izleyin. Surdurulebilirlik hedeflerinizi raporlayin ve degerlendirin.",
  },
];

interface AuthPageShellProps {
  title: string;
  description: string;
  pageTitle?: string;
  pageDescription?: string;
  alert?: ReactNode;
  children: ReactNode;
}

export default function AuthPageShell({
  title,
  description,
  pageTitle,
  pageDescription,
  alert,
  children,
}: AuthPageShellProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const [currentSlide, setCurrentSlide] = useState(() => Math.floor(Math.random() * slides.length));

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const panelBgColor = isDark ? "rgba(17, 24, 39, 0.95)" : "#ffffff";

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
      <GlobalStyles
        styles={{
          ".grecaptcha-badge": {
            left: "24px !important",
            right: "auto !important",
          },
        }}
      />
      <PageContainer title={pageTitle || title} description={pageDescription || description}>
        <Box
          sx={{
            display: "flex",
            height: "100vh",
            overflow: "hidden",
            flexDirection: { xs: "column-reverse", lg: "row" },
          }}
        >
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
              minHeight: { xs: "auto", lg: "100vh" },
            }}
          >
            <Box sx={{ width: "100%", maxWidth: "420px" }}>
              <Box display="flex" alignItems="center" justifyContent="flex-start" mb={5}>
                <Logo />
              </Box>

              <Box mb={4}>
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 700,
                    color: isDark ? "#fff" : "#0f172a",
                    mb: 1,
                  }}
                >
                  {title}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: isDark ? "rgba(255,255,255,0.7)" : "#64748b",
                    fontSize: "16px",
                    mb: 3,
                  }}
                >
                  {description}
                </Typography>

                {alert}
              </Box>

              {children}
            </Box>
          </Box>

          <Box
            sx={{
              flex: { xs: 1, lg: 7 },
              position: "relative",
              overflow: "hidden",
              minHeight: { xs: "300px", lg: "100vh" },
              backgroundColor: "#0f172a",
            }}
          >
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
                    zIndex: 1,
                  },
                }}
              >
                <Image
                  src={slide.image}
                  alt={slide.title}
                  fill
                  priority={index === currentSlide}
                  quality={95}
                  sizes="70vw"
                  style={{
                    objectFit: "cover",
                    objectPosition: "center",
                  }}
                />

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
                    transition: "all 0.8s ease 0.3s",
                  }}
                >
                  <Typography
                    variant="h2"
                    sx={{
                      fontSize: { xs: "28px", sm: "36px", lg: "48px" },
                      fontWeight: 800,
                      mb: 2,
                      lineHeight: 1.1,
                      textShadow: "0 2px 10px rgba(0, 0, 0, 0.3)",
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
                      opacity: 0.9,
                    }}
                  >
                    {slide.description}
                  </Typography>
                </Box>
              </Box>
            ))}

            <Box
              sx={{
                position: "absolute",
                bottom: { xs: 20, lg: 40 },
                right: { xs: 20, lg: 40 },
                display: "flex",
                gap: 1.25,
                zIndex: 20,
              }}
            >
              {slides.map((_, index) => (
                <Box
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    backgroundColor: currentSlide === index ? "white" : "rgba(255, 255, 255, 0.3)",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    transform: currentSlide === index ? "scale(1.2)" : "scale(1)",
                    "&:hover": {
                      backgroundColor: currentSlide === index ? "white" : "rgba(255, 255, 255, 0.5)",
                    },
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
