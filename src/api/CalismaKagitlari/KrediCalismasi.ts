import { apiFetch } from "@/api/apiBase";

export interface KrediHesaplamaDetay {
    taksitTarihi: string;
    taksitTutari: number;
    faizTutari: number;
    fonVergi: number;
    anaPara: number;
    gun: number;
}

export interface KrediHesaplamaData {
    id: number;
    detayHesapKodu: string;
    hesapAdi: string;
    anaPara: number;
    iskontolu: number;
    iskontosuz: number;
    faizOrani: number;
    gun: number;
    vade: string;
    vadeselDagilim3AyIskontolu: number;
    vadeselDagilim12AyIskontolu: number;
    vadeselDagilim5YilIskontolu: number;
    vadeselDagilim5YildanUzunIskontolu: number;
    vadeselDagilim3AyIskontosuz: number;
    vadeselDagilim12AyIskontosuz: number;
    vadeselDagilim5YilIskontosuz: number;
    vadeselDagilim5YildanUzunIskontosuz: number;
    faizFonVergi: number;
    kalanFaizFonVergi: number;
    kalanFaizFonVergiIskontolu: number;
    krediHesaplamaDetaylari?: KrediHesaplamaDetay[];
}

export async function fetchKrediCalismasi(denetlenenId: number, yil: number, dn: string) {
    const response = await apiFetch(
        `/KrediCalismasi/get-hesaplama?denetlenenId=${denetlenenId}&yil=${yil}&dn=${encodeURIComponent(dn)}`,
        {
            method: "GET",
            headers: {
                "accept": "application/json",
            },
        }
    );
    // apiFetch muhtemelen bir Response nesnesi dönüyor, json() parse işlemi burada yapılmalı
    if (response.ok) {
        return await response.json();
    }
    return { success: false, message: "Sunucu hatası oluştu." };
}
