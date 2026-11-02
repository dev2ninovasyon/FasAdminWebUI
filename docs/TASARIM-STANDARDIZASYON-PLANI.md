# FasAdminWebUI tasarım standardizasyon planı

Tarih: 2 Kasım 2026. Durum: kaynak incelemesi tamamlandı; ortak tablo altyapısı ve ilk pilot geçişleri uygulandı. Kalan aşamalar devam ediyor.

## İlk uygulama ilerlemesi

Çalışma dalı: `feat/admin-tasarim-standardizasyonu`. Tasarım değişiklikleri henüz commit edilmedi. Markdown dosyaları ve tarama betiği commit dışında tutuluyor.

| İş | Durum ve kanıt |
|---|---|
| Ortak tablo ölçü ve renk sözleşmesi | `src/utils/theme/adminTable.ts`: normal/kompakt yoğunluk, başlık ve gövde rolleri |
| MUI kapsayıcısı | `AdminTableContainer.tsx`; AuditLoglari ve EnflasyonLoglari kullanıyor. Global MUI override henüz uygulanmadı |
| HOT tema köprüsü | Mevcut wrapper'a isteğe bağlı `adminDesign` eklendi; yalnız geçişi yapılan pilotlarda açık. Horizon'ın iç tema katmanları da kapsanıyor |
| CSS çakışması | Eski Light/Dark seçiciler pilot grid alt ağacını dışlıyor; pilotlarda dinamik Light/Dark CSS import'u kaldırıldı. Diğer eski tabloların CSS geçişi henüz tamamlanmadı |
| GenelHesapPlani / iki DovizKurlari tablosu | Dekoratif callback tekrarları kaldırıldı; yerel font, zebra ve geçersiz sınır rengi atamaları temizlendi |
| BlankCard | Gelen sx nesnesi/dizisi/fonksiyonu MUI sx dizisiyle doğru birleştiriliyor |
| Tarayıcı doğrulaması | `tests/e2e/admin-table-design.spec.ts` geçti: BLUE temada açık→koyu→açık, GenelHesapPlani için 375/768/1440px ve sayfa taşması; tüm pilotlarda başlık rolü eşleşmesi; koyu mod editör rengi/hücre kaydı; Döviz Excel başlığı |
| Görsel inceleme | Koyu mod mobil hesap planı ve masaüstü audit ekran görüntüleri incelendi; test ekran görüntüleri Git'e eklenmiyor |
| Henüz doğrulanmayan kapsam | Alternatif renk teması, tüm sayfalarda mobil görünüm, filtre/sıralama etkileşimleri, boş/hata durumlarının tam matrisi ve kalan tablo/kart/form geçişleri |

Uygulama testinde API'ler taklit edildi; canlı veri değiştirilmedi. Bu ilerleme tablosu tüm Aşama 0–6 işlerinin tamamlandığını ifade etmez.

## Amaç ve kapsam

Aynı işi yapan tablolar, başlıklar, metinler, kartlar, form alanları, butonlar, durum etiketleri ve diyaloglar aynı tasarım kurallarını kullanacak. FasAdminWebUI'ın mevcut MUI teması ve Plus Jakarta Sans yazı tipi korunacak.

Liste tablosu, finansal veri giriş tablosu ve kod/log detayı kendi kullanım ihtiyaçlarını koruyacak; ortak renk ve tipografi kararları paylaşılacak. Salt görünüm çalışması API, yetki, hesaplama, veri sıralaması, filtreleme, düzenleme ve dışa aktarma davranışını değiştirmeyecek.

Bu teslimat plan, proje skill'i ve tekrar üretilebilir kaynak envanteridir. Bu oturumda daha önce yapılan EnflasyonLoglari, dil seçimi ve Türkçe karakter düzeltmeleri mevcut çalışma ağacında bulunuyor; standardizasyonun tamamlandığı anlamına gelmiyor.

## İnceleme yöntemi ve sınırlar

- İlk kaynak taramasında `python scripts/design-audit.py` ile 603 TS/TSX/CSS kaynak dosyası tarandı; bunların 146'sı `page.tsx`. Aşağıdaki sayılar ilk inceleme anına aittir; uygulama sonrası güncel sayılar yeniden üretilen envanterdedir.
- 175 dosya inceleme adayı. 107 dosyada hex renk, 103 dosyada yerel yazı boyutu, 39 dosyada font ailesi tanımı bulundu.
- MUI Table JSX'i 35, Handsontable JSX'i 40 dosyada bulundu. Aynı dosya birden fazla gruba girebilir.
- Bu rakamlar hata veya farklı tasarım sayısı değildir. Tema paletleri, aynı değeri kullanan tanımlar, yorumlar, belge çıktıları ve kullanılmayan kopyalar da eşleşebilir.
- Kaynak üzerinden doğrulanan somut bulgular aşağıda; tüm adaylar [kaynak envanterinde](TASARIM-TARAMA-ENVANTERI.md). Tüm sayfalar tarayıcıda açılmadı; görsel kapsam ve aktif import zincirleri uygulama aşamasında doğrulanacak.

## Tasarımın mevcut kaynakları

| Alan | Kaynak | Karar |
|---|---|---|
| Font ve metin rolleri | [Typography.tsx](../src/utils/theme/Typography.tsx) | Plus Jakarta Sans; body1 0.875rem, body2 0.75rem; yeni yerel font ölçeği üretme |
| Tema birleşimi | [Theme.tsx](../src/utils/theme/Theme.tsx) | Mod, renk teması, yön, gölge ve radius seçimleri korunur |
| Palet | [DefaultColors.tsx](../src/utils/theme/DefaultColors.tsx), [LightThemeColors.tsx](../src/utils/theme/LightThemeColors.tsx), [DarkThemeColors.tsx](../src/utils/theme/DarkThemeColors.tsx) | Sabit sayfa renkleri yerine semantik tema anahtarları |
| MUI genel stilleri | [Components.tsx](../src/utils/theme/Components.tsx) | Ortak MUI kararlarının merkezi |
| Handsontable | [HotTableWrapper.tsx](../src/components/HotTableWrapper.tsx), [handsontableSetup.ts](../src/lib/handsontableSetup.ts) | Mevcut wrapper ve Horizon teması üzerinden MUI temasına köprü |
| Kartlar | [BlankCard.tsx](../src/app/components/Shared/BlankCard.tsx), [ParentCard.tsx](../src/app/components/Shared/ParentCard.tsx) | Mevcut kart gölge/çerçeve tercihlerini koru |
| Formlar | [CustomTextField.tsx](../src/app/components/Forms/ThemeElements/CustomTextField.tsx), [CustomFormLabel.tsx](../src/app/components/Forms/ThemeElements/CustomFormLabel.tsx) | Alan, etiket ve aralıklar aynı rol üzerinden yönetilir |
| Sayfa kabuğu | [AdminUI layout](<../src/app/(AdminUI)/layout.tsx>) | Aktif kabuk `src/app/components/Layout` ağacını kullanıyor; kopya dizin adına göre karar verilmez |

## Kaynakta doğrulanan farklılıklar

Satırlar bu inceleme anındaki kaynaklara göredir. Öncelik: P1 ortak altyapı/çok sayıda ekran; P2 sayfa geçişi; P3 metin ve kalan istisnalar.

| No | Öncelik | Dosya / kanıt | Fark ve etkisi | Planlanan işlem |
|---|---|---|---|---|
| F01 | P1 | [Components.tsx:254](../src/utils/theme/Components.tsx#L254) | TableCell genelinde yalnız alt çizgi belirlenmiş; ortak başlık rengi, hücre ölçeği ve yoğunluk tanımı yok | Ortak tablo sözleşmesini MUI override ve tablo sarmalayıcısında tanımla |
| F02 | P1 | [GenelHesapPlani.tsx:113](../src/app/components/GenelHesapPlani/GenelHesapPlani.tsx#L113), [DovizKurlariOtuzAralik.tsx:122](../src/app/components/VeriIslemleri/DovizKurlariOtuzAralik.tsx#L122), [Mizan.tsx:217](<../src/app/(AdminUI)/components/Veri/Mizan/Mizan.tsx#L217>) | 0.875rem/500 font, açık modda beyaz ve #cccccc satırlar, sabit koyu renkler callback'lerde tekrarlanıyor | Dekoratif callback stillerini ortak tema köprüsüne taşı; iş anlamı taşıyan renderer'ları koru |
| F03 | P1 | [GenelHesapPlani.tsx:121](../src/app/components/GenelHesapPlani/GenelHesapPlani.tsx#L121), [DovizKurlariOtuzAralik.tsx:130](../src/app/components/VeriIslemleri/DovizKurlariOtuzAralik.tsx#L130) | Açık mod için geçersiz `borderColor = "#"` atanıyor | `theme.palette.divider` ile değiştir |
| F04 | P1 | [DenetciTable.tsx:208](../src/app/components/Tables/DenetciTable.tsx#L208), [DenetciTable.tsx:249](../src/app/components/Tables/DenetciTable.tsx#L249) | Aynı tablo ailesinde 13px; diğer HOT tablolarında 14px. Durum chip'leri de sabit yeşil/kırmızı | Tema body1 ve merkezi durum renklerini kullan |
| F05 | P1 | [handsontableSetup.ts:45](../src/lib/handsontableSetup.ts#L45), [HOT açık CSS](../src/app/components/HandsOnTable/HandsOnTableLight.css), [HOT koyu CSS](../src/app/components/HandsOnTable/HandsOnTableDark.css) | Açık CSS global yükleniyor; sayfalar mod değişiminde ayrı global CSS import ediyor. Aynı `.handsontableInput` seçicisine iki moddan !important uygulanabiliyor | Aynı anda yüklenebilen CSS'i wrapper altında scope et; tema değişimini değişken/class üzerinden yönet; gezinme sırasını test et |
| F06 | P2 | [DenetimDosyaTable.tsx:147](../src/app/components/Tables/DenetimDosyaTable.tsx#L147), [AuditLoglari:224](<../src/app/(AdminUI)/AuditLoglari/page.tsx#L224>) | Bir tabloda başlıklar h6/16px, diğerinde varsayılan TableCell. Audit satırlarında 0.8/0.85rem yerel ölçüler var | Tüm liste başlıklarını 14px/600 rolüne; gövdeyi body1 rolüne taşı |
| F07 | P2 | [SistemLoglari:395](<../src/app/(AdminUI)/SistemLoglari/page.tsx#L395>), [SistemLoglari:464](<../src/app/(AdminUI)/SistemLoglari/page.tsx#L464>) | Detay alanlarında grey.900 ve #121824/#a4b1cd sabit terminal görünümü | Log detayının yüzeyini temaya bağla; monospace sadece teknik içerikte kalsın |
| F08 | P2 | [EnflasyonLoglari](<../src/app/(AdminUI)/EnflasyonLoglari/page.tsx>) | Bu oturumda sabit koyu yüzeyler kaldırıldı; 0.8/0.85rem yerel ölçekler hâlâ var | Düzeltilen renkleri koru; sonraki geçişte ortak tablo yoğunluğu ve tipografisine bağla |
| F09 | P1 | [BlankCard.tsx:25](../src/app/components/Shared/BlankCard.tsx#L25) | Gelen sx nesnesi stil nesnesine `sx` anahtarı olarak gömülmüş; çağıranın stil override'ı beklenen şekilde birleşmeyebilir | Önce sx birleştirmesini düzelt ve çağıran kartlarda doğrula; bu belgede uygulanmadı |
| F10 | P2 | [CustomFormLabel.tsx:18](../src/app/components/Forms/ThemeElements/CustomFormLabel.tsx#L18) | 25px varsayılan üst boşluk, düz TextField/etiket kullanılan sayfalardan farklı dikey ritim oluşturuyor | Ortak normal/kompakt alan aralığı tanımla; tüm formları tek seferde daraltma |
| F11 | P1 | [aktif layout](<../src/app/(AdminUI)/layout.tsx>), [ortak Shared](../src/app/components/Shared/BlankCard.tsx), [diğer Shared](<../src/app/(AdminUI)/components/Layout/Shared/BlankCard/BlankCard.tsx>) | `src/app/components`, `src/app/(AdminUI)/components`, `Layout1` ağaçları bulunuyor; eş adlı bileşenlerin etkisi import zincirine bağlı | Her değişiklikte aktif import'u izle; uyumlu kopyaları aşamalı re-export et; kullanılmayanı kanıtsız silme |
| F12 | P3 | [MenuTable.tsx:160](<../src/app/(AdminUI)/components/Tables/MenuTable.tsx#L160>), [kodlama envanteri](TASARIM-TARAMA-ENVANTERI.md) | Sabit #1976d2 aksiyon ikonu ve kaynaklarda bozuk Türkçe adayları var | İkonu primary.main ile eşleştir; görünür metinleri UTF-8 olarak düzelt |
| F13 | Ayrı bağlam | [FisBuyukluguAnalizi:162](<../src/app/(AdminUI)/StandartCalismaKagitlari/FisBuyukluguAnalizi/page.tsx#L162>) | Arial/13px ve HTML tablo, indirilen rapor HTML'i içinde; doğrudan ekran tablosu sapması sayılmaz | Rapor/baskı stilini ayrı profil olarak tut; ekran standardı için otomatik değiştirme |
| F14 | Ayrı bağlam | [LexicalEditor](../src/app/components/Editor/LexicalEditor.tsx), [lexical.css](../src/app/components/Editor/lexical.css) | Kullanıcının belge içeriği için seçilebilir font/boyutlar var | Editör araç çubuğunu standartlaştır; kaydedilmiş belge biçimini dönüştürme |

## Hedef tasarım sözleşmesi

Aşağıdaki değerler önerilen uygulama hedefidir; kaynakta hâlihazırda her yerde uygulanmış değildir. Aynı rol için sayfaya özel alternatif üretilmez.

| Rol | Ortak kural |
|---|---|
| Genel font | `theme.typography.fontFamily`; mevcut Plus Jakarta Sans |
| Gövde ve tablo hücresi | `body1`: 0.875rem (normal kök ölçüde 14px), ağırlık 400, tema satır yüksekliği |
| Tablo kolon başlığı | body1 boyutu, ağırlık 600; h6 başlığı hücre içine yerleştirme |
| Yardımcı metin | `body2`: 0.75rem (12px), `text.secondary` |
| Kart / bölüm başlığı | `h6`; mevcut CardHeader/Breadcrumb davranışını ayrı kabuk rolü olarak koru |
| Sayfa başlığı | Ortak Breadcrumb'ın başlığı; ikinci büyük başlık ekleme |
| Tablo başlık yüzeyi | `primary.light`; metin `text.primary` |
| Tablo gövdesi | `background.paper`; metin `text.primary`; sınırlar `divider` |
| Satır etkileşimi | Hover `action.hover`, seçim `action.selected`; klavye odağı görünür |
| Zebra satırlar | Varsayılan kapalı; gerekiyorsa her iki tabloda aynı merkezi varyant, ikinci yüzey `action.hover` |
| Satır yoğunluğu | Normal tek satır hedefi 40px; merkezi kompakt varyant 35px. Çok satırlı içerik yüksekliği büyüyebilir |
| Başlık yüksekliği | Tek satır hedefi 48px; uzun Türkçe başlık ve iç içe başlıkta içerik taşmadan büyür |
| Tablo çerçevesi | 1px divider, radius `theme.shape.borderRadius`; aynı tablo yüzeyine iki çerçeve/gölge verme |
| Sayısal sütunlar | Sağa hizalı; mevcut hassasiyet ve Türkçe sayı formatı korunur |
| Durumlar | `success`, `warning`, `error`, `info`; renk yanında metin/ikon bulunur |
| Butonlar | Birincil işlem contained/primary; ikincil outlined; satır işlemi erişilebilir etiketli IconButton |
| Formlar | Etiket, hata ve yardımcı metin rolleri ortak; normal/kompakt yoğunluk ortak; alan verisi ve doğrulama korunur |
| Kart aralıkları | İçerik için varsayılan `p: 3`; kompakt araç çubuğu `p: 2`; grup aralığı `spacing: 2`; farklılık rol ile açıklanır |
| Diyaloglar | Başlık/Content/Actions MUI yapısı; kağıt ve metin tema renkleri; geniş içerik kendi içinde kayar |
| Teknik detay | Kod, stack trace, JSON için monospace kabul edilir; yüzey tema uyumlu kalır |
| Marka / çıktı | Marka görseli, grafik veri rengi, PDF/Excel/baskı ve düzenlenebilir belge içeriği ayrı gerekçeli profillerdir |

MUI ve Handsontable aynı görünüm sözlüğünü paylaşacak; veri giriş tablolarını MUI tablosuna çevirmek bu planın hedefi değildir.

## Uygulama sırası

### Aşama 0 — Görsel ve kullanım tabanını kaydet

- [ ] Aktif menüden erişilen sayfaları ve import zincirlerini çıkar; envanter adaylarını aktif / kullanılmıyor / belge çıktısı olarak işaretle.
- [ ] Liste, düzenlenebilir finansal tablo, form ve log detayı için mevcut ekran görüntülerini kaydet.
- [ ] BLUE ve en az bir alternatif renk temasında açık/koyu görünümü; 375, 768 ve 1440px genişlikleri kontrol et.
- [ ] Varsayılan ve kompakt yoğunluk örneklerini yukarıdaki hedeflerle karşılaştır.

Çıkış: karşılaştırılabilir örnek ekranlar ve kesin geçiş kapsamı. Oturum/yetki isteyen ekranlar test kullanıcısı veya API taklidiyle doğrulanır.

### Aşama 1 — Ortak temeli kur (F01, F05, F09, F11)

- [ ] `src/utils/theme` altında tipli tablo rol/yoğunluk değerleri oluştur; renkleri tema fonksiyonundan türet.
- [ ] `Components.tsx` içinde TableCell başlık/gövde ölçeğini merkezileştir; global değişiklikten önce etkilenen MUI tablolarını karşılaştır.
- [ ] `src/app/components/Shared/AdminTableContainer.tsx` gibi ortak bir kapsayıcıda çerçeve, radius, taşma ve yoğunluk kararlarını topla; mevcut BlankCard/ParentCard'ı çoğaltma.
- [ ] `HotTableWrapper.tsx` içinde mevcut `fas-hot-table` sınıfından scope edilen CSS değişkenlerini MUI temasına bağla. DOM callback stilleri sx palet anahtarlarını çözmez; burada gerçek `theme.palette.*` değerleri kullanılmalı.
- [ ] Kaydırma, seçili hücre, editör, filtre menüsü, readOnly ve validation renklerini de kapsa. Dekoratif callback'leri kaldırırken veri/formül renderer'larını koru.
- [ ] Light/Dark global input CSS çakışmasını gider; tema değişiminde ve sayfa geçişinde ters mod renginin kalmadığını doğrula.
- [ ] BlankCard'ın sx birleştirmesini düzelt; aktif ve kopya bileşenleri import zinciri üzerinden değerlendir.

Çıkış: iki tablo motorunda tek tasarım sözleşmesi. Bu aşama sayfa verisi veya backend değişikliği içermemeli.

### Aşama 2 — Pilot sayfaları geçir (F02, F03, F04, F06, F08)

| Sıra | Sayfa / bileşen | Doğrulama |
|---|---|---|
| 1 | GenelHesapPlani | Hücre düzenleme ve API güncellemesi; sıralama, filtre, Excel |
| 2 | DovizKurlariOtuzAralik ve OtuzBirAralik | İki tablonun aynı görünmesi; yenileme, tarih/sayı formatı, Excel |
| 3 | DenetciTable / DenetciFirmaIslemleri | 13px ayrımının kalkması; durum chip'i ve satır aksiyonları |
| 4 | AuditLoglari ve EnflasyonLoglari | Başlık/gövde, yükleniyor/boş/hata durumları, detay ve indirme |

Çıkış: normal/kompakt, açık/koyu ve mobil örnekleri doğrulanmış pilot seti. Sonraki geçişler bu seti referans alır.

### Aşama 3 — Kalan liste ve yönetim ekranları

- [ ] SistemLoglari, Hangfire, KullaniciIslemleri, GeriBildirimler ve DenetimDosyaBelgeleri.
- [ ] Formatlar, EmailSablonlari / admin email-templates, MenuIslemleri.
- [ ] FinansalTabloYonetimi ve KgkGuncellemeleri: çok sayıda tablo/aksiyon içerdiğinden ayrı küçük değişiklikler halinde.
- [ ] Menüye göre ulaşılan diğer liste, diyalog ve form sayfalarını envanter üzerinden tamamla.

Çıkış: aynı rol için başlık, hücre, arama, filtre, sayfalama ve aksiyonların aynı kuralları kullanması.

### Aşama 4 — Finansal ve çalışma kâğıdı tabloları

- [ ] Mizan, EDefterInceleme, Fatura, HaricFisListesi gibi veri ekranları.
- [ ] MaddiDogrulama, PlanVeProgram, DenetimKanitlari ve StandartCalismaKagitlari.
- [ ] Birleşik hücre, iç içe başlık, formül, sayısal hassasiyet, seçim ve onay durumlarını koru.
- [ ] Kaynak envanterindeki diğer HOT/MUI kullanıcılarını aktiflik doğrulamasından sonra geçir.

Çıkış: finansal işaretleme anlamı korunarak dekoratif font/renk tekrarlarının ortak katmana taşınması.

### Aşama 5 — Form, kart ve metin bütünlüğü (F07, F10, F12)

- [ ] FormLabel/TextField/Select ve doğrulama yerleşimleri için normal/kompakt profil uygula.
- [ ] Kart, bölüm, sekme, diyalog ve buton rollerini sayfa grupları halinde eşitle.
- [ ] Görünür bozuk Türkçe metinleri kaynakta düzelt; API'den gelen metinleri kaynakları belirlenmeden dönüştürme.
- [ ] Teknik log detaylarında monospace istisnasını koruyup sabit koyu yüzeyleri tema ile eşleştir.
- [ ] Belge editörünün araçlarını ortaklaştır; kaydedilmiş belge ve rapor çıktı stillerini ayrı tut.

Çıkış: sadece tabloların değil tüm ortak bileşen rollerinin tutarlı olması.

### Aşama 6 — Regresyon ve sürdürülebilirlik

- [ ] Envanteri yeniden üret; kalan yerel tanımları kaldır veya gerekçeli istisna olarak kaydet.
- [ ] Ortak renk/ölçü tanımları dışına yeni dekoratif sabit eklenmesini kod incelemesinde kontrol et.
- [ ] Açık/koyu tema geçişini aynı oturumda art arda uygula; HOT editör ve menülerinin doğru renk aldığını kontrol et.
- [ ] MUI + HOT pilotlarında görsel karşılaştırma ve önemli etkileşimler için hedefli Playwright testleri ekle.
- [ ] Derleme/tip kontrolü ve mevcut ilgili testleri çalıştır; mevcut bağımsız hataları yeni değişikliklerden ayır.

## Kabul ölçütleri

1. Aynı rolün font ailesi, boyutu, ağırlığı, yüzeyi ve çizgisi sayfadan bağımsız ortak kaynaktan gelir.
2. Açık temada sabit koyu tablo/diyalog yüzeyi ve koyu temada okunamayan editör metni kalmaz.
3. 375/768/1440px genişliklerde sayfanın tamamı yatay taşmaz; geniş tablo kendi kapsayıcısında kayar.
4. Uzun Türkçe başlık, boş veri, yükleniyor, hata, yoğun veri, hover, seçim ve odak durumları kontrol edilir.
5. Sayısal biçim, filtre, sıralama, hücre kaydı, onay, dışa aktarma ve yetki davranışları değişmez.
6. Yeni ortak tasarım için ikinci bir tema sağlayıcı veya UI kütüphanesi eklenmez.
7. Tarayıcıda kontrol edilmeyen sayfa tamamlandı olarak işaretlenmez; kaynak taraması ve görsel onay ayrı raporlanır.

## İzleme ve riskler

| Risk | Yaklaşım |
|---|---|
| Global MUI override çok sayıda tabloyu aynı anda etkiler | Önce pilot, sonra aşamalı geçiş ve görsel karşılaştırma |
| HOT inline callback stili ortak CSS'i ezer | Dekoratif atamayı kaynağından kaldır; daha fazla !important ile bastırma |
| Dinamik Light/Dark CSS gezinme sırasına bağlı kalır | Scope edilmiş tema değişkenleri; aynı oturumda mod ve rota değişimini test et |
| Kopya bileşenin yanlış dosyası değiştirilir | Aktif layout/route'tan import zincirini takip et; silme/taşıma öncesi kullanım kanıtı |
| Rapor veya belge görünümü yanlışlıkla değişir | F13/F14 kapsamını ekran katmanından ayır |
| Yoğunluk değişikliği finansal tabloyu bozar | Birleşik başlıklar, çok satırlı hücreler ve satır yüksekliği büyümesini koru |

Tekrar tarama: `python scripts/design-audit.py`. Uygulama sırasında her aşamanın kutuları sadece ilgili doğrulama tamamlandığında işaretlenir. Tasarım kararları değişirse önce bu sözleşme ve [proje SKILL.md](../SKILL.md) birlikte güncellenir.
