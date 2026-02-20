// src/api/CalismaKagitlari/HesaplaraIliskinUygulananDenetimTestleri.ts

import { apiFetch } from "@/api/apiBase";
export interface Denetlenen {
  id: number;
  unvan: string;
  // Add other necessary fields
}

export type HesapTestRow = {
  id: number; // Inherited from BaseEntityCalismaKagitlari

  dipnotNo?: string | null;
  baslik?: string | null;

  hesapAdi: string;
  kebirKodu: string;
  detayKodu: string;

  oncekiDonemBakiye?: number | null;
  cariDonemBakiye?: number | null;
  degisimTl?: number | null;
  degisimYuzde?: number | null;

  onemlilik?: string | null;
  dipnot: string;
  paraBirimi: string;

  denetlenen?: Denetlenen | null;

  modelAdi?: string;
};

/**
 * GET: /{controller}?denetciId=...&yil=...&denetlenenId=...&dipnotNo=...&modelAdi=...
 */
export const getHesapTestleriByDenetlenen = async (
  controller: string,
  denetciId: number,
  denetlenenId: number,
  yil: number,
  dipnotNo: string,
  modelAdi: string
) => {
  try {
    const url = `/${controller}/GetByDenetlenen?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}&dipnotNo=${encodeURIComponent(
      dipnotNo
    )}&modelAdi=${encodeURIComponent(modelAdi)}`;
    // console.log(token) // Token removed
    console.log("=== API CALL DEBUG ===");
    console.log("URL:", url);
    console.log("Params:", { denetciId, yil, denetlenenId, dipnotNo, modelAdi });

    const response = await apiFetch(url, {
      method: "GET",
      headers: {
        accept: "application/json",
      },
    });

    console.log("Response Status:", response.status);
    console.log("Response OK:", response.ok);

    // 204 No Content durumunu handle et
    if (response.status === 204) {
      console.warn("Backend 204 No Content döndü - veri bulunamadı");
      return [];
    }

    if (response.ok) {
      console.log(response);
      return response.json();
    } else {
      console.log("Hesap testleri verileri getirilemedi, Status:", response.status);
      return null;
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
    return null;
  }
};

/**
 * PUT: /{controller}/{id}
 */
export const updateHesapTestRow = async (
  controller: string,
  id: number,
  payload: Partial<HesapTestRow>
) => {
  try {
    const response = await apiFetch(`/${controller}/${id}`, {
      method: "PUT",
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      return response.json(); // BaseApiController result dönüyorsa
    } else {
      console.log("Hesap testi güncellenemedi");
      return null;
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
    return null;
  }
};

/**
 * DELETE: /{controller}/VarsayilanaDon?denetciId=...&yil=...&denetlenenId=...&dipnotNo=...
 * (Backend'de route fix'li haliyle)
 */
export const varsayilanaDon = async (
  controller: string,
  denetciId: number,
  denetlenenId: number,
  yil: number,
  dipnotNo: string
) => {
  try {
    const response = await apiFetch(
      `/${controller}/VarsayilanaDon?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}&dipnotNo=${encodeURIComponent(
        dipnotNo
      )}`,
      {
        method: "DELETE",
        headers: {
          accept: "application/json",
        },
      }
    );

    if (response.ok) {
      return response.json();
    } else {
      console.log("Varsayılana dönme işlemi başarısız");
      return null;
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
    return null;
  }
};
