import { apiFetch } from "@/api/apiBase";

export interface SupheliAlacakTestleriData {
    id: number;
    dipnotNo: string;
    baslik: string;
    hesapNo: string;
    hesapAdi: string;
    oncekiDonemBakiye: number;
    cariDonemBakiye: number;
    degisimTl: number;
    avukatMektubu: string;
}

export async function getSupheliAlacakTestleri(
    denetciId: number,
    yil: number,
    denetlenenId: number,
    dipnotNo: string
) {
    const response = await apiFetch(
        `/SupheliAlacakTestleri/GetByDenetlenen?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}&dipnotNo=${encodeURIComponent(dipnotNo)}`,
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
        console.log("Veriler getirilemedi");
        return null;
    }
}

export async function updateSupheliAlacakTestleri(
    id: number,
    data: Partial<SupheliAlacakTestleriData>
) {
    const response = await apiFetch(`/SupheliAlacakTestleri/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });

    return response.ok;
}

export async function addSupheliAlacakTestleri(
    data: Partial<SupheliAlacakTestleriData>
) {
    const response = await apiFetch(`/SupheliAlacakTestleri`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });

    return response.ok;
}

export async function deleteSupheliAlacakTestleri(id: number) {
    const response = await apiFetch(`/SupheliAlacakTestleri/${id}`, {
        method: "DELETE",
        headers: {
            // Authorization removed
        },
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
        `/SupheliAlacakTestleri/VarsayilanaDon?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}&dipnotNo=${encodeURIComponent(dipnotNo)}`,
        {
            method: "DELETE",
            headers: {
                // Authorization removed
            },
        }
    );

    return response.ok;
}

export async function saveAllSupheliAlacakTestleri(
    data: SupheliAlacakTestleriData[]
) {
    const response = await apiFetch(`/SupheliAlacakTestleri/SaveAll`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });

    return response.ok;
}
