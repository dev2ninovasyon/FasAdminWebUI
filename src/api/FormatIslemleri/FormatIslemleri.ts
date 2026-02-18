import { apiFetch } from "@/api/apiBase";
import { apiFetch } from "@/api/apiBase";

export const getFormatlar = async (token: string) => {
  try {
    const response = await apiFetch(`/Format/Hepsi`, {
      method: "GET",
      token: token
    });
    if (response.ok) {
      return response.json();
    } else {
      console.error("Formatlar getirilemedi");
      return [];
    }
  } catch (error) {
    return [];
  }
};

export const getFormatById = async (token: string, id: any) => {
  try {
    const response = await apiFetch(`/Format/${id}`, {
    const response = await apiFetch(`/Format/${id}`, {
      method: "GET",
      token: token
    });
    if (response.ok) {
      return response.json();
    } else {
      console.error("Format getirilemedi");
      return {};
    }
  } catch (error) {
    return {};
  }
};

export const createFormat = async (token: string, createdFormat: any) => {
  try {
    const response = await apiFetch(`/Format`, {
      method: "POST",
      token: token,
      body: JSON.stringify(createdFormat),
    });

    return response.ok;
    return response.ok;
  } catch (error) {
    console.error("Bir hata oluştu:", error);
    return false;
  }
};

export const updateFormat = async (
  token: string,
  id: any,
  updatedFormat: any
) => {
  try {
    const response = await apiFetch(`/Format/${id}`, {
    const response = await apiFetch(`/Format/${id}`, {
      method: "PUT",
      token: token,
      body: JSON.stringify(updatedFormat),
    });

    return response.ok;
    return response.ok;
  } catch (error) {
    console.error("Bir hata oluştu:", error);
    return false;
  }
};

export const deleteFormatById = async (token: string, id: number) => {
  try {
    const response = await apiFetch(`/Format/${id}`, {
    const response = await apiFetch(`/Format/${id}`, {
      method: "DELETE",
      token: token
    });

    return response.ok;
    return response.ok;
  } catch (error) {
    console.error("Bir hata oluştu:", error);
    return false;
  }
};
