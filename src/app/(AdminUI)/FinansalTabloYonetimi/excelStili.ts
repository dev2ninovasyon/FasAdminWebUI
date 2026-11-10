import type { Theme } from "@mui/material/styles";

/** Excel'in ızgara, başlık ve seçim renkleri; koyu temada aynı ton ilişkisi korunur. */
export const EXCEL = {
  yesil: "#217346",
  koyuYesil: "#1a5c38",
  baslik: (t: Theme) => t.palette.mode === "dark" ? "#2b2b2b" : "#f3f2f1",
  seciliBaslik: (t: Theme) => t.palette.mode === "dark" ? "#3a3a3a" : "#d2d2d2",
  kenar: (t: Theme) => t.palette.mode === "dark" ? "#4a4a4a" : "#d4d4d4",
  izgara: (t: Theme) => t.palette.mode === "dark" ? "#3a3a3a" : "#e1e1e1",
  baslikSatiri: (t: Theme) => t.palette.mode === "dark" ? "#262626" : "#f7f7f7",
  bos: (t: Theme) => t.palette.mode === "dark" ? "#1f1f1f" : "#f2f2f2",
  seciliHucre: (t: Theme) => t.palette.mode === "dark" ? "#1e3a2b" : "#e8f2ec",
};

export const EXCEL_SATIR_YUKSEKLIGI = 30;

export const excelBaslikHucresi = {
  bgcolor: EXCEL.baslik, color: "text.primary", fontWeight: 600, fontSize: 12.5, py: 0.25, px: 1,
  height: EXCEL_SATIR_YUKSEKLIGI, borderRight: "1px solid", borderRightColor: EXCEL.kenar,
  borderBottom: "1px solid", borderBottomColor: EXCEL.kenar,
} as const;

export const excelFormulYazisi = { fontFamily: "Consolas, monospace", fontSize: 12.5 } as const;
