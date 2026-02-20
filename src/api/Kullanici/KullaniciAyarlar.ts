import { apiFetch } from "@/api/apiBase";

export const updateSonSecilenAyarlari = async (
    userId: number,
    denetlenenId: number,
    yil: number
) => {
    try {
        const response = await apiFetch(
            `/Kullanici/UpdateSonSecilenAyarlari/${userId}`,
            {
                method: "PUT",
                headers: {
                    accept: "application/json",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    denetlenenId: denetlenenId,
                    yil: yil,
                }),
            }
        );

        if (response.ok) {
            return true;
        } else {
            console.log("Son seçilen ayarlar güncellenemedi");
            return false;
        }
    } catch (error) {
        console.log("Son seçilen ayarlar güncellenirken hata oluştu:", error);
        return false;
    }
};

export const getKullaniciAyarlar = async (userId: number) => {
    try {
        const response = await apiFetch(`/Kullanici/Ayarlar/${userId}`, {
            method: "GET",
            headers: {
                accept: "application/json",
            },
        });

        if (response.ok) {
            return await response.json();
        } else {
            console.log("Kullanıcı ayarları getirilemedi");
            return null;
        }
    } catch (error) {
        console.log("Kullanıcı ayarları getirilirken hata oluştu:", error);
        return null;
    }
};

export const updateKullaniciAyarlar = async (userId: number, ayarlar: any) => {
    try {
        const response = await apiFetch(`/Kullanici/Ayarlar/${userId}`, {
            method: "PUT",
            headers: {
                accept: "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify(ayarlar),
        });

        if (response.ok) {
            return true;
        } else {
            console.log("Kullanıcı ayarları güncellenemedi");
            return false;
        }
    } catch (error) {
        console.log("Kullanıcı ayarları güncellenirken hata oluştu:", error);
        return false;
    }
};

export const resetKullaniciAyarlar = async (userId: number) => {
    try {
        const response = await apiFetch(`/Kullanici/ResetAyarlar/${userId}`, {
            method: "PUT",
            headers: {
                accept: "application/json",
            },
        });

        if (response.ok) {
            return true;
        } else {
            console.log("Kullanıcı ayarları sıfırlanamadı");
            return false;
        }
    } catch (error) {
        console.log("Kullanıcı ayarları sıfırlanırken hata oluştu:", error);
        return false;
    }
};
