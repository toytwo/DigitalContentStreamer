"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "./ui";
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

  return (
    <Button
      onClick={handleClick}
      disabled={isLoading || isSubmitting}
      variant={sessionUser ? "danger" : "primary"}
    >
      {buttonLabel}
    </Button>
  );
}