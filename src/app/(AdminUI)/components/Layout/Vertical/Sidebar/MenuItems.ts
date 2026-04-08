import { uniqueId } from "lodash";

export interface MenuitemsType {
  [x: string]: any;
  id?: string;
  navlabel?: boolean;
  subheader?: string;
  title?: string;
  parentTitle?: string;
  icon?: any;
  customIcon?: any;
  href?: string;
  children?: MenuitemsType[];
  chip?: string;
  chipColor?: string;
  variant?: string;
  external?: boolean;
  formKodu?: string;
  aciklama?: string;
}
import {
  IconPoint,
  IconUpload,
  IconFilters,
  IconTimeline,
  IconFolderOpen,
  IconFileDescription,
  IconFolderUp,
  IconTrendingUp,
  IconFileCheck,
  IconLayoutGridAdd,
  IconScript,
  IconUsersGroup,
  IconHierarchy,
  IconInfoCircle,
  IconFileAnalytics,
  IconUsers,
  IconHome,
  IconCalculator,
  IconRepeat,
  IconAddressBook,
  IconMail,
} from "@tabler/icons-react";

export function createMenuItems(
  rol?: string[],
  denetimTuru?: string,
  enflasyonmu?: boolean,
  konsolidemi?: boolean,
  bddkmi?: boolean,
  yil?: number
): MenuitemsType[] {
  return rol == undefined ||
    (rol.length === 1 && rol[0] === "FinansalTabloKontrol")
    ? [
      {
        id: uniqueId(),
        title: "ANASAYFA",
        icon: IconHome,
        href: "/Anasayfa",
      },
      {
        id: uniqueId(),
        title: "MÜŞTERİ",
        icon: IconUsers,
        href: "/Musteri",
        children: [
          {
            id: uniqueId(),
            title: "Müşteri İşlemleri",
            customIcon: "public/images/svgs/musteri/musteri-islemleri.svg",
            icon: IconPoint,
            href: "/Musteri/MusteriIslemleri",
          },
        ],
      },
      { id: uniqueId(), navlabel: true, subheader: "MENÜ" },
      {
        id: uniqueId(),
        title: "DİĞER İŞLEMLER",
        icon: IconHierarchy,
        href: "/DigerIslemler",
        children: [
          {
            id: uniqueId(),
            title: "Arşiv",
            icon: IconPoint,
            href: "/DigerIslemler/Arsiv",
          },
          {
            id: uniqueId(),
            title: "Denetçi Firma Bilgileri",
            icon: IconPoint,
            href: "/DigerIslemler/DenetciFirmaBilgileri",
          },
          {
            id: uniqueId(),
            title: "Üyelik Bilgileri",
            icon: IconPoint,
            href: "/DigerIslemler/UyelikBilgileri",
          },
          {
            id: uniqueId(),
            title: "Veri Aktarma",
            icon: IconPoint,
            href: "/DigerIslemler/VeriAktarma",
          },
          {
            id: uniqueId(),
            title: "Email ÅablonlarÄ±",
            icon: IconMail,
            href: "/admin/email-templates",
          },
        ],
      },
      {
        id: uniqueId(),
        title: "STANDART ÇALIŞMA KAĞITLARI",
        icon: IconFolderUp,
        href: "/StandartCalismaKagitlari",

        children: [
          {
            id: uniqueId(),
            title: "Bağımsız Denetim Metodolojisi",
            icon: IconPoint,
            href: "/StandartCalismaKagitlari/BagimsizDenetimMetodolojisi",
          },
          {
            id: uniqueId(),
            title: "Denetim Dosya Yazdır",
            icon: IconPoint,
            href: "/StandartCalismaKagitlari/DenetimDosyaYazdir",
          },
        ],
      },
      {
        id: uniqueId(),
        title: "KULLANIM KILAVUZU",
        icon: IconInfoCircle,
        href: "/KullanimKilavuzu",
      },
    ]
    : [
      {
        id: uniqueId(),
        title: "ANASAYFA",
        icon: IconHome,
        href: "/Anasayfa",
      },
      {
        id: uniqueId(),
        title: "MÜŞTERİ",
        icon: IconUsers,
        href: "/Musteri",
        children: [
          {
            id: uniqueId(),
            title: "Müşteri İşlemleri",
            customIcon: "public/images/svgs/musteri/musteri-islemleri.svg",
            icon: IconPoint,
            href: "/Musteri/MusteriIslemleri",
          },
          {
            id: uniqueId(),
            title: "Şirket Yönetim Kadrosu",
            formKodu: "SirketYonetimKadrosu",
            customIcon:
              "public/images/svgs/musteri/sirket-yonetim-kadrosu.svg",
            icon: IconPoint,
            href: "/Musteri/SirketYonetimKadrosu",
          },
          {
            id: uniqueId(),
            title: "Şubeler",
            formKodu: "Subeler",
            customIcon: "public/images/svgs/musteri/subeler.svg",
            icon: IconPoint,
            href: "/Musteri/Subeler",
          },
          {
            id: uniqueId(),
            title: "Hissedarlar",
            formKodu: "Hissedarlar",
            customIcon: "public/images/svgs/musteri/hissedarlar.svg",
            icon: IconPoint,
            href: "/Musteri/Hissedarlar",
          },
          {
            id: uniqueId(),
            title: "Müşteri Tanıma",
            formKodu:
              "MusteriTanimaStatikBilgiler-MusteriTanimaSayisalBilgiler",
            customIcon: "public/images/svgs/musteri/musteri-tanima.svg",
            icon: IconPoint,
            href: "/Musteri/MusteriTanima",
          },
          {
            id: uniqueId(),
            title: "İşletme Tanıma",
            formKodu: "IsletmeTanimaBelgesi",
            customIcon: "public/images/svgs/musteri/isletme-tanima.svg",
            icon: IconPoint,
            href: "/Musteri/IsletmeTanima",
          },
          {
            id: uniqueId(),
            title: "İşletme Faaliyet ve Çevresi Tanıma",
            formKodu: "IsletmeFaaliyetveCevreTanima",
            customIcon:
              "public/images/svgs/musteri/isletme-faaliyet-ve-cevresi-tanima.svg",
            icon: IconPoint,
            href: "/Musteri/IsletmeFaaliyetVeCevresiTanima",
          },
          {
            id: uniqueId(),
            title: "Teklif Hesaplama",
            formKodu: "TeklifHesaplama",
            customIcon: "public/images/svgs/musteri/teklif-hesaplama.svg",
            icon: IconPoint,
            href: "/Musteri/TeklifHesaplama",
          },
          {
            id: uniqueId(),
            title: "Teklif Belgesi",
            formKodu: "TeklifBelgesi",
            customIcon: "public/images/svgs/musteri/teklif-belgesi.svg",
            icon: IconPoint,
            href: "/Musteri/TeklifBelgesi",
          },
          {
            id: uniqueId(),
            title: "Teklif Mektubu",
            formKodu: "TeklifMektubu",
            customIcon: "public/images/svgs/musteri/teklif-mektubu.svg",
            icon: IconPoint,
            href: "/Musteri/TeklifMektubu",
          },
          {
            id: uniqueId(),
            title: "Kendi Yetkinliğini Değerlendirme",
            formKodu: "KendiYetkinliginiDegerlendirmeBelgesi",
            customIcon:
              "public/images/svgs/musteri/kendi-yetkinligini-degerlendirme.svg",
            icon: IconPoint,
            href: "/Musteri/KendiYetkinliginiDegerlendirme",
          },
          {
            id: uniqueId(),
            title: "Müşteri Dürüstlüğünü Değerlendirme",
            formKodu: "MusteriDurustlugunuDegerlendirme",
            customIcon:
              "public/images/svgs/musteri/musteri-durustlugunu-degerlendirme.svg",
            icon: IconPoint,
            href: "/Musteri/MusteriDurustlugunuDegerlendirme",
          },
          {
            id: uniqueId(),
            title: "Müşteri Kabul İşlemi",
            customIcon: "public/images/svgs/musteri/musteri-kabul.svg",
            icon: IconPoint,
            href: "/Musteri/MusteriKabulIslemi",
          },
          {
            id: uniqueId(),
            title: "Sözleşme Kabul Belgesi",
            formKodu: "SozlesmeKabul",
            customIcon: "public/images/svgs/musteri/sozlesme-kabul.svg",
            icon: IconPoint,
            href: "/Musteri/SozlesmeKabul",
          },
        ],
      },
      {
        id: uniqueId(),
        title: "SÖZLEŞME",
        icon: IconScript,
        href: "/Sozlesme",
        children: [
          {
            id: uniqueId(),
            title: "Denetim Kadrosu Atama",
            customIcon:
              "public/images/svgs/sozlesme/bagimsiz-denetim-sozlesmesi.svg",
            icon: IconPoint,
            href: "/Sozlesme/DenetimKadrosuAtama",
          },
          {
            id: uniqueId(),
            title: "Bağımsız Denetim Sözleşmesi",
            formKodu: "DenetimSozlesmesi",
            customIcon:
              "public/images/svgs/sozlesme/denetim-kadrosu-atama.svg",
            icon: IconPoint,
            href: "/Sozlesme/BagimsizDenetimSozlesmesi",
          },
        ],
      },
      { id: uniqueId(), navlabel: true, subheader: "MENÜ" },
      {
        id: uniqueId(),
        title: "VERİ",
        icon: IconUpload,
        href: "/Veri",
        children: [
          {
            id: uniqueId(),
            title: "Defter / K. V. Beyannamesi Yükleme",
            customIcon:
              "public/images/svgs/veri/defter-k-v-beyannamesi-yukleme.svg",
            icon: IconPoint,
            href: "/Veri/DefterKVBeyannamesiYukleme",
          },
          {
            id: uniqueId(),
            title: "Fatura",
            customIcon:
              "public/images/svgs/veri/defter-k-v-beyannamesi-yukleme.svg",
            icon: IconPoint,
            href: "/Veri/Fatura",
          },
          {
            id: uniqueId(),
            title: "Diğer Veri Yükleme",
            customIcon: "public/images/svgs/veri/vuk-mizan-veri-yukleme.svg",
            icon: IconPoint,
            href: "/Veri/VeriYukleme",
          },
          {
            id: uniqueId(),
            title: "Mizanlar",
            customIcon: "public/images/svgs/veri/mizanlar.svg",
            icon: IconPoint,
            href: "/Veri/Mizanlar",
            children: [
              {
                id: uniqueId(),
                title: "E-Defter Mizan Oluşturma",
                customIcon: "public/images/svgs/veri/mizanlar.svg",
                icon: IconPoint,
                href: "/Veri/Mizanlar/EDefterMizan",
              },
              {
                id: uniqueId(),
                title: "Oluşturulmuş Mizanlar",
                customIcon: "public/images/svgs/veri/mizanlar.svg",
                icon: IconPoint,
                href: "/Veri/Mizanlar/OlusturulmusMizanlar",
              },
            ],
          },
          {
            id: uniqueId(),
            title: "E-Defter İnceleme",
            customIcon: "public/images/svgs/veri/defter-inceleme.svg",
            icon: IconPoint,
            href: "/Veri/EDefterInceleme",
          },
        ],
      },
      {
        id: uniqueId(),
        title: "MÜŞTERİ BELGELERİ",
        icon: IconFileDescription,
        href: "/MusteriBelgeleri",
      },
      {
        id: uniqueId(),
        title: "PLAN VE PROGRAM",
        icon: IconTimeline,
        href: "/PlanVeProgram",
        children: [
          {
            id: uniqueId(),
            title: "Denetim Programı",
            formKodu: "DenetimProgrami",
            icon: IconPoint,
            href: "/PlanVeProgram/DenetimProgrami",
          },
          {
            id: uniqueId(),
            title: "Maddi Doğruluk Görev Atamaları",
            formKodu: "MaddiDogrulukGorevAtamalari",
            icon: IconPoint,
            href: "/PlanVeProgram/MaddiDogrulukGorevAtamalari",
          },
          {
            id: uniqueId(),
            title: "Denetim Takvimi",
            formKodu: "DenetimTakvimi",
            icon: IconPoint,
            href: "/PlanVeProgram/DenetimTakvimi",
          },
          {
            id: uniqueId(),
            title: "Denetim Planı",
            formKodu: "DenetimPlani",
            icon: IconPoint,
            href: "/PlanVeProgram/DenetimPlani",
          },
          {
            id: uniqueId(),
            title: "Denetim Ekibi Görev Tebliği",
            formKodu: "GorevTebligi",
            icon: IconPoint,
            href: "/PlanVeProgram/GorevTebligi",
          },
          {
            id: uniqueId(),
            title: "Denetçi Bağımsızlık ve Sorumluluk Taahhütnameleri",
            formKodu: "BagimsizlikSorumlulukBeyani",
            icon: IconPoint,
            href: "/PlanVeProgram/BagimsizlikSorumlulukBeyani",
          },
          {
            id: uniqueId(),
            title: "Etik Gerekliliklere İlişkin Bildirim ve Değerlendirme",
            formKodu: "EtikGerekliliklereIliskinBildirim",
            icon: IconPoint,
            href: "/PlanVeProgram/EtikGerekliliklereIliskinBildirim",
          },
          {
            id: uniqueId(),
            title:
              "Mesleki Etik İlkelere Uyum, Bağımsızlık Değerlendirme ve Kontrol",
            formKodu: "MeslekiEtik",
            icon: IconPoint,
            href: "/PlanVeProgram/MeslekiEtik",
          },
          {
            id: uniqueId(),
            title: "Denetim Zamanı Bildirme",
            formKodu: "DenetimZamaniBildirme",
            icon: IconPoint,
            href: "/PlanVeProgram/DenetimZamaniBildirme",
          },
          {
            id: uniqueId(),
            title: "Sorumlu Denetçi Kimlik ve Deneyim Bildirim",
            formKodu: "MeslekiDeneyimYeterlilik",
            icon: IconPoint,
            href: "/PlanVeProgram/MeslekiDeneyimYeterlilik",
          },
          {
            id: uniqueId(),
            title: "Sorumlu Denetçi Sorumlulukları Bildirim",
            formKodu: "SorumlulukBildirimi",
            icon: IconPoint,
            href: "/PlanVeProgram/SorumlulukBildirimi",
          },
          {
            id: uniqueId(),
            title:
              "Denetlenen İşletmenin Tabi Olduğu Mevzuata İlişkin Değerlendirme",
            formKodu:
              "DenetlenenIsletmeninTabiOlduguMevzuataIliskinDegerlendirme",
            icon: IconPoint,
            href: "/PlanVeProgram/DenetlenenIsletmeninTabiOlduguMevzuataIliskinDegerlendirme",
          },
          {
            id: uniqueId(),
            title: "Denetim Strateji Kılavuzu",
            formKodu: "DenetimStratejiKilavuzu",
            icon: IconPoint,
            href: "/PlanVeProgram/DenetimStratejiKilavuzu",
          },
          {
            id: uniqueId(),
            title: "Faaliyet Riski Belirleme Belgesi",
            formKodu: "FaaliyetRiskBelirleme",
            icon: IconPoint,
            href: "/PlanVeProgram/FaaliyetRiskBelirleme",
          },
          {
            id: uniqueId(),
            title: "Beyan ve Soruşturma Sonucu Tespit Edilen Riskler",
            formKodu: "TespitEdilenRiskler",
            icon: IconPoint,
            href: "/PlanVeProgram/TespitEdilenRiskler",
          },
          {
            id: uniqueId(),
            title: "Denetim Riski Belirleme Belgesi",
            formKodu: "DenetimRiskBelirleme",
            icon: IconPoint,
            href: "/PlanVeProgram/DenetimRiskBelirleme",
          },
          {
            id: uniqueId(),
            title: "Finansal Tablolar Denetim Riski Belirleme",
            formKodu: "FinansalTablolarDenetimRiskiBelirleme",
            icon: IconPoint,
            href: "/PlanVeProgram/FinansalTablolarDenetimRiskiBelirleme",
          },
          {
            id: uniqueId(),
            title: "Bulgu Riski Belirleme",
            formKodu: "DogalRisk-KontrolRiski",
            icon: IconPoint,
            href: "/PlanVeProgram/BulguRiskiBelirleme",
          },
          {
            id: uniqueId(),
            title: "Denetim Planında Önemlilik",
            icon: IconPoint,
            href: "/PlanVeProgram/DenetimPlanindaOnemlilik",
            children: [
              {
                id: uniqueId(),
                title: "Önemlilik Ve Örneklem",
                formKodu: "OnemlilikVeOrneklem",
                icon: IconPoint,
                href: "/PlanVeProgram/DenetimPlanindaOnemlilik/OnemlilikVeOrneklem",
              },
              {
                id: uniqueId(),
                title: "Finansal Tablo Kalemlerinde Değişim",
                formKodu: "FinansalTabloKalemlerindeDegisim",
                icon: IconPoint,
                href: "/PlanVeProgram/DenetimPlanindaOnemlilik/FinansalTabloKalemlerindeDegisim",
              }, {
                id: uniqueId(),
                title: "Fiş Büyüklüğü Analizi",
                formKodu: "FisBuyukluguAnalizi",
                icon: IconPoint,
                href: "/PlanVeProgram/DenetimPlanindaOnemlilik/FisBuyukluguAnalizi",
              },
            ],
          },
          {
            id: uniqueId(),
            title: "Denetim Risk Değerlendirme",
            formKodu: "DenetimRiskDegerlendirme",
            icon: IconPoint,
            href: "/PlanVeProgram/DenetimRiskDegerlendirme",
          },
          {
            id: uniqueId(),
            title: "Bilgi İşlem Muhasebe Sistemi Değerlendirme",
            formKodu: "BilgiIslemMuhasebe",
            icon: IconPoint,
            href: "/PlanVeProgram/BilgiIslemMuhasebe",
          },
          {
            id: uniqueId(),
            title: "İşletmeye İlişkin İç Kontrol Tespit Belgesi",
            formKodu: "IsletmeyeIliskinIcKontrolTespit",
            icon: IconPoint,
            href: "/PlanVeProgram/IsletmeyeIliskinIcKontrolTespit",
          },
          {
            id: uniqueId(),
            title: "Hesaplara İlişkin İç Kontrol Tespit Belgesi",
            formKodu: "HesaplaraIliskinIcKontrolTespit",
            icon: IconPoint,
            href: "/PlanVeProgram/HesaplaraIliskinIcKontrolTespit",
          },
          {
            id: uniqueId(),
            title: "İşletmeye İlişkin İç Kontrol Sistemi Özet Değerlendirme",
            formKodu: "IsletmeyeIliskinIcKontrolSistemiOzetDegerlendirme",
            icon: IconPoint,
            href: "/PlanVeProgram/IsletmeyeIliskinIcKontrolSistemiOzetDegerlendirme",
          },
          {
            id: uniqueId(),
            title:
              "İç Kontrol Değerlendirme Sonucuna Göre Uygulanan Denetim Teknikleri",
            formKodu:
              "IcKontrolDegerlemeUnsur-IcKontrolDegerlemeAnket-IcKontrolDegerlemeTeknik",
            icon: IconPoint,
            href: "/PlanVeProgram/IcKontrolDegerlendirme",
          },
          {
            id: uniqueId(),
            title:
              "Denetim Çalışması Öncesi Hile ve Usulsüzlük Üzerine Denetim Ekibi Görüşme Belgesi",
            formKodu:
              "HileUsulsuzlukToplantiBilgileri-HileUsulsuzlukToplantidaGorusulenHususlar",
            icon: IconPoint,
            href: "/PlanVeProgram/HileUsulsuzlukEkipCalismasi",
          },
          {
            id: uniqueId(),
            title: "Hile Usulsüzlük ve Risk Faktörleri Belirleme",
            formKodu: "HileUsulsuzlukBelirleme",
            icon: IconPoint,
            href: "/PlanVeProgram/HileUsulsuzlukBelirleme",
          },
          {
            id: uniqueId(),
            title: "Hile Usulsüzlük ve Risk Faktörleri Değerlendirme",
            formKodu: "HileUsulsuzlukDegerlendirme",
            icon: IconPoint,
            href: "/PlanVeProgram/HileUsulsuzlukDegerlendirme",
          },
          {
            id: uniqueId(),
            title: "İşletme Varlıklarının Korunmasına İlişkin Değerlendirme",
            formKodu: "IsletmeVarliklarininKorunmasinaIliskinDegerlendirme",
            icon: IconPoint,
            href: "/PlanVeProgram/IsletmeVarliklarininKorunmasinaIliskinDegerlendirme",
          },
        ],
      },
      {
        id: uniqueId(),
        title: "HESAPLAMALAR",
        icon: IconCalculator,
        href: "/Hesaplamalar",
        children: [
          {
            id: uniqueId(),
            title: "Yaşlandırma",
            customIcon: "public/images/svgs/hesaplamalar/yaslandirma.svg",
            icon: IconPoint,
            href: "/Hesaplamalar/Yaslandirma",
          },
          {
            id: uniqueId(),
            title: "Beklenen Kredi Zararı",
            customIcon:
              "public/images/svgs/hesaplamalar/beklenen-kredi-zarari.svg",
            icon: IconPoint,
            href: "/Hesaplamalar/BeklenenKrediZarari",
          },
          {
            id: uniqueId(),
            title: "Kıdem Tazminatı (Bobi)",
            customIcon: "public/images/svgs/hesaplamalar/kidem-bobi.svg",
            icon: IconPoint,
            href: "/Hesaplamalar/KidemTazminatiBobi",
          },
          {
            id: uniqueId(),
            title: "Kıdem Tazminatı (Tfrs)",
            customIcon: "public/images/svgs/hesaplamalar/kidem-tfrs.svg",
            icon: IconPoint,
            href: "/Hesaplamalar/KidemTazminatiTfrs",
          },
          {
            id: uniqueId(),
            title: "Amortisman",
            customIcon: "public/images/svgs/hesaplamalar/amortisman.svg",
            icon: IconPoint,
            href: "/Hesaplamalar/Amortisman",
            aciklama:
              "Veri Yükleme sekmesi altında, amortisman verilerini sisteme girebilirsiniz. Hesaplama sekmesi altında ise, Veri Yükleme sekmesi altında girmiş olduğunuz amortismanları standartlarına uygun olarak aylık veya günlük bazda hesaplama işlemini gerçekleştirebilirsiniz.",
          },
          {
            id: uniqueId(),
            title: "Kredi",
            customIcon: "public/images/svgs/hesaplamalar/kredi.svg",
            icon: IconPoint,
            href: "/Hesaplamalar/Kredi",
          },
          {
            id: uniqueId(),
            title: "Çek / Senet Reeskont",
            customIcon:
              "public/images/svgs/hesaplamalar/cek-senet-reeskont.svg",
            icon: IconPoint,
            href: "/Hesaplamalar/CekSenetReeskont",
          },
          {
            id: uniqueId(),
            title: "Dava Karşılıkları",
            customIcon:
              "public/images/svgs/hesaplamalar/dava-karsiliklari.svg",
            icon: IconPoint,
            href: "/Hesaplamalar/DavaKarsiliklari",
          },
          {
            id: uniqueId(),
            title: "Ertelenmiş Vergi Hesabı",
            customIcon:
              "public/images/svgs/hesaplamalar/ertelenmis-vergi-hesabi.svg",
            icon: IconPoint,
            href: "/Hesaplamalar/ErtelenmisVergiHesabi",
          },
          {
            id: uniqueId(),
            title: "İlişkili Taraf Sınıflama",
            customIcon:
              "public/images/svgs/hesaplamalar/iliskili-taraf-siniflama.svg",
            icon: IconPoint,
            href: "/Hesaplamalar/IliskiliTarafSiniflama",
          },
          {
            id: uniqueId(),
            title: "Vadeli Banka Mevduatı",
            customIcon:
              "public/images/svgs/hesaplamalar/vadeli-banka-mevduati.svg",
            icon: IconPoint,
            href: "/Hesaplamalar/VadeliBankaMevduati",
            children: [
              {
                id: uniqueId(),
                title: "Vadeli Banka Mevduatı Otomatik Sınıflama",
                customIcon:
                  "public/images/svgs/hesaplamalar/vadeli-banka-mevduati.svg",
                icon: IconPoint,
                href: "/Hesaplamalar/VadeliBankaMevduati/VadeliBankaMevduatiOtomatikSiniflama",
              },
              {
                id: uniqueId(),
                title: "Vadeli Banka Mevduatı Manuel Sınıflama",
                customIcon:
                  "public/images/svgs/hesaplamalar/vadeli-banka-mevduati.svg",
                icon: IconPoint,
                href: "/Hesaplamalar/VadeliBankaMevduati/VadeliBankaMevduatiManuelSiniflama",
              },
              {
                id: uniqueId(),
                title: "Vadeli Banka Mevduatı Faiz Tahakkuk",
                customIcon:
                  "public/images/svgs/hesaplamalar/vadeli-banka-mevduati.svg",
                icon: IconPoint,
                href: "/Hesaplamalar/VadeliBankaMevduati/VadeliBankaMevduatiFaizTahakkuk",
              },
            ],
          },
          {
            id: uniqueId(),
            title: "Hareketsiz",
            customIcon: "public/images/svgs/hesaplamalar/hareketsiz.svg",
            icon: IconPoint,
            href: "/Hesaplamalar/Hareketsiz",
          },
          {
            id: uniqueId(),
            title: "Geçmiş Yıllar Kar Zarar Kontrolleri",
            customIcon:
              "public/images/svgs/hesaplamalar/gecmis-yillar-kar-zarar.svg",
            icon: IconPoint,
            href: "/Hesaplamalar/GecmisYillarKarZararKontrolleri",
          },
          {
            id: uniqueId(),
            title: "Kur Farkı Kayıtları",
            customIcon:
              "public/images/svgs/hesaplamalar/kur-farki-kayitlari.svg",
            icon: IconPoint,
            href: "/Hesaplamalar/KurFarkiKayitlari",
            children: [
              {
                id: uniqueId(),
                title: "Kur Farkı",
                customIcon:
                  "public/images/svgs/hesaplamalar/kur-farki-kayitlari.svg",
                icon: IconPoint,
                href: "/Hesaplamalar/KurFarkiKayitlari/KurFarki",
              },
              {
                id: uniqueId(),
                title: "Kur Farkı Kontrolleri",
                customIcon:
                  "public/images/svgs/hesaplamalar/kur-farki-kayitlari.svg",
                icon: IconPoint,
                href: "/Hesaplamalar/KurFarkiKayitlari/KurFarkiKontrolleri",
              },
            ],
          },
        ],
      },
      {
        id: uniqueId(),
        title: "DÖNÜŞÜM",
        icon: IconRepeat,
        href: "/Donusum",
        children: [
          {
            id: uniqueId(),
            title: "Fiş Girişi",
            customIcon: "public/images/svgs/donusum/fis-girisi.svg",
            icon: IconPoint,
            href: "/Donusum/FisGirisi",
          },
          {
            id: uniqueId(),
            title: "Fiş Listesi",
            customIcon: "public/images/svgs/donusum/fis-listesi.svg",
            icon: IconPoint,
            href: "/Donusum/FisListesi",
          },
          {
            id: uniqueId(),
            title: "Hazır Fişler",
            customIcon: "public/images/svgs/donusum/hazir-fisler.svg",
            icon: IconPoint,
            href: "/Donusum/HazirFisler",
          },
          {
            id: uniqueId(),
            title: "Dönüşüm İşlemi",
            customIcon: "public/images/svgs/donusum/donusum-islemi.svg",
            icon: IconPoint,
            href: "/Donusum/DonusumIslemi",
          },
          {
            id: uniqueId(),
            title:
              denetimTuru && denetimTuru == "Bobi"
                ? "Bobi Frs Belirleme Belgesi"
                : "Tms Tfrs Belirleme Belgesi",
            formKodu: "DenetimTuruBelirlemeBelgesi",
            customIcon: "public/images/svgs/donusum/belirleme-belgesi.svg",
            icon: IconPoint,
            href:
              denetimTuru && denetimTuru == "Bobi"
                ? "/Donusum/BobiFrs/BelirlemeBelgesi"
                : "/Donusum/TmsTfrs/BelirlemeBelgesi",
          },
        ],
      },
      { id: uniqueId(), navlabel: true, subheader: "DENETİM" },

      {
        id: uniqueId(),
        title: "DENETİM KANITLARI",
        icon: IconFolderOpen,
        href: "/DenetimKanitlari",
        children: [
          {
            id: uniqueId(),
            title: "Denetim Stratejisi Belirleme",
            formKodu: "DenetimStratejisiBelirleme",
            customIcon:
              "public/images/svgs/denetim-kanitlari/diger-kanitlar.svg",
            icon: IconPoint,
            href: "/DenetimKanitlari/DenetimStratejisiBelirleme",
          },
          {
            id: uniqueId(),
            title: "Uzman Yeterliliği Değerlendirme Belgesi",
            formKodu: "UzmanYeterliligiDegerlendirme",
            customIcon:
              "public/images/svgs/denetim-kanitlari/diger-kanitlar.svg",
            icon: IconPoint,
            href: "/DenetimKanitlari/UzmanYeterliligiDegerlendirme",
          },
          {
            id: uniqueId(),
            title: "Denetim Kontrol Testleri",
            formKodu: "DenetimKontrolTestleri",
            customIcon:
              "public/images/svgs/denetim-kanitlari/diger-kanitlar.svg",
            icon: IconPoint,
            href: "/DenetimKanitlari/DenetimKontrolTestleri",
          },
          {
            id: uniqueId(),
            title: "Mizan Kontrol",
            customIcon:
              "public/images/svgs/denetim-kanitlari/mizan-kontrol.svg",
            icon: IconPoint,
            href: "/DenetimKanitlari/MizanKontrol",
            children: [
              {
                id: uniqueId(),
                title: "Dönüşüm Mizan Kontrol",
                formKodu: "DonusumMizan",
                customIcon:
                  "public/images/svgs/denetim-kanitlari/mizan-kontrol.svg",
                icon: IconPoint,
                href: "/DenetimKanitlari/MizanKontrol/DonusumMizanKontrol",
              }, {
                id: uniqueId(),
                title: "Özet Denetim Mizan Kontrol Belgesi",
                formKodu: "OzetDonusumMizan",
                customIcon:
                  "public/images/svgs/denetim-kanitlari/mizan-kontrol.svg",
                icon: IconPoint,
                href: "/DenetimKanitlari/MizanKontrol/OzetDonusumMizanKontrol",
              },
              {
                id: uniqueId(),
                title: "Vuk Mizan Dönüşüm Mizan Karşılaştırma",
                formKodu: "VukMizanDonusumMizanKarsilastirma",
                customIcon:
                  "public/images/svgs/denetim-kanitlari/mizan-kontrol.svg",
                icon: IconPoint,
                href: "/DenetimKanitlari/MizanKontrol/VukMizanDonusumMizanKarsilastirma",
              },
            ],
          },

          {
            id: uniqueId(),
            title: "Finansal Tablolar",
            customIcon:
              "public/images/svgs/denetim-kanitlari/finansal-tablolar.svg",
            icon: IconPoint,
            href: "/DenetimKanitlari/FinansalTablolar",
            children: [
              {
                id: uniqueId(),
                title: "Finansal Durum Tablosu",
                customIcon:
                  "public/images/svgs/denetim-kanitlari/finansal-tablolar.svg",
                icon: IconPoint,
                href: "/DenetimKanitlari/FinansalTablolar/FinansalDurumTablosu",
              },
              {
                id: uniqueId(),
                title: "Kar / Zarar Tablosu",
                customIcon:
                  "public/images/svgs/denetim-kanitlari/finansal-tablolar.svg",
                icon: IconPoint,
                href: "/DenetimKanitlari/FinansalTablolar/KarZararTablosu",
              },
              {
                id: uniqueId(),
                title: "Nakit Akış Tablosu",
                customIcon:
                  "public/images/svgs/denetim-kanitlari/finansal-tablolar.svg",
                icon: IconPoint,
                href: "/DenetimKanitlari/FinansalTablolar/NakitAkisTablosu",
              },
              {
                id: uniqueId(),
                title: "Özkaynak Değişim Tablosu",
                customIcon:
                  "public/images/svgs/denetim-kanitlari/finansal-tablolar.svg",
                icon: IconPoint,
                href: "/DenetimKanitlari/FinansalTablolar/OzkaynakDegisimTablosu",
              },
              {
                id: uniqueId(),
                title: "Cari Dönem Dönüşüm Düzeltme Belgesi",
                customIcon:
                  "public/images/svgs/denetim-kanitlari/finansal-tablolar.svg",
                icon: IconPoint,
                href: "/DenetimKanitlari/FinansalTablolar/CariDonemDonusumDuzeltmeBelgesi",
              },
              {
                id: uniqueId(),
                title: "Önceki Dönem Dönüşüm Düzeltme Belgesi",
                customIcon:
                  "public/images/svgs/denetim-kanitlari/finansal-tablolar.svg",
                icon: IconPoint,
                href: "/DenetimKanitlari/FinansalTablolar/OncekiDonemDonusumDuzeltmeBelgesi",
              },
              {
                id: uniqueId(),
                title: "Geçmiş Dönem Dönüşüm Düzeltme Belgesi",
                customIcon:
                  "public/images/svgs/denetim-kanitlari/finansal-tablolar.svg",
                icon: IconPoint,
                href: "/DenetimKanitlari/FinansalTablolar/GecmisDonemDonusumDuzeltmeBelgesi",
              },


            ],
          },
          {
            id: uniqueId(),
            title: "İşletmenin Sürekliliği ve Analitik İnceleme",
            customIcon:
              "public/images/svgs/denetim-kanitlari/isletmenin-surekliligi.svg",
            icon: IconPoint,
            href: "/DenetimKanitlari/IsletmeninSurekliligiVeAnalitikInceleme",
            children: [
              {
                id: uniqueId(),
                title: "Önemli Süreçlerin İzlenmesi ve Risk Belirleme",
                formKodu: "OnemliSureclerinIzlenmesiVeRiskBelirleme",
                customIcon:
                  "public/images/svgs/denetim-kanitlari/isletmenin-surekliligi.svg",
                icon: IconPoint,
                href: "/DenetimKanitlari/IsletmeninSurekliligiVeAnalitikInceleme/OnemliSureclerinIzlenmesiVeRiskBelirleme",
              },
              {
                id: uniqueId(),
                title: "Karşılaştırmalı Analiz",
                customIcon:
                  "public/images/svgs/denetim-kanitlari/isletmenin-surekliligi.svg",
                icon: IconPoint,
                href: "/DenetimKanitlari/IsletmeninSurekliligiVeAnalitikInceleme/KarsilastirmaliAnaliz",
              },
              {
                id: uniqueId(),
                title: "Dikey Analiz",
                customIcon:
                  "public/images/svgs/denetim-kanitlari/isletmenin-surekliligi.svg",
                icon: IconPoint,
                href: "/DenetimKanitlari/IsletmeninSurekliligiVeAnalitikInceleme/DikeyAnaliz",
              },
              {
                id: uniqueId(),
                title: "Bilanço Değerlendirme Belgesi",
                customIcon:
                  "public/images/svgs/denetim-kanitlari/isletmenin-surekliligi.svg",
                icon: IconPoint,
                href: "/DenetimKanitlari/IsletmeninSurekliligiVeAnalitikInceleme/BilancoDegerlendirmeBelgesi",
              },
              {
                id: uniqueId(),
                title: "Gelir Değerlendirme Belgesi",
                customIcon:
                  "public/images/svgs/denetim-kanitlari/isletmenin-surekliligi.svg",
                icon: IconPoint,
                href: "/DenetimKanitlari/IsletmeninSurekliligiVeAnalitikInceleme/GelirDegerlendirmeBelgesi",
              },
              {
                id: uniqueId(),
                title: "Oran Analizi Tespit Belgesi",
                customIcon:
                  "public/images/svgs/denetim-kanitlari/isletmenin-surekliligi.svg",
                icon: IconPoint,
                href: "/DenetimKanitlari/IsletmeninSurekliligiVeAnalitikInceleme/OranAnaliziTespitBelgesi",
              },
              {
                id: uniqueId(),
                title: "Kullanılan Analitik Tekniklere İlişkin Belgeler",
                formKodu: "KullanilanAnalitikTekniklereIliskinBelgeler",
                customIcon:
                  "public/images/svgs/denetim-kanitlari/isletmenin-surekliligi.svg",
                icon: IconPoint,
                href: "/DenetimKanitlari/IsletmeninSurekliligiVeAnalitikInceleme/KullanilanAnalitikTekniklereIliskinBelgeler",
              },
              {
                id: uniqueId(),
                title: "İşletmenin Sürekliliğine İlişkin Değerlendirme",
                formKodu: "IsletmeninSurekliligineIliskinDegerlendirme",
                customIcon:
                  "public/images/svgs/denetim-kanitlari/isletmenin-surekliligi.svg",
                icon: IconPoint,
                href: "/DenetimKanitlari/IsletmeninSurekliligiVeAnalitikInceleme/IsletmeninSurekliligineIliskinDegerlendirme",
              },
            ],
          },
          {
            id: uniqueId(),
            title: "Önemlilik",
            customIcon: "public/images/svgs/denetim-kanitlari/onemlilik.svg",
            icon: IconPoint,
            href: "/DenetimKanitlari/Onemlilik",
            children: [
              {
                id: uniqueId(),
                title: "Fiş İşlem Sayıları",
                formKodu: "FisIslemSayilari",
                customIcon:
                  "public/images/svgs/denetim-kanitlari/onemlilik.svg",
                icon: IconPoint,
                href: "/DenetimKanitlari/Onemlilik/FisIslemSayilari",
              },
              {
                id: uniqueId(),
                title: "Örneklem",
                formKodu: "Orneklem",
                customIcon:
                  "public/images/svgs/denetim-kanitlari/onemlilik.svg",
                icon: IconPoint,
                href: "/DenetimKanitlari/Onemlilik/Orneklem",
              },
              {
                id: uniqueId(),
                title: "Önemlilik Seviyesi Belirleme Kılavuzu",
                formKodu: "OnemlilikSeviyesiBelirlemeKilavuzu",
                customIcon:
                  "public/images/svgs/denetim-kanitlari/onemlilik.svg",
                icon: IconPoint,
                href: "/DenetimKanitlari/Onemlilik/OnemlilikSeviyesiBelirlemeKilavuzu",
              },
              {
                id: uniqueId(),
                title: "Önemlilik Seviyesi Belirleme Ve Değerlendirme",
                formKodu: "OnemlilikSeviyesiKayitlari",
                customIcon:
                  "public/images/svgs/denetim-kanitlari/onemlilik.svg",
                icon: IconPoint,
                href: "/DenetimKanitlari/Onemlilik/OnemlilikSeviyesiBelirlemeVeDegerlendirme",
              },
            ],
          },
          {
            id: uniqueId(),
            title: "Mutabakat",
            customIcon: "public/images/svgs/denetim-kanitlari/mutabakat.svg",
            icon: IconPoint,
            href: "/DenetimKanitlari/Mutabakat",
            children: [
              {
                id: uniqueId(),
                title: "Mutabakat Seçimi Ve Kontrol",
                customIcon:
                  "public/images/svgs/denetim-kanitlari/mutabakat.svg",
                formKodu: "MutabakatKontrolKayitlari",
                icon: IconPoint,
                href: "/DenetimKanitlari/Mutabakat/MutabakatSecimiVeKontrol",
              },
              {
                id: uniqueId(),
                title: "Doğrulama Mektuplarına Alınan Yanıtlar",
                formKodu: "DogrulamaMektuplarinaAlinanYanitlar",
                customIcon:
                  "public/images/svgs/denetim-kanitlari/mutabakat.svg",
                icon: IconPoint,
                href: "/DenetimKanitlari/Mutabakat/DogrulamaMektuplarinaAlinanYanitlar",
              },
            ],
          },
          {
            id: uniqueId(),
            title:
              "Bilanço Tarihinden Sonra Ortaya Çıkan Olayları Değerlendirme",
            formKodu:
              "BilancoTarihindenSonraOrtayaCikanOlaylariDegerlendirme",
            customIcon:
              "public/images/svgs/denetim-kanitlari/diger-kanitlar.svg",
            icon: IconPoint,
            href: "/DenetimKanitlari/BilancoTarihindenSonraOrtayaCikanOlaylariDegerlendirme",
          },
          {
            id: uniqueId(),
            title: "Diğer Kanıtlar",
            customIcon:
              "public/images/svgs/denetim-kanitlari/diger-kanitlar.svg",
            icon: IconPoint,
            href: "/DenetimKanitlari/DigerKanitlar",
            children: [
              {
                id: uniqueId(),
                title: "Müşteri İşletme Yönetimi İle Yapılan Görüşme",
                formKodu: "MusteriIsletmeYonetimiIleYapilanGorusme",
                customIcon:
                  "public/images/svgs/denetim-kanitlari/diger-kanitlar.svg",
                icon: IconPoint,
                href: "/DenetimKanitlari/DigerKanitlar/MusteriIsletmeYonetimiIleYapilanGorusme",
              },
              {
                id: uniqueId(),
                title: "Müşteri İşletme Personeli İle Yapılan Görüşme",
                formKodu: "MusteriIsletmePersoneliIleYapilanGorusme",
                customIcon:
                  "public/images/svgs/denetim-kanitlari/diger-kanitlar.svg",
                icon: IconPoint,
                href: "/DenetimKanitlari/DigerKanitlar/MusteriIsletmePersoneliIleYapilanGorusme",
              },
              {
                id: uniqueId(),
                title: "Uygulanan Muhasebe Politikalarının Tespiti",
                formKodu: "UygulananMuhasebePolitikalarininTespiti",
                customIcon:
                  "public/images/svgs/denetim-kanitlari/diger-kanitlar.svg",
                icon: IconPoint,
                href: "/DenetimKanitlari/DigerKanitlar/UygulananMuhasebePolitikalarininTespiti",
              },
              {
                id: uniqueId(),
                title: "İlişkili Taraf İnceleme",
                formKodu: "IliskiliTarafInceleme",
                customIcon:
                  "public/images/svgs/denetim-kanitlari/diger-kanitlar.svg",
                icon: IconPoint,
                href: "/DenetimKanitlari/DigerKanitlar/IliskiliTarafInceleme",
              },
              {
                id: uniqueId(),
                title: "Kullanılan Tahminlere İlişkin Değerlendirme",
                formKodu: "KullanilanTahminlereIliskinDegerlendirme",
                customIcon:
                  "public/images/svgs/denetim-kanitlari/diger-kanitlar.svg",
                icon: IconPoint,
                href: "/DenetimKanitlari/DigerKanitlar/KullanilanTahminlereIliskinDegerlendirme",
              },
              {
                id: uniqueId(),
                title: "Satış Tahsilat Kontrol",
                formKodu: "SatisTahsilatKontrol",
                customIcon:
                  "public/images/svgs/denetim-kanitlari/diger-kanitlar.svg",
                icon: IconPoint,
                href: "/DenetimKanitlari/DigerKanitlar/SatisTahsilatKontrol",
              },
              {
                id: uniqueId(),
                title: "Satın Alma Ödeme Kontrol",
                formKodu: "SatinAlmaOdemeKontrol",
                customIcon:
                  "public/images/svgs/denetim-kanitlari/diger-kanitlar.svg",
                icon: IconPoint,
                href: "/DenetimKanitlari/DigerKanitlar/SatinAlmaOdemeKontrol",
              },
              {
                id: uniqueId(),
                title: "Transfer Fiyatlaması ve Örtülü Kazanç Kontrol",
                formKodu: "TransferFiyatlamasiOrtuluKazanc",
                customIcon:
                  "public/images/svgs/denetim-kanitlari/diger-kanitlar.svg",
                icon: IconPoint,
                href: "/DenetimKanitlari/DigerKanitlar/TransferFiyatlamasiOrtuluKazanc",
              },
              {
                id: uniqueId(),
                title: "Sayım ve Tespit Değerlendirme",
                formKodu: "SayimVeTespitDegerlendirme",
                customIcon:
                  "public/images/svgs/denetim-kanitlari/diger-kanitlar.svg",
                icon: IconPoint,
                href: "/DenetimKanitlari/DigerKanitlar/SayimVeTespitDegerlendirme",
              },
              {
                id: uniqueId(),
                title: "İhmal Edilen Düzeltme",
                formKodu: "IhmalEdilenDuzeltme",
                customIcon:
                  "public/images/svgs/denetim-kanitlari/diger-kanitlar.svg",
                icon: IconPoint,
                href: "/DenetimKanitlari/DigerKanitlar/IhmalEdilenDuzeltme",
              },
              {
                id: uniqueId(),
                title: "Gerçeğe Uygun Değer Hesaplamaları Değerlendirme",
                formKodu: "GercegeUygunDegerHesaplamalariDegerlendirme",
                customIcon:
                  "public/images/svgs/denetim-kanitlari/diger-kanitlar.svg",
                icon: IconPoint,
                href: "/DenetimKanitlari/DigerKanitlar/GercegeUygunDegerHesaplamalariDegerlendirme",
              },
              {
                id: uniqueId(),
                title: "Habersiz İşletme Ziyareti",
                formKodu: "HabersizIsletmeZiyareti",
                customIcon:
                  "public/images/svgs/denetim-kanitlari/diger-kanitlar.svg",
                icon: IconPoint,
                href: "/DenetimKanitlari/DigerKanitlar/HabersizIsletmeZiyareti",
              },
              {
                id: uniqueId(),
                title: "Risklere Karşı Uygulanan Denetim Prosedürleri",
                formKodu: "RisklereKarsiUygulananDenetimProsedurleri",
                customIcon:
                  "public/images/svgs/denetim-kanitlari/diger-kanitlar.svg",
                icon: IconPoint,
                href: "/DenetimKanitlari/DigerKanitlar/RisklereKarsiUygulananDenetimProsedurleri",
              },
              {
                id: uniqueId(),
                title: "Muhasebe Hataları ve Hile Kanıtları Değerlendirme",
                formKodu: "MuhasebeHatalariVeHileKanitlariDegerlendirme",
                customIcon:
                  "public/images/svgs/denetim-kanitlari/diger-kanitlar.svg",
                icon: IconPoint,
                href: "/DenetimKanitlari/DigerKanitlar/MuhasebeHatalariVeHileKanitlariDegerlendirme",
              },
              {
                id: uniqueId(),
                title: "Denetim Kanıtları Değerlendirme",
                formKodu: "DenetimKanitlariDegerlendirme",
                customIcon:
                  "public/images/svgs/denetim-kanitlari/diger-kanitlar.svg",
                icon: IconPoint,
                href: "/DenetimKanitlari/DigerKanitlar/DenetimKanitlariDegerlendirme",
              },
              {
                id: uniqueId(),
                title: "Tespit Edlien Hususların Yönetim Bildirimi",
                formKodu: "TespitEdilenHususlarinYonetimeBildirimi",
                customIcon:
                  "public/images/svgs/denetim-kanitlari/diger-kanitlar.svg",
                icon: IconPoint,
                href: "/DenetimKanitlari/DigerKanitlar/TespitEdilenHususlarinYonetimeBildirimi",
              },
              {
                id: uniqueId(),
                title: "Yönetim Kurulu Faaliyet Raporu Değerlendirme",
                formKodu: "YonetimKuruluFaaliyetRaporuDegerlendirme",
                customIcon:
                  "public/images/svgs/denetim-kanitlari/diger-kanitlar.svg",
                icon: IconPoint,
                href: "/DenetimKanitlari/DigerKanitlar/YonetimKuruluFaaliyetRaporuDegerlendirme",
              },

              /*{
            id: uniqueId(),
            title: "Denetim Çalışmalarının Sınırlandırılmasını Değerlendirme",
            customIcon: "public/images/svgs/denetim-kanitlari/diger-kanitlar.svg",
            icon: IconPoint,
            href: "/DenetimKanitlari/DigerKanitlar/DenetimCalismalarininSinirlandirilmasiniDegerlendirme",
          },*/
            ],
          },
          {
            id: uniqueId(),
            title: "Yevmiye Kayıtları Kontrol",
            formKodu: "YevmiyeKayitlariKontrol",
            customIcon:
              "public/images/svgs/denetim-kanitlari/diger-kanitlar.svg",
            icon: IconPoint,
            href: "/DenetimKanitlari/YevmiyeKayitlariKontrol",
          },
          {
            id: uniqueId(),
            title: "Yönetim Tavsiye Mektubu",
            formKodu: "YonetimTavsiyeMektubu",
            customIcon:
              "public/images/svgs/denetim-kanitlari/diger-kanitlar.svg",
            icon: IconPoint,
            href: "/DenetimKanitlari/YonetimTavsiyeMektubu",
          },
          {
            id: uniqueId(),
            title: "Fatura İnceleme",
            customIcon:
              "public/images/svgs/veri/defter-inceleme.svg",
            icon: IconPoint,
            href: "/DenetimKanitlari/FaturaInceleme",
          },
          {
            id: uniqueId(),
            title: "Maddi Doğrulama Prosedürleri",
            customIcon:
              "public/images/svgs/denetim-kanitlari/maddi-dogrulama-prosedurleri.svg",
            icon: IconPoint,
            href: "/DenetimKanitlari/MaddiDogrulamaProsedurleri",
          },
          {
            id: uniqueId(),
            title: "Benford Analizi",
            customIcon:
              "public/images/svgs/denetim-kanitlari/maddi-dogrulama-prosedurleri.svg",
            icon: IconPoint,
            href: "/DenetimKanitlari/Benford",
          },
          {
            id: uniqueId(),
            title: "Hile ve Usulsüzlük",
            customIcon:
              "public/images/svgs/denetim-kanitlari/hile-ve-usulsuzluk.svg",
            icon: IconPoint,
            href: "/DenetimKanitlari/HileVeUsulsuzluk",
            children: [
              {
                id: uniqueId(),
                title: "Hile Prosedürleri",
                customIcon:
                  "public/images/svgs/denetim-kanitlari/hile-ve-usulsuzluk.svg",
                icon: IconPoint,
                href: "/DenetimKanitlari/HileVeUsulsuzluk/HileProsedurleri",
                children: [
                  {
                    id: uniqueId(),
                    title: "Hile Usulsüzlük ve Risk Faktörleri Belirleme",
                    formKodu: "HileUsulsuzlukBelirleme",
                    customIcon:
                      "public/images/svgs/denetim-kanitlari/hile-ve-usulsuzluk.svg",
                    icon: IconPoint,
                    href: "/DenetimKanitlari/HileVeUsulsuzluk/HileProsedurleri/HileUsulsuzlukBelirleme",
                  },
                  {
                    id: uniqueId(),
                    title: "Hile Usulsüzlük ve Risk Faktörleri Değerlendirme",
                    formKodu: "HileUsulsuzlukDegerlendirme",
                    customIcon:
                      "public/images/svgs/denetim-kanitlari/hile-ve-usulsuzluk.svg",
                    icon: IconPoint,
                    href: "/DenetimKanitlari/HileVeUsulsuzluk/HileProsedurleri/HileUsulsuzlukDegerlendirme",
                  },
                  {
                    id: uniqueId(),
                    title:
                      "Denetim Çalışması Öncesi Hile ve Usulsüzlük Üzerine Denetim Ekibi Görüşme Belgesi",
                    formKodu:
                      "HileUsulsuzlukToplantiBilgileri-HileUsulsuzlukToplantidaGorusulenHususlar",
                    customIcon:
                      "public/images/svgs/denetim-kanitlari/hile-ve-usulsuzluk.svg",
                    icon: IconPoint,
                    href: "/DenetimKanitlari/HileVeUsulsuzluk/HileProsedurleri/HileUsulsuzlukEkipCalismasi",
                  },
                  {
                    id: uniqueId(),
                    title:
                      "Muhasebe Hataları ve Hile Kanıtları Değerlendirme",
                    formKodu: "MuhasebeHatalariVeHileKanitlariDegerlendirme",
                    customIcon:
                      "public/images/svgs/denetim-kanitlari/hile-ve-usulsuzluk.svg",
                    icon: IconPoint,
                    href: "/DenetimKanitlari/HileVeUsulsuzluk/HileProsedurleri/MuhasebeHatalariVeHileKanitlariDegerlendirme",
                  },
                ],
              },
              {
                id: uniqueId(),
                title: "Muhasebe Hataları ve Hileye İlişkin Çalışmalar",
                customIcon:
                  "public/images/svgs/denetim-kanitlari/hile-ve-usulsuzluk.svg",
                icon: IconPoint,
                href: "/DenetimKanitlari/HileVeUsulsuzluk/MuhasebeHatalariVeHile",
              },
            ],
          },
        ],
      },
      {
        id: uniqueId(),
        title: "GENEL KURUL",
        icon: IconUsersGroup,
        href: "/GenelKurul",
        children: [
          {
            id: uniqueId(),
            title: "Genel Kurul Toplantısı Görevlendirme Belgesi",
            formKodu: "GorevlendirmeBelgesi",
            icon: IconPoint,
            href: "/GenelKurul/GorevlendirmeBelgesi",
          },
          {
            id: uniqueId(),
            title: "Genel Kurul Toplantısı Katılım Belgesi",
            formKodu:
              "GenelKurulToplantiBilgileri-GenelKurulToplantidaGorusulenHususlar",
            icon: IconPoint,
            href: "/GenelKurul/KatilimBelgesi",
          },
          {
            id: uniqueId(),
            title: "Denetim Çalışması İzleme",
            formKodu: "DenetimCalismasiIzleme",
            icon: IconPoint,
            href: "/GenelKurul/DenetimCalismasiIzleme",
          },
          {
            id: uniqueId(),
            title: "Denetim Çalışması İzleme Sonuç",
            formKodu: "DenetimCalismasiIzlemeSonuc",
            icon: IconPoint,
            href: "/GenelKurul/DenetimCalismasiIzlemeSonuc",
          },
          {
            id: uniqueId(),
            title: "Faaliyet Raporu",
            formKodu: "FaaliyetRaporu",
            icon: IconPoint,
            href: "/GenelKurul/FaaliyetRaporu",
          },
        ],
      },
      {
        id: uniqueId(),
        title: "RAPOR",
        icon: IconFileAnalytics,
        href: "/Rapor",
        children: [
          {
            id: uniqueId(),
            title: "Dipnotlar",
            icon: IconPoint,
            href: "/Rapor/Dipnotlar",
          },
          {
            id: uniqueId(),
            title: "Bağımsız Denetçi Raporu",
            icon: IconPoint,
            href: "/Rapor/BagimsizDenetciRaporu",
          },
          {
            id: uniqueId(),
            title: "Faaliyet Raporu İlişkin Bağımsız Denetçi Raporu",
            formKodu: "FaaliyetRaporunaIliskinBagimsizDenetciRaporu",
            customIcon:
              "public/images/svgs/denetim-kanitlari/diger-kanitlar.svg",
            icon: IconPoint,
            href: "/Rapor/FaaliyetRaporunaIliskinBagimsizDenetciRaporu",
          },
        ],
      },


      {
        id: uniqueId(),
        title: "SÜRDÜRÜLEBİLİRLİK",
        customIcon:
          "public/images/svgs/denetim-kanitlari/hile-ve-usulsuzluk.svg",
        icon: IconFileAnalytics,
        href: "/Surdurulebilirlik",
        children: [
          {
            id: uniqueId(),
            title: "Genel Bilgiler",
            customIcon:
              "public/images/svgs/denetim-kanitlari/hile-ve-usulsuzluk.svg",
            icon: IconPoint,
            href: "/Surdurulebilirlik/SurdurulebilirlikGenelBilgiler",

          },
          {
            id: uniqueId(),
            title: "Çevresel Etkiler",
            customIcon:
              "public/images/svgs/denetim-kanitlari/hile-ve-usulsuzluk.svg",
            icon: IconPoint,
            href: "/Surdurulebilirlik/SurdurulebilirlikCevreselEtkiler",
          },
          {
            id: uniqueId(),
            title: "Sosyal Sorumluluk",
            customIcon:
              "public/images/svgs/denetim-kanitlari/hile-ve-usulsuzluk.svg",
            icon: IconPoint,
            href: "/Surdurulebilirlik/SurdurulebilirlikSosyalSorumluluk",
          },
          {
            id: uniqueId(),
            title: "Kurumsal Yönetişim",
            customIcon:
              "public/images/svgs/denetim-kanitlari/hile-ve-usulsuzluk.svg",
            icon: IconPoint,
            href: "/Surdurulebilirlik/SurdurulebilirlikKurumsalYonetisim",
          },
          {
            id: uniqueId(),
            title: "Ek Bilgiler",
            customIcon:
              "public/images/svgs/denetim-kanitlari/hile-ve-usulsuzluk.svg",
            icon: IconPoint,
            href: "/Surdurulebilirlik/SurdurulebilirlikEkBilgiler",
          },
        ],
      },
      ...(enflasyonmu === true
        ? [
          {
            id: uniqueId(),
            parentTitle: "ENFLASYON",
            title: "ENFLASYON",
            icon: IconTrendingUp,
            href: "/Enflasyon",
            children: [
              {
                id: uniqueId(),
                parentTitle: "ENFLASYON",
                title: "Aşamalar",
                icon: IconPoint,
                href: "/Enflasyon/Asamalar",
              },
              {
                id: uniqueId(),
                title: "Düzeltme Katsayıları",
                icon: IconPoint,
                href: "/Enflasyon/DuzeltmeKatsayilari",
              },
              {
                id: uniqueId(),
                title: "Ortalama Ticari Kredi Faiz Oranları",
                icon: IconPoint,
                href: "/Enflasyon/OrtalamaTicariKrediFaizOranlari",
              },
              {
                id: uniqueId(),
                title: "Reel Olmayan Finansman Maaliyeti",
                icon: IconPoint,
                href: "/Enflasyon/ReelOlmayanFinansmanMaaliyeti",
              },
              ...(yil === 2024
                ? [
                  {
                    id: uniqueId(),
                    title: "Önceki Dönem Vuk Enflasyon İptal Fişi",
                    icon: IconPoint,
                    href: "/Enflasyon/VukEnflasyonIptalFisi",
                  },
                ]
                : []),
              {
                id: uniqueId(),
                title: "Stoklar Enflasyon Düzeltmesi",
                icon: IconPoint,
                href: "/Enflasyon/StoklarEnflasyonDuzeltmesi",
              },
              {
                id: uniqueId(),
                title: "Maddi Ve Maddi Olmayan Duran Varlıklar",
                icon: IconPoint,
                href: "/Enflasyon/MaddiVeMaddiOlmayanDuranVarliklar",
              },
              {
                id: uniqueId(),
                title: "Amortisman Haraket Tablosu",
                icon: IconPoint,
                href: "/Enflasyon/AmortismanHaraketTablosu",
              },
              {
                id: uniqueId(),
                title: "Diğer Varlık Ve Kaynaklar Enflasyon Düzeltmesi",
                icon: IconPoint,
                href: "/Enflasyon/DigerVarlikVeKaynaklar",
              },
              {
                id: uniqueId(),
                title: "Proje-İnşaat Enflasyon Düzeltmesi",
                icon: IconPoint,
                href: "/Enflasyon/ProjeInsaat",
              },
              {
                id: uniqueId(),
                title: "Gelir Ve Giderlere İlişkin Enflasyon Düzeltmesi",
                icon: IconPoint,
                href: "/Enflasyon/GelirVeGiderlerEnflasyonDuzeltmesi",
              },
              {
                id: uniqueId(),
                title: "Net Parasal Pozisyon",
                icon: IconPoint,
                href: "Enflasyon/NetParasalPozisyon",
                children: [
                  {
                    id: uniqueId(),
                    title: "NPP Kayıp/Kazanç",
                    icon: IconPoint,
                    href: "/Enflasyon/NetParasalPozisyon/NetParasalPozisyonTablosu",
                  },
                  {
                    id: uniqueId(),
                    title: "Ertelenen Vergi",
                    icon: IconPoint,
                    href: "/Enflasyon/NetParasalPozisyon/ErtelenenVergi",
                  },
                ],
              },
              {
                id: uniqueId(),
                title: "Enflasyon Düzeltmesi Çalışma Kağıdı",
                icon: IconPoint,
                href: "/Enflasyon/EnflasyonDuzeltmesiCalismaKagidi",
              },
              {
                id: uniqueId(),
                title: "Düzeltme İşlemleri",
                icon: IconPoint,
                href: "Enflasyon/DuzeltmeIslemleri",
                children: [
                  ...(yil && yil >= 2025
                    ? [
                      {
                        id: uniqueId(),
                        title: "İptal Fişi",
                        icon: IconPoint,
                        href: "/Enflasyon/DuzeltmeIslemleri/IptalFisi",
                      },
                    ]
                    : []),
                  ...(yil && yil < 2025
                    ? [
                      {
                        id: uniqueId(),
                        title: "Fiş Girişi",
                        icon: IconPoint,
                        href: "/Enflasyon/DuzeltmeIslemleri/FisGirisi",
                      },
                      {
                        id: uniqueId(),
                        title: "Fiş İşlemleri",
                        icon: IconPoint,
                        href: "/Enflasyon/DuzeltmeIslemleri/FisIslemleri",
                      },
                    ]
                    : []),
                  {
                    id: uniqueId(),
                    title: "Taşıma Fişi",
                    icon: IconPoint,
                    href: "/Enflasyon/DuzeltmeIslemleri/TasimaFisi",
                  },
                  ...(yil && yil >= 2024
                    ? [
                      {
                        id: uniqueId(),
                        title: `Maliyet Fark Fişi Oluştur ${yil >= 2025 ? "(15,18,38)" : ""
                          }`,
                        icon: IconPoint,
                        href: "/Enflasyon/DuzeltmeIslemleri/MaliyetFarkFisi",
                      },
                    ]
                    : []),
                  ...(yil && yil < 2024
                    ? [
                      {
                        id: uniqueId(),
                        title: "Maliyet Devir Fişi Oluştur",
                        icon: IconPoint,
                        href: "/Enflasyon/DuzeltmeIslemleri/MaliyetDevirFisi",
                      },
                    ]
                    : []),
                  {
                    id: uniqueId(),
                    title: "Enflasyon Dönüşüm",
                    icon: IconPoint,
                    href: "/Enflasyon/DuzeltmeIslemleri/Donusum",
                  },
                ],
              },
              {
                id: uniqueId(),
                title: "Sunum Endeksi",
                icon: IconPoint,
                href: "/Enflasyon/SunumEndeksi",
              },
              {
                id: uniqueId(),
                title: "Dönüşüm Mizan Kontrol",
                icon: IconPoint,
                href: "/Enflasyon/DetayMizanKontrol",
              },
              {
                id: uniqueId(),
                title: "Finansal Tablolar",
                parentTitle: "ENFLASYON DÜZELTMESİ",
                icon: IconPoint,
                href: "Enflasyon/FinansalTablolar",
                children: [
                  {
                    id: uniqueId(),
                    title: "Finansal Durum Tablosu",
                    parentTitle: "ENFLASYON DÜZELTMESİ",
                    icon: IconPoint,
                    href: "/Enflasyon/FinansalTablolar/FinansalDurumTablosu",
                  },
                  {
                    id: uniqueId(),
                    title: "Kar / Zarar Tablosu",
                    parentTitle: "ENFLASYON DÜZELTMESİ",
                    icon: IconPoint,
                    href: "/Enflasyon/FinansalTablolar/KarZararTablosu",
                  },
                  {
                    id: uniqueId(),
                    title: "Nakit Akış Tablosu",
                    parentTitle: "ENFLASYON DÜZELTMESİ",
                    icon: IconPoint,
                    href: "/Enflasyon/FinansalTablolar/NakitAkisTablosu",
                  },
                  {
                    id: uniqueId(),
                    title: "Özkaynak Değişim Tablosu",
                    parentTitle: "ENFLASYON DÜZELTMESİ",
                    icon: IconPoint,
                    href: "/Enflasyon/FinansalTablolar/OzkaynakDegisimTablosu",
                  },
                ],
              },
              {
                id: uniqueId(),
                title: "Denetçi Raporu",
                icon: IconPoint,
                href: "Enflasyon/Rapor",
                children: [
                  {
                    id: uniqueId(),
                    title: "Dipnotlar",
                    icon: IconPoint,
                    href: "/Enflasyon/Rapor/Dipnotlar",
                  },
                  {
                    id: uniqueId(),
                    title: "Denetçi Raporu",
                    icon: IconPoint,
                    href: "/Enflasyon/Rapor/DenetciRaporu",
                  },
                  ...(denetimTuru !== "Tfrs"
                    ? [
                      {
                        id: uniqueId(),
                        title:
                          "Faaliyet Raporuna İlişkin Bağımsız Denetçi Raporu",
                        icon: IconPoint,
                        href: "/Enflasyon/Rapor/FaaliyetRaporu",
                      },
                    ]
                    : []),
                ],
              },
            ],
          },
        ]
        : []),
      ...(konsolidemi === true
        ? [
          {
            id: uniqueId(),
            parentTitle: "KONSOLİDASYON",
            title: "KONSOLİDASYON",
            icon: IconLayoutGridAdd,
            href: "/Konsolidasyon",
            children: [
              {
                id: uniqueId(),
                parentTitle: "KONSOLİDASYON",
                title: "Aşamalar",
                icon: IconPoint,
                href: "/Konsolidasyon/Asamalar",
              },
              {
                id: uniqueId(),
                parentTitle: "KONSOLİDASYON",
                title: "Tanımlamalar",
                icon: IconPoint,
                href: "/Konsolidasyon/Tanimlamalar",
              },
              {
                id: uniqueId(),
                title: "Birleştirilmiş Mizan",
                icon: IconPoint,
                href: "/Konsolidasyon/BirlestirilmisMizan",
              },
              {
                id: uniqueId(),
                title: "Eliminasyon Fiş İşlemleri",
                icon: IconPoint,
                href: "/Konsolidasyon/EliminasyonFisIslemleri",
              },
              {
                id: uniqueId(),
                parentTitle: "KONSOLİDASYON",
                title: "Dönüşüm İşlemi",
                icon: IconPoint,
                href: "/Konsolidasyon/DonusumIslemi",
              },
              {
                id: uniqueId(),
                parentTitle: "KONSOLİDASYON",
                title: "Dönüşüm Mizan Kontrol",
                icon: IconPoint,
                href: "/Konsolidasyon/DonusumMizanKontrol",
              },
              {
                id: uniqueId(),
                parentTitle: "KONSOLİDASYON",
                title: "Finansal Tablolar",
                icon: IconPoint,
                href: "/Konsolidasyon/FinansalTablolar",
                children: [
                  {
                    id: uniqueId(),
                    parentTitle: "KONSOLİDASYON",
                    title: "Finansal Durum Tablosu",
                    icon: IconPoint,
                    href: "/Konsolidasyon/FinansalTablolar/FinansalDurumTablosu",
                  },
                  {
                    id: uniqueId(),
                    parentTitle: "KONSOLİDASYON",
                    title: "Kar / Zarar Tablosu",
                    icon: IconPoint,
                    href: "/Konsolidasyon/FinansalTablolar/KarZararTablosu",
                  },
                  {
                    id: uniqueId(),
                    parentTitle: "KONSOLİDASYON",
                    title: "Nakit Akış Tablosu",
                    icon: IconPoint,
                    href: "/Konsolidasyon/FinansalTablolar/NakitAkisTablosu",
                  },
                  {
                    id: uniqueId(),
                    parentTitle: "KONSOLİDASYON",
                    title: "Özkaynak Değişim Tablosu",
                    icon: IconPoint,
                    href: "/Konsolidasyon/FinansalTablolar/OzkaynakDegisimTablosu",
                  },
                ],
              },
              {
                id: uniqueId(),
                parentTitle: "KONSOLİDASYON",
                title: "Rapor",
                icon: IconPoint,
                href: "/Konsolidasyon/Rapor",
                children: [
                  {
                    id: uniqueId(),
                    parentTitle: "KONSOLİDASYON",
                    title: "Dipnotlar",
                    icon: IconPoint,
                    href: "/Konsolidasyon/Rapor/Dipnotlar",
                  },
                  {
                    id: uniqueId(),
                    parentTitle: "KONSOLİDASYON",
                    title: "Bağımsız Denetçi Raporu",
                    icon: IconPoint,
                    href: "/Konsolidasyon/Rapor/BagimsizDenetciRaporu",
                  },
                ],
              },
            ],
          },
        ]
        : []),
      ...(bddkmi === true
        ? [
          {
            id: uniqueId(),
            title: "BDDK",
            icon: IconFilters,
            href: "/Bddk",
            /*
            children: [
              {
                id: uniqueId(),
                title:
                  "İşletmenin Sürekliliğine İlişkin Değerlendirme - BDDK Analizi",
                icon: IconPoint,
                href: "/",
              },
            ],
            */
          },
        ]
        : []),
      /*
  {
    id: uniqueId(),
    title: "SÜRDÜRÜLEBİLİRLİK",
    icon: IconRecycle,
    href: "/",
    children: [
      {
        id: uniqueId(),
        title: "Sürdürülebilirlik",
        icon: IconPoint,
        href: "/",
      },
    ],
  },
  */
      {
        id: uniqueId(),
        title: "KYS",
        icon: IconFileCheck,
        href: "/Kys",
        children: [
          {
            id: uniqueId(),
            title: "1. Belgelendirme",
            icon: IconPoint,
            href: "/Kys/Belgelendirme",
            children: [
              {
                id: uniqueId(),
                title: "1.1 Belgelendirme Politikası Beyanı",
                icon: IconPoint,
                href: "/Kys/Belgelendirme/BelgelendirmePolitikasi",
                formKodu: "KysBelgelendirmePolitikasi",
              },
              {
                id: uniqueId(),
                title: "1.2 Kalite Yönetim Sistemi 'Esas' Belgesi",
                icon: IconPoint,
                href: "/Kys/Belgelendirme/KaliteYonetimSistemiEsasBelgesi",
                formKodu: "KysKaliteYonetimSistemiEsasBelgesi",
              },
              {
                id: uniqueId(),
                title: "1.3 Denetim Şirketinin Yapısı",
                icon: IconPoint,
                href: "/Kys/Belgelendirme/DenetimSirketininYapisi",
                formKodu: "KysDenetimSirketininYapisi",
              },
            ],
          },
          {
            id: uniqueId(),
            title: "2. Risk Değerlendirme Süreci",
            icon: IconPoint,
            href: "/Kys/RiskDegerlendirmeSureci",
            children: [
              {
                id: uniqueId(),
                title: "2.1 Risk Değerlendirme Süreci Politikası Beyanı",
                icon: IconPoint,
                href: "/Kys/RiskDegerlendirmeSureci/PolitikaBeyani",
                formKodu: "KysRiskDegerlendirmePolitikasi",
              },
            ],
          },
          {
            id: uniqueId(),
            title: "3. Üst Yönetim ve Liderlik Yapısı",
            icon: IconPoint,
            href: "/Kys/UstYonetimVeLiderlik",
            children: [
              {
                id: uniqueId(),
                title: "3.1 Üst Yönetim ve Liderlik Yapısı Politikası Beyanı",
                icon: IconPoint,
                href: "/Kys/UstYonetimVeLiderlik/PolitikaBeyani",
                formKodu: "KysUstYonetimPolitikasi",
              },
              {
                id: uniqueId(),
                title: "3.2 Sorumlulukların Verilmesi",
                icon: IconPoint,
                href: "/Kys/UstYonetimVeLiderlik/SorumluluklarinVerilmesi",
                formKodu: "KysSorumluluklarinVerilmesi",
              },
            ],
          },
          {
            id: uniqueId(),
            title: "4. Etik Hükümler",
            icon: IconPoint,
            href: "/Kys/EtikHukumler",
            children: [
              {
                id: uniqueId(),
                title: "4.1 Etik Hükümler Politikası Beyanı",
                icon: IconPoint,
                href: "/Kys/EtikHukumler/PolitikaBeyani",
                formKodu: "KysEtikHukumlerPolitikasi",
              },
              {
                id: uniqueId(),
                title: "4.2 Yıllık Bağımsızlık Taahhüdü",
                icon: IconPoint,
                href: "/Kys/EtikHukumler/YillikBagimsizlikTaahhudu",
                formKodu: "KysYillikBagimsizlikTaahhudu",
              },
              {
                id: uniqueId(),
                title: "4.3 Bağımsızlıkla İlgili Sorunları Çözüme Kavuşturma Formu",
                icon: IconPoint,
                href: "/Kys/EtikHukumler/BagimsizlikSorunlariCozumu",
                formKodu: "KysBagimsizlikSorunlariCozumu",
              },
            ],
          },
          {
            id: uniqueId(),
            title: "5. Müşteri İlişkisinin ve Belirli Bir Sözleşmenin Kabulü ve Devam Ettirilmesi",
            icon: IconPoint,
            href: "/Kys/MusteriIliskisi",
            children: [
              {
                id: uniqueId(),
                title: "5.1 Müşteri İlişkisinin ve Belirli Bir Sözleşmenin Kabulü ve Devam Ettirilmesi Politikası Beyanı",
                icon: IconPoint,
                href: "/Kys/MusteriIliskisi/PolitikaBeyani",
                formKodu: "KysMusteriIliskisiPolitikasi",
              },
              {
                id: uniqueId(),
                title: "5.2 Müşteri Araştırma Soruları",
                icon: IconPoint,
                href: "/Kys/MusteriIliskisi/MusteriArastirmaSorulari",
                formKodu: "KysMusteriArastirmaSorulari",
              },
              {
                id: uniqueId(),
                title: "5.3 Yeni Müşteri Formu",
                icon: IconPoint,
                href: "/Kys/MusteriIliskisi/YeniMusteriFormu",
                formKodu: "KysYeniMusteriFormu",
              },
              {
                id: uniqueId(),
                title: "5.4 Etik Mektubu",
                icon: IconPoint,
                href: "/Kys/MusteriIliskisi/EtikMektubu",
                formKodu: "KysEtikMektubu",
              },
              {
                id: uniqueId(),
                title: "5.5 Yeni Müşteri Kabulü İçin Kontrol Listesi",
                icon: IconPoint,
                href: "/Kys/MusteriIliskisi/YeniMusteriKabulKontrolListesi",
                formKodu: "KysYeniMusteriKabulKontrolListesi",
              },
              {
                id: uniqueId(),
                title: "5.6 Devam Eden Müşteri İçin Kontrol Listesi",
                icon: IconPoint,
                href: "/Kys/MusteriIliskisi/DevamEdenMusteriKontrolListesi",
                formKodu: "KysDevamEdenMusteriKontrolListesi",
              },
              {
                id: uniqueId(),
                title: "5.7 Müşteri Bırakma Formu",
                icon: IconPoint,
                href: "/Kys/MusteriIliskisi/MusteriBirakmaFormu",
                formKodu: "KysMusteriBirakmaFormu",
              },
              {
                id: uniqueId(),
                title: "5.8 Müşteri Bırakma Mektubu",
                icon: IconPoint,
                href: "/Kys/MusteriIliskisi/MusteriBirakmaMektubu",
                formKodu: "KysMusteriBirakmaMektubu",
              },
            ],
          },
          {
            id: uniqueId(),
            title: "6. Denetimin Yürütülmesi",
            icon: IconPoint,
            href: "/Kys/DenetiminYurutulmesi",
            children: [
              {
                id: uniqueId(),
                title: "6.1 Denetimin Yürütülmesi Politikası Beyanı",
                icon: IconPoint,
                href: "/Kys/DenetiminYurutulmesi/PolitikaBeyani",
                formKodu: "KysDenetiminYurutulmesiPolitikasi",
              },
              {
                id: uniqueId(),
                title: "6.2 Çalışma Kontrol Formu",
                icon: IconPoint,
                href: "/Kys/DenetiminYurutulmesi/CalismaKontrolFormu",
                formKodu: "KysCalismaKontrolFormu",
              },
              {
                id: uniqueId(),
                title: "6.3 Uzman Çalışmalarının Kullanılması",
                icon: IconPoint,
                href: "/Kys/DenetiminYurutulmesi/UzmanCalismalarininKullanilmasi",
                formKodu: "KysUzmanCalismalarininKullanilmasi",
              },
              {
                id: uniqueId(),
                title: "6.4 Dış Uzmanların Kullanılmasına İlişkin Kontrol Listesi",
                icon: IconPoint,
                href: "/Kys/DenetiminYurutulmesi/DisUzmanKontrolListesi",
                formKodu: "KysDisUzmanKontrolListesi",
              },
              {
                id: uniqueId(),
                title: "6.5 Görüş Farklılıklarının Çözüme Kavuşturulması",
                icon: IconPoint,
                href: "/Kys/DenetiminYurutulmesi/GorusFarkliliklarininCozumu",
                formKodu: "KysGorusFarkliliklarininCozumu",
              },
              {
                id: uniqueId(),
                title: "6.6 Denetimin Kalitesinin Gözden Geçirilmesi Formu",
                icon: IconPoint,
                href: "/Kys/DenetiminYurutulmesi/DenetimKaliteGozdenGecirme",
                formKodu: "KysDenetimKaliteGozdenGecirme",
              },
            ],
          },
          {
            id: uniqueId(),
            title: "7. Kaynaklar",
            icon: IconPoint,
            href: "/Kys/Kaynaklar",
            children: [
              {
                id: uniqueId(),
                title: "7.1 Kaynaklar Politikası Beyanı",
                icon: IconPoint,
                href: "/Kys/Kaynaklar/PolitikaBeyani",
                formKodu: "KysKaynaklarPolitikasi",
              },
              {
                id: uniqueId(),
                title: "7.2 İş Tanımları",
                icon: IconPoint,
                href: "/Kys/Kaynaklar/IsTanimlari",
                formKodu: "KysIsTanimlari",
              },
              {
                id: uniqueId(),
                title: "7.3 Aday Görüşme ve Değerlendirme Kontrol Listesi",
                icon: IconPoint,
                href: "/Kys/Kaynaklar/AdayGorusmeKontrolListesi",
                formKodu: "KysAdayGorusmeKontrolListesi",
              },
              {
                id: uniqueId(),
                title: "7.4 Yeni Çalışan Oryantasyon Kontrol Listesi",
                icon: IconPoint,
                href: "/Kys/Kaynaklar/YeniCalisanOryantasyonKontrolListesi",
                formKodu: "KysYeniCalisanOryantasyonKontrolListesi",
              },
              {
                id: uniqueId(),
                title: "7.5 Profesyonel Çalışanların Performansının Gözden Geçirilmesi",
                icon: IconPoint,
                href: "/Kys/Kaynaklar/ProfesyonelCalisanPerformansi",
                formKodu: "KysProfesyonelCalisanPerformansi",
              },
              {
                id: uniqueId(),
                title: "7.6 İdari Çalışanların Performansının Gözden Geçirilmesi",
                icon: IconPoint,
                href: "/Kys/Kaynaklar/IdariCalisanPerformansi",
                formKodu: "KysIdariCalisanPerformansi",
              },
              {
                id: uniqueId(),
                title: "7.7 Eğitim ve Gelişim Kayıtları",
                icon: IconPoint,
                href: "/Kys/Kaynaklar/EgitimVeGelisimKayitlari",
                formKodu: "KysEgitimVeGelisimKayitlari",
              },
              {
                id: uniqueId(),
                title: "7.8 Teknoloji Satın Alma Talep Formu",
                icon: IconPoint,
                href: "/Kys/Kaynaklar/TeknolojiSatinAlmaTalepFormu",
                formKodu: "KysTeknolojiSatinAlmaTalepFormu",
              },
              {
                id: uniqueId(),
                title: "7.9 Yeni Hizmet Sağlayıcı Talep Formu",
                icon: IconPoint,
                href: "/Kys/Kaynaklar/YeniHizmetSaglayiciTalepFormu",
                formKodu: "KysYeniHizmetSaglayiciTalepFormu",
              },
            ],
          },
          {
            id: uniqueId(),
            title: "8. Bilgi ve İletişim",
            icon: IconPoint,
            href: "/Kys/BilgiVeIletisim",
            children: [
              {
                id: uniqueId(),
                title: "8.1 Bilgi ve İletişim Politikası Beyanı",
                icon: IconPoint,
                href: "/Kys/BilgiVeIletisim/PolitikaBeyani",
                formKodu: "KysBilgiVeIletisimPolitikasi",
              },
              {
                id: uniqueId(),
                title: "8.2 Kültür Değerlendirmesi - Kalite",
                icon: IconPoint,
                href: "/Kys/BilgiVeIletisim/KulturDegerlendirmesi",
                formKodu: "KysBilgiVeIletisimKulturDegerlendirmesi",
              },
            ],
          },
          {
            id: uniqueId(),
            title: "9. İzleme ve Düzeltme Süreci",
            icon: IconPoint,
            href: "/Kys/IzlemeVeDuzeltme",
            children: [
              {
                id: uniqueId(),
                title: "9.1 İzleme ve Düzeltme Süreci Rehberi",
                icon: IconPoint,
                href: "/Kys/IzlemeVeDuzeltme/SureciRehberi",
                formKodu: "KysIzlemeVeDuzeltmeSureciRehberi",
              },
              {
                id: uniqueId(),
                title: "9.2 İzleme ve Düzeltme Süreci Politikası Beyanı",
                icon: IconPoint,
                href: "/Kys/IzlemeVeDuzeltme/PolitikaBeyani",
                formKodu: "KysIzlemeVeDuzeltmePolitikasi",
              },
              {
                id: uniqueId(),
                title: "9.3 Denetimin Gözden Geçirilmesi Formu",
                icon: IconPoint,
                href: "/Kys/IzlemeVeDuzeltme/DenetiminGozdenGecirilmesi",
                formKodu: "KysDenetiminGozdenGecirilmesiFormu",
              },
              {
                id: uniqueId(),
                title: "9.4 Sistem Değerlendirmesi",
                icon: IconPoint,
                href: "/Kys/IzlemeVeDuzeltme/SistemDegerlendirmesi",
                formKodu: "KysSistemDegerlendirmesi",
              },
              {
                id: uniqueId(),
                title: "9.5 Müşteri Şikâyet Kaydı",
                icon: IconPoint,
                href: "/Kys/IzlemeVeDuzeltme/MusteriSikayetKaydi",
                formKodu: "KysMusteriSikayetKaydi",
              },
              {
                id: uniqueId(),
                title: "9.6 Bulgular Kaydı",
                icon: IconPoint,
                href: "/Kys/IzlemeVeDuzeltme/BulgularKaydi",
                formKodu: "KysBulgularKaydi",
              },
              {
                id: uniqueId(),
                title: "9.7 Eksiklik Değerlendirme Çalışma Sayfası",
                icon: IconPoint,
                href: "/Kys/IzlemeVeDuzeltme/EksiklikDegerlendirme",
                formKodu: "KysEksiklikDegerlendirme",
              },
            ],
          },
          {
            id: uniqueId(),
            title: "10. Risk Matrisi",
            icon: IconPoint,
            href: "/Kys/RiskMatrisi",
            formKodu: "KysRiskMatrisi",
          },

        ],
      },
      {
        id: uniqueId(),
        title: "STANDART ÇALIŞMA KAĞITLARI",
        icon: IconFolderUp,
        href: "/StandartCalismaKagitlari",

        children: [
          {
            id: uniqueId(),
            title: "Bağımsız Denetim Metodolojisi",
            icon: IconPoint,
            href: "/StandartCalismaKagitlari/BagimsizDenetimMetodolojisi",
          },
          {
            id: uniqueId(),
            title: "Denetim Dosya Yazdır",
            icon: IconPoint,
            href: "/StandartCalismaKagitlari/DenetimDosyaYazdir",
          },
        ],
      },
      {
        id: uniqueId(),
        title: "DİĞER İŞLEMLER",
        icon: IconHierarchy,
        href: "/DigerIslemler",
        children: [
          {
            id: uniqueId(),
            title: "Arşiv",
            icon: IconPoint,
            href: "/DigerIslemler/Arsiv",
          },
          {
            id: uniqueId(),
            title: "Denetçi Firma Bilgileri",
            icon: IconPoint,
            href: "/DigerIslemler/DenetciFirmaBilgileri",
          },
          {
            id: uniqueId(),
            title: "Üyelik Bilgileri",
            icon: IconPoint,
            href: "/DigerIslemler/UyelikBilgileri",
          },
          {
            id: uniqueId(),
            title: "Veri Aktarma",
            icon: IconPoint,
            href: "/DigerIslemler/VeriAktarma",
          },
          {
            id: uniqueId(),
            title: "Email Şablonları",
            icon: IconMail,
            href: "/admin/email-templates",
          },
        ],
      },
      {
        id: uniqueId(),
        title: "KULLANIM KILAVUZU",
        icon: IconInfoCircle,
        href: "/KullanimKilavuzu",
      },
    ];
}
