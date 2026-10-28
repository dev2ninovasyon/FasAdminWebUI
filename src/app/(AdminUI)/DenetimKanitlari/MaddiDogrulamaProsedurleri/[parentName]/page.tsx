"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import PageContainer from "@/app/(AdminUI)/components/Container/PageContainer";
import Breadcrumb from "@/app/(AdminUI)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import MaddiDogrulamaListe from "@/app/(AdminUI)/components/CalismaKagitlari/MaddiDogrulama/MaddiDogrulamaListe";
import { getMaddiDogrulama } from "@/api/MaddiDogrulama/MaddiDogrulama";
import { Box, Button } from "@mui/material";
import { useRouter } from "next/navigation";
import { useLoading } from "@/contexts/LoadingContext";
import MaddiDogrulamaEkBelgeYukleButton from "@/app/(AdminUI)/components/CalismaKagitlari/Cards/MaddiDogrulamaEkBelgeYukleButton";

const Page = ({ params }: { params: Promise<{ parentName: string }> }) => {
    const { parentName } = React.use(params);
    const user = useSelector((state: AppState) => state.userReducer);
    const router = useRouter();
    const { setLoading } = useLoading();

    const [dip, setDip] = useState<string>("");
    const [viewMode, setViewMode] = useState<"list" | "card">("list");

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
            { title: dip || parentName },
        ];
    }, [dip, parentName]);

    return (
        <PageContainer title={dip || parentName} description={dip || parentName}>
            <Breadcrumb title={dip || parentName} items={BCrumbList}>
                {viewMode === "card" ? (
                    <>
                        <MaddiDogrulamaEkBelgeYukleButton
                            belgeAdi={dip || parentName}
                            text="Belge Yükle"
                            fullWidth={false}
                            sx={{ width: 110, height: 50, lineHeight: 1.2, fontSize: '0.85rem', whiteSpace: 'normal', textAlign: 'center' }}
                        />
                        <Button
                            variant="outlined"
                            color="primary"
                            sx={{ textTransform: 'none', ml: 1, width: 110, height: 50, lineHeight: 1.2, fontSize: '0.85rem', whiteSpace: 'normal', textAlign: 'center' }}
                            onClick={() => {
                                setLoading(true);
                                router.push(`/DenetimKanitlari/MaddiDogrulamaProsedurleri/CalismaKagidiRaporu?parentName=${dip || parentName}`);
                            }}
                        >
                            Çalışma Kağıdı Oluştur
                        </Button>
                    </>
                ) : undefined}
            </Breadcrumb>
            <Box>
                <MaddiDogrulamaListe parentName={parentName} onViewModeChange={setViewMode} />
            </Box>
        </PageContainer>
    );
};

export default Page;
