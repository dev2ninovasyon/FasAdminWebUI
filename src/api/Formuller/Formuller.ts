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
      return [];
    }
  } catch (error) {
    return [];
  }
};

export const updateFormuller = async (
  token: string,
  updatedFormulVerileri: any
) => {
  try {
    const response = await apiFetch("/FinansalTablolar/Formuller", {
      method: "PUT",
      headers: {
        accept: "*/*",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updatedFormulVerileri),
    });

    return response.ok;
  } catch (error) {
    return false;
  }
};
