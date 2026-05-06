"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  AppShell,
  Badge,
  Button,
  Input,
  PageCard,
  PageHeader,
  SectionCard,
  Select,
} from "../../components/ui";
import {
  useAuth,
  type ContentRequest,
  type SubscriptionTier,
} from "../../(auth)/AuthProvider";

const CONTENT_TYPE_OPTIONS = [
  { value: "movie", label: "Movie" },
  { value: "episode", label: "Episode" },
  { value: "song", label: "Song" },
  { value: "article", label: "Article" },
  { value: "podcast", label: "Podcast" },
] as const;

const GENRE_OPTIONS = [
  { value: "Action", label: "Action" },
  { value: "Comedy", label: "Comedy" },
  { value: "Drama", label: "Drama" },
  { value: "Horror", label: "Horror" },
  { value: "Romance", label: "Romance" },
  { value: "Sci-Fi", label: "Sci-Fi" },
  { value: "Fantasy", label: "Fantasy" },
  { value: "Thriller", label: "Thriller" },
  { value: "Documentary", label: "Documentary" },
  { value: "Animation", label: "Animation" },
] as const;

const LANGUAGE_OPTIONS = [
  { value: "English", label: "English" },
  { value: "Mandarin Chinese", label: "Mandarin Chinese" },
  { value: "Hindi", label: "Hindi" },
  { value: "Spanish", label: "Spanish" },
  { value: "Arabic", label: "Arabic" },
  { value: "French", label: "French" },
  { value: "Bengali", label: "Bengali" },
  { value: "Portuguese", label: "Portuguese" },
  { value: "Indonesian", label: "Indonesian" },
  { value: "Urdu", label: "Urdu" },
  { value: "Russian", label: "Russian" },
  { value: "German", label: "German" },
  { value: "Japanese", label: "Japanese" },
] as const;

const AGE_RATING_OPTIONS = [
  { value: "G", label: "G" },
  { value: "PG", label: "PG" },
  { value: "PG-13", label: "PG-13" },
  { value: "R", label: "R" },
  { value: "NC-17", label: "NC-17" },
] as const;

export default function UploadPage() {
  const router = useRouter();
  const { sessionUser, isCheckingSession, getSubscriptionTiers, createContent } = useAuth();
  const [subscriptionTiers, setSubscriptionTiers] = useState<SubscriptionTier[]>([]);

  const [title, setTitle] = useState("");
  const [contentType, setContentType] = useState<string>(CONTENT_TYPE_OPTIONS[0].value);
  const [releaseDate, setReleaseDate] = useState("");
  const [requiredTier, setRequiredTier] = useState<string>("1");

  const [genre, setGenre] = useState<string>(GENRE_OPTIONS[0].value);
  const [runtimeMinutes, setRuntimeMinutes] = useState("");
  const [originalLanguage, setOriginalLanguage] = useState<string>(LANGUAGE_OPTIONS[0].value);
  const [ageRating, setAgeRating] = useState<string>(AGE_RATING_OPTIONS[0].value);

  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isCheckingSession && (!sessionUser || (sessionUser.role !== "creator" && sessionUser.role !== "admin"))) {
      router.replace("/");
    }
  }, [isCheckingSession, sessionUser, router]);

  useEffect(() => {
    if (!sessionUser) return;

    let isMounted = true;

    getSubscriptionTiers()
      .then((tiers) => {
        if (isMounted) {
          setSubscriptionTiers(tiers);
        }
      })
      .catch((error) => {
        console.error("Failed to load subscription tiers:", error);
      });

    return () => {
      isMounted = false;
    };
  }, [sessionUser]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");

    // Validate required fields
    if (!title || !releaseDate || !runtimeMinutes) {
      setErrorMessage("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      const request: ContentRequest = {
        title,
        type: contentType,
        release_date: releaseDate,
        required_tier: Number(requiredTier),
        genre,
        runtime_minutes: Number(runtimeMinutes),
        original_language: originalLanguage,
        age_rating: ageRating,
      };

      await createContent(request);
      router.replace("/");
      router.refresh();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to create content");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isCheckingSession) {
    return (
      <AppShell align="start" className="py-8">
        <PageCard className="max-w-4xl">
          <p className="text-center text-muted">Checking permissions...</p>
        </PageCard>
      </AppShell>
    );
  }

  return (
    <AppShell align="start" className="py-8">
      <PageCard className="max-w-4xl">
        <div className="mb-8 space-y-2 text-center">
          <PageHeader
            eyebrow="DigitalContentStreamer"
            title="Upload content"
            description="Create a new content item for the platform. Fill in the details below."
            align="center"
          />
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <SectionCard className="space-y-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-foreground">Content details</h2>
              <Badge variant="accent">ContentItem</Badge>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <Input
                id="title"
                name="title"
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                label="Title"
                placeholder="e.g., The Amazing Adventure"
                required
              />

              <Input
                id="releaseDate"
                name="releaseDate"
                type="date"
                value={releaseDate}
                onChange={(event) => setReleaseDate(event.target.value)}
                label="Release date"
                required
              />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <Select
                id="contentType"
                name="contentType"
                value={contentType}
                onChange={(event) => setContentType(event.target.value)}
                label="Content type"
                options={CONTENT_TYPE_OPTIONS.map((option) => ({ value: option.value, label: option.label }))}
                required
              />

              <Select
                id="requiredTier"
                name="requiredTier"
                value={requiredTier}
                onChange={(event) => setRequiredTier(event.target.value)}
                label="Required subscription tier"
                options={subscriptionTiers.map((tier) => ({ value: tier.tier_id.toString(), label: tier.name }))}
                required
              />
            </div>
          </SectionCard>

          <SectionCard className="space-y-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-foreground">Content metadata</h2>
              <Badge variant="accent">ContentMetadata</Badge>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <Select
                id="genre"
                name="genre"
                value={genre}
                onChange={(event) => setGenre(event.target.value)}
                label="Genre"
                options={GENRE_OPTIONS.map((option) => ({ value: option.value, label: option.label }))}
                required
              />

              <Input
                id="runtimeMinutes"
                name="runtimeMinutes"
                type="number"
                min="0"
                value={runtimeMinutes}
                onChange={(event) => setRuntimeMinutes(event.target.value)}
                label="Runtime (minutes)"
                placeholder="120"
                required
              />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <Select
                id="originalLanguage"
                name="originalLanguage"
                value={originalLanguage}
                onChange={(event) => setOriginalLanguage(event.target.value)}
                label="Original language"
                options={LANGUAGE_OPTIONS.map((option) => ({ value: option.value, label: option.label }))}
                required
              />

              <Select
                id="ageRating"
                name="ageRating"
                value={ageRating}
                onChange={(event) => setAgeRating(event.target.value)}
                label="Age rating"
                options={AGE_RATING_OPTIONS.map((option) => ({ value: option.value, label: option.label }))}
                required
              />
            </div>
          </SectionCard>

          {errorMessage ? (
            <Badge variant="danger" className="w-full justify-start rounded-2xl px-4 py-3 text-sm">
              {errorMessage}
            </Badge>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button type="submit" disabled={isSubmitting} className="w-full rounded-2xl py-3 sm:flex-1">
              {isSubmitting ? "Uploading..." : "Upload content"}
            </Button>

            <Button type="button" variant="secondary" className="w-full rounded-2xl py-3 sm:flex-1" onClick={() => router.push("/")}>
              Cancel
            </Button>
          </div>
        </form>
      </PageCard>
    </AppShell>
  );
}
