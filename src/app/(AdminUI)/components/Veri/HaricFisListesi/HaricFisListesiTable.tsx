import { dictionary } from "@/utils/languages/handsontable.tr-TR";
import "@/lib/handsontableSetup";

import React, { useEffect, useState, useRef } from "react";
import CustomHotTable from "@/components/HotTableWrapper";
import { registerAllModules } from "handsontable/registry";

import { plus } from "@/utils/theme/Typography";
import {
  Typography,
  Box,
  useMediaQuery,
  Button,
  useTheme,
  CircularProgress,
  Backdrop,
  Pagination,
  Grid,
  Paper,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import { Stack } from "@mui/system";
import { useSelector, useDispatch } from "@/store/hooks";
import { AppState } from "@/store/store";
import {
  getFisListesi,
  saveHaricFisListesi,
} from "@/api/Veri/HaricFisListesi";
import { enqueueSnackbar } from "notistack";
import { setCollapse } from "@/store/customizer/CustomizerSlice";

registerAllModules();

interface Props {
  hesapNo: string;
  yevmiyeFisNo: string;
  baslangicTarihi: string;
  bitisTarihi: string;
  loading: boolean;
  fisleriGosterTiklandimi: boolean;
  standartfisleriGosterTiklandimi: boolean;
  setLoading: (bool: boolean) => void;
  setFisleriGosterTiklandimi: (bool: boolean) => void;
  setStandartFisleriGosterTiklandimi: (bool: boolean) => void;
  handleGetStandartYevmiyeFisNo: () => void;
}

const HaricFisListesiTable: React.FC<Props> = ({
  hesapNo,
  yevmiyeFisNo,
  baslangicTarihi,
  bitisTarihi,
  loading,
  fisleriGosterTiklandimi,
  standartfisleriGosterTiklandimi,
  setLoading,
  setFisleriGosterTiklandimi,
  setStandartFisleriGosterTiklandimi,
  handleGetStandartYevmiyeFisNo,
}) => {
  const hotTableComponent = useRef<any>(null);
  const user = useSelector((state: AppState) => state.userReducer);
  const customizer = useSelector((state: AppState) => state.customizer);
  const theme = useTheme();
  const dispatch = useDispatch();

  const [fetchedData, setFetchedData] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const pendingSelectAll = useRef(false);

  const smDown = useMediaQuery((theme: any) => theme.breakpoints.down("sm"));

  useEffect(() => {
    const loadStyles = async () => {
      dispatch(setCollapse(true));
      if (customizer.activeMode === "dark") {
        await import(
          "@/app/(AdminUI)/components/Veri/HandsOnTable/HandsOnTableDark.css"
        );
      } else {
        await import(
          "@/app/(AdminUI)/components/Veri/HandsOnTable/HandsOnTableLight.css"
        );
      }
    };
    loadStyles();
  }, [customizer.activeMode, dispatch]);

  const fetchData = async (pageNum: number = 1, size: number = pageSize) => {
    try {
      setLoading(true);
      const data = await getFisListesi(user.denetciId || 0,
        user.denetlenenId || 0,
        user.yil || 0,
        hesapNo,
        yevmiyeFisNo,
        baslangicTarihi,
        bitisTarihi,
        pageNum - 1,
        size
      );

      const items = data?.items || [];
      const total = data?.totalCount || 0;

      const rows = items.map((veri: any) => [
        veri.id,
        veri.haricMi,
        veri.yevmiyeNo,
        veri.yevmiyeTarih
          ? veri.yevmiyeTarih.split("T")[0].split("-").reverse().join(".")
          : "",
        veri.kebirKodu,
        veri.detayKodu,
        veri.kebirAdi,
        veri.hesapAdi,
        veri.aciklama,
        veri.borc,
        veri.alacak,
      ]);

      setFetchedData(rows);
      setTotalCount(total);
      setCurrentPage(pageNum);
      setLoading(false);

      if (pendingSelectAll.current) {
        setTimeout(() => {
          handleSelectAll(true);
          pendingSelectAll.current = false;
        }, 300);
      }
    } catch (error) {
      console.log("Bir hata oluÃ…Å¸tu:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (fisleriGosterTiklandimi) {
      fetchData(1);
      setFisleriGosterTiklandimi(false);
    }
  }, [fisleriGosterTiklandimi]);

  useEffect(() => {
    if (standartfisleriGosterTiklandimi) {
      fetchData(1);
      setStandartFisleriGosterTiklandimi(false);
    }
  }, [standartfisleriGosterTiklandimi]);

  const handleSelectAll = (select: boolean) => {
    if (!hotTableComponent.current) return;
    const hotInstance = hotTableComponent.current.hotInstance;
    const countRows = hotInstance.countRows();
    if (countRows === 0) return;

    hotInstance.batch(() => {
      for (let i = 0; i < countRows; i++) {
        hotInstance.setDataAtCell(i, 1, select);
      }
    });
  };

  const handleHeaderClick = (e: any) => {
    const target = e.target as HTMLInputElement;
    if (target && target.id === "header-select-all") {
      const isChecked = target.checked;
      if (isChecked && pageSize !== -1) {
        setConfirmOpen(true);
        target.checked = false;
      } else {
        handleSelectAll(isChecked);
      }
    }
  };

  const handleConfirmSelectAll = () => {
    setConfirmOpen(false);
    pendingSelectAll.current = true;
    setPageSize(-1);
    fetchData(1, -1);
  };

  const handleSaveHaricFisListesi = async () => {
    try {
      if (!hotTableComponent.current) return;
      const hotInstance = hotTableComponent.current.hotInstance;
      const allData = hotInstance.getData();

      const selectedRows = allData.map((row: any) => ({
        id: row[0],
        haricMi: row[1] === true,
      }));

      await saveHaricFisListesi(user.denetciId || 0,
        user.denetlenenId || 0,
        user.yil || 0,
        selectedRows
      );

      enqueueSnackbar("DeÃ„Å¸iÃ…Å¸iklikler Kaydedildi.", {
        variant: "success",
        autoHideDuration: 5000,
        style: {
          backgroundColor:
            customizer.activeMode === "dark"
              ? theme.palette.success.light
              : theme.palette.success.main,
        },
      });
      fetchData(currentPage);
    } catch (error) {
      console.log("Bir hata oluÃ…Å¸tu:", error);
    }
  };

  const colHeaders = [
    "Id",
    `HariÃƒÂ§ mi?<br/><input type="checkbox" id="header-select-all" style="width: 20px; height: 20px; cursor: pointer;">`,
    "Yevmiye No",
    "Yevmiye Tarihi",
    "Kebir Kodu",
    "Detay Kodu",
    "Kebir AdÃ„Â±",
    "Hesap AdÃ„Â±",
    "AÃƒÂ§Ã„Â±klama",
    "BorÃƒÂ§",
    "Alacak",
  ];

  const columns = [
    { data: 0, type: "text", readOnly: true }, // Id
    { data: 1, type: "checkbox", className: "htCenter htMiddle" }, // HariÃƒÂ§ mi?
    { data: 2, type: "numeric", readOnly: true, className: "htLeft htMiddle" }, // Yevmiye No
    { data: 3, type: "text", readOnly: true, className: "htCenter htMiddle" }, // Yevmiye Tarihi
    { data: 4, type: "numeric", readOnly: true, className: "htCenter htMiddle" }, // Kebir Kodu
    { data: 5, type: "text", readOnly: true, className: "htLeft htMiddle" }, // Detay Kodu
    { data: 6, type: "text", readOnly: true, className: "htLeft htMiddle" }, // Kebir AdÃ„Â±
    { data: 7, type: "text", readOnly: true, className: "htLeft htMiddle" }, // Hesap AdÃ„Â±
    { data: 8, type: "text", readOnly: true, className: "htLeft htMiddle" }, // AÃƒÂ§Ã„Â±klama
    {
      data: 9,
      type: "numeric",
      numericFormat: { pattern: "0,0.00", culture: "tr-TR" },
      readOnly: true,
      className: "htRight htMiddle",
    }, // BorÃƒÂ§
    {
      data: 10,
      type: "numeric",
      numericFormat: { pattern: "0,0.00", culture: "tr-TR" },
      readOnly: true,
      className: "htRight htMiddle",
    }, // Alacak
  ];

  const afterGetColHeader = (col: any, TH: any) => {
    TH.style.height = "70px";
    TH.style.fontFamily = plus.style.fontFamily;
    TH.style.fontWeight = 500;
    TH.style.fontSize = "0.875rem";
    TH.style.color = customizer.activeMode === "dark" ? "#ffffff" : "#2A3547";
    TH.style.backgroundColor = theme.palette.primary.light;
  };

  const afterRenderer = (TD: any, row: any, col: any, prop: any, value: any) => {
    TD.style.fontFamily = plus.style.fontFamily;
    TD.style.fontSize = "0.875rem";
    TD.style.color = customizer.activeMode === "dark" ? "#ffffff" : "#2A3547";
    if (row % 2 === 0) {
      TD.style.backgroundColor =
        customizer.activeMode === "dark" ? "#171c23" : "#ffffff";
    } else {
      TD.style.backgroundColor =
        customizer.activeMode === "dark" ? "#10141c" : "#f5f5f5";
    }
  };

  return (
    <>
      <style>{`
        .htCheckboxRendererInput {
          width: 20px !important;
          height: 20px !important;
          cursor: pointer;
        }
      `}</style>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>TÃƒÂ¼m KayÃ„Â±tlarÃ„Â± SeÃƒÂ§</DialogTitle>
        <DialogContent>
          <DialogContentText>
            TÃƒÂ¼mÃƒÂ¼nÃƒÂ¼ seÃƒÂ§mek istiyor musunuz? Ã…Âuan{" "}
            <strong>{fetchedData.length}</strong> kayÃ„Â±t seÃƒÂ§ildi, onaylarsanÃ„Â±z{" "}
            <strong>{totalCount}</strong> kaydÃ„Â±n hepsi seÃƒÂ§ilecek. Bu iÃ…Å¸lem satÃ„Â±r
            gÃƒÂ¶sterme alanÃ„Â±nÃ„Â± "Hepsi" olarak deÃ„Å¸iÃ…Å¸tirecektir.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)} color="inherit">
            VazgeÃƒÂ§
          </Button>
          <Button
            onClick={handleConfirmSelectAll}
            color="primary"
            variant="contained"
          >
            Onayla
          </Button>
        </DialogActions>
      </Dialog>

      <Stack direction="row" alignItems="center" marginBottom={2} spacing={2}>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          FiÃ…Å¸ Listesi 
        </Typography>
      </Stack>

      <Box sx={{ position: "relative", minHeight: "450px" }}>
        <Backdrop
          sx={{
            position: "absolute",
            zIndex: 1,
            backgroundColor: "rgba(0, 0, 0, 0.1)",
            backdropFilter: "blur(2px)",
          }}
          open={loading}
        >
          <CircularProgress color="primary" />
        </Backdrop>

        <div onClick={handleHeaderClick}>
          <CustomHotTable 
            ref={hotTableComponent}
            data={fetchedData}
            colHeaders={colHeaders}
            columns={columns}
            colWidths={[0, 100, 100, 120, 100, 120, 150, 200, 250, 120, 120]}
            stretchH="all"
            height={450}
            rowHeaders={true}
            autoWrapRow={true}
            manualColumnResize={true}
            hiddenColumns={{ columns: [0] }}
            licenseKey="non-commercial-and-evaluation"
            afterGetColHeader={afterGetColHeader}
            afterRenderer={afterRenderer}
            language={dictionary.languageCode}
            filters={true}
            dropdownMenu={true}
          />
        </div>
      </Box>

      <Paper elevation={0} sx={{ p: 2, mt: 2, backgroundColor: "transparent" }}>
        <Grid container alignItems="center" spacing={2}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Button
              variant="contained"
              size="small"
              onClick={handleSaveHaricFisListesi}
            >
              DeÃ„Å¸iÃ…Å¸iklikleri Kaydet
            </Button>
          </Grid>

          <Grid
            size={{ xs: 12, md: 4 }}
            sx={{ display: "flex", justifyContent: "center" }}
          >
            <Pagination
              count={Math.ceil(totalCount / pageSize)}
              page={currentPage}
              onChange={(e, val) => fetchData(val)}
              color="primary"
              size="small"
            />
          </Grid>

          <Grid
            size={{ xs: 12, md: 4 }}
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Typography variant="body2">
              Toplam: <strong>{totalCount}</strong> kayÃ„Â±t
            </Typography>
            <TextField
              select
              size="small"
              label="SatÃ„Â±r"
              value={pageSize}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                setPageSize(val);
                fetchData(1, val);
              }}
              SelectProps={{ native: true }}
              sx={{ width: 100 }}
            >
              <option value={20}>20</option>
              <option value={100}>100</option>
              <option value={500}>500</option>
              <option value={-1}>Hepsi</option>
            </TextField>
          </Grid>
        </Grid>
      </Paper>
    </>
  );
};

export default HaricFisListesiTable;


