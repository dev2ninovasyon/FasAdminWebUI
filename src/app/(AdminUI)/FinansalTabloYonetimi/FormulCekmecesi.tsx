"use client";

import type { KeyboardEvent, ReactNode } from "react";
import { Box, Drawer, IconButton, Stack, Typography } from "@mui/material";
import { IconX } from "@tabler/icons-react";
import { EXCEL } from "./excelStili";

type Props = {
  acik: boolean;
  genislik: number;
  baslik: ReactNode;
  altBaslik?: ReactNode;
  eylem?: ReactNode;
  onKapat: () => void;
  onKeyDown?: (olay: KeyboardEvent) => void;
  children: ReactNode;
};

// Gizli otomatik boyut alanları ve Select'in yerel input'u atlanır.
const ILK_ALAN = "textarea:not([aria-hidden='true']), input:not([type='hidden']):not([aria-hidden='true'])";

/**
 * Formül düzenleme paneli: MUI geçici (temporary) Drawer olarak sağdan sayfanın üstüne açılır,
 * sayfa düzenini değiştirmez. Arka plana tıklama ve Esc `onKapat` çağırır. Modal odak tuzağı
 * autoFocus'u geçersiz kıldığı için ilk alan, giriş geçişi bitince odaklanır.
 */
export default function FormulCekmecesi({ acik, genislik, baslik, altBaslik, eylem, onKapat, onKeyDown, children }: Props) {
  return <Drawer anchor="right" open={acik} onClose={onKapat}
    slotProps={{
      paper: { sx: { width: { xs: "100%", sm: genislik }, borderTop: `3px solid ${EXCEL.yesil}` } },
      transition: { onEntered: (dugum: HTMLElement) => dugum.querySelector<HTMLElement>(ILK_ALAN)?.focus() },
    }}>
    <Stack sx={{ height: "100%" }} onKeyDown={onKeyDown}>
      <Stack direction="row" spacing={1} alignItems="flex-start"
        sx={{ px: 2, py: 1.5, borderBottom: "1px solid", borderBottomColor: EXCEL.kenar, bgcolor: EXCEL.baslik }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="subtitle1" fontWeight={600} sx={{ overflowWrap: "anywhere" }}>{baslik}</Typography>
          {altBaslik && <Typography variant="caption" color="text.secondary">{altBaslik}</Typography>}
        </Box>
        {eylem}
        <IconButton size="small" aria-label="Paneli kapat" onClick={onKapat}><IconX size={18} /></IconButton>
      </Stack>
      <Box sx={{ p: 2, overflowY: "auto", flex: 1 }}>{children}</Box>
    </Stack>
  </Drawer>;
}
