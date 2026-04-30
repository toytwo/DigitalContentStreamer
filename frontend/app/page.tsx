import { AppShell, PageCard, PageHeader } from "./components/ui";
import SessionActionButton from "./components/SessionActionButton";
import SessionLabel from "./components/SessionLabel";

export default function Home() {
  return (
    <AppShell>
      <PageCard>
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl space-y-6">
            <PageHeader
              eyebrow="DigitalContentStreamer"
              title="Watch your content anywhere, anytime."
              description="The component on the right shows your current session status. Try logging in!"
            />
          </div>

          <div className="flex flex-col items-start gap-3 md:pb-2">
            <SessionActionButton />
            <SessionLabel />
          </div>
        </div>
      </PageCard>
    </AppShell>
  );
}
