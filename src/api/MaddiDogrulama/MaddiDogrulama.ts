import { apiFetch } from "@/api/apiBase";


export const getMaddiDogrulama = async (
  denetimTuru: string,
  denetlenenId: number,
  yil: number
) => {
  try {
    let tfrsmi = denetimTuru == "Tfrs" ? true : false;
    let bobimi = denetimTuru == "Bobi" ? true : false;

    const response = await apiFetch(
      `/DenetimDosyaBelgeleri/MaddiDogrulamaListe?tfrsmi=${tfrsmi}&bobimi=${bobimi}&denetlenenId=${denetlenenId}&yil=${yil}`,
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
      console.log("Verileri getirilemedi");
      return null; // Hata durumunda null döndürüyoruz
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
    return null; // Hata durumunda null döndürüyoruz
  }
};

export const getUygulananDenetimProsedurleri = async (
  denetciId: number,
  denetlenenId: number,
  yil: number,
  dipnotAdi: string,
  tfrsmi: boolean
) => {
  try {
    const response = await apiFetch(
      `/UygulananDenetimProsedurleri?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}&dipnotAdi=${dipnotAdi}&tfrsmi=${tfrsmi}`,
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
      console.log("Çalışma kağıdı verileri getirilemedi");
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};
export const getDipnotNoByDipnotAdi = async (
  denetciId: number,
  denetlenenId: number,
  yil: number,
  dipnotAdi: string,
  tfrsmi: boolean
): Promise<string> => {
  try {
    const response = await apiFetch(
      `/DenetimDosyaBelgeleri/DipnotNoByDipnotAdi?denetciId=${denetciId}` +
      `&yil=${yil}` +
      `&denetlenenId=${denetlenenId}` +
      `&dipnotAdi=${encodeURIComponent(dipnotAdi)}` +
      `&tfrsmi=${tfrsmi}`,
      {
        method: "GET",
        headers: {
          accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      console.log("DipnotNo getirilemedi:", response.status);
      return "";
    }
    const data = (await response.json()) as { dipnotNo?: string };
    console.log(data);

    return (data?.dipnotNo ?? "").trim();
  } catch (error) {
    console.log("Bir hata oluştu:", error);
    return "";
  }
};

export const createCalismaKagidiVerisi = async (
  createdCalismaKagidiVerisi: any
) => {
  try {
    const response = await apiFetch(`/UygulananDenetimProsedurleri`, {
      method: "POST",
      headers: {
        accept: "*/*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(createdCalismaKagidiVerisi),
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

export const updateCalismaKagidiVerisi = async (
  id: any,
  updatedCalismaKagidiVerisi: any
) => {
  try {
    const response = await apiFetch(`/UygulananDenetimProsedurleri/${id}`, {
      method: "PUT",
      headers: {
        accept: "*/*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedCalismaKagidiVerisi),
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

export const deleteCalismaKagidiVerisiById = async (id: any) => {
  try {
    const response = await apiFetch(`/UygulananDenetimProsedurleri/${id}`, {
      method: "DELETE",
      headers: {
        accept: "application/json",
      },
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

export const deleteAllCalismaKagidiVerileri = async (
  denetciId: number,
  denetlenenId: number,
  yil: number,
  dipnotAdi: string,
  tfrsmi: boolean
) => {
  try {
    const response = await apiFetch(
      `/UygulananDenetimProsedurleri?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}&dipnotAdi=${dipnotAdi}&tfrsmi=${tfrsmi}`,
      {
        method: "DELETE",
        headers: {
          accept: "application/json",
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
