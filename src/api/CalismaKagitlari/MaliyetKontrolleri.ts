import { apiFetch } from "@/api/apiBase";

export interface MaliyetKontrolleriResponseDto {
    hesapNo: string;
    hesapAciklamasi: string;
    oncekiDonemBakiye: number;
    cariDonemBakiye: number;
    degisimTL: number;
    degisimYuzde: number;
    isBold: boolean;
    isHeader: boolean;
}

export const getMaliyetKontrolleri = async (
    denetlenenId: number,
    yil: number,
    dipnotNumarasi: string
) => {
    try {
        const response = await apiFetch(
            `/MaliyetKontrolleri/GetMaliyetKontrolleri?denetlenenId=${denetlenenId}&yil=${yil}&dipnotNumarasi=${dipnotNumarasi}`,
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
            console.log("Maliyet Kontrolleri verileri alınırken hata oluştu:", response.status);
            throw new Error(`API Error: ${response.status}`);
        }
    } catch (error) {
        console.log("Maliyet Kontrolleri verileri alınırken hata oluştu:", error);
        throw error;
    }
};
