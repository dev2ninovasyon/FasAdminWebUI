"use client";
import React, { useState, useEffect } from "react";
import { Box, Grid, MenuItem, TextField, Typography } from "@mui/material";
import PageContainer from "@/app/components/Container/PageContainer";
import Breadcrumb from "@/app/components/Layout/Shared/Breadcrumb/Breadcrumb";
import ParentCard from "@/app/components/Shared/ParentCard";
import { getDenetciler } from "@/api/DenetciIslemleri/DenetciIslemleri";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import KullaniciTable from "@/app/components/KullaniciIslemleri/KullaniciTable";

const BCrumb = [
    {
        to: "/Anasayfa",
        title: "Admin Menü",
    },
    {
        to: "/KullaniciIslemleri",
        title: "Kullanıcı İşlemleri",
    },
];

const UserOperationsPage = () => {
    const user = useSelector((state: AppState) => state.userReducer);
    const [denetciFirmalar, setDenetciFirmalar] = useState<any[]>([]);
    const [selectedDenetciId, setSelectedDenetciId] = useState<number | "">("");

    useEffect(() => {
        const fetchDenetciler = async () => {
            try {
                const firms = await getDenetciler(user.token || "");
                setDenetciFirmalar(firms || []);
            } catch (error) {
                console.error("Denetçi firmalar getirilemedi", error);
            }
        };
        fetchDenetciler();
    }, [user.token]);

    return (
        <PageContainer title="Kullanıcı İşlemleri" description="Kullanıcı İşlemleri">
            <Breadcrumb title="Kullanıcı İşlemleri" items={BCrumb} />
            <ParentCard title="Firma Bazlı Kullanıcı Listesi">
                <Grid container spacing={3}>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Box mb={3}>
                            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                                Denetçi Firma Seçin
                            </Typography>
                            <TextField
                                select
                                fullWidth
                                value={selectedDenetciId}
                                onChange={(e) => setSelectedDenetciId(Number(e.target.value))}
                                placeholder="Firma Seçiniz"
                            >
                                <MenuItem value="">
                                    <em>Firma Seçiniz</em>
                                </MenuItem>
                                {denetciFirmalar.map((firma) => (
                                    <MenuItem key={firma.id} value={firma.id}>
                                        {firma.firmaAdi}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Box>
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                        <KullaniciTable denetciId={selectedDenetciId === "" ? null : selectedDenetciId} />
                    </Grid>
                </Grid>
            </ParentCard>
        </PageContainer>
    );
};

export default UserOperationsPage;
