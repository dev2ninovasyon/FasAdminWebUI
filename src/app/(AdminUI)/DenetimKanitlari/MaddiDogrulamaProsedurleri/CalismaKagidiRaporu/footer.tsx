import React from "react";
import { Box, Typography, Divider, useTheme } from "@mui/material";

const ReportFooter: React.FC = () => {
    const theme = useTheme();

    return (
        <Box sx={{ mt: 6, pt: 2 }}>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ display: "flex", justifyContent: "space-between", color: theme.palette.text.secondary }}>
                <Typography variant="caption">
                    Bu belge Fas Bağımsız Denetim Sistemi tarafından otomatik olarak oluşturulmuştur.
                </Typography>
                <Typography variant="caption">
                    Sayfa <span className="pageNumber"></span>
                </Typography>
            </Box>
        </Box>
    );
};

export default ReportFooter;

