import { apiFetch } from "@/api/apiBase";

export interface Denetlenen {
  id: number;
  unvan: string;
}

export type YabanciParaTestleriRow = {
  id: number;

  dipnotNo?: string | null;
  baslik?: string | null;

  hesapAdi: string;
  kebirKodu: string;
  detayKodu: string;

  mizanBakiye?: number | null;
  hesaplananBakiye?: number | null;

  degisimTl?: number | null; // Mizan Farkı

  onemlilik?: string | null;

  dovizBakiye?: number | null;
  kur?: number | null;

  dipnot?: string | null;
  paraBirimi?: string | null;

  denetlenen?: Denetlenen | null;

  modelAdi?: string | null;
};

export const getYabanciParaTestleriByDenetlenen = async (
  controller: string,
  denetciId: number,
  yil: number,
  denetlenenId: number,
  dipnotNo: string,
  modelAdi: string
) => {
  const url =
    `/${controller}/GetByDenetlenen` +
    `?denetciId=${denetciId}` +
    `&yil=${yil}` +
    `&denetlenenId=${denetlenenId}` +
    `&dipnotNo=${encodeURIComponent(dipnotNo)}` +
    `&modelAdi=${encodeURIComponent(modelAdi)}`;

  const res = await apiFetch(url, {
    method: "GET",
    headers: {
      accept: "application/json",
    },
  });

  if (res.status === 204) return [];

  if (!res.ok) {
    console.log("GetByDenetlenen başarısız:", res.status);
    return null;
  }

  return res.json();
};


export const updateYabanciParaTestleriRow = async (
  controller: string,
  id: number,
  payload: Partial<YabanciParaTestleriRow>
) => {
  // UI string geliyor; backend int/decimal bekliyorsa normalize et
  const normalizedPayload: any = {
    ...payload,
    onemlilik:
      payload.onemlilik === undefined || payload.onemlilik === null
        ? payload.onemlilik
        : Number(payload.onemlilik),
  };

  const res = await apiFetch(`/${controller}/${id}`, {
    method: "PUT",
    headers: {
      accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(normalizedPayload),
  });

  if (!res.ok) {
    console.log("Update başarısız:", res.status);
    return null;
  }

  return res.json();
};

export const varsayilanaDon = async (
  controller: string,
  denetciId: number,
  yil: number,
  denetlenenId: number,
  dipnotNo: string
) => {
  const url =
    `/${controller}/VarsayilanaDon` +
    `?denetciId=${denetciId}` +
    `&yil=${yil}` +
    `&denetlenenId=${denetlenenId}` +
    `&dipnotNo=${encodeURIComponent(dipnotNo)}`;

  const res = await apiFetch(url, {
    method: "GET",
    headers: {
      accept: "application/json",
    },
  });

  if (!res.ok) {
    console.log("Varsayılana dön başarısız:", res.status);
    return null;
  }

  return res.json();
};
