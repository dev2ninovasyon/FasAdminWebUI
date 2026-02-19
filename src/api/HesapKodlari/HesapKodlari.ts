import { apiFetch } from "@/api/apiBase";

export const getHesapKodlari = async (token: string) => {
  try {
    const response = await apiFetch(`/Donusum/HesapKodlari`, {
      method: "GET",
      token: token
    });
    if (response.ok) {
      return response.json();
    } else {
      console.error("Hesap Kodları getirilemedi");
      return [];
    }
  } catch (error) {
    return [];
  }
};

export const updateHesapKodlari = async (
  token: string,
  updatedHesapKodlari: any
) => {
  try {
    const response = await apiFetch(`/Donusum/HesapKodlari`, {
      method: "PUT",
      token: token,
      body: JSON.stringify(updatedHesapKodlari),
    });

    return response.ok;
  } catch (error) {
    console.error("Bir hata oluştu:", error);
    return false;
  }
};

