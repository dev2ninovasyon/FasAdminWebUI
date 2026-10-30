import { uniqueId } from "lodash";
import {
  IconPoint,
  IconUpload,
  IconFileAnalytics,
  IconKeyframes,
  IconBuildingSkyscraper,
  IconTemplate,
  IconBarcode,
  IconNumbers,
  IconChartLine,
  IconSettings,
  IconActivity,
  IconServer,
  IconMessage2,
} from "@tabler/icons-react";

interface MenuitemsType {
  [x: string]: any;
  id?: string;
  navlabel?: boolean;
  subheader?: string;
  title?: string;
  icon?: any;
  href?: string;
  children?: MenuitemsType[];
  chip?: string;
  chipColor?: string;
  variant?: string;
  external?: boolean;
}

const Menuitems: MenuitemsType[] = [
  {
    navlabel: true,
    subheader: "Admin Menü",
  },
  {
    id: uniqueId(),
    title: "Denetçi İşlemleri",
    icon: IconBuildingSkyscraper,
    href: "/",
    children: [
      {
        id: uniqueId(),
        title: "Denetçi Firma İşlemleri",
        icon: IconPoint,
        href: "/DenetciFirmaIslemleri",
      },
    ],
  },
  {
    id: uniqueId(),
    title: "Format İşlemleri",
    icon: IconKeyframes,
    href: "/",
    children: [
      {
        id: uniqueId(),
        title: "Formatlar",
        icon: IconPoint,
        href: "/Formatlar",
      },
      {
        id: uniqueId(),
        title: "Email Şablonları",
        icon: IconPoint,
        href: "/EmailSablonlari",
      },
    ],
  },
  {
    id: uniqueId(),
    title: "Formül İşlemleri",
    icon: IconNumbers,
    href: "/",
    children: [
      {
        id: uniqueId(),
        title: "Mevcut Sistem Formülleri",
        icon: IconPoint,
        href: "/Formuller",
      },
    ],
  },
  {
    id: uniqueId(),
    title: "Genel Hesap Planı",
    icon: IconTemplate,
    href: "/GenelHesapPlani",
  },
  {
    id: uniqueId(),
    title: "Finansal Tablo Yönetimi",
    icon: IconChartLine,
    href: "/",
    children: [
      {
        id: uniqueId(),
        title: "Sürümlü Tanım ve Formüller",
        icon: IconPoint,
        href: "/FinansalTabloYonetimi",
      },
      {
        id: uniqueId(),
        title: "KGK Güncellemeleri",
        icon: IconPoint,
        href: "/FinansalTabloYonetimi/KgkGuncellemeleri",
      },
    ],
  },
  {
    id: uniqueId(),
    title: "Hesap Kodları",
    icon: IconBarcode,
    href: "/HesapKodlari",
  },
  {
    id: uniqueId(),
    title: "Veri İşlemleri",
    icon: IconUpload,
    href: "/",
    children: [
      {
        id: uniqueId(),
        title: "Döviz Kurları",
        icon: IconPoint,
        href: "/DovizKurlari",
      },
    ],
  },
  {
    id: uniqueId(),
    title: "Belge Yönetimi",
    icon: IconKeyframes,
    href: "/",
    children: [
      {
        id: uniqueId(),
        title: "Denetim Dosya Belgeleri",
        icon: IconPoint,
        href: "/DenetimDosyaBelgeleri",
      },
      {
        id: uniqueId(),
        title: "Menü Kullanım Bilgileri",
        icon: IconPoint,
        href: "/MenuIslemleri",
      },
    ],
  },
  {
    id: uniqueId(),
    title: "Rapor",
    icon: IconFileAnalytics,
    href: "/",
    children: [
      {
        id: uniqueId(),
        title: "Görüşler",
        icon: IconPoint,
        href: "/Gorusler",
      },
      {
        id: uniqueId(),
        title: "Dipnotlar",
        icon: IconPoint,
        href: "/Dipnotlar",
      },
    ],
  },
  {
    id: uniqueId(),
    title: "Çalışma Kağıtları",
    icon: IconFileAnalytics,
    href: "//",
    children: [
      {
        id: uniqueId(),
        title: "Bağımsız Denetim Metodolojisi",
        icon: IconPoint,
        href: "/StandartCalismaKagitlari/BagimsizDenetimMetodolojisi",
      },
    ],
  },
  {
    id: uniqueId(),
    title: "Sistem ve Log Yönetimi",
    icon: IconSettings,
    href: "/",
    children: [
      {
        id: uniqueId(),
        title: "Hangfire Yönetimi",
        icon: IconPoint,
        href: "/Hangfire",
      },
      {
        id: uniqueId(),
        title: "Sistem Logları",
        icon: IconPoint,
        href: "/SistemLoglari",
      },
      {
        id: uniqueId(),
        title: "Sistem İşlem Logları (Audit)",
        icon: IconPoint,
        href: "/AuditLoglari",
      },
      {
        id: uniqueId(),
        title: "Enflasyon Logları",
        icon: IconPoint,
        href: "/EnflasyonLoglari",
      },
      {
        id: uniqueId(),
        title: "Geri Bildirimler",
        icon: IconPoint,
        href: "/GeriBildirimler",
      },
    ],
  },
];

export default Menuitems;
