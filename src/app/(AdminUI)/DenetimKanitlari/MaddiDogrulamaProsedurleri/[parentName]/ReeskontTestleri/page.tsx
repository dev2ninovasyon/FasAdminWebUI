"use client";

import React, { useEffect, useState, useMemo } from "react";
import { Box } from "@mui/material";
import { usePathname, useSearchParams } from "next/navigation";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import { getMaddiDogrulama } from "@/api/MaddiDogrulama/MaddiDogrulama";
import PageContainer from "@/app/(AdminUI)/components/Container/PageContainer";
import Breadcrumb from "@/app/(AdminUI)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import ReeskontTestleri from "@/app/(AdminUI)/components/CalismaKagitlari/MaddiDogrulama/ReeskontTestleri";
import MaddiDogrulamaYorumComponent from "@/app/(AdminUI)/components/CalismaKagitlari/MaddiDogrulama/MaddiDogrulamaYorumComponent";
import { getDipnotNoByDipnotAdi } from "@/api/MaddiDogrulama/MaddiDogrulama";
import MaddiDogrulamaEkBelgeYukleButton from "@/app/(AdminUI)/components/CalismaKagitlari/Cards/MaddiDogrulamaEkBelgeYukleButton";

const ReeskontTestleriPage = () => {
    const user = useSelector((state: AppState) => state.userReducer);
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const documentTitle = searchParams.get('title') || "Reeskont Testleri";
    const [dipnotNo, setDipnotNo] = useState<string>("");

    // URL segmentlerinden hiyerarşiyi çözüyoruz
    const segments = pathname.split("/");
    const parentNameIndex = segments.indexOf("MaddiDogrulamaProsedurleri") + 1;
    const parentName = segments[parentNameIndex];
    const childName = segments[parentNameIndex + 1];

    const [dip, setDip] = useState("");

    const currentPath = pathname;
    const basePath = useMemo(() => {
        if (!pathname) return "";
        const parts = pathname.split("/").filter(Boolean);
        if (parts.length <= 1) return "/";
        return "/" + parts.slice(0, -1).join("/");
    }, [pathname]);

    // Diğer sayfanızdaki normalizeString fonksiyonu
    function normalizeString(str: string): string {
        const turkishChars: { [key: string]: string } = {
            ç: "c", ğ: "g", ı: "i", ö: "o", ş: "s", ü: "u",
            Ç: "C", Ğ: "G", İ: "I", Ö: "O", Ş: "S", Ü: "U",
        };
        let normalized = str.replace(/[çğıöşüÇĞÖŞÜıİ]/g, (match) => turkishChars[match] || match);
        normalized = normalized.replace(/\s+/g, "");
        return normalized.toLowerCase();
    }

    // Başlık bilgisini çeken fetchData fonksiyonu
    const fetchDipTitle = async () => {
        try {
            const maddiDogrulama = await getMaddiDogrulama(user.denetimTuru || "",
                user.denetlenenId || 0,
                user.yil || 0
            );

            const found = maddiDogrulama?.find((veri: any) => normalizeString(veri?.name || "") === normalizeString(parentName));
            if (found?.name) setDip(found.name);
        } catch (error) {
            console.log("An error occurred while fetching dipnot name:", error);
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
            fetchDipTitle();
            fetchData2();
        }
    }, [parentName, user.token]);

    const BCrumbList = useMemo(() => {
        return [
            { to: "/DenetimKanitlari", title: "Denetim Kanıtları" },
            { to: "/DenetimKanitlari/MaddiDogrulamaProsedurleri", title: "Maddi Doğrulama Prosedürleri" },
            { to: basePath || "/DenetimKanitlari/MaddiDogrulamaProsedurleri", title: dip || parentName },
            { to: currentPath, title: "Reeskont Testleri" },
        ];
    }, [basePath, currentPath, dip, parentName]);

    return (
        <PageContainer
            title={`${dip || parentName} | Reeskont Testleri`}
            description="Reeskont Testleri"
        >
            <Breadcrumb
                title=""
                subtitle="Reeskont Testleri"
                items={BCrumbList}
            >
                <MaddiDogrulamaEkBelgeYukleButton
                    belgeAdi={`${dip || parentName}|||${documentTitle}`}
                    text="Belge Yükle"
                    fullWidth={false}
                    sx={{ width: 140, height: 45, lineHeight: 1.2, fontSize: '0.9rem', whiteSpace: 'normal', textAlign: 'center' }}
                />
            </Breadcrumb>

            <Box sx={{ mb: 3 }}>
                <ReeskontTestleri
                    dipnotNo={dipnotNo}
                    modelAdi={parentName}
                />
            </Box>

            <MaddiDogrulamaYorumComponent
                parentName={parentName}
                childName={childName}
            />
        </PageContainer>
    );
};

export default ReeskontTestleriPage;