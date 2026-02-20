import { HotTable } from "@handsontable/react";
import { registerAllModules } from "handsontable/registry";
import { dictionary } from "@/utils/languages/handsontable.tr-TR";
import "handsontable/dist/handsontable.full.min.css";
import { plus } from "@/utils/theme/Typography";
import { useDispatch, useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import { Grid, useTheme, CircularProgress, Box, Pagination, Typography, Button, Fab, Tooltip, Stack } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { CustomDatePicker } from "@/utils/datePickerUtil";
import { useEffect, useRef, useState } from "react";
import { getFormat } from "@/api/Veri/base";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { setCollapse } from "@/store/customizer/CustomizerSlice";
import ExceleAktarButton from "@/app/(AdminUI)/components/Veri/ExceleAktarButton";
import { getMizanVerileri } from "@/api/Veri/Mizan";
import numbro from "numbro";
import trTR from "numbro/languages/tr-TR";
import { IconHistory } from "@tabler/icons-react";
import CustomFormLabel from "@/app/(AdminUI)/components/Forms/ThemeElements/CustomFormLabel";
import CustomTextField from "@/app/(AdminUI)/components/Forms/ThemeElements/CustomTextField";
import MizanCard from "@/app/(AdminUI)/components/Veri/Mizan/MizanCard";
import { enqueueSnackbar } from "notistack";

// register Handsontable's modules
registerAllModules();

numbro.registerLanguage(trTR);
numbro.setLanguage("tr-TR");

interface Veri {
  kebirKodu: number;
  detayHesapKodu: string;
  hesapAdi: string;
  detayHesapAdi: string;
  netBorc: number;
  netAlacak: number;
  paraBirimi: string;
  netBakiye: number;
}

interface Props {
  type: string;
  mizanOlusturTiklandimi: boolean;
  setMizanOlusturTiklandimi: (bool: boolean) => void;
  handleAnaHesapMizan?: () => Promise<void>;
  handleDetayHesapMizan?: () => Promise<void>;
  handleBirlestirilmisMizan?: () => Promise<void>;
  mizanBaslangicTarihi?: any;
  setMizanBaslangicTarihi?: (date: any) => void;
  mizanBitisTarihi?: any;
  setMizanBitisTarihi?: (date: any) => void;
  sharedData?: any[];
  showOnlyTable?: boolean;
}

const Mizan: React.FC<Props> = ({
  type,
  mizanOlusturTiklandimi,
  setMizanOlusturTiklandimi,
  handleAnaHesapMizan,
  handleDetayHesapMizan,
  handleBirlestirilmisMizan,
  mizanBaslangicTarihi,
  setMizanBaslangicTarihi,
  mizanBitisTarihi,
  setMizanBitisTarihi,
  sharedData,
  showOnlyTable = false,
}) => {
  const hotTableComponent = useRef<any>(null);

  const user = useSelector((state: AppState) => state.userReducer);
  const customizer = useSelector((state: AppState) => state.customizer);
  const dispatch = useDispatch();
  const theme = useTheme();

  const [rowCount, setRowCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [showDrawer, setShowDrawer] = useState(false);

  const [fetchedData, setFetchedData] = useState<Veri[]>([]);
  const [allData, setAllData] = useState<any[]>([]); // Store all data for the table
  const [rawMizanData, setRawMizanData] = useState<any[]>([]); // Store raw objects for MizanCard
  const [hiddenIndices, setHiddenIndices] = useState<number[]>([]);

  const isDataEmpty = !loading && rowCount === 0;

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
  }, [customizer.activeMode]);

  const colHeaders = [
    "Kebir Kodu",
    "D. Hesap Kodu",
    "Hesap Adı",
    "D. Hesap Adı",
    "Borç",
    "Alacak",
    "Para Birimi",
    "Bakiye",
  ];

  const columns = [
    {
      type: "numeric",
      columnSorting: true,
      className: "htLeft",
      readOnly: true,
      editor: false,
    }, // Kebir Kodu
    {
      type: "text",
      columnSorting: true,
      className: "htLeft",
      allowInvalid: false,
      readOnly: true,
      editor: false,
    }, // Detay Hesap Kodu
    {
      type: "text",
      columnSorting: true,
      className: "htLeft",
      allowInvalid: false,
      readOnly: true,
      editor: false,
    }, // Hesap Adı
    {
      type: "text",
      columnSorting: true,
      className: "htLeft",
      allowInvalid: false,
      readOnly: true,
      editor: false,
    }, // Detay Hesap Adı
    {
      type: "numeric",
      numericFormat: {
        pattern: "0,0.00",
        columnSorting: true,
        culture: "tr-TR",
      },
      className: "htRight",
      readOnly: true,
      editor: false,
    }, // Net Borç
    {
      type: "numeric",
      numericFormat: {
        pattern: "0,0.00",
        columnSorting: true,
        culture: "tr-TR",
      },
      className: "htRight",
      readOnly: true,
      editor: false,
    }, // Net Alacak
    {
      type: "text",
      columnSorting: true,
      className: "htLeft",
      allowInvalid: false,
      readOnly: true,
      editor: false,
    }, // Para Birimi
    {
      type: "numeric",
      numericFormat: {
        pattern: "0,0.00",
        columnSorting: true,
        culture: "tr-TR",
      },
      className: "htRight",
      readOnly: true,
      editor: false,
    }, // Mutlak Bakiye
  ];

  const afterGetColHeader = (col: any, TH: any) => {
    TH.style.height = "50px";

    let div = TH.querySelector("div");
    if (!div) {
      div = document.createElement("div");
      TH.appendChild(div);
    }

    div.style.whiteSpace = "normal";
    div.style.wordWrap = "break-word";
    div.style.display = "flex";
    div.style.alignItems = "center";
    div.style.height = "100%";
    div.style.position = "relative";

    //typography body1
    TH.style.fontFamily = plus.style.fontFamily;
    TH.style.fontWeight = 500;
    TH.style.fontSize = "0.875rem";
    TH.style.lineHeight = "1.334rem";

    //color
    TH.style.color = customizer.activeMode === "dark" ? "#ffffff" : "#2A3547";
    TH.style.backgroundColor = theme.palette.primary.light;
    //customizer.activeMode === "dark" ? "#253662" : "#ECF2FF";

    TH.style.borderColor = customizer.activeMode === "dark" ? "#10141c" : "#";

    // Create span for the header text
    let span = div.querySelector("span");
    if (!span) {
      span = document.createElement("span");
      div.appendChild(span);
    }
    span.textContent = colHeaders[col];
    span.style.position = "absolute";
    span.style.marginRight = "16px";
    span.style.left = "4px";

    // Create button if it does not exist
    let button = div.querySelector("button");
    if (!button) {
      button = document.createElement("button");
      button.style.display = "none";
      div.appendChild(button);
    }
    button.style.position = "absolute";
    button.style.right = "4px";
  };

  const afterGetRowHeader = (row: any, TH: any) => {
    let div = TH.querySelector("div");
    div.style.whiteSpace = "normal";
    div.style.wordWrap = "break-word";
    div.style.display = "flex";
    div.style.alignItems = "center";
    div.style.justifyContent = "center";
    div.style.height = "100%";

    //typography body1
    TH.style.fontFamily = plus.style.fontFamily;
    TH.style.fontWeight = 500;
    TH.style.fontSize = "0.875rem";
    TH.style.lineHeight = "1.334rem";

    //color
    TH.style.color = customizer.activeMode === "dark" ? "#ffffff" : "#2A3547";
    TH.style.backgroundColor = theme.palette.primary.light;
    //customizer.activeMode === "dark" ? "#253662" : "#ECF2FF";

    TH.style.borderColor = customizer.activeMode === "dark" ? "#10141c" : "#";
  };

  const afterRenderer = (
    TD: any,
    row: any,
    col: any,
    prop: any,
    value: any,
    cellProperties: any
  ) => {
    //typography body1
    TD.style.fontFamily = plus.style.fontFamily;
    TD.style.fontWeight = 500;
    TD.style.fontSize = "0.875rem";
    TD.style.lineHeight = "1.334rem";
    //TD.style.textAlign = "left";

    //color
    TD.style.color = customizer.activeMode === "dark" ? "#ffffff" : "#2A3547";

    if (row % 2 === 0) {
      TD.style.backgroundColor =
        customizer.activeMode === "dark" ? "#171c23" : "#ffffff";
      TD.style.borderColor =
        customizer.activeMode === "dark" ? "#10141c" : "#cccccc";
    } else {
      TD.style.backgroundColor =
        customizer.activeMode === "dark" ? "#10141c" : "#cccccc";
      TD.style.borderColor =
        customizer.activeMode === "dark" ? "#10141c" : "#cccccc";
      TD.style.borderRightColor =
        customizer.activeMode === "dark" ? "#171c23" : "#ffffff";
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setPage(0); // Reset to first page when fetching new data
      // Only use shared data if it has content, otherwise fetch from API
      const mizanVerileri = (sharedData && sharedData.length > 0) ? sharedData : await getMizanVerileri(user.denetciId || 0,
        user.denetlenenId || 0,
        user.yil || 0,
        type
      );

      let totalBorc = 0;
      let totalAlacak = 0;
      const rowsAll: any = [];
      mizanVerileri.forEach((veri: any) => {
        const newRow: any = [
          veri.kebirKodu,
          veri.detayKodu,
          veri.hesapAdi,
          veri.detayHesapAdi,
          veri.borcTutari,
          veri.alacakTutari,
          veri.paraBirimi,
          veri.netBakiye,
        ];
        rowsAll.push(newRow);
        if (veri.detayKodu.length === 3) {
          totalBorc += veri.borcTutari;
          totalAlacak += veri.alacakTutari;
        }
      });
      if (rowsAll.length > 0) {
        rowsAll.sort((a: any, b: any) => (a[1] > b[1] ? 1 : -1));
        rowsAll.push([
          undefined,
          undefined,
          undefined,
          "Toplam",
          totalBorc,
          totalAlacak,
          undefined,
          undefined,
        ]);
      } else {
        enqueueSnackbar("Mizan Oluşturmalısınız.", {
          variant: "warning",
          autoHideDuration: 5000,
          style: {
            backgroundColor: customizer.activeMode === "dark" ? theme.palette.warning.dark : theme.palette.warning.main,
          }
        });
      }

      setRawMizanData(mizanVerileri);
      // Store all data for pagination
      setAllData(rowsAll);
      setFetchedData(rowsAll); // Provide all data to HotTable for global filtering
      setRowCount(rowsAll.length);
    } catch (error) {
      console.log("Bir hata oluştu:", error);
    } finally {
      setLoading(false);
    }
  };

  const updatePagination = () => {
    if (!hotTableComponent.current || !hotTableComponent.current.hotInstance) return;
    const hotInstance = hotTableComponent.current.hotInstance;

    // countRows() returns the number of visual rows (respecting filters but NOT hiddenRows)
    const count = hotInstance.countRows();

    // updateRowCount is used for pagination UI labels
    setRowCount(count);

    const startIndex = page * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;

    const toHide: number[] = [];
    for (let i = 0; i < count; i++) {
      if (i < startIndex || i >= endIndex) {
        // toPhysicalRow converts visual index (non-trimmed) to physical index
        toHide.push(hotInstance.toPhysicalRow(i));
      }
    }

    setHiddenIndices(toHide);
  };

  useEffect(() => {
    updatePagination();
  }, [page, rowsPerPage, allData]);

  useEffect(() => {
    if (mizanOlusturTiklandimi) {
      // Temizle veriler
      setFetchedData([]);
      setRowCount(0);
      setPage(0);
      setRawMizanData([]);
    } else {
      // Yeni verileri yükle
      fetchData();
    }
  }, [mizanOlusturTiklandimi]);

  const handleDownload = () => {
    if (!hotTableComponent.current || !hotTableComponent.current.hotInstance) return;
    const hotInstance = hotTableComponent.current.hotInstance;

    // Get all data currently passing the filter
    const count = hotInstance.countRows();
    const headers = colHeaders;
    const rows: any[] = [];

    for (let i = 0; i < count; i++) {
      rows.push(hotInstance.getDataAtRow(i));
    }

    const fullDataForExcel = [headers, ...rows];

    async function createExcelFile() {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Sayfa1");

      fullDataForExcel.forEach((row: any) => {
        worksheet.addRow(row);
      });

      const headerRow = worksheet.getRow(1);
      headerRow.font = {
        name: "Calibri",
        size: 12,
        bold: true,
        color: { argb: "FFFFFF" },
      };
      headerRow.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "1a6786" },
      };
      headerRow.alignment = { horizontal: "left" };

      worksheet.columns.forEach((column) => {
        column.width = 25;
      });

      try {
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        saveAs(blob, "EDefterMizan.xlsx");
        console.log("Excel dosyası başarıyla oluşturuldu");
      } catch (error) {
        console.log("Excel dosyası oluşturulurken bir hata oluştu:", error);
      }
    }
    createExcelFile();
  };

  useEffect(() => {
    const handleResize = () => {
      if (hotTableComponent.current && hotTableComponent.current.hotInstance) {
        const hotInstance = hotTableComponent.current.hotInstance;
        const diff = customizer.isCollapse
          ? 0
          : customizer.SidebarWidth && customizer.MiniSidebarWidth
            ? customizer.SidebarWidth - customizer.MiniSidebarWidth
            : 0;

        hotInstance.updateSettings({
          width: customizer.isCollapse
            ? "100%"
            : hotInstance.rootElement.parentElement.clientWidth - diff,
          height: window.innerHeight - 450,
        });
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [customizer.isCollapse, customizer.activeMode]);

  const handleShowAnaHesap = () => {
    const filtered = allData.filter((row: any) => (row[1] && row[1].toString().length === 3) || row[3] === 'Toplam');
    setFetchedData(filtered);
    setRowCount(filtered.length);
    setPage(0);
  };

  const handleShowDetayHesap = () => {
    const filtered = allData.filter((row: any) => (row[1] && row[1].toString().length > 3) || row[3] === 'Toplam');
    setFetchedData(filtered);
    setRowCount(filtered.length);
    setPage(0);
  };

  // If showOnlyTable is true, render only HotTable
  if (showOnlyTable) {
    return (
      <Box sx={{ position: "relative" }}>
        {loading && (
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: customizer.activeMode === "dark" ? "rgba(0,0,0,0.7)" : "rgba(255,255,255,0.7)",
              zIndex: 1000,
            }}
          >
            <CircularProgress />
          </Box>
        )}
        <HotTable
          style={{
            height: "100%",
            width: "100%",
            maxHeight: "calc(100vh - 450px)",
            maxWidth: "100%",
          }}
          language={dictionary.languageCode}
          ref={hotTableComponent}
          data={fetchedData}
          height="calc(100vh - 450px)"
          colHeaders={colHeaders}
          columns={columns}
          colWidths={[80, 80, 120, 120, 100, 100, 60, 100]}
          stretchH="all"
          manualColumnResize={true}
          rowHeaders={true}
          rowHeights={35}
          autoWrapRow={true}
          minRows={rowCount}
          minCols={8}
          filters={true}
          columnSorting={true}
          dropdownMenu={[
            "filter_by_condition",
            "filter_by_value",
            "filter_action_bar",
          ]}
          hiddenRows={{
            rows: hiddenIndices,
            indicators: false,
          }}
          afterFilter={() => {
            setPage(0);
            updatePagination();
          }}
          licenseKey="non-commercial-and-evaluation"
          afterGetColHeader={afterGetColHeader}
          afterGetRowHeader={afterGetRowHeader}
          afterRenderer={afterRenderer}
          contextMenu={["alignment", "copy"]}
        />
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="tr">
      <>
        <Grid container spacing={3} mb={3}>
          <Grid
            size={{
              xs: 12,
              lg: 6
            }}
            sx={{ display: "flex", flexDirection: "column" }}
          >
            <Grid container spacing={2} p={1} height="100%" direction="column">
              <Grid size="auto">
                {/* Tarih Satırı */}
                <Grid container spacing={2} alignItems="center">
                  <Grid size="auto">
                    <CustomFormLabel
                      htmlFor="mizanBaslangicTarihi"
                      sx={{
                        mt: 0,
                        mb: { xs: "-10px", sm: 0 },
                        mr: 0,
                        whiteSpace: "nowrap",
                      }}
                    >
                      <Typography variant="subtitle1">
                        Başlangıç Tarihi:
                      </Typography>
                    </CustomFormLabel>
                  </Grid>
                  <Grid size="auto" sx={{ width: "160px" }}>
                    <CustomDatePicker
                      id="mizanBaslangicTarihi"
                      value={mizanBaslangicTarihi}
                      onChange={(value: any) =>
                        setMizanBaslangicTarihi && setMizanBaslangicTarihi(value)
                      }
                    />
                  </Grid>
                  <Grid size="auto">
                    <CustomFormLabel
                      htmlFor="mizanBitisTarihi"
                      sx={{
                        mt: 0,
                        mb: { xs: "-10px", sm: 0 },
                        mr: 0,
                        whiteSpace: "nowrap",
                      }}
                    >
                      <Typography variant="subtitle1">
                        Bitiş Tarihi:
                      </Typography>
                    </CustomFormLabel>
                  </Grid>
                  <Grid size="auto" sx={{ width: "160px" }}>
                    <CustomDatePicker
                      id="mizanBitisTarihi"
                      value={mizanBitisTarihi}
                      onChange={(value: any) =>
                        setMizanBitisTarihi && setMizanBitisTarihi(value)
                      }
                    />
                  </Grid>
                </Grid>
              </Grid>
              {/* Buton Satırı */}
              <Grid size="auto" sx={{ mt: 1 }}>
                <Grid container spacing={2} alignItems="center" justifyContent="center">
                  <Grid size="auto">
                    <Stack direction="row" spacing={1}>
                      <Button
                        size="medium"
                        variant="outlined"
                        color="primary"
                        disabled={mizanOlusturTiklandimi}
                        onClick={() => {
                          setMizanOlusturTiklandimi(true);
                          if (type === "BirlestirilmisMizan" && handleBirlestirilmisMizan) {
                            handleBirlestirilmisMizan();
                          } else if (handleAnaHesapMizan) {
                            handleAnaHesapMizan();
                          }
                        }}
                        sx={{
                          backgroundColor: isDataEmpty ? theme.palette.warning.light : 'transparent',
                          borderColor: isDataEmpty ? theme.palette.warning.main : theme.palette.primary.main,
                          '&:hover': {
                            backgroundColor: isDataEmpty ? theme.palette.warning.main : theme.palette.primary.light,
                          },
                          animation: isDataEmpty ? 'pulse 2s infinite' : 'none',
                        }}
                      >
                        Mizan
                      </Button>
                      <Button
                        size="medium"
                        variant="outlined"
                        color="primary"
                        disabled={mizanOlusturTiklandimi}
                        onClick={() => {
                          setMizanOlusturTiklandimi(true);
                          if (type === "BirlestirilmisMizan" && handleBirlestirilmisMizan) {
                            handleBirlestirilmisMizan();
                          } else if (handleDetayHesapMizan) {
                            handleDetayHesapMizan();
                          }
                        }}
                        sx={{
                          backgroundColor: isDataEmpty ? theme.palette.warning.light : 'transparent',
                          borderColor: isDataEmpty ? theme.palette.warning.main : theme.palette.primary.main,
                          '&:hover': {
                            backgroundColor: isDataEmpty ? theme.palette.warning.main : theme.palette.primary.light,
                          },
                          animation: isDataEmpty ? 'pulse 2s infinite' : 'none',
                        }}
                      >
                        Detay Mizan
                      </Button>
                    </Stack>
                  </Grid>
                  <Grid size="auto">
                    <Tooltip title="Mizan Oluşturma Kayıtları">
                      <Fab
                        color="warning"
                        size="small"
                        onClick={() => setShowDrawer(true)}
                      >
                        <IconHistory width={18.25} height={18.25} />
                      </Fab>
                    </Tooltip>
                  </Grid>
                </Grid>
              </Grid>
              <Box sx={{ flexGrow: 1 }} />
              <Grid size="auto" sx={{ display: "flex", gap: 2, pb: 1, justifyContent: "center" }}>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={handleShowAnaHesap}
                >
                  Ana Hesap Göster
                </Button>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={handleShowDetayHesap}
                >
                  Detay Hesap Göster
                </Button>
              </Grid>
            </Grid>
          </Grid>
          <Grid
            size={{
              xs: 12,
              lg: 6
            }}
            sx={{ display: "flex", flexDirection: "column" }}
          >
            <MizanCard
              type={"E-Defter"}
              mizanOlusturTiklandimi={mizanOlusturTiklandimi}
              setMizanOlusturTiklandimi={setMizanOlusturTiklandimi}
              fetchedData={rawMizanData}
            />
          </Grid>
        </Grid>
        <Box sx={{ position: "relative" }}>
          {loading && (
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: customizer.activeMode === "dark" ? "rgba(0,0,0,0.7)" : "rgba(255,255,255,0.7)",
                zIndex: 1000,
              }}
            >
              <CircularProgress />
            </Box>
          )}
          <HotTable
            style={{
              height: "100%",
              width: "100%",
              maxHeight: "calc(100vh - 450px)",
              maxWidth: "100%",
            }}
            language={dictionary.languageCode}
            ref={hotTableComponent}
            data={fetchedData}
            height="calc(100vh - 450px)"
            colHeaders={colHeaders}
            columns={columns}
            colWidths={[80, 80, 120, 120, 100, 100, 60, 100]}
            stretchH="all"
            manualColumnResize={true}
            rowHeaders={true}
            rowHeights={35}
            autoWrapRow={true}
            minRows={rowCount}
            minCols={8}
            filters={true}
            columnSorting={true}
            dropdownMenu={[
              "filter_by_condition",
              "filter_by_value",
              "filter_action_bar",
            ]}
            hiddenRows={{
              rows: hiddenIndices,
              indicators: false,
            }}
            afterFilter={() => {
              setPage(0); // Reset to first page on filter change
              updatePagination();
            }}
            licenseKey="non-commercial-and-evaluation" // For non-commercial use only
            afterGetColHeader={afterGetColHeader}
            afterGetRowHeader={afterGetRowHeader}
            afterRenderer={afterRenderer}
            contextMenu={["alignment", "copy"]}
          />
        </Box>
        <Grid container marginTop={2} marginBottom={1} alignItems="center">
          <Grid
            size={{
              xs: 12,
              lg: 6
            }}
            sx={{
              display: "flex",
              justifyContent: "flex-start",
              alignItems: "center",
              gap: 2
            }}>
            <Pagination
              count={Math.ceil(rowCount / rowsPerPage)}
              page={page + 1}
              onChange={(event, value) => setPage(value - 1)}
              color="primary"
              showFirstButton
              showLastButton
            />
            <Typography variant="body2" color="text.secondary">
              {rowCount} kayıttan {page * rowsPerPage + 1}-{Math.min((page + 1) * rowsPerPage, rowCount)} arası gösteriliyor
            </Typography>
          </Grid>
          <Grid
            size={{
              xs: 12,
              lg: 6
            }}
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
            }}>

            <ExceleAktarButton
              handleDownload={handleDownload}
            ></ExceleAktarButton>
          </Grid>
        </Grid>
      </>
    </LocalizationProvider>
  );
};

export default Mizan;


