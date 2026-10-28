import { apiFetch } from "@/api/apiBase";

export interface DavaKarsiliklariSatir {
    id: number;
    denetciId: number;
    denetlenenId: number;
    yil: number;
    aleyhteDavacininLehteDavalininUnvani: string;
    aleyhteLehte: string;
    davaKonusu: string;
    davaYili: number;
    mahkemeAsamasi: string;
    varsaYerelMahkemeKarari: string;
    durusmaAsamasi: string;
    muhtemelDeger: number;
    aleyhteKaybetmeLehteKazanmaIhtimali: string;
    ongorulenSonuclanmaSuresi: string;
    denetcininVardigiSonuc: string;
    sonucunTutari: number;
}

export interface DavaKarsiliklariSummary {
    hesaplananToplamAyrilacakDavaKarsiliklariSayisi: number;
    hesaplananToplamAyrilacakDavaKarsiliklariTutari: number;
    hesaplananToplamKosulluDavaBorclariSayisi: number;
    hesaplananToplamKosulluDavaBorclariTutari: number;
    hesaplananToplamKosulluDavaAlacaklariSayisi: number;
    hesaplananToplamKosulluDavaAlacaklariTutari: number;
    uzmanGorusuGerektirenlerSayisi: number;
    uzmanGorusuGerektirenlerTutari: number;
}

export interface DavaKarsiliklariResponse {
    liste: DavaKarsiliklariSatir[];
    ozet: DavaKarsiliklariSummary;
}

export const getDavaKarsiliklariData = async (
    denetciId: number,
    yil: number,
    denetlenenId: number
): Promise<DavaKarsiliklariResponse> => {
    const response = await apiFetch(
        `/DavaKarsiliklari/GetByDenetlenen?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}`,
        {
            method: "GET",
            headers: {
                accept: "application/json",
            }
        }
    );

    if (!response.ok) {
        throw new Error("Dava karşılıkları verileri yüklenirken bir hata oluştu.");
    }

    return response.json();
};

export const updateDavaKarsiliklari = async (data: DavaKarsiliklariSatir[]) => {
    const response = await apiFetch(`/DavaKarsiliklari`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        throw new Error("Güncelleme işlemi başarısız oldu.");
    }

    return response.json();
};

export const varsayilanaDonDavaKarsiliklari = async (denetciId: number, yil: number, denetlenenId: number) => {
    const response = await apiFetch(`/DavaKarsiliklari/VarsayilanaDon?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}`, {
        method: "DELETE",
        headers: {
            // Authorization removed
        }
    });

    if (!response.ok) {
        throw new Error("Varsayılana dönme işlemi başarısız oldu.");
    }

    return response.json();
};
