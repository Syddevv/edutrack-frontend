import { API_BASE_URL } from "./api";

type ApiEnvelope<T> = T & {
  message?: string;
};

export type ReportsSummary = {
  attendanceRate: number;
  attendanceRateDelta: number;
  lateArrivalsThisWeek: number;
};

export type AbsenceBreakdownRow = {
  studentId: number;
  studentCode: string;
  fullName: string;
  course: string;
  absences: number;
  attendanceRate: number;
};

export type CourseReportRow = {
  course: string;
  studentCount: number;
  attendanceRate: number;
  trendDirection: "up" | "down";
  trendDelta: number;
};

export type ReportsOverview = {
  reportsSummary: ReportsSummary;
  absenceBreakdown: AbsenceBreakdownRow[];
  courseStats: CourseReportRow[];
  generatedAt: string;
};

const REPORTS_API_BASE = `${API_BASE_URL}/reports`;

export async function getReportsOverview(): Promise<ReportsOverview> {
  const response = await fetch(`${REPORTS_API_BASE}/overview.php`, {
    method: "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const payload = (await response.json().catch(() => ({}))) as ApiEnvelope<ReportsOverview>;

  if (!response.ok) {
    throw new Error(payload.message || "Failed to load reports.");
  }

  return payload;
}
