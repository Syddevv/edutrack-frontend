export type TeacherReportClassSelection = {
  classId: number;
  scheduleId: number;
  course: string;
  year: string;
  section: string;
  subject: string;
  dayOfWeek: string | null;
  startTime: string;
  endTime: string;
};

export type TeacherReportsOverview = {
  assignments: TeacherReportClassSelection[];
  selectedClassId: number | null;
  summary: {
    attendanceRate: number;
    attendanceRateDelta: number;
    totalStudents: number;
  };
  atRiskStudents: Array<{
    studentId: number;
    studentCode: string;
    fullName: string;
    absences: number;
    attendanceRate: number;
  }>;
};

type ApiEnvelope<T> = T & {
  message?: string;
};

const TEACHER_REPORTS_API_BASE = "http://localhost/edutrack-backend/api/teachers";

async function request<T>(path: string): Promise<T> {
  const response = await fetch(`${TEACHER_REPORTS_API_BASE}${path}`, {
    method: "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const payload = (await response.json().catch(() => ({}))) as ApiEnvelope<T>;

  if (!response.ok) {
    throw new Error(payload.message || "Failed to load teacher reports.");
  }

  return payload;
}

export async function getTeacherReports(classId?: number): Promise<TeacherReportsOverview> {
  const params = new URLSearchParams();

  if (classId !== undefined) {
    params.set("classId", String(classId));
  }

  const query = params.toString();

  return request<TeacherReportsOverview>(
    `/reports.php${query ? `?${query}` : ""}`
  );
}
