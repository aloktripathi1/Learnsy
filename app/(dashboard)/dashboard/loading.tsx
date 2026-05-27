export default function DashboardLoading() {
  return (
    <div className="flex-1 max-w-5xl mx-auto w-full space-y-6 p-4 md:p-8">
      {/* Welcome */}
      <div className="space-y-2">
        <div className="skeleton h-8 w-48 rounded" />
        <div className="skeleton h-4 w-64 rounded" />
      </div>
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-4 space-y-2">
            <div className="skeleton h-3 w-16 rounded" />
            <div className="skeleton h-7 w-12 rounded" />
            <div className="skeleton h-3 w-20 rounded" />
          </div>
        ))}
      </div>
      {/* Calendar */}
      <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-6">
        <div className="skeleton h-4 w-36 rounded mb-4" />
        <div className="skeleton h-24 w-full rounded" />
      </div>
    </div>
  )
}
