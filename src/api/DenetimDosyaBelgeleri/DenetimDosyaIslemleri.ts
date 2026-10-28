import { apiFetch } from "@/api/apiBase";

export const getDosya = async (token: string) => {
  try {
    const response = await apiFetch(`/DenetimDosyaBelgeleri/Hepsi`, {
      method: "GET",
      token: token
    });
    if (response.ok) {
      return response.json();
    } else {
      console.error("Denetim Dosya Belgeleri getirilemedi");
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};

export const getDosyaById = async (token: string, id: any) => {
  try {
    const response = await apiFetch(`/DenetimDosyaBelgeleri/${id}`, {
      method: "GET",
      token: token
    });
    if (response.ok) {
      return response.json();
    } else {
      console.error("Denetim Dosya Belgelesi getirilemedi");
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};

export const createDosya = async (token: string, createdDosya: any) => {
  try {
    const response = await apiFetch(`/DenetimDosyaBelgeleri`, {
      method: "POST",
      token: token,
      body: JSON.stringify(createdDosya),
    });

    return response.ok;
  } catch (error) {
    console.error("Bir hata oluştu:", error);
    return false;
  }
};

export const updateDosya = async (
  token: string,
  id: any,
  updatedDosya: any
) => {
  try {
    const response = await apiFetch(`/DenetimDosyaBelgeleri/${id}`, {
      method: "PUT",
      token: token,
      body: JSON.stringify(updatedDosya),
    });

    return response.ok;
  } catch (error) {
    console.error("Bir hata oluştu:", error);
    return false;
  }
};
