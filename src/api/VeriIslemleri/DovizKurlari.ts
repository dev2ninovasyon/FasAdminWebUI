import { apiFetch } from "@/api/apiBase";

export const getDovizKurlariOtuzBirAralik = async (token: string) => {
  try {
    const response = await apiFetch(`/Evds/DovizKurlariOtuzBirAralik`, {
      method: "GET",
      token: token
    });
    if (response.ok) {
      return response.json();
    } else {
      console.error("31 Aralık verileri getirilemedi");
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};

export const getDovizKurlariOtuzAralik = async (token: string) => {
  try {
    const response = await apiFetch(`/Evds/DovizKurlariOtuzAralik`, {
      method: "GET",
      token: token
    });
    if (response.ok) {
      return response.json();
    } else {
      console.error("30 Aralık verileri getirilemedi");
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};

export const createDovizKurlari = async (token: string) => {
  try {
    const response = await apiFetch(`/Evds/DovizKurlari`, {
      method: "POST",
      token: token
    });

    return response.ok;
  } catch (error) {
    console.error("Bir hata oluştu:", error);
    return false;
  }
};
