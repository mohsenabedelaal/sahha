export default function PlanLoading() {
  return (
    <div className="py-4 px-4 flex flex-col gap-3.5 animate-pulse">
      <div className="h-7 w-32 bg-surface-2 rounded" />
      <div className="h-3 w-56 bg-surface-2 rounded" />
      <div className="flex gap-[5px]">
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <div key={i} className="h-8 w-12 bg-surface-2 rounded-[9px]" />
        ))}
      </div>
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-[70px] bg-surface-2 rounded-[10px]" />
      ))}
      <div className="h-[80px] bg-surface-2 rounded-[10px]" />
    </div>
  );
}
