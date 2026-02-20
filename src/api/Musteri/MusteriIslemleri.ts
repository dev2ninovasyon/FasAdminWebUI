import { apiFetch } from "@/api/apiBase";

export const getSirketYonetimKadrosuByDenetlenenId = async (
    denetlenenId: number
) => {
    try {
        // Admin panelinde standart verileri getirmek için /Standart ekleniyor
        const response = await apiFetch(`/Denetlenen/SirketYonetimKadrosu/Standart`, {
            method: "GET",
            headers: {
                accept: "application/json",
            },
        });
        if (response.ok) {
            return response.json();
        } else {
            console.log("Standart Şirket Yönetim Kadrosu verileri getirilemedi");
        }
    } catch (error) {
        console.log("Bir hata oluştu:", error);
    }
};

export const createSirketYonetimKadrosu = async (
    createdSirketYonetimKadrosu: any
) => {
    try {
        const response = await apiFetch(`/Denetlenen/SirketYonetimKadrosu/Standart`, {
            method: "POST",
            headers: {
                accept: "*/*",
                "Content-Type": "application/json",
            },
            body: JSON.stringify(createdSirketYonetimKadrosu),
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

export const updateSirketYonetimKadrosu = async (
    id: any,
    updatedSirketYonetimKadrosu: any
) => {
    try {
        const response = await apiFetch(`/Denetlenen/SirketYonetimKadrosu/Standart/${id}`, {
            method: "PUT",
            headers: {
                accept: "*/*",
                "Content-Type": "application/json",
            },
            body: JSON.stringify(updatedSirketYonetimKadrosu),
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

export const deleteSirketYonetimKadrosuById = async (id: number) => {
    try {
        const response = await apiFetch(`/Denetlenen/SirketYonetimKadrosu/Standart/${id}`, {
            method: "DELETE",
            headers: {
                accept: "*/*",
            },
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

export const getSirketYonetimKadrosuById = async (id: any) => {
    try {
        const response = await apiFetch(`/Denetlenen/SirketYonetimKadrosu/Standart/${id}`, {
            method: "GET",
            headers: {
                accept: "*/*",
            },
        });
        if (response.ok) {
            return response.json();
        } else {
            console.log("Standart Şirket Yönetim Kadrosu getirilemedi");
        }
    } catch (error) {
        console.log("Bir hata oluştu:", error);
    }
};

export const getSubelerByDenetlenenId = async (
    denetlenenId: number
) => {
    try {
        const response = await apiFetch(`/Denetlenen/Subeler/Standart`, {
            method: "GET",
            headers: {
                accept: "application/json",
            },
        });
        if (response.ok) {
            return response.json();
        } else {
            console.log("Standart Şubeler verileri getirilemedi");
        }
    } catch (error) {
        console.log("Bir hata oluştu:", error);
    }
};

export const createSubeler = async (createdSubeler: any) => {
    try {
        const response = await apiFetch(`/Denetlenen/Subeler/Standart`, {
            method: "POST",
            headers: {
                accept: "*/*",
                "Content-Type": "application/json",
            },
            body: JSON.stringify(createdSubeler),
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

export const updateSubeler = async (
    id: any,
    updatedSubeler: any
) => {
    try {
        const response = await apiFetch(`/Denetlenen/Subeler/Standart/${id}`, {
            method: "PUT",
            headers: {
                accept: "*/*",
                "Content-Type": "application/json",
            },
            body: JSON.stringify(updatedSubeler),
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

export const deleteSubelerById = async (id: number) => {
    try {
        const response = await apiFetch(`/Denetlenen/Subeler/Standart/${id}`, {
            method: "DELETE",
            headers: {
                accept: "*/*",
            },
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

export const getSubelerById = async (id: any) => {
    try {
        const response = await apiFetch(`/Denetlenen/Subeler/Standart/${id}`, {
            method: "GET",
            headers: {
                accept: "*/*",
            },
        });
        if (response.ok) {
            return response.json();
        } else {
            console.log("Standart Şube getirilemedi");
        }
    } catch (error) {
        console.log("Bir hata oluştu:", error);
    }
};

export const getHissedarlarByDenetlenenIdYil = async (
    denetlenenId: number,
    yil: number
) => {
    try {
        const response = await apiFetch(`/Denetlenen/Hissedarlar/Standart`, {
            method: "GET",
            headers: {
                accept: "application/json",
            },
        });
        if (response.ok) {
            return response.json();
        } else {
            console.log("Standart Hissedarlar verileri getirilemedi");
        }
    } catch (error) {
        console.log("Bir hata oluştu:", error);
    }
};

export const createHissedarlar = async (
    createdHissedarlar: any
) => {
    try {
        const response = await apiFetch(`/Denetlenen/Hissedarlar/Standart`, {
            method: "POST",
            headers: {
                accept: "*/*",
                "Content-Type": "application/json",
            },
            body: JSON.stringify(createdHissedarlar),
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

export const updateHissedarlar = async (
    id: any,
    updatedHissedarlar: any
) => {
    try {
        const response = await apiFetch(`/Denetlenen/Hissedarlar/Standart/${id}`, {
            method: "PUT",
            headers: {
                accept: "*/*",
                "Content-Type": "application/json",
            },
            body: JSON.stringify(updatedHissedarlar),
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

export const deleteHissedarlarById = async (id: number) => {
    try {
        const response = await apiFetch(`/Denetlenen/Hissedarlar/Standart/${id}`, {
            method: "DELETE",
            headers: {
                accept: "*/*",
            },
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

export const getHissedarlarById = async (id: any) => {
    try {
        const response = await apiFetch(`/Denetlenen/Hissedarlar/Standart/${id}`, {
            method: "GET",
            headers: {
                accept: "*/*",
            },
        });
        if (response.ok) {
            return response.json();
        } else {
            console.log("Standart Hissedarlar getirilemedi");
        }
    } catch (error) {
        console.log("Bir hata oluştu:", error);
    }
};

export const getMizandanHissedarlarByDenetlenenIdYil = async (
    denetlenenId: number,
    yil: number
) => {
    try {
        const response = await apiFetch(
            `/Denetlenen/MizandanHissedarlar/Standart`,
            {
                method: "GET",
                headers: {
                    accept: "application/json",
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

export const getDenetlenenByDenetciId = async (denetciId: number) => {
    try {
        const response = await apiFetch(`/Denetlenen/ByDenetciId/${denetciId}`, {
            method: "GET",
            headers: {
                accept: "application/json",
            },
        });
        if (response.ok) {
            return await response.json();
        } else {
            console.log("Denetlenen verileri getirilemedi");
            return [];
        }
    } catch (error) {
        console.log("Bir hata oluştu:", error);
        return [];
    }
};

export const getDenetlenenByRol = async (denetciId: number, userId: number) => {
    try {
        const response = await apiFetch(`/Denetlenen/ByRol?denetciId=${denetciId}&userId=${userId}`, {
            method: "GET",
            headers: {
                accept: "application/json",
            },
        });
        if (response.ok) {
            return await response.json();
        } else {
            console.log("Rol bazlı denetlenen verileri getirilemedi");
            return [];
        }
    } catch (error) {
        console.log("Bir hata oluştu:", error);
        return [];
    }
};

export const getDenetlenenById = async (id: number) => {
    try {
        const response = await apiFetch(`/Denetlenen/${id}`, {
            method: "GET",
            headers: {
                accept: "application/json",
            },
        });
        if (response.ok) {
            return await response.json();
        } else {
            console.log("Denetlenen verileri getirilemedi");
            return null;
        }
    } catch (error) {
        console.log("Bir hata oluştu:", error);
        return null;
    }
};
