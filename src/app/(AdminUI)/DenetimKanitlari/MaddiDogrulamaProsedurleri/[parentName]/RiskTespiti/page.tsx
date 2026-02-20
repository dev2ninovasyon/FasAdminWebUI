"use client";
import React, { useEffect, useState, useMemo } from "react";
import RiskTespiti from "@/app/(AdminUI)/components/CalismaKagitlari/MaddiDogrulama/RiskTespiti";
import PageContainer from "@/app/(AdminUI)/components/Container/PageContainer";
import Breadcrumb from "@/app/(AdminUI)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import MaddiDogrulamaYorumComponent from "@/app/(AdminUI)/components/CalismaKagitlari/MaddiDogrulama/MaddiDogrulamaYorumComponent";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import { getMaddiDogrulama } from "@/api/MaddiDogrulama/MaddiDogrulama";
import { useLoading } from "@/contexts/LoadingContext";
import { Button, Grid } from "@mui/material";
import MaddiDogrulamaEkBelgeYukleButton from "@/app/(AdminUI)/components/CalismaKagitlari/Cards/MaddiDogrulamaEkBelgeYukleButton";

const Page = () => {
    const user = useSelector((state: AppState) => state.userReducer);
    const router = useRouter();
    const { setLoading } = useLoading();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const documentTitle = searchParams.get('title') || "Risk Tespiti";
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
            const maddiDogrulama = await getMaddiDogrulama(user.denetimTuru || "", user.denetlenenId || 0, user.yil || 0
            );
            const found = maddiDogrulama?.find((veri: any) => normalizeString(veri?.name || "") === normalizeString(parentName));
            if (found?.name) setDip(found.name);
        } catch (error) {
            console.log("fetchDipTitle error:", error);
        }
    };

    useEffect(() => {
        if (parentName) {
            fetchDipTitle();
        }
    }, [parentName, user.token]);

    const BCrumbList = useMemo(() => {
        return [
            { to: "/DenetimKanitlari", title: "Denetim Kanıtları" },
            { to: "/DenetimKanitlari/MaddiDogrulamaProsedurleri", title: "Maddi Doğrulama Prosedürleri" },
            { to: basePath || "/DenetimKanitlari/MaddiDogrulamaProsedurleri", title: dip || parentName },
            { to: currentPath, title: "Risk Tespiti" },
        ];
    }, [basePath, currentPath, dip, parentName]);

    return (
        <PageContainer
            title={`${dip} | Risk Tespiti`}
            description="Risk Tespiti"
        >
            <Breadcrumb
                title=""
                subtitle="Risk Tespiti"
                items={BCrumbList}
            >
                <Grid container justifyContent="center" alignItems="center" sx={{ gap: 1 }}>
                    <MaddiDogrulamaEkBelgeYukleButton
                        belgeAdi={`${dip || parentName}|||${documentTitle}`}
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
                            router.push(`/DenetimKanitlari/MaddiDogrulamaProsedurleri/CalismaKagidiRaporu?parentName=${dip || parentName}`);
                        }}
                    >
                        Çalışma Kağıdı Oluştur
                    </Button>
                </Grid>
            </Breadcrumb>
            <RiskTespiti
                controller="FinansalTablolarDenetimRiskiBelirleme"
                dipnotAdi={parentName} // dipnotAdi olarak dinamik parentId'yi gönderiyoruz
                setDip={setDip}
            />
            <MaddiDogrulamaYorumComponent parentName={parentName} childName={childName} />
        </PageContainer>
    );
};

export default Page;
