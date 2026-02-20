"use client";

import React from "react";
import dynamic from "next/dynamic";
import { useTheme } from "@mui/material/styles";
import {
    Card,
    CardContent,
    CardHeader,
    Divider,
    Stack,
    TextField,
    Button,
    Box,
} from "@mui/material";
import type { ApexOptions } from "apexcharts";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export type FisAyVerisi = {
    ay: string;
    gunler: string[];
    seri: { name: string; data: number[] }[];
    not?: string;
};

type Props = {
    title?: string;
    aylar: FisAyVerisi[];
    onNotChange?: (ay: string, value: string) => void;
    onSaveNote?: (ay: string) => void;
    saveLoading?: boolean;
    registerChartDom?: (ay: string, el: HTMLDivElement | null) => void;
};

const FisBuyukluguAnaliziChart: React.FC<Props> = ({
    title = "FiÅŸ BÃ¼yÃ¼klÃ¼ÄŸÃ¼",
    aylar,
    onNotChange,
    onSaveNote,
    saveLoading = false,
    registerChartDom,
}) => {
    const theme = useTheme();
    const primary = theme.palette.primary.main;

    const baseOptions: ApexOptions = {
        chart: {
            type: "bar",
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            toolbar: { show: false },
            animations: { enabled: false },
        },
        colors: [primary],
        plotOptions: {
            bar: {
                horizontal: false,
                columnWidth: "40%",
                borderRadius: 6,
                dataLabels: { position: "top" },
            },
        },
        dataLabels: {
            enabled: true,
            offsetY: -14,
            style: {
                fontSize: "13px",
                fontWeight: "bold",
                colors: [theme.palette.mode === "dark" ? "#fff" : "#000"],
            },
            formatter: (val: number) =>
                Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 }).format(val),
            dropShadow: {
                enabled: true,
                top: 1,
                left: 1,
                blur: 1,
                color: theme.palette.mode === "dark" ? "#000" : "#ccc",
                opacity: 0.6,
            },
        },
        xaxis: {
            categories: [],
            labels: { rotate: -45, style: { fontSize: "11px" } },
            title: { text: "GÃ¼nler" },
        },
        yaxis: { title: { text: "FiÅŸ SayÄ±sÄ±" } },
        legend: { show: false },
        tooltip: {
            theme: theme.palette.mode === "dark" ? "dark" : "light",
            y: {
                formatter: (val: number): string =>
                    `${Intl.NumberFormat("tr-TR").format(val)} fiÅŸ`,
            },
        },
    };

    return (
        <Stack spacing={3}>
            {aylar.map((item) => {
                const gunlukData = item.seri[0].data;
                const chartId = `fis-${item.ay}`;

                const options: ApexOptions = {
                    ...baseOptions,
                    chart: { ...(baseOptions.chart as ApexOptions["chart"]), id: chartId },
                    xaxis: { ...(baseOptions.xaxis as ApexOptions["xaxis"]), categories: item.gunler },
                };

                const series = [{ name: "GÃ¼nlÃ¼k FiÅŸ SayÄ±sÄ±", data: gunlukData }];

                return (
                    <Card key={item.ay} variant="outlined">
                        <CardHeader title={`${item.ay} AyÄ± FiÅŸleri`} sx={{ pb: 0 }} />
                        <CardContent sx={{ pt: 1 }}>
                            <div id={`chart-wrap-${item.ay}`} ref={(el) => registerChartDom?.(item.ay, el)}>
                                <Chart options={options} series={series} type="bar" height={300} width="100%" />
                            </div>

                            <Divider sx={{ my: 2 }} />

                            <Box>
                                <TextField
                                    label={`${item.ay} Notu`}
                                    fullWidth
                                    multiline
                                    minRows={3}
                                    value={item.not ?? ""}
                                    onChange={(e) => onNotChange?.(item.ay, e.target.value)}
                                />

                                <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
                                    <Button
                                        variant="contained"
                                        size="small"
                                        disableElevation
                                        onClick={() => onSaveNote?.(item.ay)}
                                        disabled={saveLoading}
                                    >
                                        {saveLoading ? "Kaydediliyor..." : "Notu Kaydet"}
                                    </Button>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                );
            })}
        </Stack>
    );
};

export default FisBuyukluguAnaliziChart;
