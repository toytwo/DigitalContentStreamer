"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell, PageCard, PageHeader, Button } from "../../components/ui";
import SessionActionButton from "../../(auth)/components/SessionActionButton";
import SessionLabel from "../../(auth)/components/SessionLabel";
import { useAuth } from "../../(auth)/AuthProvider";

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

type SortOption = "title" | "type" | "release_date" | "genre";

const SORT_OPTIONS = [
  { value: "release_date", label: "Release Date" },
  { value: "title", label: "Title" },
  { value: "type", label: "Type" },
  { value: "genre", label: "Genre" },
] as const;

export default function Home() {
  const router = useRouter();
  const { sessionUser, isCheckingSession } = useAuth();
  const [featuredContent, setFeaturedContent] = useState<ContentItem[]>([]);
  const [isLoadingContent, setIsLoadingContent] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("release_date");

  useEffect(() => {
    if (!sessionUser) {
      setFeaturedContent([]);
      return;
    }

    loadContent(sortBy);
  }, [sessionUser, sortBy]);

  const loadContent = (sort: SortOption) => {
    if (!sessionUser) return;

    setIsLoadingContent(true);

    fetch(`http://localhost:8000/content/homepage?sort_by=${sort}`, {
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
  };

  const handleSortChange = (newSort: SortOption) => {
    setSortBy(newSort);
    loadContent(newSort);
  };

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
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-sky-300/80">
                  Featured
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-white">
                  Popular on DigitalContentStreamer
                </h2>
              </div>

              <div className="flex flex-wrap gap-2">
                {SORT_OPTIONS.map((option) => (
                  <Button
                    key={option.value}
                    onClick={() => handleSortChange(option.value)}
                    variant={sortBy === option.value ? "primary" : "secondary"}
                    className="rounded-lg px-4 py-2 text-sm"
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
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
                  className="relative rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-xl shadow-black/30 transition hover:-translate-y-1 hover:bg-white/[0.07]"
                >
                  {sessionUser?.role === "admin" && (
                    <button
                      onClick={() => router.push(`/contentedit/${content.content_id}`)}
                      className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
                      title="Edit content"
                    >
                      ✎
                    </button>
                  )}

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

        {!isCheckingSession && sessionUser && (sessionUser.role === "creator" || sessionUser.role === "admin") && (
          <button
            onClick={() => router.push("/upload")}
            className="fixed bottom-8 right-8 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-sky-600 text-3xl font-bold text-white shadow-xl transition hover:scale-110 hover:shadow-2xl"
            title="Upload new content"
          >
            +
          </button>
        )}
      </div>
    </AppShell>
  );
}
