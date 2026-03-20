export default function LogLoading() {
  return (
    <div className="py-4 px-4 flex flex-col gap-3.5 animate-pulse">
      <div className="h-7 w-32 bg-surface-2 rounded" />
      <div className="h-12 bg-surface-2 rounded-xl" />
      <div className="grid grid-cols-2 gap-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 bg-surface-2 rounded-[14px]" />
        ))}
      </div>
      <div className="h-3 w-24 bg-surface-2 rounded mt-2" />
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-[54px] bg-surface-2 rounded-[10px]" />
      ))}
    </div>
  );
}
