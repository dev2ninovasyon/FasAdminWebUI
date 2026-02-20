"use client";
import {
    getMaddiDogrulama,
    getDipnotNoByDipnotAdi,
} from "@/api/MaddiDogrulama/MaddiDogrulama";
import PageContainer from "@/app/(AdminUI)/components/Container/PageContainer";
import Breadcrumb from "@/app/(AdminUI)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import MaddiDogrulamaYorumComponent from "@/app/(AdminUI)/components/CalismaKagitlari/MaddiDogrulama/MaddiDogrulamaYorumComponent";

import DonusumKayitlariKontrol from "@/app/(AdminUI)/components/CalismaKagitlari/MaddiDogrulama/DonusumKayitlariKontrol";
import MaddiDogrulamaEkBelgeYukleButton from "@/app/(AdminUI)/components/CalismaKagitlari/Cards/MaddiDogrulamaEkBelgeYukleButton";

const Page = () => {
    const user = useSelector((state: AppState) => state.userReducer);

    const pathname = usePathname();
    const searchParams = useSearchParams();
    const documentTitle = searchParams.get('title') || "Dönüşüm Kayıtları Kontrol";
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

    const BCrumb = useMemo(() => {
        return [
            { to: "/DenetimKanitlari", title: "Denetim Kanıtları" },
            { to: "/DenetimKanitlari/MaddiDogrulamaProsedurleri", title: "Maddi Doğrulama Prosedürleri" },
            { to: basePath || "/DenetimKanitlari/MaddiDogrulamaProsedurleri", title: dip || parentName },
            { to: currentPath, title: "Dönüşüm Kayıtları Kontrol" },
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
            const dipnotNo = await getDipnotNoByDipnotAdi(user.denetciId || 0,
                user.denetlenenId || 0,
                user.yil || 0,
                parentName,
                user.denetimTuru === "Tfrs"
            );

            console.log("dipnotNo", dipnotNo);
            setDipnotNo(dipnotNo);
        } catch (error) {
            console.log("An error occurred:", error);
        }
    };

    useEffect(() => {
        if (parentName && parentName.length > 0) {
            fetchData();
            fetchData2();
        }
    }, [parentName]);

    return (
        <PageContainer
            title={`${dip} | Dönüşüm Kayıtları Kontrol`}
            description="Dönüşüm Kayıtları Kontrol"
        >
            <Breadcrumb
                title=""
                subtitle="Dönüşüm Kayıtları Kontrol"
                items={BCrumb}
            >
                <MaddiDogrulamaEkBelgeYukleButton
                    belgeAdi={`${dip || parentName}|||${documentTitle}`}
                    text="Belge Yükle"
                    fullWidth={false}
                    sx={{ width: 140, height: 45, lineHeight: 1.2, fontSize: '0.9rem', whiteSpace: 'normal', textAlign: 'center' }}
                />
            </Breadcrumb>

            {dipnotNo != "" ? (
                <DonusumKayitlariKontrol
                    controller="DonusumKayitlariKontrol"
                    dipnotNo={dipnotNo}
                />
            ) : (
                <></>
            )}

            <MaddiDogrulamaYorumComponent parentName={parentName} childName={childName} />
        </PageContainer>
    );
};

export default Page;
