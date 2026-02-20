"use client";

import React, { useEffect, useState, useMemo } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import PageContainer from "@/app/(AdminUI)/components/Container/PageContainer";
import Breadcrumb from "@/app/(AdminUI)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import { getDipnotNoByDipnotAdi, getMaddiDogrulama } from "@/api/MaddiDogrulama/MaddiDogrulama";
import AmortismanKontrolleri from "@/app/(AdminUI)/components/CalismaKagitlari/MaddiDogrulama/AmortismanKontrolleri";
import MaddiDogrulamaYorumComponent from "@/app/(AdminUI)/components/CalismaKagitlari/MaddiDogrulama/MaddiDogrulamaYorumComponent";
import { Box, Typography, CircularProgress, Grid, Button } from "@mui/material";
import { useRouter } from "next/navigation";
import { useLoading } from "@/contexts/LoadingContext";
import MaddiDogrulamaEkBelgeYukleButton from "@/app/(AdminUI)/components/CalismaKagitlari/Cards/MaddiDogrulamaEkBelgeYukleButton";

const Page = () => {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const documentTitle = searchParams.get('title') || "Amortisman Kontrolleri";
    const segments = pathname.split("/");
    const parentNameIndex = segments.indexOf("MaddiDogrulamaProsedurleri") + 1;
    const parentName = segments[parentNameIndex];
    const childName = segments[parentNameIndex + 1];

    const user = useSelector((state: AppState) => state.userReducer);
    const router = useRouter();
    const { setLoading } = useLoading();

    const [dip, setDip] = useState<string>("");
    const [parentTitle, setParentTitle] = useState<string>("");
    const [isSearching, setIsSearching] = useState<boolean>(true);

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

    useEffect(() => {
        const fetchData = async () => {
            if (!user.token || !user.denetlenenId) return;

            try {
                setIsSearching(true);

                // Fetch Parent Title
                const maddiDogrulama = await getMaddiDogrulama(
                    user.denetimTuru || "",
                    user.denetlenenId || 0,
                    user.yil || 0
                );
                const found = maddiDogrulama?.find((veri: any) =>
                    veri.id.toString() === parentName ||
                    normalizeString(veri?.name || "") === normalizeString(parentName)
                );
                if (found?.name) {
                    setParentTitle(found.name);
                } else {
                    setParentTitle(parentName);
                }

                // Fetch Dipnot No
                const dipnotNo = await getDipnotNoByDipnotAdi(
                    user.denetciId || 0,
                    user.denetlenenId || 0,
                    user.yil || 0,
                    parentName,
                    user.denetimTuru === "Tfrs"
                );

                if (dipnotNo) {
                    setDip(dipnotNo);
                } else {
                    console.warn("Dipnot bulunamadı, varsayılan '05' kullanılıyor.");
                    setDip("05");
                }
            } catch (error) {
                console.log("Veri çekme hatası:", error);
            } finally {
                setIsSearching(false);
            }
        };
        fetchData();
    }, [user.token, user.denetlenenId, user.yil, user.denetimTuru, parentName]);

    const BCrumbList = useMemo(() => {
        return [
            { to: "/DenetimKanitlari", title: "Denetim Kanıtları" },
            { to: "/DenetimKanitlari/MaddiDogrulamaProsedurleri", title: "Maddi Doğrulama Prosedürleri" },
            { to: basePath || "/DenetimKanitlari/MaddiDogrulamaProsedurleri", title: parentTitle || parentName },
            { to: currentPath, title: "Amortisman Kontrolleri" },
        ];
    }, [basePath, currentPath, parentTitle, parentName]);

    return (
        <PageContainer
            title={`${parentTitle} | Amortisman Kontrolleri`}
            description="this is Amortisman Kontrolleri">
            <Breadcrumb
                title=""
                subtitle={`Amortisman Kontrolleri`}
                items={BCrumbList}>
                <Grid container justifyContent="center" alignItems="center" sx={{ gap: 1 }}>
                    <MaddiDogrulamaEkBelgeYukleButton
                        belgeAdi={`${parentTitle || parentName}|||${documentTitle}`}
                        text="Belge Yükle"
                        fullWidth
                        sx={{ height: 45, flex: 1 }}
                    />
                    <Button
                        variant="outlined"
                        color="primary"
                        sx={{ textTransform: 'none', height: 45, flex: 1, fontSize: '0.9rem' }}
                        onClick={() => {
                            setLoading(true);
                            router.push(`/DenetimKanitlari/MaddiDogrulamaProsedurleri/CalismaKagidiRaporu?parentName=${parentTitle || parentName}`);
                        }}
                    >
                        Çalışma Kağıdı Oluştur
                    </Button>
                </Grid>
            </Breadcrumb>

            {isSearching ? (
                <Box sx={{ p: 5, textAlign: 'center' }}>
                    <CircularProgress size={24} sx={{ mb: 2 }} />
                    <Typography color="textSecondary">Dipnot bilgisi sorgulanıyor...</Typography>
                </Box>
            ) : dip ? (
                <>
                    <AmortismanKontrolleri
                        denetlenenId={user.denetlenenId || 0}
                        yil={user.yil || 0}
                        dipnotNo={dip}
                    />
                    <Box mt={3}>
                        <MaddiDogrulamaYorumComponent
                            parentName={parentName}
                            childName="AmortismanKontrolleri"
                        />
                    </Box>
                </>
            ) : (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Typography color="error">Dipnot numarası alınamadığı için tablo yüklenemedi.</Typography>
                </Box>
            )}
        </PageContainer>
    );
};

export default Page;
