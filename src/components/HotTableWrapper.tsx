"use client";

import React from "react";
import { HotTable } from "@handsontable/react";
import type { HotTableProps } from "@handsontable/react";
import { styled } from "@mui/material/styles";
import { adminTableMetrics, getAdminHotTableStyles, type AdminTableDensity } from "@/utils/theme/adminTable";
import "@/lib/handsontableSetup";

/**
 * Handsontable Wrapper Component for FasAdminWebUI
 * 
 * Bu component, Handsontable kullanımını merkezi bir yerden yönetir.
 * Tüm gerekli stiller ve dil ayarları otomatik olarak yüklenir.
 */
interface CustomHotTableProps extends HotTableProps {
  adminDesign?: boolean;
  density?: AdminTableDensity;
}

const AdminHotTable = styled("div")(({ theme }) => ({
  minWidth: 0,
  maxWidth: "100%",
  "& > .fas-admin-table, & .fas-admin-table [class*='ht-theme-horizon']": getAdminHotTableStyles(theme),
}));

const CustomHotTable = React.forwardRef<any, CustomHotTableProps>(
  (props, ref) => {
    const { className, themeName, adminDesign = false, density = "normal", ...restProps } = props;
    const mergedClassName = ["fas-hot-table", adminDesign && "fas-admin-table", className].filter(Boolean).join(" ");

    const table = (
      <HotTable
        ref={ref}
        className={mergedClassName}
        themeName={themeName ?? "ht-theme-horizon"}
        {...(adminDesign ? {
          rowHeights: adminTableMetrics.rowHeight[density],
          columnHeaderHeight: adminTableMetrics.headerHeight,
        } : {})}
        {...restProps}
      />
    );
    return adminDesign ? <AdminHotTable>{table}</AdminHotTable> : table;
  }
);

CustomHotTable.displayName = "CustomHotTable";

export default CustomHotTable;
