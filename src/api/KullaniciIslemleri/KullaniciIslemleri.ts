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

export interface KullaniciDataActionResult<T> {
    ok: boolean;
    data?: T;
    message?: string;
}

export interface AdminKullaniciDto {
    id: number;
    denetciId: number;
    personelAdi?: string;
    email?: string;
    unvani?: string;
    bdSicilNo?: string;
    tel?: string;
    gsm?: string;
    aktifPasif: boolean;
    isDenetciAdmin: boolean;
    roller?: string[];
}

export interface AdminKullaniciCreatePayload {
    denetciId: number;
    personelAdi: string;
    email: string;
    unvani?: string;
    bdSicilNo?: string;
    tel?: string;
    gsm?: string;
    sifre: string;
    aktifPasif: boolean;
    isDenetciAdmin: boolean;
}

export interface AdminKullaniciUpdatePayload {
    personelAdi: string;
    email: string;
    unvani?: string;
    bdSicilNo?: string;
    tel?: string;
    gsm?: string;
    aktifPasif: boolean;
    isDenetciAdmin: boolean;
}

export const DEFAULT_UNVAN_SECENEKLERI: string[] = [
    "Yönetim Kurulu Başkanı",
    "Sorumlu Denetçi",
    "Kalite Kontrol Sorumlu Denetçi",
    "İzleme Sorumlu Denetçi",
    "Denetçi",
    "Denetçi Yardımcısı",
];

const parseMutationError = async (response: Response, fallback: string): Promise<string> => {
    try {
        const text = await response.text();
        if (!text) return fallback;
        try {
            const json = JSON.parse(text);
            if (json?.errors && typeof json.errors === "object") {
                const firstKey = Object.keys(json.errors)[0];
                const firstVal = firstKey ? json.errors[firstKey] : null;
                if (Array.isArray(firstVal) && firstVal[0]) {
                    return String(firstVal[0]);
                }
            }
            return json?.message || json?.Message || json?.title || fallback;
        } catch {
            return text.replace(/^"|"$/g, "") || fallback;
        }
    } catch {
        return fallback;
    }
};

export const getUnvanlar = async (token: string): Promise<string[]> => {
    try {
        const response = await apiFetch(`/GorevAtamalari/Unvanlar`, {
            method: "GET",
            token: token,
        });
        if (!response.ok) {
            return DEFAULT_UNVAN_SECENEKLERI;
        }
        const data = await response.json();
        if (!Array.isArray(data) || data.length === 0) {
            return DEFAULT_UNVAN_SECENEKLERI;
        }
        const names = data
            .map((u: any) => String(u?.adi ?? u?.Adi ?? "").trim())
            .filter(Boolean);
        return names.length > 0 ? names : DEFAULT_UNVAN_SECENEKLERI;
    } catch {
        return DEFAULT_UNVAN_SECENEKLERI;
    }
};

export const getAdminKullanicilarByDenetciId = async (
    token: string,
    denetciId: number
): Promise<KullaniciDataActionResult<AdminKullaniciDto[]>> => {
    try {
        const response = await apiFetch(`/Kullanici/Admin/Denetci/${denetciId}`, {
            method: "GET",
            token: token,
        });
        if (!response.ok) {
            return {
                ok: false,
                data: [],
                message: await parseMutationError(response, "Kullanıcı listesi alınamadı."),
            };
        }
        const data = await response.json();
        return {
            ok: true,
            data: Array.isArray(data) ? data : [],
        };
    } catch (error) {
        console.error("Admin kullanıcı listesi alınırken hata:", error);
        return {
            ok: false,
            data: [],
            message: "Kullanıcı listesi alınırken bağlantı hatası oluştu.",
        };
    }
};

export const createAdminKullanici = async (
    token: string,
    payload: AdminKullaniciCreatePayload
): Promise<KullaniciDataActionResult<AdminKullaniciDto>> => {
    try {
        const response = await apiFetch(`/Kullanici/Admin`, {
            method: "POST",
            token: token,
            body: JSON.stringify(payload),
        });
        if (response.ok) {
            const data = await response.json().catch(() => undefined);
            return { ok: true, data };
        }
        return {
            ok: false,
            message: await parseMutationError(response, "Kullanıcı eklenemedi."),
        };
    } catch (error) {
        console.error("Admin kullanıcı eklenirken hata:", error);
        return { ok: false, message: "Kullanıcı eklenirken bağlantı hatası oluştu." };
    }
};

export const updateAdminKullanici = async (
    token: string,
    id: number,
    payload: AdminKullaniciUpdatePayload
): Promise<KullaniciDataActionResult<AdminKullaniciDto>> => {
    try {
        const response = await apiFetch(`/Kullanici/Admin/${id}`, {
            method: "PUT",
            token: token,
            body: JSON.stringify(payload),
        });
        if (response.ok) {
            const data = await response.json().catch(() => undefined);
            return { ok: true, data };
        }
        return {
            ok: false,
            message: await parseMutationError(response, "Kullanıcı güncellenemedi."),
        };
    } catch (error) {
        console.error("Admin kullanıcı güncellenirken hata:", error);
        return { ok: false, message: "Kullanıcı güncellenirken bağlantı hatası oluştu." };
    }
};

export const toggleAdminKullaniciAktifPasif = async (
    token: string,
    id: number,
    aktifPasif: boolean
): Promise<KullaniciDataActionResult<AdminKullaniciDto>> => {
    try {
        const response = await apiFetch(`/Kullanici/Admin/${id}/AktifPasif`, {
            method: "PATCH",
            token: token,
            body: JSON.stringify({ aktifPasif }),
        });
        if (response.ok) {
            const data = await response.json().catch(() => undefined);
            return { ok: true, data };
        }
        return {
            ok: false,
            message: await parseMutationError(response, "Kullanıcı durumu güncellenemedi."),
        };
    } catch (error) {
        console.error("Kullanıcı aktif/pasif durumu değiştirilirken hata:", error);
        return { ok: false, message: "Durum güncellenirken bağlantı hatası oluştu." };
    }
};

export const deleteAdminKullanici = async (
    token: string,
    id: number
): Promise<KullaniciMutationResult> => {
    try {
        const response = await apiFetch(`/Kullanici/Admin/${id}`, {
            method: "DELETE",
            token: token,
        });
        if (response.ok) {
            return { ok: true };
        }
        return {
            ok: false,
            message: await parseMutationError(response, "Kullanıcı silinemedi."),
        };
    } catch (error) {
        console.error("Kullanıcı silinirken hata:", error);
        return { ok: false, message: "Kullanıcı silinirken bağlantı hatası oluştu." };
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

export const updateKullaniciSifreAdminDetayli = async (
    token: string,
    id: any,
    passwordData: any
): Promise<KullaniciMutationResult> => {
    try {
        const response = await apiFetch(`/Kullanici/AdminSifre/${id}`, {
            method: "PUT",
            token: token,
            body: JSON.stringify(passwordData),
        });

        if (response.ok) {
            return { ok: true };
        }

        return {
            ok: false,
            message: await parseMutationError(response, "Şifre güncellenirken bir hata oluştu."),
        };
    } catch (error) {
        console.error("Bir hata oluştu:", error);
        return { ok: false, message: "Şifre güncellenirken bağlantı hatası oluştu." };
    }
};

export const updateKullaniciSifreAdmin = async (
    token: string,
    id: any,
    passwordData: any
) => {
    const res = await updateKullaniciSifreAdminDetayli(token, id, passwordData);
    return res.ok;
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
