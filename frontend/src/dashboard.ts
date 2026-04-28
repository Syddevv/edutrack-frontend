import { API_BASE_URL } from "./api";

export type DashboardSummary = {
  totalStudents: number;
  presentToday: number;
  absentToday: number;
  lateToday: number;
};

export type DashboardRow = {
  studentId: number;
  studentCode: string;
  fullName: string;
  course: string;
  yearSection: string;
  date: string | null;
  status: "Present" | "Absent" | "Late" | "No Record";
};

export type DashboardOverview = {
  summary: DashboardSummary;
  rows: DashboardRow[];
  dateLabel: string;
};

type ApiEnvelope<T> = T & {
  message?: string;
};

const REPORTS_API_BASE = `${API_BASE_URL}/reports`;

export async function getDashboardOverview(): Promise<DashboardOverview> {
  const response = await fetch(`${REPORTS_API_BASE}/overview.php`, {
    method: "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const payload = (await response.json().catch(() => ({}))) as ApiEnvelope<DashboardOverview>;

  if (!response.ok) {
    throw new Error(payload.message || "Failed to load dashboard.");
  }

  return payload;
}
