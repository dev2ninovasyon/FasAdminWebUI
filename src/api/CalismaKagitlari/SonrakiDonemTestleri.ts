import { apiFetch } from "@/api/apiBase";

export interface MaddiDogrulukTahsilatKayitlari {
    id: number;
    denetlenenId: number;
    yil: number;
    hesapNo: string;
    hesapAciklamasi: string;
    kayitNo: string;
    tarih: string;
    giris: number;
    tahsilat: number;
    bakiye: number;
}

export interface SonrakiDonemTestleriResponseDto {
    tahsilatKayitlari: MaddiDogrulukTahsilatKayitlari[];
    donusumMizanBobi: any[];
}

export const getSonrakiDonemTestleri = async (
    denetlenenId: number,
    yil: number,
    dipnotNumarasi: string
) => {
    try {
        const response = await apiFetch(
            `/SonrakiDonemTestleri/GetSonrakiDonemTestleri?denetlenenId=${denetlenenId}&yil=${yil}&dipnotNumarasi=${dipnotNumarasi}`,
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
            const errorText = await response.text();
            console.log("Sonraki Dönem Testleri verileri alınırken hata oluştu:", response.status, errorText);
            throw new Error(`API Error: ${response.status} - ${errorText}`);
        }
    } catch (error) {
        console.log("Sonraki Dönem Testleri verileri alınırken hata oluştu:", error);
        throw error;
    }
};

export const sonrakiDonemTestleriSatirEkle = async (dto: any) => {
    try {
        const response = await apiFetch(
            `/SonrakiDonemTestleri/SonrakiDonemTestleriSatirEkle`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    accept: "application/json",
                },
                body: JSON.stringify(dto),
            }
        );

        if (response.ok) {
            return response.json();
        } else {
            console.log("Sonraki Dönem Testleri satırı eklenirken hata oluştu:", response.status);
            throw new Error(`API Error: ${response.status}`);
        }
    } catch (error) {
        console.log("Sonraki Dönem Testleri satırı eklenirken hata oluştu:", error);
        throw error;
    }
};

export const sonrakiDonemTestleriSatirSil = async (id: number) => {
    try {
        const response = await apiFetch(
            `/SonrakiDonemTestleri/SonrakiDonemTestleriSatirSil?id=${id}`,
            {
                method: "POST",
                headers: {
                    accept: "application/json",
                },
            }
        );

        if (response.ok) {
            return response.json();
        } else {
            console.log("Sonraki Dönem Testleri satırı silinirken hata oluştu:", response.status);
            throw new Error(`API Error: ${response.status}`);
        }
    } catch (error) {
        console.log("Sonraki Dönem Testleri satırı silinirken hata oluştu:", error);
        throw error;
    }
};

export const sonrakiDonemTestleriTopluSatirSil = async (ids: number[]) => {
    try {
        const response = await apiFetch(
            `/SonrakiDonemTestleri/SonrakiDonemTestleriTopluSatirSil`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    accept: "application/json",
                },
                body: JSON.stringify(ids),
            }
        );

        if (response.ok) {
            return response.json();
        } else {
            console.log("Sonraki Dönem Testleri satırları silinirken hata oluştu:", response.status);
            throw new Error(`API Error: ${response.status}`);
        }
    } catch (error) {
        console.log("Sonraki Dönem Testleri satırları silinirken hata oluştu:", error);
        throw error;
    }
};

export const sonrakiDonemTestleriSatirGuncelle = async (satir: any) => {
    try {
        const response = await apiFetch(
            `/SonrakiDonemTestleri/SonrakiDonemTestleriSatirGuncelle`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    accept: "application/json",
                },
                body: JSON.stringify(satir),
            }
        );

        if (response.ok) {
            return response.json();
        } else {
            console.log("Sonraki Dönem Testleri satırı güncellenirken hata oluştu:", response.status);
            throw new Error(`API Error: ${response.status}`);
        }
    } catch (error) {
        console.log("Sonraki Dönem Testleri satırı güncellenirken hata oluştu:", error);
        throw error;
    }
};
