import { apiFetch } from "@/api/apiBase";
import { store } from "@/store/storeConfig";


export const getCalismaKagidiVerileriByDenetciDenetlenenYil = async (
    controller: string,
    denetciId: number,
    denetlenenId: number,
    yil: number
) => {
    try {
        const token = store.getState().userReducer.token;
        const response = await apiFetch(
            `/${controller}/Standart`,
            {
                method: "GET",
                token,
                headers: {
                    accept: "application/json",
                },
            }
        );
        if (response.ok) {
            return response.json();
        } else {
            console.log("Çalışma kağıdı verileri getirilemedi");
        }
    } catch (error) {
        console.log("Bir hata oluştu:", error);
    }
};

export const getCalismaKagidiVerileriByDenetciDenetlenenYilDipnotNo = async (
    controller: string,
    denetciId: number,
    denetlenenId: number,
    yil: number,
    dipnotNo: string
) => {
    try {
        const token = store.getState().userReducer.token;
        const response = await apiFetch(
            `/${controller}/Standart?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}&dipnotNo=${dipnotNo}`,
            {
                method: "GET",
                token,
                headers: {
                    accept: "application/json",
                },
            }
        );
        if (response.ok) {
            return response.json();
        } else {
            console.log("Çalışma kağıdı verileri getirilemedi");
        }
    } catch (error) {
        console.log("Bir hata oluştu:", error);
    }
};

export const getCalismaKagidiVerileriByDenetciDenetlenenKullaniciYil = async (
    controller: string,
    denetciId: number,
    denetlenenId: number,
    kullaniciId: number,
    yil: number
) => {
    try {
        const token = store.getState().userReducer.token;
        const response = await apiFetch(
            `/${controller}/Standart?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}&kullaniciId=${kullaniciId}`,
            {
                method: "GET",
                token,
                headers: {
                    accept: "application/json",
                },
            }
        );
        if (response.ok) {
            return response.json();
        } else {
            console.log("Çalışma kağıdı verileri getirilemedi");
        }
    } catch (error) {
        console.log("Bir hata oluştu:", error);
    }
};

export const getCalismaKagidiVerileriByDenetciDenetlenenYilByKonu = async (
    controller: string,
    denetciId: number,
    denetlenenId: number,
    yil: number,
    konu: string
) => {
    try {
        const token = store.getState().userReducer.token;
        const response = await apiFetch(
            `/${controller}/Standart?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}&konu=${konu}`,
            {
                method: "GET",
                token,
                headers: {
                    accept: "application/json",
                },
            }
        );
        if (response.ok) {
            return response.json();
        } else {
            console.log("Çalışma kağıdı verileri getirilemedi");
        }
    } catch (error) {
        console.log("Bir hata oluştu:", error);
    }
};

export const getCalismaKagidiVerileriByDenetciDenetlenenYilByUrl = async (
    controller: string,
    denetciId: number,
    denetlenenId: number,
    yil: number,
    formUrl: string
) => {
    try {
        const token = store.getState().userReducer.token;
        const response = await apiFetch(
            `/${controller}/Standart?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}&url=${formUrl}`,
            {
                method: "GET",
                token,
                headers: {
                    accept: "application/json",
                },
            }
        );
        if (response.ok) {
            return response.json();
        } else {
            console.log("Çalışma kağıdı verileri getirilemedi");
        }
    } catch (error) {
        console.log("Bir hata oluştu:", error);
    }
};

export const createCalismaKagidiVerisi = async (
    controller: string,
    createdCalismaKagidiVerisi: any
) => {
    try {
        const response = await apiFetch(`/${controller}`, {
            method: "POST",
            headers: {
                accept: "*/*",
                "Content-Type": "application/json",
            },
            body: JSON.stringify(createdCalismaKagidiVerisi),
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

export const updateCalismaKagidiVerisi = async (
    controller: string,
    id: any,
    updatedCalismaKagidiVerisi: any
) => {
    try {
        const response = await apiFetch(`/${controller}/${id}`, {
            method: "PUT",
            headers: {
                accept: "*/*",
                "Content-Type": "application/json",
            },
            body: JSON.stringify(updatedCalismaKagidiVerisi),
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

export const updateAllCalismaKagidiVerisi = async (
    controller: string,
    updatedAllCalismaKagidiVerisi: any
) => {
    try {
        const response = await apiFetch(`/${controller}/Hepsi`, {
            method: "PUT",
            headers: {
                accept: "*/*",
                "Content-Type": "application/json",
            },
            body: JSON.stringify(updatedAllCalismaKagidiVerisi),
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

export const updateOtomatikCalismaKagidiVerisi = async (
    controller: string,
    denetciId: number,
    denetlenenId: number,
    yil: number
) => {
    try {
        const response = await apiFetch(
            `/${controller}?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}`,
            {
                method: "PUT",
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

export const deleteCalismaKagidiVerisiById = async (
    controller: string,
    id: any
) => {
    try {
        const response = await apiFetch(`/${controller}/${id}`, {
            method: "DELETE",
            headers: {
                accept: "application/json",
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

export const deleteAllCalismaKagidiVerileri = async (
    controller: string,
    denetciId: number,
    denetlenenId: number,
    yil: number
) => {
    try {
        const response = await apiFetch(
            `/${controller}?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}`,
            {
                method: "DELETE",
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

export const deleteAllCalismaKagidiVerileriByDipnotNo = async (
    controller: string,
    denetciId: number,
    denetlenenId: number,
    yil: number,
    dipnotNo: string
) => {
    try {
        const response = await apiFetch(
            `/${controller}?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}&dipnotNo=${dipnotNo}`,
            {
                method: "DELETE",
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

export const deleteAllCalismaKagidiVerileriByKullanci = async (
    controller: string,
    denetciId: number,
    denetlenenId: number,
    kullaniciId: number,
    yil: number
) => {
    try {
        const response = await apiFetch(
            `/${controller}?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}&kullaniciId=${kullaniciId}`,
            {
                method: "DELETE",
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

export const deleteAllCalismaKagidiVerileriByKonu = async (
    controller: string,
    denetciId: number,
    denetlenenId: number,
    yil: number,
    konu: string
) => {
    try {
        const response = await apiFetch(
            `/${controller}?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}&konu=${konu}`,
            {
                method: "DELETE",
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

export const deleteAllCalismaKagidiVerileriByUrl = async (
    controller: string,
    denetciId: number,
    denetlenenId: number,
    yil: number,
    formUrl: string
) => {
    try {
        const response = await apiFetch(
            `/${controller}?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}&url=${formUrl}`,
            {
                method: "DELETE",
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

export const getFormHazirlayanOnaylayanByDenetciDenetlenenYilFormKodu = async (
    denetciId: number,
    denetlenenId: number,
    yil: number,
    formKodu: string
) => {
    try {
        const response = await apiFetch(
            `/FormHazirlayanOnaylayan/${denetciId}/${yil}/${denetlenenId}/${formKodu}`,
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
            console.log("Form Hazırlayan Onaylayan verileri getirilemedi");
        }
    } catch (error) {
        console.log("Bir hata oluştu:", error);
    }
};

export const updateFormHazirlayanOnaylayan = async (
    id: any,
    updatedFormHazirlayanOnaylayanVerisi: any,
    control: boolean
) => {
    try {
        const response = await apiFetch(
            `/FormHazirlayanOnaylayan/${id}/${control}`,
            {
                method: "PUT",
                headers: {
                    accept: "*/*",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(updatedFormHazirlayanOnaylayanVerisi),
            }
        );

        if (response.ok) {
            return true;
        } else {
            const contentType = response.headers.get("content-type");
            let message = "Hata Oluştu";
            if (contentType && contentType.includes("application/json")) {
                const errorData = await response.json();
                message = errorData || message;
            } else {
                message = await response.text();
            }

            return { message };
        }
    } catch (error) {
        console.log("Bir hata oluştu:", error);
    }
};
export async function uploadEkBelge(
    formData: FormData
): Promise<boolean | { success: boolean; message?: string }> {
    try {
        const response = await apiFetch(
            `/CalismaKagitlari/upload-ek-belge`,
            {
                method: "POST",
                headers: {
                    // Authorization removed

                    // â— DİKKAT: Burada "Content-Type" KESİNLİKLE yazılmaz.
                    // Çünkü FormData kendi boundary bilgisini oluşturur.
                },
                body: formData,
            }
        );

        if (response.ok) {
            return true;
        }

        const data = await response.json().catch(() => null);

        return {
            success: false,
            message: data?.message || "Ek belge yüklenemedi",
        };
    } catch (error) {
        console.log("uploadEkBelge hata:", error);
        return {
            success: false,
            message: "Sunucuya bağlanırken bir hata oluştu.",
        };
    }
}
