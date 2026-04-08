import { dictionary } from "@/utils/languages/handsontable.tr-TR";
import "@/lib/handsontableSetup";

import CustomHotTable from "@/components/HotTableWrapper";
import { registerAllModules } from "handsontable/registry";

import { plus } from "@/utils/theme/Typography";
import { useDispatch, useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import { useTheme } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { setCollapse } from "@/store/customizer/CustomizerSlice";
import numbro from "numbro";
import trTR from "numbro/languages/tr-TR";

// register Handsontable's modules
registerAllModules();

numbro.registerLanguage(trTR);
numbro.setLanguage("tr-TR");

const BulguRiskiBelirlemeBelge = () => {
  const hotTableComponent = useRef<any>(null);

  const user = useSelector((state: AppState) => state.userReducer);
  const customizer = useSelector((state: AppState) => state.customizer);
  const dispatch = useDispatch();
  const theme = useTheme();

  const rowCount = 6;

  const fetchedData: any[] = [
    [
      "DetaylÃƒÂ¯Ã‚Â¿Ã‚Â½ denetim prosedÃƒÂ¯Ã‚Â¿Ã‚Â½rÃƒÂ¯Ã‚Â¿Ã‚Â½",
      "%0-%15",
      "Tutar olarak ana kÃƒÂ¯Ã‚Â¿Ã‚Â½tlenin %31 ve daha fazlasÃƒÂ¯Ã‚Â¿Ã‚Â½",
      "31-50",
    ],
    [
      "DetaylÃƒÂ¯Ã‚Â¿Ã‚Â½ denetim prosedÃƒÂ¯Ã‚Â¿Ã‚Â½rÃƒÂ¯Ã‚Â¿Ã‚Â½",
      "%16-%25",
      "Tutar olarak ana kÃƒÂ¯Ã‚Â¿Ã‚Â½tlenin %26-%30 arasÃƒÂ¯Ã‚Â¿Ã‚Â½",
      "26-30",
    ],
    [
      "KÃƒÂ¯Ã‚Â¿Ã‚Â½smen detaylÃƒÂ¯Ã‚Â¿Ã‚Â½, kÃƒÂ¯Ã‚Â¿Ã‚Â½smen analitik denetim prosedÃƒÂ¯Ã‚Â¿Ã‚Â½rÃƒÂ¯Ã‚Â¿Ã‚Â½",
      "%26-%40",
      "Tutar olarak ana kÃƒÂ¯Ã‚Â¿Ã‚Â½tlenin %21-%25 arasÃƒÂ¯Ã‚Â¿Ã‚Â½",
      "21-25",
    ],
    [
      "KÃƒÂ¯Ã‚Â¿Ã‚Â½smen detaylÃƒÂ¯Ã‚Â¿Ã‚Â½, kÃƒÂ¯Ã‚Â¿Ã‚Â½smen analitik denetim prosedÃƒÂ¯Ã‚Â¿Ã‚Â½rÃƒÂ¯Ã‚Â¿Ã‚Â½",
      "%41-%60",
      "Tutar olarak ana kÃƒÂ¯Ã‚Â¿Ã‚Â½tlenin %16-%20 arasÃƒÂ¯Ã‚Â¿Ã‚Â½",
      "16-20",
    ],
    [
      "Analitik incelemeye dayalÃƒÂ¯Ã‚Â¿Ã‚Â½ denetim prosedÃƒÂ¯Ã‚Â¿Ã‚Â½rÃƒÂ¯Ã‚Â¿Ã‚Â½",
      "%61-%80",
      "Tutar olarak ana kÃƒÂ¯Ã‚Â¿Ã‚Â½tlenin %11-%15 arasÃƒÂ¯Ã‚Â¿Ã‚Â½	",
      "11-15",
    ],
    [
      "Analitik incelemeye dayalÃƒÂ¯Ã‚Â¿Ã‚Â½ denetim prosedÃƒÂ¯Ã‚Â¿Ã‚Â½rÃƒÂ¯Ã‚Â¿Ã‚Â½",
      "%81-%100",
      "Tutar olarak ana kÃƒÂ¯Ã‚Â¿Ã‚Â½tlenin %0-%10 arasÃƒÂ¯Ã‚Â¿Ã‚Â½",
      "0-10",
    ],
  ];

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
    "Denetim ProsedÃƒÂ¯Ã‚Â¿Ã‚Â½rleri",
    "Bulgu Riski",
    "Toplanacak Denetim KanÃƒÂ¯Ã‚Â¿Ã‚Â½tÃƒÂ¯Ã‚Â¿Ã‚Â½",
    "Risk",
  ];

  const columns = [
    {
      type: "text",
      columnSorting: true,
      className: "htLeft",
      allowInvalid: false,
      readOnly: true,
      editor: false,
    }, // Denetim ProsedÃƒÂ¯Ã‚Â¿Ã‚Â½rleri
    {
      type: "text",
      columnSorting: true,
      className: "htLeft",
      allowInvalid: false,
      readOnly: true,
      editor: false,
    }, // Bulgu Riski
    {
      type: "text",
      columnSorting: true,
      className: "htLeft",
      allowInvalid: false,
      readOnly: true,
      editor: false,
    }, // Toplanacak Denetim KanÃƒÂ¯Ã‚Â¿Ã‚Â½tÃƒÂ¯Ã‚Â¿Ã‚Â½
    {
      type: "text",
      columnSorting: true,
      className: "htLeft",
      allowInvalid: false,
      readOnly: true,
      editor: false,
    }, // Risk
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
          maxHeight: 296,
          maxWidth: "100%",
        }}
        language={dictionary.languageCode}
        ref={hotTableComponent}
        data={fetchedData}
        height={296}
        colHeaders={colHeaders}
        columns={columns}
        colWidths={[45, 45, 45, 45]}
        stretchH="all"
        manualColumnResize={true}
        rowHeaders={true}
        rowHeights={35}
        autoWrapRow={true}
        minRows={rowCount}
        minCols={4}
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
    </>
  );
};

export default BulguRiskiBelirlemeBelge;

