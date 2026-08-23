export function Loading({ label = "Cargando…" }: { label?: string }) {
  return (
    <div className="flex items-center justify-center py-16 text-sm text-muted">
      <span className="mr-2 inline-block h-2 w-2 animate-pulse rounded-full bg-primary" />
      {label}
    </div>
  );
}
