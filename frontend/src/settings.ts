import { API_BASE_URL } from "./api";

export type AppSettings = {
  schoolName: string;
  academicYearStart: number;
  aiInsightsEnabled: boolean;
  defaultLandingPage: "dashboard" | "students" | "teachers" | "reports" | "settings";
  lateThresholdMinutes: number;
  validAcademicYearStarts: number[];
};

type ApiEnvelope<T> = T & {
  message?: string;
};

const SETTINGS_API_BASE = `${API_BASE_URL}/settings`;

export const defaultAppSettings: AppSettings = {
  schoolName: "Bulacan Polytechnic College",
  academicYearStart: 2025,
  aiInsightsEnabled: false,
  defaultLandingPage: "dashboard",
  lateThresholdMinutes: 15,
  validAcademicYearStarts: [2025, 2026],
};

async function request<T>(init?: RequestInit): Promise<T> {
  const response = await fetch(`${SETTINGS_API_BASE}/index.php`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  const payload = (await response.json().catch(() => ({}))) as ApiEnvelope<T>;

  if (!response.ok) {
    throw new Error(payload.message || "Failed to load settings.");
  }

  return payload;
}

export async function getAppSettings(): Promise<AppSettings> {
  return request<AppSettings>({ method: "GET" });
}

export async function updateAppSettings(
  input: Partial<AppSettings>
): Promise<AppSettings> {
  return request<AppSettings>({
    method: "POST",
    body: JSON.stringify(input),
  });
}
