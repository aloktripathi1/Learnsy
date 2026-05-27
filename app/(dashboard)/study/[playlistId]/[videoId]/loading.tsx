export default function StudyLoading() {
  return (
    <div className="flex-1 flex flex-col lg:flex-row h-[calc(100vh-56px)] overflow-hidden">
      <div className="flex-1 flex flex-col">
        <div className="skeleton aspect-video w-full bg-[#0a0a0a]" />
        <div className="p-4 lg:p-6 space-y-4 max-w-3xl">
          <div className="skeleton h-6 w-3/4 rounded" />
          <div className="skeleton h-4 w-1/3 rounded" />
          <div className="flex gap-2">
            <div className="skeleton h-8 w-28 rounded" />
            <div className="skeleton h-8 w-28 rounded" />
          </div>
          <div className="skeleton h-1 w-full rounded" />
        </div>
      </div>
      <div className="hidden lg:block w-72 border-l border-[#1a1a1a] bg-[#0a0a0a] p-3 space-y-2">
        <div className="skeleton h-5 w-20 rounded mb-3" />
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex gap-2 p-2">
            <div className="skeleton w-[60px] h-[45px] rounded flex-shrink-0" />
            <div className="flex-1 space-y-1">
              <div className="skeleton h-3 w-full rounded" />
              <div className="skeleton h-3 w-2/3 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
