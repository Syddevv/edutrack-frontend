export type AppSettings = {
  schoolName: string;
  academicYearStart: number;
  aiInsightsEnabled: boolean;
  defaultLandingPage: "dashboard" | "students" | "teachers" | "reports" | "settings";
  lateThresholdMinutes: number;
  schoolLogoPath: string | null;
  validAcademicYearStarts: number[];
};

type ApiEnvelope<T> = T & {
  message?: string;
};

const SETTINGS_API_BASE = "http://localhost/edutrack-backend/api/settings";

export const defaultAppSettings: AppSettings = {
  schoolName: "Bulacan Polytechnic College",
  academicYearStart: 2025,
  aiInsightsEnabled: false,
  defaultLandingPage: "dashboard",
  lateThresholdMinutes: 15,
  schoolLogoPath: null,
  validAcademicYearStarts: [2025, 2026],
};

async function request<T>(init?: RequestInit): Promise<T> {
  const response = await fetch(`${SETTINGS_API_BASE}/index.php`, {
    credentials: "include",
    headers: {
      ...(init?.body instanceof FormData
        ? {}
        : { "Content-Type": "application/json" }),
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

export async function uploadSchoolLogo(file: File): Promise<AppSettings> {
  const formData = new FormData();
  formData.append("logo", file);

  return request<AppSettings>({
    method: "POST",
    body: formData,
  });
}
