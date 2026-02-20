"use client";

import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "@/store/hooks";
import { CircularProgress, MenuItem, Select, InputLabel, FormControl, Button, Snackbar, Alert } from "@mui/material";
import { Box, Grid, useMediaQuery } from "@mui/material";
import { AppState } from "@/store/store";
import BelgeKontrolCard from "@/app/(AdminUI)/components/CalismaKagitlari/Cards/BelgeKontrolCard";
// Not: FisBuyukluguAnaliziChart ve ilgili API'ler henüz taşınmamış olabilir.
// Ancak sayfa yapısını ana hatlarıyla admin moduna uyarlıyorum.
// Eğer import hataları olursa bu bileşenlerin de taşınması gerekebilir.
import FisBuyukluguAnaliziChart, { FisAyVerisi } from "@/app/components/PlanVeProgram/FisBuyukluguAnalizi/FisBuyukluguAnaliziChart";
import { getFisBuyukluguAnaliziYillik, upsertFisBuyukluguAylikNot } from "@/api/PlanVeProgram/PlanVeProgram";
import PageContainer from "@/app/components/Container/PageContainer";
import Breadcrumb from "@/app/components/Layout/Shared/Breadcrumb/Breadcrumb";
import IslemlerCardHtml from "@/app/(AdminUI)/components/CalismaKagitlari/Cards/IslemlerCardHtml";

const AY_ADDAN_NO: Record<string, number> = {
    Ocak: 1, Şubat: 2, Mart: 3, Nisan: 4, Mayıs: 5, Haziran: 6,
    Temmuz: 7, Ağustos: 8, Eylül: 9, Ekim: 10, Kasım: 11, Aralık: 12,
};

const BCrumb = [
    { to: "/StandartCalismaKagitlari", title: "Standart Çalışma Kağıtları" },
    { to: "/StandartCalismaKagitlari/FisBuyukluguAnalizi", title: "Fiş Büyüklüğü Analizi" },
];

const Page = () => {
    const user = useSelector((state: AppState) => state.userReducer);
    const [aylar, setAylar] = useState<FisAyVerisi[]>([]);
    const [loading, setLoading] = useState(true);
    const controller = "FisBuyukluguAnalizi";
    const [saveLoading, setSaveLoading] = useState(false);
    const [snack, setSnack] = useState<{ open: boolean; message: string; severity: "success" | "error" | "info" }>({
        open: false, message: "", severity: "success"
    });
    const timersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
    const [seciliAy, setSeciliAy] = useState<string>("Ocak");
    const chartDomMapRef = useRef<Record<string, HTMLDivElement | null>>({});
    const chartImageMapRef = useRef<Record<string, string>>({});

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Admin modunda ID'ler 0
                const result = await getFisBuyukluguAnaliziYillik(0, 0, 0, false);
                setAylar(result || []);
            } catch (err) {
                console.log("Fiş büyüklüğü verisi alınamadı:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
        return () => {
            Object.values(timersRef.current).forEach((t) => clearTimeout(t));
        };
    }, []);

    const handleNotChange = (ay: string, value: string) => {
        setAylar(prev =>
            prev.map(x => (x.ay === ay ? { ...x, not: value } : x))
        );
    };

    const saveNoteForMonth = async (ay: string) => {
        if (timersRef.current[ay]) {
            clearTimeout(timersRef.current[ay]);
            delete timersRef.current[ay];
        }
        const monthNoFromMap = AY_ADDAN_NO[ay as keyof typeof AY_ADDAN_NO];
        const monthNoFromIndex = Math.max(1, aylar.findIndex((x) => x.ay === ay) + 1);
        const ayNo = monthNoFromMap || monthNoFromIndex;
        const current = aylar.find(x => x.ay === ay);
        const value = current?.not ?? "";
        try {
            setSaveLoading(true);
            // Admin modunda ID'ler 0
            await upsertFisBuyukluguAylikNot(0, 0, 0, ayNo, value);
            setSnack({ open: true, message: `${ay} notu kaydedildi.`, severity: "success" });
        } catch (e: any) {
            console.log("Not kaydedilemedi:", e);
            setSnack({ open: true, message: `${ay} notu kaydedilemedi.`, severity: "error" });
        } finally {
            setSaveLoading(false);
        }
    };

    const registerChartDom = (ay: string, el: HTMLDivElement | null) => {
        chartDomMapRef.current[ay] = el;
    };

    const esc = (s: string) =>
        s.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;").replaceAll("'", "&#39;");

    const collectChartImages = async () => {
        const ApexChartsAny: any = (window as any).ApexCharts;
        if (!ApexChartsAny?.exec) return;

        for (const item of aylar) {
            const id = `fis-${item.ay}`;
            try {
                const res = await ApexChartsAny.exec(id, "dataURI");
                if (res?.imgURI) chartImageMapRef.current[item.ay] = res.imgURI;
            } catch (e) {
                console.log("Grafik export başarısız:", id, e);
            }
        }
    };

    const buildSectionHtml = (item: FisAyVerisi) => {
        const imgSrc = chartImageMapRef.current[item.ay] || "";
        const rows = item.gunler
            .map((g: string, i: number) => {
                const v = item.seri?.[0]?.data?.[i] ?? 0;
                return `<tr>
          <td style="border:1px solid #444;padding:6px;">${esc(g)}</td>
          <td style="border:1px solid #444;padding:6px;text-align:right;">${Intl.NumberFormat("tr-TR").format(v)}</td>
        </tr>`;
            })
            .join("");

        const noteHtml =
            item.not && item.not.trim().length > 0
                ? `<p style="margin:8px 0 0 0;"><strong>Not:</strong> ${esc(item.not)}</p>`
                : "";

        return `
    <h2 style="font-size:18px;margin:18px 0 8px;">${esc(item.ay)} Ayı Fişleri</h2>
    <div style="margin:6px 0; text-align:center;">
      ${imgSrc
                ? `<img src="${imgSrc}" alt="${esc(item.ay)} grafiği" style="width:16cm; max-width:100%; height:auto; display:inline-block;" />`
                : "<!-- PNG export bulunamadı -->"
            }
    </div>
    <table style="border-collapse:collapse;width:100%;margin-top:8px;font-size:12px; table-layout:fixed; word-wrap:break-word;">
      <thead>
        <tr>
          <th style="text-align:left;border:1px solid #444;padding:6px;background:#f2f2f2;">Gün</th>
          <th style="text-align:right;border:1px solid #444;padding:6px;background:#f2f2f2;">Fiş Sayısı</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
    ${noteHtml}
  `;
    };

    const buildFullHtmlAsync = async () => {
        await collectChartImages();
        const sections = aylar.map(buildSectionHtml).join("\n");
        return `
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="utf-8" />
  <title>Fiş Büyüklüğü Analizi</title>
  <style>
    body { font-family: Arial, Helvetica, sans-serif; font-size: 13px; color:#000; }
    h1 { font-size: 22px; margin: 0 0 12px; }
    img { max-width: 100%; height: auto; }
  </style>
</head>
<body>
  <h1>Fiş Büyüklüğü Analizi</h1>
  ${sections}
</body>
</html>
`.trim();
    };

    if (loading) {
        return (
            <PageContainer title="Fiş Büyüklüğü Analizi" description="this is Fiş Büyüklüğü Analizi">
                <Breadcrumb title="Fiş Büyüklüğü Analizi" items={BCrumb} />
                <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
                    <CircularProgress />
                </Box>
            </PageContainer>
        );
    }

    const gosterilecekAylar = seciliAy === "Tümü" ? [] : aylar.filter((x) => x.ay === seciliAy);

    return (
        <PageContainer title="Fiş Büyüklüğü Analizi" description="this is Fiş Büyüklüğü Analizi">
            <Breadcrumb title="Fiş Büyüklüğü Analizi" items={BCrumb} />
            <Grid container spacing={3}>
                <Grid
                    sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2, gap: 1 }}
                    size={{
                        xs: 12,
                        lg: 12
                    }}>
                    <FormControl size="small" sx={{ minWidth: 220 }}>
                        <InputLabel id="ay-secimi-label">Ay Seç</InputLabel>
                        <Select
                            labelId="ay-secimi-label"
                            label="Ay Seç"
                            value={seciliAy}
                            onChange={(e) => setSeciliAy(e.target.value as string)}
                        >
                            {aylar.map((a) => (
                                <MenuItem key={a.ay} value={a.ay}>{a.ay}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>

                <Grid
                    size={{
                        xs: 12,
                        lg: 12
                    }}>
                    {gosterilecekAylar.length > 0 ? (
                        <FisBuyukluguAnaliziChart
                            title={`Fiş Büyüklüğü - ${seciliAy}`}
                            aylar={gosterilecekAylar}
                            onNotChange={handleNotChange}
                            onSaveNote={saveNoteForMonth}
                            saveLoading={saveLoading}
                            registerChartDom={registerChartDom}
                        />
                    ) : (
                        <Box sx={{ py: 2, color: "text.secondary" }}>
                            Seçili ay yok.
                        </Box>
                    )}
                </Grid>

                <Box
                    sx={{
                        position: 'fixed',
                        top: -10000,
                        left: -10000,
                        width: 1200,
                        height: 1,
                        overflow: 'hidden',
                        pointerEvents: 'none',
                        visibility: 'hidden',
                        zIndex: -1,
                    }}
                    aria-hidden
                >
                    <FisBuyukluguAnaliziChart
                        title="(offscreen)"
                        aylar={aylar}
                        onNotChange={() => { }}
                        registerChartDom={registerChartDom}
                    />
                </Box>

                <Grid
                    size={{
                        xs: 12,
                        lg: 12
                    }}>
                    <Grid container spacing={3} sx={{ width: "100%", margin: "0 auto", justifyContent: "space-between" }}>
                        <Grid
                            size={{
                                xs: 12,
                                md: 4,
                                lg: 4
                            }}>
                            <BelgeKontrolCard fetch={() => { }} hazirlayan="Denetçi - Yardımcı Denetçi" controller={controller} />
                        </Grid>
                        <Grid
                            size={{
                                xs: 12,
                                md: 4,
                                lg: 4
                            }}>
                            <BelgeKontrolCard fetch={() => { }} onaylayan="Sorumlu Denetçi" controller={controller} />
                        </Grid>
                        <Grid
                            size={{
                                xs: 12,
                                md: 4,
                                lg: 4
                            }}>
                            <BelgeKontrolCard fetch={() => { }} kaliteKontrol="Kalite Kontrol Sorumlu Denetçi" controller={controller} />
                        </Grid>
                    </Grid>

                    <Grid container sx={{ width: "100%", margin: "0 auto", mt: 3 }}>
                        <Grid
                            size={{
                                xs: 12,
                                lg: 12
                            }}>
                            <IslemlerCardHtml
                                controller={controller}
                                buildHtmlAsync={buildFullHtmlAsync}
                            />
                        </Grid>
                    </Grid>
                </Grid>

                <Snackbar
                    open={snack.open}
                    autoHideDuration={2500}
                    onClose={() => setSnack(s => ({ ...s, open: false }))}
                    anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
                >
                    <Alert
                        onClose={() => setSnack(s => ({ ...s, open: false }))}
                        severity={snack.severity}
                        variant="filled"
                        sx={{ width: "100%" }}
                    >
                        {snack.message}
                    </Alert>
                </Snackbar>
            </Grid>
        </PageContainer>
    );
};

export default Page;

