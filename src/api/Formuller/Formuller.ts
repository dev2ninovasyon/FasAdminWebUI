import { apiFetch } from "@/api/apiBase";

export const getFormuller = async (
  token: string,
  denetimTuru: string,
  finansalTabloAdi: string
) => {
  try {
    const response = await apiFetch(
      `/FinansalTablolar/FormullerByDenetimTuruFinansalTabloAdi?denetimTuru=${denetimTuru}&finansalTabloAdi=${finansalTabloAdi}`,
      {
        method: "GET",
        token: token
      }
    );
    if (response.ok) {
      return response.json();
    } else {
      console.error("Formul verileri getirilemedi");
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};

export const updateFormuller = async (
  token: string,
  updatedFormulVerileri: any
) => {
  try {
    const response = await apiFetch(`/FinansalTablolar/Formuller`, {
      method: "PUT",
      token: token,
      body: JSON.stringify(updatedFormulVerileri),
    });

    return response.ok;
  } catch (error) {
    console.error("Bir hata oluştu:", error);
    return false;
  }
};
