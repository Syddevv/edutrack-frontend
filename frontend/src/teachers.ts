export type TeacherStatus = "Active" | "On Leave" | "Inactive";

export type TeacherLookupOption = {
  id: number;
  name: string;
  code?: string;
};

export type TeacherAssignedClassPayload = {
  subject: string;
  courseId: number;
  yearLevelId: number;
  sectionId: number;
  startTime: string;
  endTime: string;
};

export type TeacherAssignedClassRecord = {
  id: number;
  classId: number;
  subject: string;
  course: TeacherLookupOption;
  yearLevel: TeacherLookupOption;
  section: TeacherLookupOption;
  startTime: string;
  endTime: string;
};

export type TeacherRecord = {
  id: number;
  teacherId: string;
  fullName: string;
  email: string;
  status: TeacherStatus;
  createdAt: string | null;
  assignedClasses: TeacherAssignedClassRecord[];
};

export type TeacherSummary = {
  total: number;
  active: number;
  onLeave: number;
  inactive: number;
};

export type TeacherLookupData = {
  subjects: TeacherLookupOption[];
  courses: TeacherLookupOption[];
  yearLevels: TeacherLookupOption[];
  sections: TeacherLookupOption[];
  statuses: TeacherStatus[];
};

type TeachersGetResponse = {
  teachers: TeacherRecord[];
  summary: TeacherSummary;
  lookups: TeacherLookupData;
};

type ApiEnvelope<T> = T & {
  message?: string;
};

export type CreateTeacherInput = {
  fullName: string;
  email: string;
  password: string;
  status: TeacherStatus;
  assignedClasses: TeacherAssignedClassPayload[];
};

export type UpdateTeacherInput = {
  teacherId: number;
  fullName: string;
  email: string;
  status: TeacherStatus;
  assignedClasses: TeacherAssignedClassPayload[];
};

const TEACHERS_API_BASE = "http://localhost/edutrack-backend/api/teachers";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${TEACHERS_API_BASE}${path}`, {
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

export async function getTeachers(): Promise<TeachersGetResponse> {
  return request<TeachersGetResponse>("/get.php", {
    method: "GET",
  });
}

export async function createTeacher(input: CreateTeacherInput): Promise<TeacherRecord> {
  const payload = await request<{ teacher: TeacherRecord }>("/create.php", {
    method: "POST",
    body: JSON.stringify(input),
  });

  return payload.teacher;
}

export async function deleteTeacher(teacherId: number): Promise<void> {
  await request<{ message: string }>("/delete.php", {
    method: "POST",
    body: JSON.stringify({ teacherId }),
  });
}

export async function updateTeacher(input: UpdateTeacherInput): Promise<TeacherRecord> {
  const payload = await request<{ teacher: TeacherRecord }>("/update.php", {
    method: "POST",
    body: JSON.stringify(input),
  });

  return payload.teacher;
}
