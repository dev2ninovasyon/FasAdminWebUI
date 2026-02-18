import { apiFetch } from "@/api/apiBase";

export const getRaporDipnot = async (token: string, denetimTuru: string) => {
  try {
    const response = await apiFetch(`/Rapor/RaporDipnotStandart?tur=${denetimTuru}`, {
      method: "GET",
      token: token
    });
    if (response.ok) {
      return response.json();
    } else {
      console.error("Dipnot verileri getirilemedi");
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};

export const getFaaliyetRaporDipnot = async (
  token: string,
  denetimTuru: string
) => {
  try {
    const response = await apiFetch(`/Rapor/FaaliyetRaporDipnotStandart?tur=${denetimTuru}`, {
      method: "GET",
      token: token
    });
    if (response.ok) {
      return response.json();
    } else {
      console.error("Dipnot verileri getirilemedi");
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};

export const updateRaporDipnot = async (
  token: string,
  updatedRaporDipnot: any
) => {
  try {
    const response = await apiFetch(`/Rapor/RaporDipnot`, {
      method: "PUT",
      token: token,
      body: JSON.stringify(updatedRaporDipnot),
    });

    return response.ok;
  } catch (error) {
    console.error("Bir hata oluştu:", error);
    return false;
  }
};

export const getRaporGorusStandart = async (
  token: string,
  denetimTuru: string
) => {
  try {
    const response = await apiFetch(`/Rapor/RaporGorusStandart?tur=${denetimTuru}`, {
      method: "GET",
      token: token
    });
    if (response.ok) {
      return response.json();
    } else {
      console.error("Görüş verileri getirilemedi");
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};

export const updateRaporGorus = async (
  token: string,
  updatedRaporGorus: any
) => {
  try {
    const response = await apiFetch(`/Rapor/RaporGorus`, {
      method: "PUT",
      token: token,
      body: JSON.stringify(updatedRaporGorus),
    });

    return response.ok;
  } catch (error) {
    console.error("Bir hata oluştu:", error);
    return false;
  }
};
