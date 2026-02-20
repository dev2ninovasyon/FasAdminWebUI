import { apiFetch } from "@/api/apiBase";

export interface RiskAction {
    id: string; // Unique ID for mapping
    text: string;
    link?: string;
}

export interface RiskItem {
    id: string; // Unique ID
    text: string;
    actions: RiskAction[]; // Actions specific to this risk
}

export interface RiskMatrixRow {
    objective: {
        letter: string;
        title?: string;
        items?: string[];
    };
    risks: RiskItem[]; // Updated: Risks now contain their own actions
    // actions: Array<{ text: string; link?: string }>; // REMOVED: Actions are now nested
}

export interface RiskMatrixData {
    rows: RiskMatrixRow[];
}

export interface KysRiskMatrisi {
    id: number;
    kategoriKodu: string;
    baslik: string;
    matrisJson: string; // JSON string of RiskMatrixData
    denetciId?: number;
    denetlenenId?: number;
    yil?: number;
    standartMi: boolean;
}

export const getKysRiskMatrisi = async (
    kategoriKodu: string,
    denetciId?: number,
    denetlenenId?: number,
    yil?: number
): Promise<KysRiskMatrisi | null> => {
    try {
        const params = new URLSearchParams();
        if (denetciId) params.append("denetciId", denetciId.toString());
        if (denetlenenId) params.append("denetlenenId", denetlenenId.toString());
        if (yil) params.append("yil", yil.toString());

        const response = await apiFetch(
            `/KysRiskMatrisi/${kategoriKodu}?${params}`,
            {
                method: "GET",
                headers: {
                    accept: "application/json",
                },
            }
        );

        if (!response.ok) {
            console.log("Risk matrisi getirilemedi:", response.statusText);
            return null;
        }

        return await response.json();
    } catch (error) {
        console.log("Risk matrisi getirilemedi:", error);
        return null;
    }
};

export const updateKysRiskMatrisi = async (
    id: number,
    kategoriKodu: string,
    matrisData: RiskMatrixData,
    baslik: string
): Promise<KysRiskMatrisi | null> => {
    try {
        const response = await apiFetch(`/KysRiskMatrisi/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                id: id,
                kategoriKodu: kategoriKodu,
                matrisJson: JSON.stringify(matrisData),
                baslik: baslik
            }),
        });

        if (!response.ok) {
            console.log("Risk matrisi güncellenemedi:", response.statusText);
            return null;
        }

        return await response.json();
    } catch (error) {
        console.log("Risk matrisi güncellenemedi:", error);
        return null;
    }
};

export const createKysRiskMatrisi = async (
    kategoriKodu: string,
    baslik: string,
    matrisData: RiskMatrixData,
    denetciId?: number,
    denetlenenId?: number,
    yil?: number
): Promise<KysRiskMatrisi | null> => {
    try {
        const response = await apiFetch("/KysRiskMatrisi", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                kategoriKodu,
                baslik,
                matrisJson: JSON.stringify(matrisData),
                denetciId,
                denetlenenId,
                yil,
                standartMi: false,
            }),
        });

        if (!response.ok) {
            console.log("Risk matrisi oluşturulamadı:", response.statusText);
            return null;
        }

        return await response.json();
    } catch (error) {
        console.log("Risk matrisi oluşturulamadı:", error);
        return null;
    }
};
export const getAllKysRiskMatrisi = async (
    denetciId?: number,
    denetlenenId?: number,
    yil?: number
): Promise<KysRiskMatrisi[]> => {
    try {
        const params = new URLSearchParams();
        if (denetciId) params.append("denetciId", denetciId.toString());
        if (denetlenenId) params.append("denetlenenId", denetlenenId.toString());
        if (yil) params.append("yil", yil.toString());

        const response = await apiFetch(`/KysRiskMatrisi?${params}`, {
            method: "GET",
            headers: {
                accept: "application/json",
            },
        });

        if (!response.ok) {
            console.log("Risk matrisleri getirilemedi:", response.statusText);
            return [];
        }

        return await response.json();
    } catch (error) {
        console.log("Risk matrisleri getirilemedi:", error);
        return [];
    }
};

export const generateKysRiskMatrisiFullData = async (
    kategoriKodu: string,
    denetciId: number,
    denetlenenId: number,
    yil: number
): Promise<KysRiskMatrisi | null> => {
    try {
        const params = new URLSearchParams({
            kategoriKodu,
            denetciId: denetciId.toString(),
            denetlenenId: denetlenenId.toString(),
            yil: yil.toString()
        });

        const response = await apiFetch(`/KysRiskMatrisi/Generate?${params}`, {
            method: "POST",
            headers: {
                accept: "application/json"
            }
        });

        if (!response.ok) {
            console.log("Risk matrisi verileri oluşturulamadı:", response.statusText);
            return null;
        }

        return await response.json();
    } catch (error) {
        console.log("Risk matrisi verileri oluşturulamadı:", error);
        return null;
    }
};
