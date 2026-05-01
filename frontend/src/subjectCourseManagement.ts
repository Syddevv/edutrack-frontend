export type LookupEntityType = "subjects" | "courses";

export type SubjectRecord = {
  id: number;
  name: string;
  code: string;
  createdAt: string | null;
  classCount: number;
};

export type CourseRecord = {
  id: number;
  name: string;
  code: string;
  studentCount: number;
  classCount: number;
};

export type LookupManagementSummary = {
  subjects: number;
  courses: number;
  classes: number;
  students: number;
};

export type LookupManagementOverview = {
  subjects: SubjectRecord[];
  courses: CourseRecord[];
  summary: LookupManagementSummary;
};

export type LookupFormInput = {
  name: string;
  code: string;
};

type ApiEnvelope<T> = T & {
  message?: string;
};

const LOOKUPS_API_URL = "http://localhost/edutrack-backend/api/lookups/index.php";

async function request<T>(init?: RequestInit): Promise<T> {
  const response = await fetch(LOOKUPS_API_URL, {
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

export async function getLookupManagementOverview(): Promise<LookupManagementOverview> {
  return request<LookupManagementOverview>({
    method: "GET",
  });
}

export async function createLookupItem(
  type: LookupEntityType,
  input: LookupFormInput,
): Promise<void> {
  await request<{ message: string }>({
    method: "POST",
    body: JSON.stringify({
      type,
      ...input,
    }),
  });
}

export async function updateLookupItem(
  type: LookupEntityType,
  itemId: number,
  input: LookupFormInput,
): Promise<void> {
  await request<{ message: string }>({
    method: "PUT",
    body: JSON.stringify({
      id: itemId,
      type,
      ...input,
    }),
  });
}

export async function deleteLookupItem(
  type: LookupEntityType,
  itemId: number,
): Promise<void> {
  await request<{ message: string }>({
    method: "DELETE",
    body: JSON.stringify({
      id: itemId,
      type,
    }),
  });
}
