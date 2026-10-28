import { dictionary } from "@/utils/languages/handsontable.tr-TR";
import "@/lib/handsontableSetup";

import CustomHotTable from "@/components/HotTableWrapper";
import { registerAllModules } from "handsontable/registry";

import { plus } from "@/utils/theme/Typography";
import { useDispatch, useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import { Grid, useTheme } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { setCollapse } from "@/store/customizer/CustomizerSlice";
import ExceleAktarButton from "@/app/(AdminUI)/components/Veri/ExceleAktarButton";
import {
  getFinansalTabloKalemlerindeDegisim,
  updateFinansalTabloKalemlerindeDegisim,
} from "@/api/PlanVeProgram/PlanVeProgram";
import numbro from "numbro";
import trTR from "numbro/languages/tr-TR";
import { enqueueSnackbar } from "notistack";
import InfoAlertCart from "@/app/components/Alerts/InfoAlertCart";

// register Handsontable's modules
registerAllModules();

numbro.registerLanguage(trTR);
numbro.setLanguage("tr-TR");

interface Veri {
  id: number;
  kebirKodu: number;
  hesapAdi: string;
  oncekiDonemBakiye: number;
  cariDonemBakiye: number;
  degisimTutar: number;
  degisimYuzde: number;
  tespit: string;
}

interface Props {
  hesaplaTiklandimi: boolean;
}

const FinansalTabloKalemlerindeDegisim: React.FC<Props> = ({
  hesaplaTiklandimi,
}) => {
  const hotTableComponent = useRef<any>(null);

  const user = useSelector((state: AppState) => state.userReducer);
  const customizer = useSelector((state: AppState) => state.customizer);
  const dispatch = useDispatch();
  const theme = useTheme();

  const [rowCount, setRowCount] = useState(0);

  const [fetchedData, setFetchedData] = useState<Veri[]>([]);

  const [openCartAlert, setOpenCartAlert] = useState(false);

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

  const textValidator = (value: string, callback: (value: boolean) => void) => {
    if (!value || value.trim() === "") {
      // EÃƒÂ¯Ã‚Â¿Ã‚Â½er deÃƒÂ¯Ã‚Â¿Ã‚Â½er boÃƒÂ¯Ã‚Â¿Ã‚Â½sa geÃƒÂ¯Ã‚Â¿Ã‚Â½ersiz kabul et
      callback(false);
    } else {
      callback(true);
    }
  };

  const colHeaders = [
    "Id",
    "Kebir Kodu",
    "Hesap AdÃƒÂ¯Ã‚Â¿Ã‚Â½",
    "ÃƒÂ¯Ã‚Â¿Ã‚Â½nceki DÃƒÂ¯Ã‚Â¿Ã‚Â½nem Bakiye",
    "Cari DÃƒÂ¯Ã‚Â¿Ã‚Â½nem Bakiye",
    "DeÃƒÂ¯Ã‚Â¿Ã‚Â½iÃƒÂ¯Ã‚Â¿Ã‚Â½im Tutar",
    "DeÃƒÂ¯Ã‚Â¿Ã‚Â½iÃƒÂ¯Ã‚Â¿Ã‚Â½im (%)",
    "Tespit",
  ];

  const columns = [
    { type: "numeric", columnSorting: true, readOnly: true, editor: false }, // Id
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
    }, // Hesap AdÃƒÂ¯Ã‚Â¿Ã‚Â½
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
    }, // ÃƒÂ¯Ã‚Â¿Ã‚Â½nceki DÃƒÂ¯Ã‚Â¿Ã‚Â½nem Bakiye
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
    }, // Cari DÃƒÂ¯Ã‚Â¿Ã‚Â½nem Bakiye
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
    }, // DeÃƒÂ¯Ã‚Â¿Ã‚Â½iÃƒÂ¯Ã‚Â¿Ã‚Â½im Tutar
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
    }, // DeÃƒÂ¯Ã‚Â¿Ã‚Â½iÃƒÂ¯Ã‚Â¿Ã‚Â½im (%)
    {
      type: "text",
      columnSorting: true,
      className: "htLeft",
      validator: textValidator,
      allowInvalid: false,
    }, //Tespit
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

  const handleGetRowData = async (row: number) => {
    if (hotTableComponent.current) {
      const hotInstance = hotTableComponent.current.hotInstance;
      const cellMeta = hotInstance.getDataAtRow(row);
      console.log("SatÃƒÂ¯Ã‚Â¿Ã‚Â½r Verileri:", cellMeta);
      return cellMeta;
    }
  };

  const handleAfterChange = (changes: any, source: any) => {
    if (source === "loadData") {
      return; // Skip this hook on loadData
    }
    if (changes) {
      for (const [row, prop, oldValue, newValue] of changes) {
        console.log(
          `Changed cell at row: ${row}, col: ${prop}, from: ${oldValue}, to: ${newValue}`
        );

        if (prop === 7) {
          const rowData =
            hotTableComponent.current?.hotInstance.getDataAtRow(row);
          if (!rowData) return;

          const obj = {
            id: rowData[0],
            denetciId: user.denetciId || 0,
            denetlenenId: user.denetlenenId || 0,
            yil: user.yil || 0,
            kebirKodu: rowData[1],
            hesapAdi: rowData[2],
            detayHesapAdi: rowData[2],
            oncekiDonemBakiye: rowData[3],
            cariDonemBakiye: rowData[4],
            degisimTutar: rowData[5],
            degisimYuzde: rowData[6],
            tespit: rowData[7],
          };
          setOpenCartAlert(true);
          handleUpdate(obj);
        }
      }
    }
  };

  const handleUpdate = async (json: any) => {
    try {
      const result = await updateFinansalTabloKalemlerindeDegisim(json
      );
      if (result) {
        fetchData();
        setOpenCartAlert(false);
        enqueueSnackbar("GÃƒÂ¯Ã‚Â¿Ã‚Â½ncellendi", {
          variant: "success",
          autoHideDuration: 5000,
          style: {
            backgroundColor:
              customizer.activeMode === "dark"
                ? theme.palette.success.light
                : theme.palette.success.main,
          },
        });
      } else {
        setOpenCartAlert(false);
        enqueueSnackbar("GÃƒÂ¯Ã‚Â¿Ã‚Â½ncellenemedi", {
          variant: "error",
          autoHideDuration: 5000,
          style: {
            backgroundColor:
              customizer.activeMode === "dark"
                ? theme.palette.error.light
                : theme.palette.error.main,
            maxWidth: "720px",
          },
        });
      }
    } catch (error) {
      console.log("Bir hata oluÃƒÂ¯Ã‚Â¿Ã‚Â½tu:", error);
    }
  };

  const fetchData = async () => {
    try {
      const finansalTabloVerilerindeDegisimVerileri =
        await getFinansalTabloKalemlerindeDegisim(user.denetciId || 0,
          user.denetlenenId || 0,
          user.yil || 0
        );

      const rowsAll: any = [];
      finansalTabloVerilerindeDegisimVerileri.forEach((veri: any) => {
        const newRow: any = [
          veri.id,
          veri.kebirKodu,
          veri.hesapAdi,
          veri.oncekiDonemBakiye,
          veri.cariDonemBakiye,
          veri.degisimTutar,
          veri.degisimYuzde,
          veri.tespit,
        ];
        rowsAll.push(newRow);
      });

      setRowCount(rowsAll.length);
      setFetchedData(rowsAll);
    } catch (error) {
      console.log("Bir hata oluÃƒÂ¯Ã‚Â¿Ã‚Â½tu:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (hesaplaTiklandimi) {
      setFetchedData([]);
      setRowCount(0);
    } else {
      fetchData();
    }
  }, [hesaplaTiklandimi]);

  const handleDownload = () => {
    const hotTableInstance = hotTableComponent.current.hotInstance;
    const data = hotTableInstance.getData();

    const processedData = data.map((row: any) => row.slice(1));

    const headers = hotTableInstance.getColHeader().slice(1);

    const fullData = [headers, ...processedData];

    async function createExcelFile() {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Sayfa1");

      fullData.forEach((row: any) => {
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
        saveAs(blob, "FinansalTabloKalemlerindeDegisim.xlsx");
        console.log("Excel dosyasÃƒÂ¯Ã‚Â¿Ã‚Â½ baÃƒÂ¯Ã‚Â¿Ã‚Â½arÃƒÂ¯Ã‚Â¿Ã‚Â½yla oluÃƒÂ¯Ã‚Â¿Ã‚Â½turuldu");
      } catch (error) {
        console.log("Excel dosyasÃƒÂ¯Ã‚Â¿Ã‚Â½ oluÃƒÂ¯Ã‚Â¿Ã‚Â½turulurken bir hata oluÃƒÂ¯Ã‚Â¿Ã‚Â½tu:", error);
      }
    }
    createExcelFile();
  };

  useEffect(() => {
    if (hotTableComponent.current) {
      const diff = customizer.isCollapse
        ? 0
        : customizer.SidebarWidth && customizer.MiniSidebarWidth
          ? customizer.SidebarWidth - customizer.MiniSidebarWidth
          : 0;

      const currentWidth = hotTableComponent.current.hotInstance.rootElement?.clientWidth ?? 0;
      const calculatedWidth = Math.max(currentWidth - diff, 0);
      hotTableComponent.current.hotInstance.updateSettings({
        width: customizer.isCollapse ? "100%" : calculatedWidth,
      });
    }
  }, [
    customizer.isCollapse,
    customizer.SidebarWidth,
    customizer.MiniSidebarWidth,
  ]);

  return (
    <>
      <CustomHotTable 
        style={{
          height: "100%",
          width: "100%",
          maxHeight: 684,
          maxWidth: "100%",
        }}
        language={dictionary.languageCode}
        ref={hotTableComponent}
        data={fetchedData}
        height={684}
        colHeaders={colHeaders}
        columns={columns}
        colWidths={[0, 25, 65, 45, 45, 45, 35, 65]}
        stretchH="all"
        manualColumnResize={true}
        rowHeaders={true}
        rowHeights={35}
        autoWrapRow={true}
        minRows={rowCount}
        minCols={8}
        hiddenColumns={{
          columns: [0],
        }}
        filters={true}
        columnSorting={true}
        dropdownMenu={[
          "filter_by_condition",
          "filter_by_value",
          "filter_action_bar",
        ]}
        licenseKey="non-commercial-and-evaluation" // For non-commercial use only
        afterGetColHeader={afterGetColHeader}
        afterGetRowHeader={afterGetRowHeader}
        afterRenderer={afterRenderer}
        afterChange={handleAfterChange}
        contextMenu={["alignment", "copy"]}
      />
      <Grid container marginTop={2} marginBottom={1}>
        <Grid
          size={{
            xs: 12,
            lg: 10
          }}></Grid>
        <Grid
          sx={{
            display: "flex",
            justifyContent: "flex-end",
          }}
          size={{
            xs: 12,
            lg: 2
          }}>
          <ExceleAktarButton
            handleDownload={handleDownload}
          ></ExceleAktarButton>
        </Grid>
      </Grid>
      {openCartAlert && (
        <InfoAlertCart
          openCartAlert={openCartAlert}
          setOpenCartAlert={setOpenCartAlert}
        ></InfoAlertCart>
      )}
    </>
  );
};

export default FinansalTabloKalemlerindeDegisim;


