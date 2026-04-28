export type AttendanceStatus = "Present" | "Late" | "Absent";

export type TeacherAttendanceAssignment = {
  scheduleId: number;
  classId: number;
  subject: string;
  course: {
    id: number;
    name: string;
    code: string;
  };
  yearLevel: {
    id: number;
    name: string;
  };
  section: {
    id: number;
    name: string;
  };
  dayOfWeek: string | null;
  startTime: string;
  endTime: string;
};

export type TeacherAttendanceStudent = {
  id: number;
  studentId: string;
  fullName: string;
  status: AttendanceStatus | null;
};

export type TeacherAttendanceResponse = {
  date: string;
  assignments: TeacherAttendanceAssignment[];
  selectedClassId: number | null;
  students: TeacherAttendanceStudent[];
};

export type SaveTeacherAttendanceInput = {
  classId: number;
  date: string;
  records: Array<{
    studentId: number;
    status: AttendanceStatus | null;
  }>;
};

type ApiEnvelope<T> = T & {
  message?: string;
};

const TEACHER_ATTENDANCE_API_BASE = "http://localhost/edutrack-backend/api/teachers";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${TEACHER_ATTENDANCE_API_BASE}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  const payload = (await response.json().catch(() => ({}))) as ApiEnvelope<T>;

  if (!response.ok) {
    throw new Error(payload.message || "Request failed.");
  }

  return payload;
}

export async function getTeacherAttendance(
  date: string,
  classId?: number
): Promise<TeacherAttendanceResponse> {
  const params = new URLSearchParams({ date });

  if (classId !== undefined) {
    params.set("classId", String(classId));
  }

  return request<TeacherAttendanceResponse>(`/attendance.php?${params.toString()}`, {
    method: "GET",
  });
}

export async function saveTeacherAttendance(
  input: SaveTeacherAttendanceInput
): Promise<TeacherAttendanceResponse> {
  return request<TeacherAttendanceResponse>("/attendance.php", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
