import { apiFetch } from "@/api/apiBase";

export interface DegerlemeveDegerDusukluguKontrolleriResponseDto {
    donusumMizanBobi: any[];
}

export const getDegerlemeveDegerDusukluguKontrolleri = async (
    denetlenenId: number,
    yil: number,
    dipnotNumarasi: string
) => {
    try {
        const response = await apiFetch(
            `/DegerlemeveDegerDusukluguKontrolleri/GetDegerlemeveDegerDusukluguKontrolleri?denetlenenId=${denetlenenId}&yil=${yil}&dipnotNumarasi=${dipnotNumarasi}`,
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
            console.log("Değerleme ve Değer Düşüklüğü Kontrolleri verileri alınırken hata oluştu:", response.status);
            throw new Error(`API Error: ${response.status}`);
        }
    } catch (error) {
        console.log("Değerleme ve Değer Düşüklüğü Kontrolleri verileri alınırken hata oluştu:", error);
        throw error;
    }
};
