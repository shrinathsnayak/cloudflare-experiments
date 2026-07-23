export function SidebarStatusBadge({ status }: { status: string }) {
  const label = status === "new" ? "New" : status;

  return (
    <span
      data-status={status}
      className="ms-auto shrink-0 rounded-md bg-[color-mix(in_oklab,var(--color-brand)_16%,transparent)] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.04em] text-(--color-brand)"
    >
      {label}
    </span>
  );
}
