const TWO_FACTOR_API_BASE = "http://localhost/edutrack-backend/api/auth";

type TwoFactorEnvelope<T> = T & {
  message?: string;
};

export type TwoFactorStatus = {
  enabled: boolean;
  email: string;
  issuer: string;
};

export type TwoFactorSetup = {
  secret: string;
  otpauthUrl: string;
  issuer: string;
  email: string;
};

async function request<T>(init?: RequestInit): Promise<T> {
  const response = await fetch(`${TWO_FACTOR_API_BASE}/two-factor.php`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  const payload = (await response.json().catch(() => ({}))) as TwoFactorEnvelope<T>;

  if (!response.ok) {
    throw new Error(payload.message || "Two-factor request failed.");
  }

  return payload;
}

export async function getTwoFactorStatus(): Promise<TwoFactorStatus> {
  return request<TwoFactorStatus>({ method: "GET" });
}

export async function prepareTwoFactorSetup(): Promise<TwoFactorSetup> {
  return request<TwoFactorSetup>({
    method: "POST",
    body: JSON.stringify({ action: "prepare" }),
  });
}

export async function enableTwoFactor(code: string): Promise<void> {
  await request({
    method: "POST",
    body: JSON.stringify({ action: "enable", code }),
  });
}

export async function disableTwoFactor(
  currentPassword: string,
  code: string,
): Promise<void> {
  await request({
    method: "POST",
    body: JSON.stringify({
      action: "disable",
      currentPassword,
      code,
    }),
  });
}
