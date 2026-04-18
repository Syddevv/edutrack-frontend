type ApiEnvelope<T> = T & {
  message?: string;
};

export type TeacherDashboardOverview = {
  teacherName: string;
  dateLabel: string;
  attendanceDateLabel: string | null;
  todayClass: {
    scheduleId: number;
    classId: number;
    subject: string;
    course: string;
    yearLevel: string;
    section: string;
    dayOfWeek: string | null;
    startTime: string;
    endTime: string;
    status: "active" | "upcoming" | "completed";
  } | null;
  nextClass: {
    scheduleId: number;
    classId: number;
    subject: string;
    dayOfWeek: string | null;
    time: string;
    minutesRemaining: number;
    isToday: boolean;
  } | null;
  summary: {
    totalStudents: number;
    presentCount: number;
    absentCount: number;
    attendanceRate: number;
    attendanceRateDelta: number;
  };
  recentActivity: Array<{
    studentId: number;
    studentCode: string;
    fullName: string;
    status: "Present" | "Absent" | "Late" | "No Record";
    className: string;
  }>;
};

const TEACHERS_API_BASE = "http://localhost/edutrack-backend/api/teachers";

export async function getTeacherDashboardOverview(): Promise<TeacherDashboardOverview> {
  const response = await fetch(`${TEACHERS_API_BASE}/dashboard.php`, {
    method: "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const payload = (await response.json().catch(() => ({}))) as ApiEnvelope<TeacherDashboardOverview>;

  if (!response.ok) {
    throw new Error(payload.message || "Failed to load teacher dashboard.");
  }

  return payload;
}
