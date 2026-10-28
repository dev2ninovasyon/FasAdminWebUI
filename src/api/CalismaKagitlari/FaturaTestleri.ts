import { apiFetch } from "@/api/apiBase";

export interface FaturaTestleriSatir {
    id: number;
    yevmiyeTarihi: string;
    yevmiyeNo: string;
    faturaNo: string;
    faturaTarihi: string;
    hesapKodu: string;
    hesapAdi: string;
    aciklama: string;
    paraBirimi: string;
    borc: number;
    alacak: number;
    borcTespit: number;
    alacakTespit: number;
    tespitFark: number;
    tespitAciklama: string;
}
export const getFaturaTestleri = async (
    denetciId: number,
    denetlenenId: number,
    yil: number,
    dipnotNo: string
) => {
    const response = await apiFetch(
        `/FaturaTestleri/GetByDenetlenen?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}&dipnotNo=${dipnotNo}`,
        {
            method: "GET",
            headers: {
                accept: "application/json",
            },
        }
    );
    return response.json();
};

export const faturaTestiGuncelle = async (satir: FaturaTestleriSatir) => {
    const response = await apiFetch(`/FaturaTestleri/${satir.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(satir),
    });
    return response.json();
};
