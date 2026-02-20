import { apiFetch } from "@/api/apiBase";

export interface HasilatDonemsellikTestiResponseDto {
    detayKodu: string;
    hesapAdi: string;
    buyukDefterId: string;
    belgeNevi: string;
    belgeNo: string;
    belgeTarihi: string;
    belgeTutari: number;
    kayitTarihi: string;
    kayitNo: number;
    tespit: string;
}

export interface HasilatDonemsellikTestiAddDto {
    denetciId: number;
    denetlenenId: number;
    yil: number;
    dipnotNo: string;
    detayKodu: string;
    hesapAdi: string;
    buyukDefterId: string;
    belgeNevi: string;
    belgeNo: string;
    belgeTarihi: string;
    belgeTutari: number;
    kayitTarihi: string;
    kayitNo: number;
    tespit: string;
}

export const getHasilatDonemsellikTesti = async (
    denetciId: number,
    denetlenenId: number,
    yil: number,
    baslangictarih: string,
    bitistarih: string,
    hesaplar: string,
    tutardanFazla: number
) => {
    try {
        const response = await apiFetch(
            `/HasilatDonemsellikTesti/LoadDataTable?denetciId=${denetciId}&denetlenenId=${denetlenenId}&yil=${yil}&baslangictarih=${baslangictarih}&bitistarih=${bitistarih}&hesaplar=${hesaplar}&tutardanFazla=${tutardanFazla}`,
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
            console.log("Hasılat Dönemsellik Testi verileri alınırken hata oluştu:", response.status);
            throw new Error(`API Error: ${response.status}`);
        }
    } catch (error) {
        console.log("Hasılat Dönemsellik Testi verileri alınırken hata oluştu:", error);
        throw error;
    }
};

export const saveHasilatDonemsellikTesti = async (
    list: HasilatDonemsellikTestiAddDto[],
    hepsiniKaydet: boolean
) => {
    try {
        const response = await apiFetch(
            `/HasilatDonemsellikTesti/TespitInsert?hepsiniKaydet=${hepsiniKaydet}`,
            {
                method: "POST",
                headers: {
                    accept: "application/json",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(list),
            }
        );

        if (response.ok) {
            return response.json();
        } else {
            console.log("Hasılat Dönemsellik Testi verileri kaydedilirken hata oluştu:", response.status);
            throw new Error(`API Error: ${response.status}`);
        }
    } catch (error) {
        console.log("Hasılat Dönemsellik Testi verileri kaydedilirken hata oluştu:", error);
        throw error;
    }
};
