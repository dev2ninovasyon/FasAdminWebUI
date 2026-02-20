import { apiFetch } from "@/api/apiBase";

export interface DonusumKayitlariKontrolSatirDto {
    kebirKodu: string;
    vukBakiye: number;
    donusumBakiye: number;
    fark: number;
}

export interface DonusumBobiFisDto {
    hesapKodu: string;
    yevmiyeNo: number;
    hesapAdi: string;
    borc: number;
    alacak: number;
    aciklama: string;
}

export interface DonusumKayitlariResponse {
    dipnotNo: string;
    cariYil: number;
    oncekiYil: number;
    denetlenenId: number;
    denetciId: number;
    formKodu: string;
    dipnotAdi: string;
    kayitlar: DonusumKayitlariKontrolSatirDto[];
    donusumFisler: DonusumBobiFisDto[];
}

export async function getDonusumKayitlari(
    controller: string,
    denetciId: number,
    denetlenenId: number,
    yil: number,
    dipnotNo: string
) {
    try {
        const response = await apiFetch(
            `/${controller}/GetByDenetlenenMvc?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}&dn=${dipnotNo}`,
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
    } catch (error) {
        console.log("Error fetching data:", error);
        return null;
    }
}
