"use client";

import { useEffect, useState } from "react";

import { getCurrentSession, type SessionUser } from "../../lib/auth";
import { Badge } from "./ui";

const SESSION_CHANGED_EVENT = "dcs-session-changed";

function formatRole(role: SessionUser["role"]): string {
  if (role === "viewer") {
    return "Viewer";
  }

  return role.charAt(0).toUpperCase() + role.slice(1);
}

export default function SessionLabel() {
  const [sessionUser, setSessionUser] = useState<SessionUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function refreshSession() {
      setIsLoading(true);
      setSessionUser(await getCurrentSession());
      setIsLoading(false);
    }

    function handleSessionChanged() {
      void refreshSession();
    }

    let isMounted = true;

    async function loadSession() {
      const currentUser = await getCurrentSession();
      if (isMounted) {
        setSessionUser(currentUser);
        setIsLoading(false);
      }
    }

    loadSession();
    window.addEventListener(SESSION_CHANGED_EVENT, handleSessionChanged);

    return () => {
      isMounted = false;
      window.removeEventListener(SESSION_CHANGED_EVENT, handleSessionChanged);
    };
  }, []);

  return (
    <Badge variant={sessionUser ? "success" : "muted"} dot className="shadow-lg shadow-black/20 backdrop-blur">
      {isLoading ? (
        <span>Checking session...</span>
      ) : sessionUser ? (
        <span>
          Signed in as <span className="font-semibold text-foreground">{sessionUser.email}</span> | {formatRole(sessionUser.role)} | {sessionUser.user_id}
        </span>
      ) : (
        <span>Not signed in</span>
      )}
    </Badge>
  );
}