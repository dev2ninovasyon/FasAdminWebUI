"use client";
import {
  getMaddiDogrulama,
  getUygulananDenetimProsedurleri,
} from "@/api/MaddiDogrulama/MaddiDogrulama";
import UygulananDenetimTeknikleri from "@/app/(AdminUI)/components/CalismaKagitlari/MaddiDogrulama/UygulananDenetimTeknikleri";
import PageContainer from "@/app/(AdminUI)/components/Container/PageContainer";
import Breadcrumb from "@/app/(AdminUI)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import { Button, Grid, Typography } from "@mui/material";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import MaddiDogrulamaYorumComponent from "@/app/(AdminUI)/components/CalismaKagitlari/MaddiDogrulama/MaddiDogrulamaYorumComponent";
import MaddiDogrulamaEkBelgeYukleButton from "@/app/(AdminUI)/components/CalismaKagitlari/Cards/MaddiDogrulamaEkBelgeYukleButton";

const Page = () => {
  const user = useSelector((state: AppState) => state.userReducer);

  const pathname = usePathname();
  const searchParams = useSearchParams();
  const documentTitle = searchParams.get('title') || "Uygulanan Denetim Teknikleri";
  const segments = pathname.split("/");
  const parentNameIndex = segments.indexOf("MaddiDogrulamaProsedurleri") + 1;
  const parentName = segments[parentNameIndex];
  const childName = segments[parentNameIndex + 1];

  const [isClickedVarsayilanaDon, setIsClickedVarsayilanaDon] = useState(false);

  const [dip, setDip] = useState("");
  const [dipnotNo, setDipnotNo] = useState<string>("");
  const [tamamlanan, setTamamlanan] = useState(0);
  const [toplam, setToplam] = useState(0);

  const currentPath = pathname;
  const basePath = useMemo(() => {
    if (!pathname) return "";
    const parts = pathname.split("/").filter(Boolean);
    if (parts.length <= 1) return "/";
    return "/" + parts.slice(0, -1).join("/");
  }, [pathname]);

  const BCrumb = useMemo(() => {
    return [
      { to: "/DenetimKanitlari", title: "Denetim Kanıtları" },
      { to: "/DenetimKanitlari/MaddiDogrulamaProsedurleri", title: "Maddi Doğrulama Prosedürleri" },
      { to: basePath || "/DenetimKanitlari/MaddiDogrulamaProsedurleri", title: dip || parentName },
      { to: currentPath, title: "Uygulanan Denetim Teknikleri" },
    ];
  }, [basePath, currentPath, dip, parentName]);

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
      const maddiDogrulama = await getMaddiDogrulama(user.denetimTuru || "",
        user.denetlenenId || 0,
        user.yil || 0
      );

      maddiDogrulama.forEach((veri: any) => {
        if (normalizeString(veri.name) == normalizeString(parentName)) {
          setDip(veri.name);
        }
      });
    } catch (error) {
      console.log("An error occurred:", error);
    }
  };

  const fetchData2 = async () => {
    try {
      const uygulananDentimProsedurleri = await getUygulananDenetimProsedurleri(user.denetciId || 0,
        user.denetlenenId || 0,
        user.yil || 0,
        dip || "",
        user.tfrsmi || false
      );

      uygulananDentimProsedurleri.forEach((veri: any) => {
        if (normalizeString(veri.dipnotAdi) == normalizeString(parentName)) {
          setDipnotNo(veri.dipnotNo);
        }
      });
    } catch (error) {
      console.log("An error occurred:", error);
    }
  };

  useEffect(() => {
    if (parentName && parentName.length > 0) {
      fetchData();
    }
  }, [parentName]);

  useEffect(() => {
    if (dip) {
      fetchData2();
    }
  }, [dip]);

  return (
    <PageContainer
      title={`${dip} | Uygulanan Denetim Teknikleri`}
      description="this is Uygulanan Denetim Teknikleri"
    >
      <Breadcrumb
        title=""
        subtitle={`Uygulanan Denetim Teknikleri`}
        items={BCrumb}
      >
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
                gap: 1
              }}
              size={{
                xs: 12,
                md: 6,
                lg: 6
              }}>
              <MaddiDogrulamaEkBelgeYukleButton
                belgeAdi={`${dip || parentName}|||${documentTitle}`}
                text="Belge Yükle"
                fullWidth
                sx={{ height: 45, flex: 1 }}
              />
              <Button
                size="medium"
                variant="outlined"
                color="primary"
                disabled={isClickedVarsayilanaDon}
                onClick={() => setIsClickedVarsayilanaDon(true)}
                sx={{ height: 45, flex: 1, textTransform: 'none', fontSize: '0.9rem' }}
              >
                Varsayılana Dön
              </Button>
            </Grid>
          </Grid>
        </>
      </Breadcrumb>
      <UygulananDenetimTeknikleri
        controller="UygulananDenetimTeknikleri"
        isClickedVarsayilanaDon={isClickedVarsayilanaDon}
        setIsClickedVarsayilanaDon={setIsClickedVarsayilanaDon}
        setTamamlanan={setTamamlanan}
        setToplam={setToplam}
        dipnotNo={dipnotNo}
      />
      <MaddiDogrulamaYorumComponent parentName={parentName} childName={childName} />
    </PageContainer>
  );
};

export default Page;
