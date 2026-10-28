import { apiFetch } from "@/api/apiBase";


export const getDonusturulmusMizanVerileriByDenetciDenetlenenYil = async (
  denetciId: number,
  denetlenenId: number,
  yil: number
) => {
  try {
    const response = await apiFetch(
      `/Veri/DonusturulmusMizan?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}`,
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
      console.log("Dönüştürülmüş Mizan verileri getirilemedi");
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const createDonusturulmusMizanVerisi = async (
  jsonData: any
) => {
  try {
    const response = await apiFetch(`/Veri/DonusturulmusMizan`, {
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

export const deleteDonusturulmusMizanVerisi = async (
  denetciId: number,
  denetlenenId: number,
  yil: number
) => {
  try {
    const response = await apiFetch(
      `/Veri/DonusturulmusMizan?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}`,
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
