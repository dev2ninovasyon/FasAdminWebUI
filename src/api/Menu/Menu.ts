import { apiFetch } from "../apiBase";

export interface Menu {
    id: number;
    dosyaNevi?: string;
    belgeAdi?: string;
    referansNo?: string;
    formKodu?: string;
    icon?: string;
    parentId?: number;
    formUrl?: string;
    arsivKlasorAdi?: string;
    bobimi?: number;
    tfrsmi?: number;
    arsivAdi?: string;
    sira?: number;
}

export interface MenuKullanimBilgisi {
    id: number;
    menuId: number;
    baslik?: string;
    ozet?: string;
    kullanimNotu?: string;
    kullanimAdimlariJson?: string;
    dikkatEdileceklerJson?: string;
    sikSorulanSorularJson?: string;
    videoUrl?: string;
    videoBaslik?: string;
    videoAciklama?: string;
    hitCount: number;
    eklenmeTarihi: string;
    ekleyenKullaniciId?: number | string;
}

export const getMenus = async (token: string) => {
    const response = await apiFetch("/Menu", { token });
    if (!response.ok) {
        throw new Error(`Menu istegi basarisiz oldu: ${response.status}`);
    }
    return await response.json();
};

export const getMenuUsageByMenuId = async (token: string, menuId: number) => {
    const response = await apiFetch(`/Menu/${menuId}/Usage`, { token });
    return await response.json();
};

export const upsertMenuUsage = async (token: string, menuId: number, usage: Partial<MenuKullanimBilgisi>) => {
    const response = await apiFetch(`/Menu/${menuId}/Usage`, {
        method: "POST",
        body: JSON.stringify(usage),
        token
    });
    return await response.json();
};
