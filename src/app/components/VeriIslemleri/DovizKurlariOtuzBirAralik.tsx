import { dictionary } from "@/utils/languages/handsontable.tr-TR";
import "@/lib/handsontableSetup";

import CustomHotTable from "@/components/HotTableWrapper";
import { registerAllModules } from "handsontable/registry";

import { useDispatch, useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import { Grid } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { setCollapse } from "@/store/customizer/CustomizerSlice";
import ExceleAktarButton from "@/app/components/Buttons/ExceleAktarButton";
import { getDovizKurlariOtuzBirAralik } from "@/api/VeriIslemleri/DovizKurlari";

// register Handsontable's modules
registerAllModules();

interface Veri {
  tarih: string;
  paraBirimiKodu: string;
  paraBirimiAdi: string;
  dovizAlis: number;
  dovizSatis: number;
}

interface Props {
  verileriCekTiklandimi: boolean;
}

const DovizKurlariOtuzBirAralik: React.FC<Props> = ({
  verileriCekTiklandimi,
}) => {
  const hotTableComponent = useRef<any>(null);

  const user = useSelector((state: AppState) => state.userReducer);
  const customizer = useSelector((state: AppState) => state.customizer);
  const dispatch = useDispatch();

  const [rowCount, setRowCount] = useState(0);

  const [fetchedData, setFetchedData] = useState<Veri[]>([]);

  useEffect(() => {
    dispatch(setCollapse(true));
  }, [dispatch]);

  const colHeaders = ["Tarih", "Kodu", "Adı", "Döviz Alış", "Döviz Satış"];

  const columns = [
    {
      type: "text",
      columnSorting: true,
      className: "htLeft",
      allowInvalid: false,
      readOnly: true,
      editor: false,
    }, // Tarih
    {
      type: "text",
      columnSorting: true,
      className: "htLeft",
      allowInvalid: false,
      readOnly: true,
      editor: false,
    }, // Kodu
    {
      type: "text",
      columnSorting: true,
      className: "htLeft",
      allowInvalid: false,
      readOnly: true,
      editor: false,
    }, // Adı
    {
      type: "numeric",
      numericFormat: { pattern: "0,0.0000", columnSorting: true },
      className: "htRight",
      allowInvalid: false,
      readOnly: true,
      editor: false,
    }, // Döviz Alış
    {
      type: "numeric",
      numericFormat: { pattern: "0,0.0000", columnSorting: true },
      className: "htRight",
      allowInvalid: false,
      readOnly: true,
      editor: false,
    }, // Döviz Satış
  ];

  const fetchData = async () => {
    try {
      const dovizKurlariOtuzBirAralik = await getDovizKurlariOtuzBirAralik(
        user.token || ""
      );

      const rowsAll: any = [];
      dovizKurlariOtuzBirAralik.forEach((veri: any) => {
        const newRow: any = [
          veri.tarih.split("T")[0].split("-").reverse().join("."),
          veri.paraBirimiKodu,
          veri.paraBirimiAdi,
          veri.dovizAlis,
          veri.dovizSatis,
        ];
        rowsAll.push(newRow);
      });

      setRowCount(rowsAll.length);
      setFetchedData(rowsAll);
    } catch (error) {
      console.error("Bir hata oluştu:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (verileriCekTiklandimi) {
      setFetchedData([]);
      setRowCount(0);
    } else {
      fetchData();
    }
  }, [verileriCekTiklandimi]);

  const handleDownload = () => {
    const hotTableInstance = hotTableComponent.current.hotInstance;
    const data = hotTableInstance.getData();

    const processedData = data.map((row: any) => row.slice(0));

    const headers = hotTableInstance.getColHeader().slice(0);

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
        saveAs(blob, "DovizKurlariOtuzBirAralik.xlsx");
        console.log("Excel dosyası başarıyla oluşturuldu");
      } catch (error) {
        console.error("Excel dosyası oluşturulurken bir hata oluştu:", error);
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

      hotTableComponent.current.hotInstance.updateSettings({
        width: customizer.isCollapse
          ? "100%"
          : hotTableComponent.current.hotInstance.rootElement.clientWidth -
          diff,
      });
    }
  }, [customizer.isCollapse]);

  return (
    <>
      <CustomHotTable
        adminDesign
        density="compact"
        style={{
          height: "100%",
          width: "100%",
          maxHeight: 342,
          maxWidth: "100%",
        }}
        language={dictionary.languageCode}
        ref={hotTableComponent}
        data={fetchedData}
        height={342}
        colHeaders={colHeaders}
        columns={columns}
        colWidths={[80, 80, 120, 80, 80, 80]}
        stretchH="all"
        manualColumnResize={true}
        rowHeaders={true}
        autoWrapRow={true}
        minRows={rowCount}
        minCols={3}
        filters={true}
        columnSorting={true}
        dropdownMenu={[
          "filter_by_condition",
          "filter_by_value",
          "filter_action_bar",
        ]}
        licenseKey="non-commercial-and-evaluation" // For non-commercial use only
        contextMenu={["alignment", "copy"]}
      />
      <Grid container marginTop={2} marginBottom={1}>
        <Grid size={{ xs: 12, lg: 10 }}></Grid>
        <Grid
          size={{ xs: 12, lg: 2 }}
          sx={{
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <ExceleAktarButton
            handleDownload={handleDownload}
          ></ExceleAktarButton>
        </Grid>
      </Grid>
    </>
  );
};

export default DovizKurlariOtuzBirAralik;
