"use client";

import { useLayoutEffect, useRef, useState } from "react";
import type { KeyboardEvent, ReactNode } from "react";
import { Box, Drawer, IconButton, Stack, Typography } from "@mui/material";
import { IconX } from "@tabler/icons-react";
import { EXCEL } from "./excelStili";

/**
 * Drawer açıkken tablonun sağdan ne kadar daralacağını hesaplar; böylece Drawer tablo sütunlarını örtmez.
 * Ölçüm, tablonun kendi kenar boşluğundan etkilenmeyen sarmalayıcıya (`ref`) göre yapılır.
 */
export const useCekmeceBoslugu = (acik: boolean, genislik: number) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [bosluk, setBosluk] = useState(0);
  useLayoutEffect(() => {
    const hesapla = () => {
      const kutu = ref.current?.getBoundingClientRect();
      setBosluk(acik && kutu && window.innerWidth >= 900
        ? Math.max(0, Math.round(genislik + 12 - (window.innerWidth - kutu.right))) : 0);
    };
    hesapla();
    window.addEventListener("resize", hesapla);
    return () => window.removeEventListener("resize", hesapla);
  }, [acik, genislik]);
  return { ref, bosluk };
};

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

/**
 * Formül düzenleme çekmecesi. Kalıcı (persistent) açılır: arka plan kilitlenmez, kullanıcı tablodan
 * başka hücre seçebilir veya formüle satır referansı ekleyebilir.
 */
export default function FormulCekmecesi({ acik, genislik, baslik, altBaslik, eylem, onKapat, onKeyDown, children }: Props) {
  return <Drawer anchor="right" variant="persistent" open={acik}
    slotProps={{ paper: { sx: {
      width: { xs: "100%", sm: genislik }, borderLeft: "1px solid", borderLeftColor: EXCEL.kenar,
      borderTop: `3px solid ${EXCEL.yesil}`, boxShadow: 8, zIndex: (t) => t.zIndex.drawer + 2,
    } } }}>
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
