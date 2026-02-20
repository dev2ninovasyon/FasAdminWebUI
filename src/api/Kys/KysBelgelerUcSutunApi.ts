import { apiFetch } from "@/api/apiBase";

const controller = "KysBelgeLerUcSutunlu";

export const getKysBelgeler = async (
    formKodu: string,
    denetlenenId: number,
    yil: number
) => {
    try {
        const response = await apiFetch(
            `/${controller}/GetByFormKodu?formKodu=${formKodu}&denetlenenId=${denetlenenId}&yil=${yil}`,
            {
                headers: {},
            }
        );
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.log("KysBelgeler getirme hatası:", error);
        throw error;
    }
};

export const createKysBelge = async (
    data: any
) => {
    try {
        const response = await apiFetch(`/${controller}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.log("KysBelge oluşturma hatası:", error);
        throw error;
    }
};

export const updateKysBelge = async (
    id: number,
    data: any
) => {
    try {
        const response = await apiFetch(`/${controller}/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.log("KysBelge güncelleme hatası:", error);
        throw error;
    }
};

export const deleteKysBelge = async (
    id: number
) => {
    try {
        const response = await apiFetch(`/${controller}/${id}`, {
            method: "DELETE",
            headers: {},
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.log("KysBelge silme hatası:", error);
        throw error;
    }
};
