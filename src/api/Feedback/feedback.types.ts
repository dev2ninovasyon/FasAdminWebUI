export type FeedbackSentiment = 1 | 2 | 3 | 4 | 5;

export type FeedbackType =
  | "KullanimKolayligi"
  | "GorselTasarim"
  | "HizPerformans"
  | "VeriDogrulugu"
  | "EksikOzellik"
  | "HataBug"
  | "Oneri"
  | "Diger";

export type FeedbackStatus =
  | "Yeni"
  | "Inceleniyor"
  | "Cozuldu"
  | "Kapatildi"
  | "YanitaIhtiyacVar";

export type ColorVariant =
  | "primary"
  | "secondary"
  | "success"
  | "warning"
  | "error"
  | "info"
  | "neutral";

export interface FeedbackResponse {
  id: number;
  userId?: number;
  userName?: string;
  pageKey: string;
  pageTitle?: string;
  route?: string;
  moduleKey?: string;
  sentiment: FeedbackSentiment;
  feedbackType?: FeedbackType;
  comment?: string;
  wantsContact: boolean;
  status: FeedbackStatus;
  adminNote?: string;
  browserInfo?: string;
  appVersion?: string;
  queryContext?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FeedbackAdminFilter {
  pageKey?: string;
  route?: string;
  moduleKey?: string;
  feedbackType?: FeedbackType;
  sentiment?: FeedbackSentiment;
  status?: FeedbackStatus;
  userId?: number;
  dateFrom?: string;
  dateTo?: string;
  wantsContact?: boolean;
  page?: number;
  pageSize?: number;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface TopPageDto {
  pageKey: string;
  pageTitle?: string;
  count: number;
  averageSentiment: number;
}

export interface FeedbackAdminSummary {
  totalCount: number;
  last7DaysCount: number;
  unreviewedCount: number;
  averageSentiment: number;
  sentimentDistribution: Record<string, number>;
  topPages: TopPageDto[];
}

export const SENTIMENT_LABELS: Record<FeedbackSentiment, string> = {
  5: "Çok Memnun",
  4: "Memnun",
  3: "Nötr",
  2: "Memnun Değil",
  1: "Çok Memnun Değil",
};

export const FEEDBACK_TYPE_LABELS: Record<FeedbackType, string> = {
  KullanimKolayligi: "Kullanım Kolaylığı",
  GorselTasarim: "Görsel Tasarım",
  HizPerformans: "Hız / Performans",
  VeriDogrulugu: "Veri Doğruluğu",
  EksikOzellik: "Eksik Özellik",
  HataBug: "Hata / Bug",
  Oneri: "Öneri",
  Diger: "Diğer",
};

export const FEEDBACK_STATUS_LABELS: Record<FeedbackStatus, string> = {
  Yeni: "Yeni",
  Inceleniyor: "İnceleniyor",
  Cozuldu: "Çözüldü",
  Kapatildi: "Kapatıldı",
  YanitaIhtiyacVar: "Yanıta İhtiyaç Var",
};

export const STATUS_COLOR: Record<
  FeedbackStatus,
  "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning"
> = {
  Yeni: "info",
  Inceleniyor: "warning",
  Cozuldu: "success",
  Kapatildi: "default",
  YanitaIhtiyacVar: "error",
};

export const SENTIMENT_COLOR: Record<
  FeedbackSentiment,
  "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning"
> = {
  5: "success",
  4: "primary",
  3: "default",
  2: "warning",
  1: "error",
};
