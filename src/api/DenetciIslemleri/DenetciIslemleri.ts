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
