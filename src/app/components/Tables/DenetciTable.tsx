"use client";

import { dictionary } from "@/utils/languages/handsontable.tr-TR";
import "@/lib/handsontableSetup";

import CustomHotTable from "@/components/HotTableWrapper";
import BlankCard from "@/app/components/Shared/BlankCard";
import { deleteDenetciById, getDenetciler } from "@/api/DenetciIslemleri/DenetciIslemleri";
import { setCollapse } from "@/store/customizer/CustomizerSlice";
import { useDispatch, useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import { plus } from "@/utils/theme/Typography";
import { Box, Typography, useTheme } from "@mui/material";
import { enqueueSnackbar } from "notistack";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { registerAllModules } from "handsontable/registry";

registerAllModules();

interface DenetciRow {
  id: number;
  firmaAdi: string;
  email: string;
  tel: string;
  il: string;
  arsivId: string;
  kayitTarihi: string;
  durum: string;
  aktifmi: boolean;
}

interface ActionMenuState {
  rowIndex: number;
  top: number;
  left: number;
}

const ACTIONS_COL_INDEX = 7;

const DenetciTable = () => {
  const hotRef = useRef<any>(null);
  const router = useRouter();
  const theme = useTheme();
  const dispatch = useDispatch();
  const user = useSelector((state: AppState) => state.userReducer);
  const customizer = useSelector((state: AppState) => state.customizer);

  const [rows, setRows] = useState<DenetciRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionMenu, setActionMenu] = useState<ActionMenuState | null>(null);

  useEffect(() => {
    const loadStyles = async () => {
      dispatch(setCollapse(true));
      if (customizer.activeMode === "dark") {
        await import("@/app/components/HandsOnTable/HandsOnTableDark.css");
      } else {
        await import("@/app/components/HandsOnTable/HandsOnTableLight.css");
      }
    };

    void loadStyles();
  }, [customizer.activeMode, dispatch]);

  useEffect(() => {
    if (!actionMenu) {
      return;
    }

    const handleClose = () => setActionMenu(null);

    window.addEventListener("click", handleClose);
    window.addEventListener("scroll", handleClose, true);

    return () => {
      window.removeEventListener("click", handleClose);
      window.removeEventListener("scroll", handleClose, true);
    };
  }, [actionMenu]);

  const fetchData = async () => {
    if (!user.token) {
      return;
    }

    setLoading(true);

    try {
      const denetciVerileri = await getDenetciler(user.token);

      if (Array.isArray(denetciVerileri)) {
        const newRows = denetciVerileri.map((denetci: any) => ({
          id: denetci.id,
          firmaAdi: denetci.firmaAdi ?? "",
          email: denetci.email ?? "",
          tel: denetci.tel ?? "",
          il: denetci.il ?? "",
          arsivId: denetci.arsivId?.toString() ?? "-",
          kayitTarihi: denetci.kayitTarihi?.split("T")[0] ?? "-",
          durum: denetci.aktifmi ? "Aktif" : "Pasif",
          aktifmi: Boolean(denetci.aktifmi),
        }));

        setRows(newRows);
      } else {
        setRows([]);
      }
    } catch (error) {
      console.error("Denetçi listesi alınırken bir hata oluştu:", error);
      enqueueSnackbar("Denetçi listesi alınırken bir hata oluştu.", {
        variant: "error",
        autoHideDuration: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchData();
  }, [user.token]);

  const tableData = useMemo(
    () =>
      rows.map((row) => ({
        firmaAdi: row.firmaAdi,
        email: row.email || "-",
        tel: row.tel || "-",
        il: row.il || "-",
        arsivId: row.arsivId,
        kayitTarihi: row.kayitTarihi,
        durum: row.durum,
        islemler: "",
      })),
    [rows]
  );

  const colHeaders = [
    "Firma Adı",
    "E-posta",
    "Telefon",
    "İl",
    "Arşiv ID",
    "Kayıt Tarihi",
    "Durum",
    "İşlemler",
  ];

  const columns = [
    { data: "firmaAdi", type: "text", readOnly: true, className: "htLeft htMiddle" },
    { data: "email", type: "text", readOnly: true, className: "htLeft htMiddle" },
    { data: "tel", type: "text", readOnly: true, className: "htLeft htMiddle" },
    { data: "il", type: "text", readOnly: true, className: "htLeft htMiddle" },
    { data: "arsivId", type: "text", readOnly: true, className: "htCenter htMiddle" },
    { data: "kayitTarihi", type: "text", readOnly: true, className: "htCenter htMiddle" },
    { data: "durum", type: "text", readOnly: true, className: "htCenter htMiddle" },
    {
      data: "islemler",
      type: "text",
      readOnly: true,
      className: "htCenter htMiddle",
      renderer: (_instance: any, td: HTMLTableCellElement, row: number) => {
        const item = rows[row];

        td.innerHTML = "";
        td.style.padding = "8px";

        if (!item) {
          return td;
        }

        const wrapper = document.createElement("div");
        wrapper.style.display = "flex";
        wrapper.style.justifyContent = "center";
        wrapper.style.alignItems = "center";

        const button = document.createElement("button");
        button.type = "button";
        button.textContent = "⋮";
        button.title = "İşlemler";
        button.dataset.action = "menu";
        button.dataset.rowIndex = row.toString();
        button.style.border = "0";
        button.style.width = "32px";
        button.style.height = "32px";
        button.style.borderRadius = "999px";
        button.style.fontSize = "20px";
        button.style.fontWeight = "700";
        button.style.lineHeight = "1";
        button.style.cursor = "pointer";
        button.style.fontFamily = plus.style.fontFamily;
        button.style.background = customizer.activeMode === "dark" ? "#1f2937" : "#eef2ff";
        button.style.color = customizer.activeMode === "dark" ? "#ffffff" : "#3b5bdb";
        button.style.display = "inline-flex";
        button.style.alignItems = "center";
        button.style.justifyContent = "center";

        wrapper.appendChild(button);
        td.appendChild(wrapper);
        return td;
      },
    },
  ];

  const afterGetColHeader = (col: number, TH: HTMLTableHeaderCellElement) => {
    TH.style.height = "46px";
    TH.style.fontFamily = plus.style.fontFamily;
    TH.style.fontWeight = "600";
    TH.style.fontSize = "13px";
    TH.style.color = customizer.activeMode === "dark" ? "#ffffff" : "#1f2937";
    TH.style.backgroundColor = theme.palette.primary.light;
    TH.style.borderColor = customizer.activeMode === "dark" ? "#2a3447" : "#dbe4f0";

    const div = TH.querySelector("div");
    if (div) {
      div.style.display = "flex";
      div.style.alignItems = "center";
      div.style.justifyContent = col === ACTIONS_COL_INDEX ? "center" : "flex-start";
      div.style.height = "100%";
      div.style.whiteSpace = "normal";
    }
  };

  const afterGetRowHeader = (_row: number, TH: HTMLTableHeaderCellElement) => {
    TH.style.fontFamily = plus.style.fontFamily;
    TH.style.fontWeight = "600";
    TH.style.fontSize = "13px";
    TH.style.color = customizer.activeMode === "dark" ? "#ffffff" : "#1f2937";
    TH.style.backgroundColor = theme.palette.primary.light;
    TH.style.borderColor = customizer.activeMode === "dark" ? "#2a3447" : "#dbe4f0";

    const div = TH.querySelector("div");
    if (div) {
      div.style.display = "flex";
      div.style.alignItems = "center";
      div.style.justifyContent = "center";
      div.style.height = "100%";
    }
  };

  const afterRenderer = (
    td: HTMLTableCellElement,
    row: number,
    col: number,
    _prop: string,
    value: string
  ) => {
    td.style.fontFamily = plus.style.fontFamily;
    td.style.fontSize = "13px";
    td.style.fontWeight = col === 0 ? "600" : "500";
    td.style.lineHeight = "1.35";
    td.style.verticalAlign = "middle";

    if (col === 6) {
      td.innerHTML = "";

      const chip = document.createElement("span");
      chip.textContent = value;
      chip.style.display = "inline-flex";
      chip.style.alignItems = "center";
      chip.style.justifyContent = "center";
      chip.style.padding = "4px 10px";
      chip.style.borderRadius = "999px";
      chip.style.fontSize = "12px";
      chip.style.fontWeight = "700";
      chip.style.backgroundColor = rows[row]?.aktifmi ? "#dcfce7" : "#fee2e2";
      chip.style.color = rows[row]?.aktifmi ? "#15803d" : "#b91c1c";

      td.appendChild(chip);
    }
  };

  const handleAction = async (action: string, rowIndex: number) => {
    setActionMenu(null);

    const selectedRow = rows[rowIndex];

    if (!selectedRow) {
      return;
    }

    if (action === "odeme") {
      router.push(`/DenetciFirmaIslemleri/DenetciOdemeBilgileri/${selectedRow.id}`);
      return;
    }

    if (action === "kullanici") {
      router.push(`/DenetciFirmaIslemleri/KullaniciEkle/${selectedRow.id}`);
      return;
    }

    if (action === "duzenle") {
      router.push(`/DenetciFirmaIslemleri/DenetciDuzenle/${selectedRow.id}`);
      return;
    }

    if (action === "detay") {
      router.push(`/DenetciFirmaIslemleri/DenetciDetay/${selectedRow.id}`);
      return;
    }

    if (action === "sil") {
      const confirmed = window.confirm(
        `${selectedRow.firmaAdi} kaydını silmek istediğinize emin misiniz?`
      );

      if (!confirmed) {
        return;
      }

      const result = await deleteDenetciById(user.token || "", selectedRow.id);

      if (result) {
        enqueueSnackbar("Denetçi kaydı silindi.", {
          variant: "success",
          autoHideDuration: 3000,
        });
        void fetchData();
      } else {
        enqueueSnackbar("Denetçi kaydı silinemedi.", {
          variant: "error",
          autoHideDuration: 4000,
        });
      }
    }
  };

  return (
    <BlankCard>
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Denetçi firma listesi
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Sıralama, filtreleme ve hızlı işlem seçenekleriyle denetçi kayıtlarını buradan
          yönetebilirsiniz.
        </Typography>

        <CustomHotTable
          ref={hotRef}
          data={tableData}
          language={dictionary.languageCode}
          colHeaders={colHeaders}
          columns={columns as any}
          rowHeaders={true}
          width="100%"
          height={Math.max(420, Math.min(720, rows.length * 42 + 90))}
          stretchH="all"
          licenseKey="non-commercial-and-evaluation"
          dropdownMenu={true}
          filters={true}
          columnSorting={true}
          manualColumnResize={true}
          navigableHeaders={true}
          autoWrapRow={true}
          autoWrapCol={true}
          readOnly={true}
          disableVisualSelection={false}
          fixedColumnsStart={1}
          hiddenColumns={{ indicators: true }}
          afterGetColHeader={afterGetColHeader as any}
          afterGetRowHeader={afterGetRowHeader as any}
          afterRenderer={afterRenderer as any}
          afterOnCellMouseDown={(event: MouseEvent, coords: any, td: HTMLTableCellElement) => {
            if (coords.col !== ACTIONS_COL_INDEX) {
              return;
            }

            const target = event.target as HTMLElement | null;
            const actionElement = target?.closest("[data-action]") as HTMLElement | null;

            if (!actionElement) {
              return;
            }

            const action = actionElement.dataset.action;
            const rowIndex = Number(actionElement.dataset.rowIndex);

            if (action === "menu" && Number.isFinite(rowIndex)) {
              event.preventDefault();
              event.stopPropagation();

              const rect = td.getBoundingClientRect();
              setActionMenu({
                rowIndex,
                top: rect.bottom + 6,
                left: Math.max(12, rect.left + rect.width - 180),
              });
              return;
            }

            if (action && Number.isFinite(rowIndex)) {
              void handleAction(action, rowIndex);
            }
          }}
        />

        {actionMenu ? (
          <Box
            sx={{
              position: "fixed",
              top: actionMenu.top,
              left: actionMenu.left,
              width: 180,
              zIndex: 1600,
              bgcolor: "background.paper",
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 2,
              boxShadow: 8,
              overflow: "hidden",
            }}
            onClick={(event) => event.stopPropagation()}
          >
            {[
              { label: "Ödeme", action: "odeme", color: "text.primary" },
              { label: "Kullanıcı", action: "kullanici", color: "text.primary" },
              { label: "Düzenle", action: "duzenle", color: "text.primary" },
              { label: "Detay", action: "detay", color: "text.primary" },
              { label: "Sil", action: "sil", color: "error.main" },
            ].map((item) => (
              <Box
                key={item.action}
                component="button"
                type="button"
                onClick={() => void handleAction(item.action, actionMenu.rowIndex)}
                sx={{
                  width: "100%",
                  border: 0,
                  bgcolor: "transparent",
                  px: 1.75,
                  py: 1.2,
                  textAlign: "left",
                  cursor: "pointer",
                  fontFamily: plus.style.fontFamily,
                  fontSize: 13,
                  fontWeight: 600,
                  color: item.color,
                  "&:hover": {
                    bgcolor: "action.hover",
                  },
                }}
              >
                {item.label}
              </Box>
            ))}
          </Box>
        ) : null}

        {loading ? (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
            Denetçi kayıtları yükleniyor...
          </Typography>
        ) : null}
      </Box>
    </BlankCard>
  );
};

export default DenetciTable;
