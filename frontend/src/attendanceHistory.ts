import { API_BASE_URL } from "./api";

type ApiEnvelope<T> = T & {
  message?: string;
};

export type AdminAttendanceHistoryEntry = {
  date: string;
  dateLabel: string;
  summary: {
    presentCount: number;
    lateCount: number;
    absentCount: number;
    totalRecords: number;
    attendanceRate: number;
  };
  attentionRows: Array<{
    studentId: number;
    studentCode: string;
    fullName: string;
    course: string;
    yearSection: string;
    status: string;
  }>;
};

export type AdminAttendanceHistoryResponse = {
  availableDates: string[];
  history: AdminAttendanceHistoryEntry[];
};

export type TeacherAttendanceHistoryEntry = {
  date: string;
  dateLabel: string;
  summary: {
    presentCount: number;
    lateCount: number;
    absentCount: number;
    totalRecords: number;
    attendanceRate: number;
  };
  classes: Array<{
    classId: number;
    className: string;
    statusCounts: {
      Present: number;
      Late: number;
      Absent: number;
    };
    students: Array<{
      studentId: number;
      studentCode: string;
      fullName: string;
      status: string;
    }>;
  }>;
};

export type TeacherAttendanceHistoryResponse = {
  availableDates: string[];
  history: TeacherAttendanceHistoryEntry[];
};

const REPORTS_API_BASE = `${API_BASE_URL}/reports`;
const TEACHERS_API_BASE = `${API_BASE_URL}/teachers`;

async function request<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    method: "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const payload = (await response.json().catch(() => ({}))) as ApiEnvelope<T>;

  if (!response.ok) {
    throw new Error(payload.message || "Failed to load attendance history.");
  }

  return payload;
}

export async function getAdminAttendanceHistory(
  limit = 7,
): Promise<AdminAttendanceHistoryResponse> {
  return request<AdminAttendanceHistoryResponse>(
    `${REPORTS_API_BASE}/history.php?limit=${limit}`,
  );
}

export async function getTeacherAttendanceHistory(
  limit = 7,
): Promise<TeacherAttendanceHistoryResponse> {
  return request<TeacherAttendanceHistoryResponse>(
    `${TEACHERS_API_BASE}/history.php?limit=${limit}`,
  );
}
