import { apiFetch } from "@/api/apiBase";

export interface KidemTazminatiHesaplamaSonuclari {
    id: number;
    denetciId: number;
    denetlenenId: number;
    yil: number;
    bobimi: boolean;
    sira: number;
    tcKimlikNo?: string;
    adiSoyadi?: string;
    kidemTazminati?: number;
    ihbarTazminati?: number;
    toplamTutar?: number;
}

export interface KidemTazminatiCalismasiResponseDto {
    kidemVerileriBobi: KidemTazminatiHesaplamaSonuclari[];
    kidemVerileriOncekiYilBobi: KidemTazminatiHesaplamaSonuclari[];
}

export const getKidemTazminatiCalismasi = async (
    denetciId: number,
    denetlenenId: number,
    yil: number,
    dipnotNumarasi: string
) => {
    try {
        const response = await apiFetch(
            `/KidemTazminatiCalismasi/GetKidemTazminatiCalismasi?denetciId=${denetciId}&denetlenenId=${denetlenenId}&yil=${yil}&dipnotNumarasi=${dipnotNumarasi}`,
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
            console.log("Kıdem Tazminatı verileri alınırken hata oluştu:", response.status);
            throw new Error(`API Error: ${response.status}`);
        }
    } catch (error) {
        console.log("Kıdem Tazminatı verileri alınırken hata oluştu:", error);
        throw error;
    }
};
