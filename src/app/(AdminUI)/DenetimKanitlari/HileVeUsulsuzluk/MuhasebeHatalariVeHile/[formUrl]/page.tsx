"use client";
import { getHile } from "@/api/DenetimDosya/DenetimDosya";
import HileCalismaKagitlariBelge from "@/app/(AdminUI)/components/CalismaKagitlari/HileCalismaKagitlariBelge";
import PageContainer from "@/app/(AdminUI)/components/Container/PageContainer";
import Breadcrumb from "@/app/(AdminUI)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import { Button, Grid, Typography } from "@mui/material";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Orneklem from "./Orneklem";
import BelgeKontrolCard from "@/app/(AdminUI)/components/CalismaKagitlari/Cards/BelgeKontrolCard";
import IslemlerCard from "@/app/(AdminUI)/components/CalismaKagitlari/Cards/IslemlerCard";

const Page = () => {
  const user = useSelector((state: AppState) => state.userReducer);

  const pathname = usePathname();
  const segments = pathname.split("/");
  const formUrlIndex = segments.indexOf("MuhasebeHatalariVeHile") + 1;
  const formUrl = segments[formUrlIndex];

  const [isClickedVarsayilanaDon, setIsClickedVarsayilanaDon] = useState(false);

  const [dip, setDip] = useState("");
  const [dipnotNo, setDipnotNo] = useState<string>("");

  const [code, setCode] = useState("");

  const [tamamlanan, setTamamlanan] = useState(0);
  const [toplam, setToplam] = useState(0);

  const [isRefresh, setIsRefresh] = useState(false);

  const [tersMi, setTersMi] = useState(false);

  const controller = dipnotNo;

  const BCrumb = [
    {
      to: "/DenetimKanitlari",
      title: "Denetim Kanıtları",
    },
    {
      to: "/DenetimKanitlari/HileVeUsulsuzluk",
      title: "Hile Ve Usulsüzlük",
    },
    {
      to: "/DenetimKanitlari/HileVeUsulsuzluk/MuhasebeHatalariVeHile",
      title: "Muhasebe Hataları Ve Hileye İlişkin Çalışmalar",
    },
    {
      to: `/DenetimKanitlari/HileVeUsulsuzluk/MuhasebeHatalariVeHile/${formUrl}`,
      title: `${dip}`,
    },
  ];

  function normalizeString(str: string): string {
    const turkishChars: { [key: string]: string } = {
      ç: "c",
      ğ: "g",
      ı: "i",
      ö: "o",
      ş: "s",
      ü: "u",
      Ç: "C",
      Ğ: "G",
      İ: "I",
      Ö: "O",
      Ş: "S",
      Ü: "U",
    };

    // Türkçe karakterleri değiştir
    let normalized = str.replace(
      /[çğıöşüÇĞÖŞÜıİ]/g,
      (match) => turkishChars[match] || match
    );

    // Tüm boşluk, tab, satır başı/sonu karakterlerini sil
    normalized = normalized.replace(/\s+/g, "");

    // Küçük harfe çevir
    return normalized.toLowerCase();
  }

  const fetchData = async () => {
    try {
      const hile = await getHile(user.denetimTuru || "");
      hile.forEach((veri: any) => {
        if (normalizeString(veri.url).includes(normalizeString(formUrl))) {
          setDip(veri.name);
          setCode(veri.code.replace("/", ":"));
          const [sol, sag] = veri.code.split("/");
          if (user.bobimi && sol) {
            setDipnotNo(sol);
          } else if (user.tfrsmi && sag) {
            setDipnotNo(sag);
          } else {
            setTersMi(true);
            if (user.bobimi) {
              setDipnotNo(sag);
            }
            if (user.tfrsmi) {
              setDipnotNo(sol);
            }
          }
        }
      });
    } catch (error) {
      console.log("An error occurred:", error);
    }
  };

  useEffect(() => {
    if (formUrl && formUrl.length > 0) {
      fetchData();
    }
  }, [formUrl]);

  return (
    <PageContainer
      title={`${dip} | Muhasebe Hataları Ve Hile`}
      description="this is Muhasebe Hataları Ve Hile"
    >
      <Breadcrumb title={dip} items={BCrumb}>
        <>
          <Grid
            container
            sx={{
              width: "95%",
              height: "100%",
              margin: "0 auto",
              justifyContent: "space-between",
            }}
          >
            <Grid
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
              }}
              size={{
                xs: 12,
                md: 4,
                lg: 4
              }}>
              <Typography
                variant="body1"
                sx={{
                  overflowWrap: "break-word",
                  wordWrap: "break-word",
                  textAlign: "center",
                }}
              >
                {tamamlanan}/{toplam} Tamamlandı
              </Typography>
            </Grid>
            <Grid
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              size={{
                xs: 12,
                md: 6,
                lg: 6
              }}>
              <Button
                size="medium"
                variant="outlined"
                color="primary"
                disabled={isClickedVarsayilanaDon}
                onClick={() => setIsClickedVarsayilanaDon(true)}
                sx={{ width: "100%" }}
              >
                <Typography
                  variant="body1"
                  sx={{ overflowWrap: "break-word", wordWrap: "break-word" }}
                >
                  Varsayılana Dön
                </Typography>
              </Button>
            </Grid>
          </Grid>
        </>
      </Breadcrumb>
      <Grid container>
        <Grid
          mb={3}
          size={{
            xs: 12,
            sm: 12,
            lg: 12
          }}>
          <HileCalismaKagitlariBelge
            refresh={isRefresh}
            url={formUrl}
            controller="HileCalismaKagitlari"
            isClickedVarsayilanaDon={isClickedVarsayilanaDon}
            setIsClickedVarsayilanaDon={setIsClickedVarsayilanaDon}
            setTamamlanan={setTamamlanan}
            setToplam={setToplam}
          />
        </Grid>
        <Grid
          sx={{
            width: "95%",
            margin: "0 auto",
            justifyContent: "space-between",
            gap: 1,
          }}>
          {dipnotNo != "" ? (
            <Orneklem dipnot={dipnotNo} tersMi={tersMi} />
          ) : (
            <></>
          )}
        </Grid>
        {code.length > 2 && (
          <Grid
            size={{
              xs: 12,
              sm: 12,
              lg: 12
            }}>
            {(user.rol?.includes("KaliteKontrolSorumluDenetci") ||
              user.rol?.includes("SorumluDenetci") ||
              user.rol?.includes("Denetci") ||
              user.rol?.includes("DenetciYardimcisi")) && (
                <Grid
                  container
                  sx={{
                    width: "95%",
                    margin: "0 auto",
                    justifyContent: "space-between",
                  }}
                >
                  <Grid
                    mt={3}
                    size={{
                      xs: 12,
                      md: 3.9,
                      lg: 3.9
                    }}>
                    <BelgeKontrolCard
                      fetch={() => {
                        setIsRefresh(true);
                      }}
                      hazirlayan="Denetçi - Yardımcı Denetçi"
                      controller={code}
                    ></BelgeKontrolCard>
                  </Grid>
                  <Grid
                    mt={3}
                    size={{
                      xs: 12,
                      md: 3.9,
                      lg: 3.9
                    }}>
                    <BelgeKontrolCard
                      fetch={() => {
                        setIsRefresh(true);
                      }}
                      onaylayan="Sorumlu Denetçi"
                      controller={code}
                    ></BelgeKontrolCard>
                  </Grid>
                  <Grid
                    mt={3}
                    size={{
                      xs: 12,
                      md: 3.9,
                      lg: 3.9
                    }}>
                    <BelgeKontrolCard
                      fetch={() => {
                        setIsRefresh(true);
                      }}
                      kaliteKontrol="Kalite Kontrol Sorumlu Denetçi"
                      controller={code}
                    ></BelgeKontrolCard>
                  </Grid>
                </Grid>
              )}
            <Grid
              container
              sx={{
                width: "95%",
                margin: "0 auto",
                justifyContent: "space-between",
                gap: 1,
              }}
            >
              <Grid
                mt={5}
                size={{
                  xs: 12,
                  lg: 12
                }}>
                <IslemlerCard controller={code} />
              </Grid>
            </Grid>
          </Grid>
        )}
      </Grid>
    </PageContainer>
  );
};

export default Page;
