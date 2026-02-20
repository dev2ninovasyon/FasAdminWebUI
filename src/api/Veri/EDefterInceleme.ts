import { apiFetch } from "@/api/apiBase";


export const getEDefterIncelemeVerileri = async (
  denetciId: number,
  denetlenenId: number,
  yil: number,
  hesapNo: string,
  baslangicTarihi: string,
  bitisTarihi: string
) => {
  try {
    const response = await apiFetch(
      `/Veri/EDefterInceleme?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}&hesapNo=${hesapNo}&baslangicTarihi=${baslangicTarihi}&bitisTarihi=${bitisTarihi}`,
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
      console.log("E-Defter İnceleme verileri getirilemedi");
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const getEDefterIncelemeVerileriPaged = async (
  denetciId: number,
  denetlenenId: number,
  yil: number,
  hesapNo: string,
  baslangicTarihi: string,
  bitisTarihi: string,
  hesaplar?: string,
  iliskilihesaplar?: string,
  yevmiyeNolar?: string,
  haricYevmiyeNo?: string,
  borcTutarindanFazla?: number,
  alacakTutarindanFazla?: number,
  aciklama?: string,
  pageNumber: number = 1,
  pageSize: number = 50
) => {
  try {
    const response = await apiFetch(
      `/Veri/EDefterIncelemePaged?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}&hesapNo=${encodeURIComponent(hesapNo)}&baslangicTarihi=${encodeURIComponent(baslangicTarihi)}&bitisTarihi=${encodeURIComponent(bitisTarihi)}${hesaplar ? `&hesaplar=${encodeURIComponent(hesaplar)}` : ""}${iliskilihesaplar ? `&iliskilihesaplar=${encodeURIComponent(iliskilihesaplar)}` : ""}${yevmiyeNolar ? `&yevmiyeNolar=${encodeURIComponent(yevmiyeNolar)}` : ""}${haricYevmiyeNo ? `&haricYevmiyeNo=${encodeURIComponent(haricYevmiyeNo)}` : ""}${borcTutarindanFazla ? `&borcTutarindanFazla=${borcTutarindanFazla}` : ""}${alacakTutarindanFazla ? `&alacakTutarindanFazla=${alacakTutarindanFazla}` : ""}${aciklama ? `&aciklama=${encodeURIComponent(aciklama)}` : ""}&pageNumber=${pageNumber}&pageSize=${pageSize}`,
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
      console.log("E-Defter İnceleme paginated verileri getirilemedi");
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const updateEDefterIncelemeVerisi = async (
  denetciId: number,
  denetlenenId: number,
  yil: number,
  id: string,
  updatedEDefterInceleme: any
) => {
  try {
    const response = await apiFetch(
      `/Veri/EDefterInceleme?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}&id=${id}`,
      {
        method: "PUT",
        headers: {
          accept: "*/*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedEDefterInceleme),
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

export const updateEDefterIncelemeListeVerisi = async (
  denetciId: number,
  denetlenenId: number,
  yil: number,
  ids: string[],
  updatedEDefterInceleme: any
) => {
  try {
    const response = await apiFetch(
      `/Veri/EDefterIncelemeListe?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}&ids=${ids}`,
      {
        method: "PUT",
        headers: {
          accept: "*/*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedEDefterInceleme),
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

export const getEDefterIncelemeVerileriByFisNo = async (
  denetciId: number,
  denetlenenId: number,
  yil: number,
  fisNo: number
) => {
  try {
    const response = await apiFetch(
      `/Veri/EDefterIncelemeByFisNo?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}&fisNo=${fisNo}`,
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
