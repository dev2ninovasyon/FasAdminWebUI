import { apiFetch } from "@/api/apiBase";

export const getAcceptedYears = async (denetlenenId: number) => {
    try {
        const response = await apiFetch(`/Denetlenen/GetAcceptedYears/${denetlenenId}`, {
            method: "GET",
            headers: {
                accept: "application/json",
            },
            ignoreCustomHeaders: true,
        });
        if (response.ok) {
            return response.json();
        } else {
            console.log("Kabul edilen yıllar getirilemedi");
            return [];
        }
    } catch (error) {
        console.log("Bir hata oluştu:", error);
        return [];
    }
};

export const firmayiKabulEt = async (
    token: string,
    sirketId: number,
    yil: number,
    denetimTuru: string,
    ozelHesap: boolean,
    enflasyonMu: boolean,
    denetciId: number
) => {
    try {
        const response = await apiFetch(`/Denetlenen/FirmayiKabulEt`, {
            method: "POST",
            headers: {
                accept: "*/*",
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                sirketId,
                yil,
                denetimTuru,
                ozelHesap,
                enflasyonMu,
                denetciId
            })
        });

        if (response.ok) {
            return true;
        } else {
            const contentType = response.headers.get("content-type");
            let message = "Hata Oluştu";
            if (contentType && contentType.includes("application/json")) {
                const errorData = await response.json();
                message = errorData || message;
            } else {
                message = await response.text();
            }

            return { message };
        }
    } catch (error) {
        console.log("Bir hata oluştu:", error);
        return false;
    }
};
