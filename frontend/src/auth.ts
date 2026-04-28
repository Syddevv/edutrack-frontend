import { API_BASE_URL } from "./api";

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  created_at: string | null;
};

export type ApiMessageResponse = {
  message: string;
};

export type PasswordResetInput = {
  email: string;
  code: string;
  newPassword: string;
};

const AUTH_API_BASE = `${API_BASE_URL}/auth`;

function sanitizeAuthUser(value: unknown): AuthUser {
  const user =
    typeof value === "object" && value !== null
      ? (value as Partial<AuthUser>)
      : {};

  return {
    id: typeof user.id === "number" ? user.id : Number(user.id ?? 0),
    name: typeof user.name === "string" ? user.name : "",
    email: typeof user.email === "string" ? user.email : "",
    role: typeof user.role === "string" ? user.role : "admin",
    status: typeof user.status === "string" ? user.status : "active",
    created_at:
      typeof user.created_at === "string" || user.created_at === null
        ? user.created_at
        : null,
  };
}

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

  const result = (payload.user ?? payload) as unknown;

  if (path === "/login.php" || path === "/me.php") {
    return sanitizeAuthUser(result) as T;
  }

  return result as T;
}

export async function login(
  email: string,
  password: string,
  rememberMe = false,
): Promise<AuthUser> {
  return request<AuthUser>("/login.php", {
    method: "POST",
    body: JSON.stringify({ email, password, rememberMe }),
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

export async function requestPasswordResetCode(
  email: string,
): Promise<ApiMessageResponse> {
  return request<ApiMessageResponse>("/request-password-reset.php", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function resetPassword(
  input: PasswordResetInput,
): Promise<ApiMessageResponse> {
  return request<ApiMessageResponse>("/reset-password.php", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

