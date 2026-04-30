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
  RadioCardGroup,
  SectionCard,
  Select,
  Textarea,
} from "../components/ui";
import { getCurrentSession, signup, type SessionUser, type SignupRequest } from "../../lib/auth";

const ROLE_OPTIONS = [
  {
    value: "viewer",
    label: "Viewer",
    description: "Watch content and choose a plan.",
  },
  {
    value: "creator",
    label: "Creator",
    description: "Publish content and build a profile.",
  },
  {
    value: "admin",
    label: "Admin",
    description: "Manage users and platform settings.",
  },
] as const;

const REGION_OPTIONS = [
  { value: "United States", label: "United States" },
  { value: "Canada", label: "Canada" },
  { value: "United Kingdom", label: "United Kingdom" },
  { value: "Germany", label: "Germany" },
  { value: "Japan", label: "Japan" },
  { value: "Australia", label: "Australia" },
] as const;

const REFERRAL_OPTIONS = [
  { value: "online search", label: "online search" },
  { value: "word of mouth", label: "word of mouth" },
  { value: "advertisement", label: "advertisement" },
  { value: "promotion", label: "promotion" },
  { value: "online platform", label: "online platform" },
  { value: "prefer not to say", label: "prefer not to say" },
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

const DEPARTMENT_OPTIONS = [
  { value: "IT", label: "IT" },
  { value: "marketing", label: "marketing" },
  { value: "management", label: "management" },
  { value: "development", label: "development" },
] as const;

const SUBSCRIPTION_TIER_OPTIONS = [
  { value: "1", label: "Basic - $9" },
  { value: "2", label: "Plus - $15" },
  { value: "3", label: "Premium - $22" },
] as const;

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [userRole, setUserRole] = useState<SignupRequest["user_role"]>("viewer");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [regionName, setRegionName] = useState<string>(REGION_OPTIONS[0].value);
  const [referralMethod, setReferralMethod] = useState<string>(REFERRAL_OPTIONS[0].value);
  const [viewerAge, setViewerAge] = useState("");
  const [preferredLanguage, setPreferredLanguage] = useState<string>(LANGUAGE_OPTIONS[0].value);
  const [subscriptionTierId, setSubscriptionTierId] = useState<string>(SUBSCRIPTION_TIER_OPTIONS[0].value);
  const [displayName, setDisplayName] = useState("");
  const [profileDescription, setProfileDescription] = useState("");
  const [department, setDepartment] = useState<string>(DEPARTMENT_OPTIONS[0].value);
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

    if (password !== passwordConfirmation) {
      setErrorMessage("Password confirmation does not match");
      return;
    }

    setIsSubmitting(true);

    try {
      await signup({
        email,
        phone_number: phoneNumber,
        user_role: userRole,
        first_name: firstName,
        last_name: lastName,
        password,
        password_confirmation: passwordConfirmation,
        region_name: regionName,
        referral_method: referralMethod,
        ...(userRole === "viewer"
          ? {
              age: Number(viewerAge),
              preferred_language: preferredLanguage,
              subscription_tier_id: Number(subscriptionTierId),
            }
          : {}),
        ...(userRole === "creator"
          ? {
              display_name: displayName,
              profile_description: profileDescription,
            }
          : {}),
        ...(userRole === "admin" ? { department } : {}),
      });
      router.replace("/");
      router.refresh();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to create account");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AppShell align="start" className="py-8">
      <PageCard className="max-w-4xl">
        <div className="mb-8 space-y-2 text-center">
          <PageHeader
            eyebrow="DigitalContentStreamer"
            title="Create account"
            description="Fill in the shared fields first, then complete the role-specific details shown below."
            align="center"
          />
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <SectionCard className="space-y-5">
            <div className="grid gap-5 md:grid-cols-2">
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                label="Email"
                placeholder="name@example.com"
                required
              />

              <Input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                autoComplete="tel"
                inputMode="numeric"
                pattern="[0-9]*"
                value={phoneNumber}
                onChange={(event) => setPhoneNumber(event.target.value)}
                label="Phone number"
                placeholder="555100101"
                required
              />
            </div>

            <div className="space-y-3">
              <p className="text-sm font-medium text-foreground">User role</p>
              <RadioCardGroup
                name="userRole"
                value={userRole}
                options={ROLE_OPTIONS.map((option) => ({
                  value: option.value,
                  label: option.label,
                  description: option.description,
                }))}
                onChange={(value) => setUserRole(value as SignupRequest["user_role"])}
              />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <Input
                id="firstName"
                name="firstName"
                type="text"
                autoComplete="given-name"
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                label="First name"
                placeholder="Adrian"
                required
              />

              <Input
                id="lastName"
                name="lastName"
                type="text"
                autoComplete="family-name"
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
                label="Last name"
                placeholder="Holt"
                required
              />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                label="Password"
                placeholder="Create a password"
                required
              />

              <Input
                id="passwordConfirmation"
                name="passwordConfirmation"
                type="password"
                autoComplete="new-password"
                value={passwordConfirmation}
                onChange={(event) => setPasswordConfirmation(event.target.value)}
                label="Confirm password"
                placeholder="Repeat the password"
                required
              />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <Select
                id="regionName"
                name="regionName"
                value={regionName}
                onChange={(event) => setRegionName(event.target.value)}
                label="Region"
                options={REGION_OPTIONS.map((option) => ({ value: option.value, label: option.label }))}
                required
              >
                <option value="" disabled>
                  Select a region
                </option>
              </Select>

              <Select
                id="referralMethod"
                name="referralMethod"
                value={referralMethod}
                onChange={(event) => setReferralMethod(event.target.value)}
                label="Referral method"
                options={REFERRAL_OPTIONS.map((option) => ({ value: option.value, label: option.label }))}
                required
              />
            </div>
          </SectionCard>

          {userRole === "viewer" ? (
            <SectionCard className="space-y-5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-foreground">Viewer details</h2>
                <Badge variant="accent">Creates Subscription + Invoice</Badge>
              </div>

              <div className="grid gap-5 md:grid-cols-3">
                <Input
                  id="viewerAge"
                  name="viewerAge"
                  type="number"
                  min="1"
                  max="120"
                  value={viewerAge}
                  onChange={(event) => setViewerAge(event.target.value)}
                  label="Age"
                  placeholder="24"
                  required={userRole === "viewer"}
                />

                <Select
                  id="preferredLanguage"
                  name="preferredLanguage"
                  value={preferredLanguage}
                  onChange={(event) => setPreferredLanguage(event.target.value)}
                  label="Preferred language"
                  options={LANGUAGE_OPTIONS.map((option) => ({ value: option.value, label: option.label }))}
                  required={userRole === "viewer"}
                />

                <Select
                  id="subscriptionTierId"
                  name="subscriptionTierId"
                  value={subscriptionTierId}
                  onChange={(event) => setSubscriptionTierId(event.target.value)}
                  label="Plan"
                  options={SUBSCRIPTION_TIER_OPTIONS.map((option) => ({ value: option.value, label: option.label }))}
                  required={userRole === "viewer"}
                />
              </div>

              <p className="text-sm leading-7 text-muted">
                A viewer signup creates the Viewer row, a current Subscription starting today, and the first Invoice for the current billing month.
              </p>
            </SectionCard>
          ) : null}

          {userRole === "creator" ? (
            <SectionCard className="space-y-5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-foreground">Creator details</h2>
                <Badge variant="accent">Creates Creator profile</Badge>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <Input
                  id="displayName"
                  name="displayName"
                  type="text"
                  value={displayName}
                  onChange={(event) => setDisplayName(event.target.value)}
                  label="Display name"
                  placeholder="MiraCreates"
                  required={userRole === "creator"}
                />

                <div className="rounded-2xl border border-white/10 bg-surface-strong/85 p-4 text-sm leading-7 text-muted">
                  Profile image filepath defaults to <span className="text-foreground">default/image/filepath.png</span>, and counts begin at zero.
                </div>
              </div>

              <Textarea
                id="profileDescription"
                name="profileDescription"
                value={profileDescription}
                onChange={(event) => setProfileDescription(event.target.value)}
                label="Profile description"
                placeholder="Tell viewers what you create."
                required={userRole === "creator"}
              />
            </SectionCard>
          ) : null}

          {userRole === "admin" ? (
            <SectionCard className="space-y-5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-foreground">Admin details</h2>
                <Badge variant="accent">Creates Admin row</Badge>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <Select
                  id="department"
                  name="department"
                  value={department}
                  onChange={(event) => setDepartment(event.target.value)}
                  label="Department"
                  options={DEPARTMENT_OPTIONS.map((option) => ({ value: option.value, label: option.label }))}
                  required={userRole === "admin"}
                />

                <div className="rounded-2xl border border-white/10 bg-surface-strong/85 p-4 text-sm leading-7 text-muted">
                  Hire date is set automatically to the current date.
                </div>
              </div>
            </SectionCard>
          ) : null}

          {errorMessage ? (
            <Badge variant="danger" className="w-full justify-start rounded-2xl px-4 py-3 text-sm">
              {errorMessage}
            </Badge>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button type="submit" disabled={isSubmitting} className="w-full rounded-2xl py-3 sm:flex-1">
              {isSubmitting ? "Creating account..." : "Create account"}
            </Button>

            <Button type="button" variant="secondary" className="w-full rounded-2xl py-3 sm:flex-1" onClick={() => router.push("/login")}>
              Back to login
            </Button>
          </div>
        </form>
      </PageCard>
    </AppShell>
  );
}
