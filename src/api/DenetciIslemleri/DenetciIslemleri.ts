import { url } from "@/api/apiBase";

export const getDenetciler = async (token: string) => {
  try {
    const response = await fetch(`${url}/Denetci/Hepsi`, {
      method: "GET",
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.ok) {
      return response.json();
    } else {
      console.error("Denetciler getirilemedi");
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};

export const getDenetciById = async (token: string, id: any) => {
  try {
    const response = await fetch(`${url}/Denetci/${id}`, {
      method: "GET",
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.ok) {
      return response.json();
    } else {
      console.error("Denetci getirilemedi");
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};

export const createDenetci = async (token: string, createdDenetci: any) => {
  try {
    const response = await fetch(`${url}/Denetci`, {
      method: "POST",
      headers: {
        accept: "*/*",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(createdDenetci),
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

export const createKullanici = async (token: string, createdKullanici: any) => {
  try {
    const response = await fetch(`${url}/Kullanici/AnaKullanici`, {
      method: "POST",
      headers: {
        accept: "*/*",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(createdKullanici),
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

export const updateDenetci = async (
  token: string,
  id: any,
  updatedDenetci: any
) => {
  try {
    const response = await fetch(`${url}/Denetci/${id}`, {
      method: "PUT",
      headers: {
        accept: "*/*",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updatedDenetci),
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

export const deleteDenetciById = async (token: string, id: number) => {
  try {
    const response = await fetch(`${url}/Denetci/${id}`, {
      method: "DELETE",
      headers: {
        accept: "application/json",
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

export const getDenetciOdemeBilgileri = async (
  token: string,
  denetciId: any
) => {
  try {
    const response = await fetch(`${url}/Denetci/OdemeBilgileri/${denetciId}`, {
      method: "GET",
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.ok) {
      return response.json();
    } else {
      console.error("Denetci Ödeme Bilgileri getirilemedi");
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};

export const updateDenetciOdemeBilgileri = async (
  token: string,
  denetciId: any,
  updatedDenetciOdemeBilgileri: any
) => {
  try {
    const response = await fetch(`${url}/Denetci/OdemeBilgileri/${denetciId}`, {
      method: "PUT",
      headers: {
        accept: "*/*",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updatedDenetciOdemeBilgileri),
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

export const getDenetciKotaGecmisi = async (token: string, denetciId: any) => {
  try {
    const response = await fetch(`${url}/Denetci/KotaGecmisi/${denetciId}`, {
      method: "GET",
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.ok) {
      return response.json();
    } else {
      console.error("Denetci Kota Geçmişi getirilemedi");
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};
