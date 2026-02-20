import { apiFetch } from "@/api/apiBase";

export interface Denetlenen {
    id: number;
    unvan: string;
}

export type HareketsizTicariAlacaklarRow = {
    id: number;
    kebirKodu: string;
    detayKodu: string;
    hesapAdi: string;
    borcTutari: number;
    alacakTutari: number;
    netBakiye: number;
    paraBirimi: string;

    // Standard fields
    dipnotNo?: string | null;
    denetlenen?: Denetlenen | null;
    yil?: number;
};

export const getHareketsizTicariAlacaklarByDenetlenen = async (
    controller: string,
    denetciId: number,
    denetlenenId: number,
    yil: number
) => {
    const url =
        `/${controller}/HareketsizTicariAlacaklar` +
        `?denetciId=${denetciId}` +
        `&yil=${yil}` +
        `&denetlenenId=${denetlenenId}`;
    const res = await apiFetch(url, {
        method: "GET",
        headers: {
            accept: "application/json",
        },
    });

    if (res.status === 204) return [];

    if (!res.ok) {
        console.log("GetByDenetlenen başarısız:", res.status);
        return null;
    }

    return res.json();
};

export const updateHareketsizTicariAlacaklarRow = async (
    controller: string,
    id: number,
    payload: Partial<HareketsizTicariAlacaklarRow>
) => {
    const res = await apiFetch(`/${controller}/Update?id=${id}`, {
        method: "PUT",
        headers: {
            accept: "application/json",
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });

    if (!res.ok) {
        console.log("Update başarısız:", res.status);
        return null;
    }

    return res.json();
};

export const calculateHareketsizTicariAlacaklar = async (
    denetciId: number,
    yil: number,
    denetlenenId: number,
    acilisFisNo: number
) => {
    const url = `/Hesaplamalar/HareketsizTicariAlacaklarHesapla?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}&acilisFisNo=${acilisFisNo}`;
    const res = await apiFetch(url, {
        method: "POST",
        headers: {
            accept: "application/json",
        },
    });

    if (!res.ok) {
        throw new Error("Hesaplama işlemi başarısız oldu.");
    }

    return res.json();
};
