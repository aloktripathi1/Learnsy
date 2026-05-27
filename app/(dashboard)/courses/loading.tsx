export default function CoursesLoading() {
  return (
    <div className="flex-1 max-w-6xl mx-auto w-full space-y-6 p-4 md:p-8">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="skeleton h-7 w-32 rounded" />
          <div className="skeleton h-4 w-48 rounded" />
        </div>
        <div className="skeleton h-9 w-24 rounded" />
      </div>
      <div className="skeleton h-9 w-64 rounded" />
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl overflow-hidden">
            <div className="skeleton aspect-video w-full" />
            <div className="p-4 space-y-3">
              <div className="skeleton h-4 w-3/4 rounded" />
              <div className="skeleton h-3 w-1/2 rounded" />
              <div className="skeleton h-1 w-full rounded" />
              <div className="skeleton h-8 w-full rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
