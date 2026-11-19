import { apiFetch } from "@/api/apiBase";

export const getDenetciler = async (token: string) => {
  try {
    const response = await apiFetch(`/Denetci/Hepsi`, {
      method: "GET",
      token: token
    });
    if (response.ok) {
      return response.json();
    } else {
      console.error("Denetciler getirilemedi");
      return [];
    }
  } catch (error) {
    return [];
  }
};

export interface OldDenetciAdminUserPreview {
  id: number;
  personelAdi?: string;
  email?: string;
  unvani?: string;
  aktifPasif?: boolean;
}

export interface OldDenetciListItem {
  id: number;
  firmaAdi: string;
  firmaUnvani: string;
  adres: string;
  il: string;
  tel: string;
  fax: string;
  email: string;
  web: string;
  vergiNo: string;
  vergiDairesi: string;
  ticaretSicilNo: string;
  kayitTarihi?: string | null;
  arsivId?: string;
  aktifmi?: boolean;
  aciklama?: string;
  denetciAdminSayisi: number;
  denetciAdminKullanicilar: OldDenetciAdminUserPreview[];
}

export interface ImportDenetciResponseData {
  id?: number;
  legacyOldDbId?: number;
  created?: boolean;
  importedAdminUsers?: number;
  existingAdminUsers?: number;
  skippedUsers?: string[];
  odemeBilgileriImported?: boolean;
}

export interface ImportDenetciResponse {
  status: "ok" | "already_exists" | "error";
  data?: ImportDenetciResponseData;
  message?: string;
}

export const getOldDbDenetciler = async (token?: string): Promise<OldDenetciListItem[]> => {
  const response = await apiFetch(`/DataTransfer/Denetciler`, {
    method: "GET",
    token: token || undefined,
    includeCredentials: true,
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(errorText || `Eski denetçi listesi alınamadı (HTTP ${response.status}).`);
  }

  const data = await response.json();
  if (!Array.isArray(data)) {
    return [];
  }

  return data.map((item: any) => {
    const rawAdmins = item.denetciAdminKullanicilar || item.DenetciAdminKullanicilar || [];
    const denetciAdminKullanicilar: OldDenetciAdminUserPreview[] = Array.isArray(rawAdmins)
      ? rawAdmins.map((u: any) => ({
          id: Number(u.id ?? u.Id ?? 0),
          personelAdi: u.personelAdi ?? u.PersonelAdi ?? "",
          email: u.email ?? u.Email ?? "",
          unvani: u.unvani ?? u.Unvani ?? "DenetciAdmin",
          aktifPasif: u.aktifPasif !== undefined ? u.aktifPasif : u.AktifPasif,
        }))
      : [];

    return {
      ...item,
      id: Number(item.id ?? item.Id ?? 0),
      firmaAdi: item.firmaAdi || item.FirmaAdi || "",
      firmaUnvani: item.firmaUnvani || item.FirmaUnvani || "",
      adres: item.adres || item.Adres || "",
      il: item.il || item.Il || "",
      tel: item.tel || item.Tel || "",
      fax: item.fax || item.Fax || "",
      email: item.email || item.Email || "",
      web: item.web || item.Web || "",
      vergiNo: item.vergiNo || item.VergiNo || "",
      vergiDairesi: item.vergiDairesi || item.VergiDairesi || "",
      ticaretSicilNo: item.ticaretSicilNo || item.TicaretSicilNo || "",
      kayitTarihi: item.kayitTarihi ?? item.KayitTarihi ?? null,
      arsivId: item.arsivId || item.ArsivId || "",
      aktifmi: item.aktifmi !== undefined ? item.aktifmi : item.Aktifmi,
      aciklama: item.aciklama || item.Aciklama || "",
      denetciAdminSayisi: Number(
        item.denetciAdminSayisi ?? item.DenetciAdminSayisi ?? denetciAdminKullanicilar.length
      ),
      denetciAdminKullanicilar,
    };
  });
};

export const getDenetciById = async (token: string, id: any) => {
  try {

    const response = await apiFetch(`/Denetci/${id}`, {
      method: "GET",
      token: token
    });
    if (response.ok) {
      return response.json();
    } else {
      console.error("Denetci getirilemedi");
      return {};
    }
  } catch (error) {
    return {};
  }
};

export const createDenetci = async (token: string, createdDenetci: any) => {
  try {
    const response = await apiFetch(`/Denetci`, {
      method: "POST",
      token: token,
      body: JSON.stringify(createdDenetci),
    });

    return response.ok;
  } catch (error) {
    console.error("Bir hata oluştu:", error);
    return false;
  }
};

export interface KullaniciActionResult {
  ok: boolean;
  message?: string;
}

const parseKullaniciActionError = async (response: Response, fallback: string): Promise<string> => {
  try {
    const text = await response.text();
    if (!text) return fallback;
    try {
      const json = JSON.parse(text);
      return json?.message || json?.Message || json?.title || fallback;
    } catch {
      return text;
    }
  } catch {
    return fallback;
  }
};

export const createKullaniciDetayli = async (
  token: string,
  createdKullanici: any
): Promise<KullaniciActionResult> => {
  try {
    const response = await apiFetch(`/Kullanici/AnaKullanici`, {
      method: "POST",
      token: token,
      body: JSON.stringify(createdKullanici),
    });

    if (response.ok) {
      return { ok: true };
    }

    return {
      ok: false,
      message: await parseKullaniciActionError(response, "Kullanıcı eklenemedi."),
    };
  } catch (error) {
    console.error("Bir hata oluştu:", error);
    return { ok: false, message: "Kullanıcı eklenirken bağlantı hatası oluştu." };
  }
};

export const createKullanici = async (token: string, createdKullanici: any) => {
  const res = await createKullaniciDetayli(token, createdKullanici);
  return res.ok;
};

export const updateDenetci = async (
  token: string,
  id: any,
  updatedDenetci: any
) => {
  try {
    const response = await apiFetch(`/Denetci/${id}`, {
      method: "PUT",
      token: token,
      body: JSON.stringify(updatedDenetci),
    });

    return response.ok;
  } catch (error) {
    console.error("Bir hata oluştu:", error);
    return false;
  }
};

export const deleteDenetciById = async (token: string, id: number) => {
  try {
    const response = await apiFetch(`/Denetci/${id}`, {
      method: "DELETE",
      token: token
    });

    return response.ok;
  } catch (error) {
    console.error("Bir hata oluştu:", error);
    return false;
  }
};

export const getDenetciOdemeBilgileri = async (
  token: string,
  denetciId: any
) => {
  try {
    const response = await apiFetch(`/Denetci/OdemeBilgileri/${denetciId}`, {
      method: "GET",
      token: token
    });
    if (response.ok) {
      return response.json();
    } else {
      console.error("Denetci Ödeme Bilgileri getirilemedi");
      return {};
    }
  } catch (error) {
    return {};
  }
};

export const updateDenetciOdemeBilgileri = async (
  token: string,
  denetciId: any,
  updatedDenetciOdemeBilgileri: any
) => {
  try {
    const response = await apiFetch(`/Denetci/OdemeBilgileri/${denetciId}`, {
      method: "PUT",
      token: token,
      body: JSON.stringify(updatedDenetciOdemeBilgileri),
    });

    return response.ok;
  } catch (error) {
    console.error("Bir hata oluştu:", error);
    return false;
  }
};

export const getDenetciKotaGecmisi = async (token: string, denetciId: any) => {
  try {
    const response = await apiFetch(`/Denetci/KotaGecmisi/${denetciId}`, {
      method: "GET",
      token: token
    });
    if (response.ok) {
      return response.json();
    } else {
      console.error("Denetci Kota Geçmişi getirilemedi");
      return [];
    }
  } catch (error) {
    return [];
  }
};

export const importDenetci = async (
  token: string,
  denetci: any
): Promise<ImportDenetciResponse> => {
  try {
    const response = await apiFetch(`/DataTransfer/ImportDenetci`, {
      method: "POST",
      token: token || undefined,
      includeCredentials: true,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(denetci),
    });

    if (response.ok) {
      const raw = await response.json().catch(() => undefined);
      const data: ImportDenetciResponseData | undefined = raw
        ? {
            id: raw.id ?? raw.Id,
            legacyOldDbId: raw.legacyOldDbId ?? raw.LegacyOldDbId,
            created: raw.created ?? raw.Created,
            importedAdminUsers: raw.importedAdminUsers ?? raw.ImportedAdminUsers ?? 0,
            existingAdminUsers: raw.existingAdminUsers ?? raw.ExistingAdminUsers ?? 0,
            skippedUsers: raw.skippedUsers ?? raw.SkippedUsers ?? [],
            odemeBilgileriImported:
              raw.odemeBilgileriImported ?? raw.OdemeBilgileriImported ?? false,
          }
        : undefined;
      return { status: "ok", data };
    }

    const txt = await response.text().catch(() => "");
    if (response.status === 409) {
      return { status: "already_exists", message: txt || "Bu denetçi zaten aktarılmış." };
    }

    return {
      status: "error",
      message: txt || `Denetçi içe aktarma başarısız oldu (HTTP ${response.status}).`,
    };
  } catch (error: any) {
    return {
      status: "error",
      message: error?.message || "Denetçi içe aktarma sırasında bağlantı hatası oluştu.",
    };
  }
};

export const getOldDenetlenenForCurrentDenetci = async () => {
  try {
    const response = await apiFetch(`/DataTransfer/OldDenetlenen/ForCurrentDenetci`, {
      method: "GET",
      headers: { accept: "application/json" },
    });
    if (response.ok) {
      return response.json();
    } else {
      console.error("getOldDenetlenenForCurrentDenetci failed", response.status);
      return [];
    }
  } catch (error) {
    console.error("getOldDenetlenenForCurrentDenetci error:", error);
    return [];
  }
};

export const importDenetlenen = async (dto: any) => {
  try {
    const response = await apiFetch(`/DataTransfer/ImportDenetlenen`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dto),
    });
    if (response.ok) return true;
    const txt = await response.text();
    console.error("importDenetlenen failed", response.status, txt);
    return false;
  } catch (error) {
    console.error("importDenetlenen error:", error);
    return false;
  }
};
