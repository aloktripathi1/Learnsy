export default function NotesLoading() {
  return (
    <div className="flex-1 max-w-3xl mx-auto w-full space-y-6 p-4 md:p-8">
      <div className="space-y-2">
        <div className="skeleton h-7 w-24 rounded" />
        <div className="skeleton h-4 w-56 rounded" />
      </div>
      <div className="skeleton h-9 w-64 rounded" />
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-4 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 space-y-1.5">
                <div className="skeleton h-4 w-2/3 rounded" />
                <div className="skeleton h-3 w-1/3 rounded" />
              </div>
              <div className="flex gap-1">
                <div className="skeleton h-7 w-7 rounded" />
                <div className="skeleton h-7 w-7 rounded" />
              </div>
            </div>
            <div className="skeleton h-16 w-full rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}
