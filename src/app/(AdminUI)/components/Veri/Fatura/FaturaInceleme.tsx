"use client";

import { HotTable } from "@handsontable/react";
import { registerAllModules } from "handsontable/registry";
import "handsontable/dist/handsontable.full.min.css";
import {
  Grid, Button, ToggleButtonGroup, ToggleButton, Typography
} from "@mui/material";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import { enqueueSnackbar, closeSnackbar } from "notistack";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import {
  fetchPagedFaturalarFull,
  Fatura,
  FaturaSatiri,
  findInvoiceYevmiyeRowsByVkn,
} from "@/api/Fatura/FaturaApi";
import YevmiyeFaturaDialog from "@/app/(AdminUI)/components/Veri/Fatura/YevmiyeFaturaDialog";

registerAllModules();

type Props = {
  tip?: string;       // default "Alınan"
  pageSize?: number;  // default 50
};

type Ctx = { tip: string; vkn: string };

const LOADING_SNACK_KEY = "yevmiye-fetching";

const FaturaInceleme: React.FC<Props> = ({ tip = "Alınan", pageSize = 10 }) => {
  const user = useSelector((s: AppState) => s.userReducer);
  const hotRef = useRef<any>(null);
  const linesRef = useRef<any>(null);

  const [page, setPage] = useState(1);
  const [currentTip, setCurrentTip] = useState<string>(tip);
  const [items, setItems] = useState<Fatura[]>([]);
  const [total, setTotal] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  // Yevmiye dialog state
  const [yevOpen, setYevOpen] = useState(false);
  const [ctx, setCtx] = useState<Ctx | null>(null);
  const [yevRows, setYevRows] = useState<any[]>([]);

  // filtre yok
  const filters: Record<string, string[]> = {};

  const loadData = async () => {
    try {
      const data = await fetchPagedFaturalarFull(
        user.denetciId!, user.yil!, user.denetlenenId!,
        page, pageSize, currentTip, filters
      );
      setItems(data.items);
      setTotal(data.totalCount);
      setSelectedIndex(data.items.length > 0 ? 0 : -1);
    } catch (e: any) {
      enqueueSnackbar(e?.message || "Veri alınamadı", { variant: "error" });
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, currentTip, pageSize]);

  // MASTER tablo (faturalar)
  const masterRows = useMemo(
    () =>
      items.map((f) => [
        f.id, // 0
        f.faturaNumarasi ?? "", // 1
        (f.faturaTarihi || "").substring(0, 10).split("-").reverse().join("."), // 2
        f.tedarikci?.ad ?? "", // 3
        f.alici?.ad ?? "", // 4
        f.paraBirimi ?? "", // 5
        f.odenecekTutar ?? 0, // 6
      ]),
    [items]
  );

  const masterHeaders = ["Id", "Fatura No", "Tarih", "Düzenleyen", "Alıcı", "PB", "Tutar"];
  const masterColumns = [
    { readOnly: true }, // Id (gizli)
    { type: "text", readOnly: true },
    { type: "text", readOnly: true },
    { type: "text", readOnly: true },
    { type: "text", readOnly: true },
    { type: "text", readOnly: true },
    { type: "numeric", readOnly: true, numericFormat: { pattern: "0,0.00", culture: "tr-TR" }, className: "htRight" },
  ];

  // Seçili fatura satırları
  const selectedFatura: Fatura | null =
    selectedIndex >= 0 && selectedIndex < items.length ? items[selectedIndex] : null;

  const lineRows = useMemo(() => {
    const lines = (selectedFatura?.faturaSatirlari ?? []) as FaturaSatiri[];
    return lines.map((s) => [
      s.id,
      s.aciklama ?? "",
      s.miktar,
      s.birimKodu ?? "",
      s.birimFiyat,
      s.satirToplamTutar,
      s.vergi?.vergiKodu ?? "",
      s.vergi?.vergiTuru ?? "",
      s.vergi?.oran ?? null,
      s.vergi?.vergiMatrahi ?? null,
      s.vergi?.vergiTutari ?? null,
    ]);
  }, [selectedFatura]);

  const lineHeaders = ["Id", "Açıklama", "Miktar", "Birim", "Fiyat", "Toplam", "V.Kodu", "V.Türü", "Oran", "Matrah", "Vergi"];
  const lineColumns = [
    { readOnly: true }, // Id
    { type: "text", readOnly: true },
    { type: "numeric", readOnly: true, numericFormat: { pattern: "0,0.00", culture: "tr-TR" } },
    { type: "text", readOnly: true },
    { type: "numeric", readOnly: true, numericFormat: { pattern: "0,0.0000", culture: "tr-TR" } },
    { type: "numeric", readOnly: true, numericFormat: { pattern: "0,0.00", culture: "tr-TR" } },
    { type: "text", readOnly: true },
    { type: "text", readOnly: true },
    { type: "numeric", readOnly: true, numericFormat: { pattern: "0,0.##", culture: "tr-TR" } },
    { type: "numeric", readOnly: true, numericFormat: { pattern: "0,0.00", culture: "tr-TR" } },
    { type: "numeric", readOnly: true, numericFormat: { pattern: "0,0.00", culture: "tr-TR" } },
  ];

  const handleExportExcel = async () => {
    const wb = new ExcelJS.Workbook();

    // Sayfa 1: Fatura listesi
    const ws1 = wb.addWorksheet("Faturalar");
    ws1.addRow(masterHeaders.slice(1)); // Id yok
    masterRows.forEach((r) => ws1.addRow(r.slice(1)));
    ws1.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
    ws1.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1a6786" } };
    ws1.columns.forEach((c) => (c.width = 22));

    // Sayfa 2: Seçili fatura satırları (varsa)
    if (selectedFatura) {
      const ws2 = wb.addWorksheet("Seçili Fatura Satırları");
      ws2.addRow(lineHeaders.slice(1));
      lineRows.forEach((r) => ws2.addRow(r.slice(1)));
      ws2.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
      ws2.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1a6786" } };
      ws2.columns.forEach((c) => (c.width = 22));
    }

    const buf = await wb.xlsx.writeBuffer();
    saveAs(
      new Blob([buf], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }),
      "FaturaInceleme.xlsx"
    );
  };

  // Sağ tık menü › ÖNCE veriyi çek, sonra diyalogu aç
  const openYevmiyeDialogFromRow = async (rowIndex: number) => {
    const faturaId = masterRows[rowIndex]?.[0] as string;
    const fatura = items.find((f) => f.id === faturaId);
    if (!fatura) return;

    // Alınan: tedarikçi VKN, Gönderilen: alıcı VKN
    const vkn =
      currentTip === "Alınan"
        ? (fatura.tedarikci as any)?.vergiNo ?? ""
        : (fatura.alici as any)?.vergiNo ?? "";

    // Loading snackbar (persist)
    enqueueSnackbar("Yevmiye eşleşmeleri getiriliyor...", {
      key: LOADING_SNACK_KEY,
      variant: "info",
      persist: true,
    });

    try {
      const data = await findInvoiceYevmiyeRowsByVkn(user, currentTip, vkn);
      setCtx({ tip: currentTip, vkn });
      setYevRows(data);
      setYevOpen(true);             // <-- veri geldikten sonra aç
    } catch (e: any) {
      enqueueSnackbar("Veriler alınamadı.", { variant: "error" });
    } finally {
      closeSnackbar(LOADING_SNACK_KEY);
    }
  };

  return (
    <>
      {/* Tip seçici / sayfa bilgisi */}
      <Grid container mb={2} alignItems="center" justifyContent="space-between">
        <Grid>
          <ToggleButtonGroup
            size="small"
            exclusive
            value={currentTip}
            onChange={(_, v) => v && (setCurrentTip(v), setPage(1))}
          >
            <ToggleButton value="Alınan">Alınan</ToggleButton>
            <ToggleButton value="Gönderilen">Gönderilen</ToggleButton>
          </ToggleButtonGroup>
        </Grid>
        <Grid>Toplam: {total} | Sayfa: {page}</Grid>
      </Grid>
      {/* MASTER: Faturalar */}
      <HotTable
        ref={hotRef}
        data={masterRows}
        colHeaders={masterHeaders}
        columns={masterColumns}
        hiddenColumns={{ columns: [0], indicators: false }}
        stretchH="all"
        rowHeaders
        height={360}
        licenseKey="non-commercial-and-evaluation"
        afterSelectionEnd={(r) => setSelectedIndex(r)}
        contextMenu={{
          items: {

            hsep1: "---------",
            showYevmiye: {
              name: "Seçili tedarikçi ile eşleşen yevmiye kayıtlarını göster",
              callback: async (_key, selection) => {
                if (!selection || selection.length === 0) return;
                const rowIndex = selection[0].start.row;
                await openYevmiyeDialogFromRow(rowIndex);
              },
            },
          },
        }}
      />
      {/* DETAIL: Satırlar */}
      <Grid container mt={2} spacing={2} alignItems="center">
        <Grid
          size={{
            xs: 12,
            md: 6
          }}>
          <Typography variant="subtitle1">Fatura Satırları</Typography>
        </Grid>
        <Grid
          display="flex"
          justifyContent="flex-end"
          gap={1}
          size={{
            xs: 12,
            md: 6
          }}>
          <Button
            size="small"
            variant="outlined"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Önceki
          </Button>
          <Button
            size="small"
            variant="outlined"
            disabled={page * pageSize >= total}
            onClick={() => setPage((p) => p + 1)}
          >
            Sonraki
          </Button>
          <Button size="small" variant="contained" onClick={handleExportExcel}>
            Excel'e Aktar
          </Button>
        </Grid>
        <Grid size={12}>
          <HotTable
            ref={linesRef}
            data={lineRows}
            colHeaders={lineHeaders}
            columns={lineColumns}
            hiddenColumns={{ columns: [0], indicators: false }}
            stretchH="all"
            rowHeaders
            height={280}
            licenseKey="non-commercial-and-evaluation"
          />
        </Grid>
      </Grid>
      {/* Yevmiye eşleşmeleri diyalogu — veri hazır olunca açılıyor */}
      {ctx && (
        <YevmiyeFaturaDialog
          open={yevOpen}
          onClose={() => setYevOpen(false)}
          tip={ctx.tip}
          vkn={ctx.vkn}
          rows={yevRows}
        />
      )}
    </>
  );
};

export default FaturaInceleme;

