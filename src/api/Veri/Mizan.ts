import { apiFetch } from "@/api/apiBase";


export const getMizanVerileri = async (
  denetciId: number,
  denetlenenId: number,
  yil: number,
  type: string
) => {
  try {
    const response = await apiFetch(
      `/Mizan/Mizan?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}&tip=${type}`,
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
      console.log("E Defter Mizan verileri getirilemedi");
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const getMizanVerileriByHesapNo = async (
  denetciId: number,
  denetlenenId: number,
  yil: number,
  type: string,
  hesapNo: string
) => {
  try {
    const response = await apiFetch(
      `/Mizan/MizanByHesapNo?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}&tip=${type}&hesapNo=${hesapNo}`,
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
      console.log("Mizan verileri getirilemedi");
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const getKurumlarVergisiBeyannamesiKarsilastirma = async (
  denetciId: number,
  denetlenenId: number,
  yil: number,
  type: string
) => {
  try {
    const response = await apiFetch(
      `/Mizan/KurumlarBeyannamesiKarsilastirma?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}&tip=${type}`,
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
      console.log("E Defter Mizan verileri getirilemedi");
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const getKurumlarVergisiBeyannamesiKarsilastirmaHaric = async (
  denetciId: number,
  denetlenenId: number,
  yil: number,
  type: string
) => {
  try {
    const response = await apiFetch(
      `/Mizan/KurumlarBeyannamesiKarsilastirmaHaric?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}&tip=${type}`,
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
      console.log("E Defter Mizan verileri getirilemedi");
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const getProgramVukMizan = async (
  denetciId: number,
  denetlenenId: number,
  yil: number,
  type: string
) => {
  try {
    const response = await apiFetch(
      `/Mizan/ProgramVukMizan?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}&tip=${type}`,
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
      console.log("Program Vuk Mizan verileri getirilemedi");
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const getGenelHesapPlani = async (tip: string) => {
  try {
    const response = await apiFetch(`/Mizan/GenelHesapPlani?tip=${tip}`, {
      method: "GET",
      headers: {
        accept: "application/json",
      },
    });
    if (response.ok) {
      return response.json();
    } else {
      console.log("Genel Hesap Planı verileri getirilemedi");
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const getProgramVukMizanWithoutType = async (
  denetciId: number,
  denetlenenId: number,
  yil: number
) => {
  try {
    const response = await apiFetch(
      `/Mizan/ProgramVukMizanWithoutType?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}`,
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
      console.log("Program Vuk Mizan verileri getirilemedi");
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const getProgramVukMizanControl = async (
  denetciId: number,
  denetlenenId: number,
  yil: number,
  type: string
) => {
  try {
    const response = await apiFetch(
      `/Mizan/ProgramVukMizanKontrol?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}&tip=${type}`,
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
      console.log("Program Vuk Mizan Kontrol getirilemedi");
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const createAnaHesapMizan = async (
  denetciId: number,
  yil: number,
  denetlenenId: number,
  mizanbaslangicTarihi: string,
  mizanBitisTarihi: string
) => {
  try {
    const response = await apiFetch(
      `/Mizan/AnaHesapMizanOlustur?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}&baslangicTarihi=${mizanbaslangicTarihi}&bitisTarihi=${mizanBitisTarihi}`,
      {
        method: "POST",
        headers: {
          accept: "application/json",
        },
      }
    );
    if (response.ok) {
      return response.json();
    } else {
      console.log("Ana Hesap Mizan oluşturulamadı");
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const createAnaHesapMizanHaric = async (
  denetciId: number,
  yil: number,
  denetlenenId: number,
  mizanbaslangicTarihi: string,
  mizanBitisTarihi: string
) => {
  try {
    const response = await apiFetch(
      `/Mizan/AnaHesapMizanOlusturHaric?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}&baslangicTarihi=${mizanbaslangicTarihi}&bitisTarihi=${mizanBitisTarihi}`,
      {
        method: "POST",
        headers: {
          accept: "application/json",
        },
      }
    );
    if (response.ok) {
      return response.json();
    } else {
      console.log("Ana Hesap Mizan oluşturulamadı");
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const createDetayHesapMizan = async (
  denetciId: number,
  yil: number,
  denetlenenId: number,
  mizanbaslangicTarihi: string,
  mizanBitisTarihi: string
) => {
  try {
    const response = await apiFetch(
      `/Mizan/DetayHesapMizanOlustur?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}&baslangicTarihi=${mizanbaslangicTarihi}&bitisTarihi=${mizanBitisTarihi}`,
      {
        method: "POST",
        headers: {
          accept: "application/json",
        },
      }
    );
    if (response.ok) {
      return response.json();
    } else {
      console.log("Detay Hesap Mizan oluşturulamadı");
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const createDetayHesapMizanHaric = async (
  denetciId: number,
  yil: number,
  denetlenenId: number,
  mizanbaslangicTarihi: string,
  mizanBitisTarihi: string
) => {
  try {
    const response = await apiFetch(
      `/Mizan/DetayHesapMizanOlusturHaric?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}&baslangicTarihi=${mizanbaslangicTarihi}&bitisTarihi=${mizanBitisTarihi}`,
      {
        method: "POST",
        headers: {
          accept: "application/json",
        },
      }
    );
    if (response.ok) {
      return response.json();
    } else {
      console.log("Detay Hesap Mizan oluşturulamadı");
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const createVukMizan = async (
  denetciId: number,
  yil: number,
  denetlenenId: number,
  mizanbaslangicTarihi: string,
  mizanBitisTarihi: string
) => {
  try {
    const response = await apiFetch(
      `/Mizan/VukMizanOlustur?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}&baslangicTarihi=${mizanbaslangicTarihi}&bitisTarihi=${mizanBitisTarihi}`,
      {
        method: "POST",
        headers: {
          accept: "application/json",
        },
      }
    );
    if (response.ok) {
      return response.json();
    } else {
      console.log("Vuk Mizan oluşturulamadı");
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const createProgramVukMizan = async (
  denetciId: number,
  yil: number,
  denetlenenId: number,
  type: string
) => {
  try {
    const response = await apiFetch(
      `/Mizan/ProgramVukMizan?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}&tip=${type}`,
      {
        method: "POST",
        headers: {
          accept: "application/json",
        },
      }
    );
    if (response.ok) {
      return response.json();
    } else {
      console.log("Program Vuk Mizan oluşturulamadı");
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const getMizanBilgileri = async (
  denetciId: number,
  denetlenenId: number,
  yil: number,
  type: string
) => {
  try {
    const response = await apiFetch(
      `/Mizan/MizanIslemLoglari?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}&tip=${type}`,
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
      console.log("Mizan Bilgileri getirilemedi");
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const deleteMizanBilgisiMultiple = async (
  selected: any
) => {
  try {
    const response = await apiFetch(`/Mizan/MizanIslemLoglari`, {
      method: "DELETE",
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(selected),
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
