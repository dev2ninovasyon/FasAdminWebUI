import { apiFetch } from "@/api/apiBase";

export interface ChecklistItem {
    label: string;
    checked: boolean;
}

export interface KysBelgeVeri {
    id: number;
    formKodu: string;
    icerik: string;
    kontrolListesi: ChecklistItem[];
}

export const getKysBelge = async (
    formKodu: string,
    denetciId: number,
    denetlenenId: number,
    yil: number
): Promise<KysBelgeVeri | null> => {
    try {
        const queryParams = new URLSearchParams({
            formKodu,
            denetciId: denetciId.toString(),
            denetlenenId: denetlenenId.toString(),
            yil: yil.toString()
        });
        const response = await apiFetch(`/KysBelge/GetByFormKoduAsync?denetciId=${denetciId}&denetlenenId=${denetlenenId}&yil=${yil}&formKodu=${formKodu}`, {
            method: "GET",
            headers: {
                accept: "application/json",
            },
        });

        if (!response.ok) {
            console.log("KYS Belge getirilemedi:", response.statusText);
            return null;
        }

        const data = await response.json();
        console.log("Backend'den gelen veri:", data);

        // Backend'den 'checklist' adıyla array olarak geliyor
        let kontrolListesi: ChecklistItem[] = [];

        if (data.checklist && Array.isArray(data.checklist)) {
            kontrolListesi = data.checklist.map((item: any) => ({
                label: item.label || '',
                checked: item.checked || false
            }));
        }

        console.log("Final kontrolListesi:", kontrolListesi);

        return {
            id: data.id,
            formKodu: data.formKodu,
            icerik: data.icerik,
            kontrolListesi
        };
    } catch (error) {
        console.log("KYS Belge getirilemedi:", error);
        return null;
    }
};

export const updateKysBelge = async (
    id: number,
    denetlenenId: number,
    yil: number,
    icerik: string,
    kontrolListesi: ChecklistItem[]
): Promise<KysBelgeVeri | null> => {
    try {
        const queryParams = new URLSearchParams({
            denetlenenId: denetlenenId.toString(),
            yil: yil.toString()
        });

        const response = await apiFetch(`/KysBelge/${id}?${queryParams}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                id,
                icerik,
                checklist: kontrolListesi
            })
        });

        if (!response.ok) {
            console.log("KYS Belge güncellenemedi:", response.statusText);
            return null;
        }

        return await response.json();
    } catch (error) {
        console.log("KYS Belge güncellenemedi:", error);
        return null;
    }
};

export const updateKysBelgeChecklist = async (
    id: number,
    kontrolListesi: ChecklistItem[]
): Promise<boolean> => {
    try {
        const response = await apiFetch(`/KysBelge/${id}/checklist`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(kontrolListesi)
        });

        if (!response.ok) {
            console.log("KYS Belge checklist güncellenemedi:", response.statusText);
            return false;
        }

        return true;
    } catch (error) {
        console.log("KYS Belge checklist güncellenemedi:", error);
        return false;
    }
};
