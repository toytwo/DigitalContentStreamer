"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { AppShell, GalleryCard, PageCard, PageHeader, SectionCard } from "../../../components/ui";

export default function Page(){
    // Here is how you get the path variables
    const params = useParams();
    const step = Array.isArray(params.starting_step)
        ? params.starting_step[0]
        : params.starting_step;
    // use a usestate when you want a change to be reflected in the page. React forces a refresh.
    const [allUsers, setAllUsers] = useState<string[] | null>(null);
    const tones = ["accent", "success", "muted", "danger", "default"] as const;
    // Runs on mount because nothing in []
    useEffect(() => {
        fetch(
            // Note: this is different than what is defined in test_routes because of the prefix in main
            `http://localhost:8000/test/test_get_all_users`,
            {
                credentials: "include",
            }
        )
            .then((response) => (response.ok ? response.json() : null))
            .then((data) => {
                if (data?.success) {
                    setAllUsers(data.users);
                } else {
                    console.log(data?.error ?? "Network Error");
                }
            });
    }, [])

    // You can return alternate html depending on state.
    if (!allUsers) {
        return(
            <AppShell align="start" className="py-8">
                <PageCard>
                    <PageHeader
                        eyebrow="Testing route"
                        title={`Page ${step} From URL params`}
                        description="Loading users from the backend."
                    />
                    <SectionCard className="mt-6">Loading...</SectionCard>
                </PageCard>
            </AppShell>
        );
    }

    return (
        <AppShell align="start" className="py-8">
            <PageCard>
                <div className="flex flex-col gap-6">
                    <PageHeader
                        eyebrow="Testing route"
                        title={`Page ${step} From URL params`}
                        description="This page shows the database-backed user list returned by the test endpoint."
                    />

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {allUsers.map((user, index) => (
                            <GalleryCard
                                key={user}
                                title={user}
                                tone={tones[index % tones.length]}
                            />
                        ))}
                    </div>
                </div>
            </PageCard>
        </AppShell>
    );
}