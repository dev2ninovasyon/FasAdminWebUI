import React from "react";
import { Box, Typography, Paper } from "@mui/material";

interface CardTableProps {
  borc: number;
  alacak: number;
}

const MizanCardTable: React.FC<CardTableProps> = ({ borc, alacak }) => {
  const fark = Math.abs(borc - alacak);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("tr-TR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      <Box
        display="flex"
        justifyContent="space-between"
        gap={2}
        marginBottom={2}
      >
        <Paper
          elevation={0}
          sx={{
            p: 2,
            flex: 1,
            backgroundColor: "primary.light",
            overflow: "auto",
          }}
        >
          <Typography variant="h6" gutterBottom>
            Toplam Borç
          </Typography>
          <Typography variant="subtitle1" align="right">
            {formatNumber(borc)}
          </Typography>
        </Paper>
        <Paper
          elevation={0}
          sx={{
            p: 2,
            flex: 1,
            backgroundColor: "primary.light",
            overflow: "auto",
          }}
        >
          <Typography variant="h6" gutterBottom>
            Toplam Alacak
          </Typography>
          <Typography variant="subtitle1" align="right">
            {formatNumber(alacak)}
          </Typography>
        </Paper>
        <Paper
          elevation={0}
          sx={{
            p: 2,
            flex: 1,
            backgroundColor: "primary.light",
            overflow: "auto",
          }}
        >
          <Typography variant="h6" gutterBottom>
            Fark
          </Typography>
          <Typography variant="subtitle1" align="right">
            {formatNumber(fark)}
          </Typography>
        </Paper>
      </Box>
      <Box sx={{ display: "flex", flexGrow: 1 }}></Box>
      <Box
        bgcolor={formatNumber(fark) == "0,00" ? "success.light" : "error.light"}
        sx={{
          p: 2,
        }}
      >
        {formatNumber(fark) == "0,00" ? (
          <Typography variant="subtitle1" align="left">
            Borç Toplamı Alacak Toplamına Eşit.
          </Typography>
        ) : (
          <Typography variant="subtitle1" align="left">
            Borç Toplamı Alacak Toplamına Eşit Değil!
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default MizanCardTable;

