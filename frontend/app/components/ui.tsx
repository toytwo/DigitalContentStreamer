import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
} from "react";

type ClassNameValue = string | undefined;

function joinClasses(...classes: ClassNameValue[]): string {
  return classes.filter(Boolean).join(" ");
}

type AppShellProps = {
  children: ReactNode;
  align?: "center" | "start";
  className?: string;
  contentClassName?: string;
};

export function AppShell({
  children,
  align = "center",
  className,
  contentClassName,
}: AppShellProps) {
  const contentClass =
    align === "center"
      ? "mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-6xl items-center justify-center"
      : "mx-auto w-full max-w-6xl";

  return (
    <main
      className={joinClasses(
        "min-h-screen bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.16)_0%,rgba(11,18,32,0.94)_42%,rgba(5,9,19,1)_100%)] px-4 py-10 text-foreground",
        className,
      )}
    >
      <div className={joinClasses(contentClass, contentClassName)}>{children}</div>
    </main>
  );
}

type PageCardProps = {
  children: ReactNode;
  className?: string;
};

export function PageCard({ children, className }: PageCardProps) {
  return (
    <section
      className={joinClasses(
        "relative w-full overflow-hidden rounded-[2rem] border border-white/10 bg-surface/90 px-6 py-8 shadow-2xl shadow-black/40 backdrop-blur md:px-10 md:py-12",
        className,
      )}
    >
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(56,189,248,0.16),transparent_35%,rgba(15,23,42,0.35))]" />
      <div className="relative">{children}</div>
    </section>
  );
}

export const PageShell = AppShell;
export const GlassCard = PageCard;

type SectionCardProps = {
  children: ReactNode;
  className?: string;
};

export function SectionCard({ children, className }: SectionCardProps) {
  return (
    <section
      className={joinClasses(
        "rounded-3xl border border-white/10 bg-surface/75 p-4 text-sm text-muted shadow-lg shadow-black/20 backdrop-blur",
        className,
      )}
    >
      {children}
    </section>
  );
}

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
};

export function PageHeader({
  eyebrow,
  title,
  description,
  align = "left",
  className,
}: PageHeaderProps) {
  return (
    <div className={joinClasses(align === "center" ? "text-center" : "text-left", className)}>
      {eyebrow ? (
        <p className="text-sm uppercase tracking-[0.4em] text-accent/80">{eyebrow}</p>
      ) : null}
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground md:text-5xl">
        {title}
      </h1>
      {description ? (
        <p className="mt-4 max-w-2xl text-sm leading-7 text-muted md:text-base">
          {description}
        </p>
      ) : null}
    </div>
  );
}

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

const buttonStyles: Record<ButtonVariant, string> = {
  primary: "border-accent/50 bg-accent text-background shadow-lg shadow-accent/20 hover:bg-accent/90",
  secondary:
    "border-white/10 bg-surface-strong text-foreground shadow-lg shadow-black/20 hover:border-white/20 hover:bg-surface-strong/90",
  danger: "border-danger/50 bg-danger/15 text-danger hover:bg-danger/25",
  ghost: "border-transparent bg-transparent text-foreground hover:bg-white/5",
};

export function Button({ variant = "primary", className, type = "button", ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={joinClasses(
        "inline-flex items-center justify-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60",
        buttonStyles[variant],
        className,
      )}
      {...props}
    />
  );
}

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
  wrapperClassName?: string;
};

export function Input({
  label,
  hint,
  wrapperClassName,
  className,
  id,
  ...props
}: InputProps) {
  const inputId = id ?? props.name;

  return (
    <div className={joinClasses("space-y-2", wrapperClassName)}>
      {label ? (
        <label className="block text-sm font-medium text-foreground" htmlFor={inputId}>
          {label}
        </label>
      ) : null}
      <input
        id={inputId}
        className={joinClasses(
          "w-full rounded-2xl border border-white/10 bg-surface-strong/85 px-4 py-3 text-foreground outline-none transition placeholder:text-muted focus:border-accent focus:ring-2 focus:ring-accent/25",
          className,
        )}
        {...props}
      />
      {hint ? <p className="text-xs text-muted">{hint}</p> : null}
    </div>
  );
}

type BadgeVariant = "default" | "accent" | "success" | "danger" | "muted";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
  dot?: boolean;
};

const badgeStyles: Record<BadgeVariant, string> = {
  default: "border-white/10 bg-white/5 text-foreground",
  accent: "border-accent/40 bg-accent/15 text-accent",
  success: "border-success/40 bg-success/15 text-success",
  danger: "border-danger/40 bg-danger/15 text-danger",
  muted: "border-white/10 bg-surface-strong/80 text-muted",
};

const badgeDotStyles: Record<BadgeVariant, string> = {
  default: "bg-foreground",
  accent: "bg-accent",
  success: "bg-success",
  danger: "bg-danger",
  muted: "bg-muted",
};

export function Badge({ variant = "default", dot = false, className, children, ...props }: BadgeProps) {
  return (
    <span
      className={joinClasses(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-medium",
        badgeStyles[variant],
        className,
      )}
      {...props}
    >
      {dot ? <span className={joinClasses("inline-flex h-2.5 w-2.5 rounded-full", badgeDotStyles[variant])} /> : null}
      {children}
    </span>
  );
}

type GalleryTone = "default" | "accent" | "success" | "danger" | "muted";

type GalleryCardProps = {
  title: string;
  subtitle?: string;
  tone?: GalleryTone;
  className?: string;
};

const galleryCardStyles: Record<GalleryTone, string> = {
  default: "border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(11,18,32,0.96))]",
  accent: "border-accent/30 bg-[linear-gradient(180deg,rgba(56,189,248,0.14),rgba(11,18,32,0.96))]",
  success: "border-success/30 bg-[linear-gradient(180deg,rgba(74,222,128,0.14),rgba(11,18,32,0.96))]",
  danger: "border-danger/30 bg-[linear-gradient(180deg,rgba(248,113,113,0.14),rgba(11,18,32,0.96))]",
  muted: "border-white/10 bg-[linear-gradient(180deg,rgba(148,163,184,0.10),rgba(11,18,32,0.96))]",
};

export function GalleryCard({ title, subtitle, tone = "default", className }: GalleryCardProps) {
  return (
    <article
      className={joinClasses(
        "group relative overflow-hidden rounded-2xl border p-4 shadow-lg shadow-black/20 transition hover:-translate-y-0.5 hover:shadow-black/30",
        galleryCardStyles[tone],
        className,
      )}
    >
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.05),transparent_35%,rgba(255,255,255,0.02))] opacity-0 transition group-hover:opacity-100" />
      <div className="relative flex min-h-28 flex-col justify-between gap-4">
        <Badge variant={tone === "default" ? "muted" : tone} dot className="w-fit">
          User
        </Badge>
        <div>
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          {subtitle ? <p className="mt-1 text-sm leading-6 text-muted">{subtitle}</p> : null}
        </div>
      </div>
    </article>
  );
}