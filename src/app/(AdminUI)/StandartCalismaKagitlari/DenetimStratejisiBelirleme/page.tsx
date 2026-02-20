"use client";

import PageContainer from "@/app/components/Container/PageContainer";
import Breadcrumb from "@/app/components/Layout/Shared/Breadcrumb/Breadcrumb";
import { Box, Button, Grid, Typography } from "@mui/material";
import { AppState } from "@/store/store";
import { useSelector } from "@/store/hooks";
import { useState } from "react";
import { createCalismaKagidiVerisi } from "@/api/CalismaKagitlari/CalismaKagitlari";
import TekliCalismaKagidiBelge from "@/app/(AdminUI)/components/CalismaKagitlari/TekliCalismaKagidiBelge";
import EkBelgeYukleButton from "@/app/(AdminUI)/components/CalismaKagitlari/Cards/EkBelgeYukleButton"

const BCrumb = [
    {
        to: "/StandartCalismaKagitlari/DenetimStratejisiBelirleme",
        title: "Standart Çalışma Kağıtları",
    },
    {
        to: "/StandartCalismaKagitlari/DenetimStratejisiBelirleme",
        title: "Denetim Stratejisi Belirleme",
    },
];

const Page = () => {
    const [islem, setIslem] = useState("");
    const [isCreatePopUpOpen, setIsCreatePopUpOpen] = useState(false);

    const [isClickedYeniGrupEkle, setIsClickedYeniGrupEkle] = useState(false);
    const [isClickedVarsayilanaDon, setIsClickedVarsayilanaDon] = useState(false);

    const [tamamlanan, setTamamlanan] = useState(0);
    const [toplam, setToplam] = useState(0);

    const user = useSelector((state: AppState) => state.userReducer);
    const controller = "DenetimStratejisiBelirleme";
    const grupluMu = false;
    const alanAdi = "İşlem";

    const handleOpen = () => {
        setIsCreatePopUpOpen(true);
        setIsClickedYeniGrupEkle(true);
    };

    const handleCreateGroup = async (islem: string) => {
        const createdCalismaKagidiGrubu = {
            denetlenenId: 0,
            denetciId: 0,
            yil: 0,
            islem: islem,
        };

        try {
            const result = await createCalismaKagidiVerisi(
                controller || "",
                createdCalismaKagidiGrubu
            );
            if (result) {
                setIsCreatePopUpOpen(false);
                setIsClickedYeniGrupEkle(false);
            } else {
                console.log("Çalışma Kağıdı Verisi ekleme başarısız");
            }
        } catch (error) {
            console.log("Bir hata oluştu:", error);
        }
    };

    return (
        <>
            <Breadcrumb title="Denetim Stratejisi Belirleme (Şablon)" items={BCrumb}>
                <>
                    <Grid
                        container
                        sx={{
                            width: "95%",
                            height: "100%",
                            margin: "0 auto",
                            justifyContent: "space-between",
                        }}
                    >
                        <Grid
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "flex-end",
                            }}
                            size={{
                                xs: 12,
                                md: 3.8,
                                lg: 3.8
                            }}>
                            <Typography
                                variant="body1"
                                sx={{
                                    overflowWrap: "break-word",
                                    wordWrap: "break-word",
                                    textAlign: "center",
                                }}
                            >
                                {tamamlanan}/{toplam} Tamamlandı
                            </Typography>
                        </Grid>
                        <Grid
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                            size={{
                                xs: 5.8,
                                md: 3.8,
                                lg: 3.8
                            }}>
                            <EkBelgeYukleButton
                                formKodu={controller}
                                fullWidth={false}
                                text="Belge Yükle"
                            />
                        </Grid>
                        <Grid
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                            size={{
                                xs: 5.8,
                                md: 3.8,
                                lg: 3.8
                            }}>
                            <Button
                                size="medium"
                                variant="outlined"
                                color="primary"
                                disabled={isClickedVarsayilanaDon}
                                onClick={() => setIsClickedVarsayilanaDon(true)}
                                sx={{ width: "100%" }}
                            >
                                <Typography
                                    variant="body1"
                                    sx={{ overflowWrap: "break-word", wordWrap: "break-word" }}
                                >
                                    Varsayılana Dön
                                </Typography>
                            </Button>
                        </Grid>
                    </Grid>
                </>
            </Breadcrumb>
            <PageContainer
                title="Denetim Stratejisi Belirleme"
                description="Denetim Stratejisi Belirleme Şablon Yönetimi"
            >
                <Box>
                    <TekliCalismaKagidiBelge
                        controller={controller}
                        grupluMu={grupluMu}
                        alanAdi={alanAdi}
                        isClickedYeniGrupEkle={isClickedYeniGrupEkle}
                        isClickedVarsayilanaDon={isClickedVarsayilanaDon}
                        setIsClickedVarsayilanaDon={setIsClickedVarsayilanaDon}
                        setTamamlanan={setTamamlanan}
                        setToplam={setToplam}
                    />
                </Box>
            </PageContainer>
        </>
    );
};

export default Page;

