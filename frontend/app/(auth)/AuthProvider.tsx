"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type SessionUser = {
  user_id: number;
  email: string;
  role: "viewer" | "creator" | "admin";
};

export type LoginRequest = {
  email: string;
  password: string;
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

type AuthContextType = {
  sessionUser: SessionUser | null;
  isCheckingSession: boolean;
  login: (request: LoginRequest) => Promise<SessionUser>;
  signup: (request: SignupRequest) => Promise<SessionUser>;
  logout: () => Promise<void>;
  getCurrentSession: () => Promise<SessionUser | null>;
  getSubscriptionTiers: () => Promise<SubscriptionTier[]>;
  createContent: (request: ContentRequest) => Promise<unknown>;
  getContent: (contentId: number) => Promise<unknown>;
  updateContent: (contentId: number, request: Partial<ContentRequest>) => Promise<unknown>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

async function parseJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function formatValidationError(detail: unknown): string {
  if (Array.isArray(detail) && detail.length > 0) {
    const firstError = detail[0];
    if (typeof firstError === "object" && firstError !== null && "msg" in firstError) {
      return (firstError as { msg: string }).msg;
    }
  }
  return JSON.stringify(detail);
}

async function login(request: LoginRequest): Promise<SessionUser> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  const data = (await parseJson(response)) as { success?: boolean; user?: SessionUser; detail?: unknown };
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

async function signup(request: SignupRequest): Promise<SessionUser> {
  const response = await fetch(`${API_BASE_URL}/auth/signup`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  const data = (await parseJson(response)) as { success?: boolean; user?: SessionUser; detail?: unknown };
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

async function getCurrentSession(): Promise<SessionUser | null> {
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    credentials: "include",
  });

  const data = (await parseJson(response)) as { success?: boolean; user?: SessionUser };
  if (!response.ok || !data?.success || !data.user) {
    return null;
  }

  return data.user;
}

async function logout(): Promise<void> {
  await fetch(`${API_BASE_URL}/auth/logout`, {
    method: "POST",
    credentials: "include",
  });
}

async function getSubscriptionTiers(): Promise<SubscriptionTier[]> {
  const response = await fetch(`${API_BASE_URL}/content/tiers`, {
    credentials: "include",
  });

  const data = (await parseJson(response)) as { success?: boolean; payload?: unknown };
  if (!response.ok || !data?.success || !data.payload) {
    throw new Error("Failed to fetch subscription tiers");
  }

  return data.payload as SubscriptionTier[];
}

async function createContent(request: ContentRequest): Promise<unknown> {
  const response = await fetch(`${API_BASE_URL}/content`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  const data = (await parseJson(response)) as { success?: boolean; payload?: unknown; detail?: unknown };
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

async function getContent(contentId: number): Promise<unknown> {
  const response = await fetch(`${API_BASE_URL}/content/${contentId}`, {
    credentials: "include",
  });

  const data = (await parseJson(response)) as { success?: boolean; payload?: unknown };
  if (!response.ok || !data?.success) {
    throw new Error("Failed to fetch content");
  }

  return data.payload;
}

async function updateContent(contentId: number, request: Partial<ContentRequest>): Promise<unknown> {
  const response = await fetch(`${API_BASE_URL}/content/${contentId}`, {
    method: "PUT",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  const data = (await parseJson(response)) as { success?: boolean; payload?: unknown; detail?: unknown };
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [sessionUser, setSessionUser] = useState<SessionUser | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    let isMounted = true;

    getCurrentSession()
      .then((user) => {
        if (isMounted) {
          setSessionUser(user);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsCheckingSession(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const contextValue: AuthContextType = {
    sessionUser,
    isCheckingSession,
    login: async (request: LoginRequest) => {
      const user = await login(request);
      setSessionUser(user);
      return user;
    },
    signup: async (request: SignupRequest) => {
      const user = await signup(request);
      setSessionUser(user);
      return user;
    },
    logout: async () => {
      await logout();
      setSessionUser(null);
    },
    getCurrentSession: async () => {
      const user = await getCurrentSession();
      setSessionUser(user);
      return user;
    },
    getSubscriptionTiers,
    createContent,
    getContent,
    updateContent,
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
