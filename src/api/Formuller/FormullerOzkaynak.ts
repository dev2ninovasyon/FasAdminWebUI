import { apiFetch } from "@/api/apiBase";

export const getFormullerOzkaynak = async (
  token: string,
  denetimTuru: string
) => {
  try {
    const response = await apiFetch(
      `/FinansalTablolar/FormullerOzkaynakByDenetimTuru?denetimTuru=${denetimTuru}`,
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

export const updateFormullerOzkaynak = async (
  token: string,
  updatedFormulVerileri: any
) => {
  try {
    const response = await apiFetch(`/FinansalTablolar/FormullerOzkaynak`, {
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
