export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-mint">صحة</h1>
        <p className="mt-1 text-sm text-muted">Sahha — Your nutrition companion</p>
      </div>
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
