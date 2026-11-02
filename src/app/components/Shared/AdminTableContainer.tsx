"use client";

import TableContainer, { type TableContainerProps } from "@mui/material/TableContainer";
import { styled } from "@mui/material/styles";
import { getAdminTableStyles, type AdminTableDensity } from "@/utils/theme/adminTable";

const AdminTableContainer = styled(TableContainer, {
  shouldForwardProp: (prop) => prop !== "density",
})<TableContainerProps & { density?: AdminTableDensity }>(({ theme, density = "normal" }) =>
  getAdminTableStyles(theme, density),
);

export default AdminTableContainer;
