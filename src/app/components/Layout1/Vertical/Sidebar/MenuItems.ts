import { uniqueId } from "lodash";

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
import {
  IconAward,
  IconBoxMultiple,
  IconPoint,
  IconAlertCircle,
  IconNotes,
  IconCalendar,
  IconMail,
  IconTicket,
  IconEdit,
  IconGitMerge,
  IconCurrencyDollar,
  IconApps,
  IconFileDescription,
  IconFileDots,
  IconFiles,
  IconBan,
  IconStar,
  IconMoodSmile,
  IconBorderAll,
  IconBorderHorizontal,
  IconBorderInner,
  IconBorderVertical,
  IconBorderTop,
  IconUserCircle,
  IconPackage,
  IconMessage2,
  IconBasket,
  IconChartLine,
  IconChartArcs,
  IconChartCandle,
  IconChartArea,
  IconChartDots,
  IconChartDonut3,
  IconChartRadar,
  IconLogin,
  IconUserPlus,
  IconRotate,
  IconFileAnalytics,
  IconBox,
  IconShoppingCart,
  IconAperture,
  IconLayout,
  IconUpload,
  IconSettings,
  IconHelp,
  IconZoomCode,
  IconBoxAlignBottom,
  IconBoxAlignLeft,
  IconBorderStyle2,
  IconLockAccess,
  IconAppWindow,
  IconKeyframes,
  IconBuildingSkyscraper,
  IconTemplate,
  IconBarcode,
  IconNumber,
  IconNumbers,
} from "@tabler/icons-react";

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
        title: "Formüller",
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
];

export default Menuitems;
