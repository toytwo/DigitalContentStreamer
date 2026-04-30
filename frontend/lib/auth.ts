export type SessionUser = {
  user_id: number;
  email: string;
  role: "viewer" | "creator" | "admin";
};

export type LoginRequest = {
  email: string;
  password: string;
};

type AuthResponse = {
  success: boolean;
  user?: SessionUser;
  detail?: string;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

async function parseJson(response: Response): Promise<AuthResponse | null> {
  try {
    return (await response.json()) as AuthResponse;
  } catch {
    return null;
  }
}

export async function login(request: LoginRequest): Promise<SessionUser> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  const data = await parseJson(response);
  if (!response.ok || !data?.success || !data.user) {
    throw new Error(data?.detail ?? "Invalid email or password");
  }

  return data.user;
}

export async function getCurrentSession(): Promise<SessionUser | null> {
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    credentials: "include",
  });

  const data = await parseJson(response);
  if (!response.ok || !data?.success || !data.user) {
    return null;
  }

  return data.user;
}

export async function logout(): Promise<void> {
  await fetch(`${API_BASE_URL}/auth/logout`, {
    method: "POST",
    credentials: "include",
  });
}
