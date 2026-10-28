import { apiFetch } from "@/api/apiBase";

export const getRol = async (userId: number, denetlenenId: number, yil: number) => {
    try {
        const response = await apiFetch(
            `/DenetimKadrosuAtama/GetRol?userId=${userId}&denetlenenId=${denetlenenId}&yil=${yil}`,
            {
                method: "GET",
                headers: {
                    accept: "application/json",
                },
            }
        );
        if (response.ok) {
            return await response.json();
        } else {
            console.log("Rol bilgileri getirilemedi");
            return null;
        }
    } catch (error) {
        console.log("Rol bilgileri getirilirken hata oluştu:", error);
        return null;
    }
};

export const getKullaniciRol = async (userId: number, denetlenenId: number) => {
    try {
        const response = await apiFetch(
            `/DenetimKadrosuAtama/GetKullaniciRol?userId=${userId}&denetlenenId=${denetlenenId}`,
            {
                method: "GET",
                headers: {
                    accept: "application/json",
                },
            }
        );
        if (response.ok) {
            return await response.json();
        } else {
            console.log("Kullanıcı rol bilgileri getirilemedi");
            return [];
        }
    } catch (error) {
        console.log("Kullanıcı rol bilgileri getirilirken hata oluştu:", error);
        return [];
    }
};

export const getDenetimKadrosuAtama = async (denetlenenId: number, yil: number) => {
    try {
        const response = await apiFetch(
            `/DenetimKadrosuAtama/ByDenetlenenIdYil/${denetlenenId}/${yil}`,
            {
                method: "GET",
                headers: {
                    accept: "application/json",
                },
            }
        );
        if (response.ok) {
            return await response.json();
        } else {
            console.log("Denetim Kadrosu Ataması getirilemedi");
            return [];
        }
    } catch (error) {
        console.log("Denetim Kadrosu Ataması getirilirken hata oluştu:", error);
        return [];
    }
};

export const createDenetimKadrosuAtama = async (denetimKadrosuAtama: any) => {
    try {
        const response = await apiFetch(`/DenetimKadrosuAtama`, {
            method: "POST",
            headers: {
                accept: "*/*",
                "Content-Type": "application/json",
            },
            body: JSON.stringify(denetimKadrosuAtama),
        });

        if (response.ok) {
            return await response.json();
        } else {
            console.log("Denetim Kadrosu Ataması oluşturulamadı");
            return null;
        }
    } catch (error) {
        console.log("Denetim Kadrosu Ataması oluşturulurken hata oluştu:", error);
        return null;
    }
};

export const updateDenetimKadrosuAtama = async (
    id: number,
    denetimKadrosuAtama: any
) => {
    try {
        const response = await apiFetch(`/DenetimKadrosuAtama/${id}`, {
            method: "PUT",
            headers: {
                accept: "*/*",
                "Content-Type": "application/json",
            },
            body: JSON.stringify(denetimKadrosuAtama),
        });

        if (response.ok) {
            return true;
        } else {
            console.log("Denetim Kadrosu Ataması güncellenemedi");
            return false;
        }
    } catch (error) {
        console.log("Denetim Kadrosu Ataması güncellenirken hata oluştu:", error);
        return false;
    }
};

export const deleteDenetimKadrosuAtama = async (id: number) => {
    try {
        const response = await apiFetch(`/DenetimKadrosuAtama/${id}`, {
            method: "DELETE",
            headers: {
                accept: "*/*",
            },
        });

        if (response.ok) {
            return true;
        } else {
            console.log("Denetim Kadrosu Ataması silinemedi");
            return false;
        }
    } catch (error) {
        console.log("Denetim Kadrosu Ataması silinirken hata oluştu:", error);
        return false;
    }
};
