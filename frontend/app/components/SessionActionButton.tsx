"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { getCurrentSession, logout, type SessionUser } from "../../lib/auth";

const SESSION_CHANGED_EVENT = "dcs-session-changed";

export default function SessionActionButton() {
  const router = useRouter();
  const [sessionUser, setSessionUser] = useState<SessionUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    getCurrentSession()
      .then((currentUser) => {
        if (isMounted) {
          setSessionUser(currentUser);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  async function handleClick() {
    if (!sessionUser) {
      router.push("/login");
      return;
    }

    setIsSubmitting(true);

    try {
      await logout();
      setSessionUser(null);
      window.dispatchEvent(new Event(SESSION_CHANGED_EVENT));
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  }

  const buttonLabel = isLoading
    ? "Loading..."
    : sessionUser
      ? isSubmitting
        ? "Logging out..."
        : "Logout"
      : "Login";

  const buttonClassName = sessionUser
    ? "border-red-400/60 bg-red-500/15 text-red-100 hover:border-red-300 hover:bg-red-500/25"
    : "border-sky-400/60 bg-sky-500/15 text-sky-100 hover:border-sky-300 hover:bg-sky-500/25";

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isLoading || isSubmitting}
      className={`inline-flex items-center justify-center rounded-full border px-5 py-2.5 text-sm font-semibold shadow-lg shadow-black/20 backdrop-blur transition disabled:cursor-not-allowed disabled:opacity-60 ${buttonClassName}`}
    >
      {buttonLabel}
    </button>
  );
}