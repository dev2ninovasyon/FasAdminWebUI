// app/(Uygulama)/components/Veri/Fatura/YevmiyeFaturaDialog.tsx
"use client";

import React from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Box, Typography, Table, TableHead, TableRow, TableCell, TableBody,
} from "@mui/material";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import { enqueueSnackbar, closeSnackbar } from "notistack";
import { InvoiceYevmiyeRow, saveInvoiceYevmiyeMatches } from "@/api/Fatura/FaturaApi";

type Props = {
  open: boolean;
  onClose: () => void;
  tip: "Alınan" | "Gönderilen" | string;
  vkn: string;
  rows: InvoiceYevmiyeRow[];
};

const SAVE_SNACK_KEY = "yevmiye-save";

const YevmiyeFaturaDialog: React.FC<Props> = ({ open, onClose, tip, vkn, rows }) => {
  const user = useSelector((s: AppState) => s.userReducer);
  const [saving, setSaving] = React.useState(false);

  const handleSave = async () => {
    if (!rows || rows.length === 0) {
      enqueueSnackbar("Kaydedilecek kayıt yok.", { variant: "warning" });
      return;
    }
    try {
      setSaving(true);
      // her satıra tip'i yaz
      const payload = rows.map(r => ({ ...r, tip }));   // ğŸ”‘
      await saveInvoiceYevmiyeMatches(user, payload);
      enqueueSnackbar("Eşleştirmeler kaydedildi.", { variant: "success" });
      onClose();
    } catch (e: any) {
      enqueueSnackbar(e?.message || "Kayıt sırasında hata oluştu.", { variant: "error" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xl">
      <DialogTitle>Fatura -? Yevmiye</DialogTitle>
      <DialogContent dividers>
        <Box mb={1}>
          <Typography variant="body2">Tip: <b>{tip}</b> • VKN: <b>{vkn}</b></Typography>
        </Box>

        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Fatura Tarihi</TableCell>
              <TableCell>No</TableCell>
              <TableCell align="right">Tutar</TableCell>
              <TableCell align="right">KDV</TableCell>
              <TableCell>Yevmiye Tarihi</TableCell>
              <TableCell>No</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((r, i) => (
              <TableRow key={i}>
                <TableCell>{r.invoiceDate ? new Date(r.invoiceDate).toLocaleDateString("tr-TR") : ""}</TableCell>
                <TableCell>{r.invoiceNo ?? ""}</TableCell>
                <TableCell align="right">{(r.amount ?? 0).toLocaleString("tr-TR")}</TableCell>
                <TableCell align="right">{(r.kdv ?? 0).toLocaleString("tr-TR")}</TableCell>
                <TableCell>{r.yevmiyeDate ? new Date(r.yevmiyeDate).toLocaleDateString("tr-TR") : ""}</TableCell>
                <TableCell>{r.yevmiyeNo ?? ""}</TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={6}>
                  <Typography color="text.secondary">Kayıt yok.</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Kapat</Button>
        <Button onClick={handleSave} variant="contained" disabled={saving || rows.length === 0}>
          Kaydet
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default YevmiyeFaturaDialog;

