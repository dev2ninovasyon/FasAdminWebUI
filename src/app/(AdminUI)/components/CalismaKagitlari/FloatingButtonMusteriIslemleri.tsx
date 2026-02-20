import React, { useEffect, useState } from "react";
import { Box, Divider, Paper, Typography, useTheme } from "@mui/material";
import { enhanceTextMsuteriEkle } from "@/utils/gemini";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import CustomTextField from "@/app/components/Forms/ThemeElements/CustomTextField";
import { parse } from "path";

interface FloatingButtonProps {
  control?: boolean;
  text?: string;
  isHovered?: boolean;
  setIsHovered: (b: boolean) => void;
  handleClick: () => void;
  onJson?: (data: any) => void;
  onClear?: () => void;        // <â€” eklendi
}


const messages = {
  welcome: "Firma bilgilerini doldurmanıza yardımcı olabilirim",
  empty: "Web adresi girin, sonra size yardımcı olabilirim",
  working: "Bilgiler üzerinde çalışıyorum...",
  done: "İşte Firma bilgileri!",
};
// Boş olmayan string kontrolü
const nonEmpty = (v: any) => typeof v === "string" && v.trim().length > 0;

// JSONâ€™da doldurulabilir alan var mı? (temel alanları say)
const countFoundFields = (p: any) => {
  if (!p || typeof p !== "object") return 0;
  const i = p?.iletisim ?? {};
  const s = p?.sosyalMedya ?? {};
  const list = [
    p.sirketAdi,
    p.slogan,
    p.hakkindaOzet,
    String(p.kurulusYili ?? "").trim(),
    i.adres,
    i.telefon,
    i.eposta,
    i.haritaLinki,
    s.linkedin,
    s.twitter_x,
    s.facebook,
    s.instagram,
    ...(Array.isArray(p.anahtarHizmetler) ? p.anahtarHizmetler : []),
    p.analizEdilenUrl,
  ];
  return list.filter(nonEmpty).length;
};

// Kullanıcıya gösterilecek mesajı üret
const buildUserMessage = (foundCount: number) => {
  if (foundCount > 0) {
    return "Şirket ile ilgili bulabildiğim bilgileri forma doldurdum. Kalan alanları siz doldurabilirsiniz.";
  }
  return "Üzgünüm, bu web sayfasında doldurabileceğim net şirket bilgisi bulamadım. Bilgileri sizin girmeniz gerekiyor.";
};

export const FloatingButtonMusteriIslemleri: React.FC<FloatingButtonProps> = ({
  control,
  text,
  isHovered,
  setIsHovered,
  handleClick,
  onJson,
  onClear,
}) => {
  const theme = useTheme();
  const customizer = useSelector((state: AppState) => state.customizer);
  const user = useSelector((state: AppState) => state.userReducer);

  const [message, setMessage] = useState(messages.welcome);
  const [loaded, setLoaded] = useState(false);
  const [aiText, setAiText] = useState("");
  const [control2, setControl2] = useState(false);

  const normalizeUrl = (val?: string) => {
    if (!val) return "";
    return val.startsWith("http://") || val.startsWith("https://") ? val : `https://${val}`;
  };

  const isValidUrl = (val?: string) => {
    if (!val) return false;
    try {
      const u = new URL(normalizeUrl(val));
      return !!u.hostname && u.hostname.includes(".");
    } catch {
      return false;
    }
  };

  const buildJsonPrompt = (url: string) => `GÖREV: Şirket Bilgilerini JSON Formatında Çıkar (Yüksek Başarı Oranı Hedeflenmiştir)

ROL: Sen, web sitelerine erişim sağlayabilen, bir sayfanın içeriğinden en zor bulunan kurumsal bilgileri (adres, telefon, e-posta) bile doğru şekilde ayrıştırıp yapılandırılmış JSON formatına dönüştüren uzman bir veri çıkarım asistanısısın.

HEDEF URL: ${url}

İŞ AKIŞI ve STRATEJİ
1. Belirtilen URL'ye erişim sağla ve sayfanın TAM içeriğini (metin) oku.
2. Bilgileri bulmak için stratejik olarak şunları ara:
    a. **Adres/İletişim:** Sayfanın en altındaki (footer) küçük metinleri, "İletişim" veya "Hakkımızda" bölümlerini, yasal metinleri (KVKK, Gizlilik) ve "Kroki/Harita" geçen ifadelerin yakınını tarayarak şirketin TAM yasal adresini bul.
    b. **Şirket Adı:** Sayfanın başlığını (title), footer alanını, telif hakkı ibarelerini ve "Ticaret Unvanı" gibi ifadeleri kontrol et.
3. Çıkardığın bilgileri kullanarak, kurallara uygun şekilde JSON çıktısını oluştur.

KURALLAR (KESİNLİKLE UYULMALIDIR)
1. KESİNLİKLE UYDURMA YAPMA: Tüm bilgiler, SADECE ve SADECE erişilen URL'nin içeriğinden alınmalıdır. Dışarıdan veya kendi genel bilginden HİÇBİR veri (adres, telefon, e-posta vb.) ekleme. **Adres bulunamazsa, adresi uydurmak yerine \`null\` kullan.**
2. Bilgi Bulunamazsa null Kullan: Eğer istenen bir bilgi metinde mevcut değilse, o alanın değeri olarak KESİNLİKLE \`null\` ata. (Örn: "adres": null)
3. Kesin JSON Çıktısı: Cevabın SADECE ve SADECE geçerli bir JSON objesi olmalıdır. Öncesinde veya sonrasında herhangi bir açıklama, yorum veya metin ekleme.
4. Şemaya Tam Uyum: Aşağıda belirtilen JSON şemasının anahtar (key) isimlerini ve yapısını birebir koru.

ERİŞİM HATASI DURUMU
Eğer sağlanan URL'ye erişilemediyse veya içerik okunamadıysa (teknik bir hata veya engelleme nedeniyle), şu JSON'u döndür:
{
"hata": "URL'ye erişilemedi veya içerik alınamadı.",
"url": "${url}"
}

İSTENEN JSON ŞEMASI
{
  "sirketAdi": "Şirketin tam yasal veya ticari adı.",
  "iletisim": {
    "adres": "Şirketin tam ve açık adresi.",
    "telefon": "Genel iletişim telefon numarası.",
    "eposta": "Genel iletişim e-posta adresi."
  }
}
`;

  const stripFences = (s: string) =>
    s.replace(/```json\s*([\s\S]*?)```/gi, "$1")
      .replace(/```\s*([\s\S]*?)```/g, "$1");

  const stripBOM = (s: string) => s.replace(/^\uFEFF/, "");

  const fixSmartQuotes = (s: string) =>
    s.replace(/[â€œâ€]/g, '"').replace(/[â€˜â€™]/g, "'");

  // Basit trailing comma temizleyici: } , ] öncesi virgülleri temizler
  const stripTrailingCommas = (s: string) =>
    s.replace(/,\s*([}\]])/g, "$1");

  // Metin içinden İLK geçerli JSON'u (obje veya dizi) denge sayacıyla ayıklar
  function extractFirstJson(text: string): string | null {
    const s = text.trim();
    const start = s.search(/[\{\[]/);
    if (start < 0) return null;

    const openChar = s[start];
    const closeChar = openChar === "{" ? "}" : "]";
    let depth = 0;
    for (let i = start; i < s.length; i++) {
      const ch = s[i];
      if (ch === openChar) depth++;
      else if (ch === closeChar) depth--;

      if (depth === 0) {
        return s.slice(start, i + 1);
      }
    }
    return null; // kapanış bulunamadı
  }

  function safeParseJson(raw: string): any {
    const candidates: string[] = [];
    // 1) doğrudan
    candidates.push(raw);
    // 2) çit temizle + BOM + smart quotes + trailing comma
    candidates.push(stripTrailingCommas(fixSmartQuotes(stripBOM(stripFences(raw)))));
    // 3) metin içinden ilk JSON'u ayıkla
    const picked = extractFirstJson(candidates[1]) || extractFirstJson(candidates[0]);
    if (picked) {
      try { return JSON.parse(picked); } catch { }
      try { return JSON.parse(stripTrailingCommas(picked)); } catch { }
    }
    // 4) son çare
    try { return JSON.parse(candidates[1]); } catch (e) {
      throw new Error("Geçerli JSON bulunamadı.");
    }
  }
  // --- /helpers ---

  const handleJsonClick = async () => {
    if (typeof onClear === "function") {
      onClear();
      await Promise.resolve();
    }

    const url = normalizeUrl(text);
    if (!isValidUrl(url)) {
      setControl2(false);
      setMessage(messages.empty);
      setAiText("");
      return;
    }

    try {
      setControl2(true);
      setMessage(messages.working);
      setAiText("");

      const raw = await enhanceTextMsuteriEkle(user, buildJsonPrompt(url), url);
      const out = (raw || "").trim();

      // Kullanıcıya gördürdüğünüz metin JSON değilse kafa karıştırabilir,
      // isterseniz bunu setAiText yerine parse başarılı olunca doldurun.
      setAiText(out);

      // Güvenli parse
      let parsed: any;
      try {
        parsed = safeParseJson(out);
      } catch (e) {
        console.log("JSON parse failed:", e, "Sample:", out.slice(0, 200));
        setControl2(false);
        setMessage("Çıktı JSON formatında değil, metin gösterildi.");
        return;
      }

      if (parsed != null) {
        const filledCount = countFoundFields(parsed);
        if (filledCount <= 0) {
          setAiText(buildUserMessage(0));
          setMessage(messages.done);
          return;
        }
        setAiText(buildUserMessage(filledCount));
        onJson?.(parsed);
        setMessage(messages.done);
      }
    } catch (err) {
      console.log("Gemini fetch/parse error:", err);
      setControl2(false);
      setMessage("Çıktı JSON formatında değil, metin gösterildi.");
    }
  };

  const stripCodeFences = (t: string) =>
    t.replace(/^\s*```(?:json)?\s*/i, "").replace(/\s*```\s*$/i, "").trim();

  // Basit ama sağlam çıkarıcı: ilk '{' ile SON eşleşen '}' arası
  const extractFirstJsonObject = (t: string): string | null => {
    const s = stripCodeFences(t);
    const start = s.indexOf("{");
    const end = s.lastIndexOf("}");
    if (start === -1 || end === -1 || end <= start) return null;
    return s.slice(start, end + 1).trim();
  };
  useEffect(() => {
    if (!control2) {
      setAiText("");
      setMessage((text?.length || 0) > 3 ? messages.welcome : messages.empty);
    }
  }, [control2, text]);

  useEffect(() => {
    if ((text?.length || 0) < 3) {
      setControl2(false);
      setAiText("");
      setMessage((text?.length || 0) > 3 ? messages.welcome : messages.empty);
    }
    if (!control2) {
      setMessage((text?.length || 0) > 3 ? messages.welcome : messages.empty);
    }
  }, [text, control2]);

  return (
    <Box
      sx={{
        position: "fixed",
        bottom: 12,
        right: 24,
        zIndex: 1000,
        cursor: "pointer",
        pointerEvents: control ? "visible" : "all",
        opacity: loaded ? 1 : 0,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={control ? () => { } : () => handleClick()}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          animation: "float 2s linear infinite",
          "@keyframes float": { "50%": { transform: "translateY(-2px)" } },
          width: 72,
        }}
      >
        <Typography
          align="center"
          variant="h6"
          color={
            customizer.activeMode == "dark"
              ? theme.palette.common.white
              : theme.palette.common.black
          }
          marginBottom={0.5}
        >
          Fas AI
        </Typography>
      </Box>

      <Box
        sx={{
          position: "fixed",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 72,
          height: 72,
          backgroundColor: "white",
          borderRadius: "100%",
          overflow: "hidden",
        }}
      >
        <iframe
          src="https://widget.galichat.com/chat/6691wb9cakfml2mjro2x19"
          scrolling="no"
          style={{ pointerEvents: "none", border: 0, width: 63, height: 63, transition: "all 0.3s ease-in-out" }}
          onLoad={() => {
            const timer = setTimeout(() => setLoaded(true), 1000);
            return () => clearTimeout(timer);
          }}
        />
      </Box>

      <Paper
        elevation={4}
        sx={{
          display: "flex",
          alignItems: "start",
          justifyContent: isHovered ? "start" : "center",
          flexDirection: "column",
          width: isHovered ? 412 : 56,
          height: isHovered
            ? control && control2 && (text?.length || 0) > 3
              ? 424
              : 72
            : 72,
          borderRadius: "28px",
          transition: "all 0.3s ease-in-out",
          overflow: "hidden",
          padding: isHovered ? "0 16px" : 0,
          ml: isHovered ? 0 : 1,
          zIndex: 1000,
        }}
      >
        {isHovered && (
          <>
            <Typography
              variant="body1"
              fontWeight="bold"
              noWrap
              height={26}
              marginY={3}
              marginLeft={7.2}
              onClick={handleJsonClick}
            >
              {control || (text?.length || 0) > 3 ? message : messages.welcome}
            </Typography>

            {control && control2 ? (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                  gap: 1,
                  mt: 1,
                  mb: 2,
                  width: "100%",
                }}
              >
                <Divider sx={{ width: "100%" }} />
                <CustomTextField
                  id="AiText"
                  multiline
                  rows={13}
                  variant="outlined"
                  fullWidth
                  value={aiText}
                  onChange={(e: any) => setAiText(e.target.value)}
                />
              </Box>
            ) : null}
          </>
        )}
      </Paper>
    </Box>
  );
};


