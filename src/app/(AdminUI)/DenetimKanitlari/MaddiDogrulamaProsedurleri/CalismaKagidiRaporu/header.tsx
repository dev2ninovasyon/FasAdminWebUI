import React from "react";
import { Box, Typography, Grid, Divider, useTheme } from "@mui/material";
import Image from "next/image";

interface Props {
    denetlenenId: number;
    yil: number;
    denetciName: string;
    denetlenenName: string;
    reportName: string;
    logo?: string | null;
    referansNo?: string;
}

const ReportHeader: React.FC<Props> = ({
    denetlenenId,
    yil,
    denetciName,
    denetlenenName,
    reportName,
    logo,
    referansNo,
}) => {
    const theme = useTheme();

    return (
        <Box sx={{ mb: 4 }}>
            <Box sx={{ textAlign: "center", mb: 3 }}>
                {logo ? (
                    <Image
                        src={logo}
                        alt="Logo"
                        width={120}
                        height={120}
                        style={{ objectFit: 'contain' }}
                        priority
                    />
                ) : (
                    <Image
                        src={theme.palette.mode === 'dark' ? "/images/logos/light-logo.svg" : "/images/logos/dark-logo.svg"}
                        alt="Logo"
                        width={120}
                        height={120}
                        priority
                    />
                )}
            </Box>

            <Divider sx={{ my: 2, borderBottomWidth: 2, borderColor: theme.palette.divider }} />

            <Box sx={{ textAlign: "center", py: 1, bgcolor: theme.palette.action.hover, borderRadius: 1 }}>
                <Typography variant="h5" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                    {reportName}
                </Typography>
            </Box>

            <Box sx={{ textAlign: "center", mt: 1 }}>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                    Referans No: {referansNo || `CW-${denetlenenId}-${yil}`}
                </Typography>
            </Box>
        </Box>
    );
};

export default ReportHeader;

