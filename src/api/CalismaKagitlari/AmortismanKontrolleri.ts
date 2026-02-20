import { apiFetch } from "@/api/apiBase";

export interface AmortismanKontrolleriResponseDto {
    donusumMizanBobi: any[];
    amortismanKontrolKayitlari: any[];
    amortismanHesaplamaKayitlari: any[];
    dipnotYorum: string;
}

export interface AmortismanKontrolSatirKaydetDto {
    id: number;
    hesapKodu: string;
    tahminiAmortismanGideri: number;
    denetlenenId: number;
    yil: number;
}

export async function fetchAmortismanKontrolleri(denetlenenId: number, yil: number, dn: string) {
    try {
        const response = await apiFetch(
            `/AmortismanKontrolleri/get-amortisman-kontrolleri?denetlenenId=${denetlenenId}&yil=${yil}&dn=${encodeURIComponent(dn)}`,
            {
                method: "GET",
                headers: {
                    // Authorization header removed
                },
            }
        );
        if (response.ok) {
            const data = await response.json();
            return data;
        } else {
            try {
                const errorData = await response.json();
                console.log("API Error Body:", errorData);
                return errorData;
            } catch {
                console.log("API Error:", response.statusText);
                return { success: false, message: "Veri çekilemedi." };
            }
        }
    } catch (error) {
        console.log("Fetch Error:", error);
        return { success: false, message: "Bir hata oluştu." };
    }
}

export async function saveAmortismanKontrolSatir(dto: AmortismanKontrolSatirKaydetDto) {
    try {
        const response = await apiFetch(
            `/AmortismanKontrolleri/save-satir`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(dto),
            }
        );
        if (response.ok) {
            const data = await response.json();
            return data;
        } else {
            console.log("API Error:", response.statusText);
            return { success: false, message: "Kaydedilemedi." };
        }
    } catch (error) {
        console.log("Save Error:", error);
        return { success: false, message: "Bir hata oluştu." };
    }
}
