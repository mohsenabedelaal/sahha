import { Card } from "@/components/ui/card";

export default function LogPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Food Log</h1>
      <Card className="flex flex-col items-center py-12">
        <p className="text-muted text-lg">Coming soon</p>
        <p className="text-sm text-muted mt-2">Meal logging will be available in the next update</p>
      </Card>
    </div>
  );
}
