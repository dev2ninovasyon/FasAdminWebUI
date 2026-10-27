"use client";

import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import PageContainer from "@/app/components/Container/PageContainer";
import Breadcrumb from "@/app/components/Layout/Shared/Breadcrumb/Breadcrumb";
import ParentCard from "@/app/components/Shared/ParentCard";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import {
  applyLegacyPaket,
  LegacyImportPackage,
  LegacyImportOutputManifest,
  LegacyPaketSonucu,
  previewLegacyPaket,
} from "@/api/FinansalTabloYonetimi/LegacyPaket";
import {
  FinansalSurumDetay,
  FinansalSurumDogrulamaSonucu,
  FinansalTanimSeti,
  getFinansalSurumDetay,
  getFinansalTanimSetleri,
  createFinansalKural,
  cloneFinansalSurum,
  compareFinansalSurumler,
  FinansalSurumKarsilastirma,
  publishFinansalSurum,
  updateFinansalKalem,
  updateFinansalKural,
  validateFinansalSurum,
  updateFinansalSurumMeta,
  KgkFormatKontrolSonucu,
  kontrolEtKgkFormatlari,
  downloadKgkFormat,
  archiveKgkFormat,
  scanAndArchiveKgkFormats,
  getKgkScanHistory,
  KgkTaramaGecmisi,
  KgkWorkbookFarkSonucu,
  compareKgkWorkbooks,
  compareArchivedKgkWorkbooks,
  applyKgkKalemFarklari,
  applyKgkFormulFarklari,
  createFinansalTabloUretimi,
  getFinansalTabloUretimGecmisi,
  getFinansalTabloPilotDurumu,
  getFinansalTabloKaliciArsivDurumu,
  getFinansalTabloArsivDogrulamasi,
  getFinansalTabloKaliciArsivHazirligi,
  getFinansalTabloArsivKarsilastirmasi,
  compareFinansalTabloGolge,
  getFinansalTabloKgkCiktilari,
  downloadFinansalTabloKgkCiktisi,
  replayFinansalTabloUretimi,
  renderFinansalTabloKgk,
  FinansalTabloKgkUretimArsivKaydi,
  FinansalTabloUretimArsivSonucu,
  FinansalTabloUretimSonucu,
  FinansalTabloPilotDurumApiSonucu,
  FinansalTabloKaliciArsivDurumApiSonucu,
  FinansalTabloArsivDogrulamaApiSonucu,
  FinansalTabloKaliciArsivHazirlikApiSonucu,
  FinansalTabloArsivKarsilastirmaApiSonucu,
  FinansalTabloGolgeKarsilastirmaSonucu,
} from "@/api/FinansalTabloYonetimi/Tanimlar";

const breadcrumbItems = [
  { to: "/Anasayfa", title: "Admin Menüsü" },
  { to: "/FinansalTabloYonetimi", title: "Finansal Tablo Yönetimi" },
];

const sayi = (value?: number) =>
  new Intl.NumberFormat("tr-TR").format(value ?? 0);

const Page = () => {
  const user = useSelector((state: AppState) => state.userReducer);
  const [surumId, setSurumId] = useState("");
  const [eszamanlilikSurumu, setEszamanlilikSurumu] = useState("");
  const [kaynakSha256, setKaynakSha256] = useState("");
  const [paket, setPaket] = useState<LegacyImportPackage | null>(null);
  const [manifest, setManifest] = useState<LegacyImportOutputManifest | null>(null);
  const [paketDosyaAdi, setPaketDosyaAdi] = useState("");
  const [manifestDosyaAdi, setManifestDosyaAdi] = useState("");
  const [sonuc, setSonuc] = useState<LegacyPaketSonucu | null>(null);
  const [hata, setHata] = useState("");
  const [yukleniyor, setYukleniyor] = useState(false);
  const [onayAciklamasi, setOnayAciklamasi] = useState("");
  const [farkKodlari, setFarkKodlari] = useState("");
  const [tanimSetleri, setTanimSetleri] = useState<FinansalTanimSeti[]>([]);
  const [tanimFiltresi, setTanimFiltresi] = useState({
    raporlamaStandardi: 0,
    kapsam: 0,
    donusumTipi: 0,
    aktifMi: true,
  });
  const [secilenSetId, setSecilenSetId] = useState(0);
  const [secilenSurumId, setSecilenSurumId] = useState(0);
  const [surumDetayi, setSurumDetayi] = useState<FinansalSurumDetay | null>(null);
  const [tanimYukleniyor, setTanimYukleniyor] = useState(false);
  const [tanimHatasi, setTanimHatasi] = useState("");
  const [metaDuzenleme, setMetaDuzenleme] = useState(false);
  const [metaKaydediliyor, setMetaKaydediliyor] = useState(false);
  const [metaEtiket, setMetaEtiket] = useState("");
  const [metaBaslangic, setMetaBaslangic] = useState("");
  const [metaBitis, setMetaBitis] = useState("");
  const [metaAciklama, setMetaAciklama] = useState("");
  const [surumIslemiYukleniyor, setSurumIslemiYukleniyor] = useState(false);
  const [dogrulamaSonucu, setDogrulamaSonucu] = useState<FinansalSurumDogrulamaSonucu | null>(null);
  const [dogrulamaYukleniyor, setDogrulamaYukleniyor] = useState(false);
  const [karsilastirmaSurumId, setKarsilastirmaSurumId] = useState(0);
  const [karsilastirmaSonucu, setKarsilastirmaSonucu] = useState<FinansalSurumKarsilastirma | null>(null);
  const [karsilastirmaYukleniyor, setKarsilastirmaYukleniyor] = useState(false);
  const [kgkKontrolSonucu, setKgkKontrolSonucu] = useState<KgkFormatKontrolSonucu | null>(null);
  const [kgkKontrolYukleniyor, setKgkKontrolYukleniyor] = useState(false);
  const [kgkHashleriIste, setKgkHashleriIste] = useState(false);
  const [kgkIndirilenUrl, setKgkIndirilenUrl] = useState("");
  const [kgkArsivlenenUrl, setKgkArsivlenenUrl] = useState("");
  const [kgkTaramaYukleniyor, setKgkTaramaYukleniyor] = useState(false);
  const [kgkTaramaDenemesi, setKgkTaramaDenemesi] = useState(3);
  const [kgkTaramaGecmisi, setKgkTaramaGecmisi] = useState<KgkTaramaGecmisi[]>([]);
  const [kgkGecmisYukleniyor, setKgkGecmisYukleniyor] = useState(false);
  const [kgkOncekiWorkbook, setKgkOncekiWorkbook] = useState<File | null>(null);
  const [kgkYeniWorkbook, setKgkYeniWorkbook] = useState<File | null>(null);
  const [kgkWorkbookSonucu, setKgkWorkbookSonucu] = useState<KgkWorkbookFarkSonucu | null>(null);
  const [kgkWorkbookYukleniyor, setKgkWorkbookYukleniyor] = useState(false);
  const [kgkArsivWorkbookYukleniyor, setKgkArsivWorkbookYukleniyor] = useState("");
  const [kgkSayfaTabloEslestirmeleriJson, setKgkSayfaTabloEslestirmeleriJson] = useState("{}");
  const [uretimGirdiSha256, setUretimGirdiSha256] = useState("");
  const [uretimSnapshotSha256, setUretimSnapshotSha256] = useState("");
  const [uretimGirdiAnahtari, setUretimGirdiAnahtari] = useState("MIZAN");
  const [uretimDenetlenenId, setUretimDenetlenenId] = useState("");
  const [uretimYil, setUretimYil] = useState(String(new Date().getFullYear()));
  const [uretimDenetciId, setUretimDenetciId] = useState("");
  const [uretimKonsolide, setUretimKonsolide] = useState(false);
  const [uretimDonemAnahtari, setUretimDonemAnahtari] = useState("");
  const [uretimBaslangic, setUretimBaslangic] = useState("");
  const [uretimBitis, setUretimBitis] = useState("");
  const [uretimYukleniyor, setUretimYukleniyor] = useState(false);
  const [uretimTekrarYukleniyor, setUretimTekrarYukleniyor] = useState(false);
  const [uretimSonucu, setUretimSonucu] = useState<FinansalTabloUretimSonucu | null>(null);
  const [uretimGecmisi, setUretimGecmisi] = useState<FinansalTabloUretimArsivSonucu[]>([]);
  const [uretimGecmisiYukleniyor, setUretimGecmisiYukleniyor] = useState(false);
  const [pilotDurumu, setPilotDurumu] = useState<FinansalTabloPilotDurumApiSonucu | null>(null);
  const [pilotDurumuYukleniyor, setPilotDurumuYukleniyor] = useState(false);
  const [kaliciArsivDurumu, setKaliciArsivDurumu] = useState<FinansalTabloKaliciArsivDurumApiSonucu | null>(null);
  const [kaliciArsivDurumuYukleniyor, setKaliciArsivDurumuYukleniyor] = useState(false);
  const [arsivDogrulama, setArsivDogrulama] = useState<FinansalTabloArsivDogrulamaApiSonucu | null>(null);
  const [arsivDogrulamaYukleniyor, setArsivDogrulamaYukleniyor] = useState(false);
  const [kaliciArsivHazirligi, setKaliciArsivHazirligi] = useState<FinansalTabloKaliciArsivHazirlikApiSonucu | null>(null);
  const [kaliciArsivHazirligiYukleniyor, setKaliciArsivHazirligiYukleniyor] = useState(false);
  const [arsivKarsilastirma, setArsivKarsilastirma] = useState<FinansalTabloArsivKarsilastirmaApiSonucu | null>(null);
  const [arsivKarsilastirmaYukleniyor, setArsivKarsilastirmaYukleniyor] = useState(false);
  const [golgeKarsilastirmaJson, setGolgeKarsilastirmaJson] = useState(`{
  "kaynakPaketAnahtari": "legacy-v1",
  "kaynakPaketSha256": "",
  "legacyMotorSurumu": "legacy-v1",
  "yeniMotorSurumu": "finansal-tablo-motor-v1",
  "yeniTanimSetiSabitAnahtari": "",
  "yeniTanimSurumu": "",
  "girdiSabitAnahtari": "MIZAN",
  "girdiSha256": "",
  "calistirmaBaglami": {
    "donemEslesmeleri": [],
    "yuvarlamaBasamagi": 2,
    "yuvarlamaModu": 1,
    "degerKaynagiBaglami": null
  },
  "politikaKodu": "mutlak-tolerans",
  "mutlakTolerans": 0.01,
  "yeniTabloSabitAnahtari": "",
  "yeniDonemSabitAnahtari": "",
  "yeniRaporlamaStandardi": null,
  "yeniKapsam": null,
  "yeniDonusumTipi": null,
  "yeniTabloTuru": null,
  "yeniNakitAkisYontemi": null,
  "yeniGecerlilikTarihi": null,
  "yeniTanimSnapshotSha256": ""
}`);
  const [golgeKarsilastirmaSonucu, setGolgeKarsilastirmaSonucu] = useState<FinansalTabloGolgeKarsilastirmaSonucu | null>(null);
  const [golgeKarsilastirmaYukleniyor, setGolgeKarsilastirmaYukleniyor] = useState(false);
  const [kgkRenderSablon, setKgkRenderSablon] = useState<File | null>(null);
  const [kgkRenderEslesmeler, setKgkRenderEslesmeler] = useState('[{"hedefTuru":1,"hedefSabitAnahtari":"VARLIKLAR","sayfaAdi":"Finansal Durum","hucreAdresi":"B2"}]');
  const [kgkRenderYukleniyor, setKgkRenderYukleniyor] = useState(false);
  const [kgkRenderSonucu, setKgkRenderSonucu] = useState<{ dosyaAdi: string; sha256: string | null } | null>(null);
  const [kgkArsivCiktilari, setKgkArsivCiktilari] = useState<FinansalTabloKgkUretimArsivKaydi[]>([]);
  const [kgkArsivCiktilariYukleniyor, setKgkArsivCiktilariYukleniyor] = useState(false);
  const [kgkArsivIndirilenSha, setKgkArsivIndirilenSha] = useState("");
  const [kalemTabloId, setKalemTabloId] = useState(0);
  const [duzenlenenKalemId, setDuzenlenenKalemId] = useState(0);
  const [kalemKaydediliyor, setKalemKaydediliyor] = useState(false);
  const [kalemForm, setKalemForm] = useState({ ad: "", kod: "", sira: 0, kalemTuru: 2, eksen: 1, varsayilanGorunurMu: true, ustKalemId: 0 });
  const [duzenlenenKuralId, setDuzenlenenKuralId] = useState(0);
  const [kuralKaydediliyor, setKuralKaydediliyor] = useState(false);
  const [yeniKuralAcik, setYeniKuralAcik] = useState(false);
  const [yeniKuralKalemId, setYeniKuralKalemId] = useState(0);
  const [kuralForm, setKuralForm] = useState({ hesaplamaTuru: 1, isaretPolitikasi: 1, bosDegerPolitikasi: 1, sabitDeger: "", aciklama: "", hamFormul: "", kgkExcelHedefi: "", aktifMi: true, terimler: [] as Array<{ id: number; sira: number; hamTerim: string; kaynakTuru: number; kaynakAnahtari: string; operator: number; degerAlani: number; donemDavranisi: number; donemOfseti: number; katsayi: number; isaretPolitikasi: number; zorunluMu: boolean }> });

  useEffect(() => {
    if (!user.token) return;
    let etkin = true;
    setTanimYukleniyor(true);
    setTanimHatasi("");
    getFinansalTanimSetleri(user.token, {
      raporlamaStandardi: tanimFiltresi.raporlamaStandardi || undefined,
      kapsam: tanimFiltresi.kapsam || undefined,
      donusumTipi: tanimFiltresi.donusumTipi || undefined,
      aktifMi: tanimFiltresi.aktifMi,
    })
      .then((data) => {
        if (!etkin) return;
        setTanimSetleri(data);
        const ilkSet = data.find((set) => set.id === secilenSetId) || data[0];
        setSecilenSetId(ilkSet?.id || 0);
        const ilkSurum = ilkSet?.surumler?.[0];
        setSecilenSurumId(ilkSurum?.id || 0);
        setSurumId(ilkSurum ? String(ilkSurum.id) : "");
        setEszamanlilikSurumu(ilkSurum ? String(ilkSurum.eszamanlilikSurumu) : "");
      })
      .catch((error) => {
        if (etkin) setTanimHatasi(error instanceof Error ? error.message : "Tanım setleri okunamadı.");
      })
      .finally(() => {
        if (etkin) setTanimYukleniyor(false);
      });
    return () => {
      etkin = false;
    };
  }, [user.token, tanimFiltresi]);

  useEffect(() => {
    if (!user.token || !secilenSurumId) {
      setSurumDetayi(null);
      return;
    }
    let etkin = true;
    setTanimYukleniyor(true);
    getFinansalSurumDetay(user.token, secilenSurumId)
      .then((data) => etkin && setSurumDetayi(data))
      .catch((error) => etkin && setTanimHatasi(error instanceof Error ? error.message : "Sürüm tanımı okunamadı."))
      .finally(() => etkin && setTanimYukleniyor(false));
    return () => {
      etkin = false;
    };
  }, [user.token, secilenSurumId]);

  const secilenSet = tanimSetleri.find((set) => set.id === secilenSetId);
  const secilenSurum = secilenSet?.surumler.find((surum) => surum.id === secilenSurumId);
  const secilenKalemTablosu = surumDetayi?.tablolar.find((tablo) => tablo.id === kalemTabloId) || surumDetayi?.tablolar[0];

  useEffect(() => {
    if (!secilenSurum) {
      setMetaDuzenleme(false);
      return;
    }
    setMetaEtiket(secilenSurum.etiket);
    setMetaBaslangic(secilenSurum.gecerlilikBaslangici?.slice(0, 10) || "");
    setMetaBitis(secilenSurum.gecerlilikBitisi?.slice(0, 10) || "");
    setMetaAciklama(secilenSurum.aciklama || "");
    setMetaDuzenleme(false);
    setDogrulamaSonucu(null);
    setKarsilastirmaSonucu(null);
    setKarsilastirmaSurumId(0);
    setKalemTabloId(0);
    setDuzenlenenKalemId(0);
  }, [secilenSurum]);

  useEffect(() => {
    const donem = secilenKalemTablosu?.donemKolonlari?.[0];
    if (!donem) return;
    setUretimDonemAnahtari(donem.sabitAnahtar);
    if (secilenSurum) {
      setUretimBaslangic(secilenSurum.gecerlilikBaslangici?.slice(0, 10) || "");
      setUretimBitis(secilenSurum.gecerlilikBitisi?.slice(0, 10) || "");
    }
  }, [secilenKalemTablosu, secilenSurum]);

  const metaKaydet = async () => {
    if (!user.token || !secilenSurum || secilenSurum.durum !== 1) return;
    setMetaKaydediliyor(true);
    setTanimHatasi("");
    try {
      const sonuc = await updateFinansalSurumMeta(user.token, secilenSurum.id, {
        etiket: metaEtiket.trim(),
        gecerlilikBaslangici: metaBaslangic,
        gecerlilikBitisi: metaBitis || null,
        aciklama: metaAciklama.trim() || null,
        beklenenEszamanlilikSurumu: secilenSurum.eszamanlilikSurumu,
      });
      setTanimSetleri((onceki) => onceki.map((set) => ({
        ...set,
        surumler: set.surumler.map((surum) => surum.id === secilenSurum.id
          ? { ...surum, etiket: metaEtiket.trim(), gecerlilikBaslangici: metaBaslangic, gecerlilikBitisi: metaBitis || null, aciklama: metaAciklama.trim() || null, eszamanlilikSurumu: sonuc.eszamanlilikSurumu, guncellemeTarihi: sonuc.guncellemeTarihi }
          : surum),
      })));
      setSurumDetayi((onceki) => onceki ? { ...onceki, surum: { ...onceki.surum, etiket: metaEtiket.trim(), gecerlilikBaslangici: metaBaslangic, gecerlilikBitisi: metaBitis || null, aciklama: metaAciklama.trim() || null, eszamanlilikSurumu: sonuc.eszamanlilikSurumu, guncellemeTarihi: sonuc.guncellemeTarihi } } : onceki);
      setMetaDuzenleme(false);
    } catch (error) {
      setTanimHatasi(error instanceof Error ? error.message : "Sürüm metadata güncellenemedi.");
    } finally {
      setMetaKaydediliyor(false);
    }
  };

  const teknikDogrula = async () => {
    if (!user.token || !secilenSurum || secilenSurum.durum !== 1) return;
    setDogrulamaYukleniyor(true);
    setTanimHatasi("");
    try {
      const data = await validateFinansalSurum(
        user.token,
        secilenSurum.id,
        secilenSurum.eszamanlilikSurumu
      );
      setDogrulamaSonucu(data);
    } catch (error) {
      setTanimHatasi(error instanceof Error ? error.message : "Taslak sürüm teknik olarak doğrulanamadı.");
    } finally {
      setDogrulamaYukleniyor(false);
    }
  };

  const kalemDuzenle = (kalem: NonNullable<FinansalSurumDetay>["tablolar"][number]["kalemler"][number]) => {
    setDuzenlenenKalemId(kalem.id);
    setKalemForm({
      ad: kalem.ad,
      kod: kalem.kod || "",
      sira: kalem.sira,
      kalemTuru: kalem.kalemTuru,
      eksen: kalem.eksen,
      varsayilanGorunurMu: kalem.varsayilanGorunurMu,
      ustKalemId: kalem.ustKalemId || 0,
    });
  };

  const kalemKaydet = async () => {
    const tablo = surumDetayi?.tablolar.find((aday) => aday.id === kalemTabloId);
    if (!user.token || !secilenSurum || secilenSurum.durum !== 1 || !tablo || !duzenlenenKalemId) return;
    setKalemKaydediliyor(true);
    setTanimHatasi("");
    try {
      const sonuc = await updateFinansalKalem(user.token, secilenSurum.id, tablo.id, duzenlenenKalemId, {
        ...kalemForm,
        kod: kalemForm.kod.trim() || null,
        ustKalemId: kalemForm.ustKalemId || null,
        beklenenEszamanlilikSurumu: secilenSurum.eszamanlilikSurumu,
      });
      setSurumDetayi((onceki) => onceki ? {
        ...onceki,
        surum: { ...onceki.surum, eszamanlilikSurumu: sonuc.eszamanlilikSurumu, guncellemeTarihi: sonuc.guncellemeTarihi },
        tablolar: onceki.tablolar.map((aday) => aday.id !== tablo.id ? aday : {
          ...aday,
          kalemler: aday.kalemler.map((kalem) => kalem.id !== duzenlenenKalemId ? kalem : { ...kalem, ...kalemForm, kod: kalemForm.kod.trim() || null, ustKalemId: kalemForm.ustKalemId || null }),
        }),
      } : onceki);
      setTanimSetleri((onceki) => onceki.map((set) => ({
        ...set,
        surumler: set.surumler.map((surum) => surum.id === secilenSurum.id ? { ...surum, eszamanlilikSurumu: sonuc.eszamanlilikSurumu, guncellemeTarihi: sonuc.guncellemeTarihi } : surum),
      })));
      setDuzenlenenKalemId(0);
    } catch (error) {
      setTanimHatasi(error instanceof Error ? error.message : "Finansal tablo kalemi güncellenemedi.");
    } finally {
      setKalemKaydediliyor(false);
    }
  };

  const kuralDuzenle = (kural: NonNullable<FinansalSurumDetay>["tablolar"][number]["kurallar"][number]) => {
    setDuzenlenenKuralId(kural.id);
    setKuralForm({
      hesaplamaTuru: kural.hesaplamaTuru,
      isaretPolitikasi: kural.isaretPolitikasi,
      bosDegerPolitikasi: kural.bosDegerPolitikasi,
      sabitDeger: kural.sabitDeger == null ? "" : String(kural.sabitDeger),
      aciklama: kural.aciklama || "",
      hamFormul: kural.hamFormul || "",
      kgkExcelHedefi: kural.kgkExcelHedefi || "",
      aktifMi: kural.aktifMi,
      terimler: kural.terimler.map((terim) => ({
        id: terim.id,
        sira: terim.sira,
        hamTerim: terim.hamTerim || "",
        kaynakTuru: terim.kaynakTuru,
        kaynakAnahtari: terim.kaynakAnahtari,
        operator: terim.operator,
        degerAlani: terim.degerAlani,
        donemDavranisi: terim.donemDavranisi,
        donemOfseti: terim.donemOfseti,
        katsayi: terim.katsayi,
        isaretPolitikasi: terim.isaretPolitikasi,
        zorunluMu: terim.zorunluMu,
      })),
    });
  };

  const kuralKaydet = async () => {
    const tablo = surumDetayi?.tablolar.find((aday) => aday.id === kalemTabloId);
    if (!user.token || !secilenSurum || secilenSurum.durum !== 1 || !tablo || !duzenlenenKuralId) return;
    setKuralKaydediliyor(true);
    setTanimHatasi("");
    try {
      const sonuc = await updateFinansalKural(user.token, secilenSurum.id, tablo.id, duzenlenenKuralId, {
        hesaplamaTuru: kuralForm.hesaplamaTuru,
        isaretPolitikasi: kuralForm.isaretPolitikasi,
        bosDegerPolitikasi: kuralForm.bosDegerPolitikasi,
        sabitDeger: kuralForm.hesaplamaTuru === 4 && kuralForm.sabitDeger.trim() ? Number(kuralForm.sabitDeger) : null,
        aciklama: kuralForm.aciklama.trim() || null,
        hamFormul: kuralForm.hamFormul.trim() || null,
        kgkExcelHedefi: kuralForm.kgkExcelHedefi.trim() || null,
        aktifMi: kuralForm.aktifMi,
        terimler: kuralForm.terimler,
        beklenenEszamanlilikSurumu: secilenSurum.eszamanlilikSurumu,
      });
      setSurumDetayi((onceki) => onceki ? {
        ...onceki,
        surum: { ...onceki.surum, eszamanlilikSurumu: sonuc.eszamanlilikSurumu, guncellemeTarihi: sonuc.guncellemeTarihi },
        tablolar: onceki.tablolar.map((aday) => aday.id !== tablo.id ? aday : {
          ...aday,
          kurallar: aday.kurallar.map((kural) => kural.id !== duzenlenenKuralId ? kural : {
            ...kural,
            ...kuralForm,
            sabitDeger: kuralForm.hesaplamaTuru === 4 && kuralForm.sabitDeger.trim() ? Number(kuralForm.sabitDeger) : null,
            aciklama: kuralForm.aciklama.trim() || null,
            hamFormul: kuralForm.hamFormul.trim() || null,
            kgkExcelHedefi: kuralForm.kgkExcelHedefi.trim() || null,
          }),
        }),
      } : onceki);
      setTanimSetleri((onceki) => onceki.map((set) => ({
        ...set,
        surumler: set.surumler.map((surum) => surum.id === secilenSurum.id ? { ...surum, eszamanlilikSurumu: sonuc.eszamanlilikSurumu, guncellemeTarihi: sonuc.guncellemeTarihi } : surum),
      })));
      setDuzenlenenKuralId(0);
    } catch (error) {
      setTanimHatasi(error instanceof Error ? error.message : "Hesaplama kuralı güncellenemedi.");
    } finally {
      setKuralKaydediliyor(false);
    }
  };

  const yeniKuralBaslat = () => {
    const tablo = surumDetayi?.tablolar.find((aday) => aday.id === kalemTabloId);
    const hedef = tablo?.kalemler.find((kalem) => !tablo.kurallar.some((kural) => kural.kalemId === kalem.id));
    setDuzenlenenKuralId(0);
    setYeniKuralKalemId(hedef?.id || 0);
    setYeniKuralAcik(true);
    setKuralForm({
      hesaplamaTuru: 1,
      isaretPolitikasi: 1,
      bosDegerPolitikasi: 1,
      sabitDeger: "",
      aciklama: "",
      hamFormul: "",
      kgkExcelHedefi: "",
      aktifMi: true,
      terimler: [{ id: 0, sira: 0, hamTerim: "", kaynakTuru: 1, kaynakAnahtari: "", operator: 1, degerAlani: 1, donemDavranisi: 1, donemOfseti: 0, katsayi: 1, isaretPolitikasi: 1, zorunluMu: true }],
    });
  };

  const kuralOlustur = async () => {
    const tablo = surumDetayi?.tablolar.find((aday) => aday.id === kalemTabloId);
    if (!user.token || !secilenSurum || secilenSurum.durum !== 1 || !tablo || !yeniKuralKalemId) return;
    setKuralKaydediliyor(true);
    setTanimHatasi("");
    try {
      const sonuc = await createFinansalKural(user.token, secilenSurum.id, tablo.id, {
        kalemId: yeniKuralKalemId,
        hesaplamaTuru: kuralForm.hesaplamaTuru,
        isaretPolitikasi: kuralForm.isaretPolitikasi,
        bosDegerPolitikasi: kuralForm.bosDegerPolitikasi,
        sabitDeger: kuralForm.hesaplamaTuru === 4 && kuralForm.sabitDeger.trim() ? Number(kuralForm.sabitDeger) : null,
        aciklama: kuralForm.aciklama.trim() || null,
        hamFormul: kuralForm.hamFormul.trim() || null,
        kgkExcelHedefi: kuralForm.kgkExcelHedefi.trim() || null,
        aktifMi: kuralForm.aktifMi,
        terimler: kuralForm.terimler,
        beklenenEszamanlilikSurumu: secilenSurum.eszamanlilikSurumu,
      });
      const yeniKural = {
        id: sonuc.kuralId,
        kalemId: yeniKuralKalemId,
        hucreId: null,
        hesaplamaTuru: kuralForm.hesaplamaTuru,
        isaretPolitikasi: kuralForm.isaretPolitikasi,
        bosDegerPolitikasi: kuralForm.bosDegerPolitikasi,
        sabitDeger: kuralForm.hesaplamaTuru === 4 && kuralForm.sabitDeger.trim() ? Number(kuralForm.sabitDeger) : null,
        aciklama: kuralForm.aciklama.trim() || null,
        hamFormul: kuralForm.hamFormul.trim() || null,
        kgkExcelHedefi: kuralForm.kgkExcelHedefi.trim() || null,
        aktifMi: kuralForm.aktifMi,
        terimler: kuralForm.terimler,
      };
      setSurumDetayi((onceki) => onceki ? {
        ...onceki,
        surum: { ...onceki.surum, eszamanlilikSurumu: sonuc.eszamanlilikSurumu, guncellemeTarihi: sonuc.guncellemeTarihi },
        tablolar: onceki.tablolar.map((aday) => aday.id === tablo.id ? { ...aday, kurallar: [...aday.kurallar, yeniKural] } : aday),
      } : onceki);
      setTanimSetleri((onceki) => onceki.map((set) => ({ ...set, surumler: set.surumler.map((surum) => surum.id === secilenSurum.id ? { ...surum, eszamanlilikSurumu: sonuc.eszamanlilikSurumu, guncellemeTarihi: sonuc.guncellemeTarihi, formulSayisi: surum.formulSayisi + 1 } : surum) })));
      setYeniKuralAcik(false);
      setYeniKuralKalemId(0);
    } catch (error) {
      setTanimHatasi(error instanceof Error ? error.message : "Hesaplama kuralı oluşturulamadı.");
    } finally {
      setKuralKaydediliyor(false);
    }
  };

  const taslagiYayinla = async () => {
    if (!user.token || !secilenSurum || secilenSurum.durum !== 1) return;
    setSurumIslemiYukleniyor(true);
    setTanimHatasi("");
    try {
      const sonuc = await publishFinansalSurum(user.token, secilenSurum.id, secilenSurum.eszamanlilikSurumu);
      setTanimSetleri((onceki) => onceki.map((set) => ({ ...set, surumler: set.surumler.map((surum) => surum.id === secilenSurum.id ? { ...surum, durum: sonuc.durum, eszamanlilikSurumu: sonuc.eszamanlilikSurumu, onayTarihi: sonuc.onayTarihi, guncellemeTarihi: sonuc.onayTarihi } : surum) })));
      setSurumDetayi((onceki) => onceki ? { ...onceki, surum: { ...onceki.surum, durum: sonuc.durum, eszamanlilikSurumu: sonuc.eszamanlilikSurumu, onayTarihi: sonuc.onayTarihi, guncellemeTarihi: sonuc.onayTarihi } } : onceki);
      setDogrulamaSonucu(null);
    } catch (error) {
      setTanimHatasi(error instanceof Error ? error.message : "Sürüm yayınlanamadı.");
    } finally {
      setSurumIslemiYukleniyor(false);
    }
  };

  const taslakKlonla = async () => {
    if (!user.token || !secilenSurum) return;
    setSurumIslemiYukleniyor(true);
    setTanimHatasi("");
    try {
      const sonuc = await cloneFinansalSurum(user.token, secilenSurum.id, {
        etiket: `${secilenSurum.etiket} - taslak`,
        gecerlilikBaslangici: secilenSurum.gecerlilikBaslangici,
        gecerlilikBitisi: secilenSurum.gecerlilikBitisi || null,
        aciklama: `Kaynak sürüm #${secilenSurum.surumNo} üzerinden oluşturuldu.`,
        beklenenKaynakEszamanlilikSurumu: secilenSurum.eszamanlilikSurumu,
      });
      const yeniSurum = { ...secilenSurum, id: sonuc.surumId, surumNo: sonuc.surumNo, etiket: `${secilenSurum.etiket} - taslak`, durum: sonuc.durum, kaynakSurumId: secilenSurum.id, aciklama: `Kaynak sürüm #${secilenSurum.surumNo} üzerinden oluşturuldu.`, olusturmaTarihi: new Date().toISOString(), guncellemeTarihi: null, onayTarihi: null, eszamanlilikSurumu: sonuc.eszamanlilikSurumu };
      setTanimSetleri((onceki) => onceki.map((set) => set.id === secilenSetId ? { ...set, surumler: [yeniSurum, ...set.surumler] } : set));
      setSecilenSurumId(sonuc.surumId);
      setSurumId(String(sonuc.surumId));
      setEszamanlilikSurumu(String(sonuc.eszamanlilikSurumu));
    } catch (error) {
      setTanimHatasi(error instanceof Error ? error.message : "Taslak sürüm oluşturulamadı.");
    } finally {
      setSurumIslemiYukleniyor(false);
    }
  };

  const kgkKontrolEt = async () => {
    if (!user.token) return;
    setKgkKontrolYukleniyor(true);
    setTanimHatasi("");
    try {
      const oncekiDosyalar = kgkKontrolSonucu?.dosyalar.map((dosya) => ({
        url: dosya.url,
        sha256: dosya.sha256 || null,
        etag: dosya.etag || null,
        icerikUzunlugu: dosya.icerikUzunlugu || null,
      })) || [];
      const data = await kontrolEtKgkFormatlari(user.token, {
        icerikHashleriniHesapla: kgkHashleriIste,
        oncekiDosyalar,
      });
      setKgkKontrolSonucu(data);
    } catch (error) {
      setTanimHatasi(error instanceof Error ? error.message : "KGK formatları kontrol edilemedi.");
    } finally {
      setKgkKontrolYukleniyor(false);
    }
  };

  const kgkTaramaGecmisiniYukle = async () => {
    if (!user.token) return;
    setKgkGecmisYukleniyor(true);
    try {
      setKgkTaramaGecmisi(await getKgkScanHistory(user.token, 20));
    } catch (error) {
      setTanimHatasi(error instanceof Error ? error.message : "KGK tarama geÃ§miÅŸi okunamadÄ±.");
    } finally {
      setKgkGecmisYukleniyor(false);
    }
  };

  const kgkTaraVeArsivle = async () => {
    if (!user.token) return;
    setKgkTaramaYukleniyor(true);
    setTanimHatasi("");
    try {
      const oncekiDosyalar = kgkKontrolSonucu?.dosyalar.map((dosya) => ({
        url: dosya.url,
        sha256: dosya.sha256 || null,
        etag: dosya.etag || null,
        icerikUzunlugu: dosya.icerikUzunlugu || null,
      })) || [];
      const data = await scanAndArchiveKgkFormats(user.token, {
        icerikHashleriniHesapla: true,
        oncekiDosyalar,
        arsivle: true,
        maksimumDeneme: kgkTaramaDenemesi,
      });
      setKgkKontrolSonucu(data.kontrol);
      setTanimHatasi(data.hatalar.length > 0
        ? `${data.kontrol.bulunanDosyaSayisi} dosya kontrol edildi; ${data.hatalar.length} arÅŸivleme hatasÄ± oluÅŸtu.`
        : `${data.arsivler.length} KGK dosyasÄ± arÅŸivlendi; ${data.toplamDenemeSayisi} deneme yapÄ±ldÄ±.`);
      await kgkTaramaGecmisiniYukle();
    } catch (error) {
      setTanimHatasi(error instanceof Error ? error.message : "KGK tarama ve arÅŸivleme tamamlanamadÄ±.");
    } finally {
      setKgkTaramaYukleniyor(false);
    }
  };

  const kgkDosyaIndir = async (fileUrl: string) => {
    if (!user.token) return;
    setKgkIndirilenUrl(fileUrl);
    setTanimHatasi("");
    try {
      await downloadKgkFormat(user.token, fileUrl);
    } catch (error) {
      setTanimHatasi(error instanceof Error ? error.message : "KGK format dosyası indirilemedi.");
    } finally {
      setKgkIndirilenUrl("");
    }
  };

  const kgkDosyaArsivle = async (fileUrl: string) => {
    if (!user.token) return;
    setKgkArsivlenenUrl(fileUrl);
    setTanimHatasi("");
    try {
      const sonuc = await archiveKgkFormat(user.token, fileUrl);
      setTanimHatasi(sonuc.yeniMi ? `${sonuc.dosyaAdi} arşive kaydedildi (${sonuc.sha256}).` : `${sonuc.dosyaAdi} aynı SHA-256 ile daha önce arşivlenmiş.`);
    } catch (error) {
      setTanimHatasi(error instanceof Error ? error.message : "KGK formatı arşivlenemedi.");
    } finally {
      setKgkArsivlenenUrl("");
    }
  };

  const kgkWorkbookKarsilastir = async () => {
    if (!user.token || !kgkOncekiWorkbook || !kgkYeniWorkbook) return;
    setKgkWorkbookYukleniyor(true);
    setTanimHatasi("");
    try {
      setKgkWorkbookSonucu(await compareKgkWorkbooks(user.token, kgkOncekiWorkbook, kgkYeniWorkbook));
    } catch (error) {
      setTanimHatasi(error instanceof Error ? error.message : "KGK workbook karşılaştırılamadı.");
    } finally {
      setKgkWorkbookYukleniyor(false);
    }
  };

  const kgkArsivWorkbookKarsilastir = async (dosya: KgkFormatKontrolSonucu["dosyalar"][number]) => {
    if (!user.token || !dosya.oncekiSha256 || !dosya.sha256) return;
    setKgkArsivWorkbookYukleniyor(dosya.url);
    setTanimHatasi("");
    try {
      setKgkWorkbookSonucu(await compareArchivedKgkWorkbooks(user.token, {
        url: dosya.url,
        oncekiSha256: dosya.oncekiSha256,
        yeniSha256: dosya.sha256,
      }));
    } catch (error) {
      setTanimHatasi(error instanceof Error ? error.message : "ArÅŸivlenmiÅŸ KGK workbook karÅŸÄ±laÅŸtÄ±rÄ±lamadÄ±.");
    } finally {
      setKgkArsivWorkbookYukleniyor("");
    }
  };

  const kgkFarktanTaslakOlustur = async () => {
    if (!user.token || !secilenSurum || !kgkWorkbookSonucu) return;
    setSurumIslemiYukleniyor(true);
    setTanimHatasi("");
    try {
      const aciklama = `KGK workbook fark incelemesi: ${kgkWorkbookSonucu.oncekiDosyaAdi} → ${kgkWorkbookSonucu.yeniDosyaAdi}; önceki SHA-256 ${kgkWorkbookSonucu.oncekiSha256}; yeni SHA-256 ${kgkWorkbookSonucu.yeniSha256}; ${kgkWorkbookSonucu.farkSayisi} yapısal fark, ${kgkWorkbookSonucu.kalemFarklari.length} semantik kalem farkı, ${kgkWorkbookSonucu.formulFarklari.length} formül farkı. Otomatik yayınlanmaz.`;
      const sonuc = await cloneFinansalSurum(user.token, secilenSurum.id, {
        etiket: `${secilenSurum.etiket} - KGK taslak`,
        gecerlilikBaslangici: secilenSurum.gecerlilikBaslangici,
        gecerlilikBitisi: secilenSurum.gecerlilikBitisi || null,
        aciklama,
        beklenenKaynakEszamanlilikSurumu: secilenSurum.eszamanlilikSurumu,
      });
      const normalize = (value: string) => value.trim().toLocaleUpperCase("tr-TR")
        .replace(/[ÇĞİÖŞÜ]/g, (karakter) => ({ Ç: "C", Ğ: "G", İ: "I", Ö: "O", Ş: "S", Ü: "U" }[karakter] || karakter))
        .replace(/[^A-Z0-9]/g, "");
      const sayfaTabloEslestirmeleri: Record<string, number> = {};
      const sayfalar = Array.from(new Set(kgkWorkbookSonucu.kalemFarklari.map((fark) => (fark.yeniKalem || fark.oncekiKalem)?.sayfaAdi).filter((sayfa): sayfa is string => Boolean(sayfa))));
      sayfalar.forEach((sayfa) => {
        const adaylar = (surumDetayi?.tablolar || []).filter((tablo) => normalize(tablo.kod) === normalize(sayfa) || normalize(tablo.ad) === normalize(sayfa));
        if (adaylar.length === 1) sayfaTabloEslestirmeleri[sayfa] = adaylar[0].id;
      });
      let manuelEslestirmeler: Record<string, number> = {};
      try {
        const parsed = JSON.parse(kgkSayfaTabloEslestirmeleriJson || "{}");
        if (!parsed || Array.isArray(parsed) || typeof parsed !== "object") throw new Error("KGK sayfa–tablo eşleştirmesi bir JSON nesnesi olmalıdır.");
        Object.entries(parsed).forEach(([sayfa, tabloId]) => {
          const id = Number(tabloId);
          if (!sayfa.trim() || !Number.isInteger(id) || id <= 0) throw new Error("KGK sayfa–tablo eşleştirmesinde sayfa adı ve pozitif tablo ID'si kullanılmalıdır.");
          manuelEslestirmeler[sayfa] = id;
        });
      } catch (error) {
        if (error instanceof Error) throw error;
        throw new Error("KGK sayfa–tablo eşleştirmesi JSON olarak okunamadı.");
      }
      const uygulama = kgkWorkbookSonucu.kalemFarklari.length > 0
        ? await applyKgkKalemFarklari(user.token, sonuc.surumId, {
          beklenenEszamanlilikSurumu: sonuc.eszamanlilikSurumu,
          kalemFarklari: kgkWorkbookSonucu.kalemFarklari,
          sayfaTabloEslestirmeleri: { ...sayfaTabloEslestirmeleri, ...manuelEslestirmeler },
          aciklama,
        })
        : { eszamanlilikSurumu: sonuc.eszamanlilikSurumu, eklenenKalemSayisi: 0, pasifeAlinanKalemSayisi: 0, guncellenenKalemSayisi: 0 };
      const yeniSurum = { ...secilenSurum, id: sonuc.surumId, surumNo: sonuc.surumNo, etiket: `${secilenSurum.etiket} - KGK taslak`, durum: sonuc.durum, kaynakSurumId: secilenSurum.id, aciklama, olusturmaTarihi: new Date().toISOString(), guncellemeTarihi: new Date().toISOString(), onayTarihi: null, eszamanlilikSurumu: uygulama.eszamanlilikSurumu, kalemSayisi: Math.max(0, secilenSurum.kalemSayisi + uygulama.eklenenKalemSayisi - uygulama.pasifeAlinanKalemSayisi) };
      setTanimSetleri((onceki) => onceki.map((set) => set.id === secilenSetId ? { ...set, surumler: [yeniSurum, ...set.surumler] } : set));
      setSecilenSurumId(sonuc.surumId);
      setSurumId(String(sonuc.surumId));
      setEszamanlilikSurumu(String(uygulama.eszamanlilikSurumu));
      setTanimHatasi(`KGK taslağı oluşturuldu: ${uygulama.eklenenKalemSayisi} yeni, ${uygulama.pasifeAlinanKalemSayisi} pasif, ${uygulama.guncellenenKalemSayisi} güncellenen kalem. Formül farkları ayrı Admin onayıyla aktarılır; taslak otomatik yayınlanmaz.`);
    } catch (error) {
      setTanimHatasi(error instanceof Error ? error.message : "KGK farkı için taslak oluşturulamadı.");
    } finally {
      setSurumIslemiYukleniyor(false);
    }
  };

  const kgkFormulFarklariniTaslagAktar = async () => {
    if (!user.token || !secilenSurum || secilenSurum.durum !== 1 || !kgkWorkbookSonucu?.formulDegisikligiVarMi) return;
    const hataliFormuller = kgkWorkbookSonucu.formulFarklari
      .map((fark) => fark.yeniFormul)
      .filter((formul) => formul && formul.dogrulamaHatalari.length > 0);
    if (hataliFormuller.length > 0) {
      setTanimHatasi("Çözümlenme hatası taşıyan KGK formülleri düzeltilmeden taslağa aktarılamaz.");
      return;
    }

    setSurumIslemiYukleniyor(true);
    setTanimHatasi("");
    try {
      const normalize = (value: string) => value.trim().toLocaleUpperCase("tr-TR")
        .replace(/[ÇĞİÖŞÜ]/g, (karakter) => ({ Ç: "C", Ğ: "G", İ: "I", Ö: "O", Ş: "S", Ü: "U" }[karakter] || karakter))
        .replace(/[^A-Z0-9]/g, "");
      const sayfaTabloEslestirmeleri: Record<string, number> = {};
      const sayfalar = Array.from(new Set(kgkWorkbookSonucu.formulFarklari
        .map((fark) => (fark.yeniFormul || fark.oncekiFormul)?.sayfaAdi)
        .filter((sayfa): sayfa is string => Boolean(sayfa))));
      sayfalar.forEach((sayfa) => {
        const adaylar = (surumDetayi?.tablolar || []).filter((tablo) => normalize(tablo.kod) === normalize(sayfa) || normalize(tablo.ad) === normalize(sayfa));
        if (adaylar.length === 1) sayfaTabloEslestirmeleri[sayfa] = adaylar[0].id;
      });
      const parsed = JSON.parse(kgkSayfaTabloEslestirmeleriJson || "{}");
      if (!parsed || Array.isArray(parsed) || typeof parsed !== "object") throw new Error("KGK sayfa–tablo eşleştirmesi bir JSON nesnesi olmalıdır.");
      Object.entries(parsed).forEach(([sayfa, tabloId]) => {
        const id = Number(tabloId);
        if (!sayfa.trim() || !Number.isInteger(id) || id <= 0) throw new Error("KGK sayfa–tablo eşleştirmesinde sayfa adı ve pozitif tablo ID'si kullanılmalıdır.");
        sayfaTabloEslestirmeleri[sayfa] = id;
      });

      const sonuc = await applyKgkFormulFarklari(user.token, secilenSurum.id, {
        beklenenEszamanlilikSurumu: secilenSurum.eszamanlilikSurumu,
        formulFarklari: kgkWorkbookSonucu.formulFarklari,
        sayfaTabloEslestirmeleri,
        aciklama: `KGK workbook formül farkları: ${kgkWorkbookSonucu.oncekiDosyaAdi} → ${kgkWorkbookSonucu.yeniDosyaAdi}`,
      });
      setTanimSetleri((onceki) => onceki.map((set) => ({
        ...set,
        surumler: set.surumler.map((surum) => surum.id === secilenSurum.id
          ? { ...surum, eszamanlilikSurumu: sonuc.eszamanlilikSurumu, formulSayisi: surum.formulSayisi + sonuc.eklenenFormulSayisi }
          : surum),
      })));
      setEszamanlilikSurumu(String(sonuc.eszamanlilikSurumu));
      setSurumDetayi(await getFinansalSurumDetay(user.token, secilenSurum.id));
      setTanimHatasi(`KGK formül farkları taslağa aktarıldı: ${sonuc.eklenenFormulSayisi} yeni, ${sonuc.guncellenenFormulSayisi} güncellenen, ${sonuc.pasifeAlinanFormulSayisi} pasif formül; ${sonuc.yazilanTerimSayisi} terim yazıldı. Taslak otomatik yayınlanmadı.`);
    } catch (error) {
      setTanimHatasi(error instanceof Error ? error.message : "KGK formül farkları taslağa uygulanamadı.");
    } finally {
      setSurumIslemiYukleniyor(false);
    }
  };

  const surumleriKarsilastir = async () => {
    if (!user.token || !secilenSurum || !karsilastirmaSurumId) return;
    setKarsilastirmaYukleniyor(true);
    setTanimHatasi("");
    try {
      setKarsilastirmaSonucu(await compareFinansalSurumler(user.token, secilenSurum.id, karsilastirmaSurumId));
    } catch (error) {
      setTanimHatasi(error instanceof Error ? error.message : "Sürümler karşılaştırılamadı.");
    } finally {
      setKarsilastirmaYukleniyor(false);
    }
  };

  const finansalTabloUret = async () => {
    const tablo = secilenKalemTablosu;
    const set = secilenSet;
    const surum = secilenSurum;
    const donem = tablo?.donemKolonlari?.find((kolon) => kolon.sabitAnahtar === uretimDonemAnahtari) || tablo?.donemKolonlari?.[0];
    if (!user.token || !set || !surum || !tablo || !donem) {
      setTanimHatasi("Üretim için yayımlanmış sürüm, tablo ve dönem kolonu seçilmelidir.");
      return;
    }
    if (surum.durum !== 2) {
      setTanimHatasi("Üretim yalnızca yayımlanmış sürüm üzerinden başlatılabilir.");
      return;
    }
    if (uretimGirdiSha256.trim().length !== 64 || !uretimDenetlenenId || !uretimYil || !uretimBaslangic || !uretimBitis) {
      setTanimHatasi("Girdi SHA-256, denetlenen, yıl ve dönem tarihleri zorunludur.");
      return;
    }
    setUretimYukleniyor(true);
    setTanimHatasi("");
    try {
      const snapshotSha256 = uretimSnapshotSha256.trim() || dogrulamaSonucu?.tablolar.find((aday) => aday.tabloId === tablo.id)?.snapshotSha256 || "";
      const data = await createFinansalTabloUretimi(user.token, {
        yeniMotorSurumu: "finansal-tablo-yeni-motor-v1",
        tanimSetiSabitAnahtari: set.kod,
        tanimSurumu: String(surum.surumNo),
        girdiSabitAnahtari: uretimGirdiAnahtari.trim() || "MIZAN",
        girdiSha256: uretimGirdiSha256.trim().toLowerCase(),
        calistirmaBaglami: {
          donemEslesmeleri: [{
            donemDavranisi: donem.donemDavranisi,
            donemOfseti: donem.donemOfseti,
            donem: {
              sabitAnahtar: donem.sabitAnahtar,
              baslangicTarihi: uretimBaslangic,
              bitisTarihi: uretimBitis,
            },
          }],
          yuvarlamaBasamagi: tablo.yuvarlamaBasamagi,
          yuvarlamaModu: 1,
          degerKaynagiBaglami: {
            denetlenenId: Number(uretimDenetlenenId),
            yil: Number(uretimYil),
            konsolidasyonMu: uretimKonsolide,
            denetciId: Number(uretimDenetciId) || 0,
          },
        },
        tabloSabitAnahtari: tablo.kod,
        donemSabitAnahtari: donem.sabitAnahtar,
        raporlamaStandardi: set.raporlamaStandardi,
        kapsam: set.kapsam,
        donusumTipi: set.donusumTipi,
        tabloTuru: tablo.tabloTuru,
        nakitAkisYontemi: tablo.nakitAkisYontemi,
        gecerlilikTarihi: uretimBitis,
        tanimSnapshotSha256: snapshotSha256,
      });
      setUretimSonucu(data);
      setTanimHatasi(data.kayit.durum === 1 ? "Finansal tablo üretimi arşivlendi." : data.kayit.aciklama || "Finansal tablo üretimi tamamlanamadı.");
    } catch (error) {
      setTanimHatasi(error instanceof Error ? error.message : "Finansal tablo üretimi tamamlanamadı.");
    } finally {
      setUretimYukleniyor(false);
    }
  };

  const finansalTabloyuTekrarUret = async () => {
    if (!user.token || !uretimSonucu?.kayit.uretimId) return;
    setUretimTekrarYukleniyor(true);
    setTanimHatasi("");
    try {
      const data = await replayFinansalTabloUretimi(user.token, uretimSonucu.kayit.uretimId);
      setUretimSonucu(data);
      setTanimHatasi(data.kayit.durum === 1 ? `Geçmiş üretim yeniden çalıştırıldı · kaynak ${data.kayit.yenidenUretimKaynakId || "-"}.` : data.kayit.aciklama || "Geçmiş finansal tablo yeniden üretilemedi.");
    } catch (error) {
      setTanimHatasi(error instanceof Error ? error.message : "Geçmiş finansal tablo yeniden üretilemedi.");
    } finally {
      setUretimTekrarYukleniyor(false);
    }
  };

  const finansalTabloGecmisiniYukle = async () => {
    if (!user.token) return;
    setUretimGecmisiYukleniyor(true);
    setTanimHatasi("");
    try {
      setUretimGecmisi(await getFinansalTabloUretimGecmisi(user.token, 100));
    } catch (error) {
      setTanimHatasi(error instanceof Error ? error.message : "Finansal tablo üretim geçmişi okunamadı.");
    } finally {
      setUretimGecmisiYukleniyor(false);
    }
  };

  const finansalTabloPilotDurumunuYukle = async () => {
    if (!user.token) return;
    setPilotDurumuYukleniyor(true);
    setTanimHatasi("");
    try {
      setPilotDurumu(await getFinansalTabloPilotDurumu(user.token));
    } catch (error) {
      setTanimHatasi(error instanceof Error ? error.message : "Finansal tablo pilot durumu okunamadı.");
    } finally {
      setPilotDurumuYukleniyor(false);
    }
  };

  const finansalTabloKaliciArsivDurumunuYukle = async () => {
    if (!user.token) return;
    setKaliciArsivDurumuYukleniyor(true);
    setTanimHatasi("");
    try {
      setKaliciArsivDurumu(await getFinansalTabloKaliciArsivDurumu(user.token));
    } catch (error) {
      setTanimHatasi(error instanceof Error ? error.message : "Kalıcı arşiv migration durumu okunamadı.");
    } finally {
      setKaliciArsivDurumuYukleniyor(false);
    }
  };

  const finansalTabloArsiviniDogrula = async () => {
    if (!user.token) return;
    setArsivDogrulamaYukleniyor(true);
    setTanimHatasi("");
    try {
      setArsivDogrulama(await getFinansalTabloArsivDogrulamasi(user.token, 20));
    } catch (error) {
      setTanimHatasi(error instanceof Error ? error.message : "Finansal tablo arşiv bütünlüğü doğrulanamadı.");
    } finally {
      setArsivDogrulamaYukleniyor(false);
    }
  };

  const finansalTabloKaliciArsivHazirliginiYukle = async () => {
    if (!user.token) return;
    setKaliciArsivHazirligiYukleniyor(true);
    setTanimHatasi("");
    try {
      setKaliciArsivHazirligi(await getFinansalTabloKaliciArsivHazirligi(user.token, 100));
    } catch (error) {
      setTanimHatasi(error instanceof Error ? error.message : "Kalıcı arşiv geçiş hazırlığı okunamadı.");
    } finally {
      setKaliciArsivHazirligiYukleniyor(false);
    }
  };

  const finansalTabloArsivleriniKarsilastir = async () => {
    if (!user.token) return;
    setArsivKarsilastirmaYukleniyor(true);
    setTanimHatasi("");
    try {
      setArsivKarsilastirma(await getFinansalTabloArsivKarsilastirmasi(user.token, 100));
    } catch (error) {
      setTanimHatasi(error instanceof Error ? error.message : "DB ve dosya arşivleri karşılaştırılamadı.");
    } finally {
      setArsivKarsilastirmaYukleniyor(false);
    }
  };

  const finansalTabloGolgeKarsilastir = async () => {
    if (!user.token || !golgeKarsilastirmaJson.trim()) return;
    setGolgeKarsilastirmaYukleniyor(true);
    setTanimHatasi("");
    try {
      const istek = JSON.parse(golgeKarsilastirmaJson);
      setGolgeKarsilastirmaSonucu(await compareFinansalTabloGolge(user.token, istek));
      setTanimHatasi("Legacy/yeni motor gölge karşılaştırması tamamlandı; sonuç arşivlenmedi.");
    } catch (error) {
      setTanimHatasi(error instanceof Error ? error.message : "Gölge karşılaştırması çalıştırılamadı.");
    } finally {
      setGolgeKarsilastirmaYukleniyor(false);
    }
  };

  const kgkFinansalTabloRenderEt = async () => {
    if (!user.token || !uretimSonucu?.kayit.uretimId || !kgkRenderSablon || !kgkRenderEslesmeler.trim()) {
      setTanimHatasi("KGK çıktısı için üretim kaydı, şablon ve eşleştirme JSON'u zorunludur.");
      return;
    }
    setKgkRenderYukleniyor(true);
    setTanimHatasi("");
    try {
      const sonuc = await renderFinansalTabloKgk(user.token, uretimSonucu.kayit.uretimId, kgkRenderSablon, kgkRenderEslesmeler);
      setKgkRenderSonucu(sonuc);
      setKgkArsivCiktilari(await getFinansalTabloKgkCiktilari(user.token, uretimSonucu.kayit.uretimId));
      setTanimHatasi(`KGK çıktısı indirildi: ${sonuc.dosyaAdi}`);
    } catch (error) {
      setTanimHatasi(error instanceof Error ? error.message : "KGK finansal tablo çıktısı oluşturulamadı.");
    } finally {
      setKgkRenderYukleniyor(false);
    }
  };

  const kgkArsivCiktilariniYukle = async () => {
    if (!user.token || !uretimSonucu?.kayit.uretimId) return;
    setKgkArsivCiktilariYukleniyor(true);
    setTanimHatasi("");
    try {
      setKgkArsivCiktilari(await getFinansalTabloKgkCiktilari(user.token, uretimSonucu.kayit.uretimId));
    } catch (error) {
      setTanimHatasi(error instanceof Error ? error.message : "Arşivlenmiş KGK çıktıları okunamadı.");
    } finally {
      setKgkArsivCiktilariYukleniyor(false);
    }
  };

  const kgkArsivCiktisiIndir = async (kayit: FinansalTabloKgkUretimArsivKaydi) => {
    if (!user.token || !uretimSonucu?.kayit.uretimId) return;
    setKgkArsivIndirilenSha(kayit.ciktiSha256);
    setTanimHatasi("");
    try {
      await downloadFinansalTabloKgkCiktisi(user.token, uretimSonucu.kayit.uretimId, kayit.ciktiSha256);
      setTanimHatasi(`Arşivlenmiş KGK çıktısı indirildi: ${kayit.ciktiDosyaAdi}`);
    } catch (error) {
      setTanimHatasi(error instanceof Error ? error.message : "Arşivlenmiş KGK çıktısı indirilemedi.");
    } finally {
      setKgkArsivIndirilenSha("");
    }
  };

  const kalite = sonuc?.kaliteRaporu;
  const onayGerekiyor = kalite?.onayGerekiyorMu === true;
  const formHazir = useMemo(
    () =>
      Number(surumId) > 0 &&
      Number(eszamanlilikSurumu) >= 0 &&
      kaynakSha256.trim().length === 64 &&
      paket !== null &&
      manifest !== null,
    [eszamanlilikSurumu, kaynakSha256, manifest, paket, surumId]
  );

  const dosyaSecildi = async (
    event: ChangeEvent<HTMLInputElement>,
    tur: "paket" | "manifest"
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setHata("");
    setSonuc(null);
    if (tur === "paket") setPaketDosyaAdi(file.name);
    else setManifestDosyaAdi(file.name);
    try {
      const text = await file.text();
      const json = JSON.parse(text) as LegacyImportPackage | LegacyImportOutputManifest;
      if (!json || typeof json !== "object" || Array.isArray(json)) {
        throw new Error("Paket JSON nesnesi olmalıdır.");
      }
      if (tur === "paket") setPaket(json as LegacyImportPackage);
      else {
        const manifestJson = json as LegacyImportOutputManifest;
        setManifest(manifestJson);
        if (typeof manifestJson.sourceSha256 === "string") {
          setKaynakSha256(manifestJson.sourceSha256);
        }
      }
    } catch (error) {
      if (tur === "paket") setPaket(null);
      else setManifest(null);
      setHata(error instanceof Error ? error.message : "JSON dosyası okunamadı.");
    }
  };

  const onizle = async () => {
    if (!formHazir) {
      setHata("Sürüm, eşzamanlılık sürümü, kaynak SHA-256, paket ve manifest dosyası zorunludur.");
      return;
    }
    setYukleniyor(true);
    setHata("");
    try {
      const data = await previewLegacyPaket(user.token || "", {
        surumId: Number(surumId),
        beklenenEszamanlilikSurumu: Number(eszamanlilikSurumu),
        beklenenKaynakSha256: kaynakSha256.trim(),
        paket: paket!,
        manifest: manifest!,
      });
      setSonuc(data);
    } catch (error) {
      setHata(error instanceof Error ? error.message : "Önizleme başarısız.");
    } finally {
      setYukleniyor(false);
    }
  };

  const uygula = async () => {
    if (!formHazir || !sonuc) {
      setHata("Önce geçerli bir paketi önizleyin.");
      return;
    }
    if (onayGerekiyor && (!onayAciklamasi.trim() || !farkKodlari.trim())) {
      setHata("Uyarılı paket için onay açıklaması ve en az bir fark kodu girin.");
      return;
    }

    setYukleniyor(true);
    setHata("");
    try {
      const data = await applyLegacyPaket(user.token || "", {
        surumId: Number(surumId),
        beklenenEszamanlilikSurumu: Number(eszamanlilikSurumu),
        beklenenKaynakSha256: kaynakSha256.trim(),
        paket: paket!,
        manifest: manifest!,
        ...(onayGerekiyor
          ? {
              farkOnayi: {
                aciklama: onayAciklamasi.trim(),
                farkKodlari: farkKodlari
                  .split(",")
                  .map((kod) => kod.trim())
                  .filter(Boolean),
              },
            }
          : {}),
      });
      setSonuc(data);
    } catch (error) {
      setHata(error instanceof Error ? error.message : "Paket uygulanamadı.");
    } finally {
      setYukleniyor(false);
    }
  };

  return (
    <PageContainer
      title="Finansal Tablo Yönetimi"
      description="Legacy finansal tablo paketlerini önizleme ve kontrollü uygulama"
    >
      <Breadcrumb title="Finansal Tablo Yönetimi" items={breadcrumbItems} />
      <ParentCard title="KGK format güncelleme kontrolü">
        <Stack spacing={1.5}>
          <Typography variant="body2" color="text.secondary">
            KGK'nın 31/12/2023 ve sonrası elektronik finansal raporlama sayfasındaki Excel/arşiv bağlantıları okunur. Bu işlem taslak oluşturmaz ve yayın yapmaz; yalnız değişiklik uyarısı üretir.
          </Typography>
          <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" useFlexGap>
            <Button variant="contained" size="small" onClick={kgkKontrolEt} disabled={kgkKontrolYukleniyor}>
              {kgkKontrolYukleniyor ? <CircularProgress size={18} color="inherit" /> : "KGK'yı kontrol et"}
            </Button>
            <Button variant="outlined" size="small" color="secondary" onClick={kgkTaraVeArsivle} disabled={kgkTaramaYukleniyor}>
              {kgkTaramaYukleniyor ? <CircularProgress size={18} color="inherit" /> : "Kontrol et + arşivle"}
            </Button>
            <TextField
              size="small"
              type="number"
              label="Tekrar"
              value={kgkTaramaDenemesi}
              onChange={(event) => setKgkTaramaDenemesi(Math.min(5, Math.max(1, Number(event.target.value) || 1)))}
              inputProps={{ min: 1, max: 5 }}
              sx={{ width: 92 }}
            />
            <Button variant="text" size="small" onClick={kgkTaramaGecmisiniYukle} disabled={kgkGecmisYukleniyor}>
              {kgkGecmisYukleniyor ? <CircularProgress size={16} /> : "Tarama geçmişi"}
            </Button>
            <Stack direction="row" spacing={0.5} alignItems="center">
              <Switch size="small" checked={kgkHashleriIste} onChange={(event) => setKgkHashleriIste(event.target.checked)} />
              <Typography variant="caption">Dosya SHA-256 hesapla</Typography>
            </Stack>
            {kgkKontrolSonucu && <Chip label={`${kgkKontrolSonucu.bulunanDosyaSayisi} dosya · ${kgkKontrolSonucu.degisenDosyaSayisi} değişiklik`} color={kgkKontrolSonucu.degisenDosyaSayisi > 0 ? "warning" : "success"} />}
          </Stack>
          {kgkKontrolSonucu && (
            <Paper variant="outlined" sx={{ p: 1.5, maxHeight: 360, overflow: "auto" }}>
              <Typography variant="caption" color="text.secondary" component="div" sx={{ mb: 1 }}>
                Kaynak: <a href={kgkKontrolSonucu.kaynakUrl} target="_blank" rel="noreferrer">KGK elektronik finansal raporlama</a> · Kontrol: {new Date(kgkKontrolSonucu.kontrolTarihi).toLocaleString("tr-TR")}
              </Typography>
              <Table size="small">
                <TableHead><TableRow><TableCell>Grup</TableCell><TableCell>Dosya</TableCell><TableCell>Durum</TableCell><TableCell align="right">Boyut</TableCell><TableCell>Bağlantı</TableCell></TableRow></TableHead>
                <TableBody>{kgkKontrolSonucu.dosyalar.map((dosya) => <TableRow key={dosya.url} hover><TableCell>{dosya.grup}</TableCell><TableCell>{dosya.dosyaAdi}</TableCell><TableCell>{!dosya.erisilebilirMi ? <Chip size="small" color="error" label="Erişilemiyor" /> : dosya.degistiMi ? <Chip size="small" color="warning" label="Değişmiş" /> : dosya.karsilastirmaVarMi ? <Chip size="small" color="success" label="Aynı" /> : <Chip size="small" variant="outlined" label="İlk kayıt" />}</TableCell><TableCell align="right">{dosya.icerikUzunlugu ? `${Math.round(dosya.icerikUzunlugu / 1024)} KB` : "—"}</TableCell><TableCell><Button size="small" component="a" href={dosya.url} target="_blank" rel="noreferrer">Aç</Button></TableCell></TableRow>)}</TableBody>
              </Table>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
                {kgkKontrolSonucu.dosyalar.map((dosya) => (
                  <Stack key={`kgk-islem-${dosya.url}`} direction="row" spacing={0.5}>
                    <Button size="small" variant="outlined" onClick={() => kgkDosyaIndir(dosya.url)} disabled={!dosya.erisilebilirMi || kgkIndirilenUrl === dosya.url}>
                      {kgkIndirilenUrl === dosya.url ? <CircularProgress size={16} /> : `${dosya.dosyaAdi} güvenli indir`}
                    </Button>
                    <Button size="small" variant="outlined" color="secondary" onClick={() => kgkDosyaArsivle(dosya.url)} disabled={!dosya.erisilebilirMi || kgkArsivlenenUrl === dosya.url}>
                      {kgkArsivlenenUrl === dosya.url ? <CircularProgress size={16} /> : "Arşivle"}
                    </Button>
                    {dosya.degistiMi && dosya.oncekiSha256 && dosya.sha256 && /^(xlsx|xlsm)$/i.test(dosya.dosyaTuru) && <Button size="small" variant="contained" color="info" onClick={() => kgkArsivWorkbookKarsilastir(dosya)} disabled={kgkArsivWorkbookYukleniyor === dosya.url}>
                      {kgkArsivWorkbookYukleniyor === dosya.url ? <CircularProgress size={16} color="inherit" /> : "Arşivli farkı incele"}
                    </Button>}
                  </Stack>
                ))}
              </Stack>
            </Paper>
          )}
          {kgkTaramaGecmisi.length > 0 && (
            <Paper variant="outlined" sx={{ p: 1.5, maxHeight: 220, overflow: "auto" }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Son KGK taramaları</Typography>
              <Table size="small">
                <TableHead><TableRow><TableCell>Tarih</TableCell><TableCell>Dosya</TableCell><TableCell>Değişiklik</TableCell><TableCell>Arşiv</TableCell><TableCell>Hata</TableCell><TableCell>Deneme</TableCell></TableRow></TableHead>
                <TableBody>{kgkTaramaGecmisi.map((kayit) => <TableRow key={kayit.taramaId}><TableCell>{new Date(kayit.bitis).toLocaleString("tr-TR")}</TableCell><TableCell>{kayit.bulunanDosyaSayisi}</TableCell><TableCell>{kayit.degisenDosyaSayisi}</TableCell><TableCell>{kayit.arsivlenenDosyaSayisi}</TableCell><TableCell>{kayit.hataSayisi}</TableCell><TableCell>{kayit.toplamDenemeSayisi}</TableCell></TableRow>)}</TableBody>
              </Table>
            </Paper>
          )}
          <Divider />
          <Typography variant="subtitle2">Workbook yapısal farkı</Typography>
          <Typography variant="caption" color="text.secondary">
            İki KGK Excel dosyası makro çalıştırılmadan; sayfa, hücre, formül, stil, birleştirme ve adlandırılmış aralık anahtarlarıyla karşılaştırılır. Kalem ve formül farkları ayrı incelenir; yalnız seçili taslağa Admin onayıyla aktarılır ve otomatik yayın yapılmaz.
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
            <Button component="label" size="small" variant="outlined">
              {kgkOncekiWorkbook?.name || "Önceki workbook"}
              <input hidden type="file" accept=".xlsx,.xlsm" onChange={(event) => setKgkOncekiWorkbook(event.target.files?.[0] || null)} />
            </Button>
            <Button component="label" size="small" variant="outlined">
              {kgkYeniWorkbook?.name || "Yeni workbook"}
              <input hidden type="file" accept=".xlsx,.xlsm" onChange={(event) => setKgkYeniWorkbook(event.target.files?.[0] || null)} />
            </Button>
            <Button size="small" variant="contained" onClick={kgkWorkbookKarsilastir} disabled={!kgkOncekiWorkbook || !kgkYeniWorkbook || kgkWorkbookYukleniyor}>
              {kgkWorkbookYukleniyor ? <CircularProgress size={18} color="inherit" /> : "Workbook karşılaştır"}
            </Button>
          </Stack>
          <TextField
            fullWidth
            size="small"
            multiline
            minRows={2}
            label="KGK sayfa–tablo eşleştirmesi (JSON)"
            value={kgkSayfaTabloEslestirmeleriJson}
            onChange={(event) => setKgkSayfaTabloEslestirmeleriJson(event.target.value)}
            helperText={'Otomatik eşleşmeyen sayfalar için örn. {"BOBİ FRS FDT Konsolide": 12}. Tablo ID\'si bu sürümdeki tanımdan alınır.'}
          />
          {kgkWorkbookSonucu && (
            <Paper variant="outlined" sx={{ p: 1.5, maxHeight: 320, overflow: "auto" }}>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                <Chip size="small" color={kgkWorkbookSonucu.yapisalDegisiklikVarMi ? "warning" : "success"} label={kgkWorkbookSonucu.yapisalDegisiklikVarMi ? `${kgkWorkbookSonucu.farkSayisi} yapısal fark` : "Yapısal fark yok"} />
                {kgkWorkbookSonucu.makroVarMi && <Chip size="small" color="info" label="Makro bulundu; çalıştırılmadı" />}
                {(kgkWorkbookSonucu.semantikDegisiklikVarMi || kgkWorkbookSonucu.formulDegisikligiVarMi) && secilenSurum && secilenSurum.durum !== 1 && <Button size="small" variant="outlined" onClick={kgkFarktanTaslakOlustur} disabled={surumIslemiYukleniyor}>KGK farkından taslak oluştur</Button>}
                {kgkWorkbookSonucu.formulDegisikligiVarMi && secilenSurum?.durum === 1 && <Button size="small" variant="contained" color="secondary" onClick={kgkFormulFarklariniTaslagAktar} disabled={surumIslemiYukleniyor}>KGK formül farklarını taslağa aktar</Button>}
              </Stack>
              {kgkWorkbookSonucu.farklar.length > 0 && <Table size="small"><TableHead><TableRow><TableCell>Tür</TableCell><TableCell>Anahtar</TableCell><TableCell>Değişiklik</TableCell></TableRow></TableHead><TableBody>{kgkWorkbookSonucu.farklar.map((fark) => <TableRow key={`${fark.degisiklikTuru}-${fark.anahtar}`}><TableCell>{fark.nesneTuru}</TableCell><TableCell>{fark.anahtar}</TableCell><TableCell>{fark.degisiklikTuru}</TableCell></TableRow>)}</TableBody></Table>}
              <Divider sx={{ my: 1 }} />
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                <Typography variant="caption" color="text.secondary">Semantik kalemler: {kgkWorkbookSonucu.oncekiKalemSayisi} → {kgkWorkbookSonucu.yeniKalemSayisi}</Typography>
                <Chip size="small" color={kgkWorkbookSonucu.semantikDegisiklikVarMi ? "warning" : "success"} label={kgkWorkbookSonucu.semantikDegisiklikVarMi ? `${kgkWorkbookSonucu.kalemFarklari.length} kalem farkı` : "Kalem farkı yok"} />
              </Stack>
              {kgkWorkbookSonucu.kalemFarklari.length > 0 && <Table size="small"><TableHead><TableRow><TableCell>Değişiklik</TableCell><TableCell>Sayfa</TableCell><TableCell>Kalem</TableCell><TableCell>Üst kalem</TableCell><TableCell>Anahtar</TableCell></TableRow></TableHead><TableBody>{kgkWorkbookSonucu.kalemFarklari.map((fark) => { const kalem = fark.yeniKalem || fark.oncekiKalem; return <TableRow key={`${fark.degisiklikTuru}-${fark.sabitAnahtar}`}><TableCell>{fark.degisiklikTuru}</TableCell><TableCell>{kalem?.sayfaAdi || "—"}</TableCell><TableCell>{kalem?.ad || "—"}</TableCell><TableCell>{kalem?.ustSabitAnahtar || "—"}</TableCell><TableCell>{fark.sabitAnahtar}</TableCell></TableRow>; })}</TableBody></Table>}
              <Divider sx={{ my: 1 }} />
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                <Typography variant="caption" color="text.secondary">Formüller: {kgkWorkbookSonucu.oncekiFormulSayisi} → {kgkWorkbookSonucu.yeniFormulSayisi}</Typography>
                <Chip size="small" color={kgkWorkbookSonucu.formulDegisikligiVarMi ? "warning" : "success"} label={kgkWorkbookSonucu.formulDegisikligiVarMi ? `${kgkWorkbookSonucu.formulFarklari.length} formül farkı` : "Formül farkı yok"} />
              </Stack>
              {kgkWorkbookSonucu.formulFarklari.length > 0 && <Table size="small"><TableHead><TableRow><TableCell>Değişiklik</TableCell><TableCell>Sayfa / hedef</TableCell><TableCell>Kalem anahtarı</TableCell><TableCell>Formül</TableCell><TableCell>Terim</TableCell><TableCell>Durum</TableCell></TableRow></TableHead><TableBody>{kgkWorkbookSonucu.formulFarklari.map((fark) => { const formul = fark.yeniFormul || fark.oncekiFormul; const hatalar = formul?.dogrulamaHatalari || []; return <TableRow key={`${fark.degisiklikTuru}-${fark.sabitAnahtar}`}><TableCell>{fark.degisiklikTuru}</TableCell><TableCell>{formul ? `${formul.sayfaAdi}!${formul.hedefHucreAdresi}` : "—"}</TableCell><TableCell>{formul?.kalemSabitAnahtari || "—"}</TableCell><TableCell sx={{ maxWidth: 320, overflowWrap: "anywhere" }}>{formul?.hamFormul || "—"}</TableCell><TableCell>{formul?.terimler.length || 0}</TableCell><TableCell>{hatalar.length > 0 ? <Chip size="small" color="error" label={`${hatalar.length} çözümleme hatası`} title={hatalar.join("; ")} /> : <Chip size="small" color="success" variant="outlined" label="Hazır" />}</TableCell></TableRow>; })}</TableBody></Table>}
            </Paper>
          )}
        </Stack>
      </ParentCard>
      <ParentCard title="Sürümlü finansal tablo üretimi">
        <Stack spacing={1.5}>
          <Alert severity="info">
            Üretim yalnızca yayımlanmış sürümden çalışır. Kullanılan tanım snapshot&#39;ı, girdi SHA-256&#39;sı, değerler ve hesaplama izleri değişmez üretim arşivine kaydedilir.
          </Alert>
          <Stack spacing={1}>
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
              <Button variant="outlined" size="small" onClick={finansalTabloPilotDurumunuYukle} disabled={pilotDurumuYukleniyor}>
                {pilotDurumuYukleniyor ? <CircularProgress size={18} /> : "Pilot durumunu kontrol et"}
              </Button>
              <Button variant="outlined" size="small" onClick={finansalTabloKaliciArsivDurumunuYukle} disabled={kaliciArsivDurumuYukleniyor}>
                {kaliciArsivDurumuYukleniyor ? <CircularProgress size={18} /> : "DB migration durumunu kontrol et"}
              </Button>
              <Button variant="outlined" size="small" onClick={finansalTabloArsiviniDogrula} disabled={arsivDogrulamaYukleniyor}>
                {arsivDogrulamaYukleniyor ? <CircularProgress size={18} /> : "Arşiv bütünlüğünü doğrula"}
              </Button>
              <Button variant="outlined" size="small" onClick={finansalTabloKaliciArsivHazirliginiYukle} disabled={kaliciArsivHazirligiYukleniyor}>
                {kaliciArsivHazirligiYukleniyor ? <CircularProgress size={18} /> : "DB geçiş hazırlığını kontrol et"}
              </Button>
              <Button variant="outlined" size="small" onClick={finansalTabloArsivleriniKarsilastir} disabled={arsivKarsilastirmaYukleniyor}>
                {arsivKarsilastirmaYukleniyor ? <CircularProgress size={18} /> : "DB/dosya arşivlerini karşılaştır"}
              </Button>
              {pilotDurumu && <Chip size="small" color={pilotDurumu.yeniMotorEtkin ? "success" : "default"} label={pilotDurumu.yeniMotorEtkin ? "Yeni motor etkin" : "Yeni motor kapalı"} />}
              {pilotDurumu && <Chip size="small" color={pilotDurumu.kgkTaramaZamanlayiciEtkin ? "success" : "default"} label={pilotDurumu.kgkTaramaZamanlayiciEtkin ? "KGK zamanlayıcı etkin" : "KGK zamanlayıcı kapalı"} />}
              {pilotDurumu && <Chip size="small" color={pilotDurumu.dbKaliciArsivEtkin ? "success" : "default"} label={pilotDurumu.dbKaliciArsivEtkin ? "DB kalıcı arşiv etkin" : "DB kalıcı arşiv kapalı"} />}
              {kaliciArsivDurumu && <Chip size="small" color={kaliciArsivDurumu.durum === "UYGULANMIS" ? "success" : kaliciArsivDurumu.durum === "KAPALI" ? "default" : "warning"} label={`Migration: ${kaliciArsivDurumu.durum}`} />}
              {pilotDurumu && <Chip size="small" variant="outlined" label={`Üretim deposu: ${pilotDurumu.uretimArsivDeposu}`} />}
              {pilotDurumu && <Chip size="small" variant="outlined" label={`KGK deposu: ${pilotDurumu.kgkCiktiArsivDeposu}`} />}
              {pilotDurumu && <Chip size="small" color={pilotDurumu.uretimArsiviEtkin && pilotDurumu.kgkCiktiArsiviEtkin ? "success" : "warning"} label={`Arşiv: ${sayi(pilotDurumu.uretimKayitSayisi)} üretim`} />}
            </Stack>
            {pilotDurumu && <Paper variant="outlined" sx={{ p: 1.25 }}>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Typography variant="caption" color="text.secondary">KGK tarama aralığı: {pilotDurumu.kgkTaramaAralikDakika} dk · maksimum deneme: {pilotDurumu.kgkTaramaMaksimumDeneme}</Typography>
                <Typography variant="caption" color="text.secondary">KGK çıktı arşivi: {pilotDurumu.kgkCiktiArsiviEtkin ? "hazır" : "kapalı"} · otomatik arşivleme: {pilotDurumu.kgkArsivle ? "açık" : "kapalı"}</Typography>
                <Typography variant="caption" color="text.secondary">Depolar: üretim {pilotDurumu.uretimArsivDeposu} · KGK {pilotDurumu.kgkCiktiArsivDeposu}</Typography>
                {pilotDurumu.sonUretimTarihi && <Typography variant="caption" color="text.secondary">Son üretim: {new Date(pilotDurumu.sonUretimTarihi).toLocaleString("tr-TR")}</Typography>}
              </Stack>
            </Paper>}
            {kaliciArsivDurumu && <Paper variant="outlined" sx={{ p: 1.25 }}>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap alignItems="center">
                <Chip size="small" color={kaliciArsivDurumu.migrationUygulanmisMi ? "success" : kaliciArsivDurumu.durum === "KAPALI" ? "default" : "warning"} label={kaliciArsivDurumu.migrationUygulanmisMi ? "Arşiv migration uygulandı" : kaliciArsivDurumu.durum === "KAPALI" ? "Arşiv migration kontrolü kapalı" : "Arşiv migration bekliyor"} />
                <Typography variant="caption" color="text.secondary">DB servisleri: {kaliciArsivDurumu.dbServisleriKayitliMi ? "kayıtlı" : "kayıtlı değil"} · Kontrol: {new Date(kaliciArsivDurumu.kontrolTarihi).toLocaleString("tr-TR")}</Typography>
              </Stack>
              {kaliciArsivDurumu.bekleyenMigrationlar.length > 0 && <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.75 }}>Bekleyen migration: {kaliciArsivDurumu.bekleyenMigrationlar.join(", ")}</Typography>}
            </Paper>}
            {arsivDogrulama && <Paper variant="outlined" sx={{ p: 1.25 }}>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap alignItems="center">
                <Chip size="small" color={arsivDogrulama.hataliKgkCiktiSayisi === 0 ? "success" : "error"} label={arsivDogrulama.hataliKgkCiktiSayisi === 0 ? "Arşiv bütünlüğü doğrulandı" : `${arsivDogrulama.hataliKgkCiktiSayisi} hatalı KGK çıktısı`} />
                <Typography variant="caption" color="text.secondary">{sayi(arsivDogrulama.dogrulananUretimSayisi)}/{sayi(arsivDogrulama.incelenenUretimSayisi)} üretim · {sayi(arsivDogrulama.dogrulananKgkCiktiSayisi)}/{sayi(arsivDogrulama.incelenenKgkCiktiSayisi)} KGK çıktısı doğrulandı</Typography>
                <Typography variant="caption" color="text.secondary">Kontrol: {new Date(arsivDogrulama.kontrolTarihi).toLocaleString("tr-TR")}</Typography>
              </Stack>
              {arsivDogrulama.kayitlar.some((kayit) => kayit.hata) && <Table size="small" sx={{ mt: 1 }}>
                <TableHead><TableRow><TableCell>Üretim</TableCell><TableCell>Hata</TableCell></TableRow></TableHead>
                <TableBody>{arsivDogrulama.kayitlar.filter((kayit) => kayit.hata).map((kayit) => <TableRow key={kayit.uretimId}><TableCell>{kayit.uretimId.slice(0, 8)}…</TableCell><TableCell>{kayit.hata}</TableCell></TableRow>)}</TableBody>
              </Table>}
            </Paper>}
            {kaliciArsivHazirligi && <Paper variant="outlined" sx={{ p: 1.25 }}>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap alignItems="center">
                <Chip size="small" color={kaliciArsivHazirligi.gecisIcinUygunMu ? "success" : "warning"} label={kaliciArsivHazirligi.gecisIcinUygunMu ? "DB geçişine hazır" : "DB geçişi öncesi sorun var"} />
                <Typography variant="caption" color="text.secondary">{sayi(kaliciArsivHazirligi.tasimaIcinHazirUretimSayisi)}/{sayi(kaliciArsivHazirligi.incelenenUretimSayisi)} üretim taşınmaya hazır</Typography>
                <Typography variant="caption" color="text.secondary">Eksik tekrar girdisi: {sayi(kaliciArsivHazirligi.eksikTekrarUretimIstegiSayisi)} · hash sorunu: {sayi(kaliciArsivHazirligi.hashEksigiSayisi)} · başarısız üretim: {sayi(kaliciArsivHazirligi.basarisizUretimSayisi)}</Typography>
              </Stack>
              {kaliciArsivHazirligi.sorunlar.length > 0 && <Table size="small" sx={{ mt: 1 }}>
                <TableHead><TableRow><TableCell>Üretim</TableCell><TableCell>Kod</TableCell><TableCell>Açıklama</TableCell></TableRow></TableHead>
                <TableBody>{kaliciArsivHazirligi.sorunlar.slice(0, 20).map((sorun, index) => <TableRow key={`${sorun.uretimId}-${sorun.kod}-${index}`}><TableCell>{sorun.uretimId.slice(0, 8)}…</TableCell><TableCell>{sorun.kod}</TableCell><TableCell>{sorun.aciklama}</TableCell></TableRow>)}</TableBody>
              </Table>}
            </Paper>}
            {arsivKarsilastirma && <Paper variant="outlined" sx={{ p: 1.25 }}>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap alignItems="center">
                <Chip size="small" color={arsivKarsilastirma.gecisIcinEslesikMi ? "success" : "warning"} label={arsivKarsilastirma.gecisIcinEslesikMi ? "DB/dosya arşivleri eşleşiyor" : "DB/dosya arşiv farkı var"} />
                <Typography variant="caption" color="text.secondary">{sayi(arsivKarsilastirma.eslesenUretimSayisi)}/{sayi(arsivKarsilastirma.incelenenUretimSayisi)} üretim eşleşti</Typography>
                <Typography variant="caption" color="text.secondary">Sadece DB: {sayi(arsivKarsilastirma.sadeceDbUretimSayisi)} · sadece dosya: {sayi(arsivKarsilastirma.sadeceDosyaUretimSayisi)}</Typography>
                <Typography variant="caption" color="text.secondary">Kimlik farkı: {sayi(arsivKarsilastirma.kimlikFarkiSayisi)} · KGK farkı: {sayi(arsivKarsilastirma.kgkFarkiSayisi)}</Typography>
              </Stack>
              {arsivKarsilastirma.kayitlar.some((kayit) => kayit.sorun) && <Table size="small" sx={{ mt: 1 }}>
                <TableHead><TableRow><TableCell>Üretim</TableCell><TableCell>Sorun</TableCell></TableRow></TableHead>
                <TableBody>{arsivKarsilastirma.kayitlar.filter((kayit) => kayit.sorun).slice(0, 20).map((kayit) => <TableRow key={kayit.uretimId}><TableCell>{kayit.uretimId.slice(0, 8)}…</TableCell><TableCell>{kayit.sorun}</TableCell></TableRow>)}</TableBody>
              </Table>}
            </Paper>}
            <Divider />
            <Typography variant="subtitle2">Legacy / yeni motor geçiş önizlemesi</Typography>
            <Alert severity="warning">
              Bu karşılaştırma salt-okunurdur; üretim veya arşiv kaydı oluşturmaz. Çalışması için API&#39;de <code>GolgeYeniMotorEtkin</code> bayrağı açık olmalıdır.
            </Alert>
            <TextField
              fullWidth
              size="small"
              multiline
              minRows={8}
              label="Gölge karşılaştırma isteği (JSON)"
              value={golgeKarsilastirmaJson}
              onChange={(event) => setGolgeKarsilastirmaJson(event.target.value)}
              helperText="Legacy paket/girdi hash'i, yayınlanmış tanım, tablo-dönem ve dönem eşleşmelerini admin kontrollü olarak girin."
            />
            <Stack direction="row" spacing={1} alignItems="center">
              <Button variant="outlined" size="small" onClick={finansalTabloGolgeKarsilastir} disabled={golgeKarsilastirmaYukleniyor}>
                {golgeKarsilastirmaYukleniyor ? <CircularProgress size={18} /> : "Gölge karşılaştırmasını çalıştır"}
              </Button>
              {golgeKarsilastirmaSonucu && <Chip size="small" color={golgeKarsilastirmaSonucu.basariliMi ? "success" : "warning"} label={golgeKarsilastirmaSonucu.basariliMi ? "Karşılaştırma tamamlandı" : `Karşılaştırma durumu ${golgeKarsilastirmaSonucu.durum}`} />}
            </Stack>
            {golgeKarsilastirmaSonucu?.karsilastirma && <Paper variant="outlined" sx={{ p: 1.25, maxHeight: 300, overflow: "auto" }}>
              <Typography variant="caption" color="text.secondary">
                Mutabakat: {golgeKarsilastirmaSonucu.karsilastirma.ozet?.eslesenAnahtarSayisi ?? 0}/{golgeKarsilastirmaSonucu.karsilastirma.ozet?.birlesikAnahtarSayisi ?? 0} anahtar · SHA-256: {golgeKarsilastirmaSonucu.karsilastirma.sonucSha256?.slice(0, 16) || "-"}
              </Typography>
              {golgeKarsilastirmaSonucu.karsilastirma.farklar.length > 0 && <Table size="small" sx={{ mt: 1 }}>
                <TableHead><TableRow><TableCell>Anahtar</TableCell><TableCell>Sınıf</TableCell><TableCell align="right">Mutlak fark</TableCell></TableRow></TableHead>
                <TableBody>{golgeKarsilastirmaSonucu.karsilastirma.farklar.slice(0, 50).map((fark, index) => <TableRow key={`${fark.anahtar.hedefSabitAnahtari}-${index}`}><TableCell>{fark.anahtar.tabloSabitAnahtari} · {fark.anahtar.hedefSabitAnahtari} · {fark.anahtar.donemSabitAnahtari}</TableCell><TableCell>{fark.sinif}</TableCell><TableCell align="right">{fark.mutlakFark?.toLocaleString("tr-TR") || "-"}</TableCell></TableRow>)}</TableBody>
              </Table>}
            </Paper>}
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            <Button variant="outlined" size="small" onClick={finansalTabloGecmisiniYukle} disabled={uretimGecmisiYukleniyor}>
              {uretimGecmisiYukleniyor ? <CircularProgress size={18} /> : "Üretim geçmişini yükle"}
            </Button>
            {uretimGecmisi.length > 0 && <Chip size="small" label={`${uretimGecmisi.length} üretim kaydı`} />}
          </Stack>
          {uretimGecmisi.length > 0 && (
            <Paper variant="outlined" sx={{ p: 1.5, maxHeight: 280, overflow: "auto" }}>
              <Table size="small">
                <TableHead><TableRow><TableCell>Tarih</TableCell><TableCell>Tablo / dönem</TableCell><TableCell>Sürüm</TableCell><TableCell>Durum</TableCell><TableCell>Üretim</TableCell></TableRow></TableHead>
                <TableBody>{uretimGecmisi.map((aday) => <TableRow key={aday.kayit.uretimId} hover onClick={() => setUretimSonucu({ arsivYolu: aday.arsivYolu, arsivKaydiYeniMi: aday.yeniMi, kayit: aday.kayit })} sx={{ cursor: "pointer" }}><TableCell>{new Date(aday.kayit.bitisTarihi).toLocaleString("tr-TR")}</TableCell><TableCell>{aday.kayit.tabloSabitAnahtari} · {aday.kayit.donemSabitAnahtari}</TableCell><TableCell>{aday.kayit.tanimSurumu}</TableCell><TableCell><Chip size="small" color={aday.kayit.durum === 1 ? "success" : "warning"} label={aday.kayit.durum === 1 ? "Başarılı" : `Durum ${aday.kayit.durum}`} /></TableCell><TableCell>{aday.kayit.uretimId.slice(0, 8)}…</TableCell></TableRow>)}</TableBody>
              </Table>
            </Paper>
          )}
          <Grid container spacing={1.5}>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Tablo</InputLabel>
                <Select label="Tablo" value={secilenKalemTablosu?.id || ""} onChange={(event) => setKalemTabloId(Number(event.target.value))}>
                  {(surumDetayi?.tablolar || []).map((tablo) => <MenuItem key={tablo.id} value={tablo.id}>{tablo.kod} · {tablo.ad}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Dönem</InputLabel>
                <Select label="Dönem" value={uretimDonemAnahtari} onChange={(event) => setUretimDonemAnahtari(String(event.target.value))}>
                  {(secilenKalemTablosu?.donemKolonlari || []).map((donem) => <MenuItem key={donem.sabitAnahtar} value={donem.sabitAnahtar}>{donem.ad} · {donem.sabitAnahtar}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField fullWidth size="small" label="Girdi anahtarı" value={uretimGirdiAnahtari} onChange={(event) => setUretimGirdiAnahtari(event.target.value)} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField fullWidth size="small" label="Girdi SHA-256" value={uretimGirdiSha256} onChange={(event) => setUretimGirdiSha256(event.target.value)} inputProps={{ maxLength: 64 }} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField fullWidth size="small" type="number" label="Denetlenen ID" value={uretimDenetlenenId} onChange={(event) => setUretimDenetlenenId(event.target.value)} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField fullWidth size="small" type="number" label="Yıl" value={uretimYil} onChange={(event) => setUretimYil(event.target.value)} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField fullWidth size="small" type="number" label="Denetçi ID (isteğe bağlı)" value={uretimDenetciId} onChange={(event) => setUretimDenetciId(event.target.value)} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField fullWidth size="small" label="Tanım snapshot SHA-256 (isteğe bağlı)" value={uretimSnapshotSha256} onChange={(event) => setUretimSnapshotSha256(event.target.value)} inputProps={{ maxLength: 64 }} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField fullWidth size="small" type="date" label="Dönem başlangıcı" value={uretimBaslangic} onChange={(event) => setUretimBaslangic(event.target.value)} InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField fullWidth size="small" type="date" label="Dönem bitişi" value={uretimBitis} onChange={(event) => setUretimBitis(event.target.value)} InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Stack direction="row" spacing={0.5} alignItems="center" sx={{ height: "100%" }}>
                <Switch size="small" checked={uretimKonsolide} onChange={(event) => setUretimKonsolide(event.target.checked)} />
                <Typography variant="body2">Konsolide</Typography>
              </Stack>
            </Grid>
          </Grid>
          <Stack direction="row" spacing={1} alignItems="center">
            <Button variant="contained" size="small" onClick={finansalTabloUret} disabled={uretimYukleniyor || !secilenSurum || !secilenKalemTablosu}>
              {uretimYukleniyor ? <CircularProgress size={18} color="inherit" /> : "Finansal tablo üret"}
            </Button>
            {uretimSonucu?.kayit.uretimId && <Button variant="outlined" size="small" onClick={finansalTabloyuTekrarUret} disabled={uretimTekrarYukleniyor}>
              {uretimTekrarYukleniyor ? <CircularProgress size={18} color="inherit" /> : "Bu üretimi tekrar çalıştır"}
            </Button>}
            {uretimSonucu && <Chip size="small" color={uretimSonucu.kayit.durum === 1 ? "success" : "error"} label={uretimSonucu.kayit.durum === 1 ? `Üretim arşivlendi · ${uretimSonucu.kayit.uretimId}` : `Üretim durumu: ${uretimSonucu.kayit.durum}`} />}
          </Stack>
          {uretimSonucu?.kayit.degerler?.length ? (
            <Paper variant="outlined" sx={{ p: 1.5, maxHeight: 260, overflow: "auto" }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Üretilen değerler</Typography>
              <Table size="small">
                <TableHead><TableRow><TableCell>Hedef</TableCell><TableCell align="right">Değer</TableCell></TableRow></TableHead>
                <TableBody>{uretimSonucu.kayit.degerler.slice(0, 100).map((deger) => <TableRow key={`${deger.hedefTuru}-${deger.hedefSabitAnahtari}`}><TableCell>{deger.hedefSabitAnahtari}</TableCell><TableCell align="right">{deger.deger.toLocaleString("tr-TR")}</TableCell></TableRow>)}</TableBody>
              </Table>
            </Paper>
          ) : null}
          <Divider />
          <Typography variant="subtitle2">KGK workbook çıktısı</Typography>
          <Typography variant="caption" color="text.secondary">
            Bu üretimdeki değerleri, admin tarafından belirlenen sayfa/hücre eşleşmelerine göre KGK şablonuna yazar. Makrolar çalıştırılmaz; çıktı SHA-256 ile arşivlenir.
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
            <Button component="label" size="small" variant="outlined">
              {kgkRenderSablon?.name || "KGK şablonu (.xlsx/.xlsm)"}
              <input hidden type="file" accept=".xlsx,.xlsm" onChange={(event) => setKgkRenderSablon(event.target.files?.[0] || null)} />
            </Button>
            <Button variant="contained" size="small" onClick={kgkFinansalTabloRenderEt} disabled={!uretimSonucu || !kgkRenderSablon || kgkRenderYukleniyor}>
              {kgkRenderYukleniyor ? <CircularProgress size={18} color="inherit" /> : "KGK çıktısı oluştur ve indir"}
            </Button>
            {kgkRenderSonucu && <Chip size="small" color="success" label={`İndirildi · SHA ${kgkRenderSonucu.sha256?.slice(0, 12) || "-"}`} />}
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            <Button variant="outlined" size="small" onClick={kgkArsivCiktilariniYukle} disabled={!uretimSonucu || kgkArsivCiktilariYukleniyor}>
              {kgkArsivCiktilariYukleniyor ? <CircularProgress size={18} /> : "Arşivlenmiş KGK çıktıları"}
            </Button>
            {kgkArsivCiktilari.length > 0 && <Chip size="small" label={`${kgkArsivCiktilari.length} çıktı`} />}
          </Stack>
          {kgkArsivCiktilari.length > 0 && <Paper variant="outlined" sx={{ p: 1.5, maxHeight: 240, overflow: "auto" }}>
            <Table size="small">
              <TableHead><TableRow><TableCell>Dosya</TableCell><TableCell>Tarih</TableCell><TableCell>SHA-256</TableCell><TableCell /></TableRow></TableHead>
              <TableBody>{kgkArsivCiktilari.map((kayit) => <TableRow key={kayit.ciktiSha256}><TableCell>{kayit.ciktiDosyaAdi}</TableCell><TableCell>{new Date(kayit.arsivlemeTarihi).toLocaleString("tr-TR")}</TableCell><TableCell>{kayit.ciktiSha256.slice(0, 12)}…</TableCell><TableCell align="right"><Button size="small" variant="text" onClick={() => kgkArsivCiktisiIndir(kayit)} disabled={kgkArsivIndirilenSha === kayit.ciktiSha256}>{kgkArsivIndirilenSha === kayit.ciktiSha256 ? <CircularProgress size={16} /> : "İndir"}</Button></TableCell></TableRow>)}</TableBody>
            </Table>
          </Paper>}
          <TextField
            fullWidth
            size="small"
            multiline
            minRows={3}
            label="KGK sayfa/hücre eşleştirmeleri (JSON)"
            value={kgkRenderEslesmeler}
            onChange={(event) => setKgkRenderEslesmeler(event.target.value)}
            helperText="hedefTuru, hedefSabitAnahtari, sayfaAdi ve hucreAdresi alanlarını kullanın."
          />
        </Stack>
      </ParentCard>
      <ParentCard title="Sürüm ve tanım görünümü">
        <Stack spacing={2}>
          <Typography variant="body2" color="text.secondary">
            Yayındaki ve taslak tanımları standart, kapsam ve dönüşüm tipine göre filtreleyin. Bu okuma modeli bir sonraki adımda taslak tanım editörünün kaynağıdır.
          </Typography>
          <Grid container spacing={1.5}>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Raporlama standardı</InputLabel>
                <Select label="Raporlama standardı" value={tanimFiltresi.raporlamaStandardi} onChange={(event) => setTanimFiltresi((onceki) => ({ ...onceki, raporlamaStandardi: Number(event.target.value) }))}>
                  <MenuItem value={0}>Tümü</MenuItem><MenuItem value={1}>BOBİ FRS</MenuItem><MenuItem value={2}>TFRS</MenuItem><MenuItem value={3}>KÜMİ FRS</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Kapsam</InputLabel>
                <Select label="Kapsam" value={tanimFiltresi.kapsam} onChange={(event) => setTanimFiltresi((onceki) => ({ ...onceki, kapsam: Number(event.target.value) }))}>
                  <MenuItem value={0}>Tümü</MenuItem><MenuItem value={1}>Münferit</MenuItem><MenuItem value={2}>Konsolide</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Dönüşüm tipi</InputLabel>
                <Select label="Dönüşüm tipi" value={tanimFiltresi.donusumTipi} onChange={(event) => setTanimFiltresi((onceki) => ({ ...onceki, donusumTipi: Number(event.target.value) }))}>
                  <MenuItem value={0}>Tümü</MenuItem><MenuItem value={1}>Normal</MenuItem><MenuItem value={2}>Enflasyon düzeltilmiş</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Durum</InputLabel>
                <Select label="Durum" value={tanimFiltresi.aktifMi ? 1 : 0} onChange={(event) => setTanimFiltresi((onceki) => ({ ...onceki, aktifMi: Number(event.target.value) === 1 }))}>
                  <MenuItem value={1}>Aktif setler</MenuItem><MenuItem value={0}>Pasif setler</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          {tanimHatasi && <Alert severity="error">{tanimHatasi}</Alert>}
          {tanimYukleniyor && <CircularProgress size={22} />}
          {!tanimYukleniyor && tanimSetleri.length === 0 && <Alert severity="info">Filtreye uyan tanım seti bulunamadı.</Alert>}
          {tanimSetleri.length > 0 && (
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Tanım seti</InputLabel>
                  <Select label="Tanım seti" value={secilenSetId} onChange={(event) => { const id = Number(event.target.value); const set = tanimSetleri.find((aday) => aday.id === id); const surum = set?.surumler?.[0]; setSecilenSetId(id); setSecilenSurumId(surum?.id || 0); setSurumId(surum ? String(surum.id) : ""); setEszamanlilikSurumu(surum ? String(surum.eszamanlilikSurumu) : ""); }}>
                    {tanimSetleri.map((set) => <MenuItem key={set.id} value={set.id}>{set.kod} — {set.ad}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={8}>
                <FormControl fullWidth size="small">
                  <InputLabel>Sürüm</InputLabel>
                  <Select label="Sürüm" value={secilenSurumId} onChange={(event) => { const id = Number(event.target.value); const surum = secilenSet?.surumler.find((aday) => aday.id === id); setSecilenSurumId(id); setSurumId(surum ? String(surum.id) : ""); setEszamanlilikSurumu(surum ? String(surum.eszamanlilikSurumu) : ""); }}>
                    {(secilenSet?.surumler || []).map((surum) => <MenuItem key={surum.id} value={surum.id}>{surum.etiket} · #{surum.surumNo} · {surum.durum === 3 ? "Yayında" : surum.durum === 1 ? "Taslak" : surum.durum === 2 ? "Doğrulandı" : "Kaldırıldı"}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          )}
          {secilenSurum && (
            <Paper variant="outlined" sx={{ p: 1.5 }}>
              <Stack spacing={1.5}>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  <Chip label={`Sürüm ${secilenSurum.surumNo} · ${secilenSurum.etiket}`} color={secilenSurum.durum === 3 ? "success" : "default"} />
                  <Chip label={`Eşzamanlılık ${secilenSurum.eszamanlilikSurumu}`} variant="outlined" />
                  <Chip label={`${secilenSurum.tabloSayisi} tablo · ${secilenSurum.kalemSayisi} kalem · ${secilenSurum.formulSayisi} formül`} variant="outlined" />
                  <Button size="small" variant="outlined" onClick={taslakKlonla} disabled={surumIslemiYukleniyor}>Taslağa klonla</Button>
                  {secilenSurum.durum === 1 && <>
                    <Button size="small" variant="outlined" onClick={() => setMetaDuzenleme((onceki) => !onceki)}>{metaDuzenleme ? "Düzenlemeyi kapat" : "Sürüm metadata düzenle"}</Button>
                    <Button size="small" variant="contained" color="secondary" onClick={teknikDogrula} disabled={dogrulamaYukleniyor}>
                      {dogrulamaYukleniyor ? <CircularProgress size={16} color="inherit" /> : "Teknik doğrula"}
                    </Button>
                    <Button size="small" variant="contained" color="success" onClick={taslagiYayinla} disabled={surumIslemiYukleniyor}>Yayınla</Button>
                  </>}
                </Stack>
                {metaDuzenleme && secilenSurum.durum === 1 && (
                  <Paper variant="outlined" sx={{ p: 1.5, bgcolor: "action.hover" }}>
                    <Grid container spacing={1.5}>
                      <Grid item xs={12} md={4}><TextField fullWidth size="small" label="Sürüm etiketi" value={metaEtiket} onChange={(event) => setMetaEtiket(event.target.value)} inputProps={{ maxLength: 100 }} /></Grid>
                      <Grid item xs={12} md={4}><TextField fullWidth size="small" type="date" label="Geçerlilik başlangıcı" value={metaBaslangic} onChange={(event) => setMetaBaslangic(event.target.value)} InputLabelProps={{ shrink: true }} /></Grid>
                      <Grid item xs={12} md={4}><TextField fullWidth size="small" type="date" label="Geçerlilik bitişi" value={metaBitis} onChange={(event) => setMetaBitis(event.target.value)} InputLabelProps={{ shrink: true }} /></Grid>
                      <Grid item xs={12}><TextField fullWidth size="small" multiline minRows={2} label="Açıklama" value={metaAciklama} onChange={(event) => setMetaAciklama(event.target.value)} inputProps={{ maxLength: 1000 }} /></Grid>
                      <Grid item xs={12}><Stack direction="row" spacing={1}><Button variant="contained" size="small" onClick={metaKaydet} disabled={metaKaydediliyor || !metaEtiket.trim() || !metaBaslangic}>{metaKaydediliyor ? <CircularProgress size={18} color="inherit" /> : "Taslak metadata kaydet"}</Button><Button size="small" onClick={() => setMetaDuzenleme(false)} disabled={metaKaydediliyor}>İptal</Button></Stack></Grid>
                    </Grid>
                  </Paper>
                )}
                {dogrulamaSonucu && (
                  <Paper variant="outlined" sx={{ p: 1.5, bgcolor: "action.hover" }}>
                    <Stack spacing={1}>
                      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                        <Chip
                          label={dogrulamaSonucu.gecerliMi ? "Teknik doğrulama başarılı" : "Teknik doğrulama hatalı"}
                          color={dogrulamaSonucu.gecerliMi ? "success" : "error"}
                        />
                        <Typography variant="caption" color="text.secondary">
                          Eşzamanlılık sürümü: {dogrulamaSonucu.eszamanlilikSurumu}
                        </Typography>
                      </Stack>
                      {dogrulamaSonucu.tablolar.map((tablo) => (
                        <Box key={tablo.tabloId}>
                          <Typography variant="body2" fontWeight={600}>
                            {tablo.tabloKod}: {tablo.gecerliMi ? "geçerli" : "düzeltilmeli"}
                          </Typography>
                          {tablo.sorunlar.map((sorun, index) => (
                            <Alert key={`${tablo.tabloId}-${sorun.kod}-${index}`} severity="error" sx={{ mt: 0.5 }}>
                              <strong>{sorun.kod}</strong> · {sorun.konum} — {sorun.aciklama}
                            </Alert>
                          ))}
                        </Box>
                      ))}
                    </Stack>
                  </Paper>
                )}
                {secilenSet && secilenSet.surumler.length > 1 && (
                  <Paper variant="outlined" sx={{ p: 1.5, bgcolor: "action.hover" }}>
                    <Stack spacing={1.5}>
                      <Typography variant="subtitle2">Sürüm karşılaştırma</Typography>
                      <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems={{ sm: "center" }}>
                        <FormControl size="small" sx={{ minWidth: 280 }}>
                          <InputLabel>Karşılaştırılacak sürüm</InputLabel>
                          <Select label="Karşılaştırılacak sürüm" value={karsilastirmaSurumId} onChange={(event) => setKarsilastirmaSurumId(Number(event.target.value))}>
                            <MenuItem value={0}>Sürüm seçin</MenuItem>
                            {secilenSet.surumler.filter((surum) => surum.id !== secilenSurum.id).map((surum) => <MenuItem key={surum.id} value={surum.id}>{surum.etiket} · #{surum.surumNo}</MenuItem>)}
                          </Select>
                        </FormControl>
                        <Button size="small" variant="outlined" onClick={surumleriKarsilastir} disabled={!karsilastirmaSurumId || karsilastirmaYukleniyor}>
                          {karsilastirmaYukleniyor ? <CircularProgress size={16} /> : "Karşılaştır"}
                        </Button>
                        {karsilastirmaSonucu && <Chip size="small" label={`${karsilastirmaSonucu.farkSayisi} fark`} color={karsilastirmaSonucu.farkSayisi ? "warning" : "success"} />}
                      </Stack>
                      {karsilastirmaSonucu && (
                        karsilastirmaSonucu.farkSayisi === 0
                          ? <Alert severity="success">Seçilen iki sürümün tanımları aynı.</Alert>
                          : <Box sx={{ overflowX: "auto", maxHeight: 320 }}><Table size="small"><TableHead><TableRow><TableCell>Nesne</TableCell><TableCell>Anahtar</TableCell><TableCell>Değişiklik</TableCell><TableCell>Eski değer</TableCell><TableCell>Yeni değer</TableCell></TableRow></TableHead><TableBody>{karsilastirmaSonucu.farklar.map((fark, index) => <TableRow key={`${fark.nesneTuru}-${fark.anahtar}-${index}`}><TableCell>{fark.nesneTuru}</TableCell><TableCell>{fark.anahtar}</TableCell><TableCell>{fark.degisiklikTuru}</TableCell><TableCell sx={{ maxWidth: 360, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{fark.solDeger || "—"}</TableCell><TableCell sx={{ maxWidth: 360, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{fark.sagDeger || "—"}</TableCell></TableRow>)}</TableBody></Table></Box>
                      )}
                    </Stack>
                  </Paper>
                )}
                {surumDetayi && (
                  <Box sx={{ overflowX: "auto" }}>
                    <Table size="small"><TableHead><TableRow><TableCell>Tablo</TableCell><TableCell>Tür</TableCell><TableCell align="right">Dönem</TableCell><TableCell align="right">Kalem</TableCell><TableCell align="right">Formül</TableCell><TableCell align="right">Kontrol</TableCell></TableRow></TableHead>
                      <TableBody>{surumDetayi.tablolar.map((tablo) => <TableRow key={tablo.id} hover><TableCell><strong>{tablo.kod}</strong><br /><Typography variant="caption" color="text.secondary">{tablo.ad}</Typography></TableCell><TableCell>{tablo.tabloTuru === 1 ? "Finansal durum" : tablo.tabloTuru === 2 ? "Kâr/zarar" : tablo.tabloTuru === 4 ? "Nakit akış" : tablo.tabloTuru === 5 ? "Özkaynak" : "Kapsamlı gelir"}</TableCell><TableCell align="right">{tablo.donemKolonlari.length}</TableCell><TableCell align="right">{tablo.kalemler.length}</TableCell><TableCell align="right">{tablo.kurallar.length}</TableCell><TableCell align="right">{tablo.kontrolKurallari.length}</TableCell></TableRow>)}</TableBody>
                    </Table>
                  </Box>
                )}
                {surumDetayi && secilenSurum.durum === 1 && secilenKalemTablosu && (
                  <Paper variant="outlined" sx={{ p: 1.5, bgcolor: "action.hover" }}>
                    <Stack spacing={1.5}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="subtitle2" sx={{ flexGrow: 1 }}>Taslak kalem düzenleyici</Typography>
                      </Stack>
                      <Alert severity="info" variant="outlined">
                        Kalem ekleme veya kaldırma elle yapılmaz. KGK Excel sürümleri arasındaki farktan tespit edilen kalemler taslak sürüme aktarılır; bu ekran yalnızca gelen taslağın metadata ve formül incelemesi içindir.
                      </Alert>
                      <FormControl size="small" fullWidth>
                        <InputLabel>Tablo</InputLabel>
                        <Select label="Tablo" value={secilenKalemTablosu.id} onChange={(event) => { setKalemTabloId(Number(event.target.value)); setDuzenlenenKalemId(0); }}>
                          {surumDetayi.tablolar.map((tablo) => <MenuItem key={tablo.id} value={tablo.id}>{tablo.kod} — {tablo.ad}</MenuItem>)}
                        </Select>
                      </FormControl>
                      <Table size="small">
                        <TableHead><TableRow><TableCell>Sabit anahtar</TableCell><TableCell>Kalem</TableCell><TableCell align="right">Sıra</TableCell><TableCell>Durum</TableCell><TableCell align="right">İşlem</TableCell></TableRow></TableHead>
                        <TableBody>
                          {secilenKalemTablosu.kalemler.map((kalem) => (
                            <TableRow key={kalem.id} hover>
                              <TableCell>{kalem.sabitAnahtar}</TableCell>
                              <TableCell>{kalem.ad}{kalem.kod ? ` (${kalem.kod})` : ""}</TableCell>
                              <TableCell align="right">{kalem.sira}</TableCell>
                              <TableCell>{kalem.aktifMi ? "Aktif" : "Pasif"}</TableCell>
                              <TableCell align="right"><Button size="small" onClick={() => kalemDuzenle(kalem)}>Düzenle</Button></TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                      {duzenlenenKalemId > 0 && (
                        <Grid container spacing={1.5}>
                          <Grid item xs={12} md={4}><TextField fullWidth size="small" label="Kalem adı" value={kalemForm.ad} onChange={(event) => setKalemForm((onceki) => ({ ...onceki, ad: event.target.value }))} /></Grid>
                          <Grid item xs={12} md={3}><TextField fullWidth size="small" label="Kod" value={kalemForm.kod} onChange={(event) => setKalemForm((onceki) => ({ ...onceki, kod: event.target.value }))} /></Grid>
                          <Grid item xs={12} md={2}><TextField fullWidth size="small" type="number" label="Sıra" value={kalemForm.sira} onChange={(event) => setKalemForm((onceki) => ({ ...onceki, sira: Number(event.target.value) }))} /></Grid>
                          <Grid item xs={12} md={3}>
                            <FormControl size="small" fullWidth><InputLabel>Üst kalem</InputLabel><Select label="Üst kalem" value={kalemForm.ustKalemId} onChange={(event) => setKalemForm((onceki) => ({ ...onceki, ustKalemId: Number(event.target.value) }))}><MenuItem value={0}>Yok</MenuItem>{secilenKalemTablosu.kalemler.filter((kalem) => kalem.id !== duzenlenenKalemId).map((kalem) => <MenuItem key={kalem.id} value={kalem.id}>{kalem.sabitAnahtar}</MenuItem>)}</Select></FormControl>
                          </Grid>
                          <Grid item xs={12} md={3}>
                            <FormControl size="small" fullWidth><InputLabel>Kalem türü</InputLabel><Select label="Kalem türü" value={kalemForm.kalemTuru} onChange={(event) => setKalemForm((onceki) => ({ ...onceki, kalemTuru: Number(event.target.value) }))}><MenuItem value={1}>Başlık</MenuItem><MenuItem value={2}>Veri</MenuItem><MenuItem value={3}>Ara toplam</MenuItem><MenuItem value={4}>Toplam</MenuItem><MenuItem value={5}>Manuel</MenuItem></Select></FormControl>
                          </Grid>
                          <Grid item xs={12} md={3}>
                            <FormControl size="small" fullWidth><InputLabel>Eksen</InputLabel><Select label="Eksen" value={kalemForm.eksen} onChange={(event) => setKalemForm((onceki) => ({ ...onceki, eksen: Number(event.target.value) }))}><MenuItem value={1}>Satır</MenuItem><MenuItem value={2}>Dikey</MenuItem><MenuItem value={3}>Yatay</MenuItem></Select></FormControl>
                          </Grid>
                          <Grid item xs={12} md={3}>
                            <FormControl size="small" fullWidth><InputLabel>Görünürlük</InputLabel><Select label="Görünürlük" value={kalemForm.varsayilanGorunurMu ? 1 : 0} onChange={(event) => setKalemForm((onceki) => ({ ...onceki, varsayilanGorunurMu: Number(event.target.value) === 1 }))}><MenuItem value={1}>Görünür</MenuItem><MenuItem value={0}>Gizli</MenuItem></Select></FormControl>
                          </Grid>
                          <Grid item xs={12}><Stack direction="row" spacing={1}><Button variant="contained" size="small" onClick={kalemKaydet} disabled={kalemKaydediliyor || !kalemForm.ad.trim()}>{kalemKaydediliyor ? <CircularProgress size={18} color="inherit" /> : "Kalemi kaydet"}</Button><Button size="small" onClick={() => setDuzenlenenKalemId(0)} disabled={kalemKaydediliyor}>İptal</Button></Stack></Grid>
                        </Grid>
                      )}
                    </Stack>
                  </Paper>
                )}
                {surumDetayi && secilenSurum.durum === 1 && secilenKalemTablosu && (
                  <Paper variant="outlined" sx={{ p: 1.5, bgcolor: "action.hover" }}>
                    <Stack spacing={1.5}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="subtitle2" sx={{ flexGrow: 1 }}>Yapılandırılmış kural editörü</Typography>
                        <Button size="small" variant="outlined" onClick={yeniKuralBaslat}>{yeniKuralAcik ? "Yeni kuralı kapat" : "Yeni kural"}</Button>
                      </Stack>
                      <FormControl size="small" fullWidth>
                        <InputLabel>Kural</InputLabel>
                        <Select label="Kural" value={duzenlenenKuralId} onChange={(event) => { const id = Number(event.target.value); const kural = secilenKalemTablosu.kurallar.find((aday) => aday.id === id); if (kural) kuralDuzenle(kural); }}>
                          <MenuItem value={0}>Kural seçin</MenuItem>
                          {secilenKalemTablosu.kurallar.map((kural) => <MenuItem key={kural.id} value={kural.id}>#{kural.id} · {kural.kalemId ? `Kalem ${kural.kalemId}` : `Hücre ${kural.hucreId}`}</MenuItem>)}
                        </Select>
                      </FormControl>
                      {yeniKuralAcik && (
                        <FormControl size="small" fullWidth>
                          <InputLabel>Hedef kalem</InputLabel>
                          <Select label="Hedef kalem" value={yeniKuralKalemId} onChange={(event) => setYeniKuralKalemId(Number(event.target.value))}>
                            <MenuItem value={0}>Kalem seçin</MenuItem>
                            {secilenKalemTablosu.kalemler.filter((kalem) => !secilenKalemTablosu.kurallar.some((kural) => kural.kalemId === kalem.id)).map((kalem) => <MenuItem key={kalem.id} value={kalem.id}>{kalem.sabitAnahtar} — {kalem.ad}</MenuItem>)}
                          </Select>
                        </FormControl>
                      )}
                      {(duzenlenenKuralId > 0 || yeniKuralAcik) && (
                        <Grid container spacing={1.5}>
                          <Grid item xs={12} md={3}><FormControl size="small" fullWidth><InputLabel>Hesaplama türü</InputLabel><Select label="Hesaplama türü" value={kuralForm.hesaplamaTuru} onChange={(event) => setKuralForm((onceki) => ({ ...onceki, hesaplamaTuru: Number(event.target.value) }))}><MenuItem value={1}>Hesap formülü</MenuItem><MenuItem value={2}>Satır formülü</MenuItem><MenuItem value={3}>Alt kalem toplamı</MenuItem><MenuItem value={4}>Sabit değer</MenuItem><MenuItem value={5}>Manuel değer</MenuItem></Select></FormControl></Grid>
                          <Grid item xs={12} md={3}><FormControl size="small" fullWidth><InputLabel>İşaret politikası</InputLabel><Select label="İşaret politikası" value={kuralForm.isaretPolitikasi} onChange={(event) => setKuralForm((onceki) => ({ ...onceki, isaretPolitikasi: Number(event.target.value) }))}><MenuItem value={1}>Olduğu gibi</MenuItem><MenuItem value={2}>Mutlak değer</MenuItem><MenuItem value={3}>Yalnız pozitif</MenuItem><MenuItem value={4}>Yalnız negatif</MenuItem><MenuItem value={5}>Ters işaret</MenuItem></Select></FormControl></Grid>
                          <Grid item xs={12} md={3}><FormControl size="small" fullWidth><InputLabel>Boş değer</InputLabel><Select label="Boş değer" value={kuralForm.bosDegerPolitikasi} onChange={(event) => setKuralForm((onceki) => ({ ...onceki, bosDegerPolitikasi: Number(event.target.value) }))}><MenuItem value={1}>Sıfır kabul et</MenuItem><MenuItem value={2}>Uyarı</MenuItem><MenuItem value={3}>Hata</MenuItem></Select></FormControl></Grid>
                          <Grid item xs={12} md={3}><TextField fullWidth size="small" label="Sabit değer" type="number" value={kuralForm.sabitDeger} onChange={(event) => setKuralForm((onceki) => ({ ...onceki, sabitDeger: event.target.value }))} disabled={kuralForm.hesaplamaTuru !== 4} /></Grid>
                          <Grid item xs={12} md={6}><TextField fullWidth size="small" label="Ham formül" value={kuralForm.hamFormul} onChange={(event) => setKuralForm((onceki) => ({ ...onceki, hamFormul: event.target.value }))} /></Grid>
                          <Grid item xs={12} md={6}><TextField fullWidth size="small" label="KGK Excel hedefi" value={kuralForm.kgkExcelHedefi} onChange={(event) => setKuralForm((onceki) => ({ ...onceki, kgkExcelHedefi: event.target.value }))} /></Grid>
                          <Grid item xs={12}><TextField fullWidth size="small" multiline minRows={2} label="Açıklama" value={kuralForm.aciklama} onChange={(event) => setKuralForm((onceki) => ({ ...onceki, aciklama: event.target.value }))} /></Grid>
                          <Grid item xs={12}><Typography variant="caption" color="text.secondary">Terimler (kaynak anahtarı ve katsayı)</Typography></Grid>
                          {kuralForm.terimler.map((terim, index) => (
                            <Grid item xs={12} md={6} key={terim.sira}>
                              <Stack direction="row" spacing={1}>
                                <TextField size="small" label={`Terim ${index + 1}`} fullWidth value={terim.kaynakAnahtari} onChange={(event) => setKuralForm((onceki) => ({ ...onceki, terimler: onceki.terimler.map((aday, adayIndex) => adayIndex === index ? { ...aday, kaynakAnahtari: event.target.value } : aday) }))} />
                                <TextField size="small" label="Katsayı" type="number" sx={{ width: 130 }} value={terim.katsayi} onChange={(event) => setKuralForm((onceki) => ({ ...onceki, terimler: onceki.terimler.map((aday, adayIndex) => adayIndex === index ? { ...aday, katsayi: Number(event.target.value) } : aday) }))} />
                              </Stack>
                            </Grid>
                          ))}
                          <Grid item xs={12}><Stack direction="row" spacing={1}><Button variant="contained" size="small" onClick={yeniKuralAcik ? kuralOlustur : kuralKaydet} disabled={kuralKaydediliyor || (yeniKuralAcik && !yeniKuralKalemId)}>{kuralKaydediliyor ? <CircularProgress size={18} color="inherit" /> : yeniKuralAcik ? "Yeni kuralı kaydet" : "Kuralı kaydet"}</Button><Button size="small" onClick={() => { setDuzenlenenKuralId(0); setYeniKuralAcik(false); }} disabled={kuralKaydediliyor}>İptal</Button></Stack></Grid>
                        </Grid>
                      )}
                    </Stack>
                  </Paper>
                )}
              </Stack>
            </Paper>
          )}
        </Stack>
      </ParentCard>
      <ParentCard title="Legacy paket önizleme ve uygulama">
        <Stack spacing={3}>
          <Alert severity="info">
            Yayınlanmış sürüm değiştirilmez. Paket önce önizlenir; uyarı varsa
            uygulama için açıklamalı admin onayı gerekir.
          </Alert>

          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                size="small"
                label="Taslak sürüm ID"
                type="number"
                value={surumId}
                onChange={(event) => setSurumId(event.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                size="small"
                label="Beklenen eşzamanlılık sürümü"
                type="number"
                value={eszamanlilikSurumu}
                onChange={(event) => setEszamanlilikSurumu(event.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Button component="label" variant="outlined" fullWidth sx={{ height: 40 }}>
                {paketDosyaAdi || "Paket JSON seç"}
                <input hidden type="file" accept="application/json,.json" onChange={(event) => dosyaSecildi(event, "paket")} />
              </Button>
            </Grid>
            <Grid item xs={12} md={4}>
              <Button component="label" variant="outlined" fullWidth sx={{ height: 40 }}>
                {manifestDosyaAdi || "Manifest JSON seç"}
                <input hidden type="file" accept="application/json,.json" onChange={(event) => dosyaSecildi(event, "manifest")} />
              </Button>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                size="small"
                label="Kaynak SHA-256"
                value={kaynakSha256}
                onChange={(event) => setKaynakSha256(event.target.value)}
                helperText="Manifest içindeki sourceSha256 değeri. Sunucu paket hash'ini yeniden hesaplar."
                inputProps={{ maxLength: 64 }}
              />
            </Grid>
          </Grid>

          {hata && <Alert severity="error">{hata}</Alert>}

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
            <Button variant="contained" onClick={onizle} disabled={yukleniyor}>
              {yukleniyor ? <CircularProgress size={20} color="inherit" /> : "Önizlemeyi çalıştır"}
            </Button>
            <Button
              variant="outlined"
              color="success"
              onClick={uygula}
              disabled={yukleniyor || !sonuc || sonuc.yazildiMi}
            >
              Paketi uygula
            </Button>
          </Stack>

          {sonuc && (
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Stack spacing={2}>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  <Chip label={sonuc.yazildiMi ? "Uygulandı" : "Önizleme"} color={sonuc.yazildiMi ? "success" : "info"} />
                  {kalite?.onayGerekiyorMu && <Chip label="Onay gerekiyor" color="warning" />}
                  {kalite?.sayimMutabakatiBasariliMi && <Chip label="Sayım mutabık" color="success" variant="outlined" />}
                </Stack>
                <Grid container spacing={2}>
                  {[
                    ["Tanım seti", kalite?.tanimSetiSayisi],
                    ["Tablo", sonuc.tabloSayisi],
                    ["Kalem", sonuc.kalemSayisi],
                    ["Formül", sonuc.hesaplamaKuraliSayisi],
                    ["Terim", sonuc.kuralTerimiSayisi],
                    ["Uyarı", kalite?.uyariSayisi],
                    ["Hata", kalite?.hataSayisi],
                  ].map(([label, value]) => (
                    <Grid item xs={6} sm={3} key={label as string}>
                      <Typography variant="caption" color="text.secondary">{label}</Typography>
                      <Typography variant="h6">{sayi(value as number)}</Typography>
                    </Grid>
                  ))}
                </Grid>
                <Divider />
                <Typography variant="body2">
                  Paket hash: <strong>{kalite?.paketSha256 || "-"}</strong>
                </Typography>
                {sonuc.sorunlar.length > 0 && (
                  <Stack spacing={1}>
                    <Typography variant="subtitle2">Sorunlar</Typography>
                    {sonuc.sorunlar.map((sorun, index) => (
                      <Alert key={`${sorun.kod}-${index}`} severity={sorun.bloklayiciMi ? "error" : "warning"}>
                        <strong>{sorun.kod}</strong> — {sorun.aciklama}
                      </Alert>
                    ))}
                  </Stack>
                )}
                {onayGerekiyor && !sonuc.yazildiMi && (
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={7}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Fark onayı açıklaması"
                        multiline
                        minRows={2}
                        value={onayAciklamasi}
                        onChange={(event) => setOnayAciklamasi(event.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12} md={5}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Fark kodları"
                        value={farkKodlari}
                        onChange={(event) => setFarkKodlari(event.target.value)}
                        helperText="Virgülle ayırın. Örn: FORMUL_UYARISI"
                      />
                    </Grid>
                  </Grid>
                )}
              </Stack>
            </Paper>
          )}
        </Stack>
      </ParentCard>
    </PageContainer>
  );
};

export default Page;
