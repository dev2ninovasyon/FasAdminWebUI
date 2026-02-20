"use client";

import React, { useEffect, useState, useMemo } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import PageContainer from "@/app/(AdminUI)/components/Container/PageContainer";
import Breadcrumb from "@/app/(AdminUI)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import { getDipnotNoByDipnotAdi, getMaddiDogrulama } from "@/api/MaddiDogrulama/MaddiDogrulama";
import FaturaTestleriTablo from "@/app/(AdminUI)/components/CalismaKagitlari/MaddiDogrulama/FaturaTestleri";
import MaddiDogrulamaYorumComponent from "@/app/(AdminUI)/components/CalismaKagitlari/MaddiDogrulama/MaddiDogrulamaYorumComponent";
import { Box, CircularProgress } from "@mui/material";
import MaddiDogrulamaEkBelgeYukleButton from "@/app/(AdminUI)/components/CalismaKagitlari/Cards/MaddiDogrulamaEkBelgeYukleButton";

const Page = () => {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const documentTitle = searchParams.get('title') || "Fatura Testleri";
    const segments = pathname.split("/");
    const parentName = segments[segments.indexOf("MaddiDogrulamaProsedurleri") + 1];
    const childName = segments[segments.indexOf("MaddiDogrulamaProsedurleri") + 2];

    const user = useSelector((state: AppState) => state.userReducer);
    const [dip, setDip] = useState<string>("");
    const [dipnotNo, setDipnotNo] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(true);

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
            { to: currentPath, title: "Fatura Testleri" },
        ];
    }, [basePath, currentPath, dip, parentName]);

    useEffect(() => {
        if (parentName) {
            fetchDipTitle();
        }
        const fetchDipnot = async () => {
            if (!user.token || !user.denetlenenId) return;
            try {
                const result = await getDipnotNoByDipnotAdi(
                    user.denetciId || 0, user.denetlenenId || 0, user.yil || 0, parentName, user.denetimTuru === "Tfrs"
                );
                setDipnotNo(result || "10");
            } catch (error) { setDipnotNo("10"); } finally { setLoading(false); }
        };
        fetchDipnot();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [parentName, user]);



    return (
        <PageContainer title="Ticari Borçlar / Fatura Testleri" description="Fatura Testleri">
            <Breadcrumb title="" subtitle="Fatura Testleri" items={BCrumbList}>
                <MaddiDogrulamaEkBelgeYukleButton
                    belgeAdi={`${dip || parentName}|||${documentTitle}`}
                    text="Belge Yükle"
                    fullWidth={false}
                    sx={{ width: 140, height: 45, lineHeight: 1.2, fontSize: '0.9rem', whiteSpace: 'normal', textAlign: 'center' }}
                />
            </Breadcrumb>
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>
            ) : (
                <>
                    <FaturaTestleriTablo dipnotNo={dipnotNo} />
                    <Box mt={3}>
                        <MaddiDogrulamaYorumComponent parentName={parentName} childName={childName} />
                    </Box>
                </>
            )}
        </PageContainer>
    );
};

export default Page;