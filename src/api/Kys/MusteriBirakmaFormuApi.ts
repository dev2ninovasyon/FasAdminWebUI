import { apiFetch } from "@/api/apiBase";

const controller = "MusteriBirakmaFormu";

export const getMusteriBirakmaFormu = async (
    denetlenenId: number,
    yil: number
) => {
    try {
        const response = await apiFetch(
            `/${controller}?denetlenenId=${denetlenenId}&yil=${yil}`,
            {
                headers: {},
            }
        );
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.log("MusteriBirakmaFormu getirme hatası:", error);
        throw error;
    }
};

export const createMusteriBirakmaFormu = async (
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
        console.log("MusteriBirakmaFormu oluşturma hatası:", error);
        throw error;
    }
};

export const updateMusteriBirakmaFormu = async (
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
        return true;
    } catch (error) {
        console.log("MusteriBirakmaFormu güncelleme hatası:", error);
        throw error;
    }
};

export const deleteMusteriBirakmaFormu = async (
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
        return true;
    } catch (error) {
        console.log("MusteriBirakmaFormu silme hatası:", error);
        throw error;
    }
};
