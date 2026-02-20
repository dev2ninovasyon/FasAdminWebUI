import { apiFetch } from "../apiBase";

// DTOs and Interfaces
export interface MutabakatMektupBelgeDto {
    id: number;
    denetciId: number;
    denetlenenId: number;
    yil: number;
    detayKodu: string;
    orijinalDosyaAdi: string;
    contentType: string;
    dosyaBoyutu: number;
    yuklemeTarihi: string;
    yukleyenKullaniciId: number;
    guncellenmeTarihi?: string;
    aciklama?: string;
}

export interface GenerateMutabakatLinkResponse {
    token: string;
    uploadUrl: string;
    olusturmaTarihi: string;
    sonKullanmaTarihi: string;
}

export interface ValidateMutabakatTokenResponse {
    isValid: boolean;
    message: string;
    denetciId?: number;
    denetlenenId?: number;
    yil?: number;
    detayKodu?: string;
    sonKullanmaTarihi?: string;
    mektupYuklendi?: boolean;
}

export interface MutabakatUploadToken {
    id: number;
    token: string;
    denetciId: number;
    denetlenenId: number;
    yil: number;
    detayKodu: string;
    olusturmaTarihi: string;
    sonKullanmaTarihi: string;
    kullanildi: boolean;
    kullanilmaTarihi?: string;
    olusturanKullaniciId: number;
    aliciAdi?: string;
    hesapAdi?: string;
    aciklama?: string;
}

/**
 * Mektup yükle
 */
export const uploadMutabakatMektubu = async (
    file: File,
    denetciId: number,
    denetlenenId: number,
    yil: number,
    detayKodu: string,
    kullaniciId: number,
    aciklama?: string
): Promise<MutabakatMektupBelgeDto> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("denetciId", denetciId.toString());
    formData.append("denetlenenId", denetlenenId.toString());
    formData.append("yil", yil.toString());
    formData.append("detayKodu", detayKodu);
    formData.append("kullaniciId", kullaniciId.toString());
    if (aciklama) {
        formData.append("aciklama", aciklama);
    }

    const response = await apiFetch("/MutabakatMektup/Upload", {
        method: "POST",
        body: formData,
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Mektup yüklenemedi");
    }

    return response.json();
};

/**
 * Mektup bilgisini getir
 */
export const getMutabakatMektupBelge = async (
    denetciId: number,
    denetlenenId: number,
    yil: number,
    detayKodu: string
): Promise<MutabakatMektupBelgeDto | null> => {
    const response = await apiFetch(
        `/MutabakatMektup/Get?denetciId=${denetciId}&denetlenenId=${denetlenenId}&yil=${yil}&detayKodu=${encodeURIComponent(
            detayKodu
        )}`,
        {
            method: "GET",
            headers: {
                accept: "application/json",
            },
        }
    );

    if (response.status === 404) {
        return null;
    }

    if (!response.ok) {
        console.log("Mektup bilgisi getirilemedi");
        return null;
    }

    return response.json();
};

/**
 * Tüm mektupları listele
 */
export const getAllMutabakatMektuplar = async (
    denetciId: number,
    denetlenenId: number,
    yil: number
): Promise<MutabakatMektupBelgeDto[]> => {
    const response = await apiFetch(
        `/MutabakatMektup/List?denetciId=${denetciId}&denetlenenId=${denetlenenId}&yil=${yil}`,
        {
            method: "GET",
            headers: {
                accept: "application/json",
            },
        }
    );

    if (!response.ok) {
        console.log("Mektup listesi getirilemedi");
        return [];
    }

    return response.json();
};

/**
 * Mektup dosyasını indir
 */
export const downloadMutabakatMektup = async (
    id: number
): Promise<{ blob: Blob; fileName: string }> => {
    const response = await apiFetch(`/MutabakatMektup/Download/${id}`, {
        method: "GET",
        headers: {
            // Authorization removed
        },
    });

    if (!response.ok) {
        throw new Error("Mektup indirilemedi");
    }

    const blob = await response.blob();
    const contentDisposition = response.headers.get("content-disposition");
    let fileName = "mutabakat_mektup.pdf";

    if (contentDisposition) {
        const match = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (match && match[1]) {
            fileName = match[1].replace(/['"]/g, "");
        }
    }

    return { blob, fileName };
};

/**
 * Mektubu sil
 */
export const deleteMutabakatMektup = async (
    id: number,
    kullaniciId: number
): Promise<boolean> => {
    const response = await apiFetch(
        `/MutabakatMektup/Delete/${id}?kullaniciId=${kullaniciId}`,
        {
            method: "DELETE",
            headers: {
                accept: "application/json",
            },
        }
    );
    if (!response.ok) {
        console.log("Mektup silinemedi");
        return false;
    }

    return true;
};

/**
 * Dış kullanıcılar için yükleme linki oluştur
 */
export const generateMutabakatUploadLink = async (
    denetciId: number,
    denetlenenId: number,
    yil: number,
    detayKodu: string,
    kullaniciId: number,
    gecerlilikGunSayisi: number = 7,
    aliciAdi?: string,
    hesapAdi?: string,
    aciklama?: string
): Promise<GenerateMutabakatLinkResponse> => {
    const response = await apiFetch("/MutabakatMektup/GenerateLink", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            denetciId,
            denetlenenId,
            yil,
            detayKodu,
            kullaniciId,
            gecerlilikGunSayisi,
            aliciAdi,
            hesapAdi,
            aciklama,
        }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Link oluşturulamadı");
    }

    return response.json();
};

/**
 * Token'ı doğrula (dış uygulama tarafından kullanılır)
 */
export const validateMutabakatToken = async (
    token: string
): Promise<ValidateMutabakatTokenResponse> => {
    const response = await apiFetch("/MutabakatMektup/ValidateToken", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
    });

    if (!response.ok) {
        throw new Error("Token doğrulanamadı");
    }

    return response.json();
};

/**
 * Token ile mektup yükle (dış uygulama tarafından kullanılır)
 */
export const uploadViaMutabakatToken = async (
    token: string,
    file: File
): Promise<MutabakatMektupBelgeDto> => {
    const formData = new FormData();
    formData.append("token", token);
    formData.append("file", file);

    const response = await apiFetch("/MutabakatMektup/UploadViaToken", {
        method: "POST",
        body: formData,
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Mektup yüklenemedi");
    }

    return response.json();
};

/**
 * Belirli bir kayıt için aktif tokenları getir
 */
export const getActiveMutabakatTokens = async (
    denetciId: number,
    denetlenenId: number,
    yil: number,
    detayKodu: string
): Promise<MutabakatUploadToken[]> => {
    const response = await apiFetch(
        `/MutabakatMektup/GetActiveTokens?denetciId=${denetciId}&denetlenenId=${denetlenenId}&yil=${yil}&detayKodu=${encodeURIComponent(
            detayKodu
        )}`,
        {
            method: "GET",
            headers: {
                accept: "application/json",
            },
        }
    );

    if (!response.ok) {
        console.log("Aktif tokenlar getirilemedi");
        return [];
    }

    return response.json();
};
