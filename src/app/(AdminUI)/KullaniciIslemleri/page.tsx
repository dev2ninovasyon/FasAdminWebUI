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
        title: "Admin MenÃ¼",
    },
    {
        to: "/KullaniciIslemleri",
        title: "KullanÄ±cÄ± Ä°ÅŸlemleri",
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
                console.error("DenetÃ§i firmalar getirilemedi", error);
            }
        };
        fetchDenetciler();
    }, [user.token]);

    return (
        <PageContainer title="KullanÄ±cÄ± Ä°ÅŸlemleri" description="KullanÄ±cÄ± Ä°ÅŸlemleri">
            <Breadcrumb title="KullanÄ±cÄ± Ä°ÅŸlemleri" items={BCrumb} />
            <ParentCard title="Firma BazlÄ± KullanÄ±cÄ± Listesi">
                <Grid container spacing={3}>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Box mb={3}>
                            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                                DenetÃ§i Firma SeÃ§in
                            </Typography>
                            <TextField
                                select
                                fullWidth
                                value={selectedDenetciId}
                                onChange={(e) => setSelectedDenetciId(Number(e.target.value))}
                                placeholder="Firma SeÃ§iniz"
                            >
                                <MenuItem value="">
                                    <em>Firma SeÃ§iniz</em>
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

