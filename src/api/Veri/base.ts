import { apiFetch } from "@/api/apiBase";


export const getFormat = async (name: string) => {
  try {
    const response = await apiFetch(`/Format/ByAdi/${name}`, {
      method: "GET",
      headers: {
        accept: "application/json",
      },
      suppressErrorLog: true,
    });
    if (response?.ok) {
      return await response.json();
    } else {
      return null;
    }
  } catch (error) {
    return null;
  }
};
