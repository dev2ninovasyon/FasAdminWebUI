import { apiFetch } from "@/api/apiBase";


export const getDenetimDosya = async (denetimTuru: string, token: string) => {
  try {
    let tfrsmi = denetimTuru == "Tfrs" ? true : false;
    let bobimi = denetimTuru == "Bobi" ? true : false;

    const response = await apiFetch(
      `/DenetimDosyaBelgeleri/DenetimDosyaListe?tfrsmi=${tfrsmi}&bobimi=${bobimi}`,
      {
        method: "GET",
        token: token,
        headers: {
          accept: "application/json",
        },
      }
    );

    if (response.ok) {
      return response.json();
    } else {
      console.log("Verileri getirilemedi");
      return null;
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
    return null;
  }
};

export const getDenetimDosyaByFormKodu = async (
  denetimTuru: string,
  formKodu: string,
  token: string
) => {
  try {
    const response = await apiFetch(
      `/DenetimDosyaBelgeleri/FormKodu?denetimTuru=${denetimTuru}&formKodu=${formKodu}`,
      {
        method: "GET",
        token: token,
        headers: {
          accept: "application/json",
        },
      }
    );

    if (response.ok) {
      return response.json();
    } else {
      console.log("Verileri getirilemedi");
      return null;
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
    return null;
  }
};

export const getCariDosya = async (denetimTuru: string, token: string) => {
  try {
    let tfrsmi = denetimTuru == "Tfrs" ? true : false;
    let bobimi = denetimTuru == "Bobi" ? true : false;

    const response = await apiFetch(
      `/DenetimDosyaBelgeleri/CariDosyaListe?tfrsmi=${tfrsmi}&bobimi=${bobimi}`,
      {
        method: "GET",
        token: token,
        headers: {
          accept: "application/json",
        },
      }
    );

    if (response.ok) {
      return response.json();
    } else {
      console.log("Verileri getirilemedi");
      return null;
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
    return null;
  }
};

export const getSurekliDosya = async (denetimTuru: string, token: string) => {
  try {
    let tfrsmi = denetimTuru == "Tfrs" ? true : false;
    let bobimi = denetimTuru == "Bobi" ? true : false;

    const response = await apiFetch(
      `/DenetimDosyaBelgeleri/SurekliDosyaListe?tfrsmi=${tfrsmi}&bobimi=${bobimi}`,
      {
        method: "GET",
        token: token,
        headers: {
          accept: "application/json",
        },
      }
    );

    if (response.ok) {
      return response.json();
    } else {
      console.log("Verileri getirilemedi");
      return null;
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
    return null;
  }
};

export const getHile = async (denetimTuru: string, token: string) => {
  try {
    let tfrsmi = denetimTuru == "Tfrs" ? true : false;
    let bobimi = denetimTuru == "Bobi" ? true : false;

    const response = await apiFetch(
      `/DenetimDosyaBelgeleri/HileListe?tfrsmi=${tfrsmi}&bobimi=${bobimi}`,
      {
        method: "GET",
        token: token,
        headers: {
          accept: "application/json",
        },
      }
    );

    if (response.ok) {
      return response.json();
    } else {
      console.log("Verileri getirilemedi");
      return null;
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
    return null;
  }
};

export const getDenetimDosyaTransfer = async (
  denetimTuru: string,
  token: string
) => {
  try {
    let tfrsmi = denetimTuru == "Tfrs" ? true : false;
    let bobimi = denetimTuru == "Bobi" ? true : false;

    const response = await apiFetch(
      `/DenetimDosyaBelgeleri/DenetimDosyaTransfer?tfrsmi=${tfrsmi}&bobimi=${bobimi}`,
      {
        method: "GET",
        token: token,
        headers: {
          accept: "application/json",
        },
      }
    );

    if (response.ok) {
      return response.json();
    } else {
      console.log("Verileri getirilemedi");
      return null;
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
    return null;
  }
};

export const denetimDosyaTransfer = async (
  denetciId: number,
  kaynakId: number,
  hedefId: number,
  kaynakYil: number,
  hedefYil: number,
  obj: any[],
  token: string
) => {
  try {
    const response = await apiFetch(
      `/DenetimDosyaBelgeleri/TransferYap?denetciId=${denetciId}&kaynakId=${kaynakId}&hedefId=${hedefId}&kaynakYil=${kaynakYil}&hedefYil=${hedefYil}`,
      {
        method: "POST",
        token: token,
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(obj),
      }
    );

    if (response.ok) {
      return response.json();
    } else {
      const contentType = response.headers.get("content-type");
      let message = "Hata Oluştu";
      if (contentType && contentType.includes("application/json")) {
        const errorData = await response.json();
        message = errorData || message;
      } else {
        message = await response.text();
      }

      return { message };
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};
export async function createBirlesikPdfByFormat(
  denetciId: number,
  denetlenenId: number,
  yil: number,
  selections: { id: number; pdf: boolean; word: boolean }[],
  denetimTuru: string
): Promise<boolean> {
  const resp = await apiFetch(
    `/DenetimDosyaBelgeleri/BirlesikPdfOlustur?denetciId=${denetciId}&denetlenenId=${denetlenenId}&yil=${yil}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Denetim-Turu": denetimTuru || "",
      },
      body: JSON.stringify({ selections }),
    }
  );

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`BirlesikPdfOlustur hata: ${resp.status} - ${text}`);
  }

  // Body boş olabileceği için JSON parse etmiyoruz
  return true;
}

const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));

export async function createAndFetchBirlesikPdf(
  denetciId: number,
  denetlenenId: number,
  yil: number,
  selections: { id: number; pdf: boolean; word: boolean }[],
  denetimTuru: string,
  options?: {
    maxRetries?: number;
    retryDelayMs?: number;
  }
): Promise<{
  createUrl: string;
  last: { blobUrl: string; fileName: string } | null;
}> {
  const maxRetries = options?.maxRetries ?? 5;
  const retryDelayMs = options?.retryDelayMs ?? 1000;

  // 1) Oluştur
  const ok = await createBirlesikPdfByFormat(
    denetciId,
    denetlenenId,
    yil,
    selections,
    denetimTuru
  );

  if (!ok) {
    return { createUrl: "", last: null };
  }

  // 2) En son PDFâ€™i çek (gerekirse kısa retry ile)
  let last: { blobUrl: string; fileName: string } | null = null;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      last = await getLastBirlesikPdf(denetciId, denetlenenId, yil);
      if (last) break; // bulundu
    } catch {
      // sessiz geç â†’ tekrar dene
    }
    if (attempt < maxRetries) {
      await sleep(retryDelayMs);
    }
  }

  // createUrl backend JSON dönmediği için biz elle üretiyoruz
  const createUrl = `/DenetimDosyaBelgeleri/EnSonBirlesikPdf?denetciId=${denetciId}&denetlenenId=${denetlenenId}&yil=${yil}`;

  return { createUrl, last };
}

export async function getLastBirlesikPdf(
  denetciId: number,
  denetlenenId: number,
  yil: number
): Promise<{ blobUrl: string; fileName: string } | null> {
  try {
    const qs = new URLSearchParams({
      denetciId: String(denetciId),
      denetlenenId: String(denetlenenId),
      yil: String(yil),
    }).toString();

    const resp = await apiFetch(`/DenetimDosyaBelgeleri/EnSonBirlesikPdf?${qs}`, {
      method: "GET",
      headers: {
        // Authorization removed
      },
    });

    if (resp.status === 204 || resp.status === 404) return null;
    if (!resp.ok) return null;

    const ctype = resp.headers.get("content-type") || "";
    if (!ctype.includes("application/pdf")) return null;

    const blob = await resp.blob();
    const blobUrl = URL.createObjectURL(blob);

    // Backend'den gelen dosya adı
    let fileName = resp.headers.get("X-File-Name") || "Birlesik.pdf";

    // Eğer header yoksa Content-Disposition fallback
    if (!resp.headers.get("X-File-Name")) {
      const cd = resp.headers.get("Content-Disposition") || "";
      const m =
        /filename\*?=(?:UTF-8''|")?([^\";\n]+)(?:\")?/i.exec(cd) ||
        /filename="?([^\";\n]+)"?/i.exec(cd);
      if (m && m[1]) fileName = decodeURIComponent(m[1]);
    }

    return { blobUrl, fileName };
  } catch {
    return null;
  }
}
export async function sendBulkOnay(
  payload: {
    denetciId: number;
    denetlenenId: number;
    yil: number;
    denetimTuru: string;
    hazirlayanId: number | null;
    onaylayanId: number | null;
    kaliteKontrolId: number | null;
    items: Array<{ belgeId: number; belgeAdi: string; formKodu: string }>;
  }
): Promise<{ results: Array<{ belgeId: number; success: boolean; message?: string }> }> {
  console.log("api")
  const res = await apiFetch(`/FormHazirlayanOnaylayan/TopluOnay`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    // hata durumunda hepsini başarısız işaretleyelim
    return { results: payload.items.map(i => ({ belgeId: i.belgeId, success: false })) };
  }
  const data = await res.json().catch(() => null);
  // beklenen örnek response:
  // { results: [{ belgeId: 123, success: true }, { belgeId: 456, success: false, message: "..." }] }
  return data ?? { results: [] };
}

