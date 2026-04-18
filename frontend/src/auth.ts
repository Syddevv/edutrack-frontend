export type AuthUser = {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  created_at: string | null;
};

const AUTH_API_BASE = "http://localhost/edutrack-backend/api/auth";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${AUTH_API_BASE}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  const payload = (await response.json().catch(() => ({}))) as {
    message?: string;
    user?: T;
  };

  if (!response.ok) {
    throw new Error(payload.message || "Request failed.");
  }

  return (payload.user ?? payload) as T;
}

export async function login(email: string, password: string): Promise<AuthUser> {
  return request<AuthUser>("/login.php", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function logout(): Promise<void> {
  await request<{ message: string }>("/logout.php", {
    method: "POST",
    body: JSON.stringify({}),
  });
}

export async function getCurrentUser(): Promise<AuthUser> {
  return request<AuthUser>("/me.php", {
    method: "GET",
  });
}
