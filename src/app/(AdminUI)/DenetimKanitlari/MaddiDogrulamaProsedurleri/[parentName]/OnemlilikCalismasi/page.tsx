"use client";
import {
  getMaddiDogrulama,
  getUygulananDenetimProsedurleri,
} from "@/api/MaddiDogrulama/MaddiDogrulama";
import PageContainer from "@/app/(AdminUI)/components/Container/PageContainer";
import Breadcrumb from "@/app/(AdminUI)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import { Grid } from "@mui/material";
import dynamic from "next/dynamic";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import Onemlilik from "@/app/(AdminUI)/components/CalismaKagitlari/MaddiDogrulama/Onemlilik";
import MaddiDogrulamaYorumComponent from "@/app/(AdminUI)/components/CalismaKagitlari/MaddiDogrulama/MaddiDogrulamaYorumComponent";
import MaddiDogrulamaEkBelgeYukleButton from "@/app/(AdminUI)/components/CalismaKagitlari/Cards/MaddiDogrulamaEkBelgeYukleButton";

const Page = () => {
  const user = useSelector((state: AppState) => state.userReducer);

  const pathname = usePathname();
  const searchParams = useSearchParams();
  const documentTitle = searchParams.get('title') || "Önemlilik Çalışması";
  const segments = pathname.split("/");
  const parentNameIndex = segments.indexOf("MaddiDogrulamaProsedurleri") + 1;
  const parentName = segments[parentNameIndex];
  const childName = segments[parentNameIndex + 1];

  const [dip, setDip] = useState("");
  const [dipnotNo, setDipnotNo] = useState<string>("");

  const currentPath = pathname;
  const basePath = useMemo(() => {
    if (!pathname) return "";
    const parts = pathname.split("/").filter(Boolean);
    if (parts.length <= 1) return "/";
    return "/" + parts.slice(0, -1).join("/");
  }, [pathname]);

  const BCrumbList = useMemo(() => {
    return [
      { to: "/DenetimKanitlari", title: "Denetim Kanıtları" },
      { to: "/DenetimKanitlari/MaddiDogrulamaProsedurleri", title: "Maddi Doğrulama Prosedürleri" },
      { to: basePath || "/DenetimKanitlari/MaddiDogrulamaProsedurleri", title: dip || parentName },
      { to: currentPath, title: "Önemlilik Çalışması" },
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
      title={`${dip} | Önemlilik Çalışması`}
      description="this is Önemlilik Çalışması"
    >
      <Breadcrumb
        title=""
        subtitle="Önemlilik Çalışması"
        items={BCrumbList}
      >
        <MaddiDogrulamaEkBelgeYukleButton
          belgeAdi={`${dip || parentName}|||${documentTitle}`}
          text="Belge Yükle"
          fullWidth={false}
          sx={{ width: 140, height: 45, lineHeight: 1.2, fontSize: '0.9rem', whiteSpace: 'normal', textAlign: 'center' }}
        />
      </Breadcrumb>
      <Grid container>
        <Grid
          mb={3}
          size={{
            xs: 12,
            sm: 12,
            lg: 12
          }}>
        </Grid>
        <Grid
          size={{
            xs: 12,
            sm: 12,
            lg: 12
          }}>
          {dipnotNo != "" ? <Onemlilik dipnot={dipnotNo} /> : <></>}
        </Grid>
      </Grid>
      <MaddiDogrulamaYorumComponent parentName={parentName} childName={childName} />
    </PageContainer>
  );
};

export default Page;
