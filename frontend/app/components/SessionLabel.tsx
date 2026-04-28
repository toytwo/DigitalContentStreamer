"use client";

import { useEffect, useState } from "react";

import { getCurrentSession, type SessionUser } from "../../lib/auth";

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
    <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-slate-950/60 px-4 py-2 text-sm text-slate-200 shadow-lg shadow-slate-950/30 backdrop-blur">
      <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_14px_rgba(74,222,128,0.85)]" />
      {isLoading ? (
        <span className="text-slate-300">Checking session...</span>
      ) : sessionUser ? (
        <span>
          Signed in as <span className="font-semibold text-white">{sessionUser.email}</span> · {formatRole(sessionUser.role)}
        </span>
      ) : (
        <span className="text-slate-300">Not signed in</span>
      )}
    </div>
  );
}