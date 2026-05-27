export default function BookmarksLoading() {
  return (
    <div className="flex-1 max-w-3xl mx-auto w-full space-y-6 p-4 md:p-8">
      <div className="space-y-2">
        <div className="skeleton h-7 w-32 rounded" />
        <div className="skeleton h-4 w-56 rounded" />
      </div>
      <div className="skeleton h-9 w-64 rounded" />
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-start gap-3 p-3 bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg">
            <div className="skeleton w-16 h-12 rounded flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="skeleton h-4 w-3/4 rounded" />
              <div className="skeleton h-3 w-1/3 rounded" />
            </div>
            <div className="skeleton h-7 w-16 rounded shrink-0" />
          </div>
        ))}
      </div>
    </div>
  )
}
