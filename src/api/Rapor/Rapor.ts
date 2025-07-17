import { url } from "@/api/apiBase";

export const getRaporDipnot = async (token: string, denetimTuru: string) => {
  try {
    const response = await fetch(
      `${url}/Rapor/RaporDipnotStandart?tur=${denetimTuru}`,
      {
        method: "GET",
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
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
    const response = await fetch(
      `${url}/Rapor/FaaliyetRaporDipnotStandart?tur=${denetimTuru}`,
      {
        method: "GET",
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
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
    const response = await fetch(`${url}/Rapor/RaporDipnot`, {
      method: "PUT",
      headers: {
        accept: "*/*",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updatedRaporDipnot),
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

export const getRaporGorusStandart = async (
  token: string,
  denetimTuru: string
) => {
  try {
    const response = await fetch(
      `${url}/Rapor/RaporGorusStandart?tur=${denetimTuru}`,
      {
        method: "GET",
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
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
    const response = await fetch(`${url}/Rapor/RaporGorus`, {
      method: "PUT",
      headers: {
        accept: "*/*",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updatedRaporGorus),
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
