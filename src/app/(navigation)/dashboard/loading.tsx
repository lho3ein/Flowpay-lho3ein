import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-6" aria-busy="true">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-52" />
          <Skeleton className="h-4 w-40" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-8 w-28" />
          <Skeleton className="h-8 w-32" />
        </div>
      </div>

      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/60 via-primary/40 to-primary/20 p-6 sm:p-8">
        <div className="pointer-events-none absolute -left-16 -top-20 size-64 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-24 right-1/4 size-72 rounded-full bg-white/10 blur-3xl" />
        <div className="relative space-y-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-40 bg-white/20" />
            <Skeleton className="h-6 w-24 bg-white/20" />
          </div>
          <Skeleton className="h-12 w-56 bg-white/20" />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-28" />
          <Skeleton className="h-4 w-20" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl bg-card p-5 ring-1 ring-foreground/10">
              <div className="flex items-center justify-between">
                <Skeleton className="size-10 rounded-xl" />
                <Skeleton className="h-5 w-10" />
              </div>
              <div className="mt-5 space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-7 w-28" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-20" />
        </div>
        <div className="rounded-2xl bg-card ring-1 ring-foreground/10">
          <div className="space-y-3 p-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="size-10 rounded-xl" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
                <div className="space-y-2 text-end">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="ms-auto h-3 w-16" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}