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

export const getOldDbDenetciler = async (token?: string) => {
  try {
    const endpoint = `/DataTransfer/Denetciler`;
    console.log("🔄 getOldDbDenetciler: Request başlatılıyor");
    console.log("   Endpoint:", endpoint);
    console.log("   Full URL will be constructed by apiFetch");
    const response = await apiFetch(`/DataTransfer/Denetciler`, {
      method: "GET",
      includeCredentials: false, // ✅ Public endpoint - don't send auth credentials
    });

    console.log("📊 getOldDbDenetciler: Response status:", response.status, response.statusText);

    if (response.ok) {
      const data = await response.json();
      console.log("✅ getOldDbDenetciler: Veri başarıyla alındı, count:", data?.length || 0);
      console.log("📋 getOldDbDenetciler: Raw data sample:", data?.[0]);

      // ✅ Property naming: Backend PascalCase döndürüyor, frontend camelCase bekliyor
      if (Array.isArray(data)) {
        const mappedData = data.map((item: any) => ({
          id: item.id,
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
          aktifmi: item.aktifmi !== undefined ? item.aktifmi : item.Aktifmi,
          ...item
        }));
        console.log("✅ getOldDbDenetciler: Mapped data sample:", mappedData?.[0]);
        return mappedData;
      }
      return data;
    } else {
      const errorText = await response.text();
      console.error("❌ getOldDbDenetciler: HTTP error", response.status, errorText);
      return [];
    }
  } catch (error: any) {
    console.error("❌ getOldDbDenetciler: Exception error:", {
      message: error?.message,
      stack: error?.stack,
      name: error?.name
    });
    return [];
  }
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

export const createKullanici = async (token: string, createdKullanici: any) => {
  try {
    const response = await apiFetch(`/Kullanici/AnaKullanici`, {
      method: "POST",
      token: token,
      body: JSON.stringify(createdKullanici),
    });

    return response.ok;
  } catch (error) {
    console.error("Bir hata oluştu:", error);
    return false;
  }
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

export const importDenetci = async (token: string, denetci: any) => {
  try {
    const response = await apiFetch(`/DataTransfer/ImportDenetci`, {
      method: "POST",
      token: token,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(denetci),
    });

    if (response.ok) return true;
    const txt = await response.text();
    console.error("importDenetci failed", response.status, txt);
    return false;
  } catch (error) {
    console.error("importDenetci error:", error);
    return false;
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
