"use client";

import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Step,
  StepButton,
  Stepper,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/GridLegacy";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import PageContainer from "@/app/components/Container/PageContainer";
import Breadcrumb from "@/app/components/Layout/Shared/Breadcrumb/Breadcrumb";
import ParentCard from "@/app/components/Shared/ParentCard";
import LegacyFormulAktarimCard from "./LegacyFormulAktarimCard";
import type { LegacyFormulAktarimSonucu } from "@/api/FinansalTabloYonetimi/LegacyFormulAktarim";
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
  FinansalSurumYonetimiDurumu,
  activateFinansalSurum,
  getFinansalSurumYonetimiDurumu,
  updateFinansalKalem,
  updateFinansalKural,
  validateFinansalSurum,
  updateFinansalSurumMeta,
  KgkFormatKontrolSonucu,
  KgkKaynakDonemi,
  getKgkKaynakDonemleri,
  kontrolEtKgkFormatlari,
  downloadKgkFormat,
  archiveKgkFormat,
  scanAndArchiveKgkFormats,
  getKgkScanHistory,
  KgkTaramaGecmisi,
  KgkWorkbookFarkSonucu,
  compareArchivedKgkWorkbooks,
  applyKgkKalemFarklari,
  createKgkTaslakFromDifferences,
  applyKgkFormulFarklari,
  createFinansalTabloUretimi,
  previewFinansalTabloUretimi,
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
  createAutomaticFinansalTabloKgkExcel,
  FinansalTabloOtomatikKgkExcelSonucu,
  FinansalTabloKgkUretimArsivKaydi,
  FinansalTabloUretimArsivSonucu,
  FinansalTabloUretimSonucu,
  FinansalTabloUretimIstegi,
  FinansalTabloUretimOnizlemeSonucu,
  FinansalTabloPilotDurumApiSonucu,
  FinansalTabloKaliciArsivDurumApiSonucu,
  FinansalTabloArsivDogrulamaApiSonucu,
  FinansalTabloKaliciArsivHazirlikApiSonucu,
  FinansalTabloArsivKarsilastirmaApiSonucu,
  FinansalTabloGolgeKarsilastirmaSonucu,
} from "@/api/FinansalTabloYonetimi/Tanimlar";
import {
  createFinansalTabloTestMizani,
  FinansalTabloTestMizan,
  FinansalTabloTestMizanOlusturmaIstegi,
  getFinansalTabloMevcutMizani,
  getFinansalTabloTestMizanlari,
} from "@/api/FinansalTabloYonetimi/TestMizan";

const sayi = (value?: number) =>
  new Intl.NumberFormat("tr-TR").format(value ?? 0);

const raporlamaStandardiAdi = (deger?: number) =>
  deger === 1 ? "BOBİ FRS" : deger === 2 ? "TFRS" : deger === 3 ? "KÜMİ FRS" : "Belirsiz standart";

const kapsamAdi = (deger?: number) =>
  deger === 1 ? "Münferit" : deger === 2 ? "Konsolide" : "Belirsiz kapsam";

type KgkDosyasi = KgkFormatKontrolSonucu["dosyalar"][number];

type KgkFarkBaglami = {
  dosya: KgkDosyasi;
  tanimSetiId: number;
  surumId: number;
};

const kgkMetniniNormallestir = (deger: string) => deger
  .toLocaleUpperCase("tr-TR")
  .replace(/[ÇĞİÖŞÜ]/g, (karakter) => ({ Ç: "C", Ğ: "G", İ: "I", Ö: "O", Ş: "S", Ü: "U" }[karakter] || karakter))
  .replace(/[^A-Z0-9]/g, "");

const kgkDosyaUyumsuzlugu = (dosya: KgkDosyasi, tanimSeti: FinansalTanimSeti) => {
  const kaynak = kgkMetniniNormallestir(`${dosya.grup} ${dosya.baslik} ${dosya.dosyaAdi}`);
  const kaynakStandardi = kaynak.includes("BOBIFRS") || kaynak.includes("BOBI")
    ? 1
    : kaynak.includes("TFRS")
      ? 2
      : kaynak.includes("KUMIFRS") || kaynak.includes("KUMI")
        ? 3
        : 0;
  if (kaynakStandardi && kaynakStandardi !== tanimSeti.raporlamaStandardi) {
    return "Seçilen KGK dosyasının raporlama standardı hedef tanım setiyle uyuşmuyor.";
  }

  const kaynakKapsami = kaynak.includes("MUNFERIT") || kaynak.includes("KONSOLIDEOLMAYAN")
    ? 1
    : kaynak.includes("KONSOLIDE")
      ? 2
      : 0;
  if (kaynakKapsami && kaynakKapsami !== tanimSeti.kapsam) {
    return "Seçilen KGK dosyasının münferit/konsolide kapsamı hedef tanım setiyle uyuşmuyor.";
  }

  return "";
};

type KuralTerimiFormu = {
  id: number;
  sira: number;
  hamTerim: string;
  kaynakTuru: number;
  kaynakAnahtari: string;
  operator: number;
  degerAlani: number;
  donemDavranisi: number;
  donemOfseti: number;
  katsayi: number;
  isaretPolitikasi: number;
  zorunluMu: boolean;
};

const surumDurumKodu = (durum: number | string) => {
  if (typeof durum === "number") return durum;
  return ({ Taslak: 1, Dogrulandi: 2, Yayinda: 3, KullanimdanKaldirildi: 4 } as Record<string, number>)[durum] ?? 0;
};

const tabloTuruEtiketi = (tabloTuru: number | string) => {
  const kod = typeof tabloTuru === "number"
    ? tabloTuru
    : ({
        FinansalDurum: 1,
        KarVeyaZarar: 2,
        KapsamliGelir: 3,
        NakitAkis: 4,
        OzkaynakDegisim: 5,
      } as Record<string, number>)[tabloTuru] ?? 0;

  return ({
    1: "Finansal durum",
    2: "Kâr veya zarar",
    3: "Kapsamlı gelir",
    4: "Nakit akış",
    5: "Özkaynak değişim",
  } as Record<number, string>)[kod] ?? String(tabloTuru);
};

const finansalTabloAdimlari = [
  {
    baslik: "Tanımı seç",
    aciklama: "Raporlama standardını seçin, taslak veya yayımlanmış sürümün içeriğini kontrol edin.",
    ipucu: "İlk kullanımda mevcut tanım setini ve sürümü seçmeniz yeterlidir. Kalem ve formül düzenleme yalnız taslak sürümlerde yapılır.",
  },
  {
    baslik: "Üretimi test et",
    aciklama: "İzole test mizanı oluşturun, yeni motor sonucunu ve legacy karşılaştırmasını inceleyin.",
    ipucu: "Test mizanı gerçek mizanı veya üretim arşivini değiştirmez. Önce test mizanını oluşturup ardından önizleme çalıştırın.",
  },
] as const;

const Page = () => {
  const user = useSelector((state: AppState) => state.userReducer);
  const pathname = usePathname();
  const router = useRouter();
  const kgkSayfasi = pathname.endsWith("/KgkGuncellemeleri");
  const sayfaBasligi = kgkSayfasi ? "KGK Güncellemeleri" : "Sürümlü Tanım ve Formüller";
  const breadcrumbItems = [
    { to: "/Anasayfa", title: "Admin Menüsü" },
    { to: "/FinansalTabloYonetimi", title: "Sürümlü Tanım ve Formüller" },
    ...(kgkSayfasi
      ? [{ to: "/FinansalTabloYonetimi/KgkGuncellemeleri", title: "KGK Güncellemeleri" }]
      : []),
  ];
  const [aktifAdim, setAktifAdim] = useState(kgkSayfasi ? 2 : 0);
  const [gelismisPaketAraclariAcik, setGelismisPaketAraclariAcik] = useState(false);
  const [kgkGelismisAraclarAcik, setKgkGelismisAraclarAcik] = useState(false);
  const [teknikDuzenlemeAraclariAcik, setTeknikDuzenlemeAraclariAcik] = useState(false);
  const [testAyrintilariAcik, setTestAyrintilariAcik] = useState(false);
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
  const [surumYonetimiDurumu, setSurumYonetimiDurumu] = useState<FinansalSurumYonetimiDurumu | null>(null);
  const [surumYonetimiYukleniyor, setSurumYonetimiYukleniyor] = useState(false);
  const [devreyeAlmaYukleniyor, setDevreyeAlmaYukleniyor] = useState(false);
  const [devreyeAlmaAciklamasi, setDevreyeAlmaAciklamasi] = useState("");
  const [devreyeAlmaTarihi, setDevreyeAlmaTarihi] = useState(new Date().toISOString().slice(0, 10));
  const [surumYonetimiMesaji, setSurumYonetimiMesaji] = useState("");
  const [kgkKontrolSonucu, setKgkKontrolSonucu] = useState<KgkFormatKontrolSonucu | null>(null);
  const [kgkKaynakDonemleri, setKgkKaynakDonemleri] = useState<KgkKaynakDonemi[]>([]);
  const [kgkKaynakDonemKodu, setKgkKaynakDonemKodu] = useState("");
  const [kgkRaporlamaTarihi, setKgkRaporlamaTarihi] = useState(`${new Date().getFullYear()}-12-31`);
  const [kgkKontrolYukleniyor, setKgkKontrolYukleniyor] = useState(false);
  const [kgkHashleriIste, setKgkHashleriIste] = useState(false);
  const [kgkIndirilenUrl, setKgkIndirilenUrl] = useState("");
  const [kgkArsivlenenUrl, setKgkArsivlenenUrl] = useState("");
  const [kgkTaramaYukleniyor, setKgkTaramaYukleniyor] = useState(false);
  const [kgkTaramaDenemesi, setKgkTaramaDenemesi] = useState(3);
  const [kgkTaramaGecmisi, setKgkTaramaGecmisi] = useState<KgkTaramaGecmisi[]>([]);
  const [kgkGecmisYukleniyor, setKgkGecmisYukleniyor] = useState(false);
  const [kgkWorkbookSonucu, setKgkWorkbookSonucu] = useState<KgkWorkbookFarkSonucu | null>(null);
  const [kgkFarkBaglami, setKgkFarkBaglami] = useState<KgkFarkBaglami | null>(null);
  const [kgkKalemFarkiUygulandiMi, setKgkKalemFarkiUygulandiMi] = useState(false);
  const [kgkFormulFarkiUygulandiMi, setKgkFormulFarkiUygulandiMi] = useState(false);
  const [kgkArsivWorkbookYukleniyor, setKgkArsivWorkbookYukleniyor] = useState("");
  const [uretimGirdiSha256, setUretimGirdiSha256] = useState("");
  const [uretimSnapshotSha256, setUretimSnapshotSha256] = useState("");
  const [uretimGirdiAnahtari, setUretimGirdiAnahtari] = useState("MIZAN");
  const [uretimDenetlenenId, setUretimDenetlenenId] = useState("999999");
  const [uretimYil, setUretimYil] = useState(String(new Date().getFullYear()));
  const [uretimDenetciId, setUretimDenetciId] = useState("");
  const [uretimKonsolide, setUretimKonsolide] = useState(false);
  const [uretimDonemAnahtari, setUretimDonemAnahtari] = useState("");
  const [uretimBaslangic, setUretimBaslangic] = useState("");
  const [uretimBitis, setUretimBitis] = useState("");
  const [uretimYukleniyor, setUretimYukleniyor] = useState(false);
  const [uretimOnizlemeYukleniyor, setUretimOnizlemeYukleniyor] = useState(false);
  const [uretimTekrarYukleniyor, setUretimTekrarYukleniyor] = useState(false);
  const [uretimSonucu, setUretimSonucu] = useState<FinansalTabloUretimSonucu | null>(null);
  const [uretimOnizlemeSonucu, setUretimOnizlemeSonucu] = useState<FinansalTabloUretimOnizlemeSonucu | null>(null);
  const [testMizanlari, setTestMizanlari] = useState<FinansalTabloTestMizan[]>([]);
  const [seciliTestMizani, setSeciliTestMizani] = useState<FinansalTabloTestMizan | null>(null);
  const [testMizanAdi, setTestMizanAdi] = useState("Yeni motor test mizanı");
  const [testMizanSatirlariJson, setTestMizanSatirlariJson] = useState(`[
  { "detayKodu": "100.01", "hesapAdi": "Kasa", "borc": 1000, "alacak": 0 },
  { "detayKodu": "320.01", "hesapAdi": "Satıcılar", "borc": 0, "alacak": 1000 }
]`);
  const [testMizanYukleniyor, setTestMizanYukleniyor] = useState(false);
  const [testMizanListesiYukleniyor, setTestMizanListesiYukleniyor] = useState(false);
  const [mevcutMizanYukleniyor, setMevcutMizanYukleniyor] = useState(false);
  const [mevcutMizanBilgi, setMevcutMizanBilgi] = useState("");
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
  const [kgkRenderYukleniyor, setKgkRenderYukleniyor] = useState(false);
  const [kgkRenderSonucu, setKgkRenderSonucu] = useState<FinansalTabloOtomatikKgkExcelSonucu | null>(null);
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
  const [kuralForm, setKuralForm] = useState({ hesaplamaTuru: 1, isaretPolitikasi: 1, bosDegerPolitikasi: 1, sabitDeger: "", aciklama: "", hamFormul: "", kgkExcelHedefi: "", aktifMi: true, terimler: [] as KuralTerimiFormu[] });

  useEffect(() => {
    setAktifAdim((onceki) => kgkSayfasi ? 2 : onceki === 2 ? 0 : onceki);
  }, [kgkSayfasi]);

  useEffect(() => {
    if (tanimHatasi) setSurumYonetimiMesaji("");
  }, [tanimHatasi]);

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
        const ilkSurum = ilkSet?.surumler?.find((surum) => surumDurumKodu(surum.durum) === 3) || ilkSet?.surumler?.[0];
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
    if (!user.token) return;
    let etkin = true;
    setSurumYonetimiYukleniyor(true);
    getFinansalSurumYonetimiDurumu(user.token)
      .then((data) => etkin && setSurumYonetimiDurumu(data))
      .catch((error) => etkin && setTanimHatasi(error instanceof Error ? error.message : "Sürüm yönetimi durumu okunamadı."))
      .finally(() => etkin && setSurumYonetimiYukleniyor(false));
    return () => {
      etkin = false;
    };
  }, [user.token]);

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
  const seciliKgkKaynakDonemi = kgkKaynakDonemleri.find((kaynak) => kaynak.kod === kgkKaynakDonemKodu);
  const secilenKalemTablosu = surumDetayi?.tablolar.find((tablo) => tablo.id === kalemTabloId) || surumDetayi?.tablolar[0];

  const legacyFormulAktarimiTamamlandi = (sonuc: LegacyFormulAktarimSonucu) => {
    setTanimSetleri((onceki) => onceki.map((set) => ({
      ...set,
      surumler: set.surumler.map((surum) => surum.id === sonuc.surumId
        ? { ...surum, eszamanlilikSurumu: sonuc.eszamanlilikSurumu, guncellemeTarihi: new Date().toISOString() }
        : surum),
    })));
    setEszamanlilikSurumu(String(sonuc.eszamanlilikSurumu));
    setSurumYonetimiMesaji(
      `Bir defalık eski formül aktarımı tamamlandı: ${sonuc.aktarilanKuralSayisi} kural aktarıldı. Bu tanım seti artık yalnız yeni sürümlü yapıdan yönetilecek.`
    );
  };

  const kgkFarkiniTemizle = () => {
    setKgkWorkbookSonucu(null);
    setKgkFarkBaglami(null);
    setKgkKalemFarkiUygulandiMi(false);
    setKgkFormulFarkiUygulandiMi(false);
  };

  const tanimSetiSec = (id: number) => {
    const set = tanimSetleri.find((aday) => aday.id === id);
    const surum = set?.surumler?.find((aday) => surumDurumKodu(aday.durum) === 3) || set?.surumler?.[0];
    setSecilenSetId(id);
    setSecilenSurumId(surum?.id || 0);
    setSurumId(surum ? String(surum.id) : "");
    setEszamanlilikSurumu(surum ? String(surum.eszamanlilikSurumu) : "");
    setTanimHatasi("");
    setSurumYonetimiMesaji("");
    kgkFarkiniTemizle();
  };

  const surumSec = (id: number) => {
    const surum = secilenSet?.surumler.find((aday) => aday.id === id);
    setSecilenSurumId(id);
    setSurumId(surum ? String(surum.id) : "");
    setEszamanlilikSurumu(surum ? String(surum.eszamanlilikSurumu) : "");
    setTanimHatasi("");
    setSurumYonetimiMesaji("");
    kgkFarkiniTemizle();
  };

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
    setUretimOnizlemeSonucu(null);
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

  useEffect(() => {
    setUretimOnizlemeSonucu(null);
  }, [
    secilenSurumId,
    secilenKalemTablosu?.id,
    uretimDonemAnahtari,
    uretimGirdiAnahtari,
    uretimGirdiSha256,
    uretimDenetlenenId,
    uretimYil,
    uretimDenetciId,
    uretimKonsolide,
    uretimSnapshotSha256,
    uretimBaslangic,
    uretimBitis,
  ]);

  useEffect(() => {
    if (!user.token || aktifAdim !== 2) return;
    let etkin = true;
    const gecmisiYenile = async () => {
      setKgkGecmisYukleniyor(true);
      try {
        const data = await getKgkScanHistory(user.token || "", 20);
        if (etkin) setKgkTaramaGecmisi(data);
      } catch (error) {
        if (etkin) setTanimHatasi(error instanceof Error ? error.message : "KGK tarama geçmişi okunamadı.");
      } finally {
        if (etkin) setKgkGecmisYukleniyor(false);
      }
    };
    void gecmisiYenile();
    const zamanlayici = window.setInterval(() => void gecmisiYenile(), 60_000);
    return () => {
      etkin = false;
      window.clearInterval(zamanlayici);
    };
  }, [aktifAdim, user.token]);

  useEffect(() => {
    if (!user.token || aktifAdim !== 2 || !kgkRaporlamaTarihi) return;
    let etkin = true;
    const kaynaklariYukle = async () => {
      try {
        const kaynaklar = await getKgkKaynakDonemleri(user.token || "", kgkRaporlamaTarihi);
        if (!etkin) return;
        setKgkKaynakDonemleri(kaynaklar);
        const onerilen = kaynaklar.find((kaynak) => kaynak.onerilenMi) || kaynaklar[0];
        if (onerilen) setKgkKaynakDonemKodu(onerilen.kod);
        setKgkKontrolSonucu(null);
        setKgkWorkbookSonucu(null);
        setKgkFarkBaglami(null);
        setKgkKalemFarkiUygulandiMi(false);
        setKgkFormulFarkiUygulandiMi(false);
      } catch (error) {
        if (etkin) setTanimHatasi(error instanceof Error ? error.message : "KGK kaynak dönemleri okunamadı.");
      }
    };
    void kaynaklariYukle();
    return () => { etkin = false; };
  }, [aktifAdim, kgkRaporlamaTarihi, user.token]);

  const metaKaydet = async () => {
    if (!user.token || !secilenSurum || surumDurumKodu(secilenSurum.durum) !== 1) return;
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
      setTanimHatasi(error instanceof Error ? error.message : "Sürüm bilgileri güncellenemedi.");
    } finally {
      setMetaKaydediliyor(false);
    }
  };

  const teknikDogrula = async () => {
    if (!user.token || !secilenSurum || surumDurumKodu(secilenSurum.durum) !== 1) return null;
    setDogrulamaYukleniyor(true);
    setTanimHatasi("");
    try {
      const data = await validateFinansalSurum(
        user.token,
        secilenSurum.id,
        secilenSurum.eszamanlilikSurumu
      );
      setDogrulamaSonucu(data);
      return data;
    } catch (error) {
      setTanimHatasi(error instanceof Error ? error.message : "Taslak sürüm teknik olarak doğrulanamadı.");
    } finally {
      setDogrulamaYukleniyor(false);
    }
    return null;
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
    if (!user.token || !secilenSurum || surumDurumKodu(secilenSurum.durum) !== 1 || !tablo || !duzenlenenKalemId) return;
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

  const kuralTerimiGuncelle = (index: number, degisiklik: Partial<KuralTerimiFormu>) => {
    setKuralForm((onceki) => ({
      ...onceki,
      terimler: onceki.terimler.map((terim, terimIndex) =>
        terimIndex === index ? { ...terim, ...degisiklik } : terim),
    }));
  };

  const kuralTerimiEkle = () => {
    setKuralForm((onceki) => ({
      ...onceki,
      terimler: [
        ...onceki.terimler,
        {
          id: 0,
          sira: onceki.terimler.length,
          hamTerim: "",
          kaynakTuru: 1,
          kaynakAnahtari: "",
          operator: 1,
          degerAlani: 1,
          donemDavranisi: 1,
          donemOfseti: 0,
          katsayi: 1,
          isaretPolitikasi: 1,
          zorunluMu: true,
        },
      ],
    }));
  };

  const kuralTerimiSil = (index: number) => {
    setKuralForm((onceki) => ({
      ...onceki,
      terimler: onceki.terimler
        .filter((_, terimIndex) => terimIndex !== index)
        .map((terim, sira) => ({ ...terim, sira })),
    }));
  };

  const kuralKaydet = async () => {
    const tablo = surumDetayi?.tablolar.find((aday) => aday.id === kalemTabloId);
    if (!user.token || !secilenSurum || surumDurumKodu(secilenSurum.durum) !== 1 || !tablo || !duzenlenenKuralId) return;
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
    if (!user.token || !secilenSurum || surumDurumKodu(secilenSurum.durum) !== 1 || !tablo || !yeniKuralKalemId) return;
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

  const taslakKlonla = async (
    kaynakSurum: NonNullable<typeof secilenSurum> = secilenSurum!,
    geriDonusMu = false
  ) => {
    if (!user.token || !kaynakSurum) return;
    kgkFarkiniTemizle();
    setSurumIslemiYukleniyor(true);
    setTanimHatasi("");
    setSurumYonetimiMesaji("");
    try {
      const etiket = geriDonusMu
        ? `${kaynakSurum.etiket} - geri dönüş taslağı`
        : `${kaynakSurum.etiket} - taslak`;
      const aciklama = geriDonusMu
        ? `Geri dönüş adayı: kaynak sürüm #${kaynakSurum.surumNo}. Önceki üretimler değişmez.`
        : `Kaynak sürüm #${kaynakSurum.surumNo} üzerinden oluşturuldu.`;
      const sonuc = await cloneFinansalSurum(user.token, kaynakSurum.id, {
        etiket,
        gecerlilikBaslangici: new Date().toISOString().slice(0, 10),
        gecerlilikBitisi: null,
        aciklama,
        beklenenKaynakEszamanlilikSurumu: kaynakSurum.eszamanlilikSurumu,
      });
      const yeniSurum = { ...kaynakSurum, id: sonuc.surumId, surumNo: sonuc.surumNo, etiket, durum: sonuc.durum, kaynakSurumId: kaynakSurum.id, aciklama, gecerlilikBaslangici: new Date().toISOString(), gecerlilikBitisi: null, olusturmaTarihi: new Date().toISOString(), guncellemeTarihi: null, onayTarihi: null, eszamanlilikSurumu: sonuc.eszamanlilikSurumu };
      setTanimSetleri((onceki) => onceki.map((set) => set.id === secilenSetId ? { ...set, surumler: [yeniSurum, ...set.surumler] } : set));
      setSecilenSurumId(sonuc.surumId);
      setSurumId(String(sonuc.surumId));
      setEszamanlilikSurumu(String(sonuc.eszamanlilikSurumu));
      setSurumYonetimiMesaji(geriDonusMu
        ? `#${kaynakSurum.surumNo} sürümünden geri dönüş taslağı oluşturuldu. Kontrol ve test sonrası devreye alınabilir.`
        : `#${kaynakSurum.surumNo} sürümünden yeni taslak oluşturuldu.`);
    } catch (error) {
      setTanimHatasi(error instanceof Error ? error.message : "Taslak sürüm oluşturulamadı.");
    } finally {
      setSurumIslemiYukleniyor(false);
    }
  };

  const taslagiDevreyeAl = async () => {
    if (!user.token || !secilenSurum || surumDurumKodu(secilenSurum.durum) !== 1) return;
    if (!surumYonetimiDurumu?.etkin) {
      setTanimHatasi("Sürüm devreye alma pilotu kapalıdır. Eski finansal tablo akışı değişmeden devam ediyor.");
      return;
    }
    if (!teknikDogrulamaBasariliMi || !onizlemeBasariliMi || devreyeAlmaAciklamasi.trim().length < 10 || !devreyeAlmaTarihi) return;
    setDevreyeAlmaYukleniyor(true);
    setTanimHatasi("");
    setSurumYonetimiMesaji("");
    try {
      const sonuc = await activateFinansalSurum(user.token, secilenSurum.id, {
        beklenenEszamanlilikSurumu: secilenSurum.eszamanlilikSurumu,
        etkinlikTarihi: devreyeAlmaTarihi,
        onayAciklamasi: devreyeAlmaAciklamasi.trim(),
      });
      setTanimSetleri((onceki) => onceki.map((set) => set.id !== sonuc.tanimSetiId ? set : {
        ...set,
        surumler: set.surumler.map((surum) => {
          if (surum.id === sonuc.surumId) return { ...surum, durum: sonuc.durum, eszamanlilikSurumu: sonuc.eszamanlilikSurumu, gecerlilikBaslangici: sonuc.etkinlikTarihi, gecerlilikBitisi: null, onayTarihi: sonuc.onayTarihi, guncellemeTarihi: sonuc.onayTarihi };
          if (sonuc.kullanimdanKaldirilanSurumIdleri.includes(surum.id)) return { ...surum, durum: 4, guncellemeTarihi: sonuc.onayTarihi };
          return surum;
        }),
      }));
      setSurumDetayi((onceki) => onceki ? { ...onceki, surum: { ...onceki.surum, durum: sonuc.durum, eszamanlilikSurumu: sonuc.eszamanlilikSurumu, gecerlilikBaslangici: sonuc.etkinlikTarihi, gecerlilikBitisi: null, onayTarihi: sonuc.onayTarihi, guncellemeTarihi: sonuc.onayTarihi } } : onceki);
      setDogrulamaSonucu(null);
      setDevreyeAlmaAciklamasi("");
      setSurumYonetimiMesaji(`Sürüm #${secilenSurum.surumNo} devreye alındı. ${sonuc.kullanimdanKaldirilanSurumIdleri.length} önceki sürüm kullanım dışına alındı; eski üretimler değişmedi.`);
    } catch (error) {
      setTanimHatasi(error instanceof Error ? error.message : "Sürüm devreye alınamadı.");
    } finally {
      setDevreyeAlmaYukleniyor(false);
    }
  };

  const kgkKontrolEt = async () => {
    if (!user.token) return;
    setKgkKontrolYukleniyor(true);
    setTanimHatasi("");
    kgkFarkiniTemizle();
    try {
      const oncekiDosyalar = kgkKontrolSonucu?.kaynakDonemKodu === kgkKaynakDonemKodu ? kgkKontrolSonucu.dosyalar.map((dosya) => ({
        url: dosya.url,
        sha256: dosya.sha256 || null,
        etag: dosya.etag || null,
        icerikUzunlugu: dosya.icerikUzunlugu || null,
      })) : [];
      const data = await kontrolEtKgkFormatlari(user.token, {
        icerikHashleriniHesapla: kgkHashleriIste,
        oncekiDosyalar,
        kaynakDonemKodu: kgkKaynakDonemKodu,
        raporlamaDonemiBitisTarihi: kgkRaporlamaTarihi,
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
      setTanimHatasi(error instanceof Error ? error.message : "KGK tarama geçmişi okunamadı.");
    } finally {
      setKgkGecmisYukleniyor(false);
    }
  };

  const kgkTaraVeArsivle = async () => {
    if (!user.token) return;
    setKgkTaramaYukleniyor(true);
    setTanimHatasi("");
    setSurumYonetimiMesaji("");
    kgkFarkiniTemizle();
    try {
      const oncekiDosyalar = kgkKontrolSonucu?.kaynakDonemKodu === kgkKaynakDonemKodu ? kgkKontrolSonucu.dosyalar.map((dosya) => ({
        url: dosya.url,
        sha256: dosya.sha256 || null,
        etag: dosya.etag || null,
        icerikUzunlugu: dosya.icerikUzunlugu || null,
      })) : [];
      const data = await scanAndArchiveKgkFormats(user.token, {
        icerikHashleriniHesapla: true,
        oncekiDosyalar,
        arsivle: true,
        maksimumDeneme: kgkTaramaDenemesi,
        kaynakDonemKodu: kgkKaynakDonemKodu,
        raporlamaDonemiBitisTarihi: kgkRaporlamaTarihi,
      });
      setKgkKontrolSonucu(data.kontrol);
      if (data.hatalar.length > 0) {
        setTanimHatasi(`${data.kontrol.bulunanDosyaSayisi} dosya kontrol edildi; ${data.hatalar.length} arşivleme hatası oluştu.`);
      } else {
        setSurumYonetimiMesaji(`${data.arsivler.length} KGK dosyası arşivlendi; ${data.toplamDenemeSayisi} deneme yapıldı.`);
      }
      await kgkTaramaGecmisiniYukle();
    } catch (error) {
      setTanimHatasi(error instanceof Error ? error.message : "KGK tarama ve arşivleme tamamlanamadı.");
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
    setSurumYonetimiMesaji("");
    try {
      const sonuc = await archiveKgkFormat(user.token, fileUrl);
      setSurumYonetimiMesaji(sonuc.yeniMi ? `${sonuc.dosyaAdi} arşive kaydedildi (${sonuc.sha256}).` : `${sonuc.dosyaAdi} aynı SHA-256 ile daha önce arşivlenmiş.`);
    } catch (error) {
      setTanimHatasi(error instanceof Error ? error.message : "KGK formatı arşivlenemedi.");
    } finally {
      setKgkArsivlenenUrl("");
    }
  };

  const kgkArsivWorkbookKarsilastir = async (dosya: KgkDosyasi) => {
    if (!user.token || !dosya.oncekiSha256 || !dosya.sha256 || !secilenSet || !secilenSurum) return;
    const uyumsuzluk = kgkDosyaUyumsuzlugu(dosya, secilenSet);
    if (uyumsuzluk) {
      kgkFarkiniTemizle();
      setTanimHatasi(uyumsuzluk);
      return;
    }
    kgkFarkiniTemizle();
    setKgkArsivWorkbookYukleniyor(dosya.url);
    setTanimHatasi("");
    setSurumYonetimiMesaji("");
    try {
      const sonuc = await compareArchivedKgkWorkbooks(user.token, {
        url: dosya.url,
        oncekiSha256: dosya.oncekiSha256,
        yeniSha256: dosya.sha256,
      });
      setKgkWorkbookSonucu(sonuc);
      setKgkFarkBaglami({ dosya, tanimSetiId: secilenSet.id, surumId: secilenSurum.id });
    } catch (error) {
      setTanimHatasi(error instanceof Error ? error.message : "Arşivlenmiş KGK workbook karşılaştırılamadı.");
    } finally {
      setKgkArsivWorkbookYukleniyor("");
    }
  };

  const kgkFarktanTaslakOlustur = async () => {
    if (!user.token || !secilenSurum || !secilenSet || !kgkWorkbookSonucu) return;
    if (!kgkFarkBaglami || kgkFarkBaglami.tanimSetiId !== secilenSet.id || kgkFarkBaglami.surumId !== secilenSurum.id) {
      setTanimHatasi("KGK farkı başka bir tanım veya sürüm için incelendi. Hedefi seçip arşivli farkı yeniden inceleyin.");
      return;
    }
    setSurumIslemiYukleniyor(true);
    setTanimHatasi("");
    setSurumYonetimiMesaji("");
    try {
      const kaynakSurum = secilenSurum;
      const aciklama = `KGK workbook fark incelemesi: ${kgkWorkbookSonucu.oncekiDosyaAdi} → ${kgkWorkbookSonucu.yeniDosyaAdi}; önceki SHA-256 ${kgkWorkbookSonucu.oncekiSha256}; yeni SHA-256 ${kgkWorkbookSonucu.yeniSha256}; ${kgkWorkbookSonucu.farkSayisi} yapısal fark, ${kgkWorkbookSonucu.kalemFarklari.length} semantik kalem farkı, ${kgkWorkbookSonucu.formulFarklari.length} formül farkı. Otomatik yayınlanmaz.`;
      const sonuc = await createKgkTaslakFromDifferences(user.token, kaynakSurum.id, {
        etiket: `${kaynakSurum.etiket} - KGK taslak`,
        gecerlilikBaslangici: kaynakSurum.gecerlilikBaslangici,
        gecerlilikBitisi: kaynakSurum.gecerlilikBitisi || null,
        aciklama,
        beklenenKaynakEszamanlilikSurumu: kaynakSurum.eszamanlilikSurumu,
        kalemFarklari: kgkWorkbookSonucu.kalemFarklari,
      });
      const taslak = {
        ...kaynakSurum,
        id: sonuc.surumId,
        surumNo: sonuc.surumNo,
        etiket: `${kaynakSurum.etiket} - KGK taslak`,
        durum: sonuc.durum,
        kaynakSurumId: kaynakSurum.id,
        aciklama,
        olusturmaTarihi: new Date().toISOString(),
        guncellemeTarihi: new Date().toISOString(),
        onayTarihi: null,
        eszamanlilikSurumu: sonuc.eszamanlilikSurumu,
        kalemSayisi: Math.max(0, kaynakSurum.kalemSayisi + sonuc.eklenenKalemSayisi - sonuc.pasifeAlinanKalemSayisi),
      };
      setTanimSetleri((onceki) => onceki.map((set) => set.id === secilenSet.id ? { ...set, surumler: [taslak, ...set.surumler] } : set));
      setSecilenSurumId(sonuc.surumId);
      setSurumId(String(sonuc.surumId));
      setEszamanlilikSurumu(String(sonuc.eszamanlilikSurumu));
      setKgkFarkBaglami((onceki) => onceki ? { ...onceki, surumId: sonuc.surumId } : onceki);
      setKgkKalemFarkiUygulandiMi(kgkWorkbookSonucu.kalemFarklari.length > 0);
      setSurumYonetimiMesaji(`KGK taslağı ve kalem farkları tek işlemde oluşturuldu: ${sonuc.eklenenKalemSayisi} yeni, ${sonuc.pasifeAlinanKalemSayisi} pasif, ${sonuc.guncellenenKalemSayisi} güncellenen kalem. Formül farkları ayrı Admin onayıyla aktarılır; taslak otomatik yayınlanmaz.`);
    } catch (error) {
      setTanimHatasi(error instanceof Error ? error.message : "KGK farkı için taslak oluşturulamadı; herhangi bir yarım taslak kaydedilmedi.");
    } finally {
      setSurumIslemiYukleniyor(false);
    }
  };

  const kgkKalemFarklariniTaslagAktar = async () => {
    if (!user.token || !secilenSet || !secilenSurum || surumDurumKodu(secilenSurum.durum) !== 1 || !kgkWorkbookSonucu?.semantikDegisiklikVarMi) return;
    if (!kgkFarkBaglami || kgkFarkBaglami.tanimSetiId !== secilenSet.id || kgkFarkBaglami.surumId !== secilenSurum.id) {
      setTanimHatasi("KGK kalem farkı seçili taslağa ait değil. Hedef sürüm için arşivli farkı yeniden inceleyin.");
      return;
    }

    setSurumIslemiYukleniyor(true);
    setTanimHatasi("");
    setSurumYonetimiMesaji("");
    try {
      const sonuc = await applyKgkKalemFarklari(user.token, secilenSurum.id, {
        beklenenEszamanlilikSurumu: secilenSurum.eszamanlilikSurumu,
        kalemFarklari: kgkWorkbookSonucu.kalemFarklari,
        aciklama: `KGK workbook kalem farkları: ${kgkWorkbookSonucu.oncekiDosyaAdi} → ${kgkWorkbookSonucu.yeniDosyaAdi}`,
      });
      setTanimSetleri((onceki) => onceki.map((set) => set.id !== secilenSet.id ? set : {
        ...set,
        surumler: set.surumler.map((surum) => surum.id === secilenSurum.id ? {
          ...surum,
          eszamanlilikSurumu: sonuc.eszamanlilikSurumu,
          kalemSayisi: Math.max(0, surum.kalemSayisi + sonuc.eklenenKalemSayisi - sonuc.pasifeAlinanKalemSayisi),
        } : surum),
      }));
      setEszamanlilikSurumu(String(sonuc.eszamanlilikSurumu));
      setKgkKalemFarkiUygulandiMi(true);
      setSurumYonetimiMesaji(`KGK kalem farkları taslağa aktarıldı: ${sonuc.eklenenKalemSayisi} yeni, ${sonuc.pasifeAlinanKalemSayisi} pasif, ${sonuc.guncellenenKalemSayisi} güncellenen kalem. Taslak otomatik yayınlanmadı.`);
    } catch (error) {
      setTanimHatasi(error instanceof Error ? error.message : "KGK kalem farkları taslağa uygulanamadı.");
    } finally {
      setSurumIslemiYukleniyor(false);
    }
  };

  const kgkFormulFarklariniTaslagAktar = async () => {
    if (!user.token || !secilenSet || !secilenSurum || surumDurumKodu(secilenSurum.durum) !== 1 || !kgkWorkbookSonucu?.formulDegisikligiVarMi) return;
    if (!kgkFarkBaglami || kgkFarkBaglami.tanimSetiId !== secilenSet.id || kgkFarkBaglami.surumId !== secilenSurum.id) {
      setTanimHatasi("KGK formül farkı seçili taslağa ait değil. Hedef sürüm için arşivli farkı yeniden inceleyin.");
      return;
    }
    const hataliFormuller = kgkWorkbookSonucu.formulFarklari
      .map((fark) => fark.yeniFormul)
      .filter((formul) => formul && formul.dogrulamaHatalari.length > 0);
    if (hataliFormuller.length > 0) {
      setTanimHatasi("Çözümlenme hatası taşıyan KGK formülleri düzeltilmeden taslağa aktarılamaz.");
      return;
    }

    setSurumIslemiYukleniyor(true);
    setTanimHatasi("");
    setSurumYonetimiMesaji("");
    try {
      const sonuc = await applyKgkFormulFarklari(user.token, secilenSurum.id, {
        beklenenEszamanlilikSurumu: secilenSurum.eszamanlilikSurumu,
        formulFarklari: kgkWorkbookSonucu.formulFarklari,
        aciklama: `KGK workbook formül farkları: ${kgkWorkbookSonucu.oncekiDosyaAdi} → ${kgkWorkbookSonucu.yeniDosyaAdi}`,
      });
      setTanimSetleri((onceki) => onceki.map((set) => ({
        ...set,
        surumler: set.surumler.map((surum) => surum.id === secilenSurum.id
          ? { ...surum, eszamanlilikSurumu: sonuc.eszamanlilikSurumu, formulSayisi: Math.max(0, surum.formulSayisi + sonuc.eklenenFormulSayisi - sonuc.pasifeAlinanFormulSayisi) }
          : surum),
      })));
      setEszamanlilikSurumu(String(sonuc.eszamanlilikSurumu));
      setSurumDetayi(await getFinansalSurumDetay(user.token, secilenSurum.id));
      setKgkFormulFarkiUygulandiMi(true);
      setSurumYonetimiMesaji(`KGK formül farkları taslağa aktarıldı: ${sonuc.eklenenFormulSayisi} yeni, ${sonuc.guncellenenFormulSayisi} güncellenen, ${sonuc.pasifeAlinanFormulSayisi} pasif formül; ${sonuc.yazilanTerimSayisi} terim yazıldı. Taslak otomatik yayınlanmadı.`);
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

  const testMizanSatirlariniOku = (): FinansalTabloTestMizanOlusturmaIstegi["satirlar"] => {
    const parsed = JSON.parse(testMizanSatirlariJson) as unknown;
    if (!Array.isArray(parsed) || parsed.length === 0) {
      throw new Error("Test mizanı için en az bir satır içeren JSON dizisi girin.");
    }
    return parsed.map((hamSatir, index) => {
      if (!hamSatir || typeof hamSatir !== "object") {
        throw new Error(`Test mizanı ${index + 1}. satırında JSON nesnesi bekleniyor.`);
      }
      const satir = hamSatir as Record<string, unknown>;
      const detayKodu = String(satir.detayKodu || "").trim();
      if (!detayKodu) {
        throw new Error(`Test mizanı ${index + 1}. satırında detayKodu zorunludur.`);
      }
      const sayiOku = (alan: string, varsayilan = 0) => {
        const deger = satir[alan];
        if (deger === undefined || deger === null || deger === "") return varsayilan;
        const sayiDegeri = Number(deger);
        if (!Number.isFinite(sayiDegeri)) {
          throw new Error(`Test mizanı ${index + 1}. satırında ${alan} sayısal olmalıdır.`);
        }
        return sayiDegeri;
      };
      return {
        detayKodu,
        hesapAdi: String(satir.hesapAdi || detayKodu),
        borc: sayiOku("borc"),
        alacak: sayiOku("alacak"),
        raporBorc: sayiOku("raporBorc", sayiOku("borc")),
        raporAlacak: sayiOku("raporAlacak", sayiOku("alacak")),
        bakiye: sayiOku("bakiye", sayiOku("borc") - sayiOku("alacak")),
        kontrolBakiye: sayiOku("kontrolBakiye", sayiOku("bakiye", sayiOku("borc") - sayiOku("alacak"))),
        bakiyeTransferFisiHaric: sayiOku("bakiyeTransferFisiHaric", sayiOku("bakiye", sayiOku("borc") - sayiOku("alacak"))),
        paraBirimi: String(satir.paraBirimi || "TRY"),
      };
    });
  };

  const testMizanListesiniYukle = async () => {
    if (!user.token) return;
    setTestMizanListesiYukleniyor(true);
    try {
      setTestMizanlari(await getFinansalTabloTestMizanlari(user.token, 50));
    } catch (error) {
      setTanimHatasi(error instanceof Error ? error.message : "Test mizanları okunamadı.");
    } finally {
      setTestMizanListesiYukleniyor(false);
    }
  };

  const mevcutMizaniEditoreYukle = async () => {
    if (!user.token) return;
    const denetlenenId = Number(uretimDenetlenenId);
    const yil = Number(uretimYil);
    if (!Number.isInteger(denetlenenId) || denetlenenId <= 0 || !Number.isInteger(yil) || yil < 1900) {
      setTanimHatasi("Mevcut mizanı okumak için geçerli denetlenen ID ve yıl girilmelidir.");
      return;
    }
    setMevcutMizanYukleniyor(true);
    setMevcutMizanBilgi("");
    setTanimHatasi("");
    try {
      const satirlar = await getFinansalTabloMevcutMizani(user.token, denetlenenId, yil, uretimKonsolide);
      if (satirlar.length === 0) {
        throw new Error("Seçilen denetlenen ve yıl için mevcut dönüşüm mizanı bulunamadı.");
      }
      if (satirlar.length > 5000) {
        throw new Error("Mevcut mizan 5.000 satırdan fazla; test fixture sınırını aşmamak için aktarılmadı.");
      }
      const sayiOku = (deger: number | null | undefined, varsayilan = 0) => {
        const sayiDegeri = Number(deger ?? varsayilan);
        return Number.isFinite(sayiDegeri) ? sayiDegeri : varsayilan;
      };
      const fixtureSatirlari = satirlar.map((satir, index) => {
        const detayKodu = String(satir.detayKodu || "").trim();
        if (!detayKodu) {
          throw new Error(`Mevcut mizanın ${index + 1}. satırında detay kodu bulunamadı.`);
        }
        const borc = sayiOku(satir.borcBakiye);
        const alacak = sayiOku(satir.alacakBakiye);
        const raporBorc = sayiOku(satir.raporBorc, borc);
        const raporAlacak = sayiOku(satir.raporAlacak, alacak);
        const bakiye = sayiOku(satir.bakiye, raporBorc - raporAlacak);
        return {
          detayKodu,
          hesapAdi: String(satir.hesapAdi || detayKodu),
          borc,
          alacak,
          raporBorc,
          raporAlacak,
          bakiye,
          kontrolBakiye: sayiOku(satir.kontrolBakiye, bakiye),
          bakiyeTransferFisiHaric: sayiOku(satir.bakiyeTransferFisiHaric, bakiye),
          paraBirimi: String(satir.paraBirimi || "TRY"),
        };
      });
      setTestMizanSatirlariJson(JSON.stringify(fixtureSatirlari, null, 2));
      setTestMizanAdi(`Mevcut mizan snapshotı ${denetlenenId}-${yil}`);
      setSeciliTestMizani(null);
      setUretimOnizlemeSonucu(null);
      setMevcutMizanBilgi(`${fixtureSatirlari.length} mizan satırı editöre yüklendi. Kontrol edip “Test mizanı oluştur” düğmesine basın.`);
    } catch (error) {
      setTanimHatasi(error instanceof Error ? error.message : "Mevcut dönüşüm mizanı okunamadı.");
    } finally {
      setMevcutMizanYukleniyor(false);
    }
  };

  const testMizaniOlustur = async (): Promise<FinansalTabloTestMizan | null> => {
    if (!user.token) return null;
    const denetlenenId = Number(uretimDenetlenenId);
    const yil = Number(uretimYil);
    if (!Number.isInteger(denetlenenId) || denetlenenId <= 0 || !Number.isInteger(yil) || yil < 1900) {
      setTanimHatasi("Test mizanı için geçerli denetlenen ID ve yıl girilmelidir.");
      return null;
    }
    setTestMizanYukleniyor(true);
    setTanimHatasi("");
    try {
      const kayit = await createFinansalTabloTestMizani(user.token, {
        ad: testMizanAdi.trim() || "Yeni motor test mizanı",
        denetlenenId,
        yil,
        konsolidasyonMu: uretimKonsolide,
        satirlar: testMizanSatirlariniOku(),
      });
      setSeciliTestMizani(kayit);
      setTestMizanlari((onceki) => [kayit, ...onceki.filter((aday) => aday.id !== kayit.id)]);
      setUretimGirdiAnahtari(`TEST-MIZAN-${kayit.id.slice(0, 8).toUpperCase()}`);
      setUretimGirdiSha256(kayit.sha256);
      setUretimDenetlenenId(String(kayit.denetlenenId));
      setUretimYil(String(kayit.yil));
      setUretimBaslangic((onceki) => onceki || `${kayit.yil}-01-01`);
      setUretimBitis((onceki) => onceki || `${kayit.yil}-12-31`);
      setUretimOnizlemeSonucu(null);
      setSurumYonetimiMesaji(`Test mizanı oluşturuldu: ${kayit.ad} · ${kayit.satirlar.length} satır. Salt-okunur önizlemeye hazır.`);
      return kayit;
    } catch (error) {
      setTanimHatasi(error instanceof Error ? error.message : "Test mizanı oluşturulamadı.");
      return null;
    } finally {
      setTestMizanYukleniyor(false);
    }
  };

  const testMizaniSec = (kayit: FinansalTabloTestMizan) => {
    setSeciliTestMizani(kayit);
    setUretimGirdiAnahtari(`TEST-MIZAN-${kayit.id.slice(0, 8).toUpperCase()}`);
    setUretimGirdiSha256(kayit.sha256);
    setUretimDenetlenenId(String(kayit.denetlenenId));
    setUretimYil(String(kayit.yil));
    setUretimKonsolide(kayit.konsolidasyonMu);
    setUretimBaslangic((onceki) => onceki || `${kayit.yil}-01-01`);
    setUretimBitis((onceki) => onceki || `${kayit.yil}-12-31`);
    setUretimOnizlemeSonucu(null);
  };

  const finansalTabloIstekOlustur = (testMizani: FinansalTabloTestMizan | null = seciliTestMizani): FinansalTabloUretimIstegi | null => {
    const tablo = secilenKalemTablosu;
    const set = secilenSet;
    const surum = secilenSurum;
    const donem = tablo?.donemKolonlari?.find((kolon) => kolon.sabitAnahtar === uretimDonemAnahtari) || tablo?.donemKolonlari?.[0];
    if (!user.token || !set || !surum || !tablo || !donem) {
      setTanimHatasi("Üretim için yayımlanmış sürüm, tablo ve dönem kolonu seçilmelidir.");
      return null;
    }
    if (surumDurumKodu(surum.durum) !== 3 && !testMizani) {
      setTanimHatasi("Gerçek mizan önizlemesi ve üretim yalnızca yayımlanmış sürüm üzerinden başlatılabilir. Taslağı sınamak için önce izole test mizanı oluşturun.");
      return null;
    }
    const girdiSha256 = testMizani?.sha256 || uretimGirdiSha256.trim();
    const denetlenenId = testMizani?.denetlenenId ?? Number(uretimDenetlenenId);
    const yil = testMizani?.yil ?? Number(uretimYil);
    const konsolidasyonMu = testMizani?.konsolidasyonMu ?? uretimKonsolide;
    const baslangicTarihi = testMizani ? `${testMizani.yil}-01-01` : uretimBaslangic;
    const bitisTarihi = testMizani ? `${testMizani.yil}-12-31` : uretimBitis;
    if (girdiSha256.length !== 64 || !denetlenenId || !yil || !baslangicTarihi || !bitisTarihi) {
      setTanimHatasi("Girdi SHA-256, denetlenen, yıl ve dönem tarihleri zorunludur.");
      return null;
    }
    const snapshotSha256 = uretimSnapshotSha256.trim() || dogrulamaSonucu?.tablolar.find((aday) => aday.tabloId === tablo.id)?.snapshotSha256 || "";
    return {
      yeniMotorSurumu: "finansal-tablo-yeni-motor-v1",
      tanimSetiSabitAnahtari: set.kod,
      tanimSurumu: surum.etiket,
      girdiSabitAnahtari: testMizani ? `TEST-MIZAN-${testMizani.id.slice(0, 8).toUpperCase()}` : uretimGirdiAnahtari.trim() || "MIZAN",
      girdiSha256: girdiSha256.toLowerCase(),
      calistirmaBaglami: {
        donemEslesmeleri: [{
          donemDavranisi: donem.donemDavranisi,
          donemOfseti: donem.donemOfseti,
          donem: {
            sabitAnahtar: donem.sabitAnahtar,
            baslangicTarihi,
            bitisTarihi,
          },
        }],
        yuvarlamaBasamagi: tablo.yuvarlamaBasamagi,
        yuvarlamaModu: 1,
        degerKaynagiBaglami: {
          denetlenenId,
          yil,
          konsolidasyonMu,
          denetciId: Number(uretimDenetciId) || 0,
          testMizanId: testMizani?.id || null,
        },
      },
      tabloSabitAnahtari: tablo.kod,
      donemSabitAnahtari: donem.sabitAnahtar,
      raporlamaStandardi: set.raporlamaStandardi,
      kapsam: set.kapsam,
      donusumTipi: set.donusumTipi,
      tabloTuru: tablo.tabloTuru,
      nakitAkisYontemi: tablo.nakitAkisYontemi,
      gecerlilikTarihi: bitisTarihi,
      tanimSnapshotSha256: snapshotSha256,
    };
  };

  const finansalTabloUret = async () => {
    const istek = finansalTabloIstekOlustur();
    if (!istek || !user.token) return;
    setUretimYukleniyor(true);
    setTanimHatasi("");
    try {
      const data = await createFinansalTabloUretimi(user.token, istek);
      setUretimSonucu(data);
      if (data.kayit.durum === 1) setSurumYonetimiMesaji("Finansal tablo üretimi arşivlendi.");
      else setTanimHatasi(data.kayit.aciklama || "Finansal tablo üretimi tamamlanamadı.");
    } catch (error) {
      setTanimHatasi(error instanceof Error ? error.message : "Finansal tablo üretimi tamamlanamadı.");
    } finally {
      setUretimYukleniyor(false);
    }
  };

  const finansalTabloOnizle = async (testMizani: FinansalTabloTestMizan | null = seciliTestMizani): Promise<FinansalTabloUretimOnizlemeSonucu | null> => {
    const istek = finansalTabloIstekOlustur(testMizani);
    if (!istek || !user.token) return null;
    setUretimOnizlemeYukleniyor(true);
    setUretimOnizlemeSonucu(null);
    setTanimHatasi("");
    try {
      const data = await previewFinansalTabloUretimi(user.token, istek);
      setUretimOnizlemeSonucu(data);
      if (data.basariliMi) setSurumYonetimiMesaji("Salt-okunur örnek mizan önizlemesi tamamlandı; üretim arşivi değiştirilmedi.");
      else setTanimHatasi(data.aciklama || "Örnek mizan önizlemesi tamamlanamadı.");
      return data;
    } catch (error) {
      setTanimHatasi(error instanceof Error ? error.message : "Örnek mizan önizlemesi tamamlanamadı.");
      return null;
    } finally {
      setUretimOnizlemeYukleniyor(false);
    }
  };

  const finansalTabloyuTekrarUret = async () => {
    if (!user.token || !uretimSonucu?.kayit.uretimId) return;
    setUretimTekrarYukleniyor(true);
    setTanimHatasi("");
    try {
      const data = await replayFinansalTabloUretimi(user.token, uretimSonucu.kayit.uretimId);
      setUretimSonucu(data);
      if (data.kayit.durum === 1) setSurumYonetimiMesaji(`Geçmiş üretim yeniden çalıştırıldı · kaynak ${data.kayit.yenidenUretimKaynakId || "-"}.`);
      else setTanimHatasi(data.kayit.aciklama || "Geçmiş finansal tablo yeniden üretilemedi.");
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
      setSurumYonetimiMesaji("Eski ve yeni motor karşılaştırması tamamlandı; sonuç arşivlenmedi.");
    } catch (error) {
      setTanimHatasi(error instanceof Error ? error.message : "Gölge karşılaştırması çalıştırılamadı.");
    } finally {
      setGolgeKarsilastirmaYukleniyor(false);
    }
  };

  const kgkFinansalTabloOtomatikOlustur = async () => {
    if (!user.token || !uretimSonucu?.kayit.uretimId) {
      setTanimHatasi("Otomatik KGK Excel çıktısı için önce finansal tablo üretimi oluşturun.");
      return;
    }
    setKgkRenderYukleniyor(true);
    setTanimHatasi("");
    try {
      const sonuc = await createAutomaticFinansalTabloKgkExcel(user.token, uretimSonucu.kayit.uretimId);
      setKgkRenderSonucu(sonuc);
      setKgkArsivCiktilari(await getFinansalTabloKgkCiktilari(user.token, uretimSonucu.kayit.uretimId));
      setSurumYonetimiMesaji(`Resmi KGK şablonu otomatik seçildi, dolduruldu ve indirildi: ${sonuc.dosyaAdi}`);
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
      setSurumYonetimiMesaji(`Arşivlenmiş KGK çıktısı indirildi: ${kayit.ciktiDosyaAdi}`);
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

  const seciliSurumTaslakMi = surumDurumKodu(secilenSurum?.durum ?? 0) === 1;
  const seciliSurumYayindaMi = surumDurumKodu(secilenSurum?.durum ?? 0) === 3;
  const teknikDogrulamaGuncelMi = Boolean(
    dogrulamaSonucu && secilenSurum &&
    dogrulamaSonucu.surumId === secilenSurum.id &&
    dogrulamaSonucu.eszamanlilikSurumu === secilenSurum.eszamanlilikSurumu
  );
  const teknikDogrulamaBasariliMi = teknikDogrulamaGuncelMi && dogrulamaSonucu?.gecerliMi === true;
  const onizlemeBasariliMi = uretimOnizlemeSonucu?.basariliMi === true;
  const yonlendirmeYukleniyor = tanimYukleniyor || dogrulamaYukleniyor || testMizanYukleniyor || uretimOnizlemeYukleniyor;

  const akilliYonlendirme = useMemo(() => {
    if (tanimYukleniyor) return { seviye: "info" as const, baslik: "Tanımlar kontrol ediliyor", aciklama: "Uygun tanım seti ve sürüm otomatik seçiliyor.", eylem: "bekle", dugme: "Kontrol ediliyor" };
    if (!secilenSet || !secilenSurum) return { seviye: "error" as const, baslik: "Kullanılabilir tanım bulunamadı", aciklama: "Filtreleri temizleyin veya aktif tanım setlerini kontrol edin.", eylem: "tanim", dugme: "Tanım seçimine dön" };
    if (seciliSurumTaslakMi && !teknikDogrulamaGuncelMi) return { seviye: "warning" as const, baslik: "Otomatik test hazır", aciklama: "Sistem tanımları doğrulayacak, izole test mizanını hazırlayacak ve önizlemeyi tek işlemde çalıştıracak.", eylem: "otomatik-test", dugme: "Otomatik testi çalıştır" };
    if (seciliSurumTaslakMi && !teknikDogrulamaBasariliMi) return { seviye: "error" as const, baslik: "Düzeltilmesi gereken tanımlar var", aciklama: "Sorunlu tablo ve formüller aşağıda gösterildi. Düzeltmeden yayınlama yapılamaz.", eylem: "tanim", dugme: "Sorunları incele" };
    if (!seciliTestMizani) return { seviye: "info" as const, baslik: "İzole test başlatılabilir", aciklama: "Sistem dengeli örnek mizanı hazırlayıp salt-okunur önizlemeyi kendisi çalıştıracak. Gerçek veriler ve eski tablolar etkilenmeyecek.", eylem: "otomatik-test", dugme: "Otomatik testi çalıştır" };
    if (!onizlemeBasariliMi) return { seviye: uretimOnizlemeSonucu ? "warning" as const : "info" as const, baslik: uretimOnizlemeSonucu ? "Test yeniden çalıştırılmalı" : "Yeni motor önizlemeye hazır", aciklama: uretimOnizlemeSonucu?.aciklama || "Seçili tanım ve test mizanıyla salt-okunur finansal tablo üretilecek.", eylem: "otomatik-test", dugme: "Otomatik testi çalıştır" };
    return { seviye: "success" as const, baslik: "Admin testi başarıyla tamamlandı", aciklama: `${uretimOnizlemeSonucu?.sonuclar.length ?? 0} finansal tablo sonucu üretildi; eski akış ve üretim arşivi değiştirilmedi.`, eylem: "kgk", dugme: "KGK kontrolüne geç" };
  }, [tanimYukleniyor, secilenSet, secilenSurum, seciliSurumTaslakMi, teknikDogrulamaGuncelMi, teknikDogrulamaBasariliMi, seciliTestMizani, onizlemeBasariliMi, uretimOnizlemeSonucu]);

  const onerilenIslemiCalistir = async () => {
    if (akilliYonlendirme.eylem === "tanim") return setAktifAdim(0);
    if (akilliYonlendirme.eylem === "otomatik-test") {
      setAktifAdim(0);
      if (seciliSurumTaslakMi && !teknikDogrulamaGuncelMi) {
        const dogrulama = await teknikDogrula();
        if (!dogrulama?.gecerliMi) return;
      }
      setAktifAdim(1);
      const testMizani = seciliTestMizani || await testMizaniOlustur();
      if (!testMizani) return;
      await finansalTabloOnizle(testMizani);
      return;
    }
    if (akilliYonlendirme.eylem === "kgk") {
      router.push("/FinansalTabloYonetimi/KgkGuncellemeleri");
    }
  };

  const tamamlananAdimlar = [
    Boolean(secilenSurum && (seciliSurumYayindaMi || teknikDogrulamaBasariliMi)),
    onizlemeBasariliMi,
  ];

  return (
    <PageContainer
      title={sayfaBasligi}
      description={kgkSayfasi
        ? "Resmi KGK kaynaklarını izleme, sürüm farklarını inceleme ve onaylı taslağa aktarma"
        : "Finansal tablo tanımlarını ve formüllerini sürümleyerek yönetme ve kontrollü test etme"}
    >
      <Breadcrumb title={sayfaBasligi} items={breadcrumbItems} />
      {!kgkSayfasi && tanimHatasi && <Alert severity="error" onClose={() => setTanimHatasi("")} sx={{ mb: 2 }}>{tanimHatasi}</Alert>}
      {!kgkSayfasi && surumYonetimiMesaji && <Alert severity="success" onClose={() => setSurumYonetimiMesaji("")} sx={{ mb: 2 }}>{surumYonetimiMesaji}</Alert>}
      {!kgkSayfasi && <>
      <Paper variant="outlined" sx={{ p: { xs: 1.5, md: 2 }, mb: 2 }}>
        <Stack spacing={1.5}>
          <Box>
            <Typography variant="subtitle1" fontWeight={700}>
              Finansal tablo hazırlama adımları
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Tanımı seçin, formülleri sürümleyin ve örnek mizanla üretimi test edin. KGK güncellemeleri ayrı ekrandan yönetilir.
            </Typography>
          </Box>
          <Stepper activeStep={aktifAdim} nonLinear alternativeLabel sx={{ overflowX: "auto", pb: 0.5 }}>
            {finansalTabloAdimlari.map((adim, index) => (
              <Step key={adim.baslik} completed={tamamlananAdimlar[index]}>
                <StepButton color="inherit" onClick={() => setAktifAdim(index)}>
                  {adim.baslik}
                </StepButton>
              </Step>
            ))}
          </Stepper>
          <Alert severity="info" icon={false} sx={{ py: 0.75 }}>
            <Typography variant="subtitle2">
              {aktifAdim + 1}. {finansalTabloAdimlari[aktifAdim].baslik}
            </Typography>
            <Typography variant="body2">{finansalTabloAdimlari[aktifAdim].aciklama}</Typography>
            <Typography variant="caption" color="text.secondary">
              {finansalTabloAdimlari[aktifAdim].ipucu}
            </Typography>
          </Alert>
        </Stack>
      </Paper>
      <Paper
        variant="outlined"
        sx={{
          p: 1.5,
          mb: 2,
          borderColor: akilliYonlendirme.seviye === "error" ? "error.main" : akilliYonlendirme.seviye === "warning" ? "warning.main" : akilliYonlendirme.seviye === "success" ? "success.main" : "primary.main",
        }}
      >
        <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} alignItems={{ md: "center" }}>
          <Box sx={{ flexGrow: 1 }}>
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
              <Typography variant="subtitle2">{akilliYonlendirme.baslik}</Typography>
              <Chip
                size="small"
                variant="outlined"
                color={akilliYonlendirme.seviye}
                label={secilenSurum ? `${secilenSet?.ad} · ${seciliSurumYayindaMi ? "Yayında" : "Taslak"}` : "Tanım bekleniyor"}
              />
            </Stack>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {akilliYonlendirme.aciklama}
            </Typography>
            <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
              <Chip size="small" color={tamamlananAdimlar[0] ? "success" : "default"} label={tamamlananAdimlar[0] ? "Tanım hazır" : "Tanım kontrolü bekliyor"} />
              <Chip size="small" color={seciliTestMizani ? "success" : "default"} label={seciliTestMizani ? "Test mizanı hazır" : "Test mizanı bekliyor"} />
              <Chip size="small" color={onizlemeBasariliMi ? "success" : "default"} label={onizlemeBasariliMi ? "Önizleme başarılı" : "Önizleme bekliyor"} />
            </Stack>
          </Box>
          <Button
            variant="contained"
            color={akilliYonlendirme.seviye === "error" ? "error" : akilliYonlendirme.seviye === "warning" ? "warning" : akilliYonlendirme.seviye === "success" ? "success" : "primary"}
            onClick={onerilenIslemiCalistir}
            disabled={yonlendirmeYukleniyor || akilliYonlendirme.eylem === "bekle"}
            sx={{ minWidth: { md: 230 } }}
          >
            {yonlendirmeYukleniyor ? <CircularProgress size={18} color="inherit" /> : akilliYonlendirme.dugme}
          </Button>
        </Stack>
      </Paper>
      </>}
      <Box sx={{ display: kgkSayfasi ? "block" : "none" }}>
      <Paper variant="outlined" sx={{ p: 1.5, mb: 2 }}>
        <Stack spacing={1.5}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} alignItems={{ md: "center" }}>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="subtitle1" fontWeight={700}>KGK kaynağı ve hedef sürüm</Typography>
              <Typography variant="body2" color="text.secondary">
                Önce farkın uygulanacağı tanım ve sürümü seçin. KGK dosyasının standardı ve kapsamı hedefle uyuşmuyorsa aktarım engellenir.
              </Typography>
            </Box>
            <Button variant="outlined" size="small" onClick={() => router.push("/FinansalTabloYonetimi")}>
              Sürümlü tanım ve formüllere dön
            </Button>
          </Stack>
          <Alert severity="info" icon={false} sx={{ py: 0.75 }}>
            <strong>İzlenecek yol:</strong> 1. Hedef tanım ve sürümü seçin · 2. Rapor tarihini doğrulayın · 3. Otomatik taramayı başlatın · 4. Yalnız bulunan farkları inceleyip taslağa aktarın.
          </Alert>
          <Grid container spacing={1.25} alignItems="center">
            <Grid item xs={12} md={5}>
              <FormControl fullWidth size="small">
                <InputLabel>Hedef tanım seti</InputLabel>
                <Select label="Hedef tanım seti" value={secilenSet ? secilenSetId : ""} onChange={(event) => tanimSetiSec(Number(event.target.value))}>
                  {tanimSetleri.map((set) => <MenuItem key={set.id} value={set.id}>{set.kod} — {set.ad}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={5}>
              <FormControl fullWidth size="small">
                <InputLabel>Hedef sürüm</InputLabel>
                <Select label="Hedef sürüm" value={secilenSurum ? secilenSurumId : ""} onChange={(event) => surumSec(Number(event.target.value))}>
                  {(secilenSet?.surumler || []).map((surum) => (
                    <MenuItem key={surum.id} value={surum.id}>
                      {surum.etiket} · #{surum.surumNo} · {surumDurumKodu(surum.durum) === 3 ? "Yayında" : surumDurumKodu(surum.durum) === 1 ? "Taslak" : "Geçmiş"}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                <Chip size="small" variant="outlined" label={raporlamaStandardiAdi(secilenSet?.raporlamaStandardi)} />
                <Chip size="small" variant="outlined" label={kapsamAdi(secilenSet?.kapsam)} />
                {secilenSurum && <Chip size="small" color={surumDurumKodu(secilenSurum.durum) === 1 ? "warning" : surumDurumKodu(secilenSurum.durum) === 3 ? "success" : "default"} label={surumDurumKodu(secilenSurum.durum) === 1 ? "Taslak hedef" : surumDurumKodu(secilenSurum.durum) === 3 ? "Yayındaki sürüm" : "Geçmiş sürüm"} />}
              </Stack>
            </Grid>
          </Grid>
          {tanimHatasi && <Alert severity="error" onClose={() => setTanimHatasi("")}>{tanimHatasi}</Alert>}
          {surumYonetimiMesaji && <Alert severity="success" onClose={() => setSurumYonetimiMesaji("")}>{surumYonetimiMesaji}</Alert>}
        </Stack>
      </Paper>
      <Paper variant="outlined" sx={{ p: 1.5, mb: 2 }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} alignItems={{ md: "center" }}>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="subtitle2">KGK kaynak sürümü ayrı izlenir</Typography>
            <Typography variant="body2" color="text.secondary">
              KGK dosya değişikliği doğrudan kullanıcı tanımını değiştirmez. Önce arşivlenir, kalem ve formül farkları incelenir, sonra seçili taslağa Admin onayıyla aktarılır.
            </Typography>
          </Box>
          {kgkTaramaGecmisi[0]
            ? <Chip color={kgkTaramaGecmisi[0].degisenDosyaSayisi > 0 ? "warning" : "success"} label={`Son tarama: ${kgkTaramaGecmisi[0].degisenDosyaSayisi} değişiklik · ${new Date(kgkTaramaGecmisi[0].bitis).toLocaleString("tr-TR")}`} />
            : <Chip variant="outlined" label={kgkGecmisYukleniyor ? "Tarama durumu okunuyor" : "Henüz tarama kaydı yok"} />}
        </Stack>
      </Paper>
      <ParentCard title="KGK format güncelleme kontrolü">
        <Stack spacing={1.5}>
          <Typography variant="body2" color="text.secondary">
            Raporlama dönemi bitiş tarihine göre resmi KGK kaynağı otomatik seçilir. 31.12.2023 öncesi ve 31.12.2023 ve sonrası formatlar ayrı izlenir; kontrol taslak oluşturmaz ve yayın yapmaz.
          </Typography>
          <Paper variant="outlined" sx={{ p: 1.25 }}>
            <Grid container spacing={1.25} alignItems="center">
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  size="small"
                  type="date"
                  label="Raporlama dönemi bitişi"
                  value={kgkRaporlamaTarihi}
                  onChange={(event) => {
                    setKgkRaporlamaTarihi(event.target.value);
                    setKgkKontrolSonucu(null);
                    setTanimHatasi("");
                    setSurumYonetimiMesaji("");
                    kgkFarkiniTemizle();
                  }}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={5}>
                <Typography variant="caption" color="text.secondary">Otomatik seçilen resmi kaynak</Typography>
                <Typography variant="body2" fontWeight={600}>
                  {seciliKgkKaynakDonemi?.ad || "Rapor tarihine uygun kaynak belirleniyor…"}
                </Typography>
              </Grid>
              <Grid item xs={12} md={3}>
                <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap" useFlexGap>
                  <Chip size="small" color={seciliKgkKaynakDonemi?.onerilenMi ? "success" : "warning"} label={seciliKgkKaynakDonemi?.onerilenMi ? "Tarih ile uyumlu" : "Tarih ile uyumsuz"} />
                  {seciliKgkKaynakDonemi && <Button size="small" component="a" href={seciliKgkKaynakDonemi.kaynakUrl} target="_blank" rel="noreferrer">Resmi sayfayı aç</Button>}
                </Stack>
              </Grid>
            </Grid>
          </Paper>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems={{ sm: "center" }} flexWrap="wrap" useFlexGap>
            <Button variant="contained" size="small" onClick={kgkTaraVeArsivle} disabled={kgkTaramaYukleniyor || !kgkKaynakDonemKodu || !seciliKgkKaynakDonemi?.onerilenMi || !secilenSet || !secilenSurum}>
              {kgkTaramaYukleniyor ? <CircularProgress size={18} color="inherit" /> : "KGK güncellemesini otomatik kontrol et"}
            </Button>
            {kgkKontrolSonucu && <Chip label={`${kgkKontrolSonucu.bulunanDosyaSayisi} dosya · ${kgkKontrolSonucu.degisenDosyaSayisi} değişiklik`} color={kgkKontrolSonucu.degisenDosyaSayisi > 0 ? "warning" : "success"} />}
            <Box sx={{ flexGrow: 1 }} />
            <Button variant="text" size="small" onClick={() => setKgkGelismisAraclarAcik((onceki) => !onceki)}>
              {kgkGelismisAraclarAcik ? "Teknik araçları gizle" : "Teknik araçları göster"}
            </Button>
          </Stack>
          <Box sx={{ display: kgkGelismisAraclarAcik ? "block" : "none" }}>
            <Paper variant="outlined" sx={{ p: 1.25, bgcolor: "action.hover" }}>
              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                <FormControl size="small" sx={{ minWidth: 320 }}>
                  <InputLabel>KGK kaynak dönemi</InputLabel>
                  <Select
                    label="KGK kaynak dönemi"
                    value={kgkKaynakDonemKodu}
                    onChange={(event) => {
                      setKgkKaynakDonemKodu(String(event.target.value));
                      setKgkKontrolSonucu(null);
                      kgkFarkiniTemizle();
                    }}
                  >
                    {kgkKaynakDonemleri.map((kaynak) => <MenuItem key={kaynak.kod} value={kaynak.kod}>{kaynak.ad}{kaynak.onerilenMi ? " — önerilen" : ""}</MenuItem>)}
                  </Select>
                </FormControl>
                <TextField size="small" type="number" label="En fazla deneme" value={kgkTaramaDenemesi} onChange={(event) => setKgkTaramaDenemesi(Math.min(5, Math.max(1, Number(event.target.value) || 1)))} inputProps={{ min: 1, max: 5 }} sx={{ width: 140 }} />
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <Switch size="small" checked={kgkHashleriIste} onChange={(event) => setKgkHashleriIste(event.target.checked)} />
                  <Typography variant="caption">SHA-256 hesapla</Typography>
                </Stack>
                <Button variant="outlined" size="small" onClick={kgkKontrolEt} disabled={kgkKontrolYukleniyor || !kgkKaynakDonemKodu || !seciliKgkKaynakDonemi?.onerilenMi}>
                  {kgkKontrolYukleniyor ? <CircularProgress size={16} /> : "Arşivlemeden kontrol et"}
                </Button>
                <Button variant="text" size="small" onClick={kgkTaramaGecmisiniYukle} disabled={kgkGecmisYukleniyor}>
                  {kgkGecmisYukleniyor ? <CircularProgress size={16} /> : "Geçmişi yenile"}
                </Button>
              </Stack>
            </Paper>
          </Box>
          {kgkKontrolSonucu && (
            <Paper variant="outlined" sx={{ p: 1.5, maxHeight: 360, overflow: "auto" }}>
              <Typography variant="caption" color="text.secondary" component="div" sx={{ mb: 1 }}>
                Kaynak: <a href={kgkKontrolSonucu.kaynakUrl} target="_blank" rel="noreferrer">{kgkKontrolSonucu.kaynakDonemAdi || "KGK elektronik finansal raporlama"}</a> · Kontrol: {new Date(kgkKontrolSonucu.kontrolTarihi).toLocaleString("tr-TR")}
              </Typography>
              <Table size="small">
                <TableHead><TableRow><TableCell>Standart</TableCell><TableCell>KGK dosyası</TableCell><TableCell>Durum</TableCell><TableCell align="right">Boyut</TableCell><TableCell align="right">İşlem</TableCell></TableRow></TableHead>
                <TableBody>
                  {kgkKontrolSonucu.dosyalar.map((dosya) => {
                    const hedefUyumsuzlugu = secilenSet ? kgkDosyaUyumsuzlugu(dosya, secilenSet) : "Hedef tanım seçilmedi.";
                    const incelenebilirMi = Boolean(dosya.degistiMi && dosya.oncekiSha256 && dosya.sha256 && /^(xlsx|xlsm)$/i.test(dosya.dosyaTuru));
                    return (
                      <TableRow key={dosya.url} hover>
                        <TableCell>{dosya.grup}</TableCell>
                        <TableCell>{dosya.baslik || dosya.dosyaAdi}</TableCell>
                        <TableCell>{!dosya.erisilebilirMi ? <Chip size="small" color="error" label="Erişilemiyor" /> : dosya.degistiMi ? <Chip size="small" color="warning" label="Yeni değişiklik" /> : dosya.karsilastirmaVarMi ? <Chip size="small" color="success" label="Değişiklik yok" /> : <Chip size="small" variant="outlined" label="İlk kez arşivlendi" />}</TableCell>
                        <TableCell align="right">{dosya.icerikUzunlugu ? `${Math.round(dosya.icerikUzunlugu / 1024)} KB` : "—"}</TableCell>
                        <TableCell align="right">
                          <Stack direction="row" spacing={0.5} justifyContent="flex-end" alignItems="center">
                            <Button size="small" component="a" href={dosya.url} target="_blank" rel="noreferrer">Kaynağı aç</Button>
                            {incelenebilirMi && hedefUyumsuzlugu && <Chip size="small" variant="outlined" label="Seçili tanımla uyumsuz" title={hedefUyumsuzlugu} />}
                            {incelenebilirMi && !hedefUyumsuzlugu && (
                              <Button size="small" variant="contained" color="info" onClick={() => kgkArsivWorkbookKarsilastir(dosya)} disabled={!secilenSurum || kgkArsivWorkbookYukleniyor === dosya.url}>
                                {kgkArsivWorkbookYukleniyor === dosya.url ? <CircularProgress size={16} color="inherit" /> : "Değişikliği incele"}
                              </Button>
                            )}
                          </Stack>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              {kgkKontrolSonucu.degisenDosyaSayisi === 0 && <Alert severity="success" sx={{ mt: 1 }}>Seçili dönem için yeni KGK format değişikliği bulunmadı.</Alert>}
              {kgkGelismisAraclarAcik && <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
                {kgkKontrolSonucu.dosyalar.map((dosya) => (
                  <Stack key={`kgk-islem-${dosya.url}`} direction="row" spacing={0.5}>
                    <Button size="small" variant="outlined" onClick={() => kgkDosyaIndir(dosya.url)} disabled={!dosya.erisilebilirMi || kgkIndirilenUrl === dosya.url}>
                      {kgkIndirilenUrl === dosya.url ? <CircularProgress size={16} /> : `${dosya.dosyaAdi} güvenli indir`}
                    </Button>
                    <Button size="small" variant="outlined" color="secondary" onClick={() => kgkDosyaArsivle(dosya.url)} disabled={!dosya.erisilebilirMi || kgkArsivlenenUrl === dosya.url}>
                      {kgkArsivlenenUrl === dosya.url ? <CircularProgress size={16} /> : "Arşivle"}
                    </Button>
                  </Stack>
                ))}
              </Stack>}
            </Paper>
          )}
          {kgkGelismisAraclarAcik && kgkTaramaGecmisi.length > 0 && (
            <Paper variant="outlined" sx={{ p: 1.5, maxHeight: 220, overflow: "auto" }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Son KGK taramaları</Typography>
              <Table size="small">
                <TableHead><TableRow><TableCell>Tarih</TableCell><TableCell>KGK dönemi</TableCell><TableCell>Dosya</TableCell><TableCell>Değişiklik</TableCell><TableCell>Arşiv</TableCell><TableCell>Hata</TableCell><TableCell>Deneme</TableCell></TableRow></TableHead>
                <TableBody>{kgkTaramaGecmisi.map((kayit) => <TableRow key={kayit.taramaId}><TableCell>{new Date(kayit.bitis).toLocaleString("tr-TR")}</TableCell><TableCell>{kayit.kaynakDonemAdi || "Eski kayıt"}</TableCell><TableCell>{kayit.bulunanDosyaSayisi}</TableCell><TableCell>{kayit.degisenDosyaSayisi}</TableCell><TableCell>{kayit.arsivlenenDosyaSayisi}</TableCell><TableCell>{kayit.hataSayisi}</TableCell><TableCell>{kayit.toplamDenemeSayisi}</TableCell></TableRow>)}</TableBody>
              </Table>
            </Paper>
          )}
          <Divider />
          <Typography variant="subtitle2">Değişiklik özeti</Typography>
          <Typography variant="caption" color="text.secondary">
            “Değişikliği incele” seçildiğinde önceki ve yeni KGK dosyası otomatik karşılaştırılır. Dosya veya JSON yüklemeniz gerekmez. Kalem ve formül farkları yalnız Admin onayıyla taslağa aktarılır; hiçbir değişiklik otomatik yayınlanmaz.
          </Typography>
          {kgkWorkbookSonucu && (
            <Paper variant="outlined" sx={{ p: 1.5, maxHeight: 320, overflow: "auto" }}>
              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap sx={{ mb: 1 }}>
                <Chip size="small" variant="outlined" label={`Hedef: ${secilenSet?.kod || "—"} · sürüm #${secilenSurum?.surumNo || "—"}`} />
                {kgkFarkBaglami?.dosya && <Chip size="small" variant="outlined" label={`Kaynak: ${kgkFarkBaglami.dosya.grup}`} />}
                <Chip size="small" color={kgkWorkbookSonucu.yapisalDegisiklikVarMi ? "warning" : "success"} label={kgkWorkbookSonucu.yapisalDegisiklikVarMi ? `${kgkWorkbookSonucu.farkSayisi} yapısal fark` : "Yapısal fark yok"} />
                {kgkWorkbookSonucu.makroVarMi && <Chip size="small" color="info" label="Makro bulundu; çalıştırılmadı" />}
                {(kgkWorkbookSonucu.semantikDegisiklikVarMi || kgkWorkbookSonucu.formulDegisikligiVarMi) && secilenSurum && surumDurumKodu(secilenSurum.durum) !== 1 && <Button size="small" variant="outlined" onClick={kgkFarktanTaslakOlustur} disabled={surumIslemiYukleniyor}>KGK farkından taslak oluştur</Button>}
                {kgkWorkbookSonucu.semantikDegisiklikVarMi && secilenSurum && surumDurumKodu(secilenSurum.durum) === 1 && !kgkKalemFarkiUygulandiMi && <Button size="small" variant="outlined" onClick={kgkKalemFarklariniTaslagAktar} disabled={surumIslemiYukleniyor}>KGK kalem farklarını taslağa aktar</Button>}
                {kgkKalemFarkiUygulandiMi && <Chip size="small" color="success" variant="outlined" label="Kalem farkları aktarıldı" />}
                {kgkWorkbookSonucu.formulDegisikligiVarMi && secilenSurum && surumDurumKodu(secilenSurum.durum) === 1 && !kgkFormulFarkiUygulandiMi && <Button size="small" variant="contained" color="secondary" onClick={kgkFormulFarklariniTaslagAktar} disabled={surumIslemiYukleniyor || (kgkWorkbookSonucu.semantikDegisiklikVarMi && !kgkKalemFarkiUygulandiMi)}>KGK formül farklarını taslağa aktar</Button>}
                {kgkFormulFarkiUygulandiMi && <Chip size="small" color="success" variant="outlined" label="Formül farkları aktarıldı" />}
              </Stack>
              {kgkWorkbookSonucu.farklar.length > 0 && <Table size="small"><TableHead><TableRow><TableCell>Tür</TableCell><TableCell>Anahtar</TableCell><TableCell>Değişiklik</TableCell></TableRow></TableHead><TableBody>{kgkWorkbookSonucu.farklar.map((fark) => <TableRow key={`${fark.degisiklikTuru}-${fark.anahtar}`}><TableCell>{fark.nesneTuru}</TableCell><TableCell>{fark.anahtar}</TableCell><TableCell>{fark.degisiklikTuru}</TableCell></TableRow>)}</TableBody></Table>}
              <Divider sx={{ my: 1 }} />
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                <Typography variant="caption" color="text.secondary">Finansal tablo kalemleri: {kgkWorkbookSonucu.oncekiKalemSayisi} → {kgkWorkbookSonucu.yeniKalemSayisi}</Typography>
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
      </Box>
      <Box sx={{ display: aktifAdim === 1 ? "block" : "none" }}>
      <Paper variant="outlined" sx={{ p: 1.5, mb: 2 }}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems={{ sm: "center" }}>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="subtitle2">Test ayrıntıları</Typography>
            <Typography variant="body2" color="text.secondary">
              Normal kullanımda yukarıdaki otomatik test yeterlidir. Mizan satırları, teknik üretim girdileri ve motor sonuçları yalnız inceleme gerektiğinde açılır.
            </Typography>
          </Box>
          <Button size="small" variant="outlined" onClick={() => setTestAyrintilariAcik((onceki) => !onceki)}>
            {testAyrintilariAcik ? "Ayrıntıları gizle" : "Ayrıntıları göster"}
          </Button>
        </Stack>
      </Paper>
      <Box sx={{ display: testAyrintilariAcik ? "block" : "none" }}>
      <ParentCard title="Sürümlü finansal tablo üretimi">
        <Stack spacing={1.5}>
          <Alert severity="info">
            Üretim yalnızca yayımlanmış sürümden çalışır. Kullanılan tanım snapshot&#39;ı, girdi SHA-256&#39;sı, değerler ve hesaplama izleri değişmez üretim arşivine kaydedilir.
          </Alert>
          <Paper variant="outlined" sx={{ p: 1.5, borderColor: "info.main" }}>
            <Stack spacing={1.25}>
              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                <Typography variant="subtitle2">İzole test mizanı</Typography>
                <Chip size="small" color={seciliTestMizani ? "success" : "default"} label={seciliTestMizani ? `Seçili · ${seciliTestMizani.satirlar.length} satır` : "Seçili değil"} />
                <Typography variant="caption" color="text.secondary">Bu fixture gerçek mizan ve üretim arşivine yazılmaz.</Typography>
              </Stack>
              <Grid container spacing={1.25}>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField fullWidth size="small" label="Test mizanı adı" value={testMizanAdi} onChange={(event) => setTestMizanAdi(event.target.value)} />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField fullWidth size="small" type="number" label="Denetlenen ID" value={uretimDenetlenenId} onChange={(event) => setUretimDenetlenenId(event.target.value)} />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField fullWidth size="small" type="number" label="Yıl" value={uretimYil} onChange={(event) => setUretimYil(event.target.value)} />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Stack direction="row" spacing={0.5} alignItems="center" sx={{ height: "100%" }}>
                    <Switch size="small" checked={uretimKonsolide} onChange={(event) => setUretimKonsolide(event.target.checked)} />
                    <Typography variant="body2">Konsolide test verisi</Typography>
                  </Stack>
                </Grid>
              </Grid>
              <TextField
                fullWidth
                size="small"
                multiline
                minRows={5}
                label="Test mizanı satırları (JSON)"
                value={testMizanSatirlariJson}
                onChange={(event) => setTestMizanSatirlariJson(event.target.value)}
                helperText="Her satırda detayKodu, borc ve alacak zorunludur; bakiye alanları boşsa otomatik hesaplanır."
              />
              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                <Button variant="contained" color="info" size="small" onClick={() => void testMizaniOlustur()} disabled={testMizanYukleniyor}>
                  {testMizanYukleniyor ? <CircularProgress size={18} color="inherit" /> : "Test mizanı oluştur"}
                </Button>
                <Button variant="outlined" color="info" size="small" onClick={mevcutMizaniEditoreYukle} disabled={mevcutMizanYukleniyor}>
                  {mevcutMizanYukleniyor ? <CircularProgress size={18} /> : "Mevcut mizanı editöre al"}
                </Button>
                <Button variant="outlined" size="small" onClick={testMizanListesiniYukle} disabled={testMizanListesiYukleniyor}>
                  {testMizanListesiYukleniyor ? <CircularProgress size={18} /> : "Kayıtlı test mizanlarını yükle"}
                </Button>
                {seciliTestMizani && <Chip size="small" variant="outlined" label={`SHA-256 ${seciliTestMizani.sha256.slice(0, 16)}…`} />}
              </Stack>
              {mevcutMizanBilgi && <Alert severity="info" variant="outlined">{mevcutMizanBilgi}</Alert>}
              {testMizanlari.length > 0 && <Table size="small">
                <TableHead><TableRow><TableCell>Ad</TableCell><TableCell>Denetlenen / yıl</TableCell><TableCell>Satır</TableCell><TableCell>Oluşturma</TableCell><TableCell /></TableRow></TableHead>
                <TableBody>{testMizanlari.slice(0, 10).map((kayit) => <TableRow key={kayit.id} hover selected={seciliTestMizani?.id === kayit.id}>
                  <TableCell>{kayit.ad}</TableCell>
                  <TableCell>{kayit.denetlenenId} / {kayit.yil}{kayit.konsolidasyonMu ? " · Konsolide" : ""}</TableCell>
                  <TableCell>{kayit.satirlar.length}</TableCell>
                  <TableCell>{new Date(kayit.olusturmaTarihi).toLocaleString("tr-TR")}</TableCell>
                  <TableCell align="right"><Button size="small" onClick={() => testMizaniSec(kayit)}>Seç</Button></TableCell>
                </TableRow>)}</TableBody>
              </Table>}
              {seciliTestMizani && <Paper variant="outlined" sx={{ p: 1, maxHeight: 220, overflow: "auto" }}>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>Ana uygulamadaki mizan satırlarına karşılık gelen test verisi</Typography>
                <Table size="small">
                  <TableHead><TableRow><TableCell>Hesap</TableCell><TableCell>Ad</TableCell><TableCell align="right">Borç</TableCell><TableCell align="right">Alacak</TableCell><TableCell align="right">Bakiye</TableCell></TableRow></TableHead>
                  <TableBody>{seciliTestMizani.satirlar.slice(0, 100).map((satir) => <TableRow key={`${seciliTestMizani.id}-${satir.detayKodu}`}><TableCell>{satir.detayKodu}</TableCell><TableCell>{satir.hesapAdi}</TableCell><TableCell align="right">{satir.borc.toLocaleString("tr-TR")}</TableCell><TableCell align="right">{satir.alacak.toLocaleString("tr-TR")}</TableCell><TableCell align="right">{satir.bakiye.toLocaleString("tr-TR")}</TableCell></TableRow>)}</TableBody>
                </Table>
              </Paper>}
            </Stack>
          </Paper>
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
              {pilotDurumu && <Chip size="small" color={pilotDurumu.kontrolluPilotOnayi ? "success" : "warning"} label={pilotDurumu.kontrolluPilotOnayi ? "Kontrollü pilot onaylı" : "Kontrollü pilot onaysız"} />}
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
                <Select label="Tablo" value={secilenKalemTablosu?.id || ""} onChange={(event) => { setKalemTabloId(Number(event.target.value)); setUretimOnizlemeSonucu(null); }}>
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
          <Typography variant="caption" color="text.secondary">
            Önizleme, seçilen denetlenenin yıl ve konsolidasyon bilgisine göre mevcut mizan değerlerini okur; tanım sürümünü ve formülleri kullanarak sonuç üretir. Bu işlem üretim arşivine yazmaz.
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <Button variant="contained" size="small" onClick={finansalTabloUret} disabled={uretimYukleniyor || pilotDurumuYukleniyor || pilotDurumu?.yeniMotorEtkin !== true || !secilenSurum || !secilenKalemTablosu}>
              {uretimYukleniyor ? <CircularProgress size={18} color="inherit" /> : "Finansal tablo üret"}
            </Button>
            <Button variant="outlined" color="info" size="small" onClick={() => void finansalTabloOnizle()} disabled={uretimOnizlemeYukleniyor || uretimYukleniyor || !secilenSurum || !secilenKalemTablosu}>
              {uretimOnizlemeYukleniyor ? <CircularProgress size={18} /> : "Örnek mizanla önizle"}
            </Button>
            {uretimSonucu?.kayit.uretimId && <Button variant="outlined" size="small" onClick={finansalTabloyuTekrarUret} disabled={uretimTekrarYukleniyor}>
              {uretimTekrarYukleniyor ? <CircularProgress size={18} color="inherit" /> : "Bu üretimi tekrar çalıştır"}
            </Button>}
            {uretimSonucu && <Chip size="small" color={uretimSonucu.kayit.durum === 1 ? "success" : "error"} label={uretimSonucu.kayit.durum === 1 ? `Üretim arşivlendi · ${uretimSonucu.kayit.uretimId}` : `Üretim durumu: ${uretimSonucu.kayit.durum}`} />}
          </Stack>
          {pilotDurumu && !pilotDurumu.yeniMotorEtkin && <Alert severity="info">
            Yeni motor üretimi şu anda kapalıdır. Eski finansal tablo akışı çalışmaya devam eder; bu panelden yalnızca salt-okunur mizan önizlemesi yapılabilir. Üretim için hem özellik bayrağı hem de kontrollü pilot onayı gerekir.
          </Alert>}
          {uretimOnizlemeSonucu && <Paper variant="outlined" sx={{ p: 1.5, maxHeight: 320, overflow: "auto", borderColor: "info.main" }}>
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
              <Chip size="small" color={uretimOnizlemeSonucu.basariliMi ? "success" : "warning"} label={uretimOnizlemeSonucu.basariliMi ? "Salt-okunur önizleme tamamlandı" : `Önizleme durumu: ${uretimOnizlemeSonucu.durum}`} />
              <Typography variant="caption" color="text.secondary">{uretimOnizlemeSonucu.sonuclar.length} sonuç · sürüm {uretimOnizlemeSonucu.motorSurumu} · girdi {uretimOnizlemeSonucu.girdiSabitAnahtari}</Typography>
              <Chip size="small" variant="outlined" color="info" label="Arşivlenmedi" />
            </Stack>
            {uretimOnizlemeSonucu.aciklama && <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.75 }}>{uretimOnizlemeSonucu.aciklama}</Typography>}
            {uretimOnizlemeSonucu.sonuclar.length > 0 && <Table size="small" sx={{ mt: 1 }}>
              <TableHead><TableRow><TableCell>Tablo / hedef</TableCell><TableCell>Dönem</TableCell><TableCell>Durum</TableCell><TableCell align="right">Değer</TableCell><TableCell>Hata</TableCell></TableRow></TableHead>
              <TableBody>{uretimOnizlemeSonucu.sonuclar.slice(0, 100).map((satir, index) => <TableRow key={`${satir.anahtar.tabloSabitAnahtari}-${satir.anahtar.hedefSabitAnahtari}-${satir.anahtar.donemSabitAnahtari}-${index}`}>
                <TableCell>{satir.anahtar.tabloSabitAnahtari} · {satir.anahtar.hedefSabitAnahtari}</TableCell>
                <TableCell>{satir.anahtar.donemSabitAnahtari}</TableCell>
                <TableCell><Chip size="small" label={satir.durum === 1 ? "Bulundu" : satir.durum === 2 ? "Eksik" : `Hata ${satir.durum}`} color={satir.durum === 1 ? "success" : satir.durum === 2 ? "warning" : "error"} /></TableCell>
                <TableCell align="right">{satir.deger == null ? "-" : satir.deger.toLocaleString("tr-TR")}</TableCell>
                <TableCell>{satir.hataKodu || satir.aciklama || "-"}</TableCell>
              </TableRow>)}</TableBody>
            </Table>}
          </Paper>}
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
          <Paper variant="outlined" sx={{ p: 1.5, bgcolor: "background.default" }}>
            <Stack spacing={1.25}>
              <Box>
                <Typography variant="subtitle2">Otomatik KGK Excel çıktısı</Typography>
                <Typography variant="caption" color="text.secondary">
                  Rapor tarihi, finansal tablo standardı, kapsamı ve yöntemi kullanılarak doğru resmi KGK şablonu otomatik seçilir. Hücreler seçili tanım sürümündeki KGK Excel hedeflerinden doldurulur; dosya veya JSON yüklemeniz gerekmez.
                </Typography>
              </Box>
              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                <Button variant="contained" size="small" onClick={kgkFinansalTabloOtomatikOlustur} disabled={!uretimSonucu || kgkRenderYukleniyor}>
                  {kgkRenderYukleniyor ? <CircularProgress size={18} color="inherit" /> : "KGK Excel'i otomatik oluştur ve indir"}
                </Button>
                {!uretimSonucu && <Chip size="small" variant="outlined" label="Önce tablo üretimi oluşturun" />}
              </Stack>
              {kgkRenderSonucu && <Alert severity={kgkRenderSonucu.eslesmeyenDegerSayisi > 0 ? "warning" : "success"}>
                {kgkRenderSonucu.doldurulanHucreSayisi} hücre dolduruldu · sürüm {kgkRenderSonucu.tanimSurumu || "-"} · kaynak {kgkRenderSonucu.kaynakDonemKodu || "-"} · çıktı SHA {kgkRenderSonucu.sha256?.slice(0, 12) || "-"}
                {kgkRenderSonucu.eslesmeyenDegerSayisi > 0 && ` · ${kgkRenderSonucu.eslesmeyenDegerSayisi} değer için bu sürümde KGK hücre hedefi yok. Formül ekranında hedefleri tamamlayıp yeni üretim oluşturun.`}
              </Alert>}
            </Stack>
          </Paper>
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
        </Stack>
      </ParentCard>
      </Box>
      </Box>
      <Box sx={{ display: aktifAdim === 0 ? "block" : "none" }}>
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
          {tanimYukleniyor && <CircularProgress size={22} />}
          {!tanimYukleniyor && tanimSetleri.length === 0 && <Alert severity="info">Filtreye uyan tanım seti bulunamadı.</Alert>}
          {tanimSetleri.length > 0 && (
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Tanım seti</InputLabel>
                  <Select label="Tanım seti" value={secilenSet ? secilenSetId : ""} onChange={(event) => tanimSetiSec(Number(event.target.value))}>
                    {tanimSetleri.map((set) => <MenuItem key={set.id} value={set.id}>{set.kod} — {set.ad}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={8}>
                <FormControl fullWidth size="small">
                  <InputLabel>Sürüm</InputLabel>
                  <Select label="Sürüm" value={secilenSurum ? secilenSurumId : ""} onChange={(event) => surumSec(Number(event.target.value))}>
                    {(secilenSet?.surumler || []).map((surum) => <MenuItem key={surum.id} value={surum.id}>{surum.etiket} · #{surum.surumNo} · {surumDurumKodu(surum.durum) === 3 ? "Yayında" : surumDurumKodu(surum.durum) === 1 ? "Taslak" : surumDurumKodu(surum.durum) === 2 ? "Doğrulandı" : "Kaldırıldı"}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          )}
          <Alert
            severity={surumYonetimiDurumu?.etkin ? "warning" : "info"}
            variant="outlined"
            action={surumYonetimiYukleniyor ? <CircularProgress size={18} /> : undefined}
          >
            <strong>{surumYonetimiDurumu?.etkin ? "İzole sürüm pilotu açık" : "Canlı sürüm geçişi kapalı"}</strong>
            <br />
            {surumYonetimiDurumu?.aciklama || "Sürüm yönetimi durumu kontrol ediliyor."}
          </Alert>
          {secilenSet && (
            <Paper variant="outlined" sx={{ overflowX: "auto" }}>
              <Box sx={{ px: 1.5, py: 1 }}>
                <Typography variant="subtitle2">Tanım ve formül sürüm geçmişi</Typography>
                <Typography variant="caption" color="text.secondary">
                  Her değişiklik taslakta yapılır. Yayındaki sürüm değiştirilemez; geri dönüş eski sürümden yeni taslak oluşturarak yapılır.
                </Typography>
              </Box>
              <Table size="small">
                <TableHead><TableRow><TableCell>Sürüm</TableCell><TableCell>Kaynak</TableCell><TableCell>Durum</TableCell><TableCell align="right">Kalem</TableCell><TableCell align="right">Formül</TableCell><TableCell>Tarih</TableCell><TableCell align="right">İşlem</TableCell></TableRow></TableHead>
                <TableBody>
                  {secilenSet.surumler.map((surum) => {
                    const durum = surumDurumKodu(surum.durum);
                    return (
                      <TableRow key={surum.id} hover selected={surum.id === secilenSurumId}>
                        <TableCell><strong>#{surum.surumNo}</strong> · {surum.etiket}</TableCell>
                        <TableCell>{surum.kaynakSurumId ? `#${secilenSet.surumler.find((aday) => aday.id === surum.kaynakSurumId)?.surumNo || surum.kaynakSurumId}` : "Başlangıç"}</TableCell>
                        <TableCell><Chip size="small" variant={durum === 3 ? "filled" : "outlined"} color={durum === 3 ? "success" : durum === 1 ? "warning" : "default"} label={durum === 3 ? "Aktif" : durum === 1 ? "Taslak" : durum === 2 ? "Doğrulandı" : "Geçmiş"} /></TableCell>
                        <TableCell align="right">{surum.kalemSayisi}</TableCell>
                        <TableCell align="right">{surum.formulSayisi}</TableCell>
                        <TableCell>{new Date(surum.guncellemeTarihi || surum.olusturmaTarihi).toLocaleDateString("tr-TR")}</TableCell>
                        <TableCell align="right">
                          <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                            <Button size="small" onClick={() => surumSec(surum.id)}>İncele</Button>
                            {durum !== 1 && <Button size="small" variant="outlined" onClick={() => void taslakKlonla(surum, durum === 4)} disabled={surumIslemiYukleniyor}>{durum === 4 ? "Geri dön" : "Taslak oluştur"}</Button>}
                          </Stack>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Paper>
          )}
          {secilenSurum && (
            <Paper variant="outlined" sx={{ p: 1.5 }}>
              <Stack spacing={1.5}>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  <Chip label={`Sürüm ${secilenSurum.surumNo} · ${secilenSurum.etiket}`} color={surumDurumKodu(secilenSurum.durum) === 3 ? "success" : "default"} />
                  <Chip label={`Taslak revizyonu ${secilenSurum.eszamanlilikSurumu}`} variant="outlined" />
                  <Chip label={`${secilenSurum.tabloSayisi} tablo · ${secilenSurum.kalemSayisi} kalem · ${secilenSurum.formulSayisi} formül`} variant="outlined" />
                  <Button size="small" variant="outlined" onClick={() => void taslakKlonla()} disabled={surumIslemiYukleniyor}>Yeni taslak oluştur</Button>
                  {surumDurumKodu(secilenSurum.durum) === 1 && <>
                    <Button size="small" variant="outlined" onClick={() => setMetaDuzenleme((onceki) => !onceki)}>{metaDuzenleme ? "Bilgi düzenlemeyi kapat" : "Sürüm bilgilerini düzenle"}</Button>
                    <Button size="small" variant="contained" color="secondary" onClick={teknikDogrula} disabled={dogrulamaYukleniyor}>
                      {dogrulamaYukleniyor ? <CircularProgress size={16} color="inherit" /> : "Teknik doğrula"}
                    </Button>
                    <Button size="small" variant="text" onClick={() => setTeknikDuzenlemeAraclariAcik((onceki) => !onceki)}>
                      {teknikDuzenlemeAraclariAcik ? "Tanım ve formül düzenleyicisini gizle" : "Tanım ve formülleri düzenle"}
                    </Button>
                  </>}
                </Stack>
                <Alert severity="info" variant="outlined">
                  Bir kalem veya formül kaydedildiğinde taslak revizyon numarası artar. Yayındaki sürüm hiçbir zaman yerinde değiştirilmez; onaylanan taslak yeni sürüm olarak devreye alınır.
                </Alert>
                <LegacyFormulAktarimCard token={user.token || ""} surum={secilenSurum} onApplied={legacyFormulAktarimiTamamlandi} />
                {surumDurumKodu(secilenSurum.durum) === 1 && (
                  <Paper variant="outlined" sx={{ p: 1.5, borderColor: surumYonetimiDurumu?.etkin ? "warning.main" : "divider" }}>
                    <Stack spacing={1.25}>
                      <Box>
                        <Typography variant="subtitle2">Kontrollü devreye alma</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Önce teknik doğrulama ve izole önizleme tamamlanır. Devreye alma eski üretimleri değiştirmez; yalnız yeni üretimlerin kullanacağı aktif sürümü değiştirir.
                        </Typography>
                      </Box>
                      <Stack direction={{ xs: "column", md: "row" }} spacing={1} alignItems={{ md: "flex-start" }}>
                        <TextField size="small" type="date" label="Etkinlik tarihi" value={devreyeAlmaTarihi} onChange={(event) => setDevreyeAlmaTarihi(event.target.value)} InputLabelProps={{ shrink: true }} sx={{ minWidth: 180 }} />
                        <TextField size="small" fullWidth label="Admin onay açıklaması" value={devreyeAlmaAciklamasi} onChange={(event) => setDevreyeAlmaAciklamasi(event.target.value)} inputProps={{ maxLength: 500 }} helperText="En az 10 karakter; değişiklik ve onay nedeni." />
                        <Button variant="contained" color="success" onClick={taslagiDevreyeAl} disabled={devreyeAlmaYukleniyor || !surumYonetimiDurumu?.etkin || !teknikDogrulamaBasariliMi || !onizlemeBasariliMi || devreyeAlmaAciklamasi.trim().length < 10} sx={{ minWidth: 150 }}>
                          {devreyeAlmaYukleniyor ? <CircularProgress size={18} color="inherit" /> : "Devreye al"}
                        </Button>
                      </Stack>
                      {!surumYonetimiDurumu?.etkin && <Alert severity="info" variant="outlined">Canlı kullanıcılar eski tablolarla devam ediyor. Özellik bayrağı açılmadan bu işlem çalışmaz.</Alert>}
                    </Stack>
                  </Paper>
                )}
                {metaDuzenleme && surumDurumKodu(secilenSurum.durum) === 1 && (
                  <Paper variant="outlined" sx={{ p: 1.5, bgcolor: "action.hover" }}>
                    <Grid container spacing={1.5}>
                      <Grid item xs={12} md={4}><TextField fullWidth size="small" label="Sürüm etiketi" value={metaEtiket} onChange={(event) => setMetaEtiket(event.target.value)} inputProps={{ maxLength: 100 }} /></Grid>
                      <Grid item xs={12} md={4}><TextField fullWidth size="small" type="date" label="Geçerlilik başlangıcı" value={metaBaslangic} onChange={(event) => setMetaBaslangic(event.target.value)} InputLabelProps={{ shrink: true }} /></Grid>
                      <Grid item xs={12} md={4}><TextField fullWidth size="small" type="date" label="Geçerlilik bitişi" value={metaBitis} onChange={(event) => setMetaBitis(event.target.value)} InputLabelProps={{ shrink: true }} /></Grid>
                      <Grid item xs={12}><TextField fullWidth size="small" multiline minRows={2} label="Açıklama" value={metaAciklama} onChange={(event) => setMetaAciklama(event.target.value)} inputProps={{ maxLength: 1000 }} /></Grid>
                      <Grid item xs={12}><Stack direction="row" spacing={1}><Button variant="contained" size="small" onClick={metaKaydet} disabled={metaKaydediliyor || !metaEtiket.trim() || !metaBaslangic}>{metaKaydediliyor ? <CircularProgress size={18} color="inherit" /> : "Taslak bilgilerini kaydet"}</Button><Button size="small" onClick={() => setMetaDuzenleme(false)} disabled={metaKaydediliyor}>İptal</Button></Stack></Grid>
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
                {teknikDuzenlemeAraclariAcik && secilenSet && secilenSet.surumler.length > 1 && (
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
                      <TableBody>{surumDetayi.tablolar.map((tablo) => <TableRow key={tablo.id} hover><TableCell><strong>{tablo.kod}</strong><br /><Typography variant="caption" color="text.secondary">{tablo.ad}</Typography></TableCell><TableCell>{tabloTuruEtiketi(tablo.tabloTuru)}</TableCell><TableCell align="right">{tablo.donemKolonlari.length}</TableCell><TableCell align="right">{tablo.kalemler.length}</TableCell><TableCell align="right">{tablo.kurallar.length}</TableCell><TableCell align="right">{tablo.kontrolKurallari.length}</TableCell></TableRow>)}</TableBody>
                    </Table>
                  </Box>
                )}
                {teknikDuzenlemeAraclariAcik && surumDetayi && surumDurumKodu(secilenSurum.durum) === 1 && secilenKalemTablosu && (
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
                {teknikDuzenlemeAraclariAcik && surumDetayi && surumDurumKodu(secilenSurum.durum) === 1 && secilenKalemTablosu && (
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
                          <Grid item xs={12}>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Box sx={{ flexGrow: 1 }}>
                                <Typography variant="subtitle2">Formül terimleri</Typography>
                                <Typography variant="caption" color="text.secondary">Kaynak, dönem, değer alanı, işaret ve katsayı tamamen tanımdan yönetilir; kod değişikliği gerekmez.</Typography>
                              </Box>
                              <Button size="small" variant="outlined" onClick={kuralTerimiEkle}>Terim ekle</Button>
                            </Stack>
                          </Grid>
                          {kuralForm.terimler.map((terim, index) => (
                            <Grid item xs={12} key={`${terim.id}-${terim.sira}-${index}`}>
                              <Paper variant="outlined" sx={{ p: 1.25 }}>
                                <Grid container spacing={1} alignItems="center">
                                  <Grid item xs={12} md={2}>
                                    <FormControl size="small" fullWidth><InputLabel>Kaynak türü</InputLabel><Select label="Kaynak türü" value={terim.kaynakTuru} onChange={(event) => kuralTerimiGuncelle(index, { kaynakTuru: Number(event.target.value) })}><MenuItem value={1}>Hesap kodu</MenuItem><MenuItem value={2}>Hesap kodu öneki</MenuItem><MenuItem value={3}>Finansal kalem</MenuItem><MenuItem value={4}>Önceki üretim</MenuItem><MenuItem value={5}>Sistem parametresi</MenuItem><MenuItem value={6}>Sabit</MenuItem></Select></FormControl>
                                  </Grid>
                                  <Grid item xs={12} md={3}><TextField size="small" label={`Kaynak anahtarı ${index + 1}`} fullWidth required value={terim.kaynakAnahtari} onChange={(event) => kuralTerimiGuncelle(index, { kaynakAnahtari: event.target.value })} /></Grid>
                                  <Grid item xs={6} md={1.5}>
                                    <FormControl size="small" fullWidth><InputLabel>İşlem</InputLabel><Select label="İşlem" value={terim.operator} onChange={(event) => kuralTerimiGuncelle(index, { operator: Number(event.target.value) })}><MenuItem value={1}>Topla</MenuItem><MenuItem value={2}>Çıkar</MenuItem></Select></FormControl>
                                  </Grid>
                                  <Grid item xs={6} md={1.5}><TextField size="small" label="Katsayı" type="number" fullWidth error={terim.katsayi === 0} helperText={terim.katsayi === 0 ? "Sıfır olamaz" : ""} value={terim.katsayi} onChange={(event) => kuralTerimiGuncelle(index, { katsayi: Number(event.target.value) })} /></Grid>
                                  <Grid item xs={12} md={2}>
                                    <FormControl size="small" fullWidth><InputLabel>Değer alanı</InputLabel><Select label="Değer alanı" value={terim.degerAlani} onChange={(event) => kuralTerimiGuncelle(index, { degerAlani: Number(event.target.value) })}><MenuItem value={1}>Bakiye</MenuItem><MenuItem value={2}>Borç</MenuItem><MenuItem value={3}>Alacak</MenuItem><MenuItem value={4}>Rapor borç</MenuItem><MenuItem value={5}>Rapor alacak</MenuItem><MenuItem value={6}>Kontrol bakiye</MenuItem><MenuItem value={7}>Transfer fişi hariç bakiye</MenuItem></Select></FormControl>
                                  </Grid>
                                  <Grid item xs={12} md={2}><Button color="error" size="small" onClick={() => kuralTerimiSil(index)}>Terimi kaldır</Button></Grid>
                                  <Grid item xs={12} md={2}>
                                    <FormControl size="small" fullWidth><InputLabel>Dönem</InputLabel><Select label="Dönem" value={terim.donemDavranisi} onChange={(event) => kuralTerimiGuncelle(index, { donemDavranisi: Number(event.target.value) })}><MenuItem value={1}>Cari dönem</MenuItem><MenuItem value={2}>Önceki dönem</MenuItem><MenuItem value={3}>Açılış</MenuItem><MenuItem value={4}>Değişim</MenuItem><MenuItem value={5}>Özel</MenuItem></Select></FormControl>
                                  </Grid>
                                  <Grid item xs={6} md={1.5}><TextField size="small" label="Dönem ofseti" type="number" fullWidth inputProps={{ min: -100, max: 100 }} value={terim.donemOfseti} onChange={(event) => kuralTerimiGuncelle(index, { donemOfseti: Number(event.target.value) })} /></Grid>
                                  <Grid item xs={12} md={2}>
                                    <FormControl size="small" fullWidth><InputLabel>Terim işareti</InputLabel><Select label="Terim işareti" value={terim.isaretPolitikasi} onChange={(event) => kuralTerimiGuncelle(index, { isaretPolitikasi: Number(event.target.value) })}><MenuItem value={1}>Olduğu gibi</MenuItem><MenuItem value={2}>Mutlak değer</MenuItem><MenuItem value={3}>Yalnız pozitif</MenuItem><MenuItem value={4}>Yalnız negatif</MenuItem><MenuItem value={5}>Ters işaret</MenuItem></Select></FormControl>
                                  </Grid>
                                  <Grid item xs={12} md={4}><TextField size="small" label="Kaynak formül notu" fullWidth value={terim.hamTerim} onChange={(event) => kuralTerimiGuncelle(index, { hamTerim: event.target.value })} /></Grid>
                                  <Grid item xs={12} md={2.5}><Stack direction="row" spacing={0.5} alignItems="center"><Switch size="small" checked={terim.zorunluMu} onChange={(event) => kuralTerimiGuncelle(index, { zorunluMu: event.target.checked })} /><Typography variant="caption">Kaynak zorunlu</Typography></Stack></Grid>
                                </Grid>
                              </Paper>
                            </Grid>
                          ))}
                          <Grid item xs={12}><Stack direction="row" spacing={1}><Button variant="contained" size="small" onClick={yeniKuralAcik ? kuralOlustur : kuralKaydet} disabled={kuralKaydediliyor || (yeniKuralAcik && !yeniKuralKalemId) || kuralForm.terimler.some((terim) => !terim.kaynakAnahtari.trim() || terim.katsayi === 0)}>{kuralKaydediliyor ? <CircularProgress size={18} color="inherit" /> : yeniKuralAcik ? "Yeni kuralı kaydet" : "Kuralı kaydet"}</Button><Button size="small" onClick={() => { setDuzenlenenKuralId(0); setYeniKuralAcik(false); }} disabled={kuralKaydediliyor}>İptal</Button></Stack></Grid>
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
      </Box>
      {aktifAdim === 0 && (
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems={{ sm: "center" }} sx={{ mt: 2 }}>
          <Alert severity="success" variant="outlined" sx={{ flexGrow: 1 }}>
            Başlangıç finansal tablo tanımları uygulamada hazırdır. Normal kullanımda JSON paketi veya manifest seçmeniz gerekmez.
          </Alert>
          <Button size="small" variant="text" onClick={() => setGelismisPaketAraclariAcik((onceki) => !onceki)}>
            {gelismisPaketAraclariAcik ? "Gelişmiş paket araçlarını gizle" : "Gelişmiş paket araçlarını göster"}
          </Button>
        </Stack>
      )}
      <Box sx={{ display: aktifAdim === 0 && gelismisPaketAraclariAcik ? "block" : "none", mt: 2 }}>
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
      </Box>
      {!kgkSayfasi && <Paper
        variant="outlined"
        sx={{
          mt: 2,
          p: 1.5,
          position: "sticky",
          bottom: 12,
          zIndex: 4,
          bgcolor: "background.paper",
          boxShadow: 2,
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
          <Button
            variant="text"
            disabled={aktifAdim === 0}
            onClick={() => setAktifAdim((onceki) => Math.max(0, onceki - 1))}
          >
            Geri
          </Button>
          <Typography variant="caption" color="text.secondary" textAlign="center">
            {aktifAdim + 1} / 2
          </Typography>
          <Button
            variant="contained"
            disabled={aktifAdim === 1}
            onClick={() => setAktifAdim((onceki) => Math.min(1, onceki + 1))}
          >
            {aktifAdim < 1
              ? `Sonraki: ${finansalTabloAdimlari[aktifAdim + 1].baslik}`
              : "Akış tamamlandı"}
          </Button>
        </Stack>
      </Paper>}
    </PageContainer>
  );
};

export default Page;
