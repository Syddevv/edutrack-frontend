import { API_BASE_URL } from "./api";

export type StudentStatus = "Present" | "Absent" | "Late" | "No Record";

export type StudentLookupOption = {
  id: number;
  name: string;
  code?: string;
};

export type StudentLookupData = {
  courses: StudentLookupOption[];
  yearLevels: StudentLookupOption[];
  sections: StudentLookupOption[];
};

export type StudentRecord = {
  id: number;
  studentId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  course: StudentLookupOption;
  yearLevel: StudentLookupOption;
  section: StudentLookupOption;
  attendanceStatus: StudentStatus;
  createdAt: string | null;
};

export type StudentsGetResponse = {
  students: StudentRecord[];
  lookups: StudentLookupData;
};

export type CreateStudentInput = {
  firstName: string;
  lastName: string;
  email: string;
  courseId: number;
  yearLevelId: number;
  sectionId: number;
};

export type UpdateStudentInput = CreateStudentInput & {
  studentId: number;
};

export type ImportStudentsResult = {
  importedCount: number;
  skippedCount: number;
  errors: string[];
};

type ApiEnvelope<T> = T & {
  message?: string;
};

const STUDENTS_API_BASE = `${API_BASE_URL}/students`;

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${STUDENTS_API_BASE}${path}`, {
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

export async function getStudents(): Promise<StudentsGetResponse> {
  return request<StudentsGetResponse>("/get.php", {
    method: "GET",
  });
}

export async function createStudent(input: CreateStudentInput): Promise<StudentRecord> {
  const payload = await request<{ student: StudentRecord }>("/create.php", {
    method: "POST",
    body: JSON.stringify(input),
  });

  return payload.student;
}

export async function updateStudent(input: UpdateStudentInput): Promise<StudentRecord> {
  const payload = await request<{ student: StudentRecord }>("/update.php", {
    method: "POST",
    body: JSON.stringify(input),
  });

  return payload.student;
}

export async function deleteStudent(studentId: number): Promise<void> {
  await request<{ message: string }>("/delete.php", {
    method: "POST",
    body: JSON.stringify({ studentId }),
  });
}

export async function importStudents(file: File): Promise<ImportStudentsResult> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${STUDENTS_API_BASE}/import.php`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  const payload = (await response.json().catch(() => ({}))) as ImportStudentsResult & {
    message?: string;
  };

  if (!response.ok) {
    throw new Error(payload.message || "Import failed.");
  }

  return payload;
}
