import { apiFetch } from "@/api/apiBase";


export const getDonemDonusumDuzeltmeBelgesiVerisi
  = async (
    denetciId: number,
    denetlenenId: number,
    yil: number,
    konsolidasyonMu: boolean
  ) => {
    try {
      const response = await apiFetch(
        `/Donusum/DonusumFisleri?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}&konsolidasyonMu=${konsolidasyonMu}`,
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
        console.log("Fiş İşlemleri verileri getirilemedi");
      }
    } catch (error) {
      console.log("Bir hata oluştu:", error);
    }
  };

export const getDonemDonusumDuzeltmeBelgesiVerisiByFisNo = async (
  denetciId: number,
  denetlenenId: number,
  yil: number,
  fisNo: number,
  konsolidasyonMu: boolean
) => {
  try {
    const response = await apiFetch(
      `/Donusum/DonusumFisleriByFisNo?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}&fisNo=${fisNo}&konsolidasyonMu=${konsolidasyonMu}`,
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
      console.log("Fiş Detayları verileri getirilemedi");
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

