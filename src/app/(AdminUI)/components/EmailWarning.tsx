"use client";

import React from "react";
import { Alert, useTheme } from "@mui/material";
import { IconAlertCircle } from "@tabler/icons-react";

const EmailWarning = ({ showEmail = true }: { showEmail?: boolean }) => {
  const theme = useTheme();

  if (!showEmail) {
    return (
      <Alert
        severity="info"
        variant="outlined"
        icon={<IconAlertCircle size={18} />}
        sx={{
          mt: 1,
          backgroundColor: theme.palette.mode === "dark" ? "rgba(33, 150, 243, 0.08)" : "rgba(33, 150, 243, 0.05)",
          borderColor: theme.palette.info.main,
          color: theme.palette.info.main,
          "& .MuiAlert-icon": {
            color: theme.palette.info.main,
          },
        }}
      >
        <strong>Önemli:</strong> E-posta adresi kullanıcı hesabı oluşturulduktan sonra değiştirilemez. Lütfen doğru bir e-posta adresi girin.
      </Alert>
    );
  }

  return (
    <Alert
      severity="warning"
      variant="outlined"
      icon={<IconAlertCircle size={18} />}
      sx={{
        mt: 1,
        backgroundColor: theme.palette.mode === "dark" ? "rgba(251, 188, 4, 0.08)" : "rgba(251, 188, 4, 0.05)",
        borderColor: theme.palette.warning.main,
        color: theme.palette.warning.main,
        "& .MuiAlert-icon": {
          color: theme.palette.warning.main,
        },
      }}
    >
      <strong>Dikkat:</strong> E-posta adresi program ile ilgili bildirim ve şifre sıfırlama için kullanılacak. Lütfen geçerli ve erişilebilir bir e-posta adresi girin.
    </Alert>
  );
};

export default EmailWarning;
