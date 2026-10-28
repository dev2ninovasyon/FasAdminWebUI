"use client";

import PageContainer from "@/app/components/Container/PageContainer";
import Breadcrumb from "@/app/components/Layout/Shared/Breadcrumb/Breadcrumb";
import { Box, Button, Grid, Typography, IconButton, Menu, MenuItem, useMediaQuery, useTheme } from "@mui/material";
import { IconDotsVertical } from "@tabler/icons-react";
import { AppState } from "@/store/store";
import { useSelector } from "@/store/hooks";
import { useState } from "react";
import { CreateGroupPopUp } from "@/app/(AdminUI)/components/CalismaKagitlari/CreateGroupPopUp";
import { createCalismaKagidiVerisi } from "@/api/CalismaKagitlari/CalismaKagitlari";
import TekliCalismaKagidiBelge from "@/app/(AdminUI)/components/CalismaKagitlari/TekliCalismaKagidiBelge";
import EkBelgeYukleButton from "@/app/(AdminUI)/components/CalismaKagitlari/Cards/EkBelgeYukleButton"

const BCrumb = [
    {
        to: "/StandartCalismaKagitlari",
        title: "Standart Çalışma Kağıtları",
    },
    {
        to: "/StandartCalismaKagitlari/DenetimPlani",
        title: "Genel Bağımsız Denetim Planı",
    },
];

const Page = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const menuOpen = Boolean(anchorEl);

    const [islem, setIslem] = useState("");
    const [isCreatePopUpOpen, setIsCreatePopUpOpen] = useState(false);

    const [isClickedYeniGrupEkle, setIsClickedYeniGrupEkle] = useState(false);
    const [isClickedVarsayilanaDon, setIsClickedVarsayilanaDon] = useState(false);

    const [tamamlanan, setTamamlanan] = useState(0);
    const [toplam, setToplam] = useState(0);

    const controller = "DenetimPlani";
    const grupluMu = false;
    const alanAdi = "Metin";

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleOpen = () => {
        setIsCreatePopUpOpen(true);
        setIsClickedYeniGrupEkle(true);
        handleMenuClose();
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
            <Breadcrumb title="Genel Bağımsız Denetim Planı" items={BCrumb}>
                <>
                    {isMobile ? (
                        <Grid
                            container
                            sx={{
                                width: "95%",
                                height: "100%",
                                margin: "0 auto",
                                justifyContent: "space-between",
                                alignItems: "center",
                            }}
                        >
                            <Grid size={8}>
                                <Typography
                                    variant="body2"
                                    sx={{
                                        overflowWrap: "break-word",
                                        wordWrap: "break-word",
                                        textAlign: "left",
                                    }}
                                >
                                    {tamamlanan}/{toplam} Tamamlandı
                                </Typography>
                            </Grid>
                            <Grid sx={{ display: "flex", justifyContent: "flex-end" }} size={4}>
                                <IconButton
                                    onClick={handleMenuOpen}
                                    size="small"
                                    aria-label="menu"
                                >
                                    <IconDotsVertical />
                                </IconButton>
                                <Menu
                                    id="breadcrumb-menu"
                                    anchorEl={anchorEl}
                                    open={menuOpen}
                                    onClose={handleMenuClose}
                                >
                                    {grupluMu && (
                                        <MenuItem onClick={handleOpen}>
                                            Yeni Grup Ekle
                                        </MenuItem>
                                    )}
                                    <MenuItem onClick={handleMenuClose}>
                                        Belge Yükle
                                    </MenuItem>
                                    <MenuItem
                                        onClick={() => { setIsClickedVarsayilanaDon(true); handleMenuClose(); }}
                                        disabled={isClickedVarsayilanaDon}
                                    >
                                        Varsayılana Dön
                                    </MenuItem>
                                </Menu>
                            </Grid>
                        </Grid>
                    ) : (
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
                                    md: grupluMu ? 2.8 : 3.8,
                                    lg: grupluMu ? 2.8 : 3.8
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
                            {grupluMu && (
                                <Grid
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                    size={{
                                        xs: 3.8,
                                        md: grupluMu ? 2.8 : 3.8,
                                        lg: grupluMu ? 2.8 : 3.8
                                    }}>
                                    <Button
                                        size="medium"
                                        variant="outlined"
                                        color="primary"
                                        onClick={() => handleOpen()}
                                        sx={{ width: "100%" }}
                                    >
                                        <Typography
                                            variant="body1"
                                            sx={{
                                                overflowWrap: "break-word",
                                                wordWrap: "break-word",
                                            }}
                                        >
                                            Yeni Grup Ekle
                                        </Typography>{" "}
                                    </Button>
                                </Grid>
                            )}
                            <Grid
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                                size={{
                                    xs: 5.8,
                                    md: grupluMu ? 2.8 : 3.8,
                                    lg: grupluMu ? 2.8 : 3.8
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
                                    md: grupluMu ? 2.8 : 3.8,
                                    lg: grupluMu ? 2.8 : 3.8
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
                    )}
                    {isCreatePopUpOpen && (
                        <CreateGroupPopUp
                            islem={islem}
                            setIslem={setIslem}
                            isPopUpOpen={isCreatePopUpOpen}
                            setIsPopUpOpen={setIsCreatePopUpOpen}
                            handleCreateGroup={handleCreateGroup}
                        />
                    )}
                </>
            </Breadcrumb>
            <PageContainer
                title="Genel Bağımsız Denetim Planı"
                description="this is Genel Bağımsız Denetim Planı"
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

