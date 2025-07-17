import { url } from "@/api/apiBase";

export const getFormullerOzkaynak = async (
  token: string,
  denetimTuru: string
) => {
  try {
    const response = await fetch(
      `${url}/FinansalTablolar/FormullerOzkaynakByDenetimTuru?denetimTuru=${denetimTuru}`,
      {
        method: "GET",
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
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
    const response = await fetch(`${url}/FinansalTablolar/FormullerOzkaynak`, {
      method: "PUT",
      headers: {
        accept: "*/*",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updatedFormulVerileri),
    });

    if (response.ok) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};
