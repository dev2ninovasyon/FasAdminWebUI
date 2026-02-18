import { apiFetch } from "@/api/apiBase";

export const getDosyaBilgileri = async (
  token: string,
  denetciId: number,
  yil: number,
  denetlenenId: number,
  tip: string
) => {
  try {
    const response = await apiFetch(
      `/Veri/DosyaBilgileri?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}&tip=${tip}`,
      {
        method: "GET",
        token: token
      }
    );
    if (response.ok) {
      return response.json();
    } else {
      console.error(
        `Dosya Bilgileri getirilemedi. Status: ${response.status} ${response.statusText}`
      );
      try {
        const errorBody = await response.text();
        console.error("Error body:", errorBody);
      } catch (e) {
        console.error("Could not read error body");
      }
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};

export const getGenelHesapPlani = async (token: string, tip: string) => {
  try {
    const response = await apiFetch(`/Mizan/GenelHesapPlani?tip=${tip}`, {
      method: "GET",
      token: token
    });
    if (response.ok) {
      return response.json();
    } else {
      console.error("Genel Hesap Planı getirilemedi");
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};

export const updateGenelHesapPlaniVerisi = async (
  token: string,
  id: number,
  updatedGenelHesapPlani: any
) => {
  try {
    const response = await apiFetch(`/Mizan/GenelHesapPlani?id=${id}`, {
      method: "PUT",
      token: token,
      body: JSON.stringify(updatedGenelHesapPlani),
    });

    return response.ok;
  } catch (error) {
    console.error("Bir hata oluştu:", error);
    return false;
  }
};

export const deleteDosyaBilgileri = async (token: string, selected: any) => {
  try {
    const response = await apiFetch(
      `/Veri/DosyaBilgileri`, // Varsayılan silme endpoint'i eksikti, orjinal kodda da bozuktu (sadece `${url}` vardı)
      {
        method: "DELETE",
        token: token,
        body: JSON.stringify(selected),
      }
    );

    return response.ok;
  } catch (error) {
    console.error("Bir hata oluştu:", error);
    return false;
  }
};
