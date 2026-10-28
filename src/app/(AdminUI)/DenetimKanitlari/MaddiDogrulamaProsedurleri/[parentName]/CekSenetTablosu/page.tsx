"use client";

import React, { useEffect, useState, useMemo } from "react";
import { Box } from "@mui/material";
import Breadcrumb from "@/app/(AdminUI)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import PageContainer from "@/app/(AdminUI)/components/Container/PageContainer";
import { usePathname, useSearchParams } from "next/navigation";
import CekSenetTablosu from "@/app/(AdminUI)/components/CalismaKagitlari/MaddiDogrulama/CekSenetTablosu";
import { getDipnotNoByDipnotAdi, getMaddiDogrulama } from "@/api/MaddiDogrulama/MaddiDogrulama";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import MaddiDogrulamaYorumComponent from "@/app/(AdminUI)/components/CalismaKagitlari/MaddiDogrulama/MaddiDogrulamaYorumComponent";
import MaddiDogrulamaEkBelgeYukleButton from "@/app/(AdminUI)/components/CalismaKagitlari/Cards/MaddiDogrulamaEkBelgeYukleButton";

const Page = () => {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const documentTitle = searchParams.get('title') || "Çek Senet Tablosu";
    const segments = pathname.split("/");
    const parentNameIndex = segments.indexOf("MaddiDogrulamaProsedurleri") + 1;
    const parentName = segments[parentNameIndex];
    const childName = segments[parentNameIndex + 1];

    const user = useSelector((state: AppState) => state.userReducer);
    const [dip, setDip] = useState<string>("");
    const [dipnotNo, setDipnotNo] = useState<string>("");

    const currentPath = pathname;
    const basePath = useMemo(() => {
        if (!pathname) return "";
        const parts = pathname.split("/").filter(Boolean);
        if (parts.length <= 1) return "/";
        return "/" + parts.slice(0, -1).join("/");
    }, [pathname]);

    function normalizeString(str: string): string {
        const turkishChars: { [key: string]: string } = {
            ç: "c", ğ: "g", ı: "i", ö: "o", ş: "s", ü: "u",
            Ç: "C", Ğ: "G", İ: "I", Ö: "O", Ş: "S", Ü: "U",
        };
        let normalized = str.replace(/[çğıöşüÇĞÖŞÜıİ]/g, (match) => turkishChars[match] || match);
        normalized = normalized.replace(/\s+/g, "");
        return normalized.toLowerCase();
    }

    const fetchDipTitle = async () => {
        try {
            const maddiDogrulama = await getMaddiDogrulama(user.denetimTuru || "", user.denetlenenId || 0, user.yil || 0
            );
            const found = maddiDogrulama?.find((veri: any) => normalizeString(veri?.name || "") === normalizeString(parentName));
            if (found?.name) setDip(found.name);
        } catch (error) {
            console.log("fetchDipTitle error:", error);
        }
    };

    const BCrumbList = useMemo(() => {
        return [
            { to: "/DenetimKanitlari", title: "Denetim Kanıtları" },
            { to: "/DenetimKanitlari/MaddiDogrulamaProsedurleri", title: "Maddi Doğrulama Prosedürleri" },
            { to: basePath || "/DenetimKanitlari/MaddiDogrulamaProsedurleri", title: dip || parentName },
            { to: currentPath, title: "Çek Senet Tablosu" },
        ];
    }, [basePath, currentPath, dip, parentName]);

    useEffect(() => {
        if (parentName) {
            fetchDipTitle();
        }
        const fetchData = async () => {
            try {
                const result = await getDipnotNoByDipnotAdi(user.denetciId || 0,
                    user.denetlenenId || 0,
                    user.yil || 0,
                    "Çek Senet Tablosu",
                    user.denetimTuru === "Tfrs"
                );
                if (result) {
                    setDipnotNo(result);
                }
            } catch (error) {
                console.log("Error fetching dipnot:", error);
            }
        };
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [parentName, user.token, user.denetciId, user.yil, user.denetlenenId, user.denetimTuru]);

    return (
        <PageContainer title="Çek Senet Tablosu" description="Çek Senet Tablosu">
            <Breadcrumb title="" subtitle="Çek Senet Tablosu" items={BCrumbList}>
                <MaddiDogrulamaEkBelgeYukleButton
                    belgeAdi={`${dip || parentName}|||${documentTitle}`}
                    text="Belge Yükle"
                    fullWidth={false}
                    sx={{ width: 140, height: 45, lineHeight: 1.2, fontSize: '0.9rem', whiteSpace: 'normal', textAlign: 'center' }}
                />
            </Breadcrumb>
            <Box>
                <CekSenetTablosu dipnotNo={dipnotNo} />
            </Box>
            <MaddiDogrulamaYorumComponent parentName={parentName} childName={childName} />
        </PageContainer>
    );
};

export default Page;
