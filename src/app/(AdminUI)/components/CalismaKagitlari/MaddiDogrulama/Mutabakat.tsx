import { HotTable } from "@handsontable/react";
import { registerAllModules } from "handsontable/registry";
import { dictionary } from "@/utils/languages/handsontable.tr-TR";
import "handsontable/dist/handsontable.full.min.css";
import { plus } from "@/utils/theme/Typography";
import { useDispatch, useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import { useTheme, Box, Typography } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { setCollapse } from "@/store/customizer/CustomizerSlice";
import { getMutabakatByDipnot } from "@/api/DenetimKanitlari/DenetimKanitlari";
import numbro from "numbro";
import trTR from "numbro/languages/tr-TR";

// register Handsontable's modules
registerAllModules();

numbro.registerLanguage(trTR);
numbro.setLanguage("tr-TR");

interface Veri {
  id: number;
  kebirKodu: number;
  detayKodu: string;
  hesapAdi: string;
  borcAlacakToplami: number;
  bakiye: number;
  ortalamaBakiyeSecilen: number;
  yargisalRastgeleSecilen: number;
  gelenYanit: number;
  fark: number;
  orneklemeyeAlinmadi: string;
}

interface Props {
  dipnot: string;
  isReport?: boolean;
}
const Mutabakat: React.FC<Props> = ({ dipnot, isReport }) => {
  const hotTableComponent = useRef<any>(null);

  const user = useSelector((state: AppState) => state.userReducer);
  const customizer = useSelector((state: AppState) => state.customizer);
  const dispatch = useDispatch();
  const theme = useTheme();

  const [rowCount, setRowCount] = useState(0);

  const [fetchedData, setFetchedData] = useState<Veri[]>([]);

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
    "Id",
    "Kebir Kodu",
    "Detay Kodu",
    "Hesap Adı",
    "Borç Alacak Toplamı",
    "Bakiye",
    "Ortalama Bakiye Bazında Seçilen",
    "Yargısal Olarak Rastgele Seçilen",
    "Gelen Yanıt",
    "Fark",
    "Durum",
  ];

  const columns = [
    { type: "numeric", columnSorting: true, readOnly: true, editor: false }, // Id
    {
      type: "numeric",
      columnSorting: true,
      className: "htLeft",
      allowInvalid: false,
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
    }, // Detay Kodu
    {
      type: "text",
      columnSorting: true,
      className: "htLeft",
      allowInvalid: false,
      readOnly: true,
      editor: false,
    }, // Hesap Adı
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
    }, // Borç Alacak Toplamı
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
    }, // Bakiye
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
    }, // Ortalama Bakiye Bazında Seçilen
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
    }, // Yargısal Olarak Rastgele Seçilen
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
    }, // Gelen Yanıt
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
    }, // Fark
    {
      type: "text",
      columnSorting: true,
      className: "htLeft",
      allowInvalid: false,
      readOnly: true,
      editor: false,
    }, // Durum
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
    TH.style.color = "white";
    TH.style.backgroundColor = theme.palette.primary.main;

    TH.style.borderColor = theme.palette.mode === 'dark' ? theme.palette.grey[700] : "#e0e0e0";

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
    TH.style.color = theme.palette.text.primary;
    TH.style.backgroundColor = theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.primary.light;

    TH.style.borderColor = theme.palette.mode === 'dark' ? theme.palette.grey[700] : "#e0e0e0";
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
    TD.style.color = theme.palette.text.primary;

    const ZEBRA_ROW = theme.palette.mode === 'dark' ? theme.palette.grey[900] : "#F9FAFB";
    const BG_PAPER = theme.palette.mode === 'dark' ? theme.palette.grey[900] : "#FFFFFF";
    const BORDER_COLOR = theme.palette.mode === 'dark' ? theme.palette.grey[700] : '#e0e0e0';

    if (row % 2 === 0) {
      TD.style.backgroundColor = BG_PAPER;
      TD.style.borderColor = BORDER_COLOR;
    } else {
      TD.style.backgroundColor = ZEBRA_ROW;
      TD.style.borderColor = BORDER_COLOR;
    }
  };

  const handleGetRowData = async (row: number) => {
    if (hotTableComponent.current) {
      const hotInstance = hotTableComponent.current.hotInstance;
      const cellMeta = hotInstance.getDataAtRow(row);
      console.log("Satır Verileri:", cellMeta);
      return cellMeta;
    }
  };

  const fetchData = async () => {
    try {
      const mutabakatVerileri = await getMutabakatByDipnot(user.denetciId || 0,
        user.yil || 0,
        user.denetlenenId || 0,
        dipnot
      );
      const rowsAll: any = [];

      mutabakatVerileri.forEach((veri: any) => {
        const newRow: any = [
          veri.id,
          veri.kebirKodu,
          veri.detayKodu,
          veri.hesapAdi,
          veri.borc + veri.alacak,
          veri.bakiye,
          veri.ortalamaBakiyeSecilen,
          veri.yargisalRastgeleSecilen,
          veri.gelenYanit,
          veri.fark,
          veri.orneklemeyeAlinmadi,
        ];
        rowsAll.push(newRow);
      });

      setFetchedData(rowsAll);
      setRowCount(rowsAll.length);
    } catch (error) {
      console.log("Bir hata oluştu:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchData();
  }, [dipnot]);

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
  }, [customizer.isCollapse]);

  return (
    <Box>
      <Typography variant="h6" sx={{ color: "#2C3E50", fontWeight: "bold", mb: 3 }}>
        Mutabakat
      </Typography>
      <HotTable
        style={{
          height: isReport ? "auto" : "100%",
          width: "100%",
          maxHeight: isReport ? "none" : 432,
          maxWidth: "100%",
        }}
        language={dictionary.languageCode}
        ref={hotTableComponent}
        data={fetchedData}
        height={isReport ? "auto" : 432}
        colHeaders={colHeaders}
        columns={columns}
        colWidths={[0, 60, 80, 100, 80, 80, 80, 80, 80, 80, 80]}
        stretchH="all"
        rowHeaders={true}
        rowHeights={35}
        autoWrapRow={true}
        minRows={rowCount}
        minCols={8}
        hiddenColumns={{
          columns: [0],
        }}
        filters={!isReport}
        columnSorting={!isReport}
        dropdownMenu={isReport ? false : [
          "filter_by_condition",
          "filter_by_value",
          "filter_action_bar",
        ]}
        manualColumnResize={!isReport}
        licenseKey="non-commercial-and-evaluation" // For non-commercial use only
        afterGetColHeader={afterGetColHeader}
        afterGetRowHeader={afterGetRowHeader}
        afterRenderer={afterRenderer}
        contextMenu={isReport ? false : ["alignment", "copy"]}
        readOnly={isReport}
      />
    </Box>
  );
};

export default Mutabakat;


