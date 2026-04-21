export default function Loading() {
  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="h-32 w-full animate-pulse rounded-[2rem] bg-slate-200" />

      <div className="grid gap-4 md:grid-cols-3">
        <div className="h-32 animate-pulse rounded-[2rem] bg-slate-200" />
        <div className="h-32 animate-pulse rounded-[2rem] bg-slate-200" />
        <div className="h-32 animate-pulse rounded-[2rem] bg-slate-200" />
      </div>

      <div className="space-y-3">
        <div className="h-20 animate-pulse rounded-[2rem] bg-slate-200" />
        <div className="h-20 animate-pulse rounded-[2rem] bg-slate-200" />
        <div className="h-20 animate-pulse rounded-[2rem] bg-slate-200" />
      </div>
    </div>
  )
}