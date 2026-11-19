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

export interface KullaniciMutationResult {
    ok: boolean;
    message?: string;
}

const parseMutationError = async (response: Response, fallback: string): Promise<string> => {
    try {
        const text = await response.text();
        if (!text) return fallback;
        try {
            const json = JSON.parse(text);
            return json?.message || json?.Message || json?.title || fallback;
        } catch {
            return text;
        }
    } catch {
        return fallback;
    }
};

export const updateKullaniciDetayli = async (
    token: string,
    id: any,
    updatedKullanici: any
): Promise<KullaniciMutationResult> => {
    try {
        const response = await apiFetch(`/Kullanici/${id}`, {
            method: "PUT",
            token: token,
            body: JSON.stringify(updatedKullanici),
        });

        if (response.ok) {
            return { ok: true };
        }

        return {
            ok: false,
            message: await parseMutationError(response, "Güncelleme sırasında bir hata oluştu."),
        };
    } catch (error) {
        console.error("Bir hata oluştu:", error);
        return { ok: false, message: "Güncelleme sırasında bağlantı hatası oluştu." };
    }
};

export const updateKullanici = async (
    token: string,
    id: any,
    updatedKullanici: any
) => {
    const result = await updateKullaniciDetayli(token, id, updatedKullanici);
    return result.ok;
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

export const getKullaniciByDenetlenenYilRol = async (
    denetlenenId: number,
    yil: number,
    rol: string
) => {
    try {
        const response = await apiFetch(
            `/Kullanici/ByDenetlenenYilRol?denetlenenId=${denetlenenId}&yil=${yil}&rol=${rol}`,
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
            console.log("Kullanıcı verileri getirilemedi");
            return [];
        }
    } catch (error) {
        console.log("Bir hata oluştu:", error);
        return [];
    }
};
