interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = "" }: CardProps) {
  return (
    <div className={`rounded-[14px] bg-surface border border-border p-4 ${className}`}>
      {children}
    </div>
  );
}
