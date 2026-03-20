export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-2.5 py-4 animate-pulse">
      <div className="px-4 pb-2">
        <div className="h-3 w-24 bg-surface-2 rounded mb-2" />
        <div className="h-7 w-40 bg-surface-2 rounded" />
      </div>
      <div className="px-4"><div className="h-14 bg-surface-2 rounded-[14px]" /></div>
      <div className="px-4"><div className="h-[220px] bg-surface-2 rounded-[14px]" /></div>
      <div className="px-4"><div className="h-14 bg-surface-2 rounded-[14px]" /></div>
      <div className="px-4"><div className="h-12 bg-surface-2 rounded-[14px]" /></div>
      <div className="px-4 flex flex-col gap-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-[64px] bg-surface-2 rounded-[14px]" />
        ))}
      </div>
    </div>
  );
}
