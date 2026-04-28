import Image from "next/image";

import SessionActionButton from "./components/SessionActionButton";
import SessionLabel from "./components/SessionLabel";

export default function Home() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#10213f_0%,#07111f_45%,#03050a_100%)] px-6 py-10 text-slate-100">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-6xl items-center justify-center">
        <section className="relative w-full overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 px-6 py-8 shadow-2xl shadow-black/40 backdrop-blur md:px-10 md:py-12">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(56,189,248,0.16),transparent_35%,rgba(15,23,42,0.35))]" />
          <div className="relative flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl space-y-6">
              <Image
                className="dark:invert"
                src="/next.svg"
                alt="Next.js logo"
                width={96}
                height={20}
                priority
              />
              <div className="space-y-4">
                <p className="text-sm uppercase tracking-[0.4em] text-sky-300/80">DigitalContentStreamer</p>
                <h1 className="max-w-xl text-4xl font-semibold tracking-tight text-white md:text-6xl">
                  Watch your content anywhere, anytime.
                </h1>
                <p className="max-w-2xl text-base leading-7 text-slate-300 md:text-lg">
                  The component on the right shows your current session status. Try logging in!
                </p>
              </div>
            </div>

            <div className="flex flex-col items-start gap-3 md:pb-2">
              <SessionActionButton />
              <SessionLabel />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
