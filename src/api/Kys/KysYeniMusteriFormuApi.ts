import { apiFetch } from "@/api/apiBase";

export interface OrtakDto {
    adSoyad: string;
    payOrani?: number;
    payTutari?: number;
}

export interface YonetimKuruluDto {
    adSoyad: string;
    gorevi: string;
}

export interface SubeDto {
    ad: string;
    adres: string;
}

export interface GrupSirketiDto {
    ad: string;
    iliski: string;
}

export interface YeniMusteriFormuDto {
    id: number;
    denetlenenId: number;
    yil: number;
    unvan: string;
    vergiDairesi: string;
    vergiNo: string;
    adres: string;
    telefon: string;
    eposta: string;
    webSitesi: string;
    faaliyetKonusu: string;
    sermaye?: number;
    ortaklar: OrtakDto[];
    yonetimKurulu: YonetimKuruluDto[];
    subeler: SubeDto[];
    grupSirketleri: GrupSirketiDto[];
    hazirlayanAdSoyad: string;
    hazirlamaTarihi?: string;
    onaylayanAdSoyad: string;
    onaylamaTarihi?: string;
}

export const getYeniMusteriFormu = async (
    denetlenenId: number,
    yil: number
): Promise<YeniMusteriFormuDto | null> => {
    try {
        const response = await apiFetch(`/KysBelgeler/KysYeniMusteriFormu/?denetlenenId=${denetlenenId}&yil=${yil}`, {
            method: "GET",
            headers: {
                accept: "application/json",
            },
        });

        if (response.ok) {
            return await response.json();
        } else {
            console.log("Form verisi getirilemedi");
            return null;
        }
    } catch (error) {
        console.log("Bir hata oluştu:", error);
        return null;
    }
};

export const saveYeniMusteriFormu = async (
    data: YeniMusteriFormuDto
): Promise<boolean> => {
    try {
        const response = await apiFetch(`/KysBelgeler/KysYeniMusteriFormuSave`, {
            method: "POST",
            headers: {
                accept: "*/*",
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });

        if (response.ok) {
            return true;
        } else {
            console.log("Form kaydedilemedi");
            return false;
        }
    } catch (error) {
        console.log("Bir hata oluştu:", error);
        return false;
    }
};
