"use client";

import React, { useEffect, useState, useMemo } from "react";
import { Box, Button, Grid, Typography } from "@mui/material";
import { usePathname, useSearchParams } from "next/navigation";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import PageContainer from "@/app/(AdminUI)/components/Container/PageContainer";
import Breadcrumb from "@/app/(AdminUI)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import SozlesmeTestleri from "@/app/(AdminUI)/components/CalismaKagitlari/MaddiDogrulama/SozlesmeTestleri";
import MaddiDogrulamaYorumComponent from "@/app/(AdminUI)/components/CalismaKagitlari/MaddiDogrulama/MaddiDogrulamaYorumComponent";
import { getMaddiDogrulama, getDipnotNoByDipnotAdi } from "@/api/MaddiDogrulama/MaddiDogrulama";
import MaddiDogrulamaEkBelgeYukleButton from "@/app/(AdminUI)/components/CalismaKagitlari/Cards/MaddiDogrulamaEkBelgeYukleButton";

const SozlesmeTestleriPage = () => {
    const user = useSelector((state: AppState) => state.userReducer);
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const documentTitle = searchParams.get('title') || "Sözleşme Testleri";
    const [dipnotNo, setDipnotNo] = useState<string>("");
    const [isClickedVarsayilanaDon, setIsClickedVarsayilanaDon] = useState(false);

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
            const result = await getDipnotNoByDipnotAdi(user.denetciId || 0,
                user.denetlenenId || 0,
                user.yil || 0,
                parentName,
                user.denetimTuru === "Tfrs"
            );
            setDipnotNo(result);
        } catch (error) {
            console.log("An error occurred:", error);
        }
    };

    useEffect(() => {
        if (parentName) {
            fetchDipTitle();
            fetchData2();
        }
    }, [parentName, user.token]);

    const BCrumbList = useMemo(() => {
        return [
            { to: "/DenetimKanitlari", title: "Denetim Kanıtları" },
            { to: "/DenetimKanitlari/MaddiDogrulamaProsedurleri", title: "Maddi Doğrulama Prosedürleri" },
            { to: basePath || "/DenetimKanitlari/MaddiDogrulamaProsedurleri", title: dip || parentName },
            { to: currentPath, title: "Sözleşme Testleri" },
        ];
    }, [basePath, currentPath, dip, parentName]);

    return (
        <PageContainer title={`${dip} | Sözleşme Testleri`} description="Sözleşme Testleri">
            <Breadcrumb title="" subtitle="Sözleşme Testleri" items={BCrumbList}>
                <Grid container justifyContent="center" alignItems="center" sx={{ mt: 1 }}>
                    <Grid
                        size={{
                            xs: 12,
                            md: 6,
                            lg: 4
                        }}>
                        <MaddiDogrulamaEkBelgeYukleButton
                            belgeAdi={`${dip || parentName}|||${documentTitle}`}
                            text="Belge Yükle"
                            fullWidth
                            sx={{ height: 45 }}
                        />
                    </Grid>

                    <Grid
                        size={{
                            xs: 12,
                            md: 6,
                            lg: 2
                        }}></Grid>

                    <Grid
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center", // İlk koddaki buton merkezleme
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
                            sx={{ width: "100%", height: 45, textTransform: 'none', fontSize: '0.9rem' }}
                        >
                            Varsayılana Dön
                        </Button>
                    </Grid>
                </Grid>
            </Breadcrumb>
            <SozlesmeTestleri
                isClickedVarsayilanaDon={isClickedVarsayilanaDon}
                setIsClickedVarsayilanaDon={setIsClickedVarsayilanaDon}
                dipnotNo={dipnotNo}
                modelAdi={childName}
            />
            <MaddiDogrulamaYorumComponent parentName={parentName} childName={childName} />
        </PageContainer>
    );
};

export default SozlesmeTestleriPage;