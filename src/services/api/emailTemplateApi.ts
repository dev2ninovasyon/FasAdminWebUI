/**
 * Email Template API Client
 * Handles all email template management API calls
 */

import { apiFetch } from "@/api/apiBase";
import { getStoredAuthTokens } from "@/utils/authStorage";

export interface EmailTemplate {
  id?: number;
  templateKey: string;
  name: string;
  subject: string;
  mjmlContent: string;
  htmlContent?: string;
  version?: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  updatedBy?: string;
  supportedVariables?: string[] | string;
}

export interface CreateEmailTemplateDto {
  templateKey: string;
  name: string;
  subject: string;
  mjmlContent: string;
}

export interface UpdateEmailTemplateDto {
  name: string;
  subject: string;
  mjmlContent: string;
  isActive: boolean;
}

export interface PreviewResponseDto {
  html: string;
}

export interface VariablesResponseDto {
  variables: string[];
}

export interface ApiResponse<T> {
  data?: T;
  message?: string;
  isSuccess?: boolean;
}

class EmailTemplateApiService {
  private readonly endpoint = "/EmailTemplateManagement";

  async getAllTemplates(): Promise<EmailTemplate[]> {
    try {
      const response = await apiFetch(this.endpoint, {
        method: "GET",
        token: this.getToken(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch templates: ${response.statusText}`);
      }

      const result = await response.json();
      return result.data || result || [];
    } catch (error) {
      console.error("Error fetching email templates:", error);
      throw error;
    }
  }

  async getTemplateById(id: number): Promise<EmailTemplate> {
    try {
      const response = await apiFetch(`${this.endpoint}/${id}`, {
        method: "GET",
        token: this.getToken(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch template: ${response.statusText}`);
      }

      const result = await response.json();
      return result.data || result;
    } catch (error) {
      console.error(`Error fetching template ${id}:`, error);
      throw error;
    }
  }

  async createTemplate(
    template: CreateEmailTemplateDto
  ): Promise<EmailTemplate> {
    try {
      const response = await apiFetch(this.endpoint, {
        method: "POST",
        token: this.getToken(),
        body: JSON.stringify(template),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message ||
            `Failed to create template: ${response.statusText}`
        );
      }

      const result = await response.json();
      return result.data || result;
    } catch (error) {
      console.error("Error creating email template:", error);
      throw error;
    }
  }

  async updateTemplate(
    id: number,
    template: UpdateEmailTemplateDto
  ): Promise<EmailTemplate> {
    try {
      const response = await apiFetch(`${this.endpoint}/${id}`, {
        method: "PUT",
        token: this.getToken(),
        body: JSON.stringify(template),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message ||
            `Failed to update template: ${response.statusText}`
        );
      }

      const result = await response.json();
      return result.data || result;
    } catch (error) {
      console.error(`Error updating template ${id}:`, error);
      throw error;
    }
  }

  async deleteTemplate(id: number): Promise<boolean> {
    try {
      const response = await apiFetch(`${this.endpoint}/${id}`, {
        method: "DELETE",
        token: this.getToken(),
      });

      if (!response.ok) {
        throw new Error(`Failed to delete template: ${response.statusText}`);
      }

      return true;
    } catch (error) {
      console.error(`Error deleting template ${id}:`, error);
      throw error;
    }
  }

  async previewTemplate(
    id: number,
    variables: Record<string, string>
  ): Promise<string> {
    try {
      const response = await apiFetch(`${this.endpoint}/${id}/preview`, {
        method: "POST",
        token: this.getToken(),
        body: JSON.stringify({ variables }),
      });

      if (!response.ok) {
        throw new Error(`Failed to preview template: ${response.statusText}`);
      }

      const result = await response.json();
      return result.data?.html || result.html || "";
    } catch (error) {
      console.error(`Error previewing template ${id}:`, error);
      throw error;
    }
  }

  async getTemplateVariables(templateKey: string): Promise<string[]> {
    try {
      const response = await apiFetch(`${this.endpoint}/${templateKey}/variables`, {
        method: "GET",
        token: this.getToken(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch variables: ${response.statusText}`);
      }

      const result = await response.json();
      return result.data?.variables || result.variables || [];
    } catch (error) {
      console.error(`Error fetching variables for ${templateKey}:`, error);
      throw error;
    }
  }

  private getToken(): string {
    if (typeof window === "undefined") {
      return "";
    }

    const storedTokens = getStoredAuthTokens();
    if (storedTokens.token) {
      return storedTokens.token;
    }

    try {
      const persistedRoot = localStorage.getItem("persist:root");
      if (!persistedRoot) {
        return "";
      }

      const parsedRoot = JSON.parse(persistedRoot);
      const parsedUserReducer = parsedRoot?.userReducer
        ? JSON.parse(parsedRoot.userReducer)
        : null;

      return parsedUserReducer?.token || "";
    } catch {
      return "";
    }
  }
}

export const emailTemplateApi = new EmailTemplateApiService();

export default EmailTemplateApiService;
