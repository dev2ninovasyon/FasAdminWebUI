import { apiFetch } from "@/api/apiBase";

export const getKullanicilarByDenetciId = async (token: string, denetciId: any) => {
    try {
        const response = await apiFetch(`/Kullanici/Hepsi/${denetciId}`, {
            method: "GET",
            token: token
        });
        if (response.ok) {
            return response.json();
        } else {
            console.error("Kullanıcılar getirilemedi");
        }
    } catch (error) {
        console.error("Bir hata oluştu:", error);
    }
};

export const updateKullanici = async (
    token: string,
    id: any,
    updatedKullanici: any
) => {
    try {
        const response = await apiFetch(`/Kullanici/${id}`, {
            method: "PUT",
            token: token,
            body: JSON.stringify(updatedKullanici),
        });

        return response.ok;
    } catch (error) {
        console.error("Bir hata oluştu:", error);
        return false;
    }
};

export const updateKullaniciSifre = async (
    token: string,
    id: any,
    passwordData: any
) => {
    try {
        const response = await apiFetch(`/Kullanici/Sifre/${id}`, {
            method: "PUT",
            token: token,
            body: JSON.stringify(passwordData),
        });

        return response.ok;
    } catch (error) {
        console.error("Bir hata oluştu:", error);
        return false;
    }
};

export const updateKullaniciSifreAdmin = async (
    token: string,
    id: any,
    passwordData: any
) => {
    try {
        const response = await apiFetch(`/Kullanici/AdminSifre/${id}`, {
            method: "PUT",
            token: token,
            body: JSON.stringify(passwordData),
        });

        return response.ok;
    } catch (error) {
        console.error("Bir hata oluştu:", error);
        return false;
    }
};
