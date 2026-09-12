import { TriangleAlert } from "lucide-react";

export function AppErrorComponent() {
  return (
    <main className="flex min-h-[50vh] flex-col items-center justify-center gap-3 px-6 text-center">
      <span className="text-mark" aria-hidden="true">
        <TriangleAlert className="size-8" strokeWidth={1.75} />
      </span>
      <h1 className="font-display text-2xl text-ink">Something went wrong</h1>
      <p className="max-w-md text-sm break-words text-muted">
        An unexpected error occurred. Reload the page to try again.
      </p>
    </main>
  );
}
