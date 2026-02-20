import { apiFetch } from "@/api/apiBase";

export interface EnvanterMizanDto {
    stokKodu: string;
    stokAdi: string;
    bakiyeMiktar: number;
    kalanTutar: number;
    birimMaliyet: number;
    fark: number;
    isBold: boolean;
}

export interface StokKartListeDto {
    stokKodu: string;
    stokAdi: string;
    bakiyeMiktar: number;
    kalanTutar: number;
    stokKartiBirimMaliyet: number;
    listedekiBirimMaliyet: number;
    fark: number;
    isBold: boolean;
}

export interface ListeFaturaDto {
    stokKodu: string;
    stokAdi: string;
    listedekiBirimMaliyet: number;
    faturaTarihi: string | null;
    faturaNo: string;
    faturaBirimTutari: number;
    fark: number;
    isBold: boolean;
}

export interface EnvanterKontrolleriWrapperDto {
    envanterMizanList: EnvanterMizanDto[];
    stokKartListeList: StokKartListeDto[];
    listeFaturaList: ListeFaturaDto[];
}

// Keep for compatibility if needed, but we'll use the wrapper
export interface EnvanterKontrolleriResponseDto extends EnvanterMizanDto { }

export const getEnvanterKontrolleri = async (
    denetlenenId: number,
    yil: number,
    dipnotNumarasi: string
) => {
    try {
        const response = await apiFetch(
            `/EnvanterKontrolleri/GetEnvanterKontrolleri?denetlenenId=${denetlenenId}&yil=${yil}&dipnotNumarasi=${dipnotNumarasi}`,
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
            console.log("Envanter Kontrolleri verileri alınırken hata oluştu:", response.status);
            throw new Error(`API Error: ${response.status}`);
        }
    } catch (error) {
        console.log("Envanter Kontrolleri verileri alınırken hata oluştu:", error);
        throw error;
    }
};
