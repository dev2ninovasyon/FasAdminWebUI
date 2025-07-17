import { url } from "@/api/apiBase";

export const getHesapKodlari = async (token: string) => {
  try {
    const response = await fetch(`${url}/Donusum/HesapKodlari`, {
      method: "GET",
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.ok) {
      return response.json();
    } else {
      console.error("Hesap Kodları getirilemedi");
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};

export const updateHesapKodlari = async (
  token: string,
  updatedHesapKodlari: any
) => {
  try {
    const response = await fetch(`${url}/Donusum/HesapKodlari`, {
      method: "PUT",
      headers: {
        accept: "*/*",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updatedHesapKodlari),
    });

    if (response.ok) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};
