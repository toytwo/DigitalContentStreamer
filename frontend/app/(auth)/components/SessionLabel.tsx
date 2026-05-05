"use client";

import { Badge } from "../../components/ui";
import { useAuth } from "../AuthProvider";

function formatRole(role: string): string {
  if (role === "viewer") {
    return "Viewer";
  }

  return role.charAt(0).toUpperCase() + role.slice(1);
}

export default function SessionLabel() {
  const { sessionUser, isCheckingSession } = useAuth();

  return (
    <Badge variant={sessionUser ? "success" : "muted"} dot className="shadow-lg shadow-black/20 backdrop-blur">
      {isCheckingSession ? (
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