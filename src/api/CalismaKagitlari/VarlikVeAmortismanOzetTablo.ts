import { apiFetch } from "@/api/apiBase";

export interface VarlikVeAmortismanOzetTabloData {
    id: number;
    detayHesapKodu: string;
    hesapAdi: string;
    amortismanBaslangicTarihi: string;
    girisTutari: number;
    yenidenDegerlemeArtisi: number;
    iptalEdilecekYenidenDegerlemeTutari: number;
    kalintiDeger: number;
    amortismanBitisTarihi: string;
    bobiTfrsAmortismanOrani: number;
    vukCariYilAmortisman: number;
    bobiTfrsCariYilAmortisman: number;
    cariYilAmortismanFarki: number;
    vukDonemSonuBirikmisAmortisman: number;
    bobiTfrsDonemSonuBirikmisAmortisman: number;
    bobiTfrsVukBirikmisAmortismanFarki: number;
}

export async function fetchVarlikVeAmortismanOzetTablo(denetlenenId: number, yil: number, dn: string) {
    try {
        const response = await apiFetch(
            `/VarlikveAmortismanOzetTablo/get-ozet-tablo?denetlenenId=${denetlenenId}&yil=${yil}&dn=${encodeURIComponent(dn)}`,
            {
                method: "GET",
                headers: {
                    "accept": "application/json",
                },
            }
        );

        if (response.ok) {
            const data = await response.json();
            console.log("API Response:", data);
            return data;
        } else {
            const errorText = await response.text();
            console.log("API Error Response:", errorText);
            return { success: false, message: `Sunucu hatası: ${response.status}`, data: [] };
        }
    } catch (error) {
        console.log("Fetch error:", error);
        return { success: false, message: "Bağlantı hatası oluştu.", data: [] };
    }
}
