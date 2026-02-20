import { apiFetch } from "@/api/apiBase";

export interface StokDonemsellikTestiData {
    id: number;
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

export async function getStokDonemsellikTesti(
    denetlenenId: number
) {
    const response = await apiFetch(
        `/StokDonemsellikTesti/GetByDenetlenen?denetlenenId=${denetlenenId}`,
        {
            method: "GET",
            headers: {
                accept: "application/json",
            },
        }
    );

    return response.ok ? response.json() : null;
}

export async function updateStokDonemsellikTesti(
    id: number,
    data: Partial<StokDonemsellikTestiData>
) {
    const response = await apiFetch(`/StokDonemsellikTesti/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });

    return response.ok;
}

export async function varsayilanaDonStokDonemsellik(
    denetciId: number,
    yil: number,
    denetlenenId: number,
    dipnotNo: string
) {
    const response = await apiFetch(
        `/StokDonemsellikTesti/VarsayilanDon?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}&dipnotNo=${encodeURIComponent(dipnotNo)}`,
        {
            method: "POST",
            headers: {
                accept: "*/*",
            },
        }
    );

    return response.ok;
}
