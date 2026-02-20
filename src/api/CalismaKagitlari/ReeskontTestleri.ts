import { apiFetch } from "@/api/apiBase";

export interface ReeskontTestleriData {
    dipnotNo: string;
    cariYil: number;
    oncekiYil: number;
    dipnotAdi: string;
    hesaplamaKayitlari: any[];
    farklarKayitlari: any[];
    degerlerKayitlari: any[];
    donusumMizanBobi: any[];
    vukMizanKayitlari: any[];
    cekSenetReeskontKayitlari: any[];
    reeskontFaizLiborOranlari: any;
    referansTablosuListesi: any[];
}

export async function getReeskontTestleri(
    controller: string,
    denetciId: number,
    yil: number,
    denetlenenId: number,
    dipnotNo: string,
    modelAdi: string
) {

    const response = await apiFetch(
        `/${controller}/GetReeskontTestleri?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}&dipnotNo=${encodeURIComponent(dipnotNo)}&modelAdi=${encodeURIComponent(modelAdi)}`,
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
        console.log("Veriler getirilemedi");
        return null;
    }
}
