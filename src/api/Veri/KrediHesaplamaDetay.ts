import { apiFetch } from "@/api/apiBase";


export const getKrediHesaplamaDetayVerileriByDenetciDenetlenenYil = async (
  denetciId: number,
  denetlenenId: number,
  yil: number,
  krediId: number
) => {
  try {
    const response = await apiFetch(
      `/Veri/KrediHesaplamaDetay?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}&krediId=${krediId}`,
      {
        method: "GET",
        headers: {
          accept: "application/json",
        },
      }
    );
    if (response.ok) {
      return response.json();
    } else {
      console.log("Kredi Hesaplama verileri getirilemedi");
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const createKrediHesaplamaDetayVerisi = async (
  jsonData: any
) => {
  try {
    const response = await apiFetch(`/Veri/KrediHesaplamaDetay`, {
      method: "POST",
      headers: {
        accept: "*/*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(jsonData),
    });

    if (response.ok) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const deleteKrediHesaplamaDetayVerisi = async (
  denetciId: number,
  denetlenenId: number,
  yil: number,
  krediId: number
) => {
  try {
    const response = await apiFetch(
      `/Veri/KrediHesaplamaDetay?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}&krediId=${krediId}`,
      {
        method: "DELETE",
        headers: {
          accept: "*/*",
          "Content-Type": "application/json",
        },
      }
    );

    if (response.ok) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};
