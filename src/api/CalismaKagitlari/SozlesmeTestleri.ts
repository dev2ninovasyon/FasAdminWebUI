import { apiFetch } from "@/api/apiBase";

export interface SozlesmeTestleriData {
    id: number;
    denetciId: number;
    denetlenenId: number;
    yil: number;
    dipnotNo: string;
    detayKodu: string | number;
    hesapAdi: string;
    detayHesapAdi?: string;
    mizanBakiye: number;
    sozlesmedekiBakiye: number;
    fark: number;
    islem: string;
}

export async function getSozlesmeTestleri(
    denetciId: number,
    yil: number,
    denetlenenId: number,
    dipnotNo: string
) {
    const response = await apiFetch(
        `/SozlesmeTestleri/GetByDenetlenen?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}&dipnotNo=${encodeURIComponent(dipnotNo)}`,
        {
            method: "GET",
            headers: {
                accept: "application/json",
            },
        }
    );

    return response.ok ? response.json() : null;
}

export async function updateSozlesmeTestleri(
    id: number,
    data: Partial<SozlesmeTestleriData>
) {
    const response = await apiFetch(`/SozlesmeTestleri/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });

    return response.ok;
}

export async function varsayilanaDon(
    denetciId: number,
    yil: number,
    denetlenenId: number,
    dipnotNo: string
) {
    const response = await apiFetch(
        `/SozlesmeTestleri/VarsayilanaDon?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}&dipnotNo=${encodeURIComponent(dipnotNo)}`,
        {
            method: "POST",
            headers: {
                accept: "*/*",
            },
        }
    );

    return response.ok;
}
