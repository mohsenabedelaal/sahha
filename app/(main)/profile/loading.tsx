export default function ProfileLoading() {
  return (
    <div className="flex flex-col gap-3.5 py-4 px-4 animate-pulse">
      <div className="flex items-center gap-3.5 mb-2">
        <div className="w-16 h-16 rounded-full bg-surface-2" />
        <div>
          <div className="h-5 w-32 bg-surface-2 rounded mb-2" />
          <div className="h-3 w-24 bg-surface-2 rounded" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-[7px]">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-surface-2 rounded-[10px]" />
        ))}
      </div>
      <div className="h-14 bg-surface-2 rounded-[14px]" />
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="h-11 bg-surface-2 rounded-[10px]" />
      ))}
    </div>
  );
}
