import { apiFetch } from "@/api/apiBase";

export const getDavaKarsiliklariVerileriByDenetciDenetlenenYil = async (
  denetciId: number,
  denetlenenId: number,
  yil: number
) => {
  try {
    const response = await apiFetch(
      `/Veri/DavaKarsiliklari?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}`,
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
      console.log("Dava Karşılıkları verileri getirilemedi");
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const createDavaKarsiliklariVerisi = async (
  jsonData: any
) => {
  try {
    const response = await apiFetch(`/Veri/DavaKarsiliklari`, {
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

export const deleteDavaKarsiliklariVerisi = async (
  denetciId: number,
  denetlenenId: number,
  yil: number
) => {
  try {
    const response = await apiFetch(
      `/Veri/DavaKarsiliklari?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}`,
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
