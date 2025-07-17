import { url } from "@/api/apiBase";

export const getDosya = async (token: string) => {
  try {
    const response = await fetch(`${url}/DenetimDosyaBelgeleri/Hepsi`, {
      method: "GET",
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
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
    const response = await fetch(`${url}/DenetimDosyaBelgeleri/${id}`, {
      method: "GET",
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
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
    const response = await fetch(`${url}/DenetimDosyaBelgeleri`, {
      method: "POST",
      headers: {
        accept: "*/*",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(createdDosya),
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

export const updateDosya = async (
  token: string,
  id: any,
  updatedDosya: any
) => {
  try {
    const response = await fetch(`${url}/DenetimDosyaBelgeleri/${id}`, {
      method: "PUT",
      headers: {
        accept: "*/*",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updatedDosya),
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
