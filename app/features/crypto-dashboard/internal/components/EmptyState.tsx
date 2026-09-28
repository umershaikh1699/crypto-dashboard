import type { ReactElement } from "react";

export function EmptyState(): ReactElement {
  return (
    <section className="empty-state" aria-live="polite">
      <h2>No currencies found</h2>
      <p>Try a different name or symbol.</p>
    </section>
  );
}
