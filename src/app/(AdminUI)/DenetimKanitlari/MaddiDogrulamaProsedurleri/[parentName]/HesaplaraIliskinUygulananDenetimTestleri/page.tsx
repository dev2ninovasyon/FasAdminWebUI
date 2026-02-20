"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

import {
  getMaddiDogrulama,
  getDipnotNoByDipnotAdi,
} from "@/api/MaddiDogrulama/MaddiDogrulama";

import PageContainer from "@/app/(AdminUI)/components/Container/PageContainer";
import Breadcrumb from "@/app/(AdminUI)/components/Layout/Shared/Breadcrumb/Breadcrumb";

import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";

import MaddiDogrulamaYorumComponent from "@/app/(AdminUI)/components/CalismaKagitlari/MaddiDogrulama/MaddiDogrulamaYorumComponent";
import HesaplaraIliskinUygulananDenetimTestleri from "@/app/(AdminUI)/components/CalismaKagitlari/MaddiDogrulama/HesaplaraIliskinUygulananDenetimTestleri";
import MaddiDogrulamaEkBelgeYukleButton from "@/app/(AdminUI)/components/CalismaKagitlari/Cards/MaddiDogrulamaEkBelgeYukleButton";

const Page = () => {
  const user = useSelector((state: AppState) => state.userReducer);

  const pathname = usePathname();
  const searchParams = useSearchParams();
  const documentTitle = searchParams.get('title') || "Hesaplara İlişkin Uygulanan Denetim Testleri";

  // ✅ Segmentleri güvenli al
  const segments = useMemo(() => pathname.split("/").filter(Boolean), [pathname]);

  const parentNameIndex = segments.indexOf("MaddiDogrulamaProsedurleri") + 1;
  const parentName = segments[parentNameIndex] || "";
  const childName = segments[parentNameIndex + 1] || "";

  const [dip, setDip] = useState("");
  const [dipnotNo, setDipnotNo] = useState<string>("");

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

    let normalized = str.replace(
      /[çğıöşüÇĞÖŞÜıİ]/g,
      (match) => turkishChars[match] || match
    );

    normalized = normalized.replace(/\s+/g, "");
    return normalized.toLowerCase();
  }

  const fetchDipTitle = async () => {
    try {
      const maddiDogrulama = await getMaddiDogrulama(user.denetimTuru || "",
        user.denetlenenId || 0,
        user.yil || 0
      );

      const found = maddiDogrulama?.find(
        (veri: any) =>
          normalizeString(veri?.name || "") === normalizeString(parentName)
      );

      if (found?.name) setDip(found.name);
    } catch (error) {
      console.log("fetchDipTitle error:", error);
    }
  };

  const fetchDipnotNo = async () => {
    try {
      const result = await getDipnotNoByDipnotAdi(user.denetciId || 0,
        user.denetlenenId || 0,
        user.yil || 0,
        parentName,
        user.denetimTuru === "Tfrs"
      );

      setDipnotNo(result || "");
    } catch (error) {
      console.log("fetchDipnotNo error:", error);
    }
  };

  useEffect(() => {
    if (parentName) {
      fetchDipTitle();
      fetchDipnotNo();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parentName]);

  /**
   * ✅ EN KRİTİK DÜZELTME
   * currentPath = şu anki sayfa (pathname) => 404 yok
   * basePath = bir üst sayfa => Ticari Alacaklar'a döner
   */
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
      {
        to: "/DenetimKanitlari/MaddiDogrulamaProsedurleri",
        title: "Maddi Doğrulama Prosedürleri",
      },

      // ✅ Ticari Alacaklar'a geri dönüş (üst sayfa)
      { to: basePath || "/DenetimKanitlari/MaddiDogrulamaProsedurleri", title: dip || parentName },

      // ✅ Bulunduğun sayfa (404 yok)
      { to: currentPath, title: "Hesaplara İlişkin Uygulanan Denetim Testleri" },
    ];
  }, [basePath, currentPath, dip, parentName]);

  return (
    <PageContainer
      title={`${dip || parentName} | Hesaplara İlişkin Uygulanan Denetim Testleri`}
      description="this is Hesaplara İlişkin Uygulanan Denetim Testleri"
    >
      <Breadcrumb
        title=""
        subtitle="Hesaplara İlişkin Uygulanan Denetim Testleri"
        items={BCrumb}
      >
        <MaddiDogrulamaEkBelgeYukleButton
          belgeAdi={`${dip || parentName}|||${documentTitle}`}
          text="Belge Yükle"
          fullWidth={false}
          sx={{ width: 140, height: 45, lineHeight: 1.2, fontSize: '0.9rem', whiteSpace: 'normal', textAlign: 'center' }}
        />
      </Breadcrumb>

      {dipnotNo !== "" ? (
        <HesaplaraIliskinUygulananDenetimTestleri
          controller="HesaplaraIliskinUygulananDenetimTestleri"
          dipnotAdi={parentName}
          dipnotNo={dipnotNo}
          modelAdi={parentName}
          setDip={setDip}
        />
      ) : null}

      <MaddiDogrulamaYorumComponent parentName={parentName} childName={childName} />
    </PageContainer>
  );
};

export default Page;
