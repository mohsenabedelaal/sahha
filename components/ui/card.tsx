interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = "" }: CardProps) {
  return (
    <div className={`rounded-2xl bg-surface p-4 ${className}`}>
      {children}
    </div>
  );
}
