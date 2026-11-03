"use client";

import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
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
  StepLabel,
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
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Grid from "@mui/material/GridLegacy";
import { format } from "date-fns";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import PageContainer from "@/app/components/Container/PageContainer";
import Breadcrumb from "@/app/components/Layout/Shared/Breadcrumb/Breadcrumb";
import ParentCard from "@/app/components/Shared/ParentCard";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import {
  FinansalSurumDetay,
  FinansalTabloTabloRevizyonu,
  FinansalSurumDogrulamaSonucu,
  FinansalTanimSeti,
  getFinansalSurumDetay,
  getFinansalTabloTabloRevizyonlari,
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
  getKgkAnaSurumler,
  KgkAnaSurum,
  activateKgkAnaSurum,
  applyKgkFormulFarklari,
  createFinansalTabloUretimi,
  previewFinansalTabloUretimi,
  getFinansalTabloUretimGecmisi,
  getFinansalTabloSistemDurumu,
  getFinansalTabloKaliciArsivDurumu,
  getFinansalTabloArsivDogrulamasi,
  getFinansalTabloKaliciArsivHazirligi,
  getFinansalTabloArsivKarsilastirmasi,
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
  FinansalTabloSistemDurumApiSonucu,
  FinansalTabloKaliciArsivDurumApiSonucu,
  FinansalTabloArsivDogrulamaApiSonucu,
  FinansalTabloKaliciArsivHazirlikApiSonucu,
  FinansalTabloArsivKarsilastirmaApiSonucu,
  FinansalTabloAnaTabloGecisi,
  getFinansalTabloAnaTabloGecisleri,
  prepareFinansalTabloAnaTabloGecisi,
  activateFinansalTabloAnaTabloGecisi,
  rollbackFinansalTabloAnaTabloGecisi,
} from "@/api/FinansalTabloYonetimi/Tanimlar";
import {
  createFinansalTabloTestMizani,
  FinansalTabloMevcutMizanSatiri,
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
  hesaplamaSekli: number;
  karsilastirmaDegerAlani: number;
  karsilastirmaDonemDavranisi: number;
  karsilastirmaDonemOfseti: number;
  karsilastirmaIsaretPolitikasi: number;
  farkYonu: number;
  sonucIsaretPolitikasi: number;
  katsayiKaynakTuru: number | null;
  katsayiKaynakAnahtari: string;
  katsayiDonemDavranisi: number;
  katsayiDonemOfseti: number;
  asgariMutlakFark: number;
};

const degerAlaniEtiketi = (deger: number) => ({
  1: "Bakiye",
  2: "Borç",
  3: "Alacak",
  4: "Rapor borç",
  5: "Rapor alacak",
  6: "Kontrol bakiye",
  7: "Transfer fişi hariç bakiye",
  8: "Transfer fişi hariç rapor borç",
  9: "Transfer fişi hariç rapor alacak",
  10: "Transfer fişi hariç kontrol bakiye",
} as Record<number, string>)[deger] ?? `Alan ${deger}`;

const donemEtiketi = (davranis: number, ofset: number) => {
  const ad = ({ 1: "Cari dönem", 2: "Önceki dönem", 3: "Açılış", 4: "Değişim", 5: "Özel" } as Record<number, string>)[davranis] ?? `Dönem ${davranis}`;
  return `${ad}${ofset ? ` (${ofset > 0 ? "+" : ""}${ofset})` : ""}`;
};

const isaretEtiketi = (deger: number) => ({
  1: "olduğu gibi",
  2: "mutlak",
  3: "yalnız pozitif",
  4: "yalnız negatif",
  5: "ters işaret",
} as Record<number, string>)[deger] ?? `işaret ${deger}`;

const yeniKuralTerimi = (sira: number): KuralTerimiFormu => ({
  id: 0,
  sira,
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
  hesaplamaSekli: 1,
  karsilastirmaDegerAlani: 1,
  karsilastirmaDonemDavranisi: 2,
  karsilastirmaDonemOfseti: -1,
  karsilastirmaIsaretPolitikasi: 1,
  farkYonu: 1,
  sonucIsaretPolitikasi: 1,
  katsayiKaynakTuru: null,
  katsayiKaynakAnahtari: "",
  katsayiDonemDavranisi: 1,
  katsayiDonemOfseti: 0,
  asgariMutlakFark: 0,
});

const terimOzeti = (terim: KuralTerimiFormu) => {
  const kaynak = `${terim.kaynakAnahtari || "hesap"}.${degerAlaniEtiketi(terim.degerAlani)} [${donemEtiketi(terim.donemDavranisi, terim.donemOfseti)}; ${isaretEtiketi(terim.isaretPolitikasi)}]`;
  const karsilastirma = `${terim.kaynakAnahtari || "hesap"}.${degerAlaniEtiketi(terim.karsilastirmaDegerAlani)} [${donemEtiketi(terim.karsilastirmaDonemDavranisi, terim.karsilastirmaDonemOfseti)}; ${isaretEtiketi(terim.karsilastirmaIsaretPolitikasi)}]`;
  const fark = terim.farkYonu === 2 ? `${karsilastirma} − ${kaynak}` : `${kaynak} − ${karsilastirma}`;
  const hesap = terim.hesaplamaSekli === 2
    ? `(${fark}) → ${isaretEtiketi(terim.sonucIsaretPolitikasi)}${terim.asgariMutlakFark > 0 ? `; |fark| < ${terim.asgariMutlakFark} ise 0` : ""}`
    : kaynak;
  const dinamikKatsayi = terim.katsayiKaynakTuru
    ? ` × ${terim.katsayiKaynakAnahtari || "dinamik katsayı"} [${donemEtiketi(terim.katsayiDonemDavranisi, terim.katsayiDonemOfseti)}]`
    : "";
  return `${terim.operator === 2 ? "Çıkar" : "Topla"}: ${hesap}${terim.katsayi !== 1 ? ` × ${terim.katsayi}` : ""}${dinamikKatsayi}`;
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
    baslik: "Sürümü hazırla",
    aciklama: "Varsa açık taslak, yoksa yayındaki sürüm seçilir. Formül değişikliği için düzenleme sayfasını açın.",
  },
  {
    baslik: "Test et ve devreye al",
    aciklama: "Örnek mizanla kontrol edin. Taslak başarılıysa bu adımda devreye alın.",
  },
] as const;

const varsayilanSurumuSec = (set: FinansalTanimSeti | undefined, taslakOncelikliMi: boolean) => {
  const birincilDurum = taslakOncelikliMi ? 1 : 3;
  const ikincilDurum = taslakOncelikliMi ? 3 : 1;
  return set?.surumler.find((surum) => surumDurumKodu(surum.durum) === birincilDurum)
    || set?.surumler.find((surum) => surumDurumKodu(surum.durum) === ikincilDurum)
    || set?.surumler[0];
};

type PageProps = { editorSurumId?: number };

const Page = ({ editorSurumId }: PageProps) => {
  const user = useSelector((state: AppState) => state.userReducer);
  const pathname = usePathname();
  const router = useRouter();
  const kgkSayfasi = pathname.endsWith("/KgkGuncellemeleri");
  const duzenleyiciSayfasi = editorSurumId !== undefined;
  const sayfaBasligi = kgkSayfasi ? "KGK Güncellemeleri" : duzenleyiciSayfasi ? "Sürüm ve Formül Düzenleme" : "Sürümlü Tanım ve Formüller";
  const breadcrumbItems = [
    { to: "/Anasayfa", title: "Admin Menüsü" },
    { to: "/FinansalTabloYonetimi", title: "Sürümlü Tanım ve Formüller" },
    ...(kgkSayfasi
      ? [{ to: "/FinansalTabloYonetimi/KgkGuncellemeleri", title: "KGK Güncellemeleri" }]
      : duzenleyiciSayfasi ? [{ to: pathname, title: "Sürüm ve Formül Düzenleme" }] : []),
  ];
  const [aktifAdim, setAktifAdim] = useState(kgkSayfasi ? 2 : 0);
  const [tanimFiltreleriAcik, setTanimFiltreleriAcik] = useState(false);
  const [surumGecmisiAcik, setSurumGecmisiAcik] = useState(false);
  const [editorAyrintilariAcik, setEditorAyrintilariAcik] = useState(false);
  const [kgkGelismisAraclarAcik, setKgkGelismisAraclarAcik] = useState(false);
  const [testAyrintilariAcik, setTestAyrintilariAcik] = useState(false);
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
  const [tabloRevizyonlari, setTabloRevizyonlari] = useState<FinansalTabloTabloRevizyonu[]>([]);
  const [revizyonHatasi, setRevizyonHatasi] = useState("");
  const [acikRevizyonId, setAcikRevizyonId] = useState(0);
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
  const [devreyeAlmaYukleniyor, setDevreyeAlmaYukleniyor] = useState(false);
  const [devreyeAlmaAciklamasi, setDevreyeAlmaAciklamasi] = useState("");
  const [devreyeAlmaTarihi, setDevreyeAlmaTarihi] = useState(() => format(new Date(), "yyyy-MM-dd"));
  const [sonDevreyeAlinanSurumId, setSonDevreyeAlinanSurumId] = useState<number | null>(null);
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
  const [kgkTaramaHatasi, setKgkTaramaHatasi] = useState("");
  const [kgkAnaSurumId, setKgkAnaSurumId] = useState<number | null>(null);
  const [kgkTaramaDenemesi, setKgkTaramaDenemesi] = useState(3);
  const [kgkTaramaGecmisi, setKgkTaramaGecmisi] = useState<KgkTaramaGecmisi[]>([]);
  const [kgkAnaSurumler, setKgkAnaSurumler] = useState<KgkAnaSurum[]>([]);
  const [kgkTopluTarih, setKgkTopluTarih] = useState(() => format(new Date(), "yyyy-MM-dd"));
  const [kgkTopluNeden, setKgkTopluNeden] = useState("");
  const [kgkTopluYukleniyor, setKgkTopluYukleniyor] = useState(false);
  const [kgkTopluHatasi, setKgkTopluHatasi] = useState("");
  const [kgkTopluMesaji, setKgkTopluMesaji] = useState("");
  const [kgkTopluSeciliId, setKgkTopluSeciliId] = useState(0);
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
  const [anaTabloGecisleri, setAnaTabloGecisleri] = useState<FinansalTabloAnaTabloGecisi[]>([]);
  const [anaTabloGecisYukleniyor, setAnaTabloGecisYukleniyor] = useState(false);
  const [anaTabloOnayMetni, setAnaTabloOnayMetni] = useState("");
  const [anaTabloAciklama, setAnaTabloAciklama] = useState("");
  const [testMizanAdi, setTestMizanAdi] = useState("Yeni motor test mizanı");
  const [testMizanSatirlariJson, setTestMizanSatirlariJson] = useState(`[
  { "yil": ${new Date().getFullYear()}, "detayKodu": "100.01", "hesapAdi": "Kasa", "borc": 1000, "alacak": 0 },
  { "yil": ${new Date().getFullYear()}, "detayKodu": "320.01", "hesapAdi": "Satıcılar", "borc": 0, "alacak": 1000 }
]`);
  const [testVerisiDuzenlendiMi, setTestVerisiDuzenlendiMi] = useState(false);
  const [testMizanFisSatirlariJson, setTestMizanFisSatirlariJson] = useState("[]");
  const [testMizanYukleniyor, setTestMizanYukleniyor] = useState(false);
  const [testMizanListesiYukleniyor, setTestMizanListesiYukleniyor] = useState(false);
  const [mevcutMizanYukleniyor, setMevcutMizanYukleniyor] = useState(false);
  const [mevcutMizanBilgi, setMevcutMizanBilgi] = useState("");
  const [uretimGecmisi, setUretimGecmisi] = useState<FinansalTabloUretimArsivSonucu[]>([]);
  const [uretimGecmisiYukleniyor, setUretimGecmisiYukleniyor] = useState(false);
  const [sistemDurumu, setSistemDurumu] = useState<FinansalTabloSistemDurumApiSonucu | null>(null);
  const [sistemDurumuYukleniyor, setSistemDurumuYukleniyor] = useState(false);
  const [kaliciArsivDurumu, setKaliciArsivDurumu] = useState<FinansalTabloKaliciArsivDurumApiSonucu | null>(null);
  const [kaliciArsivDurumuYukleniyor, setKaliciArsivDurumuYukleniyor] = useState(false);
  const [arsivDogrulama, setArsivDogrulama] = useState<FinansalTabloArsivDogrulamaApiSonucu | null>(null);
  const [arsivDogrulamaYukleniyor, setArsivDogrulamaYukleniyor] = useState(false);
  const [kaliciArsivHazirligi, setKaliciArsivHazirligi] = useState<FinansalTabloKaliciArsivHazirlikApiSonucu | null>(null);
  const [kaliciArsivHazirligiYukleniyor, setKaliciArsivHazirligiYukleniyor] = useState(false);
  const [arsivKarsilastirma, setArsivKarsilastirma] = useState<FinansalTabloArsivKarsilastirmaApiSonucu | null>(null);
  const [arsivKarsilastirmaYukleniyor, setArsivKarsilastirmaYukleniyor] = useState(false);
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
  const secilenSetIdRef = useRef(0);
  const sonSecilenSurumIdRef = useRef(0);

  /* eslint-disable react-hooks/set-state-in-effect -- Route mode changes the visible step of this shared page. */
  useEffect(() => {
    setAktifAdim((onceki) => kgkSayfasi ? 2 : onceki === 2 ? 0 : onceki);
  }, [kgkSayfasi]);
  /* eslint-enable react-hooks/set-state-in-effect */

  /* eslint-disable react-hooks/set-state-in-effect -- Loading state is reset when a new server read starts. */
  useEffect(() => {
    if (!user.token) return;
    let etkin = true;
    setTanimYukleniyor(true);
    getFinansalTanimSetleri(user.token, duzenleyiciSayfasi ? {} : {
      raporlamaStandardi: tanimFiltresi.raporlamaStandardi || undefined,
      kapsam: tanimFiltresi.kapsam || undefined,
      donusumTipi: tanimFiltresi.donusumTipi || undefined,
      aktifMi: tanimFiltresi.aktifMi,
    })
      .then((data) => {
        if (!etkin) return;
        setTanimHatasi("");
        setTanimSetleri(data);
        const ilkSet = duzenleyiciSayfasi
          ? data.find((set) => set.surumler.some((surum) => surum.id === editorSurumId))
          : data.find((set) => set.id === secilenSetIdRef.current) || data[0];
        secilenSetIdRef.current = ilkSet?.id || 0;
        setSecilenSetId(secilenSetIdRef.current);
        const ilkSurum = duzenleyiciSayfasi
          ? ilkSet?.surumler.find((surum) => surum.id === editorSurumId)
          : varsayilanSurumuSec(ilkSet, !kgkSayfasi);
        setSecilenSurumId(ilkSurum?.id || 0);
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
  }, [user.token, tanimFiltresi, kgkSayfasi, duzenleyiciSayfasi, editorSurumId]);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (!user.token) return;
    let etkin = true;
    getFinansalSurumYonetimiDurumu(user.token)
      .then((data) => etkin && setSurumYonetimiDurumu(data))
      .catch((error) => etkin && setTanimHatasi(error instanceof Error ? error.message : "Sürüm yönetimi durumu okunamadı."));
    return () => {
      etkin = false;
    };
  }, [user.token]);

  /* eslint-disable react-hooks/set-state-in-effect -- Clear details immediately when the selected scope has no version. */
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
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (!duzenleyiciSayfasi || !user.token || !secilenSurumId) return;
    let etkin = true;
    getFinansalTabloTabloRevizyonlari(user.token, secilenSurumId)
      .then((data) => {
        if (!etkin) return;
        setTabloRevizyonlari(data);
        setRevizyonHatasi("");
      })
      .catch(() => {
        if (etkin) setRevizyonHatasi("Tablo değişiklik geçmişi okunamadı. Kaydı yenileyip tekrar deneyin.");
      });
    return () => { etkin = false; };
  }, [duzenleyiciSayfasi, user.token, secilenSurumId]);

  const revizyonlariYenile = async (surumId: number) => {
    if (!user.token) return;
    try {
      setTabloRevizyonlari(await getFinansalTabloTabloRevizyonlari(user.token, surumId));
      setRevizyonHatasi("");
    } catch {
      setRevizyonHatasi("Değişiklik kaydedildi, ancak revizyon geçmişi yenilenemedi. Sayfayı yenileyin.");
    }
  };

  const secilenSet = tanimSetleri.find((set) => set.id === secilenSetId);
  const secilenSurum = secilenSet?.surumler.find((surum) => surum.id === secilenSurumId);
  const seciliAnaTabloGecisi = seciliTestMizani
    ? anaTabloGecisleri.find((gecis) =>
      gecis.denetlenenId === seciliTestMizani.denetlenenId &&
      gecis.yil === seciliTestMizani.yil &&
      gecis.konsolidasyonMu === seciliTestMizani.konsolidasyonMu)
    : undefined;
  const seciliKgkKaynakDonemi = kgkKaynakDonemleri.find((kaynak) => kaynak.kod === kgkKaynakDonemKodu);
  const secilenKalemTablosu = surumDetayi?.tablolar.find((tablo) => tablo.id === kalemTabloId) || surumDetayi?.tablolar[0];
  const seciliTabloRevizyonlari = tabloRevizyonlari.filter((revizyon) => revizyon.tabloId === secilenKalemTablosu?.id);
  const duzenlenenKural = secilenKalemTablosu?.kurallar.find((kural) => kural.id === duzenlenenKuralId);
  const kuralHedefKalemId = yeniKuralAcik ? yeniKuralKalemId : duzenlenenKural?.kalemId;
  const kuralKaynakKalemleri = secilenKalemTablosu?.kalemler.filter((kalem) => kalem.id !== kuralHedefKalemId) || [];

  const kgkFarkiniTemizle = () => {
    setKgkWorkbookSonucu(null);
    setKgkFarkBaglami(null);
    setKgkKalemFarkiUygulandiMi(false);
    setKgkFormulFarkiUygulandiMi(false);
  };

  const tanimSetiSec = (id: number) => {
    const set = tanimSetleri.find((aday) => aday.id === id);
    const surum = varsayilanSurumuSec(set, !kgkSayfasi);
    secilenSetIdRef.current = id;
    setSecilenSetId(id);
    setSecilenSurumId(surum?.id || 0);
    setTanimHatasi("");
    setSurumYonetimiMesaji("");
    kgkFarkiniTemizle();
  };

  const surumSec = (id: number) => {
    const surum = secilenSet?.surumler.find((aday) => aday.id === id);
    setSecilenSurumId(id);
    setTanimHatasi("");
    setSurumYonetimiMesaji("");
    kgkFarkiniTemizle();
  };

  /* eslint-disable react-hooks/set-state-in-effect -- Reset editor forms and stale validation when the selected version changes. */
  useEffect(() => {
    if (!secilenSurum) {
      sonSecilenSurumIdRef.current = 0;
      setMetaDuzenleme(false);
      return;
    }
    setMetaEtiket(secilenSurum.etiket);
    setMetaBaslangic(secilenSurum.gecerlilikBaslangici?.slice(0, 10) || "");
    setMetaBitis(secilenSurum.gecerlilikBitisi?.slice(0, 10) || "");
    setMetaAciklama(secilenSurum.aciklama || "");
    if (sonSecilenSurumIdRef.current !== secilenSurum.id) {
      sonSecilenSurumIdRef.current = secilenSurum.id;
      setMetaDuzenleme(false);
      setDogrulamaSonucu(null);
      setKarsilastirmaSonucu(null);
      setUretimOnizlemeSonucu(null);
      setKarsilastirmaSurumId(0);
      setKalemTabloId(0);
      setDuzenlenenKalemId(0);
    }
  }, [secilenSurum]);
  /* eslint-enable react-hooks/set-state-in-effect */

  /* eslint-disable react-hooks/set-state-in-effect -- Keep production preview defaults aligned with the selected table/version. */
  useEffect(() => {
    const donem = secilenKalemTablosu?.donemKolonlari?.[0];
    if (!donem) return;
    setUretimDonemAnahtari(donem.sabitAnahtar);
    if (secilenSurum) {
      setUretimBaslangic(secilenSurum.gecerlilikBaslangici?.slice(0, 10) || "");
      setUretimBitis(secilenSurum.gecerlilikBitisi?.slice(0, 10) || "");
    }
  }, [secilenKalemTablosu, secilenSurum]);
  /* eslint-enable react-hooks/set-state-in-effect */

  /* eslint-disable react-hooks/set-state-in-effect -- A preview is stale after any input used to produce it changes. */
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
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (!user.token || aktifAdim !== 2) return;
    let etkin = true;
    const gecmisiYenile = async () => {
      setKgkGecmisYukleniyor(true);
      try {
        const [gecmis, anaSurumler] = await Promise.all([
          getKgkScanHistory(user.token || "", 20),
          getKgkAnaSurumler(user.token || ""),
        ]);
        if (etkin) {
          setKgkTaramaGecmisi(gecmis);
          setKgkAnaSurumler(anaSurumler);
        }
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
    const tablo = secilenKalemTablosu;
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
      await revizyonlariYenile(secilenSurum.id);
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
        hesaplamaSekli: terim.hesaplamaSekli ?? 1,
        karsilastirmaDegerAlani: terim.karsilastirmaDegerAlani ?? terim.degerAlani,
        karsilastirmaDonemDavranisi: terim.karsilastirmaDonemDavranisi ?? 2,
        karsilastirmaDonemOfseti: terim.karsilastirmaDonemOfseti ?? -1,
        karsilastirmaIsaretPolitikasi: terim.karsilastirmaIsaretPolitikasi ?? 1,
        farkYonu: terim.farkYonu ?? 1,
        sonucIsaretPolitikasi: terim.sonucIsaretPolitikasi ?? 1,
        katsayiKaynakTuru: terim.katsayiKaynakTuru ?? null,
        katsayiKaynakAnahtari: terim.katsayiKaynakAnahtari || "",
        katsayiDonemDavranisi: terim.katsayiDonemDavranisi ?? 1,
        katsayiDonemOfseti: terim.katsayiDonemOfseti ?? 0,
        asgariMutlakFark: terim.asgariMutlakFark ?? 0,
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
        yeniKuralTerimi(onceki.terimler.length),
      ],
    }));
  };

  const kuralTerimiSablonuUygula = (index: number, sablon: string) => {
    const ortak: Partial<KuralTerimiFormu> = {
      hesaplamaSekli: 1,
      donemDavranisi: 1,
      donemOfseti: 0,
      isaretPolitikasi: 1,
      karsilastirmaDonemDavranisi: 2,
      karsilastirmaDonemOfseti: -1,
      karsilastirmaIsaretPolitikasi: 1,
      farkYonu: 1,
      sonucIsaretPolitikasi: 1,
      asgariMutlakFark: 0,
    };
    const sablonlar: Record<string, Partial<KuralTerimiFormu>> = {
      cariBakiye: { ...ortak, degerAlani: 1 },
      cariTransferHaric: { ...ortak, degerAlani: 7 },
      cariEksiOncekiTransferHaric: { ...ortak, hesaplamaSekli: 2, degerAlani: 7, karsilastirmaDegerAlani: 7 },
      oncekiEksiCariTransferHaric: { ...ortak, hesaplamaSekli: 2, degerAlani: 7, karsilastirmaDegerAlani: 7, farkYonu: 2 },
      transferHaricArtis: { ...ortak, hesaplamaSekli: 2, degerAlani: 7, karsilastirmaDegerAlani: 7, sonucIsaretPolitikasi: 3, asgariMutlakFark: 1 },
      transferHaricAzalis: { ...ortak, hesaplamaSekli: 2, degerAlani: 7, karsilastirmaDegerAlani: 7, farkYonu: 2, sonucIsaretPolitikasi: 3, asgariMutlakFark: 1 },
      kontrolBakiye: { ...ortak, degerAlani: 6 },
      transferHaricKontrol: { ...ortak, degerAlani: 10 },
      sunumEndeksliOncekiUretim: {
        ...ortak,
        kaynakTuru: 4,
        kaynakAnahtari: "",
        donemDavranisi: 2,
        donemOfseti: -1,
        katsayiKaynakTuru: 5,
        katsayiKaynakAnahtari: "SUNUM_ENDEKSI",
        katsayiDonemDavranisi: 2,
        katsayiDonemOfseti: -1,
      },
    };
    if (sablonlar[sablon]) kuralTerimiGuncelle(index, sablonlar[sablon]);
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
    const tablo = secilenKalemTablosu;
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
      await revizyonlariYenile(secilenSurum.id);
    } catch (error) {
      setTanimHatasi(error instanceof Error ? error.message : "Hesaplama kuralı güncellenemedi.");
    } finally {
      setKuralKaydediliyor(false);
    }
  };

  const yeniKuralBaslat = () => {
    const tablo = secilenKalemTablosu;
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
      terimler: [yeniKuralTerimi(0)],
    });
  };

  const kuralOlustur = async () => {
    const tablo = secilenKalemTablosu;
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
      await revizyonlariYenile(secilenSurum.id);
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
        gecerlilikBaslangici: format(new Date(), "yyyy-MM-dd"),
        gecerlilikBitisi: null,
        aciklama,
        beklenenKaynakEszamanlilikSurumu: kaynakSurum.eszamanlilikSurumu,
      });
      const yeniSurum = { ...kaynakSurum, id: sonuc.surumId, surumNo: sonuc.surumNo, etiket, durum: sonuc.durum, kaynakSurumId: kaynakSurum.id, aciklama, gecerlilikBaslangici: new Date().toISOString(), gecerlilikBitisi: null, olusturmaTarihi: new Date().toISOString(), guncellemeTarihi: null, onayTarihi: null, eszamanlilikSurumu: sonuc.eszamanlilikSurumu };
      setTanimSetleri((onceki) => onceki.map((set) => set.id === secilenSetId ? { ...set, surumler: [yeniSurum, ...set.surumler] } : set));
      setSecilenSurumId(sonuc.surumId);
      setSurumYonetimiMesaji(geriDonusMu
        ? `#${kaynakSurum.surumNo} sürümünden geri dönüş taslağı oluşturuldu. Kontrol ve test sonrası devreye alınabilir.`
        : `#${kaynakSurum.surumNo} sürümünden yeni taslak oluşturuldu.`);
      router.push(`/FinansalTabloYonetimi/Surum/${sonuc.surumId}`);
    } catch (error) {
      setTanimHatasi(error instanceof Error ? error.message : "Taslak sürüm oluşturulamadı.");
    } finally {
      setSurumIslemiYukleniyor(false);
    }
  };

  const taslagiDevreyeAl = async () => {
    if (!user.token || !secilenSurum || surumDurumKodu(secilenSurum.durum) !== 1 || surumYonetimiDurumu?.etkin !== true) return;
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
      setSonDevreyeAlinanSurumId(sonuc.surumId);
      setSurumYonetimiMesaji(`Sürüm #${secilenSurum.surumNo} devreye alındı. ${sonuc.kullanimdanKaldirilanSurumIdleri.length} önceki sürüm kullanım dışına alındı; eski üretimler değişmedi.`);
      await anaTabloGecisleriniYukle();
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
      const [gecmis, anaSurumler] = await Promise.all([
        getKgkScanHistory(user.token, 20),
        getKgkAnaSurumler(user.token),
      ]);
      setKgkTaramaGecmisi(gecmis);
      setKgkAnaSurumler(anaSurumler);
    } catch (error) {
      setTanimHatasi(error instanceof Error ? error.message : "KGK tarama geçmişi okunamadı.");
    } finally {
      setKgkGecmisYukleniyor(false);
    }
  };

  const kgkAnaSurumuDevreyeAl = async (anaSurum: KgkAnaSurum) => {
    if (!user.token || kgkTopluYukleniyor) return;
    if (!kgkTopluTarih || kgkTopluNeden.trim().length < 10 ||
        anaSurum.surumler.length === 0 ||
        anaSurum.surumler.some((surum) => surumDurumKodu(surum.durum) !== 1 || !surum.ornekMizanHazirMi)) {
      setKgkTopluHatasi("Tüm bağlı taslaklar örnek mizanla hazırlanmalı; etkinlik tarihi ve en az 10 karakterlik onay nedeni girilmelidir.");
      return;
    }
    setKgkTopluYukleniyor(true);
    setKgkTopluHatasi("");
    setKgkTopluMesaji("");
    try {
      const sonuc = await activateKgkAnaSurum(user.token, anaSurum.id, {
        etkinlikTarihi: kgkTopluTarih,
        onayAciklamasi: kgkTopluNeden.trim(),
        surumler: anaSurum.surumler.map((surum) => ({
          surumId: surum.id,
          eszamanlilikSurumu: surum.eszamanlilikSurumu,
        })),
      });
      setKgkTopluMesaji(`KGK ana sürüm #${anaSurum.surumNo} kapsamındaki ${sonuc.surumler.length} rapor sürümü devreye alındı. Önceki rapor kayıtları değişmedi.`);
      setKgkTopluNeden("");
      setKgkTopluSeciliId(0);
      await kgkTaramaGecmisiniYukle();
    } catch (error) {
      setKgkTopluHatasi(error instanceof Error ? error.message : "KGK ana sürümü devreye alınamadı.");
    } finally {
      setKgkTopluYukleniyor(false);
    }
  };

  const kgkTaraVeArsivle = async () => {
    if (!user.token) return;
    setKgkTaramaYukleniyor(true);
    setKgkTaramaHatasi("");
    setKgkKontrolSonucu(null);
    setKgkAnaSurumId(null);
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
      setKgkAnaSurumId(data.anaSurumId || null);
      const erisilemeyenDosyalar = data.kontrol.dosyalar.filter((dosya) => !dosya.erisilebilirMi);
      if (data.hatalar.length > 0 || erisilemeyenDosyalar.length > 0) {
        const ilkHata = erisilemeyenDosyalar[0]?.hata || data.hatalar[0]?.hata;
        setKgkTaramaHatasi(`${data.kontrol.bulunanDosyaSayisi} dosya bulundu; ${erisilemeyenDosyalar.length} dosyaya erişilemedi, ${data.hatalar.length} dosya arşivlenemedi.${ilkHata ? ` İlk hata: ${ilkHata}` : ""}`);
      } else {
        setSurumYonetimiMesaji(`${data.anaSurumNo ? `KGK ana sürüm #${data.anaSurumNo} hazır.` : "KGK taraması tamamlandı."} ${data.arsivler.length} dosya arşivlendi; ${data.toplamDenemeSayisi} deneme yapıldı.`);
      }
      await kgkTaramaGecmisiniYukle();
    } catch (error) {
      setKgkTaramaHatasi(error instanceof Error ? error.message : "KGK tarama ve arşivleme tamamlanamadı.");
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
    if (!kgkAnaSurumId || !kgkFarkBaglami?.dosya.sha256) {
      setTanimHatasi("Taslağı KGK ana sürümüne bağlamak için önce taramayı çalıştırın.");
      return;
    }
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
        kgkAnaSurumId,
        kgkDosyaUrl: kgkFarkBaglami.dosya.url,
        kgkDosyaSha256: kgkFarkBaglami.dosya.sha256,
      });
      const taslak = {
        ...kaynakSurum,
        id: sonuc.surumId,
        surumNo: sonuc.surumNo,
        etiket: `${kaynakSurum.etiket} - KGK taslak`,
        durum: sonuc.durum,
        kaynakSurumId: kaynakSurum.id,
        kgkAnaSurumId,
        aciklama,
        olusturmaTarihi: new Date().toISOString(),
        guncellemeTarihi: new Date().toISOString(),
        onayTarihi: null,
        eszamanlilikSurumu: sonuc.eszamanlilikSurumu,
        kalemSayisi: Math.max(0, kaynakSurum.kalemSayisi + sonuc.eklenenKalemSayisi - sonuc.pasifeAlinanKalemSayisi),
      };
      setTanimSetleri((onceki) => onceki.map((set) => set.id === secilenSet.id ? { ...set, surumler: [taslak, ...set.surumler] } : set));
      setSecilenSurumId(sonuc.surumId);
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

  const testMizanSatirlariniOku = (satirlarJson = testMizanSatirlariJson): FinansalTabloTestMizanOlusturmaIstegi["satirlar"] => {
    const parsed = JSON.parse(satirlarJson) as unknown;
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
      const satirYili = sayiOku("yil", Number(uretimYil));
      if (!Number.isInteger(satirYili) || satirYili < 1900 || satirYili > 2200) {
        throw new Error(`Test mizanı ${index + 1}. satırında yil 1900 ile 2200 arasında olmalıdır.`);
      }
      return {
        yil: satirYili,
        detayKodu,
        hesapAdi: String(satir.hesapAdi || detayKodu),
        borc: sayiOku("borc"),
        alacak: sayiOku("alacak"),
        raporBorc: sayiOku("raporBorc", sayiOku("borc")),
        raporAlacak: sayiOku("raporAlacak", sayiOku("alacak")),
        bakiye: sayiOku("bakiye", sayiOku("borc") - sayiOku("alacak")),
        kontrolBakiye: sayiOku("kontrolBakiye", sayiOku("bakiye", sayiOku("borc") - sayiOku("alacak"))),
        bakiyeTransferFisiHaric: sayiOku("bakiyeTransferFisiHaric", sayiOku("bakiye", sayiOku("borc") - sayiOku("alacak"))),
        raporBorcTransferFisiHaric: sayiOku("raporBorcTransferFisiHaric", sayiOku("raporBorc", sayiOku("borc"))),
        raporAlacakTransferFisiHaric: sayiOku("raporAlacakTransferFisiHaric", sayiOku("raporAlacak", sayiOku("alacak"))),
        kontrolBakiyeTransferFisiHaric: sayiOku("kontrolBakiyeTransferFisiHaric", sayiOku("bakiyeTransferFisiHaric", sayiOku("bakiye", sayiOku("borc") - sayiOku("alacak")))),
        ...(satir.duzeltmeBakiye == null ? {} : { duzeltmeBakiye: sayiOku("duzeltmeBakiye") }),
        paraBirimi: String(satir.paraBirimi || "TRY"),
      };
    });
  };

  const testMizanFisSatirlariniOku = (): NonNullable<FinansalTabloTestMizanOlusturmaIstegi["fisSatirlari"]> => {
    const parsed = JSON.parse(testMizanFisSatirlariJson.trim() || "[]") as unknown;
    if (!Array.isArray(parsed) || parsed.length > 5000) {
      throw new Error("Enflasyon fişleri en fazla 5.000 satırlık JSON dizisi olmalıdır.");
    }
    return parsed.map((hamFis, index) => {
      if (!hamFis || typeof hamFis !== "object" || Array.isArray(hamFis)) {
        throw new Error(`Enflasyon fişi ${index + 1}. satırında JSON nesnesi bekleniyor.`);
      }
      const fis = hamFis as Record<string, unknown>;
      const yil = Number(fis.yil ?? uretimYil);
      const yevmiyeNo = Number(fis.yevmiyeNo);
      const hesapKodu = String(fis.hesapKodu ?? "").trim();
      const borc = Number(fis.borc ?? 0);
      const alacak = Number(fis.alacak ?? 0);
      if (!Number.isInteger(yil) || yil < 1900 || yil > 2200 ||
          !Number.isInteger(yevmiyeNo) || yevmiyeNo <= 0 || !hesapKodu ||
          !Number.isFinite(borc) || !Number.isFinite(alacak)) {
        throw new Error(`Enflasyon fişi ${index + 1}. satırında yıl, fiş numarası, hesap kodu, borç ve alacak değerlerini kontrol edin.`);
      }
      return { yil, yevmiyeNo, hesapKodu, borc, alacak };
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
      const donemSonuclari: Array<{ yil: number; satirlar: FinansalTabloMevcutMizanSatiri[] }> = [];
      for (const donemYili of [yil, yil - 1, yil - 2]) {
        try {
          const satirlar = await getFinansalTabloMevcutMizani(user.token, denetlenenId, donemYili, uretimKonsolide);
          if (satirlar.length > 0) donemSonuclari.push({ yil: donemYili, satirlar });
        } catch (error) {
          if (donemYili === yil) throw error;
        }
      }
      if (!donemSonuclari.some((donem) => donem.yil === yil)) {
        throw new Error("Seçilen denetlenen ve yıl için mevcut dönüşüm mizanı bulunamadı.");
      }
      const toplamSatir = donemSonuclari.reduce((toplam, donem) => toplam + donem.satirlar.length, 0);
      if (toplamSatir > 5000) {
        throw new Error("Cari ve karşılaştırmalı dönem mizanları toplam 5.000 satırdan fazla; test fixture sınırını aşmamak için aktarılmadı.");
      }
      const sayiOku = (deger: number | null | undefined, varsayilan = 0) => {
        const sayiDegeri = Number(deger ?? varsayilan);
        return Number.isFinite(sayiDegeri) ? sayiDegeri : varsayilan;
      };
      const fixtureSatirlari = donemSonuclari.flatMap((donem) => donem.satirlar.map((satir, index) => {
        const detayKodu = String(satir.detayKodu || "").trim();
        if (!detayKodu) {
          throw new Error(`${donem.yil} yılı mevcut mizanın ${index + 1}. satırında detay kodu bulunamadı.`);
        }
        const borc = sayiOku(satir.borcBakiye);
        const alacak = sayiOku(satir.alacakBakiye);
        const raporBorc = sayiOku(satir.raporBorc, borc);
        const raporAlacak = sayiOku(satir.raporAlacak, alacak);
        const bakiye = sayiOku(satir.bakiye, raporBorc - raporAlacak);
        return {
          yil: donem.yil,
          detayKodu,
          hesapAdi: String(satir.hesapAdi || detayKodu),
          borc,
          alacak,
          raporBorc,
          raporAlacak,
          bakiye,
          kontrolBakiye: sayiOku(satir.kontrolBakiye, bakiye),
          bakiyeTransferFisiHaric: sayiOku(satir.bakiyeTransferFisiHaric, bakiye),
          raporBorcTransferFisiHaric: sayiOku(satir.raporBorcTransferFisiHaric, raporBorc),
          raporAlacakTransferFisiHaric: sayiOku(satir.raporAlacakTransferFisiHaric, raporAlacak),
          kontrolBakiyeTransferFisiHaric: sayiOku(
            satir.kontrolBakiyeTransferFisiHaric,
            sayiOku(satir.raporBorcTransferFisiHaric, raporBorc) - sayiOku(satir.raporAlacakTransferFisiHaric, raporAlacak)
          ),
          ...(satir.duzeltmeBakiye == null ? {} : { duzeltmeBakiye: sayiOku(satir.duzeltmeBakiye) }),
          paraBirimi: String(satir.paraBirimi || "TRY"),
        };
      }));
      setTestMizanSatirlariJson(JSON.stringify(fixtureSatirlari, null, 2));
      setTestMizanFisSatirlariJson("[]");
      setTestVerisiDuzenlendiMi(true);
      setTestMizanAdi(`Mevcut mizan snapshotı ${denetlenenId}-${yil}`);
      setSeciliTestMizani(null);
      setUretimOnizlemeSonucu(null);
      const yuklenenDonemler = donemSonuclari.map((donem) => donem.yil).join(", ");
      setMevcutMizanBilgi(`${fixtureSatirlari.length} mizan satırı (${yuklenenDonemler}) editöre yüklendi. Kontrol edip “Test mizanı oluştur” düğmesine basın.`);
    } catch (error) {
      setTanimHatasi(error instanceof Error ? error.message : "Mevcut dönüşüm mizanı okunamadı.");
    } finally {
      setMevcutMizanYukleniyor(false);
    }
  };

  const otomatikTestSatirlariOlustur = (): FinansalTabloTestMizanOlusturmaIstegi["satirlar"] | null => {
    const kaynak = secilenKalemTablosu?.kurallar
      .filter((kural) => kural.aktifMi)
      .flatMap((kural) => kural.terimler)
      .find((terim) => (terim.kaynakTuru === 1 || terim.kaynakTuru === 2)
        && /^\d+(?:\.\d+)*\.?$/.test(terim.kaynakAnahtari.trim()));
    const yil = Number(uretimYil);
    if (!kaynak || !Number.isInteger(yil) || yil < 1902 || yil > 2200) return null;
    const kaynakKodu = kaynak.kaynakAnahtari.trim();
    const hesapKodu = kaynak.kaynakTuru === 2
      ? `${kaynakKodu}${kaynakKodu.endsWith(".") ? "" : "."}01`
      : kaynakKodu;
    const karsiHesap = hesapKodu === "999999.99" ? "888888.88" : "999999.99";
    const alacakYonu = [3, 5, 9].includes(kaynak.degerAlani)
      || ([1, 6, 7, 10].includes(kaynak.degerAlani) && kaynak.isaretPolitikasi === 4);
    return [yil, yil - 1, yil - 2].flatMap((satirYili, index) => {
      const tutar = 1000 - index * 200;
      return [
        { yil: satirYili, detayKodu: hesapKodu, hesapAdi: "Formül test hesabı", borc: alacakYonu ? 0 : tutar, alacak: alacakYonu ? tutar : 0 },
        { yil: satirYili, detayKodu: karsiHesap, hesapAdi: "Dengeleme hesabı", borc: alacakYonu ? tutar : 0, alacak: alacakYonu ? 0 : tutar },
      ];
    });
  };

  const testMizaniOlustur = async (
    otomatikSatirlar?: FinansalTabloTestMizanOlusturmaIstegi["satirlar"] | null
  ): Promise<FinansalTabloTestMizan | null> => {
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
        satirlar: testMizanSatirlariniOku(otomatikSatirlar ? JSON.stringify(otomatikSatirlar) : testMizanSatirlariJson),
        fisSatirlari: testMizanFisSatirlariniOku(),
      });
      if (otomatikSatirlar) setTestMizanSatirlariJson(JSON.stringify(otomatikSatirlar, null, 2));
      setSeciliTestMizani(kayit);
      setTestMizanlari((onceki) => [kayit, ...onceki.filter((aday) => aday.id !== kayit.id)]);
      setUretimGirdiAnahtari(`TEST-MIZAN-${kayit.id.slice(0, 8).toUpperCase()}`);
      setUretimGirdiSha256(kayit.sha256);
      setUretimDenetlenenId(String(kayit.denetlenenId));
      setUretimYil(String(kayit.yil));
      setUretimBaslangic((onceki) => onceki || `${kayit.yil}-01-01`);
      setUretimBitis((onceki) => onceki || `${kayit.yil}-12-31`);
      setUretimOnizlemeSonucu(null);
      setSurumYonetimiMesaji(`Test mizanı oluşturuldu: ${kayit.ad} · ${kayit.satirlar.length} mizan, ${kayit.fisSatirlari?.length ?? 0} fiş satırı. Önizlemeye hazır.`);
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
    setTestVerisiDuzenlendiMi(true);
    setTestMizanAdi(kayit.ad);
    setTestMizanSatirlariJson(JSON.stringify(kayit.satirlar, null, 2));
    setTestMizanFisSatirlariJson(JSON.stringify(kayit.fisSatirlari ?? [], null, 2));
    setUretimGirdiAnahtari(`TEST-MIZAN-${kayit.id.slice(0, 8).toUpperCase()}`);
    setUretimGirdiSha256(kayit.sha256);
    setUretimDenetlenenId(String(kayit.denetlenenId));
    setUretimYil(String(kayit.yil));
    setUretimKonsolide(kayit.konsolidasyonMu);
    setUretimBaslangic((onceki) => onceki || `${kayit.yil}-01-01`);
    setUretimBitis((onceki) => onceki || `${kayit.yil}-12-31`);
    setUretimOnizlemeSonucu(null);
  };

  const anaTabloGecisleriniYukle = async () => {
    if (!user.token) return;
    setAnaTabloGecisYukleniyor(true);
    setTanimHatasi("");
    try {
      const denetlenenId = seciliTestMizani?.denetlenenId || Number(uretimDenetlenenId) || undefined;
      const yil = seciliTestMizani?.yil || Number(uretimYil) || undefined;
      setAnaTabloGecisleri(await getFinansalTabloAnaTabloGecisleri(user.token, { denetlenenId, yil }));
    } catch (error) {
      setTanimHatasi(error instanceof Error ? error.message : "Ana tablo geçişleri okunamadı.");
    } finally {
      setAnaTabloGecisYukleniyor(false);
    }
  };

  const anaTabloGecisiniHazirla = async () => {
    if (!user.token || !secilenSurum || !seciliTestMizani) {
      setTanimHatasi("Önce sürüm ve örnek mizan seçilmelidir.");
      return;
    }
    setAnaTabloGecisYukleniyor(true);
    setTanimHatasi("");
    try {
      const gecis = await prepareFinansalTabloAnaTabloGecisi(user.token, {
        surumId: secilenSurum.id,
        testMizanId: seciliTestMizani.id,
        aciklama: anaTabloAciklama.trim() || null,
      });
      setAnaTabloGecisleri((onceki) => [gecis, ...onceki.filter((aday) => aday.id !== gecis.id)]);
      setAnaTabloOnayMetni("");
      setSurumYonetimiMesaji(`${gecis.dogrulananTabloSayisi} tablo ve ${gecis.dogrulananDonemSayisi} dönem örnek mizanla doğrulandı. Yeni üretim etkinleştirme onayını bekliyor.`);
    } catch (error) {
      setTanimHatasi(error instanceof Error ? error.message : "Ana tablo geçişi hazırlanamadı.");
    } finally {
      setAnaTabloGecisYukleniyor(false);
    }
  };

  const anaTabloGecisiniEtkinlestir = async () => {
    if (!user.token || !seciliAnaTabloGecisi) return;
    setAnaTabloGecisYukleniyor(true);
    setTanimHatasi("");
    try {
      const gecis = await activateFinansalTabloAnaTabloGecisi(user.token, seciliAnaTabloGecisi.id, {
        beklenenEszamanlilikSurumu: seciliAnaTabloGecisi.eszamanlilikSurumu,
        onayMetni: anaTabloOnayMetni,
        aciklama: anaTabloAciklama.trim() || null,
      });
      setAnaTabloGecisleri((onceki) => [gecis, ...onceki.filter((aday) => aday.id !== gecis.id)]);
      setAnaTabloOnayMetni("");
      setSurumYonetimiMesaji("Geçiş etkinleştirildi. Bu firma/yıl/kapsamdaki sonraki finansal tablo oluşturma işlemi Admin sürümünü kullanacak.");
    } catch (error) {
      setTanimHatasi(error instanceof Error ? error.message : "Ana tablo geçişi etkinleştirilemedi.");
    } finally {
      setAnaTabloGecisYukleniyor(false);
    }
  };

  const anaTabloGecisiniGeriAl = async () => {
    if (!user.token || !seciliAnaTabloGecisi) return;
    setAnaTabloGecisYukleniyor(true);
    setTanimHatasi("");
    try {
      const gecis = await rollbackFinansalTabloAnaTabloGecisi(user.token, seciliAnaTabloGecisi.id, {
        beklenenEszamanlilikSurumu: seciliAnaTabloGecisi.eszamanlilikSurumu,
        aciklama: anaTabloAciklama.trim() || null,
      });
      setAnaTabloGecisleri((onceki) => [gecis, ...onceki.filter((aday) => aday.id !== gecis.id)]);
      setAnaTabloOnayMetni("");
      setSurumYonetimiMesaji("Yeni finansal tablo üretimi durduruldu. Mevcut raporlar değişmeden korunacak.");
    } catch (error) {
      setTanimHatasi(error instanceof Error ? error.message : "Ana tablo geçişi geri alınamadı.");
    } finally {
      setAnaTabloGecisYukleniyor(false);
    }
  };

  const finansalTabloIstekOlustur = (
    testMizani: FinansalTabloTestMizan | null = seciliTestMizani,
    tanimSnapshotSha256Override = ""
  ): FinansalTabloUretimIstegi | null => {
    const tablo = secilenKalemTablosu;
    const set = secilenSet;
    const surum = secilenSurum;
    const donem = tablo?.donemKolonlari?.find((kolon) => kolon.sabitAnahtar === uretimDonemAnahtari) || tablo?.donemKolonlari?.[0];
    if (!user.token || !set || !surum) {
      setTanimHatasi("Finansal tablo testi için tanım seti ve sürüm bulunamadı. Sürüm seçimini yenileyin.");
      return null;
    }
    if (!tablo) {
      setTanimHatasi(`${surum.etiket} sürümünde finansal tablo tanımı yok. Sürümün tablo kapsamını düzenleyin.`);
      return null;
    }
    if (!donem) {
      setTanimHatasi(`${tablo.ad} tablosunda dönem kolonu yok. Sürüm tanımındaki dönem kolonlarını tamamlayın.`);
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
    const donemKimlikleri = new Map<string, { donemDavranisi: number; donemOfseti: number }>();
    const donemEkle = (donemDavranisi: number, donemOfseti: number) => {
      donemKimlikleri.set(`${donemDavranisi}:${donemOfseti}`, { donemDavranisi, donemOfseti });
    };
    tablo.kurallar.filter((kural) => kural.aktifMi).forEach((kural) => {
      kural.terimler.forEach((terim) => {
        donemEkle(terim.donemDavranisi, terim.donemOfseti);
        if (terim.hesaplamaSekli === 2) {
          donemEkle(terim.karsilastirmaDonemDavranisi, terim.karsilastirmaDonemOfseti);
        }
        if (terim.katsayiKaynakTuru != null) {
          donemEkle(terim.katsayiDonemDavranisi ?? 1, terim.katsayiDonemOfseti ?? 0);
        }
      });
    });
    donemEkle(donem.donemDavranisi, donem.donemOfseti);
    const donemEslesmeleri = [...donemKimlikleri.values()]
      .sort((sol, sag) => sol.donemDavranisi - sag.donemDavranisi || sol.donemOfseti - sag.donemOfseti)
      .map((kimlik) => {
        const cozumYili = yil + donem.donemOfseti + kimlik.donemOfseti;
        const tarihYiliniDegistir = (tarih: string) => {
          const hedefYil = Number(tarih.slice(0, 4)) + cozumYili - yil;
          const ay = Number(tarih.slice(5, 7));
          const gun = Math.min(Number(tarih.slice(8, 10)), new Date(Date.UTC(hedefYil, ay, 0)).getUTCDate());
          return `${hedefYil}-${String(ay).padStart(2, "0")}-${String(gun).padStart(2, "0")}`;
        };
        return {
          donemDavranisi: kimlik.donemDavranisi,
          donemOfseti: kimlik.donemOfseti,
          donem: {
            sabitAnahtar: `${kimlik.donemDavranisi}-${kimlik.donemOfseti}-${cozumYili}`,
            baslangicTarihi: tarihYiliniDegistir(baslangicTarihi),
            bitisTarihi: tarihYiliniDegistir(bitisTarihi),
          },
        };
      });
    if (donemEslesmeleri.some((eslesme) => !/^\d{4}-\d{2}-\d{2}$/.test(eslesme.donem.baslangicTarihi)
      || !/^\d{4}-\d{2}-\d{2}$/.test(eslesme.donem.bitisTarihi)
      || Number(eslesme.donem.baslangicTarihi.slice(0, 4)) < 1900
      || Number(eslesme.donem.baslangicTarihi.slice(0, 4)) > 2200
      || Number(eslesme.donem.bitisTarihi.slice(0, 4)) < 1900
      || Number(eslesme.donem.bitisTarihi.slice(0, 4)) > 2200)) {
      setTanimHatasi("Formüllerdeki dönem ofseti geçerli bir raporlama yılına karşılık gelmiyor.");
      return null;
    }
    const snapshotSha256 = tanimSnapshotSha256Override.trim()
      || uretimSnapshotSha256.trim()
      || dogrulamaSonucu?.tablolar.find((aday) => aday.tabloId === tablo.id)?.snapshotSha256
      || "";
    return {
      yeniMotorSurumu: "finansal-tablo-yeni-motor-v1",
      tanimSetiSabitAnahtari: set.kod,
      tanimSurumu: surum.etiket,
      girdiSabitAnahtari: testMizani ? `TEST-MIZAN-${testMizani.id.slice(0, 8).toUpperCase()}` : uretimGirdiAnahtari.trim() || "MIZAN",
      girdiSha256: girdiSha256.toLowerCase(),
      calistirmaBaglami: {
        donemEslesmeleri,
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

  const finansalTabloOnizle = async (
    testMizani: FinansalTabloTestMizan | null = seciliTestMizani,
    tanimSnapshotSha256Override = ""
  ): Promise<FinansalTabloUretimOnizlemeSonucu | null> => {
    const istek = finansalTabloIstekOlustur(testMizani, tanimSnapshotSha256Override);
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

  const finansalTabloSistemDurumunuYukle = async () => {
    if (!user.token) return;
    setSistemDurumuYukleniyor(true);
    setTanimHatasi("");
    try {
      setSistemDurumu(await getFinansalTabloSistemDurumu(user.token));
    } catch (error) {
      setTanimHatasi(error instanceof Error ? error.message : "Finansal tablo sistem durumu okunamadı.");
    } finally {
      setSistemDurumuYukleniyor(false);
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

  const seciliSurumTaslakMi = surumDurumKodu(secilenSurum?.durum ?? 0) === 1;
  const seciliSurumYayindaMi = surumDurumKodu(secilenSurum?.durum ?? 0) === 3;
  const yeniSurumDevredeMi = Boolean(seciliSurumYayindaMi && sonDevreyeAlinanSurumId === secilenSurum?.id);
  const teknikDogrulamaGuncelMi = Boolean(
    dogrulamaSonucu && secilenSurum &&
    dogrulamaSonucu.surumId === secilenSurum.id &&
    dogrulamaSonucu.eszamanlilikSurumu === secilenSurum.eszamanlilikSurumu
  );
  const teknikDogrulamaBasariliMi = teknikDogrulamaGuncelMi && dogrulamaSonucu?.gecerliMi === true;
  const basariliTestSonucuSayisi = uretimOnizlemeSonucu?.sonuclar.filter((sonuc) => sonuc.durum === 1).length ?? 0;
  const basarisizTestSonucuSayisi = uretimOnizlemeSonucu
    ? uretimOnizlemeSonucu.sonuclar.length - basariliTestSonucuSayisi
    : 0;
  const tumTestTutarlariSifirMi = Boolean(
    uretimOnizlemeSonucu?.basariliMi && uretimOnizlemeSonucu.sonuclar.length > 0
    && uretimOnizlemeSonucu.sonuclar.every((sonuc) => sonuc.durum === 1 && sonuc.deger === 0)
  );
  const onizlemeBasariliMi = Boolean(
    uretimOnizlemeSonucu &&
    uretimOnizlemeSonucu.basariliMi === true &&
    uretimOnizlemeSonucu.sonuclar.length > 0 &&
    basarisizTestSonucuSayisi === 0 && !tumTestTutarlariSifirMi
  );
  const testSonucuSorunluMu = Boolean(uretimOnizlemeSonucu && !onizlemeBasariliMi);
  const testTamamlanamadiMi = Boolean(
    uretimOnizlemeSonucu &&
    (!uretimOnizlemeSonucu.basariliMi || uretimOnizlemeSonucu.sonuclar.length === 0)
  );
  const testBasarisizlikEtiketi = basarisizTestSonucuSayisi > 0
    ? `${basarisizTestSonucuSayisi} başarısız`
    : tumTestTutarlariSifirMi
      ? "Tüm tutarlar sıfır"
    : testSonucuSorunluMu
      ? "Test tamamlanamadı"
      : "0 başarısız";
  const ilkTestSorunu = uretimOnizlemeSonucu?.sonuclar.find((sonuc) => sonuc.durum !== 1);
  const yonlendirmeYukleniyor = tanimYukleniyor || dogrulamaYukleniyor || testMizanYukleniyor || uretimOnizlemeYukleniyor;

  const akilliYonlendirme = (() => {
    if (tanimYukleniyor) return { seviye: "info" as const, baslik: "Tanımlar kontrol ediliyor", aciklama: "Uygun tanım seti ve sürüm otomatik seçiliyor.", eylem: "bekle", dugme: "Kontrol ediliyor" };
    if (!secilenSet || !secilenSurum) return { seviye: "error" as const, baslik: "Kullanılabilir tanım bulunamadı", aciklama: "Tanım arama filtrelerini açın veya aktif bir tanım seti seçin.", eylem: "tanim", dugme: "Tanım seçimine dön" };
    if (seciliSurumTaslakMi && !teknikDogrulamaGuncelMi) return { seviye: "warning" as const, baslik: "Otomatik test hazır", aciklama: "Sistem tanımları doğrulayacak, izole test mizanını hazırlayacak ve önizlemeyi tek işlemde çalıştıracak.", eylem: "otomatik-test", dugme: "Otomatik testi çalıştır" };
    if (seciliSurumTaslakMi && !teknikDogrulamaBasariliMi) return { seviye: "error" as const, baslik: "Düzeltilmesi gereken tanımlar var", aciklama: "Sorunlu tablo ve formüller aşağıda gösterildi. Düzeltmeden yayınlama yapılamaz.", eylem: "tanim", dugme: "Sorunları incele" };
    if (yeniSurumDevredeMi) return { seviye: "success" as const, baslik: "Sürüm devreye alındı", aciklama: "Ana tablolarda kullanmak için örnek mizanla hazırlayıp geçişi etkinleştirin. Önceki raporlar korunur.", eylem: "ana-tablo", dugme: "Ana tablo geçişine git" };
    if (!seciliTestMizani) return { seviye: "info" as const, baslik: "İzole test başlatılabilir", aciklama: "Sistem dengeli örnek mizanı hazırlayıp salt-okunur önizlemeyi kendisi çalıştıracak. Gerçek veriler ve mevcut raporlar etkilenmeyecek.", eylem: "otomatik-test", dugme: "Otomatik testi çalıştır" };
    if (!onizlemeBasariliMi) return { seviye: uretimOnizlemeSonucu ? "warning" as const : "info" as const, baslik: uretimOnizlemeSonucu ? "Test yeniden çalıştırılmalı" : "Yeni motor önizlemeye hazır", aciklama: tumTestTutarlariSifirMi ? "Tüm tutarlar sıfır. Test mizanı seçili formülleri tetiklemedi; hesap kodlarını kontrol edip yeniden deneyin." : uretimOnizlemeSonucu?.aciklama || "Seçili tanım ve test mizanıyla salt-okunur finansal tablo üretilecek.", eylem: "otomatik-test", dugme: "Otomatik testi çalıştır" };
    if (seciliSurumTaslakMi && surumYonetimiDurumu?.etkin !== true) return { seviye: "warning" as const, baslik: "Devreye alma bekliyor", aciklama: surumYonetimiDurumu?.aciklama || "Sürüm yönetimi durumu doğrulanamadı.", eylem: "bekle", dugme: "Devreye alma kullanılamıyor" };
    if (seciliSurumTaslakMi) return { seviye: "success" as const, baslik: "Taslak devreye alınabilir", aciklama: `${uretimOnizlemeSonucu?.sonuclar.length ?? 0} tablo sonucu başarılı. Etkinlik tarihi ve onay nedenini girerek sürümü devreye alın.`, eylem: "devreye-al", dugme: "Devreye almaya geç" };
    return { seviye: "success" as const, baslik: "Admin testi başarıyla tamamlandı", aciklama: `${uretimOnizlemeSonucu?.sonuclar.length ?? 0} finansal tablo sonucu üretildi; mevcut raporlar ve üretim arşivi değiştirilmedi.`, eylem: "kgk", dugme: "KGK kontrolüne geç" };
  })();

  const adimaGit = (adim: 0 | 1, hedefId?: string) => {
    setAktifAdim(adim);
    window.requestAnimationFrame(() => {
      const hedef = hedefId ? document.getElementById(hedefId) : null;
      if (hedef) hedef.scrollIntoView({ behavior: "smooth", block: "start" });
      else window.scrollTo({ top: 0, behavior: "smooth" });
    });
  };

  const otomatikTestiCalistir = async () => {
    if (!secilenSet || !secilenSurum) {
      adimaGit(0);
      return;
    }

    setTanimHatasi("");
    adimaGit(0);
    let dogrulananSnapshotSha256 = "";
    if (seciliSurumTaslakMi && !teknikDogrulamaGuncelMi) {
      const dogrulama = await teknikDogrula();
      if (!dogrulama?.gecerliMi) return;
      dogrulananSnapshotSha256 = dogrulama.tablolar.find(
        (tablo) => tablo.tabloId === secilenKalemTablosu?.id
      )?.snapshotSha256 || "";
    }

    adimaGit(1);
    const testMizani = seciliTestMizani || await testMizaniOlustur(
      testVerisiDuzenlendiMi ? null : otomatikTestSatirlariOlustur()
    );
    if (!testMizani) return;
    await finansalTabloOnizle(testMizani, dogrulananSnapshotSha256);
  };

  const onerilenIslemiCalistir = async () => {
    if (akilliYonlendirme.eylem === "tanim") return adimaGit(0);
    if (akilliYonlendirme.eylem === "otomatik-test") return otomatikTestiCalistir();
    if (akilliYonlendirme.eylem === "devreye-al") return adimaGit(1, "taslak-devreye-al");
    if (akilliYonlendirme.eylem === "ana-tablo") {
      setTestAyrintilariAcik(true);
      return adimaGit(1, "ana-tablo-gecis");
    }
    if (akilliYonlendirme.eylem === "kgk") {
      router.push("/FinansalTabloYonetimi/KgkGuncellemeleri");
    }
  };

  const tamamlananAdimlar = [
    Boolean(secilenSurum && (seciliSurumYayindaMi || teknikDogrulamaBasariliMi)),
    onizlemeBasariliMi || yeniSurumDevredeMi,
  ];

  return (
    <PageContainer
      title={sayfaBasligi}
      description={kgkSayfasi
        ? "Resmi KGK kaynaklarını izleme, sürüm farklarını inceleme ve onaylı taslağa aktarma"
        : "Finansal tablo tanımlarını ve formüllerini sürümleyerek yönetme ve kontrollü test etme"}
    >
      <Breadcrumb title={sayfaBasligi} items={breadcrumbItems} />
      {!kgkSayfasi && tanimHatasi && <Alert severity="error" onClose={() => { setTanimHatasi(""); setSurumYonetimiMesaji(""); }} sx={{ mb: 2 }}>{tanimHatasi}</Alert>}
      {!kgkSayfasi && !tanimHatasi && surumYonetimiMesaji && <Alert severity="success" onClose={() => setSurumYonetimiMesaji("")} sx={{ mb: 2 }}>{surumYonetimiMesaji}</Alert>}
      {!kgkSayfasi && !duzenleyiciSayfasi && <>
      <Paper variant="outlined" sx={{ p: { xs: 1.5, md: 2 }, mb: 2 }}>
        <Stack spacing={1}>
          <Typography variant="subtitle2" fontWeight={700}>Finansal tablo hazırlama</Typography>
          <Stepper activeStep={aktifAdim} alternativeLabel sx={{ overflowX: "auto", pb: 0.5 }}>
            {finansalTabloAdimlari.map((adim, index) => (
              <Step key={adim.baslik} completed={tamamlananAdimlar[index]}>
                <StepLabel>{adim.baslik}</StepLabel>
              </Step>
            ))}
          </Stepper>
          <Typography variant="body2" color="text.secondary">{finansalTabloAdimlari[aktifAdim].aciklama}</Typography>
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
      {kgkKontrolSonucu && kgkKontrolSonucu.degisenDosyaSayisi > 0 && <Paper variant="outlined" sx={{ p: 1.5, mb: 2 }}>
        <Stack spacing={1.5}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} alignItems={{ md: "center" }}>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="subtitle1" fontWeight={700}>Değişikliklerin uygulanacağı sürüm</Typography>
              <Typography variant="body2" color="text.secondary">
                Tarama tamamlandı. Farkları aktaracaksanız uygun rapor türünü seçin. Bir sürüm, o rapor türündeki bütün finansal tabloları içerir.
              </Typography>
            </Box>
            <Button variant="outlined" size="small" onClick={() => router.push("/FinansalTabloYonetimi")}>
              Sürümlü tanım ve formüllere dön
            </Button>
          </Stack>
          <Alert severity="info" icon={false} sx={{ py: 0.75 }}>
            <strong>Sonraki adım:</strong> Değişen dosyayı inceleyin. Uygun sürümden taslak oluşturup farkları taslağa aktarın; yayınlama ayrıca yapılır.
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
          {!tanimHatasi && surumYonetimiMesaji && <Alert severity="success" onClose={() => setSurumYonetimiMesaji("")}>{surumYonetimiMesaji}</Alert>}
        </Stack>
      </Paper>}
      <Paper variant="outlined" sx={{ p: 1.5, mb: 2 }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} alignItems={{ md: "center" }}>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="subtitle2">KGK dosya arşivi</Typography>
            <Typography variant="body2" color="text.secondary">
              KGK dosya değişikliği doğrudan kullanıcı tanımını değiştirmez. Önce arşivlenir, kalem ve formül farkları incelenir, sonra seçili taslağa Admin onayıyla aktarılır.
            </Typography>
          </Box>
          {kgkTaramaGecmisi[0]
            ? <Chip color={kgkTaramaGecmisi[0].degisenDosyaSayisi > 0 ? "warning" : "success"} label={`Son tarama${kgkTaramaGecmisi[0].anaSurumNo ? ` · KGK ana sürüm #${kgkTaramaGecmisi[0].anaSurumNo}` : ""}: ${kgkTaramaGecmisi[0].degisenDosyaSayisi} değişiklik · ${new Date(kgkTaramaGecmisi[0].bitis).toLocaleString("tr-TR")}`} />
            : <Chip variant="outlined" label={kgkGecmisYukleniyor ? "Tarama durumu okunuyor" : "Henüz tarama kaydı yok"} />}
        </Stack>
      </Paper>
      {kgkAnaSurumler.length > 0 && <Accordion disableGutters sx={{ mb: 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle2">KGK ana sürümleri ({kgkAnaSurumler.length})</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ pt: 0, overflowX: "auto" }}>
          <Table size="small">
            <TableHead><TableRow><TableCell>Kaynak dönemi</TableCell><TableCell>Ana sürüm</TableCell><TableCell align="right">Dosya</TableCell><TableCell>Bağlı rapor sürümleri</TableCell><TableCell>İşlem</TableCell></TableRow></TableHead>
            <TableBody>{kgkAnaSurumler.map((anaSurum) => <TableRow key={anaSurum.id}>
              <TableCell>{kgkKaynakDonemleri.find((donem) => donem.kod === anaSurum.kaynakDonemKodu)?.ad || anaSurum.kaynakDonemKodu}</TableCell>
              <TableCell>#{anaSurum.surumNo}<br /><Typography variant="caption" color="text.secondary">{new Date(anaSurum.olusturmaTarihi).toLocaleDateString("tr-TR")}</Typography></TableCell>
              <TableCell align="right">{anaSurum.dosyaSayisi}</TableCell>
              <TableCell>{anaSurum.surumler.length === 0
                ? <Typography variant="body2" color="text.secondary">Henüz taslak bağlanmadı.</Typography>
                : <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>{anaSurum.surumler.map((surum) =>
                  <Button key={surum.id} size="small" variant="text" onClick={() => router.push(`/FinansalTabloYonetimi/Surum/${surum.id}`)}>
                    {surum.tanimSetiKodu} · #{surum.surumNo}{surumDurumKodu(surum.durum) === 1 ? surum.ornekMizanHazirMi ? " · Hazır" : " · Örnek mizan eksik" : surumDurumKodu(surum.durum) === 3 ? " · Devrede" : " · Geçmiş"}
                  </Button>)}</Stack>}</TableCell>
              <TableCell>{anaSurum.surumler.length > 0 && anaSurum.surumler.every((surum) => surumDurumKodu(surum.durum) === 1)
                ? <Button size="small" variant="outlined" onClick={() => { setKgkTopluSeciliId(anaSurum.id); setKgkTopluHatasi(""); setKgkTopluMesaji(""); }}>
                    Toplu devreye al
                  </Button>
                : null}</TableCell>
            </TableRow>)}</TableBody>
          </Table>
          {kgkTopluHatasi && <Alert severity="error" sx={{ mt: 1 }} onClose={() => setKgkTopluHatasi("")}>{kgkTopluHatasi}</Alert>}
          {kgkTopluMesaji && <Alert severity="success" sx={{ mt: 1 }} onClose={() => setKgkTopluMesaji("")}>{kgkTopluMesaji}</Alert>}
          {kgkAnaSurumler.filter((anaSurum) => anaSurum.id === kgkTopluSeciliId).map((anaSurum) => (
            <Paper key={anaSurum.id} variant="outlined" sx={{ p: 1.5, mt: 1.5 }}>
              <Stack spacing={1}>
                <Typography variant="subtitle2">KGK ana sürüm #{anaSurum.surumNo} · {anaSurum.surumler.length} taslak</Typography>
                <Typography variant="body2" color="text.secondary">
                  Tüm bağlı taslaklar teknik olarak yeniden doğrulanır ve tek işlemde devreye alınır. Her taslak için güncel örnek mizan hazırlığı gerekir. Eski rapor kayıtları korunur.
                </Typography>
                {anaSurum.surumler.some((surum) => !surum.ornekMizanHazirMi) && (
                  <Alert severity="warning">Örnek mizan hazırlığı eksik olan taslakları açıp test edin.</Alert>
                )}
                <Stack direction={{ xs: "column", md: "row" }} spacing={1} alignItems={{ md: "flex-start" }}>
                  <TextField size="small" type="date" label="Etkinlik tarihi" value={kgkTopluTarih}
                    onChange={(event) => setKgkTopluTarih(event.target.value)} InputLabelProps={{ shrink: true }} sx={{ minWidth: 180 }} />
                  <TextField size="small" fullWidth label="Onay nedeni" value={kgkTopluNeden}
                    onChange={(event) => setKgkTopluNeden(event.target.value)} inputProps={{ maxLength: 500 }}
                    helperText="Değişikliği en az 10 karakterle açıklayın." />
                  <Button size="small" variant="contained" color="success"
                    onClick={() => kgkAnaSurumuDevreyeAl(anaSurum)}
                    disabled={kgkTopluYukleniyor || !kgkTopluTarih || kgkTopluNeden.trim().length < 10 ||
                      anaSurum.surumler.some((surum) => surumDurumKodu(surum.durum) !== 1 || !surum.ornekMizanHazirMi)}
                    sx={{ minWidth: 190, minHeight: 40 }}>
                    {kgkTopluYukleniyor ? <CircularProgress size={18} color="inherit" /> : "Tüm taslakları devreye al"}
                  </Button>
                </Stack>
              </Stack>
            </Paper>
          ))}
        </AccordionDetails>
      </Accordion>}
      <ParentCard title="KGK format güncelleme kontrolü">
        <Stack spacing={1.5}>
          {kgkTaramaHatasi && <Alert severity="error" onClose={() => setKgkTaramaHatasi("")}>{kgkTaramaHatasi}</Alert>}
          {!kgkKontrolSonucu && tanimHatasi && <Alert severity="error" onClose={() => setTanimHatasi("")}>{tanimHatasi}</Alert>}
          {!kgkTaramaHatasi && !tanimHatasi && surumYonetimiMesaji && <Alert severity="success" onClose={() => setSurumYonetimiMesaji("")}>{surumYonetimiMesaji}</Alert>}
          <Typography variant="body2" color="text.secondary">
            Raporlama tarihini girip taramayı başlatın. Rapor türü, sürüm, tablo veya dönem kolonu seçmeniz gerekmez. Kontrol sonuçları finansal tabloları değiştirmez.
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
            <Button variant="contained" size="small" onClick={kgkTaraVeArsivle} disabled={kgkTaramaYukleniyor || !kgkKaynakDonemKodu || !seciliKgkKaynakDonemi?.onerilenMi}>
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
              {kgkKontrolSonucu.degisenDosyaSayisi === 0 && <Alert severity={kgkKontrolSonucu.dosyalar.some((dosya) => !dosya.karsilastirmaVarMi) ? "info" : "success"} sx={{ mt: 1 }}>
                {kgkKontrolSonucu.dosyalar.some((dosya) => !dosya.karsilastirmaVarMi)
                  ? "İlk tarama KGK dosyaları için karşılaştırma temeli oluşturdu. Bu dosyaların sonraki değişiklikleri burada görünecek."
                  : "Seçili dönem için yeni KGK format değişikliği bulunmadı."}
              </Alert>}
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
      <Box sx={{ display: !duzenleyiciSayfasi && aktifAdim === 1 ? "block" : "none" }}>
      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        {teknikDogrulamaGuncelMi && dogrulamaSonucu && !dogrulamaSonucu.gecerliMi && (
          <Alert severity="error" sx={{ mb: 1.5 }}>
            <strong>Teknik doğrulama başarısız. Önce şu sorunları düzeltin:</strong>
            {dogrulamaSonucu.tablolar.flatMap((tablo) => tablo.sorunlar.map((sorun, index) => (
              <Typography key={`${tablo.tabloId}-${sorun.kod}-${index}`} variant="body2" sx={{ mt: 0.5 }}>
                {tablo.tabloKod} / {sorun.konum}: {sorun.aciklama}
              </Typography>
            )))}
          </Alert>
        )}
        {uretimOnizlemeSonucu ? (
          <Stack spacing={1.25}>
            <Alert severity={testTamamlanamadiMi ? "error" : testSonucuSorunluMu ? "warning" : "success"}>
              <strong>
                {testTamamlanamadiMi
                  ? "Test tamamlanamadı"
                  : tumTestTutarlariSifirMi
                    ? "Örnek mizan formülleri tetiklemedi"
                  : testSonucuSorunluMu
                    ? "Bazı tablo sonuçları incelenmeli"
                    : "Test başarıyla tamamlandı"}
              </strong>
              <br />
              {tumTestTutarlariSifirMi
                ? "Hesaplama çalıştı ancak tüm tutarlar sıfır. Test mizanındaki hesap kodlarını formüllerle eşleştirip yeniden deneyin; bu sonuç yayımlama için yeterli değildir."
                : uretimOnizlemeSonucu.aciklama || "Örnek mizan, seçili tanım ve formüllerle kontrol edildi. Gerçek finansal tablolar değiştirilmedi."}
              {ilkTestSorunu && (
                <>
                  <br />
                  İlk başarısız sonuç: {ilkTestSorunu.hataKodu || ilkTestSorunu.aciklama || "Sonuç durumu başarılı değil."}
                </>
              )}
            </Alert>
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
              <Chip size="small" label={`${uretimOnizlemeSonucu.sonuclar.length} sonuç`} />
              <Chip
                size="small"
                color={testSonucuSorunluMu ? "warning" : "success"}
                label={`${basariliTestSonucuSayisi} başarılı`}
              />
              <Chip
                size="small"
                color={testSonucuSorunluMu ? "error" : "default"}
                label={testBasarisizlikEtiketi}
              />
              <Typography variant="caption" color="text.secondary">
                Sürüm: {uretimOnizlemeSonucu.motorSurumu} · Test mizanı: {seciliTestMizani?.ad || "örnek mizan"}
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Button size="small" variant="outlined" onClick={() => setTestAyrintilariAcik(true)}>
                Sonuç ayrıntılarını aç
              </Button>
              <Button size="small" onClick={() => adimaGit(0)}>
                Tanım ve formüllere dön
              </Button>
              <Button
                size="small"
                variant="contained"
                onClick={() => void otomatikTestiCalistir()}
                disabled={yonlendirmeYukleniyor}
              >
                {yonlendirmeYukleniyor ? <CircularProgress size={16} color="inherit" /> : "Testi yeniden çalıştır"}
              </Button>
            </Stack>
          </Stack>
        ) : (
          <Stack spacing={1.25}>
            <Alert severity="info">
              Bu adım gerçek finansal tabloları değiştirmeyen örnek mizan testidir. Testi başlatın; tanımlar doğrulanır, örnek mizan hazırlanır ve sonuçlar burada gösterilir.
            </Alert>
            <Button
              variant="contained"
              onClick={() => void otomatikTestiCalistir()}
              disabled={yonlendirmeYukleniyor || !secilenSurum}
              sx={{ alignSelf: { xs: "stretch", sm: "flex-start" } }}
            >
              {yonlendirmeYukleniyor ? <CircularProgress size={18} color="inherit" /> : "Örnek mizanla otomatik test et"}
            </Button>
          </Stack>
        )}
      </Paper>
      {seciliSurumTaslakMi && teknikDogrulamaBasariliMi && onizlemeBasariliMi && (
        <Paper id="taslak-devreye-al" variant="outlined" sx={{ p: 1.5, mb: 2, borderColor: "success.main" }}>
          <Stack spacing={1.25}>
            <Box>
              <Typography variant="subtitle2">Taslağı devreye al</Typography>
              <Typography variant="body2" color="text.secondary">
                Kontroller başarılı. Etkinlik tarihini doğrulayın ve değişikliğin nedenini yazın. Önceki raporlar etkilenmez.
              </Typography>
            </Box>
            {surumYonetimiDurumu?.etkin !== true && (
              <Alert severity="warning">{surumYonetimiDurumu?.aciklama || "Sürüm yönetimi durumu doğrulanamadı; devreye alma için bağlantıyı kontrol edin."}</Alert>
            )}
            <Stack direction={{ xs: "column", md: "row" }} spacing={1} alignItems={{ md: "flex-start" }}>
              <TextField size="small" type="date" label="Etkinlik tarihi" value={devreyeAlmaTarihi} onChange={(event) => setDevreyeAlmaTarihi(event.target.value)} InputLabelProps={{ shrink: true }} sx={{ minWidth: 180 }} />
              <TextField size="small" fullWidth label="Onay nedeni" value={devreyeAlmaAciklamasi} onChange={(event) => setDevreyeAlmaAciklamasi(event.target.value)} inputProps={{ maxLength: 500 }} helperText="Değişikliği en az 10 karakterle açıklayın." />
              <Button variant="contained" color="success" onClick={taslagiDevreyeAl} disabled={devreyeAlmaYukleniyor || surumYonetimiDurumu?.etkin !== true || !devreyeAlmaTarihi || devreyeAlmaAciklamasi.trim().length < 10} sx={{ minWidth: 150 }}>
                {devreyeAlmaYukleniyor ? <CircularProgress size={18} color="inherit" /> : "Devreye al"}
              </Button>
            </Stack>
          </Stack>
        </Paper>
      )}
      <Paper variant="outlined" sx={{ p: 1.5, mb: 2 }}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems={{ sm: "center" }}>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="subtitle2">Gelişmiş test ve üretim araçları</Typography>
            <Typography variant="body2" color="text.secondary">
              Mizan satırlarını elle değiştirme, gerçek üretim ve arşiv işlemleri yalnız gerektiğinde açılır. Normal test akışı yukarıdaki tek düğmeyle tamamlanır.
            </Typography>
          </Box>
          <Button size="small" variant="outlined" onClick={() => setTestAyrintilariAcik((onceki) => !onceki)}>
            {testAyrintilariAcik ? "Gelişmiş araçları gizle" : "Gelişmiş araçları göster"}
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
                onChange={(event) => {
                  setTestMizanSatirlariJson(event.target.value);
                  setTestVerisiDuzenlendiMi(true);
                  setSeciliTestMizani(null);
                  setUretimOnizlemeSonucu(null);
                }}
                helperText="Her satırda detayKodu, borc ve alacak zorunludur; bakiye alanları boşsa otomatik hesaplanır. Önceki yıl nakit düzeltmesi varsa duzeltmeBakiye ekleyin."
              />
              <Accordion variant="outlined" disableGutters>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="body2">Nakit enflasyon fişleri (isteğe bağlı)</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <TextField
                    fullWidth
                    size="small"
                    multiline
                    minRows={3}
                    label="Enflasyon fişi satırları (JSON)"
                    value={testMizanFisSatirlariJson}
                    onChange={(event) => {
                      setTestMizanFisSatirlariJson(event.target.value);
                      setTestVerisiDuzenlendiMi(true);
                      setSeciliTestMizani(null);
                      setUretimOnizlemeSonucu(null);
                    }}
                    helperText="Nakit akışı testi için aynı fiş numarasındaki hesapları birlikte girin: yil, yevmiyeNo, hesapKodu, borc, alacak. Fiş yoksa [] bırakın; etki 0 olur."
                  />
                </AccordionDetails>
              </Accordion>
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
                  <TableHead><TableRow><TableCell>Yıl</TableCell><TableCell>Hesap</TableCell><TableCell>Ad</TableCell><TableCell align="right">Borç</TableCell><TableCell align="right">Alacak</TableCell><TableCell align="right">Bakiye</TableCell></TableRow></TableHead>
                  <TableBody>{seciliTestMizani.satirlar.slice(0, 100).map((satir) => <TableRow key={`${seciliTestMizani.id}-${satir.yil}-${satir.detayKodu}`}><TableCell>{satir.yil || seciliTestMizani.yil}</TableCell><TableCell>{satir.detayKodu}</TableCell><TableCell>{satir.hesapAdi}</TableCell><TableCell align="right">{satir.borc.toLocaleString("tr-TR")}</TableCell><TableCell align="right">{satir.alacak.toLocaleString("tr-TR")}</TableCell><TableCell align="right">{satir.bakiye.toLocaleString("tr-TR")}</TableCell></TableRow>)}</TableBody>
                </Table>
              </Paper>}
            </Stack>
          </Paper>
          <Paper id="ana-tablo-gecis" variant="outlined" sx={{ p: 1.5, borderColor: seciliAnaTabloGecisi?.durum === 2 ? "success.main" : "divider" }}>
            <Stack spacing={1.25}>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems={{ sm: "center" }}>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="subtitle2">Ana tabloya kontrollü geçiş</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Hazırlama, örnek mizanla tüm aktif tablo ve dönemleri sınar. Etkinleştirilene kadar mevcut raporlar korunur ve yeni üretim başlatılmaz.
                  </Typography>
                </Box>
                <Chip
                  size="small"
                  color={seciliAnaTabloGecisi?.durum === 2 ? "success" : seciliAnaTabloGecisi?.durum === 1 ? "warning" : "default"}
                  label={seciliAnaTabloGecisi?.durum === 2 ? "Yeni sürüm etkin" : seciliAnaTabloGecisi?.durum === 1 ? "Hazır · etkinleştirme bekliyor" : "Yeni üretim durduruldu"}
                />
              </Stack>
              {seciliAnaTabloGecisi && <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Chip size="small" variant="outlined" label={`Sürüm ${seciliAnaTabloGecisi.surumEtiketi}`} />
                <Chip size="small" variant="outlined" label={`${seciliAnaTabloGecisi.dogrulananTabloSayisi} tablo · ${seciliAnaTabloGecisi.dogrulananDonemSayisi} dönem`} />
                <Chip size="small" variant="outlined" label={`Kanıt ${seciliAnaTabloGecisi.hazirlikKanitiSha256.slice(0, 12)}…`} />
              </Stack>}
              <TextField
                fullWidth
                size="small"
                label="Admin açıklaması"
                value={anaTabloAciklama}
                onChange={(event) => setAnaTabloAciklama(event.target.value)}
                inputProps={{ maxLength: 500 }}
              />
              {seciliAnaTabloGecisi?.durum === 1 && <TextField
                fullWidth
                size="small"
                label="Etkinleştirme onayı"
                value={anaTabloOnayMetni}
                onChange={(event) => setAnaTabloOnayMetni(event.target.value)}
                helperText="Tek komut için ANA TABLOLARA UYGULA yazın. Bu yalnız seçili firma/yıl/kapsamı etkiler."
              />}
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Button size="small" variant="outlined" onClick={anaTabloGecisleriniYukle} disabled={anaTabloGecisYukleniyor}>
                  {anaTabloGecisYukleniyor ? <CircularProgress size={18} /> : "Durumu yenile"}
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  color="info"
                  onClick={anaTabloGecisiniHazirla}
                  disabled={anaTabloGecisYukleniyor || !secilenSurum || !seciliTestMizani || seciliAnaTabloGecisi?.durum === 2}
                >
                  Örnek mizanla hazırla
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  color="success"
                  onClick={anaTabloGecisiniEtkinlestir}
                  disabled={anaTabloGecisYukleniyor || seciliAnaTabloGecisi?.durum !== 1 || seciliAnaTabloGecisi?.surumId !== secilenSurum?.id || surumDurumKodu(secilenSurum?.durum) !== 3 || anaTabloOnayMetni.trim() !== "ANA TABLOLARA UYGULA"}
                >
                  Ana tablolara uygula
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  color="warning"
                  onClick={anaTabloGecisiniGeriAl}
                  disabled={anaTabloGecisYukleniyor || seciliAnaTabloGecisi?.durum !== 2}
                >
                  Yeni üretimi durdur
                </Button>
              </Stack>
              {seciliAnaTabloGecisi?.durum === 2 && <Alert severity="success" variant="outlined">
                Bu kapsamda sonraki “Finansal tabloları oluştur” işlemi seçili Admin sürümünü kullanır. Hata olursa mevcut ana tablo kayıtları silinmez.
              </Alert>}
            </Stack>
          </Paper>
          <Stack spacing={1}>
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
              <Button variant="outlined" size="small" onClick={finansalTabloSistemDurumunuYukle} disabled={sistemDurumuYukleniyor}>
                {sistemDurumuYukleniyor ? <CircularProgress size={18} /> : "Sistem durumunu kontrol et"}
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
              {sistemDurumu && <Chip size="small" color={sistemDurumu.kgkTaramaZamanlayiciEtkin ? "success" : "default"} label={sistemDurumu.kgkTaramaZamanlayiciEtkin ? "KGK zamanlayıcı etkin" : "KGK zamanlayıcı kapalı"} />}
              {sistemDurumu && <Chip size="small" color={sistemDurumu.dbKaliciArsivEtkin ? "success" : "default"} label={sistemDurumu.dbKaliciArsivEtkin ? "DB kalıcı arşiv etkin" : "DB kalıcı arşiv kapalı"} />}
              {kaliciArsivDurumu && <Chip size="small" color={kaliciArsivDurumu.durum === "UYGULANMIS" ? "success" : kaliciArsivDurumu.durum === "KAPALI" ? "default" : "warning"} label={`Migration: ${kaliciArsivDurumu.durum}`} />}
              {sistemDurumu && <Chip size="small" variant="outlined" label={`Üretim deposu: ${sistemDurumu.uretimArsivDeposu}`} />}
              {sistemDurumu && <Chip size="small" variant="outlined" label={`KGK deposu: ${sistemDurumu.kgkCiktiArsivDeposu}`} />}
              {sistemDurumu && <Chip size="small" color={sistemDurumu.uretimArsiviEtkin && sistemDurumu.kgkCiktiArsiviEtkin ? "success" : "warning"} label={`Arşiv: ${sayi(sistemDurumu.uretimKayitSayisi)} üretim`} />}
            </Stack>
            {sistemDurumu && <Paper variant="outlined" sx={{ p: 1.25 }}>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Typography variant="caption" color="text.secondary">KGK tarama aralığı: {sistemDurumu.kgkTaramaAralikDakika} dk · maksimum deneme: {sistemDurumu.kgkTaramaMaksimumDeneme}</Typography>
                <Typography variant="caption" color="text.secondary">KGK çıktı arşivi: {sistemDurumu.kgkCiktiArsiviEtkin ? "hazır" : "kapalı"} · otomatik arşivleme: {sistemDurumu.kgkArsivle ? "açık" : "kapalı"}</Typography>
                <Typography variant="caption" color="text.secondary">Depolar: üretim {sistemDurumu.uretimArsivDeposu} · KGK {sistemDurumu.kgkCiktiArsivDeposu}</Typography>
                {sistemDurumu.sonUretimTarihi && <Typography variant="caption" color="text.secondary">Son üretim: {new Date(sistemDurumu.sonUretimTarihi).toLocaleString("tr-TR")}</Typography>}
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
            <Button variant="contained" size="small" onClick={finansalTabloUret} disabled={uretimYukleniyor || !secilenSurum || !secilenKalemTablosu}>
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
      <Box sx={{ display: duzenleyiciSayfasi || aktifAdim === 0 ? "block" : "none" }}>
      <ParentCard title={duzenleyiciSayfasi ? "Sürüm ve formül düzenleme" : "1. Sürümü hazırla"}>
        <Stack spacing={2}>
          {duzenleyiciSayfasi && (
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems={{ sm: "center" }}>
              <Button variant="outlined" onClick={() => router.push("/FinansalTabloYonetimi")}>Yönetime dön</Button>
              <Typography variant="body2" color="text.secondary">Formülleri kaydedin; ardından yönetim ekranında örnek mizanla test edin.</Typography>
            </Stack>
          )}
          {!duzenleyiciSayfasi && <>
          <Typography variant="body2" color="text.secondary">
            Kullanılacak tanım seti otomatik seçilir. Formül değişikliği gerekiyorsa taslağın düzenleme sayfasını açın.
          </Typography>
          <Accordion
            disableGutters
            expanded={tanimFiltreleriAcik}
            onChange={(_, acik) => setTanimFiltreleriAcik(acik)}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="body2" fontWeight={600}>Tanım arama filtreleri</Typography>
            </AccordionSummary>
            <AccordionDetails>
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
            </AccordionDetails>
          </Accordion>
          </>}
          {tanimYukleniyor && <CircularProgress size={22} />}
          {!tanimYukleniyor && !secilenSurum && <Alert severity={duzenleyiciSayfasi ? "error" : "info"}>{duzenleyiciSayfasi ? "Bu sürüm bulunamadı veya erişim izniniz yok." : "Filtreye uyan tanım seti bulunamadı."}</Alert>}
          {!duzenleyiciSayfasi && tanimSetleri.length > 0 && (
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Tanım seti</InputLabel>
                  <Select label="Tanım seti" value={secilenSet ? secilenSetId : ""} onChange={(event) => tanimSetiSec(Number(event.target.value))}>
                    {tanimSetleri.map((set) => <MenuItem key={set.id} value={set.id}>{set.kod} — {set.ad}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                {secilenSurum ? (
                  <Alert severity={surumDurumKodu(secilenSurum.durum) === 1 ? "warning" : "success"} sx={{ py: 0.25 }}>
                    Kullanılan sürüm: <strong>#{secilenSurum.surumNo} · {secilenSurum.etiket}</strong>
                    {surumDurumKodu(secilenSurum.durum) === 1 ? " · Taslak" : " · Yayında"}
                  </Alert>
                ) : (
                  <Alert severity="info" sx={{ py: 0.25 }}>Seçilen tanım setinde kullanılabilir sürüm yok.</Alert>
                )}
              </Grid>
            </Grid>
          )}
          {surumYonetimiDurumu && !surumYonetimiDurumu.etkin && (
            <Alert severity="warning">{surumYonetimiDurumu.aciklama || "Sürüm yönetimi etkin değil."}</Alert>
          )}
          {!duzenleyiciSayfasi && secilenSet && (
            <Accordion
              disableGutters
              expanded={surumGecmisiAcik}
              onChange={(_, acik) => setSurumGecmisiAcik(acik)}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="body2" fontWeight={600}>Sürüm geçmişi ve eski sürümler</Typography>
              </AccordionSummary>
              <AccordionDetails>
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
              </AccordionDetails>
            </Accordion>
          )}
          {secilenSurum && !duzenleyiciSayfasi && (
            <Paper variant="outlined" sx={{ p: 1.5 }}>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems={{ sm: "center" }}>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="subtitle2">{secilenSurum.etiket}</Typography>
                  <Typography variant="body2" color="text.secondary">Sürüm #{secilenSurum.surumNo} · {seciliSurumTaslakMi ? "Taslak" : seciliSurumYayindaMi ? "Yayında" : "Geçmiş sürüm"} · {secilenSurum.formulSayisi} formül</Typography>
                </Box>
                {seciliSurumTaslakMi ? (
                  <Button variant="contained" onClick={() => router.push(`/FinansalTabloYonetimi/Surum/${secilenSurum.id}`)}>Formülleri düzenle</Button>
                ) : (
                  <Button variant="contained" onClick={() => void taslakKlonla()} disabled={surumIslemiYukleniyor}>{surumIslemiYukleniyor ? <CircularProgress size={18} color="inherit" /> : "Taslak oluştur ve düzenle"}</Button>
                )}
              </Stack>
            </Paper>
          )}
          {secilenSurum && duzenleyiciSayfasi && (
            <Paper variant="outlined" sx={{ p: 1.5 }}>
              <Stack spacing={1.5}>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  <Button size="small" variant="text" onClick={() => router.push("/FinansalTabloYonetimi")}>Hazırlama adımlarına dön</Button>
                  <Chip label={`Sürüm ${secilenSurum.surumNo} · ${secilenSurum.etiket}`} color={surumDurumKodu(secilenSurum.durum) === 3 ? "success" : "default"} />
                  <Chip label={`Teknik değişiklik sayacı ${secilenSurum.eszamanlilikSurumu}`} variant="outlined" />
                  <Chip label={`${secilenSurum.tabloSayisi} tablo · ${secilenSurum.kalemSayisi} kalem · ${secilenSurum.formulSayisi} formül`} variant="outlined" />
                  {surumDurumKodu(secilenSurum.durum) !== 1 && <Button size="small" variant="outlined" onClick={() => void taslakKlonla()} disabled={surumIslemiYukleniyor}>Bu sürümden taslak oluştur</Button>}
                  {surumDurumKodu(secilenSurum.durum) === 1 && <>
                    <Button size="small" variant="outlined" onClick={() => setMetaDuzenleme((onceki) => !onceki)}>{metaDuzenleme ? "Bilgi düzenlemeyi kapat" : "Sürüm bilgilerini düzenle"}</Button>
                    <Button size="small" variant="contained" color="secondary" onClick={teknikDogrula} disabled={dogrulamaYukleniyor}>
                      {dogrulamaYukleniyor ? <CircularProgress size={16} color="inherit" /> : "Teknik doğrula"}
                    </Button>
                  </>}
                </Stack>
                <Alert severity="info" variant="outlined">
                  Ana sürüm bütün tabloları içerir. Taslaktaki kalem ve formül değişiklikleri ilgili tablonun alt revizyonuna kaydedilir. Yayındaki sürüm değiştirilemez; onaylanan taslak yeni ana sürüm olarak devreye alınır.
                </Alert>
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
                {surumDetayi && seciliSurumTaslakMi && secilenKalemTablosu && (
                  <FormControl size="small" fullWidth>
                    <InputLabel>Finansal tablo</InputLabel>
                    <Select label="Finansal tablo" value={secilenKalemTablosu.id} onChange={(event) => {
                      setKalemTabloId(Number(event.target.value));
                      setDuzenlenenKalemId(0);
                      setDuzenlenenKuralId(0);
                      setYeniKuralAcik(false);
                    }}>
                      {surumDetayi.tablolar.map((tablo) => <MenuItem key={tablo.id} value={tablo.id}>{tablo.kod} — {tablo.ad}</MenuItem>)}
                    </Select>
                  </FormControl>
                )}
                {secilenKalemTablosu && (
                  <Accordion disableGutters>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography variant="body2" fontWeight={600}>
                        {secilenKalemTablosu.ad} · {seciliTabloRevizyonlari.length > 0 ? `tablo revizyonu ${seciliTabloRevizyonlari[0].revizyonNo}` : "henüz tablo revizyonu yok"}
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      {revizyonHatasi ? <Alert severity="warning">{revizyonHatasi}</Alert> : seciliTabloRevizyonlari.length === 0
                        ? <Typography variant="body2" color="text.secondary">Bu sürümde kayıtlı tablo düzenlemesi yok. Eski sürümlerin geçmiş düzenlemeleri kayıt altına alınmamış olabilir.</Typography>
                        : <Table size="small"><TableHead><TableRow><TableCell>Revizyon</TableCell><TableCell>Değişiklik</TableCell><TableCell>Hedef</TableCell><TableCell>Tarih</TableCell></TableRow></TableHead><TableBody>{seciliTabloRevizyonlari.map((revizyon) => <TableRow key={revizyon.id}><TableCell>r{revizyon.revizyonNo}</TableCell><TableCell>{revizyon.aciklama}{revizyon.degisiklikJson && <><br /><Button size="small" onClick={() => setAcikRevizyonId((id) => id === revizyon.id ? 0 : revizyon.id)}>{acikRevizyonId === revizyon.id ? "Eski ve yeni değeri gizle" : "Eski ve yeni değeri gör"}</Button>{acikRevizyonId === revizyon.id && <Box component="pre" sx={{ maxHeight: 260, overflow: "auto", fontSize: 11, whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>{(() => { try { return JSON.stringify(JSON.parse(revizyon.degisiklikJson), null, 2); } catch { return revizyon.degisiklikJson; } })()}</Box>}</>}</TableCell><TableCell>{revizyon.hedefAnahtar || "—"}</TableCell><TableCell>{new Date(revizyon.tarih).toLocaleString("tr-TR")}</TableCell></TableRow>)}</TableBody></Table>}
                    </AccordionDetails>
                  </Accordion>
                )}
                <Button size="small" variant="text" onClick={() => setEditorAyrintilariAcik((onceki) => !onceki)} sx={{ alignSelf: "flex-start" }}>
                  {editorAyrintilariAcik ? "Kalem ve sürüm ayrıntılarını gizle" : "Kalem ve sürüm ayrıntılarını göster"}
                </Button>
                {editorAyrintilariAcik && secilenSet && secilenSet.surumler.length > 1 && (
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
                {editorAyrintilariAcik && surumDetayi && (
                  <Box sx={{ overflowX: "auto" }}>
                    <Table size="small"><TableHead><TableRow><TableCell>Tablo</TableCell><TableCell>Tür</TableCell><TableCell align="right">Dönem</TableCell><TableCell align="right">Kalem</TableCell><TableCell align="right">Formül</TableCell><TableCell align="right">Kontrol</TableCell></TableRow></TableHead>
                      <TableBody>{surumDetayi.tablolar.map((tablo) => <TableRow key={tablo.id} hover><TableCell><strong>{tablo.kod}</strong><br /><Typography variant="caption" color="text.secondary">{tablo.ad}</Typography></TableCell><TableCell>{tabloTuruEtiketi(tablo.tabloTuru)}</TableCell><TableCell align="right">{tablo.donemKolonlari.length}</TableCell><TableCell align="right">{tablo.kalemler.length}</TableCell><TableCell align="right">{tablo.kurallar.length}</TableCell><TableCell align="right">{tablo.kontrolKurallari.length}</TableCell></TableRow>)}</TableBody>
                    </Table>
                  </Box>
                )}
                {editorAyrintilariAcik && surumDetayi && surumDurumKodu(secilenSurum.durum) === 1 && secilenKalemTablosu && (
                  <Paper variant="outlined" sx={{ p: 1.5, bgcolor: "action.hover" }}>
                    <Stack spacing={1.5}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="subtitle2" sx={{ flexGrow: 1 }}>Taslak kalem düzenleyici</Typography>
                      </Stack>
                      <Alert severity="info" variant="outlined">
                        Kalem ekleme veya kaldırma elle yapılmaz. KGK Excel sürümleri arasındaki farktan tespit edilen kalemler taslak sürüme aktarılır; bu ekran yalnızca gelen taslağın metadata ve formül incelemesi içindir.
                      </Alert>
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
                {surumDetayi && surumDurumKodu(secilenSurum.durum) === 1 && secilenKalemTablosu && (
                  <Paper variant="outlined" sx={{ p: 1.5, bgcolor: "action.hover" }}>
                    <Stack spacing={1.5}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="subtitle2" sx={{ flexGrow: 1 }}>Formül kuralları</Typography>
                        <Button size="small" variant="outlined" onClick={yeniKuralBaslat}>{yeniKuralAcik ? "Yeni kuralı kapat" : "Yeni kural"}</Button>
                      </Stack>
                      <FormControl size="small" fullWidth>
                        <InputLabel>Finansal tablo kalemi</InputLabel>
                        <Select label="Finansal tablo kalemi" value={duzenlenenKuralId} onChange={(event) => { const id = Number(event.target.value); const kural = secilenKalemTablosu.kurallar.find((aday) => aday.id === id); if (kural) kuralDuzenle(kural); }}>
                          <MenuItem value={0}>Kalem seçin</MenuItem>
                          {secilenKalemTablosu.kurallar.map((kural) => {
                            const kalem = secilenKalemTablosu.kalemler.find((aday) => aday.id === kural.kalemId);
                            return <MenuItem key={kural.id} value={kural.id}>{kalem ? `${kalem.sabitAnahtar} — ${kalem.ad}` : `Hücre ${kural.hucreId}`} · Kural #{kural.id}</MenuItem>;
                          })}
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
                                <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems={{ sm: "center" }} sx={{ mb: 1 }}>
                                  <Typography variant="caption" color="text.secondary" sx={{ flexGrow: 1 }}>
                                    Terim {index + 1} · {terimOzeti(terim)}
                                  </Typography>
                                  <FormControl size="small" sx={{ minWidth: 240 }}>
                                    <InputLabel>Hazır hareket şablonu</InputLabel>
                                    <Select label="Hazır hareket şablonu" value="" onChange={(event) => kuralTerimiSablonuUygula(index, String(event.target.value))}>
                                      <MenuItem value=""><em>Şablon seçin</em></MenuItem>
                                      <MenuItem value="cariBakiye">Cari bakiye</MenuItem>
                                      <MenuItem value="cariTransferHaric">Cari transfer fişi hariç bakiye</MenuItem>
                                      <MenuItem value="cariEksiOncekiTransferHaric">Cari − önceki, transfer fişi hariç</MenuItem>
                                      <MenuItem value="oncekiEksiCariTransferHaric">Önceki − cari, transfer fişi hariç</MenuItem>
                                      <MenuItem value="transferHaricArtis">Transfer fişi hariç yalnız artış</MenuItem>
                                      <MenuItem value="transferHaricAzalis">Transfer fişi hariç yalnız azalış</MenuItem>
                                      <MenuItem value="kontrolBakiye">Cari kontrol bakiye</MenuItem>
                                      <MenuItem value="transferHaricKontrol">Transfer fişi hariç kontrol bakiye</MenuItem>
                                      <MenuItem value="sunumEndeksliOncekiUretim">Sunum endeksli önceki üretim</MenuItem>
                                    </Select>
                                  </FormControl>
                                </Stack>
                                <Grid container spacing={1} alignItems="center">
                                  <Grid item xs={12} md={2}>
                                    <FormControl size="small" fullWidth>
                                      <InputLabel>Hesaplama biçimi</InputLabel>
                                      <Select
                                        label="Hesaplama biçimi"
                                        value={terim.hesaplamaSekli}
                                        onChange={(event) => {
                                          const hesaplamaSekli = Number(event.target.value);
                                          kuralTerimiGuncelle(index, {
                                            hesaplamaSekli,
                                            ...(hesaplamaSekli === 2 ? { karsilastirmaDegerAlani: terim.degerAlani } : {}),
                                          });
                                        }}
                                      >
                                        <MenuItem value={1}>Tek dönem değeri</MenuItem>
                                        <MenuItem value={2}>Dönem farkı</MenuItem>
                                      </Select>
                                    </FormControl>
                                  </Grid>
                                  <Grid item xs={12} md={2}>
                                    <FormControl size="small" fullWidth><InputLabel>Kaynak türü</InputLabel><Select label="Kaynak türü" value={terim.kaynakTuru} onChange={(event) => { const kaynakTuru = Number(event.target.value); kuralTerimiGuncelle(index, { kaynakTuru, ...(kaynakTuru !== terim.kaynakTuru ? { kaynakAnahtari: "" } : {}) }); }}><MenuItem value={1}>Hesap kodu</MenuItem><MenuItem value={2}>Hesap kodu öneki</MenuItem><MenuItem value={3}>Finansal kalem</MenuItem><MenuItem value={4}>Önceki üretim</MenuItem><MenuItem value={5}>Sistem parametresi</MenuItem><MenuItem value={6}>Sabit</MenuItem></Select></FormControl>
                                  </Grid>
                                  <Grid item xs={12} md={3}>
                                    {terim.kaynakTuru === 3 ? (
                                      <FormControl size="small" fullWidth required>
                                        <InputLabel>Kaynak finansal kalem</InputLabel>
                                        <Select
                                          label="Kaynak finansal kalem"
                                          value={terim.kaynakAnahtari}
                                          onChange={(event) => kuralTerimiGuncelle(index, { kaynakAnahtari: String(event.target.value) })}
                                        >
                                          <MenuItem value=""><em>Kalem seçin</em></MenuItem>
                                          {terim.kaynakAnahtari && !kuralKaynakKalemleri.some((kalem) => kalem.sabitAnahtar === terim.kaynakAnahtari) && (
                                            <MenuItem value={terim.kaynakAnahtari} disabled>Bulunamayan kalem · {terim.kaynakAnahtari}</MenuItem>
                                          )}
                                          {kuralKaynakKalemleri.map((kalem) => (
                                            <MenuItem key={kalem.id} value={kalem.sabitAnahtar}>
                                              {kalem.ad} · {kalem.kod || kalem.sabitAnahtar}
                                            </MenuItem>
                                          ))}
                                        </Select>
                                      </FormControl>
                                    ) : terim.kaynakTuru === 5 ? (
                                      <FormControl size="small" fullWidth required>
                                        <InputLabel>Sistem parametresi</InputLabel>
                                        <Select
                                          label="Sistem parametresi"
                                          value={terim.kaynakAnahtari}
                                          onChange={(event) => kuralTerimiGuncelle(index, { kaynakAnahtari: String(event.target.value) })}
                                        >
                                          <MenuItem value=""><em>Seçin</em></MenuItem>
                                          <MenuItem value="SUNUM_ENDEKSI">Sunum endeksi</MenuItem>
                                          <MenuItem value="NAKIT_ENFLASYON_ETKISI">Nakit enflasyon etkisi</MenuItem>
                                          {terim.kaynakAnahtari && !["SUNUM_ENDEKSI", "NAKIT_ENFLASYON_ETKISI"].includes(terim.kaynakAnahtari) && (
                                            <MenuItem value={terim.kaynakAnahtari} disabled>Tanımlanmayan parametre · {terim.kaynakAnahtari}</MenuItem>
                                          )}
                                        </Select>
                                      </FormControl>
                                    ) : (
                                      <TextField
                                        size="small"
                                        label={`Kaynak anahtarı ${index + 1}`}
                                        fullWidth
                                        required
                                        value={terim.kaynakAnahtari}
                                        helperText={terim.kaynakTuru === 4 ? "tabloAdi|kalemKodu biçiminde girin" : undefined}
                                        onChange={(event) => kuralTerimiGuncelle(index, { kaynakAnahtari: event.target.value })}
                                      />
                                    )}
                                  </Grid>
                                  <Grid item xs={6} md={1.5}>
                                    <FormControl size="small" fullWidth><InputLabel>İşlem</InputLabel><Select label="İşlem" value={terim.operator} onChange={(event) => kuralTerimiGuncelle(index, { operator: Number(event.target.value) })}><MenuItem value={1}>Topla</MenuItem><MenuItem value={2}>Çıkar</MenuItem></Select></FormControl>
                                  </Grid>
                                  <Grid item xs={6} md={1.5}><TextField size="small" label="Katsayı" type="number" fullWidth error={terim.katsayi === 0} helperText={terim.katsayi === 0 ? "Sıfır olamaz" : ""} value={terim.katsayi} onChange={(event) => kuralTerimiGuncelle(index, { katsayi: Number(event.target.value) })} /></Grid>
                                  <Grid item xs={12} md={2}>
                                    <FormControl size="small" fullWidth><InputLabel>Değer alanı</InputLabel><Select label="Değer alanı" value={terim.degerAlani} onChange={(event) => kuralTerimiGuncelle(index, { degerAlani: Number(event.target.value) })}><MenuItem value={1}>Bakiye</MenuItem><MenuItem value={2}>Borç</MenuItem><MenuItem value={3}>Alacak</MenuItem><MenuItem value={4}>Rapor borç</MenuItem><MenuItem value={5}>Rapor alacak</MenuItem><MenuItem value={6}>Kontrol bakiye</MenuItem><MenuItem value={7}>Transfer fişi hariç bakiye</MenuItem><MenuItem value={8}>Transfer fişi hariç rapor borç</MenuItem><MenuItem value={9}>Transfer fişi hariç rapor alacak</MenuItem><MenuItem value={10}>Transfer fişi hariç kontrol bakiye</MenuItem></Select></FormControl>
                                  </Grid>
                                  <Grid item xs={12} md={2}><Button color="error" size="small" onClick={() => kuralTerimiSil(index)}>Terimi kaldır</Button></Grid>
                                  <Grid item xs={12} md={2}>
                                    <FormControl size="small" fullWidth><InputLabel>Dönem</InputLabel><Select label="Dönem" value={terim.donemDavranisi} onChange={(event) => kuralTerimiGuncelle(index, { donemDavranisi: Number(event.target.value) })}><MenuItem value={1}>Cari dönem</MenuItem><MenuItem value={2}>Önceki dönem</MenuItem><MenuItem value={3}>Açılış</MenuItem><MenuItem value={4}>Değişim</MenuItem><MenuItem value={5}>Özel</MenuItem></Select></FormControl>
                                  </Grid>
                                  <Grid item xs={6} md={1.5}><TextField size="small" label="Dönem ofseti" type="number" fullWidth inputProps={{ min: -100, max: 100 }} value={terim.donemOfseti} onChange={(event) => kuralTerimiGuncelle(index, { donemOfseti: Number(event.target.value) })} /></Grid>
                                  <Grid item xs={12} md={2}>
                                    <FormControl size="small" fullWidth><InputLabel>Kaynak değer işareti</InputLabel><Select label="Kaynak değer işareti" value={terim.isaretPolitikasi} onChange={(event) => kuralTerimiGuncelle(index, { isaretPolitikasi: Number(event.target.value) })}><MenuItem value={1}>Olduğu gibi</MenuItem><MenuItem value={2}>Mutlak değer</MenuItem><MenuItem value={3}>Yalnız pozitif</MenuItem><MenuItem value={4}>Yalnız negatif</MenuItem><MenuItem value={5}>Ters işaret</MenuItem></Select></FormControl>
                                  </Grid>
                                  <Grid item xs={12}>
                                    <Paper variant="outlined" sx={{ p: 1, bgcolor: terim.katsayiKaynakTuru ? "action.selected" : "transparent" }}>
                                      <Typography variant="caption" fontWeight={600}>Dinamik katsayı</Typography>
                                      <Grid container spacing={1} sx={{ mt: 0.25 }} alignItems="center">
                                        <Grid item xs={12} md={3}>
                                          <FormControl size="small" fullWidth>
                                            <InputLabel>Katsayı kaynağı</InputLabel>
                                            <Select
                                              label="Katsayı kaynağı"
                                              value={terim.katsayiKaynakTuru ?? 0}
                                              onChange={(event) => {
                                                const kaynakTuru = Number(event.target.value);
                                                kuralTerimiGuncelle(index, kaynakTuru === 0
                                                  ? { katsayiKaynakTuru: null, katsayiKaynakAnahtari: "", katsayiDonemDavranisi: 1, katsayiDonemOfseti: 0 }
                                                  : { katsayiKaynakTuru: 5, katsayiKaynakAnahtari: "SUNUM_ENDEKSI" });
                                              }}
                                            >
                                              <MenuItem value={0}>Kullanma</MenuItem>
                                              <MenuItem value={5}>Sunum endeksi</MenuItem>
                                            </Select>
                                          </FormControl>
                                        </Grid>
                                        <Grid item xs={12} md={3}>
                                          <TextField size="small" fullWidth label="Sistem parametresi" value={terim.katsayiKaynakAnahtari} disabled={!terim.katsayiKaynakTuru} InputProps={{ readOnly: true }} />
                                        </Grid>
                                        <Grid item xs={12} md={2.5}>
                                          <FormControl size="small" fullWidth disabled={!terim.katsayiKaynakTuru}>
                                            <InputLabel>Katsayı dönemi</InputLabel>
                                            <Select label="Katsayı dönemi" value={terim.katsayiDonemDavranisi} onChange={(event) => kuralTerimiGuncelle(index, { katsayiDonemDavranisi: Number(event.target.value) })}>
                                              <MenuItem value={1}>Cari dönem</MenuItem><MenuItem value={2}>Önceki dönem</MenuItem><MenuItem value={3}>Açılış</MenuItem><MenuItem value={4}>Değişim</MenuItem><MenuItem value={5}>Özel</MenuItem>
                                            </Select>
                                          </FormControl>
                                        </Grid>
                                        <Grid item xs={6} md={1.5}>
                                          <TextField size="small" label="Katsayı ofseti" type="number" fullWidth disabled={!terim.katsayiKaynakTuru} inputProps={{ min: -100, max: 100 }} value={terim.katsayiDonemOfseti} onChange={(event) => kuralTerimiGuncelle(index, { katsayiDonemOfseti: Number(event.target.value) })} />
                                        </Grid>
                                        <Grid item xs={12} md={2}>
                                          <Typography variant="caption" color="text.secondary">Önceki üretim tutarını seçilen dönem endeksiyle çarpar.</Typography>
                                        </Grid>
                                      </Grid>
                                    </Paper>
                                  </Grid>
                                  {terim.hesaplamaSekli === 2 && (
                                    <Grid item xs={12}>
                                      <Paper variant="outlined" sx={{ p: 1, bgcolor: "action.selected" }}>
                                        <Typography variant="caption" fontWeight={600}>Dönem farkı ayarları</Typography>
                                        <Grid container spacing={1} sx={{ mt: 0.25 }}>
                                          <Grid item xs={12} md={2.5}>
                                            <FormControl size="small" fullWidth><InputLabel>Karşılaştırma alanı</InputLabel><Select label="Karşılaştırma alanı" value={terim.karsilastirmaDegerAlani} onChange={(event) => kuralTerimiGuncelle(index, { karsilastirmaDegerAlani: Number(event.target.value) })}><MenuItem value={1}>Bakiye</MenuItem><MenuItem value={2}>Borç</MenuItem><MenuItem value={3}>Alacak</MenuItem><MenuItem value={4}>Rapor borç</MenuItem><MenuItem value={5}>Rapor alacak</MenuItem><MenuItem value={6}>Kontrol bakiye</MenuItem><MenuItem value={7}>Transfer fişi hariç bakiye</MenuItem><MenuItem value={8}>Transfer fişi hariç rapor borç</MenuItem><MenuItem value={9}>Transfer fişi hariç rapor alacak</MenuItem><MenuItem value={10}>Transfer fişi hariç kontrol bakiye</MenuItem></Select></FormControl>
                                          </Grid>
                                          <Grid item xs={12} md={2}>
                                            <FormControl size="small" fullWidth><InputLabel>Karşılaştırma dönemi</InputLabel><Select label="Karşılaştırma dönemi" value={terim.karsilastirmaDonemDavranisi} onChange={(event) => kuralTerimiGuncelle(index, { karsilastirmaDonemDavranisi: Number(event.target.value) })}><MenuItem value={1}>Cari dönem</MenuItem><MenuItem value={2}>Önceki dönem</MenuItem><MenuItem value={3}>Açılış</MenuItem><MenuItem value={4}>Değişim</MenuItem><MenuItem value={5}>Özel</MenuItem></Select></FormControl>
                                          </Grid>
                                          <Grid item xs={6} md={1.25}><TextField size="small" label="Ofset" type="number" fullWidth inputProps={{ min: -100, max: 100 }} value={terim.karsilastirmaDonemOfseti} onChange={(event) => kuralTerimiGuncelle(index, { karsilastirmaDonemOfseti: Number(event.target.value) })} /></Grid>
                                          <Grid item xs={12} md={2}>
                                            <FormControl size="small" fullWidth><InputLabel>Karşılaştırma işareti</InputLabel><Select label="Karşılaştırma işareti" value={terim.karsilastirmaIsaretPolitikasi} onChange={(event) => kuralTerimiGuncelle(index, { karsilastirmaIsaretPolitikasi: Number(event.target.value) })}><MenuItem value={1}>Olduğu gibi</MenuItem><MenuItem value={2}>Mutlak değer</MenuItem><MenuItem value={3}>Yalnız pozitif</MenuItem><MenuItem value={4}>Yalnız negatif</MenuItem><MenuItem value={5}>Ters işaret</MenuItem></Select></FormControl>
                                          </Grid>
                                          <Grid item xs={12} md={2}>
                                            <FormControl size="small" fullWidth><InputLabel>Fark yönü</InputLabel><Select label="Fark yönü" value={terim.farkYonu} onChange={(event) => kuralTerimiGuncelle(index, { farkYonu: Number(event.target.value) })}><MenuItem value={1}>Kaynak − karşılaştırma</MenuItem><MenuItem value={2}>Karşılaştırma − kaynak</MenuItem></Select></FormControl>
                                          </Grid>
                                          <Grid item xs={12} md={2.25}>
                                            <FormControl size="small" fullWidth><InputLabel>Fark sonucu</InputLabel><Select label="Fark sonucu" value={terim.sonucIsaretPolitikasi} onChange={(event) => kuralTerimiGuncelle(index, { sonucIsaretPolitikasi: Number(event.target.value) })}><MenuItem value={1}>Olduğu gibi</MenuItem><MenuItem value={2}>Mutlak değer</MenuItem><MenuItem value={3}>Yalnız pozitif</MenuItem><MenuItem value={4}>Yalnız negatif</MenuItem><MenuItem value={5}>Ters işaret</MenuItem></Select></FormControl>
                                          </Grid>
                                          <Grid item xs={12} md={2}>
                                            <TextField size="small" label="Asgari mutlak fark" type="number" fullWidth inputProps={{ min: 0, step: "any" }} value={terim.asgariMutlakFark} onChange={(event) => kuralTerimiGuncelle(index, { asgariMutlakFark: Math.max(0, Number(event.target.value)) })} helperText="Bu değerin altındaki hareketler sıfır kabul edilir." />
                                          </Grid>
                                        </Grid>
                                      </Paper>
                                    </Grid>
                                  )}
                                  <Grid item xs={12} md={4}><TextField size="small" label="Kaynak formül notu" fullWidth value={terim.hamTerim} onChange={(event) => kuralTerimiGuncelle(index, { hamTerim: event.target.value })} /></Grid>
                                  <Grid item xs={12} md={2.5}><Stack direction="row" spacing={0.5} alignItems="center"><Switch size="small" checked={terim.zorunluMu} onChange={(event) => kuralTerimiGuncelle(index, { zorunluMu: event.target.checked })} /><Typography variant="caption">Kaynak zorunlu</Typography></Stack></Grid>
                                </Grid>
                              </Paper>
                            </Grid>
                          ))}
                          <Grid item xs={12}><Stack direction="row" spacing={1}><Button variant="contained" size="small" onClick={yeniKuralAcik ? kuralOlustur : kuralKaydet} disabled={kuralKaydediliyor || (yeniKuralAcik && !yeniKuralKalemId) || kuralForm.terimler.some((terim) => !terim.kaynakAnahtari.trim() || terim.katsayi === 0 || terim.asgariMutlakFark < 0 || (terim.katsayiKaynakTuru !== null && !terim.katsayiKaynakAnahtari.trim()))}>{kuralKaydediliyor ? <CircularProgress size={18} color="inherit" /> : yeniKuralAcik ? "Yeni kuralı kaydet" : "Kuralı kaydet"}</Button><Button size="small" onClick={() => { setDuzenlenenKuralId(0); setYeniKuralAcik(false); }} disabled={kuralKaydediliyor}>İptal</Button></Stack></Grid>
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
      {!kgkSayfasi && !duzenleyiciSayfasi && <Paper
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
            onClick={() => adimaGit(0)}
          >
            Geri
          </Button>
          <Typography variant="caption" color="text.secondary" textAlign="center">
            {aktifAdim + 1} / 2
          </Typography>
          {aktifAdim === 0 ? (
            <Button variant="contained" onClick={() => adimaGit(1)}>Sonraki: Test et</Button>
          ) : yeniSurumDevredeMi ? (
            <Button variant="contained" onClick={() => { setTestAyrintilariAcik(true); adimaGit(1, "ana-tablo-gecis"); }}>Ana tablo geçişine git</Button>
          ) : seciliSurumYayindaMi && onizlemeBasariliMi ? (
            <Button variant="contained" onClick={() => router.push("/FinansalTabloYonetimi/KgkGuncellemeleri")}>KGK kontrolüne geç</Button>
          ) : seciliSurumTaslakMi && onizlemeBasariliMi ? (
            <Button variant="contained" color="success" onClick={() => adimaGit(1, "taslak-devreye-al")}>Devreye alma alanına git</Button>
          ) : (
            <Button variant="contained" onClick={() => void otomatikTestiCalistir()} disabled={yonlendirmeYukleniyor || !secilenSurum}>Otomatik testi çalıştır</Button>
          )}
        </Stack>
      </Paper>}
    </PageContainer>
  );
};

export default Page;
