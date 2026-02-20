import { apiFetch } from "@/api/apiBase";

export const getOnemlilikVeOrneklemSeviyesi = async (
    denetciId: number,
    denetlenenId: number,
    yil: number
) => {
    try {
        const response = await apiFetch(
            `/PlanVeProgram/OnemlilikVeOrneklemSeviyesi?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}`,
            {
                method: "GET",
                headers: {
                    accept: "application/json",
                },
            }
        );
        if (response.ok) {
            return response.json();
        } else {
            console.log("Önemlilik Ve Örneklem Seviyesi getirilemedi");
        }
    } catch (error) {
        console.log("Bir hata oluştu:", error);
    }
};

export const createOnemlilikVeOrneklem = async (
    denetciId: number,
    yil: number,
    denetlenenId: number,
    guvenilirlikDuzeyi: number,
    hataPayi: number
) => {
    try {
        const response = await apiFetch(
            `/PlanVeProgram/OnemlilikVeOrneklemHesapla?denetciId=${denetciId}&denetlenenId=${denetlenenId}&yil=${yil}&guvenilirlikDuzeyi=${guvenilirlikDuzeyi}&hataPayi=${hataPayi}`,
            {
                method: "POST",
                headers: {
                    accept: "*/*",
                    "Content-Type": "application/json",
                },
            }
        );

        if (response.ok) {
            return true;
        } else {
            return false;
        }
    } catch (error) {
        console.log("Bir hata oluştu:", error);
    }
};

export const getOnemlilikVeOrneklem = async (
    denetciId: number,
    denetlenenId: number,
    yil: number
) => {
    try {
        const response = await apiFetch(
            `/PlanVeProgram/OnemlilikVeOrneklem?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}`,
            {
                method: "GET",
                headers: {
                    accept: "application/json",
                },
            }
        );
        if (response.ok) {
            return response.json();
        } else {
            console.log("Önemlilik Ve Örneklem getirilemedi");
        }
    } catch (error) {
        console.log("Bir hata oluştu:", error);
    }
};

export const updateOnemlilikVeOrneklem = async (
    updatedOnemlilikVeOrneklem: any
) => {
    try {
        const response = await apiFetch(`/PlanVeProgram/OnemlilikVeOrneklem`, {
            method: "PUT",
            headers: {
                accept: "*/*",
                "Content-Type": "application/json",
            },
            body: JSON.stringify(updatedOnemlilikVeOrneklem),
        });

        if (response.ok) {
            return true;
        } else {
            return false;
        }
    } catch (error) {
        console.log("Bir hata oluştu:", error);
    }
};

export const createOnemlilikVeOrneklemHesaplamaBazi = async (
    denetciId: number,
    yil: number,
    denetlenenId: number,
    json: any
) => {
    try {
        const response = await apiFetch(
            `/PlanVeProgram/OnemlilikVeOrneklemHesaplamaBazi?denetciId=${denetciId}&denetlenenId=${denetlenenId}&yil=${yil}`,
            {
                method: "POST",
                headers: {
                    accept: "*/*",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(json),
            }
        );

        if (response.ok) {
            return true;
        } else {
            return false;
        }
    } catch (error) {
        console.log("Bir hata oluştu:", error);
    }
};

export const getOnemlilikVeOrneklemHesaplamaBazi = async (
    denetciId: number,
    denetlenenId: number,
    yil: number
) => {
    try {
        const response = await apiFetch(
            `/PlanVeProgram/OnemlilikVeOrneklemHesaplamaBazi?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}`,
            {
                method: "GET",
                headers: {
                    accept: "application/json",
                },
            }
        );
        if (response.status == 200) {
            return response.json();
        } else {
            console.log("Önemlilik Ve Örneklem Hesaplama Bazı getirilemedi");
        }
    } catch (error) {
        console.log("Bir hata oluştu:", error);
    }
};

export const updateOnemlilikVeOrneklemHesaplamaBazi = async (
    json: any
) => {
    try {
        const response = await apiFetch(
            `/PlanVeProgram/OnemlilikVeOrneklemHesaplamaBazi`,
            {
                method: "PUT",
                headers: {
                    accept: "*/*",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(json),
            }
        );

        if (response.ok) {
            return true;
        } else {
            return false;
        }
    } catch (error) {
        console.log("Bir hata oluştu:", error);
    }
};

export const createFinansalTabloKalemlerindeDegisim = async (
    denetciId: number,
    yil: number,
    denetlenenId: number
) => {
    try {
        const response = await apiFetch(
            `/PlanVeProgram/FinansalTabloKalemlerindeDegisimHesapla?denetciId=${denetciId}&denetlenenId=${denetlenenId}&yil=${yil}`,
            {
                method: "POST",
                headers: {
                    accept: "*/*",
                    "Content-Type": "application/json",
                },
            }
        );

        if (response.ok) {
            return true;
        } else {
            return false;
        }
    } catch (error) {
        console.log("Bir hata oluştu:", error);
    }
};

export const getFinansalTabloKalemlerindeDegisim = async (
    denetciId: number,
    denetlenenId: number,
    yil: number
) => {
    try {
        const response = await apiFetch(
            `/PlanVeProgram/FinansalTabloKalemlerindeDegisim?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}`,
            {
                method: "GET",
                headers: {
                    accept: "application/json",
                },
            }
        );
        if (response.ok) {
            return response.json();
        } else {
            console.log("Finansal Tablo Kalemlerinde Değişim getirilemedi");
        }
    } catch (error) {
        console.log("Bir hata oluştu:", error);
    }
};

export const updateFinansalTabloKalemlerindeDegisim = async (
    updatedFinansalTabloKalemlerindeDegisim: any
) => {
    try {
        const response = await apiFetch(
            `/PlanVeProgram/FinansalTabloKalemlerindeDegisim`,
            {
                method: "PUT",
                headers: {
                    accept: "*/*",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(updatedFinansalTabloKalemlerindeDegisim),
            }
        );

        if (response.ok) {
            return true;
        } else {
            return false;
        }
    } catch (error) {
        console.log("Bir hata oluştu:", error);
    }
};

export const createBulguRiskiBelirleme = async (
    denetciId: number,
    yil: number,
    denetlenenId: number,
    girilenRisk: number
) => {
    try {
        const response = await apiFetch(
            `/PlanVeProgram/BulguRiskiBelirlemeHesapla?denetciId=${denetciId}&denetlenenId=${denetlenenId}&yil=${yil}&girilenRisk=${girilenRisk}`,
            {
                method: "POST",
                headers: {
                    accept: "*/*",
                    "Content-Type": "application/json",
                },
            }
        );

        if (response.ok) {
            return true;
        } else {
            return false;
        }
    } catch (error) {
        console.log("Bir hata oluştu:", error);
    }
};

export const getBulguRiskiBelirleme = async (
    denetciId: number,
    yil: number,
    denetlenenId: number
) => {
    try {
        const response = await apiFetch(
            `/PlanVeProgram/BulguRiskiBelirleme?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}`,
            {
                method: "GET",
                headers: {
                    accept: "application/json",
                },
            }
        );
        if (response.status == 200) {
            return response.json();
        } else {
            console.log("Bulgu Riski Belirleme getirilemedi");
        }
    } catch (error) {
        console.log("Bir hata oluştu:", error);
    }
};

export const getFisBuyukluguAnaliziYillik = async (
    denetciId: number,
    yil: number,
    denetlenenId: number,
    sadeceVerisiOlanAylar: boolean
) => {
    try {
        const response = await apiFetch(
            `/PlanVeProgram/FisBuyukluguAnalizi?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}`,
            {
                method: "GET",
                headers: {
                    accept: "application/json",
                },
            }
        );
        if (response.status == 200) {
            return response.json();
        } else {
            console.log("Fiş Büyüklüğü Analizi getirilemedi");
        }
    } catch (error) {
        console.log("Bir hata oluştu:", error);
    }
};

export const upsertFisBuyukluguAylikNot = async (
    denetciId: number,
    yil: number,
    denetlenenId: number,
    ay: number,
    not: string
) => {
    try {
        const response = await apiFetch(
            `/PlanVeProgram/UpdateFisBuyukluguAnalizi`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    accept: "application/json",
                },
                body: JSON.stringify({
                    denetciId,
                    denetlenenId,
                    yil,
                    ay,
                    not,
                }),
            }
        );

        if (response.status === 200) {
            const data = await response.json();
            return data;
        } else {
            console.log("Fiş büyüklüğü notu kaydedilemedi");
        }
    } catch (error) {
        console.log("Bir hata oluştu:", error);
    }
};
