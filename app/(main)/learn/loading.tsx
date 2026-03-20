export default function LearnLoading() {
  return (
    <div className="py-4 px-4 flex flex-col gap-3.5 animate-pulse">
      <div className="h-7 w-20 bg-surface-2 rounded" />
      <div className="h-32 bg-surface-2 rounded-[14px]" />
      <div className="h-3 w-28 bg-surface-2 rounded" />
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-28 bg-surface-2 rounded-[14px]" />
      ))}
    </div>
  );
}
