"use client";

import React, { useEffect, useState, useRef, useMemo } from "react";
import { Box, Button, Grid, Typography } from "@mui/material";
import { usePathname, useSearchParams } from "next/navigation";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import PageContainer from "@/app/(AdminUI)/components/Container/PageContainer";
import Breadcrumb from "@/app/(AdminUI)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import SupheliAlacakTestleri from "@/app/(AdminUI)/components/CalismaKagitlari/MaddiDogrulama/SupheliAlacakTestleri";
import MaddiDogrulamaYorumComponent from "@/app/(AdminUI)/components/CalismaKagitlari/MaddiDogrulama/MaddiDogrulamaYorumComponent";
import { getMaddiDogrulama, getDipnotNoByDipnotAdi } from "@/api/MaddiDogrulama/MaddiDogrulama";
import { IconDeviceFloppy, IconPlus } from "@tabler/icons-react";
import MaddiDogrulamaEkBelgeYukleButton from "@/app/(AdminUI)/components/CalismaKagitlari/Cards/MaddiDogrulamaEkBelgeYukleButton";

const SupheliAlacakTestleriPage = () => {
    const user = useSelector((state: AppState) => state.userReducer);
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const documentTitle = searchParams.get('title') || "Şüpheli Alacak Testleri";
    const [dipnotNo, setDipnotNo] = useState<string>("");
    const [isClickedVarsayilanaDon, setIsClickedVarsayilanaDon] = useState<boolean>(false);
    const tableRef = useRef<any>(null); // Tablo fonksiyonlarına erişim için ref

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

    const normalizeString = (str: string): string => {
        const turkishChars: { [key: string]: string } = {
            ç: "c", ğ: "g", ı: "i", ö: "o", ş: "s", ü: "u",
            Ç: "C", Ğ: "G", İ: "I", Ö: "O", Ş: "S", Ü: "U",
        };
        let normalized = str.replace(/[çğıöşüÇĞÖŞÜıİ]/g, (match) => turkishChars[match] || match);
        normalized = normalized.replace(/\s+/g, "");
        return normalized.toLowerCase();
    };

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
            { to: currentPath, title: "Şüpheli Alacak Testleri" },
        ];
    }, [basePath, currentPath, dip, parentName]);

    return (
        <PageContainer title={`${dip} | Şüpheli Alacak Testleri`} description="Şüpheli Alacak Testleri">
            <Breadcrumb title="" subtitle="Şüpheli Alacak Testleri" items={BCrumbList}>
                <Grid container justifyContent="center" alignItems="center" sx={{ mt: 1, gap: 1 }}>
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
                        sx={{ height: 45, flex: 1, textTransform: "none", fontSize: '0.9rem' }}
                    >
                        Varsayılana Dön
                    </Button>
                </Grid>
            </Breadcrumb>

            <Box sx={{ mt: 3, mb: 3 }}>
                <SupheliAlacakTestleri
                    dipnotNo={dipnotNo}
                    modelAdi={parentName}
                    isClickedVarsayilanaDon={isClickedVarsayilanaDon}
                    setIsClickedVarsayilanaDon={setIsClickedVarsayilanaDon}
                />
            </Box>

            <MaddiDogrulamaYorumComponent parentName={parentName} childName={childName} />
        </PageContainer>
    );
};

export default SupheliAlacakTestleriPage;