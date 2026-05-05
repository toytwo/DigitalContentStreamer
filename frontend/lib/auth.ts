export type SessionUser = {
  user_id: number;
  email: string;
  role: "viewer" | "creator" | "admin";
};

export type SignupRequest = {
  email: string;
  phone_number: string;
  user_role: SessionUser["role"];
  first_name: string;
  last_name: string;
  password: string;
  password_confirmation: string;
  region_name: string;
  referral_method: string;
  age?: number;
  preferred_language?: string;
  subscription_tier_id?: number;
  display_name?: string;
  profile_description?: string;
  department?: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type ContentRequest = {
  title: string;
  type: string;
  release_date: string;
  required_tier: number;
  genre: string;
  runtime_minutes: number;
  original_language: string;
  age_rating: string;
  collection_id?: number;
};

export type SubscriptionTier = {
  tier_id: number;
  name: string;
  description: string;
  price: number;
};

type AuthResponse = {
  success: boolean;
  user?: SessionUser;
  detail?: string;
};

type ContentResponse = {
  success: boolean;
  payload?: unknown;
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

function formatValidationError(detail: unknown): string {
  // Handle Pydantic validation errors (array of error objects)
  if (Array.isArray(detail) && detail.length > 0) {
    const firstError = detail[0];
    if (typeof firstError === "object" && firstError !== null && "msg" in firstError) {
      return (firstError as { msg: string }).msg;
    }
  }
  // Fallback: return as JSON string
  return JSON.stringify(detail);
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
    const detail = data?.detail;
    const message =
      detail == null
        ? "Invalid email or password"
        : typeof detail === "string"
        ? detail
        : formatValidationError(detail);
    throw new Error(message);
  }

  return data.user;
}

export async function signup(request: SignupRequest): Promise<SessionUser> {
  const response = await fetch(`${API_BASE_URL}/auth/signup`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  const data = await parseJson(response);
  if (!response.ok || !data?.success || !data.user) {
    const detail = data?.detail;
    const message =
      detail == null
        ? "Unable to create account"
        : typeof detail === "string"
        ? detail
        : formatValidationError(detail);
    throw new Error(message);
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

export async function getSubscriptionTiers(): Promise<SubscriptionTier[]> {
  const response = await fetch(`${API_BASE_URL}/content/tiers`, {
    credentials: "include",
  });

  const data = (await response.json()) as ContentResponse;
  if (!response.ok || !data?.success || !data.payload) {
    throw new Error("Failed to fetch subscription tiers");
  }

  return data.payload as SubscriptionTier[];
}

export async function createContent(request: ContentRequest): Promise<unknown> {
  const response = await fetch(`${API_BASE_URL}/content`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  const data = (await response.json()) as ContentResponse;
  if (!response.ok || !data?.success) {
    const detail = data?.detail;
    const message =
      detail == null
        ? "Failed to create content"
        : typeof detail === "string"
        ? detail
        : JSON.stringify(detail);
    throw new Error(message);
  }

  return data.payload;
}

export async function getContent(contentId: number): Promise<unknown> {
  const response = await fetch(`${API_BASE_URL}/content/${contentId}`, {
    credentials: "include",
  });

  const data = (await response.json()) as ContentResponse;
  if (!response.ok || !data?.success) {
    throw new Error("Failed to fetch content");
  }

  return data.payload;
}

export async function updateContent(
  contentId: number,
  request: Partial<ContentRequest>
): Promise<unknown> {
  const response = await fetch(`${API_BASE_URL}/content/${contentId}`, {
    method: "PUT",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  const data = (await response.json()) as ContentResponse;
  if (!response.ok || !data?.success) {
    const detail = data?.detail;
    const message =
      detail == null
        ? "Failed to update content"
        : typeof detail === "string"
        ? detail
        : JSON.stringify(detail);
    throw new Error(message);
  }

  return data.payload;
}
