import { apiFetch } from "@/api/apiBase";


export const getFisIslemSayilari = async (
  denetciId: number,
  denetlenenId: number,
  yil: number
) => {
  try {
    const response = await apiFetch(
      `/DenetimKanitlari/FisIslemSayilari?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}`,
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
      console.log("Fiş İşlem Sayıları getirilemedi");
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const createOrneklem = async (
  denetciId: number,
  yil: number,
  denetlenenId: number,
  guvenilirlikDuzeyi: number,
  hataPayi: number,
  listelemeTuru: string
) => {
  try {
    const response = await apiFetch(
      `/DenetimKanitlari/OrneklemHesapla?denetciId=${denetciId}&denetlenenId=${denetlenenId}&yil=${yil}&guvenilirlikDuzeyi=${guvenilirlikDuzeyi}&hataPayi=${hataPayi}&listelemeTuru=${listelemeTuru}`,
      {
        method: "POST",
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

export const getOrneklem = async (
  denetciId: number,
  denetlenenId: number,
  yil: number
) => {
  try {
    const response = await apiFetch(
      `/DenetimKanitlari/Orneklem?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}`,
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
      console.log("Örneklem getirilemedi");
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const getOrneklemByDipnot = async (
  denetciId: number,
  denetlenenId: number,
  yil: number,
  dipnot: string
) => {
  try {
    const response = await apiFetch(
      `/DenetimKanitlari/OrneklemByDipnot?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}&dipnot=${dipnot}`,
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
      console.log("Örneklem getirilemedi");
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const getOrneklemByDipnotTers = async (
  denetciId: number,
  denetlenenId: number,
  yil: number,
  dipnot: string
) => {
  try {
    const response = await apiFetch(
      `/DenetimKanitlari/OrneklemByDipnotTers?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}&dipnot=${dipnot}`,
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
      console.log("Örneklem getirilemedi");
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const updateOrneklem = async (json: any) => {
  try {
    const response = await apiFetch(`/DenetimKanitlari/Orneklem`, {
      method: "PUT",
      headers: {
        accept: "*/*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(json),
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

export const getOrneklemFisleri = async (
  denetciId: number,
  denetlenenId: number,
  yil: number,
  kebirKodu: number
) => {
  try {
    const response = await apiFetch(
      `/DenetimKanitlari/OrneklemFisleri?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}&kebirKodu=${kebirKodu}`,
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
      console.log("Örneklem Fişleri getirilemedi");
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const getOrneklemFisleriByList = async (
  denetciId: number,
  denetlenenId: number,
  yil: number,
  kebirKodu: number[]
) => {
  try {
    const response = await apiFetch(
      `/DenetimKanitlari/OrneklemFisleriByList?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}`,
      {
        method: "PUT",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(kebirKodu),
      }
    );
    if (response.ok) {
      return response.json();
    } else {
      console.log("Örneklem Fişleri getirilemedi");
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const getOrneklemFisleriDetay = async (
  denetciId: number,
  denetlenenId: number,
  yil: number,
  fisNo: number
) => {
  try {
    const response = await apiFetch(
      `/DenetimKanitlari/OrneklemFisleriDetay?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}&fisNo=${fisNo}`,
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
      console.log("Örneklem Fişleri Detay getirilemedi");
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const getOnemlilikSeviyesi = async (
  denetciId: number,
  denetlenenId: number,
  yil: number
) => {
  try {
    const response = await apiFetch(
      `/DenetimKanitlari/OnemlilikSeviyesi?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}`,
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
      console.log("Önemlilik Seviyesi getirilemedi");
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const createOnemlilik = async (
  denetciId: number,
  yil: number,
  denetlenenId: number
) => {
  try {
    const response = await apiFetch(
      `/DenetimKanitlari/Onemlilik?denetciId=${denetciId}&denetlenenId=${denetlenenId}&yil=${yil}`,
      {
        method: "POST",
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

export const getOnemlilik = async (
  denetciId: number,
  denetlenenId: number,
  yil: number
) => {
  try {
    const response = await apiFetch(
      `/DenetimKanitlari/Onemlilik?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}`,
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
      console.log("Önemlilik getirilemedi");
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const getOnemlilikByDipnot = async (
  denetciId: number,
  denetlenenId: number,
  yil: number,
  dipnot: string
) => {
  try {
    const response = await apiFetch(
      `/DenetimKanitlari/OnemlilikByDipnot?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}&dipnot=${dipnot}`,
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
      console.log("Önemlilik getirilemedi");
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const updateOnemlilik = async (
  denetciId: number,
  denetlenenId: number,
  yil: number,
  id: number,
  updatedOnemlilik: any
) => {
  try {
    const response = await apiFetch(
      `/DenetimKanitlari/Onemlilik?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}&id=${id}`,
      {
        method: "PUT",
        headers: {
          accept: "*/*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedOnemlilik),
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

export const createOnemlilikHesaplamaBazi = async (
  denetciId: number,
  yil: number,
  denetlenenId: number,
  json: any
) => {
  try {
    const response = await apiFetch(
      `/DenetimKanitlari/OnemlilikHesaplamaBazi?denetciId=${denetciId}&denetlenenId=${denetlenenId}&yil=${yil}`,
      {
        method: "POST",
        headers: {
          accept: "*/*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(json),
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

export const getOnemlilikHesaplamaBazi = async (
  denetciId: number,
  denetlenenId: number,
  yil: number
) => {
  try {
    const response = await apiFetch(
      `/DenetimKanitlari/OnemlilikHesaplamaBazi?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}`,
      {
        method: "GET",
        headers: {
          accept: "application/json",
        },
      }
    );
    if (response.status == 200) {
      return response.json();
    } else {
      console.log("Önemlilik Hesaplama Bazı getirilemedi");
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const updateOnemlilikHesaplamaBazi = async (
  json: any
) => {
  try {
    const response = await apiFetch(
      `/DenetimKanitlari/OnemlilikHesaplamaBazi`,
      {
        method: "PUT",
        headers: {
          accept: "*/*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(json),
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

export const getMutabakat = async (
  denetciId: number,
  yil: number,
  denetlenenId: number,
  grupKodu: string,
  hesapAdi: string
) => {
  try {
    const response = await apiFetch(
      `/DenetimKanitlari/Mutabakat?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}&grupKodu=${grupKodu}&hesapAdi=${hesapAdi}`,
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
      console.log("Mutabakat getirilemedi");
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const getMutabakatByDipnot = async (
  denetciId: number,
  yil: number,
  denetlenenId: number,
  dipnot: string
) => {
  try {
    const response = await apiFetch(
      `/DenetimKanitlari/MutabakatByDipnot?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}&dipnot=${dipnot}`,
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
      console.log("Mutabakat getirilemedi");
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const updateMutabakat = async (json: any) => {
  try {
    const response = await apiFetch(`/DenetimKanitlari/Mutabakat`, {
      method: "PUT",
      headers: {
        accept: "*/*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(json),
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

export const deleteMutabakat = async (
  denetciId: number,
  denetlenenId: number,
  yil: number
) => {
  try {
    const response = await apiFetch(
      `/DenetimKanitlari/Mutabakat?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}`,
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

export const getMutabakatDogrulamaMektubu = async (
  denetciId: number,
  denetlenenId: number,
  yil: number,
  detayKodu: string
) => {
  try {
    const response = await apiFetch(
      `/DenetimKanitlari/MutabakatDogrulamaMektubu?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}&detayKodu=${detayKodu}`,
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
      console.log("Mutabakat Dogrulama Mektubu getirilemedi");
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const getIliskiliTarafIncelemeHesaplari = async (
  denetciId: number,
  denetlenenId: number,
  yil: number
) => {
  try {
    const response = await apiFetch(
      `/DenetimKanitlari/IliskiliTarafIncelemeHesaplari?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}`,
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
      console.log("İlişkili Taraf İnceleme Hesapları getirilemedi");
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};
