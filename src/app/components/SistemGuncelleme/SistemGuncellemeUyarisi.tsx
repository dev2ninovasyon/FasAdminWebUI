"use client";

import React, { useEffect, useRef, useState } from "react";
import { Alert, Button } from "@mui/material";

/**
 * Sunucudaki dağıtım betiğinin (C:\deploy\guncelle.ps1) yazdığı durum dosyası. IIS her sitede bunu
 * /sistem-durumu/ altında statik olarak yayınlar; uygulama güncellenirken de erişilebilir kalır.
 */
type SistemDurumu = {
  guncelleniyor: boolean;
  surum?: string;
  mesaj?: string;
};

const DURUM_ADRESI = "/sistem-durumu/durum.json";
const YOKLAMA_MS = 60_000;
const GUNCELLEME_SIRASINDA_YOKLAMA_MS = 15_000;

/**
 * Sunucu güncellenirken üstte uyarı şeridi gösterir; güncelleme bitip sürüm değiştiğinde sayfanın
 * yenilenmesini önerir. Durum dosyası yoksa (örn. yerel geliştirme) hiçbir şey göstermez.
 */
export default function SistemGuncellemeUyarisi() {
  const [guncelleniyor, setGuncelleniyor] = useState(false);
  const [mesaj, setMesaj] = useState<string | undefined>();
  const [yeniSurum, setYeniSurum] = useState(false);
  const [yeniSurumKapatildi, setYeniSurumKapatildi] = useState(false);
  const acilistakiSurum = useRef<string | undefined>(undefined);

  useEffect(() => {
    let iptal = false;
    let zamanlayici: ReturnType<typeof setTimeout> | undefined;

    const yokla = async () => {
      let sonraki = YOKLAMA_MS;
      try {
        const yanit = await fetch(`${DURUM_ADRESI}?t=${Date.now()}`, { cache: "no-store" });
        if (yanit.ok) {
          const durum = (await yanit.json()) as SistemDurumu;
          if (iptal) return;
          setGuncelleniyor(Boolean(durum.guncelleniyor));
          setMesaj(durum.mesaj);
          if (acilistakiSurum.current === undefined) {
            acilistakiSurum.current = durum.surum ?? "";
          } else if (!durum.guncelleniyor && durum.surum && durum.surum !== acilistakiSurum.current) {
            setYeniSurum(true);
          }
          if (durum.guncelleniyor) sonraki = GUNCELLEME_SIRASINDA_YOKLAMA_MS;
        }
      } catch {
        // Durum dosyasına ulaşılamazsa bir sonraki yoklamayı bekle.
      }
      if (!iptal) zamanlayici = setTimeout(yokla, sonraki);
    };

    void yokla();
    return () => {
      iptal = true;
      if (zamanlayici) clearTimeout(zamanlayici);
    };
  }, []);

  const seritSx = { position: "fixed", top: 0, left: 0, right: 0, zIndex: 2000, borderRadius: 0, py: 0.25 } as const;

  if (guncelleniyor) {
    return (
      <Alert severity="warning" variant="filled" sx={seritSx}>
        {mesaj ||
          "Sistem güncelleniyor. Birkaç dakika içinde kısa süreli kesinti olabilir; lütfen kaydedilmemiş işlerinizi kaydedin."}
      </Alert>
    );
  }

  if (yeniSurum && !yeniSurumKapatildi) {
    return (
      <Alert
        severity="info"
        variant="filled"
        sx={seritSx}
        onClose={() => setYeniSurumKapatildi(true)}
        action={
          <Button color="inherit" size="small" onClick={() => window.location.reload()}>
            Yenile
          </Button>
        }
      >
        Sistem güncellendi. Yeni sürümü kullanmak için sayfayı yenileyin.
      </Alert>
    );
  }

  return null;
}
