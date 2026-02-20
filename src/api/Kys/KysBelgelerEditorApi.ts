import { apiFetch } from "@/api/apiBase";

const controller = "KysBelgelerEditorText";

export const getKysBelgelerEditorText = async (
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
            // Sessor: Eğer 404 ise backend henüz yok demektir veya veri yok, 
            // ama frontend hatası fırlatmak yerine null veya boş array dönebiliriz.
            // Şimdilik error fırlatalım, çağıran yer (component) handle etsin.
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.log("KysBelgelerEditorText getirme hatası:", error);
        throw error;
    }
};

export const saveKysBelgelerEditorText = async (
    data: {
        formKodu: string;
        denetlenenId: number;
        yil: number;
        metin: string;
    }
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
        console.log("KysBelgelerEditorText kaydetme hatası:", error);
        throw error;
    }
};
