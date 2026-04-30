"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { AppShell, Badge, Button, Input, PageCard, PageHeader, SectionCard } from "../components/ui";
import { getCurrentSession, login, type SessionUser } from "../../lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    getCurrentSession().then((sessionUser: SessionUser | null) => {
      if (isMounted && sessionUser) {
        router.replace("/");
      }
    });

    return () => {
      isMounted = false;
    };
  }, [router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      await login({ email, password });
      router.replace("/");
      router.refresh();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Login failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AppShell>
      <PageCard className="max-w-md">
        <div className="mb-8 space-y-2 text-center">
          <PageHeader
            eyebrow="DigitalContentStreamer"
            title="Login"
            description="Use your account email and password to continue."
            align="center"
          />
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            label="Email"
            placeholder="name@example.com"
          />

          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            label="Password"
            placeholder="password"
          />

          {errorMessage ? (
            <Badge variant="danger" className="w-full justify-start rounded-2xl px-4 py-3 text-sm">
              {errorMessage}
            </Badge>
          ) : null}

          <Button type="submit" disabled={isSubmitting} className="w-full rounded-2xl py-3">
            {isSubmitting ? "Logging in..." : "Login"}
          </Button>
        </form>

        <SectionCard className="mt-6">
          Demo logins now come from the database-backed seed data, so use a real account email and its stored password.
        </SectionCard>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button type="button" variant="secondary" className="w-full" onClick={() => router.push("/signup")}>
            Sign up
          </Button>
        </div>
      </PageCard>
    </AppShell>
  );
}
