"use client";

import { useEffect, useState } from "react";
import { AppShell, PageCard, PageHeader } from "../../components/ui";
import SessionActionButton from "../../(auth)/components/SessionActionButton";
import SessionLabel from "../../(auth)/components/SessionLabel";
import { getCurrentSession, type SessionUser } from "../../../lib/auth";

type ContentItem = {
  content_id: number;
  title: string;
  type: string;
  release_date: string;
  genre: string;
  runtime_minutes: number;
  original_language: string;
  age_rating: string;
  tier: string;
  price: number;
};

export default function Home() {
  const [sessionUser, setSessionUser] = useState<SessionUser | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [featuredContent, setFeaturedContent] = useState<ContentItem[]>([]);
  const [isLoadingContent, setIsLoadingContent] = useState(false);

  useEffect(() => {
    getCurrentSession()
      .then((currentUser) => setSessionUser(currentUser))
      .finally(() => setIsCheckingSession(false));
  }, []);

  useEffect(() => {
    if (!sessionUser) return;

    setIsLoadingContent(true);

    fetch("http://localhost:8000/content/homepage", {
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setFeaturedContent(data.payload);
        }
      })
      .catch((error) => {
        console.error("Failed to load homepage content:", error);
      })
      .finally(() => setIsLoadingContent(false));
  }, [sessionUser]);

  return (
    <AppShell>
      <div className="space-y-8">
        <PageCard>
          <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl space-y-6">
              <PageHeader
                eyebrow="DigitalContentStreamer"
                title="Watch your content anywhere, anytime."
                description={
                  sessionUser
                    ? "Welcome back. Browse real content from your DigitalContentStreamer database."
                    : "Log in to view your personalized streaming homepage."
                }
              />
            </div>

            <div className="flex flex-col items-start gap-3 md:pb-2">
              <SessionActionButton />
              <SessionLabel />
            </div>
          </div>
        </PageCard>

        {!isCheckingSession && sessionUser && (
          <section className="space-y-4">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-sky-300/80">
                Featured
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-white">
                Popular on DigitalContentStreamer
              </h2>
            </div>

            {isLoadingContent && (
              <p className="text-sm text-slate-400">Loading content...</p>
            )}

            {!isLoadingContent && featuredContent.length === 0 && (
              <p className="text-sm text-slate-400">
                No content found in the database.
              </p>
            )}

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {featuredContent.map((content) => (
                <div
                  key={content.content_id}
                  className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-xl shadow-black/30 transition hover:-translate-y-1 hover:bg-white/[0.07]"
                >
                  <div className="mb-4 flex h-32 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400/20 to-slate-900 px-4 text-center text-lg font-semibold text-white">
                    {content.title}
                  </div>

                  <p className="text-sm uppercase tracking-[0.25em] text-sky-300/70">
                    {content.type}
                  </p>

                  <h3 className="mt-2 text-lg font-semibold text-white">
                    {content.title}
                  </h3>

                  <p className="mt-1 text-sm text-slate-400">
                    {content.genre} • {content.runtime_minutes} min
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    {content.original_language} • {content.age_rating}
                  </p>

                  <p className="mt-3 inline-flex rounded-full border border-sky-300/20 px-3 py-1 text-xs text-sky-200">
                    {content.tier} Tier
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </AppShell>
  );
}
