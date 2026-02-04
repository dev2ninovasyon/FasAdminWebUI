import { url } from "@/api/apiBase";

export const getKullanicilarByDenetciId = async (token: string, denetciId: any) => {
    try {
        const response = await fetch(`${url}/Kullanici/Hepsi/${denetciId}`, {
            method: "GET",
            headers: {
                accept: "application/json",
                Authorization: `Bearer ${token}`,
            },
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
        const response = await fetch(`${url}/Kullanici/${id}`, {
            method: "PUT",
            headers: {
                accept: "*/*",
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(updatedKullanici),
        });

        if (response.ok) {
            return true;
        } else {
            return false;
        }
    } catch (error) {
        console.error("Bir hata oluştu:", error);
    }
};

export const updateKullaniciSifre = async (
    token: string,
    id: any,
    passwordData: any
) => {
    try {
        const response = await fetch(`${url}/Kullanici/Sifre/${id}`, {
            method: "PUT",
            headers: {
                accept: "*/*",
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(passwordData),
        });

        if (response.ok) {
            return true;
        } else {
            return false;
        }
    } catch (error) {
        console.error("Bir hata oluştu:", error);
    }
};

export const updateKullaniciSifreAdmin = async (
    token: string,
    id: any,
    passwordData: any
) => {
    try {
        const response = await fetch(`${url}/Kullanici/AdminSifre/${id}`, {
            method: "PUT",
            headers: {
                accept: "*/*",
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(passwordData),
        });

        if (response.ok) {
            return true;
        } else {
            return false;
        }
    } catch (error) {
        console.error("Bir hata oluştu:", error);
    }
};
