"use client";

import React from "react";
import { HotTable } from "@handsontable/react";
import type { HotTableProps } from "@handsontable/react";
import "@/lib/handsontableSetup";

/**
 * Handsontable Wrapper Component for FasAdminWebUI
 * 
 * Bu component, Handsontable kullanımını merkezi bir yerden yönetir.
 * Tüm gerekli stiller ve dil ayarları otomatik olarak yüklenir.
 */
interface CustomHotTableProps extends HotTableProps {
  // Gerekirse buraya özel props'lar eklenebilir
}

const CustomHotTable = React.forwardRef<any, CustomHotTableProps>(
  (props, ref) => {
    const { className, themeName, ...restProps } = props;
    const mergedClassName = ["fas-hot-table", className].filter(Boolean).join(" ");

    return (
      <HotTable
        ref={ref}
        className={mergedClassName}
        themeName={themeName ?? "ht-theme-horizon"}
        {...restProps}
      />
    );
  }
);

CustomHotTable.displayName = "CustomHotTable";

export default CustomHotTable;
