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
import {
  getGenelHesapPlani,
  updateGenelHesapPlaniVerisi,
} from "@/api/GenelHesapPlani/GenelHesapPlani";

// register Handsontable's modules
registerAllModules();

interface Veri {
  id: number;
  kod: string;
  adi: string;
  paraBirimi: string;
}

interface Props {
  fileType: string;
}

const GenelHesapPlani: React.FC<Props> = ({ fileType }) => {
  const hotTableComponent = useRef<any>(null);

  const user = useSelector((state: AppState) => state.userReducer);
  const customizer = useSelector((state: AppState) => state.customizer);
  const dispatch = useDispatch();

  const [rowCount, setRowCount] = useState(0);

  const [fetchedData, setFetchedData] = useState<Veri[]>([]);

  useEffect(() => {
    dispatch(setCollapse(true));
  }, [dispatch]);

  const colHeaders = ["Id", "Kodu", "Hesap Adı", "Para Birimi"];

  const columns = [
    {
      type: "numeric",
      columnSorting: true,
      readOnly: true,
      editor: false,
      className: "htLeft",
    }, // Id
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
    }, // Hesap Adı
    {
      type: "text",
      columnSorting: true,
      className: "htLeft",
      allowInvalid: false,
      readOnly: true,
      editor: false,
    }, // Para Birimi
  ];

  const handleGetRowData = async (row: number) => {
    if (hotTableComponent.current) {
      const hotInstance = hotTableComponent.current.hotInstance;
      const cellMeta = hotInstance.getDataAtRow(row);
      console.log("Satır Verileri:", cellMeta);
      return cellMeta;
    }
  };

  const handleAfterChange = async (changes: any, source: any) => {
    //Değişen Cellin Satır Indexi
    let changedRow = -1;
    //Değişen Cellin Satır Verileri
    let changedRowData: any;
    if (source === "loadData") {
      return; // Skip this hook on loadData
    }
    if (changes) {
      for (const [row, prop, oldValue, newValue] of changes) {
        console.log(
          `Changed cell at row: ${row}, col: ${prop}, from: ${oldValue}, to: ${newValue}`
        );
        changedRow = row;

        changedRowData = await handleGetRowData(row);

        //Cell Güncelleme
        if (changedRow >= 0) {
          await handleUpdateGenelHesapPlaniVerisi(changedRow);
          changedRow = -1;
        }
      }
    }
  };

  const handleUpdateGenelHesapPlaniVerisi = async (row: number) => {
    const rowData = await handleGetRowData(row);
    if (rowData[2] == null || rowData[2] == undefined) {
      rowData[2] == "";
    }
    const updatedGenelHesapPlaniVerisi = {
      adi: rowData[2],
    };

    try {
      const result = await updateGenelHesapPlaniVerisi(
        user.token || "",
        rowData[0],
        updatedGenelHesapPlaniVerisi
      );
      if (result) {
        await fetchData();
        console.log("Genel Hesap Planı Verisi güncelleme başarılı");
      } else {
        console.error("Genel Hesap Planı güncelleme başarısız");
      }
    } catch (error) {
      console.error("Bir hata oluştu:", error);
    }
  };

  const fetchData = async () => {
    try {
      const genelHesapPlaniVerileri = await getGenelHesapPlani(
        user.token || "",
        fileType
      );

      const rowsAll: any = [];
      genelHesapPlaniVerileri.forEach((veri: any) => {
        const newRow: any = [veri.id, veri.kod, veri.adi, veri.paraBirimi];
        rowsAll.push(newRow);
      });
      rowsAll.sort((a: any, b: any) => (a[0] > b[0] ? 1 : -1));

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
    fetchData();
  }, [fileType]);

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
        saveAs(blob, "GenelHesapPlani.xlsx");
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
          maxHeight: 684,
          maxWidth: "100%",
        }}
        language={dictionary.languageCode}
        ref={hotTableComponent}
        data={fetchedData}
        height={684}
        colHeaders={colHeaders}
        columns={columns}
        colWidths={[20, 20, 120, 20]}
        stretchH="all"
        manualColumnResize={true}
        rowHeaders={true}
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
        afterChange={handleAfterChange}
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

export default GenelHesapPlani;
