import { HotTable } from "@handsontable/react";
import { registerAllModules } from "handsontable/registry";
import { dictionary } from "@/utils/languages/handsontable.tr-TR";
import "handsontable/dist/handsontable.full.min.css";
import { plus } from "@/utils/theme/Typography";
import { useDispatch, useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import { Fab, Grid, Tooltip, useTheme } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { setCollapse } from "@/store/customizer/CustomizerSlice";
import {
  getOrneklemByDipnot,
  getOrneklemByDipnotTers,
} from "@/api/DenetimKanitlari/DenetimKanitlari";
import numbro from "numbro";
import trTR from "numbro/languages/tr-TR";
import OrneklemFisleri from "./OrneklemFisleri";
import { IconEye, IconEyeOff } from "@tabler/icons-react";

// register Handsontable's modules
registerAllModules();

numbro.registerLanguage(trTR);
numbro.setLanguage("tr-TR");

interface Veri {
  id: number;
  kebirKodu: number;
  hesapAdi: string;
  borc: number;
  borcIslemSayisi: number;
  borcOrtalama: number;
  alacak: number;
  alacakIslemSayisi: number;
  alacakOrtalama: number;
  kalanBakiye: number;
  toplamIslemSayisi: number;
  orneklemSayisi: number;
  borcOrneklemSayisi: number;
  alacakOrneklemSayisi: number;
  listelemeTuru: string;
  guvenilirlikDuzeyi: string;
}

interface Props {
  dipnot: string;
  tersMi?: boolean;
}
const Orneklem: React.FC<Props> = ({ dipnot, tersMi }) => {
  const hotTableComponent = useRef<any>(null);

  const user = useSelector((state: AppState) => state.userReducer);
  const customizer = useSelector((state: AppState) => state.customizer);
  const dispatch = useDispatch();
  const theme = useTheme();

  const [kebirKodu, setKebirKodu] = useState([]);

  const [detayTiklandimi, setDetayTiklandimi] = useState(false);

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
    "Hesap Adı",
    "Borç",
    "B. Fiş Sayısı",
    "B. Ortalaması",
    "Alacak",
    "A. Fiş Sayısı",
    "A. Ortalaması",
    "Bakiye",
    "Toplam Fiş Sayısı",
    "Örneklem Sayısı",
    "Borç Örnek Sayısı",
    "Alacak Örnek Sayısı",
    "Listeleme Türü",
    "Güvenilirlik Düzeyi",
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
    }, // Borç
    {
      type: "numeric",
      numericFormat: {
        pattern: "0,0",
        columnSorting: true,
        culture: "tr-TR",
      },
      className: "htRight",
      readOnly: true,
      editor: false,
    }, // Borç Fiş Sayısı
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
    }, // Borç Ortalaması
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
    }, // Alacak
    {
      type: "numeric",
      numericFormat: {
        pattern: "0,0",
        columnSorting: true,
        culture: "tr-TR",
      },
      className: "htRight",
      readOnly: true,
      editor: false,
    }, // Alacak Fiş Sayısı
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
    }, // Alacak Ortalaması
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
        pattern: "0,0",
        columnSorting: true,
        culture: "tr-TR",
      },
      className: "htRight",
      readOnly: true,
      editor: false,
    }, // Toplam İşlem Sayısı
    {
      type: "numeric",
      numericFormat: {
        pattern: "0,0",
        columnSorting: true,
        culture: "tr-TR",
      },
      className: "htRight",
      readOnly: true,
      editor: false,
    }, // Örneklem Sayısı
    {
      type: "numeric",
      numericFormat: {
        pattern: "0,0",
        columnSorting: true,
        culture: "tr-TR",
      },
      className: "htRight",
      readOnly: true,
      editor: false,
    }, // Borç Örnek Sayısı
    {
      type: "numeric",
      numericFormat: {
        pattern: "0,0",
        columnSorting: true,
        culture: "tr-TR",
      },
      className: "htRight",
      readOnly: true,
      editor: false,
    }, // Alacak Örnek Sayısı
    {
      type: "text",
      columnSorting: true,
      className: "htLeft",
      allowInvalid: false,
      readOnly: true,
      editor: false,
    }, // Listeleme Türü
    {
      type: "text",
      columnSorting: true,
      className: "htLeft",
      allowInvalid: false,
      readOnly: true,
      editor: false,
    }, // Güvenilirlik Düzeyi
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
      console.log("Satır Verileri:", cellMeta);
      return cellMeta;
    }
  };

  const fetchData = async () => {
    try {
      if (tersMi) {
        const orneklemVerileri = await getOrneklemByDipnotTers(user.denetciId || 0,
          user.denetlenenId || 0,
          user.yil || 0,
          dipnot
        );
        const kebirKoduAll: any = [];
        const rowsAll: any = [];

        orneklemVerileri.forEach((veri: any) => {
          const newRow: any = [
            veri.id,
            veri.kebirKodu,
            veri.hesapAdi,
            veri.borc,
            veri.borcIslemSayisi,
            veri.borcOrtalama,
            veri.alacak,
            veri.alacakIslemSayisi,
            veri.alacakOrtalama,
            veri.kalanBakiye,
            veri.toplamIslemSayisi,
            veri.orneklemSayisi,
            veri.borcOrneklemSayisi,
            veri.alacakOrneklemSayisi,
            veri.listelemeTuru,
            veri.guvenilirlikDuzeyi,
          ];
          kebirKoduAll.push(veri.kebirKodu);
          rowsAll.push(newRow);
        });

        setKebirKodu(kebirKoduAll);
        setRowCount(rowsAll.length);
        setFetchedData(rowsAll);
      } else {
        const orneklemVerileri = await getOrneklemByDipnot(user.denetciId || 0,
          user.denetlenenId || 0,
          user.yil || 0,
          dipnot
        );
        const kebirKoduAll: any = [];
        const rowsAll: any = [];

        orneklemVerileri.forEach((veri: any) => {
          const newRow: any = [
            veri.id,
            veri.kebirKodu,
            veri.hesapAdi,
            veri.borc,
            veri.borcIslemSayisi,
            veri.borcOrtalama,
            veri.alacak,
            veri.alacakIslemSayisi,
            veri.alacakOrtalama,
            veri.kalanBakiye,
            veri.toplamIslemSayisi,
            veri.orneklemSayisi,
            veri.borcOrneklemSayisi,
            veri.alacakOrneklemSayisi,
            veri.listelemeTuru,
            veri.guvenilirlikDuzeyi,
          ];
          kebirKoduAll.push(veri.kebirKodu);
          rowsAll.push(newRow);
        });

        setKebirKodu(kebirKoduAll);
        setRowCount(rowsAll.length);
        setFetchedData(rowsAll);
      }
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
    <>
      <HotTable
        style={{
          height: "100%",
          width: "100%",
          maxHeight: 432,
          maxWidth: "100%",
        }}
        language={dictionary.languageCode}
        ref={hotTableComponent}
        data={fetchedData}
        height={"auto"}
        colHeaders={colHeaders}
        columns={columns}
        colWidths={[
          0, 70, 100, 80, 60, 80, 80, 60, 80, 80, 60, 60, 60, 60, 90, 60,
        ]}
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
        contextMenu={["alignment", "copy"]}
      />
      {kebirKodu.length > 0 ? (
        <>
          <Grid container>
            <Grid
              my={2}
              sx={{
                display: "flex",
                justifyContent: "center",
              }}
              size={{
                xs: 12,
                lg: 12
              }}>
              <Tooltip title={detayTiklandimi ? "Detay Gizle" : "Detay Göster"}>
                <Fab
                  color="warning"
                  size="small"
                  onClick={() => setDetayTiklandimi(!detayTiklandimi)}
                >
                  {detayTiklandimi ? (
                    <IconEyeOff width={16} height={16} />
                  ) : (
                    <IconEye width={16} height={16} />
                  )}
                </Fab>
              </Tooltip>
            </Grid>
          </Grid>

          {detayTiklandimi && <OrneklemFisleri kebirKodu={kebirKodu} />}
        </>
      ) : (
        <></>
      )}
    </>
  );
};

export default Orneklem;
