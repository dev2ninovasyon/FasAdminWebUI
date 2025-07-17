import { url } from "@/api/apiBase";

export const getDovizKurlariOtuzBirAralik = async (token: string) => {
  try {
    const response = await fetch(`${url}/Evds/DovizKurlariOtuzBirAralik`, {
      method: "GET",
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
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
    const response = await fetch(`${url}/Evds/DovizKurlariOtuzAralik`, {
      method: "GET",
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
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
    const response = await fetch(`${url}/Evds/DovizKurlari`, {
      method: "POST",
      headers: {
        accept: "*/*",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
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
