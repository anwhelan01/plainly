import type { ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Desk" },
  { to: "/stylebook", label: "Stylebook" },
  { to: "/skill", label: "Skill" },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-dvh">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-[var(--radius-sm)] focus:bg-ink focus:px-3 focus:py-2 focus:text-paper-raised"
      >
        Skip to desk
      </a>
      <header className="border-b border-rule">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-5 sm:flex-row sm:items-end sm:justify-between sm:px-6">
          <div>
            <Link to="/" className="group inline-block">
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-mark">
                Copy desk
              </p>
              <h1 className="font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
                Plainly
              </h1>
            </Link>
            <p className="mt-1 max-w-md text-sm text-muted">
              Strip the Claude-lish. Lint, rewrite, export the skill.
            </p>
          </div>
          <nav
            aria-label="Primary"
            className="flex gap-1 rounded-[var(--radius-md)] bg-ink/5 p-1"
          >
            {NAV.map((item) => {
              const active =
                item.to === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "inline-flex h-10 min-w-20 items-center justify-center rounded-[var(--radius-sm)] px-4 text-sm font-medium transition-colors duration-150",
                    active
                      ? "bg-paper-raised text-ink shadow-[var(--shadow-border)]"
                      : "text-muted hover:text-ink",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
      <main id="main" className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        {children}
      </main>
      <footer className="border-t border-rule">
        <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-6 text-xs text-faint sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>
            Inspired by Nate B. Jones. Style rules adapted from the Google
            developer documentation style guide (CC BY 4.0). Independent — not
            endorsed by Google.
          </p>
          <p className="font-mono tracking-wide">PLAINLY / COPY DESK</p>
        </div>
      </footer>
    </div>
  );
}
