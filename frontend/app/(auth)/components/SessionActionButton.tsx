"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "../../components/ui";
import { useAuth } from "../AuthProvider";

export default function SessionActionButton() {
  const router = useRouter();
  const { sessionUser, logout, isCheckingSession } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleClick() {
    if (!sessionUser) {
      router.push("/login");
      return;
    }

    setIsSubmitting(true);

    try {
      await logout();
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  }

  const buttonLabel = isCheckingSession
    ? "Loading..."
    : sessionUser
      ? isSubmitting
        ? "Logging out..."
        : "Logout"
      : "Login";

  return (
    <Button
      onClick={handleClick}
      disabled={isCheckingSession || isSubmitting}
      variant={sessionUser ? "danger" : "primary"}
    >
      {buttonLabel}
    </Button>
  );
}